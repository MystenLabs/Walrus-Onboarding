# Module 7: Walrus SDK with Upload Relay

Welcome to Module 7 of the Walrus Training Program! This module provides comprehensive training on using the Walrus TypeScript SDK to programmatically upload and download data, with a special focus on the upload relay functionality.

## 📚 Overview

This module teaches you how to:
- Understand the Walrus SDK's data encoding and chunking mechanisms
- Interact with storage nodes directly or through upload relays
- Implement robust upload/download functionality with proper error handling
- Choose between direct uploads and relay-assisted uploads
- Write production-ready code with retries and integrity checks

## 🎯 Learning Objectives

By completing this module, you will be able to:

1. **Understand programmatic upload flow** - Know how the SDK handles data encoding, chunking, and uploading to storage nodes
2. **Understand the role of the relay** - Comprehend how the upload relay simplifies the upload process and improves reliability
3. **Write basic upload code with retries** - Implement robust upload functionality with proper error handling and retry logic

## 📖 Curriculum Structure

The module is organized into 12 comprehensive lessons:

### Core Concepts
1. **[How the SDK Handles Chunk Creation](./contents/01-chunk-creation.md)** - Blob encoding, erasure coding, and metadata generation
2. **[How the SDK Interacts with Publishers and Aggregators](./contents/02-publisher-aggregator-interaction.md)** - Direct node communication and transaction flow
3. **[What the Relay Does for Batching and Reliability](./contents/03-relay-batching-reliability.md)** - Relay benefits and automatic retry mechanisms

### Decision Making
4. **[When to Use Relay](./contents/04-when-to-use-relay.md)** - Client-side apps, mobile apps, and appropriate use cases
5. **[When Not to Use Relay](./contents/05-when-not-to-use-relay.md)** - Server-side apps and direct control requirements

### Practical Implementation
6. **[Basic Upload Example](./contents/06-basic-upload-example.md)** - Simple blob upload and upload with relay
7. **[Basic Download Example](./contents/07-basic-download-example.md)** - Reading blobs and file retrieval
8. **[Integrity Checks](./contents/08-integrity-checks.md)** - Root hash verification and certificate validation

### Advanced Topics
9. **[Retry Patterns](./contents/09-retry-patterns.md)** - Built-in retry utilities and custom strategies
10. **[How to Handle Partial Failures](./contents/10-partial-failures.md)** - Node failure handling and recovery
11. **[How to Surface Meaningful Errors to Callers](./contents/11-error-handling.md)** - Error types and user-friendly messages

### Practice
12. **[Hands-On Lab](./contents/12-hands-on.md)** - Write a complete upload script with retries and verification

## 🚀 Getting Started

### Prerequisites

Before starting this module, ensure you have:

- ✅ Basic TypeScript/JavaScript programming experience
- ✅ Understanding of async/await patterns
- ✅ Familiarity with the Sui blockchain ([Sui Documentation](https://docs.sui.io))
- ✅ A Sui wallet with SUI and WAL tokens
- ✅ Node.js (v18+) and npm/pnpm installed

### Quick Start

1. **Read the curriculum**: Start with the [index page](./contents/index.md)
2. **Follow along**: Progress through lessons 1-12 in order
3. **Run examples**: Use the hands-on code in the `hands_on_code/` directory
4. **Practice**: Complete the hands-on lab in lesson 12

## 💻 Hands-On Code Examples

The `hands_on_code/` directory contains runnable TypeScript examples:
See [hands_on_code/README.md](./hands_on_code/README.md) for detailed instructions.

---

**Ready to start?** Head to [contents/index.md](./contents/index.md) or jump straight to [Lesson 1: Chunk Creation](./contents/01-chunk-creation.md)!

