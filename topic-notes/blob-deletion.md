# Blob Deletion

## Key Concepts

- Only **deletable blobs** can be deleted before expiry. Permanent blobs (`--permanent`) cannot be deleted early.
- Blobs are **deletable by default** since CLI v1.33. Quilts follow the same rule.
- **Delete vs Burn**: `walrus delete` removes the blob from Walrus storage; `walrus burn-blobs` only destroys the Sui object to reclaim the SUI storage fund deposit — it does NOT delete data from Walrus.
- Deletion is **irreversible**. If the last reference to a blob ID is deleted, the data is gone from the network.
- Three targeting options for `walrus delete`: by blob ID (deletes all matching objects in your wallet), by file path (computes blob ID from the file), or by object ID (deletes one specific Sui blob object).
- **Quilts**: standard operations (`delete`, `extend`, `share`) target the entire quilt — individual patches inside a quilt cannot be deleted separately.

## CLI Commands

### Deleting Blobs

```bash
# Delete all owned objects with this blob ID (most common)
walrus delete --blob-ids <BLOB_ID>

# Delete by computing blob ID from a local file
walrus delete --files <FILE_PATH>

# Delete a specific Sui blob object (only that one object)
walrus delete --object-ids <OBJECT_ID>

# Skip confirmation prompt
walrus delete --blob-ids <BLOB_ID> --yes

# Skip status check after deletion (faster, useful in scripts)
walrus delete --blob-ids <BLOB_ID> --no-status-check
```

### Burning Blob Objects (reclaim SUI deposit)

```bash
# Burn specific blob objects (reclaims SUI from storage fund)
walrus burn-blobs --object-ids <OBJ_ID1> <OBJ_ID2>

# Burn all blob objects in your wallet
walrus burn-blobs --all

# Burn only expired blob objects (most common use case)
walrus burn-blobs --all-expired

# Skip confirmation
walrus burn-blobs --all-expired --yes
```

### Checking Deletable Status

```bash
# list-blobs shows "Deletable status" column
walrus list-blobs

# Check a specific blob's status
walrus blob-status --blob-id <BLOB_ID>
```

## Blob Lifecycle States

```
Uploaded → Available ──────────────────────────────→ Expired
                    ↓ (if deletable)       ↓ (time)
                 Deleted                Burned (SUI object removed)
                    ↓
                 Burned (SUI object removed)
```

- **Delete**: removes data from Walrus + destroys Sui object (deletable blobs only)
- **Burn**: destroys the Sui blob object and reclaims SUI deposit — blob data may or may not still be on Walrus depending on whether it expired or other references exist
- **Expire**: network garbage-collects shards automatically after end epoch — no action needed

## Delete vs Burn vs Expire Comparison

| Action | Command | Cost | Removes data? | Reclaims SUI? |
|---|---|---|---|---|
| Delete blob | `walrus delete` | Gas (SUI) | Yes (from Walrus) | Yes |
| Burn object | `walrus burn-blobs` | Gas (SUI) | No | Yes |
| Expire | _(none — automatic)_ | Free | Yes (at end epoch) | No (object remains) |

**Recommendation**: For temporary data, use minimum epochs and let blobs expire naturally (free). Use explicit deletion only when early removal is required.

## Quilt-Specific Notes

```bash
# Quilt deletion — targets the entire quilt, not individual patches
walrus delete --blob-ids <QUILT_BLOB_ID>

# Individual patches cannot be deleted; you must delete the whole quilt
# QuiltPatchId is not a valid target for walrus delete
```

## Source Files

- `06-Walrus-CLI/contents/03-upload-workflow.md`
