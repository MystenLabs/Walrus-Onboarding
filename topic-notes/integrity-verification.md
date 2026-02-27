# Integrity Verification

## Key Concepts

- Every blob has a **root hash** (Merkle tree root of the encoded data) computed at encoding time, stored on-chain at registration, and verified during download. Any corruption changes the hash.
- **Blob IDs are deterministic**: the same bytes always produce the same blob ID. You can verify a download by re-deriving the blob ID from the downloaded bytes and comparing with the expected value.
- **Proof of Availability**: a certificate aggregating BLS signatures from a quorum (> 2/3) of storage nodes, proving they physically store the shards. Required for `certify_blob` on-chain.
- `computeBlobMetadata()` derives root hash, blob ID, and nonce **before** any upload — used to pre-register what the relay must match.
- `certificateFromConfirmations()` aggregates per-node BLS signatures into a single compact certificate for on-chain submission.
- `InconsistentBlobError` during download means the data is corrupted — do not retry, investigate the upload.
- The SDK's `readBlob()` performs all sliver verification, reconstruction, and root hash checking automatically.

## 4-Step Proof-of-Availability Process

```text
1. Client uploads shards to storage nodes (HTTP PUT)
2. Client requests confirmation from each node:
   GET /v1/blobs/{blob_id}/confirmation/permanent
3. Each node checks: (a) blob is registered on-chain, (b) all assigned slivers present
   → If both pass: node signs confirmation with its BLS private key
4. Client collects signatures until quorum (2f+1 of n=3f+1 shards)
   → Aggregates into ConfirmationCertificate
   → Submits certify_blob transaction on Sui
```

## SDK / Code

### Pre-Encoding Verification

```typescript
// Compute metadata before upload — derives root hash, blob ID, nonce
const { rootHash, blobDigest, nonce, blobId } = await client.walrus.computeBlobMetadata({
  bytes: blob,
});

console.log('Root hash:', Buffer.from(rootHash).toString('hex'));
console.log('Blob ID:', blobId);
console.log('Encoding type:', metadata.encodingType); // RS2 (Reed-Solomon)
```

### Certificate from Node Confirmations

```typescript
// For direct uploads: aggregate node confirmations into a certificate
const confirmations = await client.walrus.writeEncodedBlobToNodes({ ... });
const certificate = await client.walrus.certificateFromConfirmations({
  confirmations,
  blobId,
  blobObjectId,
  deletable: true,
});
// certificate is then submitted via executeCertifyBlobTransaction()
```

### Relay Upload with Certificate

```typescript
// Relay returns a certificate after achieving quorum
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

### Manual Integrity Verification

```typescript
async function verifyBlobIntegrity(blobId: string, expectedData: Uint8Array): Promise<boolean> {
  const downloadedData = await client.walrus.readBlob({ blobId });

  if (downloadedData.length !== expectedData.length) {
    throw new Error('Blob size mismatch');
  }

  // For small blobs: byte-by-byte comparison
  if (downloadedData.length < 1_048_576) {
    return downloadedData.every((byte, i) => byte === expectedData[i]);
  }

  // For larger blobs: compare SHA-256 hashes
  const [downloadedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', downloadedData),
    crypto.subtle.digest('SHA-256', expectedData),
  ]);
  return new Uint8Array(downloadedHash).every(
    (byte, i) => byte === new Uint8Array(expectedHash)[i],
  );
}
```

### Error Handling for Integrity Failures

```typescript
try {
  const data = await client.walrus.readBlob({ blobId });
} catch (error) {
  if (error instanceof InconsistentBlobError) {
    // Permanent — blob encoding is incorrect, do not retry
    console.error('Blob integrity check failed — data may be corrupted');
  } else if (error instanceof BlobNotCertifiedError) {
    // May be timing — check if blob exists and is certified
    console.error('Blob is not certified or does not exist');
  } else if (error instanceof NotEnoughSliversReceivedError) {
    // Transient — retry with backoff
    console.error('Could not retrieve enough slivers — retry');
  }
}
```

## CLI Verification

```bash
# Check blob availability and certification event
walrus blob-status --blob-id <BLOB_ID>

# Download and verify against original file (blob IDs must match)
walrus read <BLOB_ID> --out downloaded.txt
walrus blob-id original.txt
walrus blob-id downloaded.txt

# Strict consistency check during download
walrus read <BLOB_ID> --out file.txt --strict-consistency-check
```

## Certificate Structure

```typescript
interface ProtocolMessageCertificate {
  signers: number[];              // Indices of signing nodes
  serializedMessage: Uint8Array;  // The attested message
  signature: Uint8Array;          // Aggregated BLS signature
}
```

## Quorum Requirement

```text
Network has n = 3f + 1 shards (n=1000, f=333 on Mainnet)
Quorum = 2f + 1 = 667 shards must sign
→ > 2/3 of the network must have stored the data
```

## Source Files

- `07-Walrus-SDK-upload-relay/contents/08-integrity-checks.md`
- `09-Upload-lifecycle/contents/04-proof-creation.md`
