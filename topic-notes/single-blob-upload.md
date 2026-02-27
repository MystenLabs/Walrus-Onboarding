# Single Blob Upload

## Key Concepts

- Upload is a **4-step on-chain + off-chain process**: reserve space → register blob → upload shards → certify blob.
- **Reserve space** buys a `Storage` Sui object using WAL tokens; `register_blob` creates the `Blob` Sui object and emits a `BlobRegistered` event.
- Actual file bytes stay **off-chain** with storage nodes; on-chain state holds commitments and costs.
- **Blob IDs are deterministic**: same content always produces the same blob ID (content-addressed, base64 URL-safe encoded).
- After a quorum of nodes acknowledge receipt, their BLS signatures are aggregated and submitted to certify the blob on-chain (`BlobCertified` event).
- Clients typically bundle `reserve_space` + `register_blob` into a single Programmable Transaction Block (PTB) to save gas.
- Blobs are **deletable by default** (since CLI v1.33); use `--permanent` to prevent deletion before expiry.

## CLI Commands

```bash
# Basic upload — specify duration in epochs (1 epoch = 2 weeks on Mainnet)
walrus store file.txt --epochs 10

# Multiple files or glob
walrus store *.png --epochs 10

# Permanent blob (cannot be deleted before expiry)
walrus store archive.zip --epochs 30 --permanent

# Specify by expiry date instead of epoch count
walrus store file.txt --earliest-expiry-time "2025-12-31T23:59:59Z"

# Maximum duration (53 epochs on Mainnet)
walrus store important-file.txt --epochs max

# Force re-upload even if blob already exists
walrus store file.txt --epochs 10 --force

# Use upload relay (handles encoding/fan-out on your behalf)
walrus store file.txt --epochs 10 --upload-relay https://relay.example.com

# Shared blob (anyone can fund/extend; must be permanent)
walrus store archive.zip --epochs 30 --share
```

### Upload Output Fields

```text
Stored blob:
  Blob ID: 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik   # Save this for retrieval
  Blob Object ID: 0x1234...                               # Sui object ID for lifecycle ops
  End epoch: 15
  Transaction: 0xabcdef...
```

## SDK / Code

```typescript
// SDK writeBlob() handles all 4 steps automatically
const result = await client.walrus.writeBlob({
  blob: new Uint8Array(fileBytes),
  deletable: true,   // false = permanent
  epochs: 3,
  signer: keypair,
});

// With upload relay — same API, relay handles node fan-out
const clientWithRelay = new WalrusClient({
  uploadRelay: { host: 'https://relay.testnet.walrus.space' },
  // ...
});
const result = await clientWithRelay.walrus.writeBlob({ ... });
```

### 4-Step Flow (low-level)

```
1. reserve_space(storage_amount, epochs_ahead, payment<WAL>)  → Storage object
2. register_blob(Storage, blob_id, root_hash, size)           → Blob object + BlobRegistered event
3. HTTP PUT shards to storage nodes                           → BLS signatures from quorum
4. certify_blob(Blob, aggregated_signature, signers_bitmap)   → BlobCertified event
```

## Source Files

- `06-Walrus-CLI/contents/03-upload-workflow.md`
- `07-Walrus-SDK-upload-relay/contents/06-basic-upload-example.md`
- `10-Transaction-types/contents/01-upload.md`
