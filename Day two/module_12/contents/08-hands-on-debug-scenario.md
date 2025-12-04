# Hands-on: Debugging Failure Scenarios

In this lab, you will debug a provided script that attempts to interact with Walrus but fails due to simulated or real network/logic errors.

## The Scenario

You have a script `debug-scenario.ts` that is supposed to:
1.  Upload a blob.
2.  Read it back.
3.  Handle "simulated" network failures.

However, the current implementation crashes on the first error. Your task is to implement robust retry logic and error handling.

## Setup

Navigate to the source code directory:

```bash
cd docs/book/curriculum/failure_handling/hands-on-source-code
npm install
```

## The Broken Code

The initial code looks like this (simplified):

```typescript
// It simply tries once and fails if any issue occurs
try {
    const blobId = await client.storeBlob(data);
} catch (e) {
    console.error("Upload failed!");
    process.exit(1); // Hard crash
}
```

> **Note**: This lab uses a `MockClient` with a `storeBlob()` method to simulate failures without requiring network access. In the real Walrus SDK, you would use `client.writeBlob({ blob, epochs, signer })` instead.

## Your Task

1.  **Implement a Retry Loop**: Create a function `retryWithBackoff` that retries failed operations with exponential backoff.
2.  **Handle Specific Errors**: Create an `isRetryableError()` function that retries network errors and 5xx/429 HTTP errors, but fails fast on 4xx client errors.
3.  **Test with Mock Failures**: The `MockClient` simulates random failures (network errors, 503 Service Unavailable) for the first 2 attempts, then succeeds.

## Running the Solution

Modify `ts/debug-scenario.ts` to implement the fixes.

Run your code:
```bash
npm run debug-scenario
```

Once you've completed your implementation, you can compare against the reference solution:
```bash
npm run solution
```

## Expected Output

Instead of crashing, you should see retry behavior:
```text
Starting upload with retry logic...

[MockClient] Attempt 1 to store blob...
Attempt 1 failed: Service Unavailable
Retrying in 112ms...
[MockClient] Attempt 2 to store blob...
Attempt 2 failed: Network Error: Connection refused
Retrying in 215ms...
[MockClient] Attempt 3 to store blob...

✅ Success! Blob ID: blob_id_success_12345
```

> **Note**: The exact error messages and delays will vary due to randomization and jitter.


