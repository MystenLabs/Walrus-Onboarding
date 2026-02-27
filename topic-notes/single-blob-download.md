# Single Blob Download

## Key Concepts

- **Blob ID is the only input required** for retrieval — same content-addressed ID used at upload time.
- Download process: query Sui for availability certificate → retrieve encoded slivers from storage nodes → decode → verify → output.
- Three **consistency check modes** (default, strict, skip); default is performant and sufficient for most use cases.
- Blob IDs are **deterministic**: you can re-derive the ID from the original file (`walrus blob-id`) and compare with the downloaded file to verify identity.
- The SDK's `readBlob()` performs sliver verification, reconstruction, and root hash checking automatically.
- Use `--rpc-url` to switch Sui RPC endpoints if experiencing connectivity issues.

## CLI Commands

```bash
# Basic download — outputs to stdout
walrus read <BLOB_ID>

# Save to file
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik --out downloaded-file.pdf

# Pipe to another command
walrus read <BLOB_ID> | head -n 100

# Strict consistency check (slower but thorough)
walrus read <BLOB_ID> --out file.txt --strict-consistency-check

# Skip consistency check (only when you fully trust the blob writer)
walrus read <BLOB_ID> --out file.txt --skip-consistency-check

# Use a specific Sui RPC endpoint
walrus read <BLOB_ID> --out file.txt --rpc-url https://fullnode.mainnet.sui.io:443

# Verify a downloaded file matches the original
walrus blob-id original-file.txt   # get ID
walrus blob-id downloaded-file.txt # compare — must match
```

### Consistency Check Modes

| Mode | Flag | Speed | Use When |
|------|------|-------|----------|
| Default | _(none)_ | Fast | Normal downloads |
| Strict | `--strict-consistency-check` | Slower | Auditing / high assurance |
| Skip | `--skip-consistency-check` | Fastest | Fully trusted source only |

### Troubleshooting

```bash
# Check if blob is still available and get expiry epoch
walrus blob-status --blob-id <BLOB_ID>

# Enable debug logging to trace sliver retrieval
RUST_LOG=walrus=debug walrus read <BLOB_ID> --out file.txt
```

## SDK / Code

```typescript
// readBlob() handles shard retrieval, decoding, and integrity checks automatically
const data = await client.readBlob({ blobId });

// Download with error classification
async function downloadWithErrorHandling(blobId: string): Promise<Uint8Array> {
  try {
    return await client.readBlob({ blobId });
  } catch (error) {
    if (error instanceof BlobNotCertifiedError) {
      throw new Error('Blob not found or not yet certified');
    }
    if (error instanceof NotEnoughSliversReceivedError) {
      throw new Error('Download failed: not enough data — retry');
    }
    if (error instanceof InconsistentBlobError) {
      throw new Error('Data integrity check failed — do not retry');
    }
    throw error;
  }
}
```

## Source Files

- `06-Walrus-CLI/contents/04-download-workflow.md`
- `07-Walrus-SDK-upload-relay/contents/07-basic-download-example.md`
