# Day 2 Comprehensive Quiz: Advanced Walrus Operations

This consolidated quiz covers Modules 8-14 from Day 2 of the Walrus Training Program, focusing on operational reasoning, upload transaction lifecycle, transaction types, quilts, failure handling, performance optimization, and applied scenarios.

---

## Index

| Section | Topic | Questions | Question Types |
|---------|-------|-----------|----------------|
| [Section 1](#section-1-publishers-and-aggregators) | Publishers and Aggregators | 1.1 – 1.6 | MC, T/F, Fill-in, Short Answer, Scenario |
| [Section 2](#section-2-upload-transaction-lifecycle) | Upload Transaction Lifecycle | 2.1 – 2.6 | Ordering, MC, T/F, Fill-in, Short Answer, Scenario |
| [Section 3](#section-3-transaction-types) | Transaction Types | 3.1 – 3.5 | Matching, MC, T/F, Short Answer |
| [Section 4](#section-4-quilts) | Quilts | 4.1 – 4.7 | MC, T/F, Fill-in, Matching, Short Answer, Scenario |
| [Section 5](#section-5-failure-handling) | Failure Handling | 5.1 – 5.6 | Classification, MC, T/F, Short Answer |
| [Section 6](#section-6-performance-optimization) | Performance Optimization | 6.1 – 6.6 | MC, T/F, Fill-in, Ordering, Short Answer, Scenario |
| [Section 7](#section-7-applied-scenarios) | Applied Scenarios | 7.1 – 7.6 | Scenario-based (various) |
| [Answer Key](#answer-key) | All Answers | — | — |

**Total Questions:** 42 questions across 7 sections

**Estimated Time:** 60-90 minutes

---

## Section 1: Publishers and Aggregators

### Question 1.1 (Multiple Choice)

Which description best captures the **division of responsibility** between a Publisher and an Aggregator in a production Walrus deployment?

A) Publisher and Aggregator both handle uploads and downloads interchangeably

B) Publisher focuses on **encode + upload**; Aggregator focuses on **fetch + reconstruct**

C) Publisher talks only to Sui; Aggregator talks only to Storage Nodes

D) Publisher is optional; Aggregator is required for any reads

### Question 1.2 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Publishers and Aggregators are **optional** infrastructure that can be run by application teams or third parties.

b) \_\_\_ Publishers are considered "untrusted" infrastructure - clients must verify their work.

c) \_\_\_ An Aggregator requires a wallet with WAL tokens to operate.

d) \_\_\_ During an epoch transition, Publishers and Aggregators automatically handle the committee change without any client impact.

e) \_\_\_ The `walrus daemon` command runs both a publisher and an aggregator on the same port.

### Question 1.3 (Fill in the Blank)

Complete the following statements:

a) The default number of sub-wallets for a Publisher is \_\_\_\_\_\_\_\_, which limits concurrent blob registrations.

b) To increase Publisher concurrency, you configure the `\_\_\_\_\_\_\_\_` parameter when starting the service.

c) During epoch transitions, you should expect to see \_\_\_\_\_\_\_\_ synchronization messages in the logs.

### Question 1.4 (Short Answer)

Name **three metrics or signals** you would monitor for both Publishers and Aggregators in a production deployment to catch issues early.

### Question 1.5 (Scenario)

You operate a Publisher in production. Suddenly, upload requests begin returning HTTP 500 errors. In logs you see repeated:

```text
ERROR: Failed to write encoded blob: No space left on device
```

**Questions:**

a) Is this more likely a **transient** or **permanent** failure? Why?

b) List **two immediate remediation steps** you should take on this host.

c) After remediation, what **validation checks** would you perform before re-opening traffic to this Publisher?

### Question 1.6 (Short Answer)

During an epoch transition, your Publisher starts logging errors about being **"behind current epoch"** and uploads intermittently fail.

a) At a high level, what is happening?

b) What should the Publisher do automatically to recover?

c) As an operator, what checks or alerts would you put in place around epoch transitions?

---

## Section 2: Upload Transaction Lifecycle

### Question 2.1 (Ordering)

Place the following phases of the Walrus blob upload lifecycle in the correct order (1-4):

\_\_\_ Certification (submit aggregated signatures to Sui)

\_\_\_ Sealing (upload slivers to storage nodes)

\_\_\_ Encoding (split blob into slivers using RS coding)

\_\_\_ Registration (create Blob object on Sui)

### Question 2.2 (Multiple Choice)

What event indicates that a blob has reached its "point of availability" and is guaranteed to be retrievable?

A) When the client receives the blob ID

B) When encoding is complete

C) When the `BlobCertified` event is emitted on Sui

D) When all storage nodes have confirmed receipt

### Question 2.3 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ The blob ID is derived from the Merkle root, encoding type, and unencoded length.

b) \_\_\_ Registration creates a blob object on Sui with status "Certified".

c) \_\_\_ Storage nodes verify that a blob is registered on-chain before signing storage confirmations.

d) \_\_\_ Certification requires collecting signatures from at least 2/3 of voting power (2f+1).

e) \_\_\_ After `certify_blob` is called, storage nodes that missed the upload will automatically sync from peers.

f) \_\_\_ During retrieval, the client needs all $n$ slivers to reconstruct the original blob.

### Question 2.4 (Fill in the Blank)

Complete the following statements about the upload lifecycle:

a) During encoding, a blob is split into \_\_\_\_\_\_\_\_ primary slivers and \_\_\_\_\_\_\_\_ secondary slivers (for a network with 1000 shards).

b) The \_\_\_\_\_\_\_\_\_\_\_\_\_\_ transaction reserves storage space and pays WAL tokens.

c) The on-chain event that signals "blob is now available for reads" is `\_\_\_\_\_\_\_\_\_\_\_\_\_\_`.

d) For a 1000-shard network, the minimum slivers needed for reconstruction is \_\_\_\_\_\_\_\_.

e) To keep uploads atomic, `reserve_space` and `register_blob` are usually bundled in a single \_\_\_\_\_\_\_\_.

### Question 2.5 (Short Answer)

A storage node receives a `compute_storage_confirmation` request. Describe the two critical checks it performs before signing the confirmation.

### Question 2.6 (Scenario)

A client uploads a 500 MB file to Walrus. The upload process completes registration and slivers were uploaded to all 1000 storage nodes, but only 650 storage nodes responded with signatures (instead of the expected 667+).

**Questions:**

a) Will the certification transaction succeed? Why or why not?

b) If certification fails, what should the client do?

c) What could cause fewer signatures than expected, and is this a fundamental problem?

---

## Section 3: Transaction Types

### Question 3.1 (Matching)

Match each transaction type to its primary purpose:

**Transaction Types:**
1. `reserve_space`
2. `register_blob`
3. `certify_blob`
4. `extend_blob`
5. `extend_blob_with_resource`

**Purposes:**
A) Finalizes blob storage by posting aggregated signatures
B) Purchases storage capacity for a specific size and duration
C) Associates a blob ID with reserved storage space
D) Extends storage by paying additional WAL tokens
E) Extends storage by merging with an existing Storage object

\_\_\_ `reserve_space` → \_\_\_

\_\_\_ `register_blob` → \_\_\_

\_\_\_ `certify_blob` → \_\_\_

\_\_\_ `extend_blob` → \_\_\_

\_\_\_ `extend_blob_with_resource` → \_\_\_

### Question 3.2 (Multiple Choice)

Which of the following operations incurs NO gas fees or WAL costs?

A) `register_blob`

B) `extend_blob`

C) `readBlob` (standard retrieval)

D) `certify_blob`

### Question 3.3 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Extensions must happen before the blob expires; once expired, blobs cannot be recovered.

b) \_\_\_ Standard retrieval operations (`readBlob`) are free and off-chain.

c) \_\_\_ The `register_blob` and `reserve_space` transactions are often batched into a single PTB.

d) \_\_\_ Certified reads require on-chain verification and incur gas fees.

e) \_\_\_ Re-using returned `Storage` objects is cheaper than converting them back to WAL.

### Question 3.4 (Short Answer)

Explain the difference between extending a blob using `extend_blob` vs `extend_blob_with_resource`. When would you use each approach?

### Question 3.5 (Short Answer)

You need to store a file for 10 epochs. Compare:
- Reserving storage for 10 epochs upfront during registration
- Reserving for 5 epochs initially, then extending for 5 more epochs later

Which approach is more cost-effective and why?

---

## Section 4: Quilts

### Question 4.1 (Multiple Choice)

What is the primary problem that quilts solve?

A) Storing blobs larger than 13.3 GiB

B) Reducing costs and gas fees when storing many small blobs

C) Enabling faster retrieval of individual blobs

D) Providing automatic encryption for stored data

### Question 4.2 (Multiple Choice)

What is the maximum number of patches (blobs) that can be stored in a single QuiltV1 (for a network with 1000 shards)?

A) 334

B) 500

C) 666

D) 1000

### Question 4.3 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Quilts allow individual patches to be deleted separately from the quilt.

b) \_\_\_ QuiltPatchId is a composite identifier that includes both the quilt's BlobId and a patch index.

c) \_\_\_ The same file uploaded to two different quilts will have the same QuiltPatchId.

d) \_\_\_ Quilts store metadata (identifiers and tags) within the quilt structure, not on-chain.

e) \_\_\_ Sliver alignment in quilts allows retrieving individual patches without downloading the entire quilt.

f) \_\_\_ Individual patches within a quilt can be extended independently.

### Question 4.4 (Fill in the Blank)

Complete the following statements about quilts:

a) Quilt identifier size limit: \_\_\_\_\_\_ KB

b) Total tags size (all patches combined) limit: \_\_\_\_\_\_ KB

c) Quilts are best suited for files smaller than \_\_\_\_\_\_ MB each.

d) To read a specific patch from a quilt, you should use the `\_\_\_\_\_\_\_\_` CLI command.

### Question 4.5 (Matching)

Match the identifier type to its definition:

**Identifier Types:**
1. `BlobId`
2. `QuiltPatchId`
3. `Identifier` (in Quilt)

**Definitions:**
A) A human-readable name (e.g., "config.json") stored within a quilt's metadata
B) A content-derived hash that uniquely identifies a standard blob or an entire quilt container
C) A composite ID that depends on the quilt's composition and points to a specific patch inside it

\_\_\_ `BlobId` → \_\_\_

\_\_\_ `QuiltPatchId` → \_\_\_

\_\_\_ `Identifier` → \_\_\_

### Question 4.6 (Short Answer)

You have a collection of 5,000 metadata JSON files (2KB each) for an NFT project.

a) If storing them individually costs ~0.06 WAL each, and storing them as quilts reduces cost by ~100x, roughly how much WAL do you save?

b) If you need to update *one* specific JSON file next week, can you do it within the existing Quilt? Why or why not?

### Question 4.7 (Scenario)

You uploaded 500 small NFT metadata JSON files into a single quilt. Later you discover that **one** of the entries is invalid and must be removed.

a) Can you delete or overwrite just that single patch inside the existing quilt? Why or why not?

b) What is the **practical migration strategy** for fixing this one file while preserving the rest?

c) How would you avoid this kind of problem in future quilt-based workflows?

---

## Section 5: Failure Handling

### Question 5.1 (Classification)

Classify each error as RETRYABLE (R) or NON-RETRYABLE (N):

a) \_\_\_ Network timeout while uploading slivers to a node

b) \_\_\_ `BlobBlockedError` - Content blocked by storage nodes

c) \_\_\_ `BlobNotCertifiedError` - Blob doesn't exist or expired

d) \_\_\_ `InconsistentBlobError` - Reconstructed data doesn't match blob ID

e) \_\_\_ `NotEnoughSliversReceivedError` - SDK couldn't retrieve enough slivers

f) \_\_\_ HTTP 429 Too Many Requests

g) \_\_\_ HTTP 400 due to oversized metadata

h) \_\_\_ `BehindCurrentEpochError`

i) \_\_\_ `NotCurrentlyRegistered` - expired storage

### Question 5.2 (Multiple Choice)

What is exponential backoff with jitter?

A) Retrying immediately with increasing frequency

B) Increasing wait time between retries exponentially (1s, 2s, 4s, 8s...) with random variation

C) Reducing retry attempts over time

D) Using multiple backup systems simultaneously

### Question 5.3 (Multiple Choice)

Which statement about Walrus writes is correct?

A) Writes are not idempotent; re-uploads change the BlobId

B) Writes are idempotent; same content → same BlobId

C) Writes are idempotent only for quilts

D) Writes are idempotent only if retries happen within one epoch

### Question 5.4 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ The SDK automatically handles retries for high-level methods like `readBlob` and `writeBlob`.

b) \_\_\_ Jitter should be added to retry delays to avoid synchronized retries from multiple clients.

c) \_\_\_ You only need 2f+1 slivers to reconstruct a blob, so individual node failures don't cause operation failure.

d) \_\_\_ `InconsistentBlobError` indicates data corruption and the data should NOT be used.

e) \_\_\_ Once a blob expires, it can be recovered by paying back storage fees.

### Question 5.5 (Short Answer)

Give two reasons to add jitter to exponential backoff when retrying Walrus operations.

### Question 5.6 (Short Answer)

Explain the Circuit Breaker pattern and describe its three states. Why is this pattern useful when working with multiple aggregator endpoints?

---

## Section 6: Performance Optimization

### Question 6.1 (Multiple Choice)

What is the recommended chunk size range for parallel chunking of large files?

A) 1MB - 5MB

B) 10MB - 100MB

C) 100MB - 500MB

D) 500MB - 1GB

### Question 6.2 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Parallel chunking enables 2-4x throughput improvement for large uploads.

b) \_\_\_ Intra-blob parallelism refers to uploading multiple blobs simultaneously.

c) \_\_\_ Blob IDs are immutable, making caching trivially easy (no invalidation needed).

d) \_\_\_ Increasing publisher sub-wallets (`--n-clients`) always improves upload throughput.

e) \_\_\_ For files smaller than 100KB, using quilts is more efficient than individual uploads.

### Question 6.3 (Fill in the Blank)

Complete the following statements:

a) Signs of hitting storage node rate limits include HTTP \_\_\_\_\_\_ responses.

b) A good Cache-Control header for Walrus content is: `public, max-age=31536000, \_\_\_\_\_\_\_\_\_\_`.

c) Inter-blob parallelism means uploading multiple \_\_\_\_\_\_\_\_ concurrently; intra-blob parallelism means distributing \_\_\_\_\_\_\_\_ to nodes in parallel.

### Question 6.4 (Ordering)

Place the following cache layers in order from closest to the user (1) to closest to Walrus storage nodes (5):

\_\_\_ Application-level Redis cache

\_\_\_ CDN edge location

\_\_\_ Nginx cache in front of Aggregator

\_\_\_ User's browser cache

\_\_\_ Walrus Aggregator

### Question 6.5 (Short Answer)

You start seeing HTTP 429 "Too Many Requests" responses when increasing concurrency against an Aggregator.

a) What **two immediate actions** should you take to protect the system and restore stable throughput?

b) What **longer-term optimizations** might you consider if high concurrency is a standard workload pattern?

### Question 6.6 (Scenario)

You are building a batch uploader that ingests **1,000 files of 50 MB each every hour** into Walrus.

a) Should you rely only on inter-blob parallelism, only on intra-blob parallelism, or a combination? Explain.

b) How would you configure the Publisher (e.g., `--n-clients`) to support this throughput?

c) What **three metrics** would you monitor to know whether the system is keeping up?

d) How would you design the system so that a partial failure mid-batch does **not** require re-uploading already successful files?

---

## Section 7: Applied Scenarios

### Question 7.1 (Scenario - Upload Strategy)

You're deploying a "perma-web" documentation site on Walrus with the following assets:

- 400 HTML files (~5 KB each)
- 40 CSS/JS files (~50 KB each)
- 2 large PDF manuals (~100 MB each)

**Questions:**

a) How would you structure these uploads to balance **cost, simplicity, and retrieval performance**?

b) Would you use quilts? If so, for which subset of files, and why?

c) How would you expose the content to end-users to take advantage of caching?

### Question 7.2 (Scenario - NFT Marketplace)

You're building an NFT marketplace and need to store metadata for 10,000 NFTs. Each NFT has:
- 500 KB image file
- 2 KB metadata JSON

**Questions:**

a) Should you use quilts for the images? Why or why not?

b) Should you use quilts for the metadata? Why or why not?

c) How many quilts would you need to store all the metadata?

d) How can a buyer verify that the image on Walrus hasn't been swapped for a different one?

### Question 7.3 (Scenario - Retrieval Failure)

A client application uploads a 2GB dataset to Walrus. The upload completes successfully, but 3 months later, users report they cannot retrieve the data.

**Questions:**

a) What is the most likely cause of the retrieval failure?

b) How could this have been prevented?

c) If the blob has expired, can it be recovered? Explain.

d) What monitoring or alerting would you recommend to prevent this issue?

### Question 7.4 (Scenario - Fault Tolerance)

During a retrieval of a critical blob, you notice that 300 out of 1000 storage nodes are completely offline.

a) Can you still recover the data?

b) What is the theoretical maximum number of malicious/offline nodes the system can tolerate before data loss?

### Question 7.5 (Scenario - Large File Upload)

You need to upload a 10GB video file to Walrus.

**Questions:**

a) Should you upload it as a single blob or split it into chunks? Justify your answer.

b) If chunking, what chunk size would you recommend and why?

c) How would you reassemble the chunks after upload? Describe the "manifest file" pattern.

d) What are two performance benefits of chunking in this scenario?

### Question 7.6 (Scenario - Architecture Review)

Review this architecture for a decentralized video streaming platform:

**Current Design:**
- Videos (2 GB each) stored as single blobs
- Metadata stored individually (1 KB each)
- Single aggregator endpoint
- 1 year epoch commitment upfront
- No caching layer

**Identify at least 4 problems with this design and propose solutions for each.**

---

## Grading Rubrics for Open-Ended Questions

### Section 1: Publishers and Aggregators

**Question 1.4 (3 points total)** - Name three metrics to monitor
- **Full credit (1 point each)**: Any of the following counts as valid:
  - Request rate and error rate (4xx/5xx responses)
  - Upload/retrieval latency (p50, p95, p99 percentiles)
  - Disk usage, CPU, and memory utilization
  - Success rate of `certify_blob` and retrieval operations
  - Health-check endpoint success/failure counts
  - Queue depth (if using queuing)
  - Network throughput and bandwidth
  - Sub-wallet balance levels
- **Partial credit**: Award points for any 3 valid metrics from the list above or equivalent operational metrics

**Question 1.5 (6 points total)** - Disk space failure scenario
- **Part a (2 points)**: 
  - 2 points: Correctly identifies as PERMANENT failure and explains it's due to local resource exhaustion
  - 1 point: Identifies as permanent but incomplete explanation
  - 0 points: Identifies as transient
- **Part b (2 points)**: 
  - 2 points: Lists two appropriate remediation steps (e.g., free disk space, extend volume, clean logs/temp files)
  - 1 point: One valid step
  - 0 points: No valid steps
- **Part c (2 points)**:
  - 2 points: Mentions checking service status, reviewing logs, and performing test upload
  - 1 point: Mentions at least one validation check
  - 0 points: No validation checks mentioned

**Question 1.6 (6 points total)** - Epoch transition errors
- **Part a (2 points)**: Explains the Publisher is operating with outdated committee/epoch state
- **Part b (2 points)**: Describes automatic epoch detection and committee refresh from Sui RPC
- **Part c (2 points)**: Suggests appropriate monitoring (epoch transition alerts, error spike detection, etc.)

### Section 2: Upload Transaction Lifecycle

**Question 2.5 (4 points total)** - Storage node checks
- **2 points each** for correctly identifying:
  1. On-chain registration check (verifies blob is registered and paid for on Sui)
  2. Local storage check (confirms node has all required slivers)
- **Partial credit (1 point each)**: Partial or incomplete descriptions of these checks

**Question 2.6 (6 points total)** - Certification with insufficient signatures
- **Part a (2 points)**: Correctly states certification will fail and explains quorum requirement (667 minimum)
- **Part b (2 points)**: Describes retry strategy (collect more signatures, wait for slow nodes)
- **Part c (2 points)**: Identifies transient causes (slow nodes, network issues) and notes it's not fundamental if enough eventually respond

### Section 3: Transaction Types

**Question 3.4 (4 points total)** - extend_blob vs extend_blob_with_resource
- **2 points**: Correctly explains `extend_blob` (pay WAL tokens directly for additional epochs)
- **2 points**: Correctly explains `extend_blob_with_resource` (merge with existing Storage resource)
- **Bonus (1 point)**: Provides appropriate use case examples for each

**Question 3.5 (3 points total)** - Cost comparison
- **2 points**: Correctly identifies upfront is more cost-effective
- **1 point**: Explains reasoning (avoids multiple gas fees)
- **Partial credit**: Award partial points for understanding trade-offs even if conclusion differs

### Section 4: Quilts

**Question 4.6 (4 points total)** - NFT metadata cost calculation
- **Part a (2 points)**: 
  - 2 points: Correct calculation (~297 WAL savings)
  - 1 point: Understands calculation but minor errors
  - 0 points: Does not attempt calculation
- **Part b (2 points)**: 
  - 2 points: Correctly states "No" and explains immutability
  - 1 point: States "No" but incomplete explanation
  - 0 points: Incorrect answer

**Question 4.7 (6 points total)** - Quilt patch modification scenario
- **Part a (2 points)**: Correctly states patches cannot be individually deleted/overwritten and explains immutability
- **Part b (2 points)**: Describes creating new quilt with corrected data
- **Part c (2 points)**: Suggests preventive measures (validation, staging, schema checks)

### Section 5: Failure Handling

**Question 5.5 (2 points total)** - Jitter reasons
- **1 point each** for any two valid reasons:
  - Prevents thundering herd / synchronized retries
  - Smooths load over time
  - Increases probability of success under partial degradation
  - Reduces server impact during recovery

**Question 5.6 (5 points total)** - Circuit Breaker pattern
- **3 points**: Correctly describes all three states (Closed, Open, Half-Open)
- **2 points**: Explains usefulness for aggregators (prevents wasted requests, enables failover, automatic recovery testing)
- **Partial credit**: Award proportional points for partial understanding

### Section 6: Performance Optimization

**Question 6.5 (4 points total)** - HTTP 429 responses
- **Part a (2 points)**: Two immediate actions (reduce concurrency, implement/increase backoff)
- **Part b (2 points)**: Longer-term optimizations (more aggregator instances, caching, rate limiting, regionalization)

**Question 6.6 (8 points total)** - Batch uploader scenario
- **Part a (2 points)**: Recommends combination of inter-blob and intra-blob parallelism with explanation
- **Part b (2 points)**: Suggests appropriate `--n-clients` value (8-32) with reasoning
- **Part c (2 points)**: Identifies three relevant metrics (throughput, error rate, latency)
- **Part d (2 points)**: Describes resumable design (tracking per-file status, committing BlobIds)

### Section 7: Applied Scenarios

**Question 7.1 (5 points total)** - Documentation site strategy
- **Part a (2 points)**: Logical structure (quilts for small files, individual blobs for PDFs)
- **Part b (2 points)**: Correct quilt usage justification
- **Part c (1 point)**: Mentions caching strategy (CDN, immutable headers)

**Question 7.2 (8 points total)** - NFT marketplace
- **Part a (2 points)**: Correctly advises against quilts for 500KB images with reasoning
- **Part b (2 points)**: Recommends quilts for 2KB metadata with reasoning
- **Part c (2 points)**: Correct calculation (16 quilts)
- **Part d (2 points)**: Explains BlobId verification mechanism

**Question 7.3 (8 points total)** - Retrieval failure after 3 months
- **Part a (2 points)**: Identifies expiration as likely cause
- **Part b (2 points)**: Lists prevention methods (appropriate duration, monitoring, extension)
- **Part c (2 points)**: Correctly states blobs cannot be recovered after expiration
- **Part d (2 points)**: Suggests monitoring/alerting strategy

**Question 7.4 (4 points total)** - Fault tolerance with 300 nodes offline
- **Part a (2 points)**: Correctly states data is recoverable (700 > 334 needed)
- **Part b (2 points)**: States correct Byzantine threshold (333) and crash fault tolerance (666)

**Question 7.5 (8 points total)** - 10GB video upload
- **Part a (2 points)**: Recommends chunking with valid justification
- **Part b (2 points)**: Suggests appropriate chunk size (50-100MB) with reasoning
- **Part c (2 points)**: Describes manifest pattern correctly
- **Part d (2 points)**: Identifies two performance benefits (parallel processing, granular retries)

**Question 7.6 (8 points total)** - Architecture review
- **2 points per problem identified** (minimum 4 required, up to 5 accepted):
  1. Single 2GB blobs without chunking - solution provided
  2. Individual 1KB metadata - quilt solution provided
  3. Single aggregator - redundancy solution provided
  4. No caching layer - CDN solution provided
  5. 1-year upfront commitment - flexible duration solution provided
- **Partial credit**: Award 1 point per problem if solution is missing or incomplete

---

## Answer Key

> **Note**: For open-ended questions, refer to the [Grading Rubrics](#grading-rubrics-for-open-ended-questions) section above for detailed scoring criteria and point allocation.

### Section 1: Publishers and Aggregators

**1.1:** B) Publisher focuses on encode + upload; Aggregator focuses on fetch + reconstruct

**1.2:**
a) TRUE - They are optional infrastructure components
b) TRUE - Clients must verify their work via BlobIds and on-chain state
c) FALSE - Aggregators are read-only and don't require a wallet
d) FALSE - There may be brief delays (1-2 seconds) during epoch transitions
e) TRUE - Daemon mode runs both on a single port

**1.3:**
a) 8
b) `--n-clients`
c) committee (or epoch)

**1.4:** (Award 1 point each for any 3 valid metrics - see rubric for full list)
Acceptable answers include:
- Request rate and error rate (4xx/5xx)
- Upload and retrieval latency (p50, p95, p99)
- Disk usage, CPU, and memory for processes
- Success rate of `certify_blob` and retrieval operations
- Health-check success/failure counts
- Queue depth if using a queue system
- Network throughput and bandwidth
- Sub-wallet balance levels

**1.5:**
a) This is a **permanent** failure until disk space is freed - it is caused by local resource exhaustion, not a transient network glitch.
b) (1) Free disk space (delete temp/log files, extend volume, or move data); (2) Ensure Walrus data and log directories have sufficient space and correct quotas.
c) Check service status, review logs to confirm errors have stopped, run a small test upload via the Publisher, and verify that a valid BlobId is returned.

**1.6:**
a) The network has moved to a new epoch, but the Publisher is still trying to operate with the old committee/epoch state.
b) Automatically detect the epoch change, refresh the committee from Sui RPC, and resume using the new configuration.
c) Monitor for epoch-transition log messages and error spikes, add alerts for repeated "behind current epoch" errors, and possibly schedule lower-traffic windows around planned transitions.

---

### Section 2: Upload Transaction Lifecycle

**2.1:** The correct order is:
| Phase | Order |
|-------|-------|
| Encoding (split blob into slivers using RS coding) | 1 |
| Registration (create Blob object on Sui) | 2 |
| Sealing (upload slivers to storage nodes) | 3 |
| Certification (submit aggregated signatures to Sui) | 4 |

**2.2:** C) When the `BlobCertified` event is emitted on Sui

**2.3:**
a) TRUE - Blob ID = f(Merkle root, encoding type, unencoded length)
b) FALSE - Registration creates a blob object with status "Registered", not "Certified"
c) TRUE
d) TRUE
e) TRUE - The `BlobCertified` event triggers peer recovery for nodes that missed data
f) FALSE - Only $k$ (e.g., 334 out of 1000) primary slivers are needed

**2.4:**
a) 334 primary slivers, 667 secondary slivers
b) `reserve_space`
c) `BlobCertified`
d) 334
e) Programmable Transaction Block (PTB)

**2.5:**
The storage node performs:
1. **On-Chain Registration Check**: Verifies the blob is registered and paid for on Sui by querying its local index of chain state
2. **Local Storage Check**: Confirms it has all slivers for its assigned shards in local database

Only if both checks pass will the node sign the confirmation.

**2.6:**
a) Certification will fail. Need 2/3 quorum = 667 signatures minimum. With only 650 signatures, the quorum requirement is not met.
b) The client should retry the certification process. The slivers are already stored, so the client just needs to collect more signatures. This might involve waiting for slow nodes to respond or retrying signature collection.
c) Some nodes may be slow to respond, temporarily offline, or experiencing network issues. As long as enough nodes eventually respond (≥667), this is not a fundamental problem.

---

### Section 3: Transaction Types

**3.1:**
- `reserve_space` → B
- `register_blob` → C
- `certify_blob` → A
- `extend_blob` → D
- `extend_blob_with_resource` → E

**3.2:** C) `readBlob` (standard retrieval)

**3.3:**
a) TRUE
b) TRUE - Standard retrieval (`readBlob`) is off-chain and free; certified reads require on-chain verification and incur gas fees
c) TRUE
d) TRUE
e) TRUE

**3.4:**
- `extend_blob`: Pay WAL tokens directly to purchase additional epochs. Use for ad-hoc extensions when you simply want to pay to keep data longer.
- `extend_blob_with_resource`: Merge the blob with an existing Storage resource that has a later end_epoch. The Storage resource must be the same size. Use when you have pre-purchased bulk storage or want to recycle storage from deleted blobs.

**3.5:**
Upfront reservation is more cost-effective because it avoids the gas cost and potential complexity of extension transactions. However, extension provides flexibility if storage duration needs change. The single 10-epoch reservation requires one transaction with one gas fee; the 5+5 approach requires two transactions with two gas fees.

---

### Section 4: Quilts

**4.1:** B) Reducing costs and gas fees when storing many small blobs

**4.2:** C) 666 (for 1000 shards: 667 secondary slivers - 1 for index = 666 available for patches)

**4.3:**
a) FALSE - Individual patches cannot be deleted separately; operations apply to the entire quilt
b) TRUE
c) FALSE - QuiltPatchId depends on the entire quilt composition, so different quilts produce different IDs
d) TRUE
e) TRUE
f) FALSE - Quilts only support quilt-level operations (extend/delete entire quilt)

**4.4:**
a) 64 KB
b) 64 KB
c) 1 MB (accept: 1 MB or "less than 1 MB" - this is the threshold where quilts provide maximum benefit per curriculum guidance)
d) `read-quilt`

**4.5:**
- `BlobId` → B
- `QuiltPatchId` → C
- `Identifier` → A

**4.6:**
a) Individual cost: 5000 × 0.06 WAL = 300 WAL. With ~100x savings, quilt cost is ~3 WAL. Savings ≈ **297 WAL**.
b) No. Quilts are immutable at the patch level. To update one file, you must create a new quilt containing the corrected file and all unchanged files.

**4.7:**
a) No. Quilts are immutable at the patch level; you cannot surgically delete or overwrite a single patch inside an existing quilt.
b) Create a **new quilt** that contains all the valid patches plus the corrected file, update references to point to the new quilt, and optionally let the old quilt expire or mark it as deprecated.
c) Use staging quilts for validation, enforce schema checks and content validation before quilting, and keep metadata (like a manifest) so you can easily rebuild quilts if needed.

---

### Section 5: Failure Handling

**5.1:**
a) R (Retryable) - Network issues are transient
b) N (Non-Retryable) - Content is permanently blocked
c) N (Non-Retryable) - If expired, cannot recover; if never existed, check blob ID
d) N (Non-Retryable) - Data corruption/encoding error
e) R (Retryable) - Storage nodes may recover
f) R (Retryable) - Rate limiting is temporary, wait and retry
g) N (Non-Retryable) - Client error, fix the request
h) R (Retryable) - Epoch changes are transient; the SDK/Publisher automatically refreshes committee state
i) N (Non-Retryable) - Must extend storage or re-upload

**5.2:** B) Increasing wait time between retries exponentially (1s, 2s, 4s, 8s...) with random variation

**5.3:** B) Writes are idempotent; same content → same BlobId

**5.4:**
a) TRUE
b) TRUE
c) TRUE
d) TRUE
e) FALSE - Once expired, blobs cannot be recovered; storage nodes may garbage collect the data

**5.5:**
1. Prevent thundering herd / synchronized retries where many clients retry at exactly the same time
2. Smooth out load over time, increasing the probability that some clients succeed even under partial degradation

**5.6:**
Circuit Breaker pattern prevents overwhelming a failing service by "tripping" after repeated failures.

**Three states:**
1. **Closed**: Normal operation, requests flow through, failures counted
2. **Open**: Service considered down, requests fail immediately without attempting
3. **Half-Open**: After timeout, allow one test request to check if service recovered

**Usefulness for aggregators:**
- Prevents wasting requests on a known-failing aggregator
- Allows faster failover to healthy alternatives
- Automatically tests for recovery without manual intervention

---

### Section 6: Performance Optimization

**6.1:** B) 10MB - 100MB

**6.2:**
a) TRUE
b) FALSE - Intra-blob parallelism refers to parallel sliver distribution within a single blob; inter-blob parallelism is multiple blobs simultaneously
c) TRUE
d) FALSE - More sub-wallets require more distributed funds; rate limits may still apply
e) TRUE

**6.3:**
a) 429
b) immutable
c) blobs (or chunks), slivers

**6.4:**
1 - User's browser cache
2 - CDN edge location
3 - Application-level Redis cache
4 - Nginx cache in front of Aggregator
5 - Walrus Aggregator

**6.5:**
a) Immediately (1) reduce concurrency / request rate and implement or increase backoff with jitter; (2) monitor error rates until 429s subside.
b) Longer-term: capacity planning and tuning (more Aggregator instances, better caching, regionalization), explicit rate limits per client, and improved queueing/backpressure in your application.

**6.6:**
a) Use a **combination**: inter-blob parallelism to upload many files at once, and rely on intra-blob parallelism within each upload for efficient sliver distribution.
b) Configure a reasonably high `--n-clients` (e.g., 8-32) so multiple registrations can be in-flight, matching expected concurrency and wallet funding.
c) Monitor: (1) Overall upload throughput (MB/s), (2) Error rate/429s, (3) Average/percentile upload latency. Also useful: queue depth and success/failure counts per batch.
d) Track per-file status (e.g., in a database), commit each successful BlobId as you go, and design the batch job to **resume** from the last successful file rather than restarting from scratch.

---

### Section 7: Applied Scenarios

**7.1:**
a) Store the 440 HTML/CSS/JS files in **one quilt** to minimize per-file overhead, and store each large PDF as its own **regular blob**.
b) Yes, use quilts for the many small text assets (all fit within the 666 limit); the PDFs are large enough that quilting brings little benefit.
c) Serve content via an Aggregator behind an HTTP cache / CDN; rely on immutable BlobIds and long `Cache-Control` headers (`public, max-age=31536000, immutable`) for strong caching behavior.

**7.2:**
a) No, quilts are not recommended for 500 KB images. They're borderline large, may need independent verification, and individual blobs are more appropriate.
b) Yes, use quilts for metadata. 2KB files are perfect candidates - massive cost savings from shared overhead and reduced gas fees.
c) 10,000 ÷ 666 = 15.015 → **16 quilts required** (15 quilts × 666 = 9,990 patches, which is 10 short of 10,000)
d) The BlobId is a hash of the content. If the image changes, the BlobId changes. The NFT smart contract should store the immutable BlobId - buyers can verify by re-encoding the image and checking the hash matches.

**7.3:**
a) Most likely cause: The blob's storage epochs expired and storage nodes garbage collected the data.
b) Prevented by: (1) Setting appropriate initial storage duration, (2) Implementing monitoring/alerting for approaching expiration, (3) Extending storage before expiration, (4) Using longer initial durations for critical data.
c) No, expired blobs cannot be recovered. Once the end_epoch is reached, storage nodes are free to delete the data, and there is no way to restore it.
d) Monitor blob expiration dates, set up alerts 30 days before expiration, implement automated extension for critical blobs, and track storage duration metrics.

**7.4:**
a) Yes. You need 334 shards to reconstruct (on a 1000 shard network). With 700 nodes online, you have plenty of redundancy.
b) Up to 333 nodes (f < n/3) can be Byzantine/malicious. For simple unavailability (crash faults), you can tolerate up to 666 offline nodes as long as you can reach 334 valid shards.

**7.5:**
a) Split into chunks. While 10GB is under the 13.3 GiB limit, chunking enables parallel processing, granular retries, and better memory management.
b) Recommend 50-100MB chunks. This provides good balance between overhead and parallelism, allows efficient encoding, and enables granular retries.
c) Create a manifest blob that stores the list of blob IDs in order:
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
Upload manifest as a separate blob. To reconstruct: download manifest first, then download chunks in order, concatenate.
d) Two benefits: (1) Parallel encoding/uploading of chunks improves throughput 2-4x, (2) If upload fails at 90%, only need to retry failed chunks, not the entire 10GB file.

**7.6:**
Problems and Solutions:

1. **Single 2GB blobs** - If upload fails at 99%, must retry entire upload
   - Solution: Implement chunking strategy (100-500 MB chunks) with manifest file

2. **Individual 1KB metadata** - Extremely expensive due to per-blob overhead
   - Solution: Use quilts for metadata, batching related metadata together

3. **Single aggregator endpoint** - Single point of failure
   - Solution: Deploy multiple aggregators, implement client-side fallback logic

4. **No caching layer** - For a streaming platform, this causes poor performance
   - Solution: Add CDN layer for frequently accessed content

5. **1 year upfront commitment** - Videos may become unpopular; locked capital
   - Solution: Start with shorter epochs (3-6 months), extend based on view metrics

---

## Scoring Guide

| Section | Points | Your Score |
|---------|--------|------------|
| Section 1: Publishers and Aggregators | 20 | |
| Section 2: Upload Transaction Lifecycle | 20 | |
| Section 3: Transaction Types | 15 | |
| Section 4: Quilts | 20 | |
| Section 5: Failure Handling | 20 | |
| Section 6: Performance Optimization | 20 | |
| Section 7: Applied Scenarios | 35 | |
| **Total** | **150** | |

**Passing Score:** 105/150 (70%)
