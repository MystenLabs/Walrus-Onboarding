# Hands-on: Debugging Failure Scenarios

In this lab, you will debug a provided script that uses the real Walrus SDK on testnet. The starter script crashes on the first error; your job is to add robust retry logic and handle transient failures correctly.

## The Scenario

You have a script `ts/debug-scenario.ts` that is supposed to:
1. Upload a file to Walrus (testnet).
2. Read it back.
3. Handle transient network/service failures gracefully.

However, the current implementation includes a placeholder `retryWithBackoff` that intentionally throws. The script will fail immediately until you implement real retry logic and error handling.

## Setup

1) Navigate to the source code directory and install deps:

```bash
cd docs/book/curriculum/failure_handling/hands-on-source-code
npm install
```

2) Create a `.env` file with your testnet mnemonic:

```ini
PASSPHRASE="word1 word2 ... word12"
# Optional overrides
# DERIVATION_PATH=m/44'/784'/0'/0'/0'
# FILE=./sample/hello.txt
# EPOCHS=1
# AGGREGATOR_URL=https://your-aggregator
```

3) Ensure the account has testnet SUI (for gas) and WAL tokens (for storage).

## The Broken Code

The starter code is intentionally minimal and fails on the first error:

```typescript
// Placeholder in starter code (intentionally broken):
async function retryWithBackoff(fn) {
  throw new Error("Retry logic not implemented");
}

// All network operations are routed through this and will fail
const blobId = await retryWithBackoff(() => client.writeBlob({ /* ... */ }));
```

## Your Task

1. Implement a simple `retryWithBackoff(fn, client?)`: fixed attempts (4), base delay 200ms, exponential backoff + jitter, capped at ~2000ms.
2. Implement `isRetryableError`: retry on network errors, HTTP 429/5xx, and `RetryableWalrusClientError`; fail fast on other 4xx.
3. Reset on Walrus transient errors: if error is `RetryableWalrusClientError` and a client is provided, call `client.reset()` before retrying.
4. Use the retry wrapper for both operations: `writeBlob` and `readBlob`.

Example shape (keep it simple):

```ts
async function retryWithBackoff<T>(fn: () => Promise<T>, client?: WalrusClient): Promise<T> {
  const maxAttempts = 4, base = 200, max = 2000;
  let last: any;
  for (let i = 1; i <= maxAttempts; i++) {
    try { return await fn(); } catch (err: any) {
      last = err;
      if (!isRetryableError(err)) throw err;
      if (err instanceof RetryableWalrusClientError && client) client.reset();
      if (i === maxAttempts) break;
      const delay = Math.min(base * 2 ** (i - 1) + Math.random() * base, max);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw last ?? new Error('Retry failed');
}
```

## Running the Lab

Modify `ts/debug-scenario.ts` to implement the fixes, then run:

```bash
npm run debug-scenario
```

Note: Before you add retries, running `npm run debug-scenario` will fail immediately. The script prints a clear message explaining why:

```text
Starting upload (no retries)...
Note: This scenario intentionally omits retry logic; transient failures are expected.

❌ Expected failure: this scenario has no retry logic.
Without retries/backoff, network hiccups or Walrus epoch changes can cause operations to fail.
Add retry logic to make this robust (try: `npm run solution`).
Original error: <actual error details>
```

Compare with the reference solution:

```bash
npm run solution
```

## Expected Output

Instead of crashing, you should see retry behavior, then a successful round trip:

```text
Reading file: /.../sample/hello.txt
Starting upload with retry logic...
Attempt 1 failed: Service Unavailable
Retrying in 212ms...
Attempt 2 failed: network timeout
Retrying in 436ms...

✅ Uploaded. Blob ID: 0x...abcd
📖 Read back text: Hello Walrus – real test upload.
Match with source: ✅ Yes
```

Note: Exact errors, delays, and blob ID will vary.
