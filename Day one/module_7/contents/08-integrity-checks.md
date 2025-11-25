# 8. Integrity Checks

The Walrus SDK includes multiple mechanisms to verify the integrity of uploaded and downloaded data. Understanding these checks helps ensure data correctness.

## Relay-Aware Integrity Flow

When you route uploads through the relay, the SDK still performs the same integrity steps it uses for direct-to-node uploads—it simply shifts where each step runs. Keep the following sequence in mind (walked end-to-end in [basic-upload-example](./06-basic-upload-example.md) and [relay-batching-reliability](./03-relay-batching-reliability.md)):

1. **Pre-encode on the client**: `client.walrus.computeBlobMetadata` derives the Merkle root, blob ID, and nonce before you send a tip.
2. **Register on-chain + send tip**: `client.walrus.sendUploadRelayTip` and `executeRegisterBlobTransaction` lock in the digest the relay must match.
3. **Relay batch upload**: `client.walrus.writeBlobToUploadRelay` streams the blob to the relay; the relay retries node uploads until it has a quorum certificate.
4. **Certificate-driven certify**: `client.walrus.executeCertifyBlobTransaction` submits either the relay’s certificate or one you combined yourself.
5. **Download checks**: During reads (see [basic-download-example](./07-basic-download-example.md)), `BlobReader` verifies shards, hashes, and certificate provenance automatically.

The rest of this chapter maps each integrity primitive to the relay workflow so you can explain *why* the relay is trustworthy and how to debug when checks fail.

## Root Hash Verification

Every blob has a root hash that represents the Merkle tree root of the encoded data. This hash is:

- **Computed during encoding**: Generated when the blob is encoded
- **Stored on-chain**: Included in the blob registration transaction
- **Verified during download**: Used to verify the reconstructed blob

### How Root Hash Works

```ts
const { rootHash, blobDigest, nonce } = await client.walrus.computeBlobMetadata({
  bytes: blob,
});

console.log('Root hash', Buffer.from(rootHash).toString('hex'));
await client.walrus.sendUploadRelayTip({
  size: blob.length,
  blobDigest: await blobDigest(),
  nonce,
});
```

_Reference_: The same pre-encoding + tip sequence is implemented inside the relay branch of `client.walrus.writeBlob` (`ts-sdks/packages/walrus/src/client.ts`).

The root hash is computed from the blob's Merkle tree structure, ensuring that:
- Any corruption in the data will change the hash
- The hash can be verified without downloading the entire blob
- The hash is cryptographically secure

## Blob ID Validation

The blob ID is derived from the blob's metadata and serves as a unique identifier:

- **Deterministic**: Same data produces the same blob ID
- **Unique**: Different data produces different blob IDs
- **Verifiable**: Can be recomputed from the blob metadata

### Blob ID Generation

```ts
const { blobId, metadata } = await client.walrus.computeBlobMetadata({
  bytes: blob,
});

console.log('Blob ID', blobId);
console.log('Encoding type', metadata.encodingType); // Relay enforces RS2 today.
```

When you download a blob, the SDK verifies that:
- The blob ID matches the expected value
- The metadata is consistent with the blob ID
- The blob can be reconstructed correctly

During relay uploads, this pre-computed metadata is passed straight into `writeBlobToUploadRelay`, so any mismatch between what you registered on-chain and what the relay batches later will cause the certify step to fail. See the error-handling strategies in [relay-batching-reliability](./03-relay-batching-reliability.md) for how the SDK retries when this happens.

## Certificate Verification

Whether you upload directly or through the relay, you ultimately rely on the same certificate to prove a quorum of storage nodes persisted the blob. The relay simply generates it server-side; the direct path has the SDK gather confirmations and build the certificate locally.

When using the upload relay, you receive a certificate that proves storage nodes have stored the data:

### Certificate Structure

```typescript
interface ProtocolMessageCertificate {
  signers: number[];              // Indices of nodes that signed
  serializedMessage: Uint8Array;  // The message that was signed
  signature: Uint8Array;          // Aggregated BLS signature
}
```

For direct uploads, `client.walrus.certificateFromConfirmations` wraps the same logic that the relay uses. After `writeBlob` gathers per-node confirmations, you call this helper to aggregate them:

```ts
const confirmations = await client.walrus.writeEncodedBlobToNodes({ ... });
const certificate = await client.walrus.certificateFromConfirmations({
  confirmations,
  blobId,
  blobObjectId,
  deletable: true,
});
```

Once you have a certificate (regardless of upload path), it is verified:
- **On-chain**: During the certification transaction
- **By nodes**: Storage nodes verify the certificate before confirming storage
- **By clients**: Clients can verify the certificate signature

### Certificate Generation

```ts
const { certificate, blobId } = await client.walrus.writeBlobToUploadRelay({
  blob,
  blobId: metadata.blobId,
  nonce: metadata.nonce,
  txDigest: registerResult.digest,
  deletable: true,
  blobObjectId: registerResult.blob.id.id,
});

await client.walrus.executeCertifyBlobTransaction({
  blobId,
  blobObjectId: registerResult.blob.id.id,
  certificate,
  signer,
  deletable: true,
});
```

If you ever bypass the relay (for testing quorum math or reproducing failures), use `client.walrus.certificateFromConfirmations` to aggregate node confirmations yourself; it wraps the same BLS helpers the relay uses internally.

## Content Validation

### During Upload

The SDK validates content during encoding:

1. **Size Checks**: Ensures the blob size is within limits
2. **Encoding Verification**: Verifies the encoding process completes successfully
3. **Metadata Consistency**: Ensures metadata matches the encoded data

### During Download

The SDK validates content during reconstruction:

1. **Sliver Verification**: Verifies each sliver's integrity
2. **Reconstruction Check**: Ensures the reconstructed blob matches the root hash
3. **Size Validation**: Verifies the reconstructed blob size matches metadata

```ts
const download = await client.walrus.readBlob({ blobId });
const reconstructedHash = await crypto.subtle.digest('SHA-256', download);

if (!Buffer.from(reconstructedHash).equals(Buffer.from(expectedHash))) {
  throw new Error('Blob content mismatch');
}
```

Under the hood, `readBlob` uses `decodePrimarySlivers` and the metadata hashes, so you only need to compare the bytes (or hash) against your expectation.

## Signature Verification

Storage node confirmations include BLS signatures that can be verified:

```ts
const certificate = await client.walrus.certificateFromConfirmations({
  confirmations,
  blobId,
  blobObjectId,
  deletable: true,
});
```

This helper re-verifies each node’s signature against the committee’s public keys and fails fast if you do not have a quorum—exactly what the relay does server-side. Use it when replaying confirmations collected outside the relay or when debugging malformed certificates surfaced in [partial-failures](./10-partial-failures.md).

The SDK verifies:
- Each node's signature is valid
- The signed message matches the blob metadata
- A quorum of valid signatures exists

## Manual Integrity Verification

You can manually verify blob integrity:

```typescript
async function verifyBlobIntegrity(blobId: string, expectedData: Uint8Array) {
  // Download the blob
  const downloadedData = await client.walrus.readBlob({ blobId });
  
  // Compare sizes
  if (downloadedData.length !== expectedData.length) {
    throw new Error('Blob size mismatch');
  }
  
  // Compare content (for small blobs)
  if (downloadedData.length < 1024 * 1024) { // 1MB
    const match = downloadedData.every((byte, i) => byte === expectedData[i]);
    if (!match) {
      throw new Error('Blob content mismatch');
    }
  }
  
  // For larger blobs, compute and compare hashes
  const downloadedHash = await crypto.subtle.digest('SHA-256', downloadedData);
  const expectedHash = await crypto.subtle.digest('SHA-256', expectedData);
  
  const match = new Uint8Array(downloadedHash).every(
    (byte, i) => byte === new Uint8Array(expectedHash)[i]
  );
  
  if (!match) {
    throw new Error('Blob hash mismatch');
  }
  
  return true;
}
```

Prefer CLI? Follow the `walrus client blob-status <blobId>` and `walrus client read-blob <blobId>` flow in [client-cli](https://docs.wal.app/usage/client-cli.html), then compare hashes with your local artifact. For programmatic lab work, the scripts in [hands-on](./12-hands-on.md) illustrate how to persist the certificate returned by the relay, run `client.walrus.certificateFromConfirmations`, and only mark uploads successful once every check passes.

## Metadata Verification

The blob metadata includes hashes for verification:

```typescript
interface BlobMetadata {
  encodingType: 'RS2';
  hashes: Array<{
    primaryHash: string;
    secondaryHash: string;
  }>;
  unencodedLength: number;
}
```

You can verify:
- The encoding type matches expectations
- The unencoded length matches your original data
- The hashes are consistent with the blob structure

## Error Detection

The SDK throws specific errors when integrity checks fail:

- **`InconsistentBlobError`**: The blob was incorrectly encoded
- **`BlobNotCertifiedError`**: The blob is not certified or doesn't exist
- **`NotEnoughSliversReceivedError`**: Could not retrieve enough slivers to verify

Review the mitigation flows in [retry-patterns](./09-retry-patterns.md) and [error-handling](./11-error-handling.md) to decide whether to back off, re-register, or surface the failure to your caller.

```typescript
try {
  const blob = await client.walrus.readBlob({ blobId });
} catch (error) {
  if (error instanceof InconsistentBlobError) {
    console.error('Blob integrity check failed');
  } else if (error instanceof BlobNotCertifiedError) {
    console.error('Blob is not certified');
  }
}
```

## Best Practices

1. **Always verify on download**: The SDK does this automatically, but be aware of the process
2. **Store blob IDs**: Keep track of blob IDs to verify downloads
3. **Check metadata**: Verify metadata matches expectations
4. **Handle errors**: Properly handle integrity-related errors
5. **Verify certificates**: When using relay, verify the certificate is valid

## Key Takeaways

- Root hash provides cryptographic verification of blob integrity
- Blob IDs are deterministic and unique identifiers
- Certificates prove that storage nodes have stored the data
- The SDK automatically verifies integrity during download
- Manual verification is possible for additional assurance
- Specific errors indicate integrity failures
