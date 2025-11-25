# Walrus SDK with Upload Relay Developer Curriculum

Welcome to the Walrus SDK with Upload Relay Developer Curriculum! This curriculum is designed to help developers understand how to use the Walrus TypeScript SDK to programmatically upload and download data, with a focus on the upload relay functionality.

## Learning Objectives

By the end of this curriculum, you will be able to:

1. **Understand programmatic upload flow** - Know how the SDK handles data encoding, chunking, and uploading to storage nodes
2. **Understand the role of the relay** - Comprehend how the upload relay simplifies the upload process and improves reliability
3. **Write basic upload code with retries** - Implement robust upload functionality with proper error handling and retry logic

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[How the SDK Handles Chunk Creation](./01-chunk-creation.md)** - Understanding the encoding process
   - Blob encoding with erasure coding
   - Sliver creation and distribution
   - Metadata generation
   - Quilt encoding for multiple files

2. **[How the SDK Interacts with Publishers and Aggregators](./02-publisher-aggregator-interaction.md)** - Understanding the upload flow
   - Direct node communication
   - Storage node selection
   - Confirmation handling
   - Transaction flow

3. **[What the Relay Does for Batching and Reliability](./03-relay-batching-reliability.md)** - Understanding relay benefits
   - Batch upload handling
   - Automatic retry mechanisms
   - Certificate generation
   - Network optimization

4. **[When to Use Relay](./04-when-to-use-relay.md)** - Understanding appropriate use cases
   - Client-side applications
   - Mobile applications
   - High-volume uploads
   - Simplified error handling

5. **[When Not to Use Relay](./05-when-not-to-use-relay.md)** - Understanding limitations
   - Server-side applications
   - Direct control requirements
   - Cost considerations
   - Custom retry logic needs

6. **[Basic Upload Example](./06-basic-upload-example.md)** - Practical upload implementation
   - Simple blob upload
   - Upload with relay
   - Upload flow pattern
   - File upload examples

7. **[Basic Download Example](./07-basic-download-example.md)** - Practical download implementation
   - Reading blobs
   - Reading from quilts
   - File retrieval
   - Streaming downloads

8. **[Integrity Checks](./08-integrity-checks.md)** - Verifying data correctness
   - Root hash verification
   - Blob ID validation
   - Certificate verification
   - Content validation

9. **[Retry Patterns](./09-retry-patterns.md)** - Implementing robust retry logic
   - Built-in retry utilities
   - Custom retry strategies
   - Exponential backoff
   - Conditional retries

10. **[How to Handle Partial Failures](./10-partial-failures.md)** - Managing incomplete operations
    - Node failure handling
    - Quorum requirements
    - Recovery strategies
    - Error classification

11. **[How to Surface Meaningful Errors to Callers](./11-error-handling.md)** - Error management best practices
    - Error types and hierarchy
    - User-friendly error messages
    - Error context preservation
    - Debugging information

12. **[Hands-On Lab](./12-hands-on.md)** - Practical exercises
    - Write a short upload script
    - Add retry logic
    - Verify integrity of uploaded content

## Prerequisites

Before starting this curriculum, you should have:

- Basic TypeScript/JavaScript programming experience
- Understanding of async/await patterns
- Familiarity with the Sui blockchain (see [Sui Documentation](https://docs.sui.io))
- A Sui wallet with SUI and WAL tokens
- Node.js and npm/pnpm installed

## Next Steps

Start with [How the SDK Handles Chunk Creation](./01-chunk-creation.md) to understand the fundamental encoding process, then proceed through the interaction patterns, relay usage, and practical examples to build your understanding of the SDK.
