# 10. How to Handle Partial Failures

In a distributed system like Walrus, partial failures are common. The SDK is designed to handle these gracefully, but understanding how to manage them is important for building robust applications.

## Understanding Partial Failures

Partial failures occur when:
- Some storage nodes fail while others succeed
- Network issues affect only some connections
- Timeouts occur for some operations but not others
- Quorum requirements are not met

## Node Failure Handling

The SDK handles node failures during uploads:

```ts
async writeEncodedBlobToNodes({
  blobId,
  metadata,
  sliversByNode,
  signal,
  ...options
}: WriteEncodedBlobToNodesOptions) {
  const systemState = await this.systemState();
  const committee = await this.#getActiveCommittee();

  const controller = new AbortController();
  let failures = 0;

  const confirmations = await Promise.all(
    sliversByNode.map((slivers, nodeIndex) => {
      return this.writeEncodedBlobToNode({
        blobId,
        nodeIndex,
        metadata,
        slivers,
        signal: signal ? AbortSignal.any([controller.signal, signal]) : controller.signal,
        ...options,
      }).catch(() => {
        // Track how many shards failed for this node.
        failures += committee.nodes[nodeIndex].shardIndices.length;

        if (isAboveValidity(failures, systemState.committee.n_shards)) {
          // Abort everything once the validity threshold is exceeded.
          const error = new NotEnoughBlobConfirmationsError(
            `Too many failures while writing blob ${blobId} to nodes`,
          );
          controller.abort(error);
          throw error;
        }

        return null; // Tolerate the failure and keep going.
      });
    }),
  );

  return confirmations;
}
```

*Source: `ts-sdks/packages/walrus/src/client.ts#L1778-L1816`*

Key points:
- Uploads happen in parallel to all nodes
- Some node failures are tolerated (up to validity threshold)
- If too many nodes fail, the upload fails
- Remaining operations are aborted when threshold is exceeded

## Quorum Requirements

The system requires a quorum of nodes to confirm storage:

- **Validity Threshold**: Maximum number of shards that can fail
- **Quorum**: Minimum number of confirmations needed
- **Erasure Coding**: Allows reconstruction even with some failures

### Checking Quorum Status

```typescript
async function uploadWithQuorumCheck(blob: Uint8Array) {
  try {
    const { blobId, blobObject } = await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });

    return { blobId, blobObject };
  } catch (error) {
    if (error instanceof NotEnoughBlobConfirmationsError) {
      // This means too many nodes failed to acknowledge the upload.
      console.error('Not enough nodes confirmed storage');
      // Insert retry/backoff logic here, or bubble the error up.
    }
    throw error;
  }
}
```

## Download Failures

During downloads, the SDK handles partial failures:

```ts
async getSlivers({ blobId, signal }: GetSliversOptions) {
  const committee = await this.#getReadCommittee({ blobId, signal });
  const { metadata } = await this.getBlobMetadata({ blobId, signal });
  const numShards = committee.nodes.reduce(
    (sum, node) => sum + node.shardIndices.length,
    0,
  );

  const sliverPairIndices = Array.from({ length: numShards }, (_, i) => i);
  const minSymbols = Math.ceil(numShards / 2) + 1;

  const chunkedSliverPairIndices = chunkArray(sliverPairIndices, committee.nodes.length);

  const slivers: GetSliverResponse[] = [];
  const failedNodes = new Set<string>();
  let totalErrorCount = 0;
  let numNotFoundWeight = 0;
  let numBlockedWeight = 0;

  const controller = new AbortController();

  return new Promise<GetSliverResponse[]>((resolve, reject) => {
    chunkedSliverPairIndices[0].forEach(async (_, colIndex) => {
      for (let rowIndex = 0; rowIndex < chunkedSliverPairIndices.length; rowIndex += 1) {
        const sliverPairIndex = chunkedSliverPairIndices[rowIndex][colIndex];
        if (sliverPairIndex === undefined) {
          continue;
        }

        const node = committee.nodes[rowIndex];
        const url = node.networkUrl;

        if (failedNodes.has(url)) {
          continue; // Skip nodes we already marked as down.
        }

        try {
          const sliver = await this.#storageNodeClient.getSliver({
            blobId,
            sliverPairIndex,
            nodeUrl: url,
            signal: signal ? AbortSignal.any([controller.signal, signal]) : controller.signal,
          });

          slivers.push(sliver);

          if (slivers.length >= minSymbols) {
            // Stop once we have enough symbols to reconstruct the blob.
            controller.abort();
            resolve(slivers);
            return;
          }
        } catch (error) {
          if (error instanceof NotFoundError) {
            numNotFoundWeight += 1;
          } else if (error instanceof LegallyUnavailableError) {
            numBlockedWeight += 1;
          } else if (error instanceof UserAbortError) {
            reject(error);
            return;
          }

          if (isQuorum(numBlockedWeight + numNotFoundWeight, numShards)) {
            // Either too many NotFound or too many blocked responses.
            const abortError =
              numNotFoundWeight > numBlockedWeight
                ? new BlobNotCertifiedError(`The specified blob ${blobId} is not certified.`)
                : new BlobBlockedError(`The specified blob ${blobId} is blocked.`);

            controller.abort(abortError);
            reject(abortError);
            return;
          }

          failedNodes.add(url);
          totalErrorCount += 1;

          const remainingTasks = sliverPairIndices.length - (slivers.length + totalErrorCount);
          const tooManyFailures = slivers.length + remainingTasks < minSymbols;

          if (tooManyFailures) {
            const abortError = new NotEnoughSliversReceivedError(
              `Unable to retrieve enough slivers to decode blob ${blobId}.`,
            );
            controller.abort(abortError);
            reject(abortError);
          }
        }
      }
    });
  });
}
```

*Source: `ts-sdks/packages/walrus/src/client.ts#getSlivers`*

The SDK:
- Tries multiple nodes in parallel
- Stops when enough slivers are collected
- Tolerates some node failures
- Fails if not enough slivers can be retrieved

## Recovery Strategies

### Retry on Partial Failure

```typescript
async function uploadWithRecovery(blob: Uint8Array, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const { blobId, blobObject } = await client.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
      
      return { blobId, blobObject };
    } catch (error) {
      attempt++;
      
      if (error instanceof NotEnoughBlobConfirmationsError) {
        if (attempt >= maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts`);
        }
        
        // Wait before retry (nodes might recover)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      
      // Don't retry non-recoverable errors
      throw error;
    }
  }
}
```

### Fallback Strategies

```typescript
async function uploadWithFallback(blob: Uint8Array) {
  try {
    // Try direct upload first
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    if (error instanceof NotEnoughBlobConfirmationsError) {
      // Fallback to relay if direct upload fails
      const relayClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
        network: 'testnet',
      }).$extend(
        walrus({
          uploadRelay: {
            host: 'https://upload-relay.testnet.walrus.space',
            sendTip: { max: 1_000 },
          },
        }),
      );
      
      return await relayClient.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
    }
    
    throw error;
  }
}
```

## Error Classification

Classify errors to determine recovery strategy:

```typescript
function classifyError(error: Error): 'retryable' | 'permanent' | 'unknown' {
  if (error instanceof NotEnoughBlobConfirmationsError) {
    return 'retryable'; // Nodes might recover
  }
  
  if (error instanceof NotEnoughSliversReceivedError) {
    return 'retryable'; // Network might improve
  }
  
  if (error instanceof InconsistentBlobError) {
    return 'permanent'; // Data is corrupted
  }
  
  if (error instanceof BlobBlockedError) {
    return 'permanent'; // Blob is blocked
  }
  
  return 'unknown';
}

async function uploadWithClassification(blob: Uint8Array) {
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    const classification = classifyError(error as Error);
    
    if (classification === 'retryable') {
      // Retry with backoff
      return retry(
        () => client.walrus.writeBlob({
          blob,
          deletable: true,
          epochs: 3,
          signer: keypair,
        }),
        { count: 3, delay: 1000 }
      );
    }
    
    // Don't retry permanent errors
    throw error;
  }
}
```

## Monitoring Partial Failures

Track partial failures for observability:

```typescript
class UploadMonitor {
  private failures: Map<string, number> = new Map();
  
  recordFailure(blobId: string, error: Error) {
    const count = this.failures.get(blobId) || 0;
    this.failures.set(blobId, count + 1);
    
    // Log for monitoring
    console.error(`Upload failure for ${blobId}:`, error);
    
    // Send to monitoring service
    this.sendToMonitoring({
      blobId,
      error: error.message,
      attempt: count + 1,
    });
  }
  
  private sendToMonitoring(data: any) {
    // Send to your monitoring service
  }
}

const monitor = new UploadMonitor();

async function uploadWithMonitoring(blob: Uint8Array) {
  const blobId = 'pending';
  
  try {
    const result = await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
    
    return result;
  } catch (error) {
    monitor.recordFailure(blobId, error as Error);
    throw error;
  }
}
```

## Best Practices

1. **Handle Partial Failures**: Expect and handle partial failures
2. **Implement Retries**: Retry on retryable errors
3. **Classify Errors**: Distinguish retryable from permanent errors
4. **Monitor Failures**: Track failure patterns
5. **Use Fallbacks**: Have fallback strategies (e.g., relay)
6. **Set Timeouts**: Prevent operations from hanging indefinitely

## Key Takeaways

- The SDK tolerates some node failures through erasure coding
- Quorum requirements ensure data availability
- Partial failures are handled automatically during uploads and downloads
- Implement retry logic for recoverable failures
- Classify errors to determine appropriate recovery strategies
- Monitor failures to identify patterns and issues

## Next Lecture

Continue with [How to Surface Meaningful Errors](./11-error-handling.md) to learn how to classify,
log, and expose the errors that surface when partial failures escalate beyond automatic recovery.

