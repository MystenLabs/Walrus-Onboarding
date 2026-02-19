# 4. Proof Creation (Proof of Availability)

Once the slivers are stored on the nodes, the client must gather **validity proofs** (signatures) from the storage nodes. These signatures attest that the nodes have received and stored the data. Collectively, these signatures form a **Proof of Availability**.

## The Confirmation Request

The client asks each storage node to confirm that it holds the necessary shards for the blob. This is done via the `compute_storage_confirmation` RPC.

### Visualizing Proof Creation

![Visualizing Proof Creation](../images/04-proof-creation-visualized.png)

<details>
<summary>Mermaid source (click to expand)</summary>

```mermaid
sequenceDiagram
    participant Client
    participant Node as Storage Node
    participant DB as Node Database

    Note over Client: 1. Requesting Confirmation
    Client->>Node: GET /v1/blobs/.../confirmation/...
    
    activate Node
    Note over Node: 2. Node-Side Verification
    Node->>DB: 2.1 Check Registration (Local State)
    DB-->>Node: Registered: YES
    
    Node->>DB: 2.2 Check Storage (Local)
    DB-->>Node: All Slivers Present: YES
    
    Note over Node: 3. Signing
    Node->>Node: Sign Confirmation (PrivateKey)
    deactivate Node
    
    Node-->>Client: Signed Validity Proof
    
    Note over Client: 4. Collection & Aggregation<br/>(Accumulate signatures until quorum reached)
```

</details>

## Detailed Proof Generation

This phase transforms "stored data" into "proven data".

1.  **Requesting Confirmation**:
    -   The client sends a `compute_storage_confirmation` request (via HTTP GET) to each node it successfully uploaded to.
    -   **Endpoint**: `/v1/blobs/{blob_id}/confirmation/permanent` (or `/deletable/{object_id}`).
    -   This is often done in the same session or immediately following the upload.

2.  **Node-Side Verification**:
    -   Upon receiving the request, the node performs two critical checks:
        1.  **Local Storage Check**: It queries its local database to ensure it has all the slivers assigned to its shards for that `BlobId`. If any are missing, it refuses to sign.
        2.  **On-Chain Registration Check**: It queries the Sui blockchain (or its local index of it) to confirm that the `BlobId` has been registered and paid for. This prevents spam/unpaid storage.

3.  **Signing**:
    -   If both checks pass, the node uses its **BLS Private Key** to sign a message.
    -   The message effectively says: "I, Node X, attest that I am storing the shards for Blob Y in Epoch Z."

4.  **Collection & Aggregation**:
    -   The client collects these signatures.
    -   It must collect enough signatures to meet the **Validity Threshold** (usually > 2/3 of the total voting power).
    -   These signatures can be aggregated into a single compact certificate.

## Code Trace: Proof Collection

### SDK Implementation (Client)

In `ts-sdks/packages/walrus/src/client.ts`, the client requests confirmations from nodes and then aggregates them.

> **📖 Source Reference**: [`WalrusClient.getStorageConfirmationFromNode()` (line ~1659)](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts#1659) — This method:
> - Retrieves the active committee and looks up the node by index
> - Calls either `getDeletableBlobConfirmation()` or `getPermanentBlobConfirmation()` depending on the blob type
> - Returns the signed confirmation from the node's response

> **📖 Source Reference**: [`WalrusClient.certificateFromConfirmations()` (line ~1154)](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts#L1154) — This method:
> - Validates and filters the collected signatures
> - Checks if quorum is reached using `isQuorum()` (throws `NotEnoughBlobConfirmationsError` if not)
> - Combines the individual BLS signatures into an aggregated certificate using WASM bindings

### Storage Node Logic

When a storage node receives this request, it checks its local database (embedded RocksDB):

1.  **Registration Check**: verifies the blob is registered on-chain (via synced local state).
2.  **Storage Check**: verifies it has all the required slivers for its assigned shards.
3.  **Signing**: If checks pass, it signs a confirmation message with its private key.

> **📖 Source Reference**: [`compute_storage_confirmation()`](https://github.com/MystenLabs/walrus/blob/9458057a23d89eaf9eccfa7b81bad93595d76988/crates/walrus-service/src/node.rs#L308) — Storage node logic for generating signed storage confirmations.

**Pseudo Code**:
```
async function compute_storage_confirmation(blob_id, persistence_type):
    // Step 1: Verify blob is registered on-chain (via local synced state)
    if not this_node.is_blob_registered(blob_id):
        return Error("Blob not currently registered")

    // Step 2: Flush any pending metadata/slivers for this blob
    flush_pending_caches(blob_id)

    // Step 3: Verify all slivers are stored for the latest shard assignment
    if not await this_node.is_stored_at_all_shards_at_latest_epoch(blob_id):
        return Error("Blob not fully stored on this node")

    // Step 4: If deletable, verify the per-object registration is current
    if persistence_type is Deletable(object_id):
        if not per_object_info(object_id).is_registered(current_committee_epoch):
            return Error("Blob not currently registered")

    // Step 5: Construct confirmation message
    confirmation = Confirmation {
        epoch: current_committee_epoch,
        blob_id: blob_id,
        persistence_type: persistence_type  // Permanent or Deletable{object_id}
    }

    // Step 6: Sign with node's BLS private key
    signature = await sign_message(confirmation, this_node.protocol_key_pair)

    // Step 7: Update metrics
    metrics.storage_confirmations_issued_total.increment()

    return StorageConfirmation::Signed(signature)
```

## Aggregating Signatures

The client collects these signatures until it reaches a **quorum** (sufficient stake weight).

1.  **Stake Accumulation**: As valid signatures arrive, the client sums the voting power (shard ownership) of the signing nodes.
2.  **Threshold Check**:
    -   The system requires $2f + 1$ validity power (where total shards $n = 3f + 1$).
    -   This ensures $> 2/3$ of the network has stored the data.
3.  **Aggregation**: Once the threshold is met, the individual BLS signatures are aggregated into a single `ConfirmationCertificate`.

-   The Walrus protocol requires a supermajority of validity power to certify a blob.
-   The client aggregates these individual signatures into a single certificate or a list of signatures to submit to Sui.


## Log Tracing

### TypeScript SDK
The TypeScript SDK does not emit debug logs by default. Monitor the `certificateFromConfirmations` execution.

### Rust SDK / CLI
If using the Rust SDK or CLI, look for these debug-level messages:
-   `retrieving confirmation` — client requesting confirmation from a node
-   `return=ThresholdReached` — quorum threshold has been met (enough signatures collected)

### Storage Node Logs
-   Look for metrics updates on `storage_confirmations_issued_total`.

> 💡 **Docker Tip:** The `make grep-logs` command searches for `retrieving confirmation` and `ThresholdReached` patterns to identify this phase.

## Key Takeaways

- **Proof of Availability**: The aggregated BLS signatures form a certificate that cryptographically proves the data is available on the network.
- **Dual Verification**: Nodes verify both on-chain registration (payment) and local storage (data presence) before signing.
- **Cryptographic Assurance**: BLS signatures from nodes serve as the cryptographic proof of availability.
- **Quorum Requirement**: A sufficient weight of signatures (validity threshold) is required to proceed to certification.
