# Guidance for Real Product Use

When building production applications on Walrus, choosing the right transaction strategy is critical for cost, performance, and user experience.

## Transaction Strategy Matrix

```mermaid
flowchart TD
    Start([New Data to Store]) --> Size{Is file > 10MB?}
    
    Size -- Yes --> Standard[Standard Blob]
    Size -- No --> Volume{Many small files?}
    
    Volume -- Yes --> Quilt[Quilt / Batched Blob]
    Volume -- No --> Funding{Need Public Funding?}
    
    Funding -- Yes --> Shared[SharedBlob]
    Funding -- No --> Lifecycle{Short lifespan?}
    
    Lifecycle -- Yes --> Deletable[Deletable Standard Blob]
    Lifecycle -- No --> Standard
```

| Scenario | Recommended Strategy | Why? |
| :--- | :--- | :--- |
| **User Profile Pictures** | **Quilt** (Batched) | High volume of small files. Group by time (e.g., "daily upload quilt") or by user cohort. |
| **Large Video Assets** | **Standard Blob** | File size justifies the metadata overhead. Independent lifecycle is important. |
| **Public Dataset** | **SharedBlob** | Allows community funding to keep the dataset alive indefinitely. |
| **Temporary Transfer** | **Short-lived Blob** | Use minimum epoch duration. Mark as `deletable` to reclaim storage immediately after transfer. |

## Cost Management
1.  **Bulk Buying**: Use `reserve_space` to buy large amounts of storage during low-demand periods (if price fluctuates) or simply to reduce the number of small `reserve_space` transactions.
2.  **Resource Recycling**: If your app deletes blobs frequently, re-use the returned `Storage` objects for new blobs instead of converting them back to WAL.
3.  **Clean Up**: Always burn expired `Blob` objects on Sui to reclaim the storage rebate (SUI tokens).

## Latency Optimization
*   **Parallelization**: Upload shards to Storage Nodes in parallel.
*   **PTBs**: Always group `reserve_space` and `register_blob` in a single Programmable Transaction Block. If possible, group operations for multiple blobs into one PTB (Sui limit is 1024 commands).

## Error Handling
*   **Upload Failures**: If `certify_blob` fails (e.g., not enough signatures), you haven't lost your `Storage` resource. You can try to re-upload to different nodes or re-try certification later.
*   **Expiry**: Monitor `end_epoch`. Build an automated "extender" service if guarantees are needed.

## Code Example: Production Configuration

When running in production, ensure you configure timeouts to handle network variance and large files.

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { Agent, setGlobalDispatcher } from 'undici';

// 1. Configure global HTTP agent for better performance/timeouts
setGlobalDispatcher(new Agent({
    connectTimeout: 60_000,
    connect: { timeout: 60_000 },
}));

// 2. Configure Walrus Client with specific timeouts
const client = new SuiClient({
    url: getFullnodeUrl('mainnet'),
    network: 'mainnet',
}).$extend(
    walrus({
        storageNodeClientOptions: {
            timeout: 60_000, // Wait up to 60s for storage nodes
        },
    })
);
```

