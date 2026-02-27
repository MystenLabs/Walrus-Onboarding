# Storage Extension / Epoch Renewal

## Key Concepts

- Walrus Mainnet epochs are **2 weeks** long; Testnet epochs are **1 day**. Maximum storage is **53 epochs** (~2 years on Mainnet).
- **End epoch is exclusive**: a blob with `end_epoch: 13` expires at the start of epoch 13 — it is valid through epoch 12.
- Extensions **must happen before the blob expires**. Once the end epoch is reached, storage nodes may garbage-collect the shards; the data is unrecoverable.
- **Race condition warning**: submitting an extension near an epoch boundary risks the network advancing epochs before the transaction executes, causing `EResourceBounds` failure. Always extend with a 2–3 epoch buffer.
- Two extension methods: `extend_blob` (pay WAL for additional epochs) and `extend_blob_with_resource` (merge a same-size, later-expiring `Storage` object).
- Extension requires the **Blob Object ID** (Sui object), not the Blob ID (content hash). Use `walrus list-blobs` to find it.
- Cost: same pricing model as initial storage — `storage_units × price_per_unit × additional_epochs` (WAL).
- **PTB batching**: multiple extensions can be bundled into a single Sui Programmable Transaction Block (PTB) to share gas costs (limit: 1024 commands per PTB).

## CLI Commands

```bash
# Extend a blob by N epochs (use blob Object ID, not blob ID)
walrus extend --blob-obj-id <BLOB_OBJ_ID> --epochs-extended 10

# Extend a shared blob
walrus extend --blob-obj-id <BLOB_OBJ_ID> --shared --epochs-extended 10

# Find a blob's Object ID
walrus list-blobs | grep <BLOB_ID>

# Preview extension cost (use dry-run on equivalent file/duration)
walrus store <FILE> --epochs <N> --dry-run

# Check remaining time before extension is needed
walrus blob-status --blob-id <BLOB_ID>
```

## SDK / Code

### Extending a Blob

```typescript
// Extension requires the Sui blob object ID, not the content blob ID
import { Transaction } from '@mysten/sui/transactions';

async function extendBlob(blobObjectId: string, additionalEpochs: number) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${WALRUS_PACKAGE}::system::extend_blob`,
    arguments: [
      tx.object(blobObjectId),
      tx.pure.u32(additionalEpochs),
      // ... WAL payment coin argument
    ],
  });
  await client.signAndExecuteTransaction({ transaction: tx });
}
```

### Batch Extension with PTB

```typescript
async function batchExtend(blobObjectIds: string[], epochs: number) {
  const tx = new Transaction();
  for (const blobObjectId of blobObjectIds) {
    tx.moveCall({
      target: `${WALRUS_PACKAGE}::system::extend_blob`,
      arguments: [tx.object(blobObjectId), tx.pure.u32(epochs)],
    });
  }
  // All extensions in one transaction — one gas fee
  await client.signAndExecuteTransaction({ transaction: tx });
}
// Note: PTBs have a limit of 1024 commands; split large batches
```

### Avoiding Zombie Data Extensions

```typescript
// Check access logs before bulk-extending
async function extendActiveBlobs(blobIds: string[], accessLog: Map<string, Date>) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  for (const blobId of blobIds) {
    const lastAccess = accessLog.get(blobId);
    if (lastAccess && lastAccess > thirtyDaysAgo) {
      await extendBlob(blobId, 5);
    } else {
      console.log(`Skipping: ${blobId} — not accessed recently`);
    }
  }
}
```

## Move Contracts

```move
// extend_blob: pay WAL for additional epochs
public(package) fun extend_blob(
    self: &mut SystemStateInnerV1,
    blob: &mut Blob,
    extended_epochs: u32,
    payment: &mut Coin<WAL>,
)

// extend_blob_with_resource: merge a pre-purchased Storage object
// The extension Storage must be: same size AND later end_epoch
public(package) fun extend_blob_with_resource(
    blob: &mut Blob,
    extension: Storage,  // Must have same size and later end_epoch
)
```

## Optimization Strategies

| Strategy | Transactions | Relative Cost |
|---|---|---|
| 1 year upfront | 1 | Baseline |
| Monthly extensions × 12 | 12 | Higher (12× gas fees) |
| Let temporary data expire | 0 | Free |

**Best practices:**
- Overestimate duration slightly — unused epochs cost less than extra gas fees from repeated extensions.
- For temporary file sharing, use minimum epochs and let the network garbage-collect automatically.
- Set monitoring alerts when blobs have < 3 epochs remaining.

## Source Files

- `04-Epochs/contents/01-epochs-continuity.md`
- `10-Transaction-types/contents/02-extension.md`
- `13-Performance-optimization/contents/04-storage-extensions.md`
