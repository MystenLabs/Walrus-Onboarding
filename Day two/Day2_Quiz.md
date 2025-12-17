# Day 2 Comprehensive Quiz: Advanced Walrus Operations

This consolidated quiz covers Modules 8-14 from Day 2 of the Walrus Training Program, focusing on operational reasoning, upload transaction lifecycle, transaction types, quilts, failure handling, performance optimization, and applied scenarios.

``**Format:** All questions are multiple-choice with 4 options. Questions may have 1 or 2 correct answers as indicated.

---

## Index

| Section | Topic | Questions |
|---------|-------|-----------|
| [Section 1](#section-1-publishers-and-aggregators) | Publishers and Aggregators | 1.1 – 1.10 |
| [Section 2](#section-2-upload-transaction-lifecycle) | Upload Transaction Lifecycle | 2.1 – 2.10 |
| [Section 3](#section-3-transaction-types) | Transaction Types | 3.1 – 3.8 |
| [Section 4](#section-4-quilts) | Quilts | 4.1 – 4.10 |
| [Section 5](#section-5-failure-handling) | Failure Handling | 5.1 – 5.10 |
| [Section 6](#section-6-performance-optimization) | Performance Optimization | 6.1 – 6.10 |
| [Section 7](#section-7-applied-scenarios) | Applied Scenarios | 7.1 – 7.10 |
| [Answer Key](#answer-key) | All Answers | — |

**Total Questions:** 70 questions across 7 sections

**Estimated Time:** 60-90 minutes

---

## Section 1: Publishers and Aggregators

### Question 1.1 (Select ONE)

Which description best captures the **division of responsibility** between a Publisher and an Aggregator in a production Walrus deployment?

A) Publisher and Aggregator both handle uploads and downloads interchangeably

B) Publisher focuses on **encode + upload**; Aggregator focuses on **fetch + reconstruct**

C) Publisher talks only to Sui; Aggregator talks only to Storage Nodes

D) Publisher is optional; Aggregator is required for any reads

### Question 1.2 (Select ONE)

Which statement about Publishers is TRUE?

A) Publishers are required infrastructure that must be run by Walrus core team

B) Publishers are considered "trusted" infrastructure - no client verification needed

C) Publishers are "untrusted" infrastructure - clients must verify their work via BlobIds

D) Publishers don't require any wallet or tokens to operate

### Question 1.3 (Select ONE)

Which statement about Aggregators is TRUE?

A) Aggregators require a wallet with WAL tokens to operate

B) Aggregators are read-only and don't require a wallet

C) Aggregators can only be run by Walrus core team

D) Aggregators handle both uploads and downloads

### Question 1.4 (Select ONE)

What happens during an epoch transition for Publishers and Aggregators?

A) They automatically handle the committee change without any impact

B) There may be brief delays (1-2 seconds) during the transition

C) They require manual restart to recognize the new epoch

D) All operations fail until the next epoch begins

### Question 1.5 (Select ONE)

What is the default number of sub-wallets for a Publisher?

A) 4

B) 8

C) 16

D) 32

### Question 1.6 (Select ONE)

To increase Publisher concurrency, which parameter should you configure?

A) `--max-threads`

B) `--n-clients`

C) `--concurrency`

D) `--wallet-count`

### Question 1.7 (Select TWO)

Which metrics should you monitor for Publishers in production? (Select TWO)

A) Request rate and error rate (4xx/5xx responses)

B) Number of Sui validators online

C) Upload latency (p50, p95, p99 percentiles)

D) Aggregator cache hit ratio

### Question 1.8 (Select ONE)

A Publisher starts returning HTTP 500 errors with logs showing "No space left on device". This is:

A) A transient failure that will resolve automatically

B) A permanent failure until disk space is freed

C) A network connectivity issue

D) A rate limiting response from storage nodes

### Question 1.9 (Select TWO)

After fixing a disk space issue on a Publisher, what validation checks should you perform? (Select TWO)

A) Check service status and review logs to confirm errors stopped

B) Restart all storage nodes in the network

C) Run a small test upload and verify a valid BlobId is returned

D) Wait for the next epoch transition

### Question 1.10 (Select ONE)

Your Publisher logs errors about being "behind current epoch". What should happen automatically?

A) The Publisher shuts down and requires manual restart

B) The Publisher detects the epoch change and refreshes committee from Sui RPC

C) Storage nodes push the new configuration to the Publisher

D) The error persists until the next epoch begins

---

## Section 2: Upload Transaction Lifecycle

### Question 2.1 (Select ONE)

What is the FIRST phase in the Walrus blob upload lifecycle?

A) Registration (create Blob object on Sui)

B) Certification (submit aggregated signatures to Sui)

C) Encoding (split blob into slivers using RS coding)

D) Sealing (upload slivers to storage nodes)

### Question 2.2 (Select ONE)

What is the CORRECT order of the upload lifecycle phases?

A) Registration → Encoding → Sealing → Certification

B) Encoding → Registration → Sealing → Certification

C) Encoding → Sealing → Registration → Certification

D) Registration → Sealing → Encoding → Certification

### Question 2.3 (Select ONE)

What event indicates that a blob has reached its "point of availability" and is guaranteed to be retrievable?

A) When the client receives the blob ID

B) When encoding is complete

C) When the `BlobCertified` event is emitted on Sui

D) When all storage nodes have confirmed receipt

### Question 2.4 (Select TWO)

Which statements about blob IDs are TRUE? (Select TWO)

A) The blob ID is derived from the Merkle root, encoding type, and unencoded length

B) The blob ID is randomly generated by the Publisher

C) The blob ID changes each time the same content is uploaded

D) The blob ID can be computed before any on-chain transaction

### Question 2.5 (Select ONE)

When registration creates a blob object on Sui, what is the initial status?

A) "Pending"

B) "Registered"

C) "Certified"

D) "Sealed"

### Question 2.6 (Select ONE)

For a network with 1000 shards, how many primary and secondary slivers are created during encoding?

A) 500 primary, 500 secondary

B) 334 primary, 666 secondary

C) 334 primary, 667 secondary

D) 667 primary, 333 secondary

### Question 2.7 (Select ONE)

How many slivers are needed to reconstruct a blob on a 1000-shard network?

A) 1000 (all slivers)

B) 667 (2/3 of slivers)

C) 500 (half of slivers)

D) 334 (minimum threshold)

### Question 2.8 (Select TWO)

What checks does a storage node perform before signing a storage confirmation? (Select TWO)

A) Verifies the blob is registered and paid for on Sui

B) Confirms it has all required slivers in local storage

C) Validates the client's wallet balance

D) Checks that all other storage nodes have received their slivers

### Question 2.9 (Select ONE)

If only 650 storage nodes respond with signatures (instead of the required 667+), what happens?

A) Certification succeeds with reduced redundancy

B) Certification fails due to insufficient quorum

C) The upload is automatically retried from the beginning

D) Storage nodes redistribute the slivers

### Question 2.10 (Select ONE)

After `certify_blob` is called, what happens to storage nodes that missed the upload?

A) They are excluded from future uploads

B) They automatically sync from peers (triggered by BlobCertified event)

C) They require manual intervention to receive the data

D) The blob becomes unavailable until they catch up

---

## Section 3: Transaction Types

### Question 3.1 (Select ONE)

What is the primary purpose of the `reserve_space` transaction?

A) Associates a blob ID with reserved storage space

B) Purchases storage capacity for a specific size and duration

C) Finalizes blob storage by posting aggregated signatures

D) Extends storage by paying additional WAL tokens

### Question 3.2 (Select ONE)

What is the primary purpose of the `register_blob` transaction?

A) Purchases storage capacity for a specific size and duration

B) Associates a blob ID with reserved storage space

C) Finalizes blob storage by posting aggregated signatures

D) Extends storage by merging with an existing Storage object

### Question 3.3 (Select ONE)

What is the primary purpose of the `certify_blob` transaction?

A) Creates the initial blob record on Sui

B) Reserves storage space for the blob

C) Finalizes blob storage by posting aggregated signatures

D) Extends the blob's storage duration

### Question 3.4 (Select ONE)

Which operation incurs NO gas fees or WAL costs?

A) `register_blob`

B) `extend_blob`

C) `readBlob` (standard retrieval)

D) `certify_blob`

### Question 3.5 (Select TWO)

Which statements about blob extension are TRUE? (Select TWO)

A) Extensions must happen before the blob expires

B) Expired blobs can be recovered by paying back storage fees

C) Re-using returned Storage objects is cheaper than converting them to WAL

D) Extensions can only be done once per blob

### Question 3.6 (Select ONE)

What is the difference between `extend_blob` and `extend_blob_with_resource`?

A) `extend_blob` is free; `extend_blob_with_resource` costs WAL

B) `extend_blob` pays WAL directly; `extend_blob_with_resource` merges with existing Storage

C) `extend_blob` is for small blobs; `extend_blob_with_resource` is for large blobs

D) They are identical in function and cost

### Question 3.7 (Select ONE)

Why are `reserve_space` and `register_blob` often bundled into a single PTB?

A) To reduce the number of wallet signatures required

B) To keep uploads atomic and prevent partial state

C) To bypass storage node validation

D) To enable larger blob sizes

### Question 3.8 (Select ONE)

Comparing storing a file for 10 epochs upfront vs. 5 epochs then extending 5 more - which is more cost-effective?

A) The 5+5 approach saves on storage costs

B) Upfront reservation avoids multiple gas fees

C) Both approaches cost exactly the same

D) The 5+5 approach is cheaper due to price fluctuations

---

## Section 4: Quilts

### Question 4.1 (Select ONE)

What is the primary problem that quilts solve?

A) Storing blobs larger than 13.3 GiB

B) Reducing costs and gas fees when storing many small blobs

C) Enabling faster retrieval of individual blobs

D) Providing automatic encryption for stored data

### Question 4.2 (Select ONE)

What is the maximum number of patches that can be stored in a single QuiltV1 (for a 1000-shard network)?

A) 334

B) 500

C) 666

D) 1000

### Question 4.3 (Select ONE)

Can individual patches within a quilt be deleted separately from the quilt?

A) Yes, patches can be individually deleted at any time

B) Yes, but only before the quilt is certified

C) No, operations apply to the entire quilt

D) No, but patches can be marked as "hidden"

### Question 4.4 (Select TWO)

Which statements about QuiltPatchId are TRUE? (Select TWO)

A) It is a composite identifier including the quilt's BlobId and a patch index

B) The same file in two different quilts will have the same QuiltPatchId

C) QuiltPatchId depends on the entire quilt composition

D) QuiltPatchId is assigned randomly when the quilt is created

### Question 4.5 (Select ONE)

Where is quilt metadata (identifiers and tags) stored?

A) On-chain in a Sui object

B) Within the quilt structure itself (off-chain)

C) In a separate metadata blob

D) Distributed across storage nodes as separate slivers

### Question 4.6 (Select ONE)

What is the identifier size limit for a quilt?

A) 16 KB

B) 32 KB

C) 64 KB

D) 128 KB

### Question 4.7 (Select ONE)

Which CLI command retrieves a specific patch from a quilt?

A) `walrus read-blob`

B) `walrus read-quilt`

C) `walrus get-patch`

D) `walrus retrieve`

### Question 4.8 (Select ONE)

Quilts are best suited for files smaller than:

A) 100 KB

B) 1 MB

C) 10 MB

D) 100 MB

### Question 4.9 (Select ONE)

If 5,000 files cost 0.06 WAL each individually, and quilts reduce cost by ~100x, approximately how much WAL do you save?

A) 150 WAL

B) 200 WAL

C) 297 WAL

D) 350 WAL

### Question 4.10 (Select ONE)

You uploaded 500 JSON files into a quilt and discover one entry is invalid. What is the practical solution?

A) Delete just that patch from the quilt

B) Overwrite the patch with corrected data

C) Create a new quilt with corrected data and all valid patches

D) Mark the patch as deprecated in the quilt metadata

---

## Section 5: Failure Handling

### Question 5.1 (Select ONE)

Network timeout while uploading slivers to a storage node is:

A) Non-retryable - the upload must be restarted

B) Retryable - network issues are transient

C) Fatal - the blob ID becomes invalid

D) Permanent - requires manual intervention

### Question 5.2 (Select ONE)

`BlobBlockedError` (content blocked by storage nodes) is:

A) Retryable - try again with different nodes

B) Non-retryable - content is permanently blocked

C) Retryable - wait and try after epoch change

D) Non-retryable - but can be appealed on-chain

### Question 5.3 (Select ONE)

`InconsistentBlobError` (reconstructed data doesn't match blob ID) indicates:

A) A temporary network issue that will resolve

B) Data corruption - the data should NOT be used

C) Rate limiting from storage nodes

D) An expired blob that needs extension

### Question 5.4 (Select ONE)

HTTP 429 "Too Many Requests" is:

A) Non-retryable - reduce your usage permanently

B) Retryable - rate limiting is temporary

C) Fatal - the client is banned

D) Non-retryable - requires API key upgrade

### Question 5.5 (Select ONE)

What is exponential backoff with jitter?

A) Retrying immediately with increasing frequency

B) Increasing wait time exponentially (1s, 2s, 4s...) with random variation

C) Reducing retry attempts over time

D) Using multiple backup systems simultaneously

### Question 5.6 (Select ONE)

Which statement about Walrus writes is correct?

A) Writes are not idempotent; re-uploads change the BlobId

B) Writes are idempotent; same content → same BlobId

C) Writes are idempotent only for quilts

D) Writes are idempotent only within one epoch

### Question 5.7 (Select TWO)

Why should jitter be added to exponential backoff? (Select TWO)

A) Prevents thundering herd / synchronized retries

B) Increases the base delay time

C) Smooths load over time, improving success probability

D) Reduces the total number of retry attempts

### Question 5.8 (Select ONE)

In the Circuit Breaker pattern, what happens in the "Open" state?

A) Requests flow through normally

B) Requests fail immediately without attempting

C) One test request is allowed through

D) All requests are queued for later

### Question 5.9 (Select ONE)

After a blob expires, can it be recovered by paying storage fees?

A) Yes, within a 30-day grace period

B) Yes, if any storage node still has the data

C) No, storage nodes may have garbage collected the data

D) No, but the BlobId can be reused for new content

### Question 5.10 (Select ONE)

`BehindCurrentEpochError` is:

A) Non-retryable - requires manual epoch sync

B) Retryable - SDK/Publisher automatically refreshes committee state

C) Fatal - the client must restart

D) Non-retryable - wait for next epoch

---

## Section 6: Performance Optimization

### Question 6.1 (Select ONE)

What is the recommended chunk size range for parallel chunking of large files?

A) 1MB - 5MB

B) 10MB - 100MB

C) 100MB - 500MB

D) 500MB - 1GB

### Question 6.2 (Select ONE)

Parallel chunking enables what level of throughput improvement for large uploads?

A) 1.2-1.5x

B) 2-4x

C) 5-10x

D) 10-20x

### Question 6.3 (Select ONE)

What does "intra-blob parallelism" refer to?

A) Uploading multiple blobs simultaneously

B) Parallel sliver distribution within a single blob

C) Reading from multiple aggregators at once

D) Parallel encoding across multiple CPUs

### Question 6.4 (Select ONE)

Why are blob IDs ideal for caching?

A) They expire after a fixed time

B) They are immutable (no invalidation needed)

C) They are short and easy to store

D) They include version information

### Question 6.5 (Select ONE)

What HTTP response code indicates you're hitting storage node rate limits?

A) 400

B) 403

C) 429

D) 503

### Question 6.6 (Select ONE)

What is a good Cache-Control header for Walrus content?

A) `no-cache, no-store`

B) `public, max-age=3600`

C) `public, max-age=31536000, immutable`

D) `private, must-revalidate`

### Question 6.7 (Select ONE)

In the cache layer hierarchy, which is closest to the user?

A) CDN edge location

B) User's browser cache

C) Application-level Redis cache

D) Nginx cache in front of Aggregator

### Question 6.8 (Select TWO)

When seeing HTTP 429 responses, what immediate actions should you take? (Select TWO)

A) Reduce concurrency / request rate

B) Increase the number of parallel requests

C) Implement or increase backoff with jitter

D) Switch to a different blob encoding

### Question 6.9 (Select ONE)

For a batch uploader processing 1,000 x 50MB files hourly, what `--n-clients` range is appropriate?

A) 2-4

B) 8-32

C) 64-128

D) 256-512

### Question 6.10 (Select TWO)

To make a batch upload system resilient to partial failures, you should: (Select TWO)

A) Track per-file status and commit each successful BlobId

B) Upload all files before recording any BlobIds

C) Design the job to resume from the last successful file

D) Retry the entire batch if any file fails

---

## Section 7: Applied Scenarios

### Question 7.1 (Select ONE)

For a documentation site with 400 HTML files (5KB each), 40 CSS/JS files (50KB each), and 2 PDFs (100MB each), the best upload strategy is:

A) Store everything in one large quilt

B) Store HTML/CSS/JS in quilts; store PDFs as individual blobs

C) Store everything as individual blobs for maximum flexibility

D) Store PDFs in quilts; store HTML/CSS/JS individually

### Question 7.2 (Select ONE)

For an NFT project with 10,000 items (500KB image + 2KB metadata each), should you use quilts for the images?

A) Yes, quilts are ideal for all NFT assets

B) No, 500KB images are too large for quilt benefits

C) Yes, but only if images are compressed first

D) No, because images cannot be stored in quilts

### Question 7.3 (Select ONE)

For the same NFT project, how many quilts are needed for all 10,000 metadata files (2KB each)?

A) 10 quilts

B) 16 quilts

C) 20 quilts

D) 30 quilts

### Question 7.4 (Select ONE)

How can a buyer verify that an NFT image on Walrus hasn't been swapped?

A) Check the upload timestamp on Sui

B) Verify the BlobId matches what's stored in the NFT smart contract

C) Request a signed certificate from the storage nodes

D) Compare with a backup stored off-chain

### Question 7.5 (Select ONE)

A 2GB dataset uploaded 3 months ago is now unretrievable. The most likely cause is:

A) Storage nodes experienced data corruption

B) The blob's storage epochs expired

C) The aggregator endpoint changed

D) Network congestion is preventing retrieval

### Question 7.6 (Select ONE)

If 300 out of 1000 storage nodes are offline, can you recover data from a certified blob?

A) No, more than 25% node failure causes data loss

B) Yes, you only need 334 slivers to reconstruct

C) No, you need at least 667 nodes online

D) Yes, but only if the nodes went offline recently

### Question 7.7 (Select ONE)

What is the theoretical maximum number of Byzantine/malicious nodes Walrus can tolerate (1000-shard network)?

A) 100 nodes

B) 333 nodes

C) 500 nodes

D) 666 nodes

### Question 7.8 (Select ONE)

For uploading a 10GB video file, the recommended approach is:

A) Upload as a single blob - simpler to manage

B) Split into 50-100MB chunks with a manifest file

C) Convert to a quilt for better compression

D) Split into 1MB chunks for maximum parallelism

### Question 7.9 (Select TWO)

What are the benefits of chunking large files? (Select TWO)

A) Parallel encoding/uploading improves throughput

B) Chunks are automatically deduplicated

C) Failed chunks can be retried without re-uploading everything

D) Chunks are stored with higher redundancy

### Question 7.10 (Select TWO)

A video streaming platform stores 2GB videos as single blobs, 1KB metadata individually, uses single aggregator, and has no caching. Which are problems? (Select TWO)

A) Single 2GB blobs - failures require full re-upload

B) Single aggregator - no redundancy for failures

C) 1KB metadata individually - this is the optimal approach

D) No caching - acceptable for streaming platforms

---

## Answer Key

### Section 1: Publishers and Aggregators

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 1.1 | B | Publisher handles encode + upload; Aggregator handles fetch + reconstruct |
| 1.2 | C | Publishers are untrusted; clients verify via BlobIds |
| 1.3 | B | Aggregators are read-only and don't require a wallet |
| 1.4 | B | Brief delays (1-2 seconds) may occur during transitions |
| 1.5 | B | Default is 8 sub-wallets |
| 1.6 | B | `--n-clients` parameter controls concurrency |
| 1.7 | A, C | Monitor request/error rates and latency percentiles |
| 1.8 | B | Disk space is a permanent failure until resolved |
| 1.9 | A, C | Check service status and run test upload |
| 1.10 | B | Automatic epoch detection and committee refresh |

### Section 2: Upload Transaction Lifecycle

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 2.1 | C | Encoding is the first phase |
| 2.2 | B | Encoding → Registration → Sealing → Certification |
| 2.3 | C | `BlobCertified` event signals availability |
| 2.4 | A, D | BlobId is derived from content and computable pre-transaction |
| 2.5 | B | Initial status is "Registered" |
| 2.6 | C | 334 primary + 667 secondary slivers |
| 2.7 | D | Only 334 slivers needed for reconstruction |
| 2.8 | A, B | Checks on-chain registration and local storage |
| 2.9 | B | 667 signatures required; 650 fails quorum |
| 2.10 | B | BlobCertified triggers peer recovery sync |

### Section 3: Transaction Types

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 3.1 | B | reserve_space purchases storage capacity |
| 3.2 | B | register_blob associates blob ID with storage |
| 3.3 | C | certify_blob posts aggregated signatures |
| 3.4 | C | Standard readBlob is free and off-chain |
| 3.5 | A, C | Extensions before expiry; reusing Storage is cheaper |
| 3.6 | B | extend_blob pays WAL; extend_blob_with_resource merges Storage |
| 3.7 | B | Bundling keeps uploads atomic |
| 3.8 | B | Upfront avoids multiple gas fees |

### Section 4: Quilts

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 4.1 | B | Quilts reduce costs for many small blobs |
| 4.2 | C | 666 patches maximum (667 secondary - 1 for index) |
| 4.3 | C | Operations apply to entire quilt |
| 4.4 | A, C | Composite ID depends on quilt composition |
| 4.5 | B | Metadata stored within quilt structure |
| 4.6 | C | 64 KB identifier limit |
| 4.7 | B | `walrus read-quilt` command |
| 4.8 | B | Best for files < 1 MB |
| 4.9 | C | 5000 × 0.06 = 300; 300 - 3 = 297 WAL saved |
| 4.10 | C | Create new quilt with corrected data |

### Section 5: Failure Handling

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 5.1 | B | Network timeouts are transient/retryable |
| 5.2 | B | Blocked content is permanently non-retryable |
| 5.3 | B | Data corruption - do not use the data |
| 5.4 | B | Rate limiting is temporary |
| 5.5 | B | Exponential increase with random variation |
| 5.6 | B | Same content always produces same BlobId |
| 5.7 | A, C | Prevents thundering herd; smooths load |
| 5.8 | B | Open state fails requests immediately |
| 5.9 | C | Expired data may be garbage collected |
| 5.10 | B | Automatically refreshes committee state |

### Section 6: Performance Optimization

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 6.1 | B | 10MB - 100MB is recommended |
| 6.2 | B | 2-4x throughput improvement |
| 6.3 | B | Parallel sliver distribution within one blob |
| 6.4 | B | Immutable = no cache invalidation needed |
| 6.5 | C | HTTP 429 indicates rate limiting |
| 6.6 | C | Long max-age with immutable flag |
| 6.7 | B | Browser cache is closest to user |
| 6.8 | A, C | Reduce concurrency and add backoff |
| 6.9 | B | 8-32 clients for this workload |
| 6.10 | A, C | Track status and enable resume |

### Section 7: Applied Scenarios

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 7.1 | B | Quilts for small files; individual blobs for large PDFs |
| 7.2 | B | 500KB images too large for quilt benefits |
| 7.3 | B | 10,000 ÷ 666 = 15.01 → 16 quilts needed |
| 7.4 | B | BlobId is content hash; verify against contract |
| 7.5 | B | Storage epochs expired |
| 7.6 | B | Only 334 slivers needed; 700 available |
| 7.7 | B | f < n/3, so max 333 Byzantine nodes |
| 7.8 | B | 50-100MB chunks with manifest |
| 7.9 | A, C | Parallel upload and granular retries |
| 7.10 | A, B | Large single blobs and single aggregator are problems |

---

## Scoring Guide

| Section | Questions | Points per Question | Total Points |
|---------|-----------|---------------------|--------------|
| Section 1: Publishers and Aggregators | 10 | 2 | 20 |
| Section 2: Upload Transaction Lifecycle | 10 | 2 | 20 |
| Section 3: Transaction Types | 8 | 2 | 16 |
| Section 4: Quilts | 10 | 2 | 20 |
| Section 5: Failure Handling | 10 | 2 | 20 |
| Section 6: Performance Optimization | 10 | 2 | 20 |
| Section 7: Applied Scenarios | 10 | 2 | 20 |
| **Total** | **68** | — | **136** |

**Scoring for "Select TWO" questions:**
- Both correct: 2 points
- One correct: 1 point
- None correct: 0 points

**Passing Score:** 95/136 (70%)
