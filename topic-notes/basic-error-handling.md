# Basic Error Handling

## Key Concepts

- Walrus SDK errors split into two categories: **retryable** (extend `RetryableWalrusClientError`) and **permanent** (do not retry).
- Retryable errors are transient network/quorum issues; permanent errors indicate corruption, content policy violations, or unrecoverable state.
- The SDK's high-level methods (`readBlob`, `writeBlob`) apply internal retry logic automatically; custom wrappers are needed for lower-level operations.
- **Exponential backoff with jitter** is the standard pattern: `delay = base × 2^attempt + random(jitter)`. This avoids overwhelming nodes and prevents synchronized retries from multiple clients.
- Always distinguish error types before deciding whether to retry — never retry `InconsistentBlobError`.
- The SDK's internal `retry()` helper is not exported; copy the implementation or build your own wrapper.

## Error Reference

### Retryable Errors (`extends RetryableWalrusClientError`)

| Error Class | Meaning |
|---|---|
| `NotEnoughBlobConfirmationsError` | Not enough nodes confirmed (quorum failure during write) |
| `NotEnoughSliversReceivedError` | Could not gather enough slivers (read path) |
| `NoBlobMetadataReceivedError` | Metadata fetch failed across all nodes |
| `BehindCurrentEpochError` | Client is behind current epoch — sync issue |
| `BlobNotCertifiedError` | Blob not certified yet — may be timing issue |

### Permanent Errors (do not retry)

| Error Class | Meaning |
|---|---|
| `InconsistentBlobError` | Blob encoding is incorrect — data corruption |
| `BlobBlockedError` | Blob blocked by nodes — content/legal issue |
| `NoBlobStatusReceivedError` | Status unavailable — may be permanent |

## SDK / Code

### User-Friendly Error Messages

```typescript
function getUserFriendlyError(error: Error): string {
  if (error instanceof NotEnoughBlobConfirmationsError)
    return 'Upload failed: Not enough storage nodes confirmed. Please try again.';
  if (error instanceof NotEnoughSliversReceivedError)
    return 'Download failed: Could not retrieve enough data. Please try again.';
  if (error instanceof BlobNotCertifiedError)
    return 'Blob not found or not yet certified.';
  if (error instanceof BlobBlockedError)
    return 'This content is not available.';
  if (error instanceof InconsistentBlobError)
    return 'Data integrity check failed. The blob may be corrupted.';
  if (error instanceof WalrusClientError)
    return `Storage error: ${error.message}`;
  return 'An unexpected error occurred. Please try again.';
}
```

### Retry Helper (copied from SDK internals)

```typescript
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    condition?: (error: Error) => boolean;
    count?: number;
    delay?: number;
    jitter?: number;
  },
): Promise<T> {
  let remaining = options.count ?? 3;
  while (remaining > 0) {
    try {
      remaining -= 1;
      return await fn();
    } catch (error) {
      if (remaining <= 0 || (options.condition && !options.condition(error as Error))) {
        throw error;
      }
      if (options.delay) {
        await new Promise((resolve) =>
          setTimeout(resolve, (options.delay ?? 1000) + Math.random() * (options.jitter ?? 0)),
        );
      }
    }
  }
  throw new Error('Retry count exceeded');
}
```

### Conditional Retry (only retryable errors)

```typescript
const result = await retry(
  () => client.writeBlob({ blob, deletable: true, epochs: 3, signer: keypair }),
  {
    count: 5,
    delay: 1000,
    jitter: 500,
    condition: (error) => error instanceof RetryableWalrusClientError,
  },
);
```

### Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  baseDelay = 100,
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) throw error;
      // 2^attempt × baseDelay + random jitter
      const delay = Math.pow(2, attempt) * baseDelay + Math.random() * baseDelay;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### Error Classification

```typescript
type ErrorCategory = 'network' | 'validation' | 'permission' | 'unknown';

function classifyError(error: Error): ErrorCategory {
  if (error instanceof NotEnoughBlobConfirmationsError ||
      error instanceof NotEnoughSliversReceivedError ||
      error instanceof NoBlobMetadataReceivedError) return 'network';
  if (error instanceof InconsistentBlobError) return 'validation';
  if (error instanceof BlobBlockedError) return 'permission';
  return 'unknown';
}
```

### Smart Retry (adaptive delays by error type)

```typescript
// Confirmation failures need longer waits than metadata issues
const delay =
  error instanceof NotEnoughBlobConfirmationsError ? 2000 * attempt : 1000 * attempt;
await new Promise((resolve) => setTimeout(resolve, delay));
```

## Source Files

- `07-Walrus-SDK-upload-relay/contents/11-error-handling.md`
- `07-Walrus-SDK-upload-relay/contents/09-retry-patterns.md`
- `12-Failure-handling/contents/06-robust-retry-patterns.md`
