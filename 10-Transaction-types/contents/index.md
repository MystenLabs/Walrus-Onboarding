# Module 10: Transaction Types

Welcome to the **Transaction Types** curriculum! This module provides a comprehensive guide to the various transaction types and operations within the Walrus ecosystem. Understanding these transactions is crucial for building efficient and cost-effective applications on Walrus.

## Learning Objectives

By the end of this module, you will be able to:

1. **Identify transaction categories** - Distinguish between the different types of on-chain transactions and off-chain operations available in Walrus
2. **Select appropriate operations** - Choose the right transaction type or operation for specific use cases, such as storing single files, batching small data, or extending storage duration
3. **Understand transaction costs** - Know which operations incur gas fees, WAL fees, or are free (like reads)
4. **Implement production patterns** - Apply best practices for real-world application deployment

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[Upload Transactions](./01-upload.md)** - The multi-step process of storing data on Walrus
   - Reserve Space (acquire storage resource)
   - Register Blob (associate blob ID with storage)
   - Upload Data (off-chain transfer to storage nodes)
   - Certify Blob (aggregate signatures and finalize)

2. **[Extension Transactions](./02-extension.md)** - Methods for extending the lifetime of stored data
   - `extend_blob` with payment
   - `extend_blob_with_resource` for storage reuse
   - SharedBlob for community-funded persistence

3. **[Retrieval Operations](./03-retrieval.md)** - How to access data and verify its integrity
   - Standard retrieval (off-chain, free)
   - Certified read (on-chain verification)
   - Metadata queries via Sui RPC

4. **[Quilt Operations](./04-quilt.md)** - Efficiently handling many small blobs
   - Batched upload (one transaction for N files)
   - QuiltPatchId addressing
   - Lifecycle constraints (atomic extend/delete)

5. **[Production Guidance](./05-production.md)** - Best practices for real-world applications
   - Transaction strategy matrix
   - Cost management techniques
   - Latency optimization with PTBs
   - Error handling patterns

6. **[Hands-On: Transaction Classification](./hands-on.md)** - Practical exercises
   - Classify real-world scenarios
   - Identify appropriate transaction types
   - Apply production decision-making

## Code Examples (TypeScript)

Reference implementations are available in:
- [`upload.ts`](../src/examples/upload.ts)
- [`extend-blob.ts`](../src/examples/extend-blob.ts)
- [`read-blob.ts`](../src/examples/read-blob.ts)
- [`create-quilt.ts`](../src/examples/create-quilt.ts)
- [`production-config.ts`](../src/examples/production-config.ts)

## Prerequisites

Before starting this module, you should have:

- ✅ Completed the CLI module or SDK/Upload Relay module
- ✅ Basic understanding of Walrus blob storage concepts
- ✅ Familiarity with blockchain transactions and gas fees
- ✅ A configured Walrus client (CLI or SDK)

## Key Takeaways

- **Upload is a multi-step process**: Reserve Space → Register Blob → Upload (Off-chain) → Certify Blob
- **Extensions must happen before expiry**: Once a blob expires, it cannot be recovered
- **Retrieval is mostly off-chain**: Reading is free and fast; only "certified read" involves on-chain verification
- **Quilts change the unit of transaction**: One on-chain blob represents many small files; operations apply to the entire quilt
- **SharedBlob enables community funding**: Allows multiple parties to pay for storage extensions

## Next Steps

Start with **[Upload Transactions](./01-upload.md)** to understand the foundational store operation, then work through each section to build a complete understanding of Walrus transaction types.

For instructors, see the **[Instructor Guide](./instructor-guide.md)** for teaching tips, common misconceptions, and hands-on facilitation guidance.
