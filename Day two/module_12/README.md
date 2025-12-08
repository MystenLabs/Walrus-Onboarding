# Module 12: Failure Handling & Robustness

Welcome to Module 12 of the Walrus Training Program! This module provides comprehensive training on building resilient Walrus applications that handle failures gracefully, implement robust retry logic, and maintain reliability even when individual components fail.

## 📚 Overview

This module teaches you how to:

- Understand and handle various error types returned by Walrus nodes and the SDK
- Implement robust retry strategies with exponential backoff and jitter
- Build fallback patterns for maintaining availability during outages
- Handle chunk-level failures through erasure coding redundancy
- Manage expired storage and blob lifecycle issues
- Verify data integrity and handle proof mismatches
- Create seamless user experiences despite network failures

## 🎯 Learning Objectives

By completing this module, you will be able to:

1. **Handle failure in a predictable way** - Understand the various error types returned by Walrus nodes and the SDK, and know how to respond to them

2. **Build robust client logic** - Implement retry strategies, fallback patterns, and error handling to create a seamless user experience

## 📖 Curriculum Structure

The module is organized into 8 comprehensive lessons:

### Understanding Failures

1. **[Chunk Level Failures](./contents/01-chunk-level-failures.md)** - Sliver availability and storage errors
   - `Unavailable` and `Forbidden` errors
   - `NotFullyStored` during certification
   - Detection via SDK error callbacks
   - Resilience through erasure coding (only need 2f+1 slivers)

2. **[Publisher Unavailability](./contents/02-publisher-unavailability.md)** - Timeouts and connection issues during upload
   - Network unreachable and overload scenarios
   - Epoch mismatch handling
   - `RetryableWalrusClientError` hierarchy
   - Best practices for publisher selection

3. **[Aggregator Delays](./contents/03-aggregator-delays.md)** - Network congestion and processing delays
   - Sources of delay (Sui network, sliver gathering, certification)
   - Timeout configuration strategies
   - Asynchronous design patterns
   - Read performance optimization

### Data Lifecycle Issues

4. **[Expired Storage](./contents/04-expired-storage.md)** - Blob lifetime and handling expiration errors
   - `NotCurrentlyRegistered` error handling
   - Checking expiration status before operations
   - Extending storage with `extendBlob()`
   - Graceful failure and user notification

5. **[Proof Mismatch Handling](./contents/05-proof-mismatch-handling.md)** - Data integrity verification
   - `InconsistencyProof` and fraud proofs
   - `InvalidProof` and `Inconsistent` errors
   - Automatic verification in SDK
   - Client-side handling strategies

### Robust Patterns

6. **[Patterns for Robust Retry](./contents/06-robust-retry-patterns.md)** - Exponential backoff and smart retries
   - Exponential backoff algorithm with jitter
   - Custom retry wrapper implementation
   - Idempotency considerations
   - Error-specific retry decisions (retryable vs. permanent)

7. **[Patterns for Safe Fallback](./contents/07-safe-fallback-patterns.md)** - Maintaining availability strategies
   - Built-in redundancy fallback
   - Multi-provider client pattern
   - Graceful UI degradation
   - Local buffer for uploads
   - Circuit breaker pattern

### Practice

8. **[Hands-On Lab: Debug a Failure Scenario](./contents/08-hands-on-debug-scenario.md)** - Practical debugging exercise
   - Debug a broken upload script
   - Implement retry logic with backoff
   - Handle specific error types appropriately
   - Compare with reference solution


## 💻 Hands-On Code Examples

The `hands-on-source-code/` directory contains practical TypeScript examples:

```
hands-on-source-code/
├── ts/
│   ├── debug-scenario.ts          # Broken code - students fix this
│   └── debug-scenario-solution.ts # Complete solution with retry patterns
├── package.json
├── tsconfig.json
└── README.md
```

- **debug-scenario.ts**: A deliberately buggy upload script for debugging practice
- **debug-scenario-solution.ts**: Complete implementation with proper error handling and retry logic

See the hands-on lab in [contents/08-hands-on-debug-scenario.md](./contents/08-hands-on-debug-scenario.md) for detailed instructions.

## 🐳 Docker Environment

The `docker/` directory provides a containerized environment for running the hands-on exercises:

```sh
cd docker/
make build      # Build the Docker image
make test       # Run the debug scenario (broken code)
make solution   # Run the solution
make shell      # Open interactive shell
```

This is useful for consistent environments without local Node.js setup. See [docker/README.md](./docker/README.md) for details.

## 👨‍🏫 Instructor Resources

- **[Instructor Guide](./contents/instructor-guide.md)** - Teaching notes, timing suggestions, discussion points, and assessment checklists for instructors delivering this module.

---

**Ready to start?** Head to [contents/index.md](./contents/index.md) or jump straight to [Lesson 1: Chunk Level Failures](./contents/01-chunk-level-failures.md)!

