# Module 10: Transaction Types

## Overview

This module provides a comprehensive guide to the various transaction types and operations within the Walrus ecosystem. Understanding these transactions is crucial for building efficient and cost-effective applications on Walrus.

## Duration

**Total Time:** 60-75 minutes

**Difficulty:** Intermediate

## Learning Objectives

By the end of this module, participants will be able to:

- **Identify transaction categories** — Distinguish between on-chain transactions and off-chain operations in Walrus
- **Select appropriate operations** — Choose the right transaction type for specific use cases
- **Understand transaction costs** — Know which operations incur gas fees, WAL fees, or are free
- **Implement production patterns** — Apply best practices for real-world deployment

## Prerequisites

- ✅ Completed Module 6 (CLI) or Module 7 (SDK/Upload Relay)
- ✅ Basic understanding of Walrus blob storage concepts
- ✅ Familiarity with blockchain transactions and gas fees
- ✅ A configured Walrus client (CLI or SDK)

## Module Structure

```
module_10/
├── README.md                          # This file
├── contents/
    ├── index.md                       # Module introduction and overview
    ├── 01-upload.md                   # Upload transaction lifecycle
    ├── 02-extension.md                # Extending storage duration
    ├── 03-retrieval.md                # Reading and verifying data
    ├── 04-quilt.md                    # Batching small files
    ├── 05-production.md               # Best practices and optimization
    ├── hands-on.md                    # Practical classification exercise
    └── instructor-guide.md            # Teaching notes and solutions
```

## Code Examples (TypeScript)

Reference implementations are available in:
- [`upload.ts`](./src/examples/upload.ts)
- [`extend-blob.ts`](./src/examples/extend-blob.ts)
- [`read-blob.ts`](./src/examples/read-blob.ts)
- [`create-quilt.ts`](./src/examples/create-quilt.ts)
- [`production-config.ts`](./src/examples/production-config.ts)

## Curriculum Sections

| Section | Topic | Duration | Description |
|---------|-------|----------|-------------|
| 1 | [Upload Transactions](./contents/01-upload.md) | 15 min | Multi-step upload lifecycle: Reserve → Register → Upload → Certify |
| 2 | [Extension Transactions](./contents/02-extension.md) | 10 min | Methods for extending storage: `extend_blob`, SharedBlob |
| 3 | [Retrieval Operations](./contents/03-retrieval.md) | 10 min | Standard reads, certified reads, and metadata queries |
| 4 | [Quilt Operations](./contents/04-quilt.md) | 10 min | Efficient batched uploads for many small files |
| 5 | [Production Guidance](./contents/05-production.md) | 10 min | Cost management, PTB optimization, error handling |
| 6 | [Hands-On Exercise](./contents/hands-on.md) | 15-20 min | Transaction classification scenarios |

## Key Concepts

### Transaction Types at a Glance

| Type | Key Functions | Cost Model |
|------|--------------|------------|
| **Upload** | `reserve_space`, `register_blob`, `certify_blob` | WAL + Gas |
| **Extension** | `extend_blob`, `extend_blob_with_resource` | WAL + Gas |
| **Retrieval** | HTTP GET (off-chain) | **Free** |
| **Quilt** | Same as Upload (1 blob = N files) | WAL + Gas (amortized) |
| **SharedBlob** | `shared_blob::new`, `fund`, `extend` | Community-funded |

### Key Takeaways

- **Upload is a multi-step process**: Reserve Space → Register Blob → Upload (Off-chain) → Certify Blob
- **Extensions must happen before expiry**: Once a blob expires, it cannot be recovered
- **Retrieval is mostly off-chain**: Reading is free and fast; only "certified read" involves on-chain verification
- **Quilts change the unit of transaction**: One on-chain blob represents many small files
- **SharedBlob enables community funding**: Allows multiple parties to pay for storage extensions

## For Instructors

See the [Instructor Guide](./contents/instructor-guide.md) for:
- Section-by-section teaching tips
- Common misconceptions and corrections
- Hands-on exercise solutions
- Assessment checklist

## Additional Resources

- [Walrus Docs: Storage Costs](https://docs.walrus.site/dev-guide/costs.html)
- [Walrus Docs: Quilts](https://docs.walrus.site/usage/quilt.html)
- [Sui Move: Programmable Transaction Blocks](https://docs.sui.io/concepts/transactions/prog-txn-blocks)
