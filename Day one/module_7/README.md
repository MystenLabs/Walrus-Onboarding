# Module 7: Quilts - Batch Storage in Walrus

Welcome to Module 7 of the Walrus Training Program! This module provides comprehensive training on efficiently storing and managing large numbers of small blobs using Walrus's quilt feature, with dramatic cost savings of up to 413x.

## 📚 Overview

This module teaches you how to:

- Understand the cost inefficiency of storing small blobs individually and how quilts solve this problem
- Create quilts to batch up to 666 blobs into a single storage unit
- Retrieve individual blobs from quilts using identifiers, tags, or patch IDs
- Implement metadata strategies for organizing and querying blobs within quilts
- Choose between quilts and regular blob storage based on your use case
- Avoid common pitfalls when working with quilts

## 🎯 Learning Objectives

By completing this module, you will be able to:

1. **Understand grouped data storage** - Explain the problem quilts solve and when to use them

2. **Create quilts** - Store multiple small blobs as a single quilt unit using CLI and SDK

3. **Retrieve from quilts** - Access individual blobs within a quilt using identifiers, tags, or patch IDs

4. **Implement metadata** - Use identifiers and tags to organize and query blobs within quilts

5. **Avoid common mistakes** - Recognize and prevent typical pitfalls when working with quilts

## 📖 Curriculum Structure

The module is organized into 7 comprehensive lessons:

### Core Concepts

1. **[What Quilts Solve](./contents/01-what-quilts-solve.md)** - The problem statement and use cases
   - Cost inefficiency of small blobs
   - Gas fee overhead
   - Collection management needs
   - When to use quilts vs regular blobs

2. **[How Data Is Linked](./contents/02-how-data-is-linked.md)** - Technical structure and organization
   - Quilt internal structure
   - QuiltPatchId vs BlobId
   - Metadata system (identifiers and tags)
   - Sliver alignment

### Practical Implementation

3. **[Creation Process](./contents/03-creation-process.md)** - How to create quilts
   - Using `store-quilt` command
   - SDK write methods
   - Identifiers and tags
   - Best practices for batching

4. **[Retrieval Process](./contents/04-retrieval-process.md)** - How to retrieve blobs from quilts
   - Reading by identifier
   - Reading by tag
   - Reading by QuiltPatchId
   - Listing all patches

5. **[Real Examples](./contents/05-real-examples.md)** - Practical code examples
   - CLI examples with real commands
   - TypeScript SDK examples
   - Python API examples
   - NFT collection use case

### Best Practices

6. **[Typical Mistakes](./contents/06-typical-mistakes.md)** - Common pitfalls and how to avoid them
   - Duplicate identifiers
   - Wrong ID types
   - Operational limitations
   - Performance considerations

### Practice

7. **[Hands-On Lab](./contents/07-hands-on.md)** - Practical exercise
   - Create a small quilt with metadata
   - Retrieve blobs by different methods
   - Verify retrieval and metadata

## 🚀 Getting Started

### Prerequisites

Before starting this module, ensure you have:

- ✅ Completed the CLI or SDK/Upload Relay curriculum

- ✅ Basic understanding of blob storage in Walrus

- ✅ A configured Walrus client (CLI or SDK)

- ✅ SUI and WAL tokens for hands-on exercises

- ✅ Docker installed (for hands-on lab)

### Quick Start

1. **Read the curriculum**: Start with the [index page](./contents/index.md)

2. **Follow along**: Progress through lessons 1-7 in order

3. **Run examples**: Use the hands-on code in the `hands-on-source-code/` directory

4. **Practice**: Complete the hands-on lab in lesson 7

## 💻 Hands-On Code Examples

The `hands-on-source-code/` directory contains runnable examples in multiple languages:

- **CLI Examples**: Shell scripts demonstrating quilt creation and retrieval
- **TypeScript Examples**: SDK integration for web applications
- **Rust Examples**: Low-level SDK usage for systems programming
- **Real-World Examples**: NFT collections, website deployment, game assets

See [hands-on-source-code/README.md](./hands-on-source-code/README.md) for detailed instructions.

---

**Ready to start?** Head to [contents/index.md](./contents/index.md) or jump straight to [Lesson 1: What Quilts Solve](./contents/01-what-quilts-solve.md)!

