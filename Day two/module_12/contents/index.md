# Module 8: Failure Handling & Robustness

Welcome to the **Failure Handling & Robustness** curriculum! This module focuses on building resilient applications on Walrus. You will learn how to handle common failure scenarios, implement robust client logic, and ensure your application remains reliable even when individual components fail.

## Learning Objectives

By the end of this module, you will be able to:

1. **Handle failure in a predictable way** - Understand the various error types returned by Walrus nodes and the SDK, and know how to respond to them
2. **Build robust client logic** - Implement retry strategies, fallback patterns, and error handling to create a seamless user experience

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[Chunk Level Failures](./01-chunk-level-failures.md)** - Understanding sliver availability and storage errors
   - `Unavailable` and `Forbidden` errors
   - `NotFullyStored` during certification
   - Detection via SDK error callbacks
   - Resilience through erasure coding

2. **[Publisher Unavailability](./02-publisher-unavailability.md)** - Handling timeouts and connection issues during upload
   - Network unreachable and overload scenarios
   - Epoch mismatch handling
   - `RetryableWalrusClientError` hierarchy
   - Best practices for publisher selection

3. **[Aggregator Delays](./03-aggregator-delays.md)** - Dealing with network congestion and processing delays
   - Sources of delay (Sui network, sliver gathering, certification)
   - Timeout configuration
   - Asynchronous design patterns
   - Read performance optimization

4. **[Expired Storage](./04-expired-storage.md)** - Managing blob lifetime and handling expiration errors
   - `NotCurrentlyRegistered` error
   - Checking expiration status
   - Extending storage with `extendBlob()`
   - Graceful failure handling

5. **[Proof Mismatch Handling](./05-proof-mismatch-handling.md)** - Verifying data integrity and handling inconsistencies
   - `InconsistencyProof` and fraud proofs
   - `InvalidProof` and `Inconsistent` errors
   - Automatic verification in SDK
   - Client-side handling strategies

6. **[Patterns for Robust Retry](./06-robust-retry-patterns.md)** - Implementing exponential backoff and smart retries
   - Exponential backoff algorithm
   - Custom retry wrapper implementation
   - Idempotency considerations
   - Error-specific retry decisions

7. **[Patterns for Safe Fallback](./07-safe-fallback-patterns.md)** - Strategies for maintaining availability
   - Built-in redundancy fallback
   - Multi-provider client pattern
   - Graceful UI degradation
   - Local buffer for uploads
   - Circuit breaker pattern

8. **[Hands-On Lab: Debug a Failure Scenario](./08-hands-on-debug-scenario.md)** - Practical exercises
   - Debug a broken upload script
   - Implement retry logic with backoff
   - Handle specific error types
   - Compare with reference solution

## Prerequisites

Before starting this module, you should have:

- ✅ Basic TypeScript/JavaScript programming experience
- ✅ Understanding of async/await patterns
- ✅ Completed the `Walrus SDK with Upload Relay` module (recommended)
- ✅ Familiarity with HTTP status codes (429, 503, etc.)
- ✅ Node.js and npm installed for hands-on exercises

## Key Takeaways

- **Partial failures are normal**: Walrus is designed to handle node failures through erasure coding and quorum requirements.
- **Distinguish retryable vs. permanent errors**: Epoch changes and network issues are retryable; blocked content and invalid input are not.
- **Use exponential backoff with jitter**: Never retry immediately in a loop—it worsens outages.
- **Implement multiple fallback layers**: Redundancy at node level, aggregator level, and UI level.
- **The SDK handles most failures automatically**: High-level methods like `readBlob` retry internally.

## Next Steps

Start with **[Chunk Level Failures](./01-chunk-level-failures.md)** to understand the foundational error types, then work through each section to build your understanding of failure handling patterns.

