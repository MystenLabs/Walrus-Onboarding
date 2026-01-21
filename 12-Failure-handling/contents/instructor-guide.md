# Instructor's Guide: Module 12 - Failure Handling & Robustness

## Quick Reference

**Total Time:** 60-75 minutes

**Difficulty:** Intermediate

**Hands-on Components:** Yes - Debugging a Failure Scenario (20-30 min)

**Materials Needed:** Node.js environment, hands-on source code directory, `.env` with testnet mnemonic (`PASSPHRASE`), funded testnet account (SUI gas + WAL storage)

**Key Takeaways:**

- Partial failures are normal in distributed systems; Walrus handles them through erasure coding (2f+1 slivers needed)

- SDK errors fall into retryable (epoch changes, network timeouts) and non-retryable (blocked content, data corruption)

- Exponential backoff with jitter prevents overwhelming servers during retries

- High-level SDK methods (`readBlob`, `writeBlob`) handle retries automatically; manual logic needed for custom flows

- Storage expires after N epochs; use `getVerifiedBlobStatus()` and `executeExtendBlobTransaction()` proactively

## Prerequisites

### For Students

- Basic understanding of Walrus SDK (read/write operations)

- Familiarity with TypeScript/JavaScript async/await patterns

- Completed "Walrus SDK with Upload Relay" module (recommended)

- Understanding of HTTP status codes (429, 503, 4xx vs 5xx)

- Node.js and npm installed for hands-on exercises

- Testnet Sui mnemonic in `.env` (`PASSPHRASE`) with testnet SUI and WAL tokens

### For Instructor

- Familiarity with HTTP status codes and their meanings

- Understanding of Walrus Erasure Coding (Reed-Solomon) basics

- Reviewed the hands-on solution (`ts/debug-scenario-solution.ts`)

- Ability to explain exponential backoff algorithm

- Access to sample Walrus SDK code for demonstrations

## Classroom Setup

**Advance Prep (10 min before class):**

- [ ] Verify Node.js is installed on student machines

- [ ] Ensure access to hands-on source code: `docs/book/curriculum/failure_handling/hands-on-source-code/`

- [ ] Prepare `.env` with `PASSPHRASE` and verify testnet SUI + WAL balances

- [ ] Run `npm run debug-scenario` yourself to see the failure mode

- [ ] Prepare whiteboard diagram: "Simple Retry Loop" vs "Exponential Backoff with Jitter"

- [ ] Queue up key error classes to emphasize: `BlobNotCertifiedError`, `BlobBlockedError`, `RetryableWalrusClientError`

**Optional Materials:**

- Diagram showing retry timing (100ms → 200ms → 400ms → 800ms)

- Circuit breaker state diagram (Closed → Open → Half-Open)

## Instructor Cheat Sheet

1. **Chunk-Level Failures & SDK Errors (15 min):** SDK handles node failures transparently | 2f+1 slivers needed | Know the 4 main error types

2. **Publisher & Aggregator Issues (15 min):** Epoch changes → call `client.reset()` | Configure timeouts | Aggregator down ≠ data lost | Real testnet behavior

3. **Expired Storage & Data Integrity (10 min):** Blobs expire after N epochs | Only `permanent` blobs have `endEpoch` | Integrity verified automatically

4. **Robust Patterns (15 min):** Exponential backoff formula | Add jitter | Writes are idempotent | Circuit breaker pattern

5. **Hands-On Lab (20-30 min):** Run broken script → Implement retry → Compare with solution

---

## Section-by-Section Guidance

### Section 1: Chunk-Level Failures & SDK Errors (15 min)

**Student Material:**

- [Chunk Level Failures](./01-chunk-level-failures.md)

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- **SDK handles node failures transparently**: Individual storage node errors (404, 451, timeouts) are handled internally

- **Erasure Coding resilience**: You only need 2f+1 slivers—missing some is normal and handled automatically

- **Four main SDK errors students will encounter**:
  - `BlobNotCertifiedError` - blob doesn't exist or isn't certified
  - `BlobBlockedError` - content blocked by quorum of nodes (permanent)
  - `NotEnoughSliversReceivedError` - transient, retry with backoff
  - `InconsistentBlobError` - data integrity failure, do NOT use data

- **Error debugging**: Use `storageNodeClientOptions.onError` callback to log individual node failures

💡 **Teaching Tips:**

- Draw the sliver request diagram on whiteboard: Client → 5 nodes, 3 respond with slivers, 2 timeout → still succeeds

- Use analogy: "It's like asking 10 people for directions. You only need 7 correct answers to know the way, even if 3 don't respond."

- Emphasize that `BlobBlockedError` is permanent (content flagged) while `NotEnoughSliversReceivedError` is transient

- Show the error class hierarchy: `RetryableWalrusClientError` is the base class for retryable errors

⚠️ **Common Misconceptions:**

- "If one node fails, I lose my data." → Clarify erasure coding provides redundancy; 2f+1 is far less than total nodes

- "I need to handle every storage node error." → SDK handles them; focus on high-level errors only

- "All errors mean my data is lost." → Most errors are transient; only `BlobBlockedError` and `InconsistentBlobError` are permanent

💬 **Discussion Points:**

- "If 400 out of 1000 storage nodes are offline, will my read succeed?"
  - **Answer:** Likely yes - need 2f+1 slivers. If enough nodes respond (667+), read succeeds.

- "What's the difference between `BlobNotCertifiedError` and `BlobBlockedError`?"
  - **Answer:** NotCertified = blob may not exist or may be expired (retryable). Blocked = content flagged by quorum (permanent).

✅ **Quick Check:**

- Ask: "Which SDK error means the content is permanently unavailable?" (Answer: `BlobBlockedError`)

- Ask: "How many slivers do you need to reconstruct a blob?" (Answer: 2f+1)

- Quick quiz: "True or False: `NotEnoughSliversReceivedError` means your data is lost" (False - it's transient)

**Transition to Next Section:**

"Now that you know what errors the SDK throws, let's look at what happens when the infrastructure itself has issues - Publishers and Aggregators."

---

### Section 2: Publisher & Aggregator Issues (15 min)

**Student Material:**

- [Publisher Unavailability](./02-publisher-unavailability.md)
- [Aggregator Delays](./03-aggregator-delays.md)

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- **Publisher vs Aggregator roles**: Publisher = write entry point | Aggregator = read coordinator

- **Epoch Changes**: `RetryableWalrusClientError` often means stale committee info; call `client.reset()`

- **Timeout Configuration**: Adjust `storageNodeClientOptions.timeout` for large files (default is 30s)

- **Asynchronous Design**: Never block UI; use step-based flows (`writeFilesFlow`) for progress indication

- **Aggregator down ≠ data lost**: Storage nodes still have the data; aggregator is just an access point

💡 **Teaching Tips:**

- Draw the error handling decision tree on whiteboard (from 02-publisher-unavailability.md)

- Demonstrate timeout configuration: Show code with `timeout: 120_000` for 2-minute timeout

- Explain `client.reset()` vs simple retry: "Reset fetches fresh committee info; retry just repeats the same call"

- Use analogy: "Aggregator is like a librarian. If the librarian is sick, the books are still on the shelves."

- Show the `writeFilesFlow` stages: encode → register → upload → certify

⚠️ **Common Misconceptions:**

- "If the aggregator is down, my data is lost." → No, storage nodes still have it; just need another access point

- "Retrying is the same as calling `reset()`." → No, reset fetches new committee info; retry repeats with same state

- "All timeouts are bad." → Some timeouts are expected for large files; configure appropriately

- "5xx errors are permanent." → No, 5xx are server errors and are retryable

💬 **Discussion Points:**

- "If the aggregator is down, is the data lost?" (Answer: No, storage nodes still have it.)

- "What's the difference between `client.reset()` and retrying?" (Answer: Reset fetches fresh committee info.)

- "When would you increase the timeout beyond 30 seconds?"
  - **Answer:** Large file uploads/downloads, slow network conditions, high-latency regions.

✅ **Quick Check:**

- Ask: "After catching `RetryableWalrusClientError`, what should you do first?" (Call `client.reset()` then retry)

- Ask: "Which component handles writes: Publisher or Aggregator?" (Publisher)

- True/False: "HTTP 503 Service Unavailable is a permanent error" (False - retryable)

**Transition to Next Section:**

"We've covered network and infrastructure issues. Now let's talk about what happens when your stored data expires."

---

### Section 3: Expired Storage & Data Integrity (10 min)

**Student Material:**

- [Expired Storage](./04-expired-storage.md)
- [Proof Mismatch Handling](./05-proof-mismatch-handling.md)

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**

- **Storage has finite lifetime**: Epochs expire; data can be deleted after expiration

- **Check expiration proactively**: Use `getVerifiedBlobStatus()` to check status

- **Only `permanent` type blobs have `endEpoch`**: Deletable blobs use `initialCertifiedEpoch` instead

- **Extend storage before expiration**: Use `executeExtendBlobTransaction()` - cannot recover after expiration

- **Blob integrity verification is automatic**: SDK re-computes blob ID after decoding to verify

- **`InconsistentBlobError` is serious**: Never use data that fails verification

💡 **Teaching Tips:**

- Draw the blob lifecycle diagram: Upload → Active → (Extend or Expire) → Deleted

- Emphasize: "Once expired and deleted, it's gone from Walrus forever (unless you have the original file)"

- Show code example for checking status: `status.type === 'permanent'` then check `status.endEpoch`

- Explain the difference between `permanent` and `deletable` blob types and their status fields

- Demonstrate: "How would you set up a reminder to extend storage before expiration?"

⚠️ **Common Misconceptions:**

- "I can recover expired data." → Once expired and deleted, it's gone from Walrus

- "I need to verify each sliver." → SDK does whole-blob verification automatically

- "All blob types have `endEpoch`." → Only `permanent` blobs; `deletable` uses `initialCertifiedEpoch`

- "Storage is free." → Costs WAL tokens; extends also cost WAL tokens

💬 **Discussion Points:**

- "What happens if you forget to extend storage before expiration?"
  - **Answer:** Blob may be deleted by storage nodes. No guarantee of retrieval. Must re-upload (if you have original).

- "How would you build an alert system for expiring blobs?"
  - **Answer:** Periodically check `getVerifiedBlobStatus()`, compare `endEpoch` to current epoch, alert when close.

- "If `InconsistentBlobError` is thrown, what does that mean?"
  - **Answer:** The reconstructed data doesn't match the expected blob ID. Data may be corrupted or incorrectly encoded. Do NOT use.

✅ **Quick Check:**

- Ask: "Can you recover data after storage expires?" (No - must re-upload)

- Ask: "Which blob type has `endEpoch` in status?" (Only `permanent`)

- True/False: "`InconsistentBlobError` is retryable" (False - data integrity issue)

**Transition to Next Section:**

"Now that we understand what can fail, let's learn patterns for handling failures gracefully - retry logic and fallbacks."

---

### Section 4: Robust Patterns (15 min)

**Student Material:**

- [Patterns for Robust Retry](./06-robust-retry-patterns.md)
- [Patterns for Safe Fallback](./07-safe-fallback-patterns.md)

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- **Exponential Backoff**: `delay = base × 2^attempt` prevents overwhelming servers

- **Jitter**: Random delay prevents "thundering herd" when multiple clients retry simultaneously

- **High-level SDK methods auto-retry**: `readBlob`, `writeBlob` handle retries internally

- **Idempotency**: Walrus writes are idempotent (same blob = same ID), making retries safe

- **Fallback Patterns**:
  - Multi-provider client (list of aggregator URLs)
  - Graceful UI degradation (placeholders, cached content, retry buttons)
  - Local buffer (IndexedDB for offline retry)
  - Circuit breaker (stop hitting failing services)

💡 **Teaching Tips:**

- Draw the exponential backoff sequence on whiteboard: 100ms → 200ms → 400ms → 800ms → 1600ms

- Explain jitter visually: "Without jitter, 1000 clients retry at exactly 100ms. With jitter, they spread out."

- Show the circuit breaker state diagram: Closed → Open (after N failures) → Half-Open (test) → Closed/Open

- Use analogy for circuit breaker: "Like a fuse in your house - trips to prevent damage, tests periodically"

- Demonstrate the retry wrapper code from the curriculum

⚠️ **Common Misconceptions:**

- "Retry immediately in a loop." → Never! Use exponential backoff to avoid overwhelming servers

- "All errors should be retried." → No! 4xx client errors (except 429) indicate bad input, not transient failure

- "Circuit breaker is complex." → Basic implementation is simple; just count failures and time

- "SDK handles everything." → High-level methods do; low-level methods need manual retry logic

💬 **Discussion Points:**

- "Why add jitter to retry delays?" (Prevents synchronized retries from many clients - thundering herd)

- "Should you retry HTTP 400 Bad Request?" (No—it's a client error, input is wrong)

- "When would you implement a circuit breaker?"
  - **Answer:** When calling external services that may fail repeatedly. Prevents wasted requests and allows faster failover.

- "What makes Walrus writes idempotent?"
  - **Answer:** Same blob content = same blob ID. Re-uploading same blob doesn't create duplicates.

✅ **Quick Check:**

- Ask: "What's the formula for exponential backoff?" (`delay = base × 2^attempt`)

- Ask: "Why is jitter important?" (Prevents synchronized retries / thundering herd)

- True/False: "You should retry HTTP 400 errors" (False - client error, need to fix input)

- Ask: "Are Walrus writes idempotent?" (Yes - same blob = same ID)

**Transition to Next Section:**

"Theory is great, but let's put it into practice. Time for the hands-on lab!"

---

### Section 5: Hands-On Lab (20-30 min)

**Student Material:**

- [Debug a Failure Scenario](./08-hands-on-debug-scenario.md)

⏱️ **Duration:** 20-30 minutes

🎯 **Key Points to Emphasize:**

- **The broken code crashes on first error**: No retry logic, just `process.exit(1)`

- **Students implement**: `retryWithBackoff()` function, `isRetryableError()` function, jitter calculation

- **Real SDK on testnet**: Transient failures may occur; students' retry logic must handle them

- **Compare with reference solution**: `npm run solution` shows best practices

💡 **Teaching Tips:**

**Activity Flow:**

1. Have students run `npm install` in the lab directory (2 min)

2. Run the broken script: `npm run debug-scenario` - observe crash on first failure (2 min)

3. Challenge them to implement:
   - `retryWithBackoff()` function with exponential backoff
   - `isRetryableError()` to distinguish retryable vs non-retryable errors
   - Jitter in the delay calculation (15 min)

4. After ~15 minutes, show the reference solution: `npm run solution` (5 min)

5. Discuss key points in the solution (5 min):
   - Exponential backoff formula: `base × 2^attempt`
   - Jitter: `+ random(0, base)`
   - Error classification: 5xx/429 → retry, 4xx → fail fast

**Teaching Tips:**

- Walk around and check if students are checking error types, not just catching `any`

- Highlight that real testnet conditions can intermittently fail; proper backoff and jitter should eventually succeed

- If students get stuck, hint: "Check the error's `status` property for HTTP codes"

- Encourage pair programming for faster progress

⚠️ **Common Misconceptions:**

- "Just catch all errors and retry." → Must distinguish retryable vs non-retryable

- "Catching any error and retrying is enough." → No, handle `RetryableWalrusClientError` by calling `client.reset()`; distinguish HTTP 5xx/429 vs other 4xx

- "More retries is always better." → No, need max attempts to avoid infinite loops

💬 **Discussion Points:**

- "Why does the solution check `error.status` for HTTP codes?"
  - **Answer:** To distinguish 5xx (server error, retry) from 4xx (client error, don't retry)

- "What would happen without the max attempts limit?"
  - **Answer:** Infinite loop if the error is permanent

- "Why add jitter instead of fixed delays?"
  - **Answer:** Prevents multiple clients from retrying at exactly the same time

✅ **Quick Check:**

- Students should have working retry logic that handles transient testnet failures and succeeds

- Ask: "When should you call `client.reset()` during retries?" (After catching `RetryableWalrusClientError`)

- Ask: "What signals a retryable vs non-retryable error?" (Network errors, 5xx/429, Walrus retryable errors vs other 4xx)

- Review student implementations and provide feedback

**Troubleshooting:**

- **Issue**: `npm install` fails
  - **Fix**: Check Node.js version, clear npm cache

- **Issue**: Students don't know where to start
  - **Fix**: Point to the `// TODO: Implement retry logic here` comment

- **Issue**: Retry works but no jitter
  - **Fix**: Show formula: `delay + Math.random() * baseDelay`

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **Name two retryable SDK errors and two non-retryable errors.**
   - Expected: Retryable: `NotEnoughSliversReceivedError`, `BehindCurrentEpochError` | Non-retryable: `BlobBlockedError`, `InconsistentBlobError`

2. **What's the formula for exponential backoff?**
   - Expected: `delay = base × 2^attempt` (+ jitter)

3. **How do you check if a blob has expired?**
   - Expected: Use `getVerifiedBlobStatus()`, check `endEpoch` for permanent blobs

4. **What does `client.reset()` do?**
   - Expected: Refreshes committee information after epoch change

### Assessment Checklist

- [ ] Students can name SDK errors and explain which are retryable

- [ ] Students implemented working retry logic with exponential backoff

- [ ] Students understand how to check blob expiration status

- [ ] Students can explain the difference between `client.reset()` and simple retry

- [ ] Students completed the hands-on lab successfully

### Quick Poll

- "Raise your hand if you can explain exponential backoff to a colleague"

- "Thumbs up if you understand why jitter is important"

- "Show of hands: Who successfully got the retry script working?"

---

## SDK Errors Reference

| Error | Retryable? | Action |
|-------|------------|--------|
| `BlobNotCertifiedError` | Maybe | Check if blob exists; may be expired or never uploaded |
| `BlobBlockedError` | No | Content permanently blocked; cannot retrieve |
| `NotEnoughSliversReceivedError` | Yes | Retry with backoff |
| `InconsistentBlobError` | No | Data corrupted; do NOT use |
| `RetryableWalrusClientError` | Yes | Call `client.reset()` then retry |
| `BehindCurrentEpochError` | Yes | Call `client.reset()` then retry |

## Retry Logic Reference

- **Retryable conditions**: Network timeouts, 5xx errors, 429 Too Many Requests, `RetryableWalrusClientError`

- **Non-retryable**: 4xx client errors (except 429), `BlobBlockedError`, `InconsistentBlobError`

- **Backoff formula**: `delay = min(maxDelay, baseDelay × 2^attempt) + random(0, baseDelay)`

## Key Methods Reference

| Method | Purpose |
|--------|---------|
| `client.reset()` | Refresh committee info after epoch change |
| `getVerifiedBlobStatus()` | Check blob existence and expiration |
| `executeExtendBlobTransaction()` | Extend storage before expiration |
| `storageNodeClientOptions.onError` | Debug individual node failures |
| `storageNodeClientOptions.timeout` | Configure request timeout (default 30s) |

---

## Additional Resources

### For Students

- [Walrus TypeScript SDK Source](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus)

- [Exponential Backoff and Jitter (AWS Blog)](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

- [Circuit Breaker Pattern - Release It! by Michael Nygard](https://pragprog.com/titles/mnee2/release-it-second-edition/)

### For Instructors

- Sample solution: `hands-on-source-code/ts/debug-scenario-solution.ts`

- Error class definitions: `@mysten/walrus/src/error.ts`

---

## Notes for Next Module

Students should now be ready for:

- Performance optimization (parallel uploads, caching strategies)

- Production deployment considerations

- Advanced SDK patterns (custom retry strategies, monitoring)

**Key Concepts to Reinforce in Future Modules:**

- Verification is critical (blob IDs, on-chain state)

- Failures are normal - design for resilience

- Log analysis for troubleshooting

- Cost optimization (storage duration, blob sizes)
