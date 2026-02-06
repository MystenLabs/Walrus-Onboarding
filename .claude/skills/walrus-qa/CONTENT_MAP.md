# Walrus Training Program — Topic Index

> This file maps topics to their source module/chapter files.
> Used by the walrus-qa skill to target searches efficiently.
> Regenerate when modules are added or significantly changed.

## How to Use This Index

Each entry lists a topic and the specific files where it is covered.
Paths are relative to the repository root: `/Users/alilloig/workspace/walrus_training_program/`

---

## Architecture & Core Concepts

- **What Walrus Is / Why It Exists / Design Goals**
  - Module 1: Introduction → `01-Introduction/Module1.md`

- **System Components (Storage Nodes, Publishers, Aggregators)**
  - Module 2: Architecture → `02-Walrus-architecture/contents/01-components.md`
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/01-component-duties.md`
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/00-overview.md`

- **Erasure Coding / RedStuff / Reed-Solomon / Slivers**
  - Module 1: Introduction → `01-Introduction/Module1.md` (overview)
  - Module 2: Architecture → `02-Walrus-architecture/contents/02-chunk-creation.md`
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/01-chunk-creation.md` (deep dive)

- **Blob ID Computation / Data Encoding**
  - Module 2: Architecture → `02-Walrus-architecture/contents/02-chunk-creation.md`
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/01-chunk-creation.md`

- **Data Flow (Upload & Retrieval Paths)**
  - Module 2: Architecture → `02-Walrus-architecture/contents/03-data-flow.md`
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/07-full-lifecycle-diagram.md`

- **Proof-of-Availability (PoA) / Certificates**
  - Module 1: Introduction → `01-Introduction/Module1.md`
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/04-proof-creation.md`
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/05-storage-confirmation.md`

- **Byzantine Fault Tolerance**
  - Module 2: Architecture → `02-Walrus-architecture/contents/02-chunk-creation.md`
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/03-guarantees.md`

- **What Walrus Is NOT / Limitations**
  - Module 1: Introduction → `01-Introduction/Module1.md`

- **Blob Lifecycle States (Creation → Certification → Deletion → Expiration)**
  - Module 6: CLI → `06-Walrus-CLI/contents/03-upload-workflow.md` (lifecycle overview)
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/05-storage-confirmation.md`
  - Module 12: Failure Handling → `12-Failure-handling/contents/04-expired-storage.md`

---

## Epochs, Continuity & Extension

- **Epoch Lifecycle / Epoch Parameters / Durations**
  - Module 4: Epochs → `04-Epochs/contents/01-epochs-continuity.md`

- **Storage Continuity / Extension Rules / Ring Buffer**
  - Module 4: Epochs → `04-Epochs/contents/01-epochs-continuity.md`
  - Module 10: Transaction Types → `10-Transaction-types/contents/02-extension.md`

- **Race Conditions at Epoch Boundaries**
  - Module 4: Epochs → `04-Epochs/contents/01-epochs-continuity.md`

- **Blob and Storage as Sui Objects**
  - Module 4: Epochs → `04-Epochs/contents/01-epochs-continuity.md`

- **Storage Duration Planning / Extension Strategies**
  - Module 4: Epochs → `04-Epochs/contents/01-epochs-continuity.md`
  - Module 5: Storage Costs → `05-Storage-costs/contents/02-storage-duration.md`
  - Module 13: Performance → `13-Performance-optimization/contents/04-storage-extensions.md`

---

## Storage Economics & Costs

- **Cost Model / Cost Components (Storage, Upload, Transaction, Object)**
  - Module 5: Storage Costs → `05-Storage-costs/contents/01-cost-model.md`

- **Encoded Size vs Unencoded Size**
  - Module 5: Storage Costs → `05-Storage-costs/contents/01-cost-model.md`

- **Storage Duration & Cost Implications**
  - Module 5: Storage Costs → `05-Storage-costs/contents/02-storage-duration.md`

- **Budget Planning / Cost Estimation**
  - Module 5: Storage Costs → `05-Storage-costs/contents/03-budget-planning.md`

- **Cost Reduction Strategies (Reuse, Batching, Optimization)**
  - Module 5: Storage Costs → `05-Storage-costs/contents/04-cost-reduction.md`
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/01-what-quilts-solve.md` (batching savings)

- **Cost Scenarios (Small Files, Large Files, Archives)**
  - Module 5: Storage Costs → `05-Storage-costs/contents/05-scenarios.md`

- **Transaction Costs (WAL + Gas)**
  - Module 10: Transaction Types → `10-Transaction-types/contents/01-upload.md`
  - Module 10: Transaction Types → `10-Transaction-types/contents/05-production.md`

---

## CLI Usage

- **CLI Installation**
  - Module 6: CLI → `06-Walrus-CLI/contents/01-install.md`

- **CLI Configuration / Wallet Setup**
  - Module 6: CLI → `06-Walrus-CLI/contents/02-configuration.md`

- **Upload via CLI**
  - Module 6: CLI → `06-Walrus-CLI/contents/03-upload-workflow.md`

- **Download via CLI**
  - Module 6: CLI → `06-Walrus-CLI/contents/04-download-workflow.md`

- **Inspect Commands / System Info**
  - Module 6: CLI → `06-Walrus-CLI/contents/05-inspect-commands.md`

- **CLI Common Errors / Troubleshooting**
  - Module 6: CLI → `06-Walrus-CLI/contents/06-common-errors.md`

- **CLI Best Practices / Operational Habits**
  - Module 6: CLI → `06-Walrus-CLI/contents/07-operational-habits.md`

- **Deletable Blobs / Blob Deletion / delete Command**
  - Module 6: CLI → `06-Walrus-CLI/contents/03-upload-workflow.md` (--deletable flag, walrus delete command)
  - Module 5: Storage Costs → `05-Storage-costs/contents/02-storage-duration.md` (delete_blob for resource reclamation)
  - Module 5: Storage Costs → `05-Storage-costs/contents/04-cost-reduction.md` (deletion as cost strategy)

---

## SDK & Upload Relay

- **SDK Data Encoding / Chunking**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/01-chunk-creation.md`

- **Publisher/Aggregator Interaction (Direct Communication)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/02-publisher-aggregator-interaction.md`

- **Upload Relay (Batching, Reliability, When to Use)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/03-relay-batching-reliability.md`
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/04-when-to-use-relay.md`
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/05-when-not-to-use-relay.md`

- **Basic Upload Example (SDK)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/06-basic-upload-example.md`

- **Basic Download Example (SDK)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/07-basic-download-example.md`

- **Integrity Checks / Root Hash Verification**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/08-integrity-checks.md`
  - Module 12: Failure Handling → `12-Failure-handling/contents/05-proof-mismatch-handling.md`

- **Retry Patterns (SDK)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/09-retry-patterns.md`
  - Module 12: Failure Handling → `12-Failure-handling/contents/06-robust-retry-patterns.md`

- **Partial Failure Handling (SDK)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/10-partial-failures.md`

- **Error Handling (SDK)**
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/11-error-handling.md`

---

## Publishers & Aggregators

- **Publisher Setup / Installation / Deployment**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/01-setup-installation.md`
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/02-publisher-operations.md`

- **Aggregator Setup / Deployment**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/01-setup-installation.md`
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/03-aggregator-operations.md`

- **HTTP Endpoints (PUT /v1/blobs, GET /v1/blobs/<id>)**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/02-publisher-operations.md`
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/03-aggregator-operations.md`

- **Sub-Wallets for Concurrent Operations**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/02-publisher-operations.md`

- **Monitoring / Health Metrics**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/04-monitoring.md`
  - Module 13: Performance → `13-Performance-optimization/contents/06-production-metrics.md`

- **Troubleshooting (Publisher/Aggregator)**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/05-troubleshooting.md`

- **Token Requirements (SUI + WAL)**
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/02-publisher-operations.md`

---

## Upload Lifecycle (Transaction Path)

- **Complete Upload Lifecycle (End-to-End)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/07-full-lifecycle-diagram.md`

- **Chunk Creation / Reed-Solomon Encoding (Deep Dive)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/01-chunk-creation.md`

- **On-Chain Registration (register_blob)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/02-submission.md`

- **Sealing (Sliver Distribution to Nodes)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/03-sealing.md`

- **Proof Creation (BLS Signatures, Quorum)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/04-proof-creation.md`

- **Storage Confirmation (certify_blob)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/05-storage-confirmation.md`

- **Retrieval Flow (Reconstruction)**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/06-retrieval-flow.md`

- **Debugging Stuck Uploads / Tracing Logs**
  - Module 9: Upload Lifecycle → `09-Upload-lifecycle/contents/08-hands-on-trace-logs.md`

---

## Transaction Types

- **Upload Transactions (Reserve → Register → Upload → Certify)**
  - Module 10: Transaction Types → `10-Transaction-types/contents/01-upload.md`

- **Extension Transactions (extend_blob, SharedBlob)**
  - Module 10: Transaction Types → `10-Transaction-types/contents/02-extension.md`
  - Module 6: CLI → `06-Walrus-CLI/contents/03-upload-workflow.md` (--share flag)

- **SharedBlob / Community-Funded Storage**
  - Module 10: Transaction Types → `10-Transaction-types/contents/02-extension.md`
  - Module 10: Transaction Types → `10-Transaction-types/contents/05-production.md`
  - Module 6: CLI → `06-Walrus-CLI/contents/03-upload-workflow.md` (--share flag)

- **Retrieval Operations**
  - Module 10: Transaction Types → `10-Transaction-types/contents/03-retrieval.md`

- **Quilt Transactions**
  - Module 10: Transaction Types → `10-Transaction-types/contents/04-quilt.md`

- **Production Best Practices (PTB Optimization, Cost Management)**
  - Module 10: Transaction Types → `10-Transaction-types/contents/05-production.md`

- **TypeScript Code Examples**
  - Module 10: Transaction Types → `10-Transaction-types/src/examples/upload.ts`
  - Module 10: Transaction Types → `10-Transaction-types/src/examples/extend-blob.ts`
  - Module 10: Transaction Types → `10-Transaction-types/src/examples/read-blob.ts`
  - Module 10: Transaction Types → `10-Transaction-types/src/examples/create-quilt.ts`
  - Module 10: Transaction Types → `10-Transaction-types/src/examples/production-config.ts`

---

## Quilts / Batch Storage

- **What Quilts Solve / Cost Savings (up to 413x)**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/01-what-quilts-solve.md`

- **Quilt Internal Structure / QuiltPatchId vs BlobId / Metadata**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/02-how-data-is-linked.md`

- **Quilt Creation (CLI & SDK)**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/03-creation-process.md`

- **Quilt Retrieval (by Identifier, Tag, QuiltPatchId)**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/04-retrieval-process.md`

- **Quilt Real-World Examples / NFT Collections**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/05-real-examples.md`

- **Quilt Common Mistakes / Pitfalls**
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/06-typical-mistakes.md`

---

## Failure Handling & Robustness

- **Chunk-Level / Sliver Failures**
  - Module 12: Failure Handling → `12-Failure-handling/contents/01-chunk-level-failures.md`

- **Publisher Unavailability / Timeouts**
  - Module 12: Failure Handling → `12-Failure-handling/contents/02-publisher-unavailability.md`

- **Aggregator Delays / Network Congestion**
  - Module 12: Failure Handling → `12-Failure-handling/contents/03-aggregator-delays.md`

- **Expired Storage / NotCurrentlyRegistered**
  - Module 12: Failure Handling → `12-Failure-handling/contents/04-expired-storage.md`

- **Proof Mismatch / Data Integrity / Fraud Proofs**
  - Module 12: Failure Handling → `12-Failure-handling/contents/05-proof-mismatch-handling.md`

- **Robust Retry Patterns (Exponential Backoff, Jitter)**
  - Module 12: Failure Handling → `12-Failure-handling/contents/06-robust-retry-patterns.md`
  - Module 7: SDK → `07-Walrus-SDK-upload-relay/contents/09-retry-patterns.md`

- **Safe Fallback Patterns (Circuit Breaker, Multi-Provider, Local Buffer)**
  - Module 12: Failure Handling → `12-Failure-handling/contents/07-safe-fallback-patterns.md`

---

## Performance Optimization

- **Parallel Chunking / Breaking Large Datasets**
  - Module 13: Performance → `13-Performance-optimization/contents/01-parallel-chunking.md`

- **Parallel Uploads / Concurrent Operations**
  - Module 13: Performance → `13-Performance-optimization/contents/02-parallel-uploads.md`

- **Publisher Selection / Latency Optimization**
  - Module 13: Performance → `13-Performance-optimization/contents/03-publisher-selection.md`

- **Storage Extension Optimization**
  - Module 13: Performance → `13-Performance-optimization/contents/04-storage-extensions.md`

- **Local Caching / Immutable Blob Caching**
  - Module 13: Performance → `13-Performance-optimization/contents/05-local-caching.md`

- **Production Metrics / Monitoring**
  - Module 13: Performance → `13-Performance-optimization/contents/06-production-metrics.md`
  - Module 8: Publishers & Aggregators → `08-Setup-publishers-aggregators/contents/04-monitoring.md`

---

## Use Cases & Design Patterns

- **NFT Metadata Storage**
  - Module 14: Use Cases → `14-Use-cases/contents/01-nft-metadata.md`
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/05-real-examples.md`

- **Walrus Sites (Decentralized Websites)**
  - Module 14: Use Cases → `14-Use-cases/contents/02-walrus-sites.md`
  - Module 11: Quilts / Batch Storage → `11-Batch-storage/contents/05-real-examples.md` (site assets as quilts)

- **Multi-Part Datasets / Large Structured Data**
  - Module 14: Use Cases → `14-Use-cases/contents/03-multi-part-datasets.md`

- **Proof of Concepts / Production Lessons (Social, Gaming, Science)**
  - Module 14: Use Cases → `14-Use-cases/contents/04-proof-of-concepts.md`

- **Design Decision Frameworks (Blob vs Quilt, Epoch Planning, Publisher Choice)**
  - Module 14: Use Cases → `14-Use-cases/contents/05-design-choices.md`

---

## Operational Responsibilities & Guarantees

- **Component Duties (Publisher, Aggregator, Client)**
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/01-component-duties.md`

- **Failure Modes (Where Failures Occur)**
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/02-failure-modes.md`

- **System Guarantees vs Client Responsibilities**
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/03-guarantees.md`

- **CLI vs SDK Control Boundaries**
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/04-control-boundaries.md`

- **Practical Constraints / Real-World Limitations**
  - Module 3: Operational Responsibilities → `03-Operational-responsibilities/contents/05-practical-constraints.md`

---

## Hands-On Exercises

- **Module 2**: Architecture walkthrough → `02-Walrus-architecture/contents/04-hands-on.md`
- **Module 3**: Log inspection → `03-Operational-responsibilities/contents/06-hands-on.md`
- **Module 4**: Epoch puzzles → `04-Epochs/contents/02-hands-on.md`
- **Module 5**: Cost calculations → `05-Storage-costs/contents/06-hands-on.md`
- **Module 6**: CLI exercises → `06-Walrus-CLI/contents/08-hands-on.md`
- **Module 7**: Upload script with retries → `07-Walrus-SDK-upload-relay/contents/12-hands-on.md`
- **Module 8**: Deployment lab → `08-Setup-publishers-aggregators/contents/06-hands-on-lab.md`
- **Module 9**: Trace logs → `09-Upload-lifecycle/contents/08-hands-on-trace-logs.md`
- **Module 10**: Transaction classification → `10-Transaction-types/contents/hands-on.md`
- **Module 11**: Quilt creation → `11-Batch-storage/contents/07-hands-on.md`
- **Module 12**: Debug scenario → `12-Failure-handling/contents/08-hands-on-debug-scenario.md`
- **Module 13**: Throughput tuning → `13-Performance-optimization/contents/07-hands-on.md`
- **Module 14**: Capstone project → `14-Use-cases/contents/06-hands-on-lab.md`

---

## Quizzes & Assessments

- **Quiz 1** (Modules 1-7) → `quizzes/quiz-1.md`
  - Answer key → `quizzes/solutions/quiz-1-answer-key.md`
- **Quiz 2** (Modules 8-14) → `quizzes/quiz-2.md`
  - Answer key → `quizzes/solutions/quiz-2-answer-key.md`

---

## Instructor Guides

Instructor guides contain common student Q&A and teaching tips:
- Module 1: `01-Introduction/Module1-instructor-notes.md`
- Module 2: `02-Walrus-architecture/contents/instructor-guide.md`
- Module 3: `03-Operational-responsibilities/contents/instructor-guide.md`
- Module 4: `04-Epochs/contents/instructor-guide.md`
- Module 5: `05-Storage-costs/contents/instructor-guide.md`
- Module 6: `06-Walrus-CLI/contents/instructor-guide.md`
- Module 7: `07-Walrus-SDK-upload-relay/contents/instructor-guide.md`
- Module 8: `08-Setup-publishers-aggregators/contents/instructor-guide.md`
- Module 9: `09-Upload-lifecycle/contents/instructor-guide.md`
- Module 10: `10-Transaction-types/contents/instructor-guide.md`
- Module 11: `11-Batch-storage/contents/instructor-guide.md`
- Module 12: `12-Failure-handling/contents/instructor-guide.md`
- Module 13: `13-Performance-optimization/contents/instructor-guide.md`
- Module 14: `14-Use-cases/instructor-guide.md`

---

## Module Quick Reference

| # | Title | Directory | Content Files |
|---|-------|-----------|---------------|
| 1 | Introduction to Walrus | `01-Introduction/` | 1 (flat) |
| 2 | Walrus Architecture | `02-Walrus-architecture/` | 4 + instructor |
| 3 | Operational Responsibilities | `03-Operational-responsibilities/` | 6 + instructor |
| 4 | Epochs, Continuity & Extension | `04-Epochs/` | 2 + instructor |
| 5 | Storage Costs & Budget | `05-Storage-costs/` | 6 + instructor |
| 6 | Walrus CLI | `06-Walrus-CLI/` | 8 + instructor |
| 7 | SDK & Upload Relay | `07-Walrus-SDK-upload-relay/` | 12 + instructor |
| 8 | Publishers & Aggregators | `08-Setup-publishers-aggregators/` | 6 + instructor |
| 9 | Upload Lifecycle | `09-Upload-lifecycle/` | 8 + instructor |
| 10 | Transaction Types | `10-Transaction-types/` | 5 + hands-on + instructor |
| 11 | Quilts / Batch Storage | `11-Batch-storage/` | 7 + instructor |
| 12 | Failure Handling | `12-Failure-handling/` | 8 + instructor |
| 13 | Performance Optimization | `13-Performance-optimization/` | 7 + instructor |
| 14 | Use Cases & Design Patterns | `14-Use-cases/` | 6 + instructor |
