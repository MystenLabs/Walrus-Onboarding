# Aggregator Delays

Aggregators coordinate **reading** blobs from Walrus by fetching slivers from storage nodes and reconstructing the original data. Delays can occur due to network conditions or storage node responsiveness.

## Sources of Read Delay

1.  **Committee Lookup**: The aggregator queries the Sui system object to determine which storage nodes hold which shards.
2.  **Sliver & Metadata Gathering**: The aggregator fetches blob metadata and slivers from multiple storage nodes. Slow or unresponsive nodes can drag down the total read time.
3.  **Reconstruction**: After gathering enough slivers (2f+1), the data is decoded and verified against the blob ID.

## Handling Delays in the SDK

### Timeouts

The SDKs have default timeouts that you may need to adjust for large files or slow network conditions.

**TypeScript SDK:**
```typescript
import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const client = new WalrusClient({
    network: 'testnet',
    suiClient: new SuiClient({ url: getFullnodeUrl('testnet') }),
    storageNodeClientOptions: {
        timeout: 120_000,  // 2 minutes for large files
    },
});
```

**Rust SDK:**

> **Note**: A Rust SDK exists in the Walrus codebase (`crates/walrus-sdk`) but is not yet published to crates.io or documented for external use. For Rust applications, you can use the [Walrus CLI](https://github.com/MystenLabs/walrus/tree/main/docs/content/book/usage/client-cli.md) or interact with the [HTTP API](https://github.com/MystenLabs/walrus/tree/main/docs/content/book/usage/web-api.md) directly.

### Asynchronous Design

Since aggregator operations involve network IO:

*   **Don't Block UI**: Always perform read operations off the main thread.
*   **Progress Indicators**: For long operations, use the step-based flow methods (e.g., `writeFilesFlow`) to show which stage is active. Fine-grained progress tracking is not built into the SDK.

**Example: Showing Upload Stages with `writeFilesFlow`**

```typescript
import { WalrusFile } from '@mysten/walrus';

const flow = client.writeFilesFlow({
    files: [WalrusFile.from({ contents: fileData, identifier: 'my-file.txt' })],
});

// Stage 1: Encoding
setStatus('Encoding file...');
await flow.encode();

// Stage 2: Register on Sui
setStatus('Registering on Sui...');
const registerTx = flow.register({ epochs: 3, owner: address, deletable: true });
const { digest } = await signAndExecuteTransaction({ transaction: registerTx });

// Stage 3: Upload to storage nodes
setStatus('Uploading to storage nodes...');
await flow.upload({ digest });

// Stage 4: Certify
setStatus('Certifying blob...');
const certifyTx = flow.certify();
await signAndExecuteTransaction({ transaction: certifyTx });

// Complete
setStatus('Upload complete!');
const files = await flow.listFiles();
```

> **Note**: This shows stage-level progress (which step is running), not fine-grained progress (e.g., "47% uploaded").

### "Blob Not Found" vs. "Not Yet Ready"

Sometimes a newly uploaded blob might not be immediately visible to all nodes due to propagation latency (though Walrus is designed to be strongly consistent for certified blobs).

If `getVerifiedBlobStatus` returns failures immediately after upload:
1.  Check if the Sui transaction succeeded.
2.  Wait a brief period (backoff) and retry.

## Optimizing Read Performance

If delays are frequent:
*   **Cache**: Cache frequently accessed blobs closer to the client (CDN or local cache).
*   **Parallel Requests**: The SDK does this internally, but ensure your network environment allows enough concurrent connections.

## Key Takeaways

- **Configure timeouts for your use case**: Default timeouts may be too short for large files; adjust `storageNodeClientOptions.timeout`.
- **Delays have multiple sources**: Metadata lookup, slow storage nodes, and data reconstruction all contribute to read latency.
- **Never block the UI**: Perform all Walrus operations asynchronously and show progress indicators for long operations.
- **"Not found" may mean "not yet ready"**: After upload, wait briefly and retry before concluding a blob doesn't exist.
- **Cache frequently accessed data**: Use CDN or local caching to reduce repeated fetches and improve user experience.
