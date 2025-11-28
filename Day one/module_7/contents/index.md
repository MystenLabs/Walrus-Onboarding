# Module 11: Quilts - Batch Storage in Walrus

Welcome to the Quilts module! This curriculum teaches you how to efficiently store and manage large numbers of small blobs using Walrus's quilt feature.

## Learning Objectives

By the end of this module, you will be able to:

1. **Understand grouped data storage** - Explain the problem quilts solve and when to use them
2. **Create quilts** - Store multiple small blobs as a single quilt unit using CLI and SDK
3. **Retrieve from quilts** - Access individual blobs within a quilt using identifiers, tags, or patch IDs
4. **Implement metadata** - Use identifiers and tags to organize and query blobs within quilts
5. **Avoid common mistakes** - Recognize and prevent typical pitfalls when working with quilts

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[What Quilts Solve](./01-what-quilts-solve.md)** - The problem statement and use cases
   - Cost inefficiency of small blobs
   - Gas fee overhead
   - Collection management needs
   - When to use quilts vs regular blobs

2. **[How Data Is Linked](./02-how-data-is-linked.md)** - Technical structure and organization
   - Quilt internal structure
   - QuiltPatchId vs BlobId
   - Metadata system (identifiers and tags)
   - Sliver alignment

3. **[Creation Process](./03-creation-process.md)** - How to create quilts
   - Using `store-quilt` command
   - SDK write methods
   - Identifiers and tags
   - Best practices for batching

4. **[Retrieval Process](./04-retrieval-process.md)** - How to retrieve blobs from quilts
   - Reading by identifier
   - Reading by tag
   - Reading by QuiltPatchId
   - Listing all patches

5. **[Real Examples](./05-real-examples.md)** - Practical code examples
   - CLI examples with real commands
   - TypeScript SDK examples
   - Python API examples
   - NFT collection use case

6. **[Typical Mistakes](./06-typical-mistakes.md)** - Common pitfalls and how to avoid them
   - Duplicate identifiers
   - Wrong ID types
   - Operational limitations
   - Performance considerations

7. **[Hands-On Lab 4](./07-hands-on.md)** - Practical exercise
   - Create a small quilt with metadata
   - Retrieve blobs by different methods
   - Verify retrieval and metadata

## Prerequisites

Before starting this module, you should have:

- ✅ Completed the CLI or SDK/Upload Relay curriculum
- ✅ Basic understanding of blob storage in Walrus
- ✅ A configured Walrus client (CLI or SDK)
- ✅ SUI and WAL tokens for hands-on exercises

## Next Steps

Start with **[What Quilts Solve](./01-what-quilts-solve.md)** to understand the problem space, or jump directly to the **[Hands-On Lab](./07-hands-on.md)** if you prefer learning by doing.
