# Instructor's Guide: Failure Handling & Robustness

## Module Overview

| Feature | Details |
| :--- | :--- |
| **Total Estimated Time** | 60-75 Minutes |
| **Hands-On Components** | Yes - Debugging a Failure Scenario |

## Learning Objectives

By the end of this module, students should be able to:

- **Handle failure in a predictable way**: Distinguish between transient errors (retryable) and permanent errors (non-retryable).
- **Build robust client logic**: Implement exponential backoff with jitter and multi-provider fallbacks.
- **Diagnose issues**: Identify if a failure is due to storage expiration, network issues, or data corruption.

## Prerequisites

### For Students

- Basic understanding of Walrus SDK (read/write operations).
- Familiarity with TypeScript/JavaScript async/await.
- Completed "Walrus SDK with Upload Relay" module (recommended).

### For Instructor

- Familiarity with HTTP status codes (429, 503, 4xx vs 5xx).
- Understanding of Walrus Erasure Coding (Reed-Solomon) basics (why partial failure is okay).
- Reviewed the solution for the hands-on lab (`ts/debug-scenario-solution.ts`).

## Classroom Setup & Preparation

**Materials Needed:**
- Node.js environment installed.
- Access to the hands-on source code directory: `docs/book/curriculum/failure_handling/hands-on-source-code/`.

**Advance Prep Tasks:**
- Run the `debug-scenario.ts` script yourself to see the failure mode.
- Prepare a whiteboard diagram showing the difference between "Simple Retry" (loop) and "Exponential Backoff with Jitter".

## Section-by-Section Guidance

### Section 1: Chunk-Level Failures & SDK Errors (Time: 15 min)

**Reference Material:**
- [Chunk Level Failures](./01-chunk-level-failures.md)

**Key Points to Emphasize:**
- **SDK handles node failures transparently**: Individual storage node errors (404, 451, timeouts) are handled internally.
- **Erasure Coding**: You only need 2f+1 slivers—missing some is normal and handled automatically.
- **Know the SDK errors students will actually see**:
  - `BlobNotCertifiedError` - blob doesn't exist or isn't certified
  - `BlobBlockedError` - content blocked by quorum of nodes
  - `NotEnoughSliversReceivedError` - transient, retry with backoff
  - `InconsistentBlobError` - data integrity failure, do NOT use data

**Common Misconceptions:**
- "If one node fails, I lose my data." → Clarify erasure coding provides redundancy.
- "I need to handle every storage node error." → SDK handles them; focus on high-level errors.

**Quick Check:**
- Ask: "Which SDK error means the content is permanently unavailable?" (Answer: `BlobBlockedError`)

---

### Section 2: Publisher & Aggregator Issues (Time: 15 min)

**Reference Material:**
- [Publisher Unavailability](./02-publisher-unavailability.md)
- [Aggregator Delays](./03-aggregator-delays.md)

**Key Points to Emphasize:**
- **Publisher vs Aggregator**: Publisher = write entry point, Aggregator = read coordinator.
- **Epoch Changes**: `RetryableWalrusClientError` often means stale committee info; call `client.reset()`.
- **Timeouts**: Adjust `storageNodeClientOptions.timeout` for large files.
- **Asynchronous Design**: Never block UI; use step-based flows (`writeFilesFlow`) for progress indication.

**Discussion Points:**
- "If the aggregator is down, is the data lost?" (Answer: No, storage nodes still have it.)
- "What's the difference between `client.reset()` and retrying?" (Reset fetches fresh committee info.)

---

### Section 3: Expired Storage & Data Integrity (Time: 10 min)

**Reference Material:**
- [Expired Storage](./04-expired-storage.md)
- [Proof Mismatch Handling](./05-proof-mismatch-handling.md)

**Key Points to Emphasize:**
- **Storage has finite lifetime**: Epochs expire; data can be deleted after expiration.
- **Use `getVerifiedBlobStatus()`**: Check `endEpoch` proactively.
- **Use `executeExtendBlob()`**: Extend storage BEFORE expiration.
- **Blob integrity verification is automatic**: SDK re-computes blob ID after decoding to verify.
- **`InconsistentBlobError` is serious**: Never use data that fails verification.

**Common Misconceptions:**
- "I can recover expired data." → Once expired and deleted, it's gone from Walrus (unless you have the original file).
- "I need to verify each sliver." → SDK does whole-blob verification automatically.

---

### Section 4: Robust Patterns (Time: 15 min)

**Reference Material:**
- [Patterns for Robust Retry](./06-robust-retry-patterns.md)
- [Patterns for Safe Fallback](./07-safe-fallback-patterns.md)

**Key Points to Emphasize:**
- **Exponential Backoff**: `delay = base × 2^attempt` prevents overwhelming servers.
- **Jitter**: Random delay prevents "thundering herd" when multiple clients retry.
- **High-level SDK methods auto-retry**: `readBlob`, `writeBlob` handle retries internally.
- **Idempotency**: Walrus writes are idempotent (same blob = same ID), making retries safe.

**Fallback Patterns:**
- **Multi-provider client**: Maintain list of aggregator URLs.
- **Graceful UI degradation**: Placeholders, cached content, retry buttons.
- **Local buffer**: Store pending uploads in IndexedDB for offline retry.
- **Circuit breaker**: Stop hitting failing services; test recovery periodically.

**Discussion Points:**
- Why add jitter? (Prevents synchronized retries from many clients.)
- Should you retry 400 Bad Request? (No—it's a client error, not transient.)

---

### Section 5: Hands-On Lab (Time: 20-30 min)

**Reference Material:**
- [Debug a Failure Scenario](./08-hands-on-debug-scenario.md)

**Activity Flow:**
1. Have students run `npm install` in the lab directory.
2. Run the broken script: `npm run debug-scenario`. Observe the crash on first failure.
3. Challenge them to implement:
   - `retryWithBackoff()` function
   - `isRetryableError()` to distinguish retryable vs non-retryable errors
   - Jitter in the delay calculation
4. After ~15 minutes, show the reference solution: `npm run solution`.
5. Discuss key points in the solution:
   - Exponential backoff formula: `base × 2^attempt`
   - Jitter: `+ random(0, base)`
   - Error classification: 5xx/429 → retry, 4xx → fail fast

**Teaching Tips:**
- Walk around and check if students are checking error types, not just catching `any`.
- Highlight that the mock client simulates 2 failures then succeeds—this tests their retry logic.

---

## Assessment Checklist

- [ ] **Objective 1 Check:** Can the student name two SDK errors and explain which is retryable?
  - Retryable: `NotEnoughSliversReceivedError`, `BehindCurrentEpochError`
  - Non-retryable: `BlobBlockedError`, `InconsistentBlobError`
- [ ] **Objective 2 Check:** Did the student implement working retry logic with exponential backoff?
- [ ] **Objective 3 Check:** Can the student explain how to check if a blob has expired?

## Instructor Cheat Sheet

### SDK Errors Summary

| Error | Retryable? | Action |
|-------|------------|--------|
| `BlobNotCertifiedError` | Maybe | Check if blob exists; may be expired or never uploaded |
| `BlobBlockedError` | No | Content permanently blocked; cannot retrieve |
| `NotEnoughSliversReceivedError` | Yes | Retry with backoff |
| `InconsistentBlobError` | No | Data corrupted; do NOT use |
| `RetryableWalrusClientError` | Yes | Call `client.reset()` then retry |

### Retry Logic

- **Retryable conditions**: Network timeouts, 5xx errors, 429 Too Many Requests, `RetryableWalrusClientError`
- **Non-retryable**: 4xx client errors (except 429), `BlobBlockedError`, `InconsistentBlobError`
- **Backoff formula**: `delay = min(maxDelay, baseDelay × 2^attempt) + random(0, baseDelay)`

### Key Methods

| Method | Purpose |
|--------|---------|
| `client.reset()` | Refresh committee info after epoch change |
| `getVerifiedBlobStatus()` | Check blob existence and expiration |
| `executeExtendBlob()` | Extend storage before expiration |
| `storageNodeClientOptions.onError` | Debug individual node failures |

## Additional Resources

- [Walrus TypeScript SDK Source](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus)
- [Exponential Backoff and Jitter (AWS Blog)](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Circuit Breaker Pattern - Release It! by Michael Nygard](https://pragprog.com/titles/mnee2/release-it-second-edition/)

