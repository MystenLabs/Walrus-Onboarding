# Batch Upload via Quilts

## Key Concepts

- A **quilt** batches up to **666 blobs** into a single storage unit, sharing fixed overhead costs across all files.
- The 666 limit comes from the network configuration: with 1000 shards, 333 are Byzantine, leaving 667 secondary slivers minus 1 reserved for the index = 666 available for patches.
- **Why quilts save money**: every blob has a ~64 MB fixed metadata floor regardless of actual size. Storing 600 × 10 KB files individually costs ~413× more than a single quilt.
- Blobs within a quilt are called **patches** and are retrieved by `QuiltPatchId` (not standard `BlobId`).
- Standard lifecycle operations (`delete`, `extend`, `share`) apply to the **entire quilt**, not individual patches.
- `--paths` uses filenames as identifiers; `--blobs` allows custom identifiers and tags (mutually exclusive).
- Quilts are best for: small files (< 1 MB each), static collections, same lifecycle requirements, large batch sizes (100–300+ files for maximum savings).

## CLI Commands

```bash
# Store all files in a directory recursively (filename = identifier)
walrus store-quilt --epochs 10 --paths /path/to/directory1 /path/to/directory2

# Store with custom identifiers and tags
walrus store-quilt --epochs 10 \
  --blobs '{"path":"./docs/intro.html","identifier":"intro","tags":{"chapter":"1","lang":"en"}}' \
          '{"path":"./docs/api.html","identifier":"api-ref","tags":{"chapter":"2","lang":"en"}}'

# Permanent quilt
walrus store-quilt --epochs 10 --permanent --paths ./nft-collection/

# Dry run — preview cost and QuiltPatchIds without storing
walrus store-quilt --dry-run --epochs 50 --paths ./large-collection/

# Verify after creation
walrus blob-status --blob-id <QUILT_BLOB_ID>
walrus list-patches-in-quilt <QUILT_BLOB_ID>
```

### Output Format

```text
Blob ID: zkGU4bnBjDpgbSHqFckYtoW7GJlIKteP_HJBTkPj1sk
Unencoded size: 435 KiB
Encoded size: 63.0 MiB
Cost: 0.0017 WAL

 Index  QuiltPatchId                              Identifier
 0      zkGU4...BAQACAAfoo                        banner
 1      zkGU4...BAgADAfoo                         config
 2      zkGU4...BAwAEAfoo                         logo
```

### Constraints

| Constraint | Value |
|---|---|
| Max blobs per quilt | 666 |
| Max identifier size | 64 KB |
| Max total tags size | 64 KB |
| `--paths` + `--blobs` together | Not allowed |
| Identifier format | Must start with alphanumeric character |
| Identifier uniqueness | Required within a quilt |

## SDK / Code

```typescript
// Simple one-step method — handles encode, register, upload, certify
const result = await client.writeFiles({
  files,
  epochs: 10,
  deletable: true,
  signer: keypair,
});

// files is an array of WalrusFile objects:
const files = [
  WalrusFile.from({ contents: uint8ArrayData1, identifier: 'intro', tags: { chapter: '1' } }),
  WalrusFile.from({ contents: uint8ArrayData2, identifier: 'api-ref', tags: { chapter: '2' } }),
];
```

### Cost Savings Reference (600 blobs, 1 epoch)

| Blob Size | Individual Cost | Quilt Cost | Savings |
|---|---|---|---|
| 10 KB | 6.615 WAL | 0.016 WAL | ~413× |
| 100 KB | 6.615 WAL | 0.062 WAL | ~107× |
| 1 MB | 7.035 WAL | 0.535 WAL | ~13× |

## Source Files

- `11-Batch-storage/contents/01-what-quilts-solve.md`
- `11-Batch-storage/contents/03-creation-process.md`
