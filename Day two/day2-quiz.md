# Day 2 Comprehensive Quiz: Advanced Walrus Operations

This consolidated quiz covers Modules 9-14 from Day 2 of the Walrus Training Program, focusing on upload transaction lifecycle, transaction types, quilts, failure handling, performance optimization, and applied scenarios.

---

## Index

| Section | Topic | Questions | Question Types |
|---------|-------|-----------|----------------|
| [Section 1](#section-1-upload-transaction-lifecycle) | Upload Transaction Lifecycle | 1.1 – 1.5 | Ordering, T/F, Fill-in, Short Answer, MC |
| [Section 2](#section-2-transaction-types) | Transaction Types | 2.1 – 2.5 | Matching, MC, T/F, Short Answer |
| [Section 3](#section-3-quilts) | Quilts | 3.1 – 3.7 | MC, T/F, Fill-in, Short Answer, Scenario |
| [Section 4](#section-4-failure-handling) | Failure Handling | 4.1 – 4.7 | Classification, MC, T/F, Short Answer, Scenario |
| [Section 5](#section-5-performance-optimization) | Performance Optimization | 5.1 – 5.8 | MC, T/F, Fill-in, Ordering, Short Answer, Scenario |
| [Section 6](#section-6-applied-scenarios) | Applied Scenarios | 6.1 – 6.8 | Scenario-based (various) |
| [Answer Key](#answer-key) | All Answers | — | — |

**Total Questions:** 42 questions across 6 sections

**Estimated Time:** 60-90 minutes

---

## Section 1: Upload Transaction Lifecycle

### Question 1.1 (Ordering)

Place the following phases of the Walrus blob upload lifecycle in the correct order (1-4):

\_\_\_ Certification (submit aggregated signatures to Sui)

\_\_\_ Sealing (upload slivers to storage nodes)

\_\_\_ Encoding (split blob into slivers using RS coding)

\_\_\_ Registration (create Blob object on Sui)

### Question 1.2 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ The blob ID is derived from the Merkle root, encoding type, and unencoded length.

b) \_\_\_ Registration creates a blob object on Sui with status "Certified".

c) \_\_\_ Sealing involves uploading slivers to storage nodes via HTTP PUT requests.

d) \_\_\_ Certification requires collecting signatures from at least 2/3 of voting power (2f+1).

e) \_\_\_ Storage nodes can sign confirmations for blobs even if the blob hasn't been registered on Sui.

f) \_\_\_ After `certify_blob` is called, storage nodes that missed the upload will automatically sync from peers.

### Question 1.3 (Fill in the Blank)

Complete the following statements about the upload lifecycle:

a) During encoding, a blob is split into \_\_\_\_\_\_\_\_ primary slivers and \_\_\_\_\_\_\_\_ secondary slivers (for a network with 1000 shards).

b) The \_\_\_\_\_\_\_\_\_\_\_\_\_\_ transaction reserves storage space and pays WAL tokens.

c) Storage nodes verify the \_\_\_\_\_\_\_\_\_\_\_\_\_\_ event before accepting slivers.

d) The \_\_\_\_\_\_\_\_\_\_\_\_\_\_ event indicates that a blob has reached its "point of availability".

e) For a 1000-shard network, the minimum slivers needed for reconstruction ($k_{primary}$) is \_\_\_\_\_\_\_\_.

### Question 1.4 (Short Answer)

A storage node receives a `compute_storage_confirmation` request. Describe the two critical checks it performs before signing the confirmation.

### Question 1.5 (Multiple Choice)

What specific on-chain event signals to storage nodes that they should expect incoming data slivers?

A) `StoragePurchased`

B) `BlobRegistered`

C) `BlobCertified`

D) `SliversReceived`

---

## Section 2: Transaction Types

### Question 2.1 (Matching)

Match each transaction type to its primary purpose:

Transaction Types:
1. `reserve_space`
2. `register_blob`
3. `certify_blob`
4. `extend_blob`
5. `extend_blob_with_resource`

Purposes:
A) Finalizes blob storage by posting aggregated signatures
B) Purchases storage capacity for a specific size and duration
C) Associates a blob ID with reserved storage space
D) Extends storage by paying additional WAL tokens
E) Extends storage by merging with an existing Storage object

\_\_\_ reserve_space → \_\_\_

\_\_\_ register_blob → \_\_\_

\_\_\_ certify_blob → \_\_\_

\_\_\_ extend_blob → \_\_\_

\_\_\_ extend_blob_with_resource → \_\_\_

### Question 2.2 (Multiple Choice)

What is a SharedBlob?

A) A blob that can be accessed by multiple users simultaneously

B) A blob wrapped in a container that allows multiple parties to contribute WAL for extensions

C) A blob that shares storage space with other blobs

D) A blob that is automatically replicated across multiple regions

### Question 2.3 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Extensions must happen before the blob expires; expired blobs cannot be recovered.

b) \_\_\_ Retrieval operations are always free and off-chain.

c) \_\_\_ The `register_blob` and `reserve_space` transactions are often batched into a single PTB.

d) \_\_\_ Certified reads require on-chain verification and incur gas fees.

e) \_\_\_ Re-using returned `Storage` objects is cheaper than converting them back to WAL.

### Question 2.4 (Short Answer)

Why should `reserve_space` and `register_blob` be bundled in a single PTB for uploads?

### Question 2.5 (Multiple Choice)

When does the "point of availability" occur in a blob upload?

A) When encoding completes locally

B) When the blob is registered on Sui

C) When storage nodes receive all slivers

D) When the certificate is posted to Sui blockchain

---

## Section 3: Quilts

### Question 3.1 (Multiple Choice)

What is the primary problem that quilts solve?

A) Storing blobs larger than 13.3 GiB

B) Reducing costs and gas fees when storing many small blobs

C) Enabling faster retrieval of individual blobs

D) Providing automatic encryption for stored data

### Question 3.2 (Multiple Choice)

What is the maximum number of patches (blobs) that can be stored in a single QuiltV1 (for a network with 1000 shards)?

A) 334

B) 500

C) 666

D) 1000

### Question 3.3 (Multiple Choice)

How do you retrieve a single file from a quilt when you have its identifier?

A) `walrus read <QuiltPatchId>`

B) `walrus read <QuiltBlobId>`

C) `walrus read-quilt --quilt-id <QuiltBlobId> --identifiers <id>`

D) You cannot read single files from quilts

### Question 3.4 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Quilts allow individual patches to be deleted separately from the quilt.

b) \_\_\_ QuiltPatchId is a composite identifier that includes both the quilt's BlobId and a patch index.

c) \_\_\_ Quilts are most cost-effective when storing many small files (< 1MB each).

d) \_\_\_ The first column of a quilt contains metadata including the QuiltIndex.

e) \_\_\_ The same file uploaded to two different quilts will have the same QuiltPatchId.

f) \_\_\_ Individual patches within a quilt can be extended independently.

### Question 3.5 (Fill in the Blank)

Complete the following statements about quilts:

a) Quilt identifier size limit: \_\_\_\_\_\_ KB

b) Total tags size (all patches combined) limit: \_\_\_\_\_\_ KB

c) Quilts are best suited for files smaller than \_\_\_\_\_\_ MB each.

d) The CLI options `--paths` and `--blobs` for `store-quilt` are \_\_\_\_\_\_\_\_\_\_\_\_\_\_ (can/cannot be used together).

### Question 3.6 (Short Answer)

Explain the difference between a BlobId and a QuiltPatchId. When would you use each?

### Question 3.7 (Scenario)

A user wants to delete one patch from an existing quilt. What is the correct approach?

---

## Section 4: Failure Handling

### Question 4.1 (Classification)

Classify each error as RETRYABLE (R) or NON-RETRYABLE (N):

a) \_\_\_ Network timeout while uploading slivers to a node

b) \_\_\_ `BlobBlockedError` - Content blocked by storage nodes

c) \_\_\_ `BlobNotCertifiedError` - Blob doesn't exist or expired

d) \_\_\_ `InconsistentBlobError` - Reconstructed data doesn't match blob ID

e) \_\_\_ `NotEnoughSliversReceivedError` - SDK couldn't retrieve enough slivers

f) \_\_\_ HTTP 429 Too Many Requests

g) \_\_\_ HTTP 400 due to oversized metadata

h) \_\_\_ `BehindCurrentEpochError`

i) \_\_\_ Publisher temporarily unreachable

### Question 4.2 (Multiple Choice)

What is exponential backoff?

A) Retrying immediately with increasing frequency

B) Increasing wait time between retries exponentially (1s, 2s, 4s, 8s...)

C) Reducing retry attempts over time

D) Using multiple backup systems simultaneously

### Question 4.3 (Multiple Choice)

Which statement about Walrus writes is correct?

A) Writes are not idempotent; re-uploads change the BlobId

B) Writes are idempotent; same content → same BlobId

C) Writes are idempotent only for quilts

D) Writes are idempotent only if retries happen within one epoch

### Question 4.4 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ The SDK automatically handles retries for high-level methods like `readBlob` and `writeBlob`.

b) \_\_\_ Jitter should be added to retry delays to avoid synchronized retries from multiple clients.

c) \_\_\_ You only need 2f+1 slivers to reconstruct a blob, so individual node failures don't cause operation failure.

d) \_\_\_ `InconsistentBlobError` indicates data corruption and the data should NOT be used.

e) \_\_\_ Once a blob expires, it can be recovered by paying back storage fees.

### Question 4.5 (Short Answer)

Give two reasons to add jitter to exponential backoff when retrying Walrus operations.

### Question 4.6 (Short Answer)

Explain the Circuit Breaker pattern and describe its three states. Why is this pattern useful when working with multiple aggregator endpoints?

### Question 4.7 (Scenario)

A client uploads a blob but receives a timeout error before certification completes.

a) What should the client check first before retrying?

b) Name two fallback strategies the client could implement to improve reliability.

---

## Section 5: Performance Optimization

### Question 5.1 (Multiple Choice)

What is the recommended chunk size range for parallel chunking of large files?

A) 1MB - 5MB

B) 10MB - 100MB

C) 100MB - 500MB

D) 500MB - 1GB

### Question 5.2 (Multiple Choice)

What limits the number of concurrent blob uploads when using a Publisher?

A) Network bandwidth

B) Number of sub-wallets configured (`--n-clients`)

C) Storage node capacity

D) Blob size

### Question 5.3 (Multiple Choice)

On a 1000-shard network, how many primary slivers are sufficient for reconstruction?

A) 167

B) 334

C) 667

D) 1000

### Question 5.4 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Parallel chunking enables 2-4x throughput improvement for large uploads.

b) \_\_\_ Intra-blob parallelism refers to uploading multiple blobs simultaneously.

c) \_\_\_ Blob IDs are immutable, making caching trivially easy (no invalidation needed).

d) \_\_\_ Estimating storage duration upfront avoids extension transaction overhead.

e) \_\_\_ Increasing publisher sub-wallets always improves upload throughput.

f) \_\_\_ For files smaller than 100KB, using quilts is more efficient than individual uploads.

### Question 5.5 (Fill in the Blank)

Complete the following statements:

a) The default number of publisher sub-wallets for concurrent blob registrations is \_\_\_\_\_\_.

b) The publisher sub-wallet count is configured using the `--\_\_\_\_\_\_\_\_\_\_\_\_` flag.

c) Signs of hitting storage node rate limits include HTTP \_\_\_\_\_ responses.

d) A good Cache-Control header for Walrus content is: `public, max-age=31536000, \_\_\_\_\_\_\_\_\_\_`.

### Question 5.6 (Ordering)

Place the following cache layers in order from closest to the user (1) to closest to Walrus storage nodes (6):

\_\_\_ Application-level Redis cache

\_\_\_ CDN edge location

\_\_\_ Nginx cache in front of Aggregator

\_\_\_ User's browser cache

\_\_\_ Walrus Aggregator

\_\_\_ Storage Nodes

### Question 5.7 (Short Answer)

Explain the difference between inter-blob parallelism and intra-blob parallelism. How does each improve upload performance?

### Question 5.8 (Scenario)

You are seeing HTTP 429 responses when pushing concurrency. What two actions should you take to restore throughput?

---

## Section 6: Applied Scenarios

### Question 6.1 (Scenario - Upload Strategy)

You're building a "Perma-Web" documentation site on Walrus. The site consists of:
- 500 HTML files (avg 5KB each)
- 20 CSS/JS files (avg 50KB each)
- 1 large PDF manual (50MB)

How should you structure these uploads for optimal cost and performance?

A) Upload all 521 files as individual blobs.

B) Zip everything into one 55MB blob.

C) Create one Quilt for the HTML/CSS/JS files, and upload the PDF as a separate regular blob.

D) Create one Quilt containing all 521 files.

*Justify your answer.*

### Question 6.2 (Scenario - NFT Marketplace)

You're building an NFT marketplace and need to store metadata for 500 NFTs. Each metadata file is approximately 5KB.

a) Should you use quilts or individual blobs? Justify your answer.

b) If you use quilts, approximately how many quilts would you need to store all 500 files?

c) What are two advantages of using quilts in this scenario?

### Question 6.3 (Scenario - Certification Failure)

During certification you collected signatures from only 60% of voting power. What should you do next, and what resource do you still retain?

### Question 6.4 (Scenario - Retrieval Failure)

A client application uploads a 2GB dataset to Walrus. The upload completes successfully, but 3 months later, users report they cannot retrieve the data.

a) What is the most likely cause of the retrieval failure?

b) How could this have been prevented?

c) If the blob has expired, can it be recovered? Explain.

d) What monitoring or alerting would you recommend to prevent this issue?

### Question 6.5 (Scenario - Fault Tolerance)

During a retrieval of a critical blob, you notice that 300 out of 1000 storage nodes are completely offline.

a) Can you still recover the data?

b) What is the theoretical maximum number of malicious/offline nodes the system can tolerate before data loss?

### Question 6.6 (Scenario - Batch Upload Optimization)

You're optimizing a batch upload system that processes 1,000 files (each 50MB) every hour.

a) Should you use parallel chunking, parallel uploads, or both? Explain.

b) How would you configure the Publisher for optimal throughput?

c) What metrics would you monitor to ensure the system is performing well?

d) How would you handle failures during batch processing to avoid losing progress?

### Question 6.7 (Scenario - Large File Upload)

You need to upload a 10GB video file to Walrus.

a) Should you upload it as a single blob or split it into chunks? Justify your answer.

b) If chunking, what chunk size would you recommend and why?

c) How would you reassemble the chunks after upload? Describe the "manifest file" pattern.

d) What are two performance benefits of chunking in this scenario?

### Question 6.8 (Scenario - Publisher Configuration)

You run a high-throughput publisher with 12 parallel registrations but forgot to adjust wallet config. What setting must change, and what trade-off comes with it?

---

## Answer Key

### Section 1: Upload Transaction Lifecycle

**1.1:**
- 4 - Certification
- 3 - Sealing
- 1 - Encoding
- 2 - Registration

**1.2:**
a) TRUE - Blob ID = f(Merkle root, encoding type, unencoded length)
b) FALSE - Registration creates a blob object with status "Registered", not "Certified"
c) TRUE
d) TRUE
e) FALSE - Nodes verify on-chain registration before signing
f) TRUE - The `BlobCertified` event triggers peer recovery for nodes that missed data

**1.3:**
a) 334 primary slivers, 667 secondary slivers
b) reserve_space
c) BlobRegistered
d) BlobCertified
e) 334

**1.4:**
The storage node performs:
1. **On-Chain Registration Check**: Verifies the blob is registered and paid for on Sui by querying its local index of chain state
2. **Local Storage Check**: Confirms it has all slivers for its assigned shards in local database

Only if both checks pass will the node sign the confirmation.

**1.5:** B) `BlobRegistered`

### Section 2: Transaction Types

**2.1:**
- reserve_space → B
- register_blob → C
- certify_blob → A
- extend_blob → D
- extend_blob_with_resource → E

**2.2:** B) A blob wrapped in a container that allows multiple parties to contribute WAL for extensions

**2.3:**
a) TRUE
b) TRUE (standard retrieval is off-chain and free; certified reads are on-chain and incur fees)
c) TRUE
d) TRUE
e) TRUE

**2.4:** Bundling in a PTB reduces latency and Sui lock contention (one transaction), keeps reserve+register atomic, and cuts gas overhead.

**2.5:** D) When the certificate is posted to Sui blockchain

### Section 3: Quilts

**3.1:** B) Reducing costs and gas fees when storing many small blobs

**3.2:** C) 666 (for 1000 shards: 667 secondary slivers - 1 for index = 666 available for patches)

**3.3:** C) `walrus read-quilt --quilt-id <QuiltBlobId> --identifiers <id>`

**3.4:**
a) FALSE - Individual patches cannot be deleted separately; operations apply to the entire quilt
b) TRUE
c) TRUE
d) TRUE
e) FALSE - QuiltPatchId depends on the entire quilt composition, so different quilts produce different IDs
f) FALSE - Quilts only support quilt-level operations (extend/delete entire quilt)

**3.5:**
a) 64 KB
b) 64 KB
c) 1 (files < 1MB each)
d) mutually exclusive / cannot be used together

**3.6:** A BlobId is a 32-byte hash derived from the blob's content (Merkle root, encoding type, unencoded length) and is used to identify regular blobs. A QuiltPatchId is a composite identifier that includes both the quilt's BlobId and a patch index, used to identify specific blobs within a quilt. Use BlobId for regular blob storage/retrieval. Use QuiltPatchId when retrieving individual patches from within a quilt.

**3.7:** You cannot delete a single patch; create a new quilt without that patch (and optionally delete the old quilt).

### Section 4: Failure Handling

**4.1:**
a) R (Retryable) - Network issues are transient
b) N (Non-Retryable) - Content is permanently blocked
c) N (Non-Retryable) - If expired, cannot recover; if never existed, check blob ID
d) N (Non-Retryable) - Data corruption/encoding error
e) R (Retryable) - Storage nodes may recover
f) R (Retryable) - Rate limiting is temporary, wait and retry
g) N (Non-Retryable) - Client error, fix the request
h) R (Retryable) - Epoch changes are transient
i) R (Retryable) - Temporary unavailability

**4.2:** B) Increasing wait time between retries exponentially (1s, 2s, 4s, 8s...)

**4.3:** B) Writes are idempotent; same content → same BlobId

**4.4:**
a) TRUE
b) TRUE
c) TRUE
d) TRUE
e) FALSE - Once expired, blobs cannot be recovered; storage nodes may garbage collect the data

**4.5:** (1) Prevent thundering herd/synchronized retries; (2) Smooth load and improve success odds under contention.

**4.6:**
Circuit Breaker pattern prevents overwhelming a failing service by "tripping" after repeated failures.

**Three states:**
1. **Closed**: Normal operation, requests flow through, failures counted
2. **Open**: Service considered down, requests fail immediately without attempting
3. **Half-Open**: After timeout, allow one test request to check if service recovered

**Usefulness for aggregators:**
- Prevents wasting requests on a known-failing aggregator
- Allows faster failover to healthy alternatives
- Automatically tests for recovery without manual intervention

**4.7:**
a) Check on-chain state to see if the blob was actually registered and/or certified (query Sui for blob object status).
b) Two fallback strategies: (1) Multi-provider client pattern - try different publishers/aggregators, (2) Local buffer for uploads - store uploads locally until confirmed, then retry if needed.

### Section 5: Performance Optimization

**5.1:** B) 10MB - 100MB

**5.2:** B) Number of sub-wallets configured (`--n-clients`)

**5.3:** B) 334 (≈334 primary slivers for a 1000-shard network)

**5.4:**
a) TRUE
b) FALSE - Intra-blob parallelism refers to parallel sliver distribution within a single blob; inter-blob parallelism is multiple blobs simultaneously
c) TRUE
d) TRUE
e) FALSE - More sub-wallets require more distributed funds; rate limits may still apply
f) TRUE

**5.5:**
a) 8
b) n-clients
c) 429
d) immutable

**5.6:**
- 4 - Application-level Redis cache
- 2 - CDN edge location
- 5 - Nginx cache in front of Aggregator
- 1 - User's browser cache
- 6 - Walrus Aggregator
- 7 - Storage Nodes

(Correct order: 1=Browser, 2=CDN, 3=Redis, 4=Nginx, 5=Aggregator, 6=Storage Nodes)

**5.7:**
**Inter-blob parallelism** refers to uploading multiple independent blobs (or chunks) simultaneously, maximizing network bandwidth utilization. Your application spawns multiple upload tasks (Promise.all).

**Intra-blob parallelism** refers to the parallel distribution of slivers from a single blob across multiple storage nodes, which happens automatically due to erasure coding. SDK handles this automatically via `DistributedUploader`.

Inter-blob parallelism improves throughput by saturating available bandwidth. Intra-blob parallelism ensures no single storage node becomes a bottleneck and enables faster quorum collection.

**5.8:** (1) Reduce concurrency and back off with jitter; (2) Monitor/adjust rate limits or spread load across nodes/publishers.

### Section 6: Applied Scenarios

**6.1:** C) Create one Quilt for the HTML/CSS/JS files, and upload the PDF as a separate regular blob.

*Justification:* The 520 small files fit perfectly in a Quilt (limit 666) and will save massive gas fees/overhead by sharing the metadata cost. The 50MB PDF is too large to benefit significantly from quilting efficiency and should be a standard blob to allow for independent access and management.

**6.2:**
a) Yes, use quilts. With 500 files of 5KB each, quilts will provide significant cost savings (hundreds of times cheaper) compared to individual blob storage due to shared overhead and reduced gas fees.
b) With a limit of 666 patches per quilt, you would need 1 quilt (500 < 666).
c) Two advantages: (1) Massive cost savings - shared metadata overhead and single set of transactions instead of 500, (2) Logical grouping - all NFT metadata for a collection stored together, simplifying management and retrieval.

**6.3:** Retry confirmation collection against other nodes and re-attempt certification; you still hold the `Storage` resource.

**6.4:**
a) Most likely cause: The blob's storage epochs expired and storage nodes garbage collected the data.
b) Prevented by: (1) Setting appropriate initial storage duration, (2) Implementing monitoring/alerting for approaching expiration, (3) Extending storage before expiration, (4) Using longer initial durations for critical data.
c) No, expired blobs cannot be recovered. Once the end_epoch is reached, storage nodes are free to delete the data, and there is no way to restore it.
d) Monitor blob expiration dates, set up alerts 30 days before expiration, implement automated extension for critical blobs, and track storage duration metrics.

**6.5:**
a) Yes. You need 334 shards to reconstruct (on a 1000 shard network). With 700 nodes online, you have plenty of redundancy.
b) Up to 333 nodes (f < n/3) can be Byzantine/malicious. For simple unavailability (crash faults), you can tolerate up to 666 offline nodes as long as you can reach 334 valid shards.

**6.6:**
a) Use both. Parallel chunking for each 50MB file (if beneficial) and parallel uploads for multiple files simultaneously. This maximizes both encoding and network throughput.
b) Configure Publisher with higher `--n-clients` (e.g., 16-32) to allow more concurrent blob registrations. This enables parallel processing of multiple files.
c) Monitor: (1) Upload throughput (MB/s), (2) Success/failure rates, (3) Average upload latency, (4) Storage node response times, (5) Transaction success rates, (6) Queue depth if using a queue system.
d) Implement: (1) Checkpointing - track which files completed successfully, (2) Retry logic with exponential backoff for failed uploads, (3) Idempotent operations - check if blob already exists before uploading, (4) Partial success handling - continue processing remaining files even if some fail, (5) Logging and monitoring for failed uploads.

**6.7:**
a) Split into chunks. 10GB exceeds practical encoding memory requirements and would be inefficient. Chunking enables parallel processing and granular retries.
b) Recommend 50-100MB chunks. This provides good balance between overhead and parallelism, allows efficient encoding, and enables granular retries if one chunk fails.
c) Create a manifest blob that stores the list of blob IDs in order, along with metadata like original filename and total size:
```json
{
    "originalFileName": "video.mp4",
    "totalSize": 10737418240,
    "chunks": [
        { "index": 0, "blobId": "abc123...", "size": 104857600 },
        { "index": 1, "blobId": "def456...", "size": 104857600 },
        ...
    ]
}
```
Upload manifest as a separate blob. To reconstruct: download manifest first, then download chunks in order by index, concatenate.
d) Two benefits: (1) Parallel encoding/uploading of chunks improves throughput 2-4x, (2) If upload fails at 90%, only need to retry failed chunks, not the entire 10GB file.

**6.8:** Increase `--n-clients` (sub-wallets) to at least the desired parallel registrations (12+); trade-off is more SUI/WAL fragmented across sub-wallets.

