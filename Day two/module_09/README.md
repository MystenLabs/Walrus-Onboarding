# Module 9: Walrus Upload Transaction Lifecycle

Welcome to Module 9 of the Walrus Training Program! This module provides comprehensive training on the low-level mechanics of how a file becomes a permanent, certified blob on the Walrus network, with detailed protocol execution tracing.

## 📚 Overview

This module teaches you how to:

- Trace the complete transaction path of a blob upload from local encoding to on-chain certification
- Understand the Reed-Solomon erasure encoding process and sliver generation
- Analyze on-chain registration transactions and storage reservation mechanisms
- Follow parallel HTTP storage operations to storage nodes
- Debug stuck uploads by identifying which lifecycle stage failed
- Verify data integrity through proofs and certification events

## 🎯 Learning Objectives

By completing this module, you will be able to:

1. **Trace the complete transaction path** - Follow a blob upload from local encoding through certification

2. **Identify specific log messages** - Locate diagnostic markers for each stage to aid debugging

3. **Explain Sealing and Proof mechanisms** - Understand how data availability is ensured before certification

4. **Debug stuck uploads** - Pinpoint exactly which stage (Submission, Storage, or Certification) failed

## 📖 Curriculum Structure

The module is organized into 8 comprehensive lessons:

### Core Lifecycle Stages

1. **[Chunk Creation & Encoding](./contents/01-chunk-creation.md)** - Deep dive into erasure encoding
   - Reed-Solomon RS(n,k) encoding fundamentals
   - Sliver generation (primary and secondary)
   - Metadata hashing and Blob ID creation
   - Rust/WASM implementation in `walrus-core`

2. **[Submission (Registration)](./contents/02-submission.md)** - On-chain blob registration
   - The `register_blob` Sui transaction
   - Storage reservation and WAL payment
   - Cost calculation mechanisms
   - Creating the Blob object on-chain

3. **[Sealing (Storing Slivers)](./contents/03-sealing.md)** - Data distribution to storage nodes
   - Parallel HTTP PUT requests to storage nodes
   - The `store_sliver` RPC on storage node side
   - Quorum requirements and timeouts
   - Handling node failures

### Verification & Certification

4. **[Proof Creation (Collecting Signatures)](./contents/04-proof-creation.md)** - Validity proof generation
   - How storage nodes verify on-chain registration
   - Signature collection process
   - BLS signature aggregation
   - Building the certification proof

5. **[Storage Confirmation (Certification)](./contents/05-storage-confirmation.md)** - Final certification
   - The `certify_blob` transaction
   - BlobCertified event emission
   - Network synchronization triggers
   - State transition to "Certified"

### Data Retrieval & Debugging

6. **[Retrieval Flow](./contents/06-retrieval-flow.md)** - Reading certified blobs
   - Fetching slivers from storage nodes
   - Reed-Solomon decoding and reconstruction
   - Integrity verification
   - Handling partial failures during reads

7. **[Full Lifecycle Diagram](./contents/07-full-lifecycle-diagram.md)** - Complete visualization
   - Comprehensive sequence diagram
   - All components interaction flow
   - Timing and dependencies

### Practice

8. **[Hands-On: Trace Logs](./contents/08-hands-on-trace-logs.md)** - Practical debugging exercise
   - Run a local upload with verbose logging
   - Grep for lifecycle stage markers
   - Identify bottlenecks and failures
   - Verify each stage completion

---

**Ready to start?** Head to [contents/index.md](./contents/index.md) or jump straight to [Lesson 1: Chunk Creation & Encoding](./contents/01-chunk-creation.md)!

