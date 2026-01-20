# 11. How to Surface Meaningful Errors to Callers

Proper error handling is essential for building reliable applications. The Walrus SDK provides a structured error hierarchy that helps you surface meaningful errors to your application's callers.

## Error Types

### Retryable Errors

Errors that extend `RetryableWalrusClientError` indicate transient issues that might be resolved by retrying:

- `NoBlobMetadataReceivedError`: Could not retrieve metadata (network issue)
- `NotEnoughSliversReceivedError`: Could not get enough slivers (node failures)
- `NotEnoughBlobConfirmationsError`: Not enough nodes confirmed (temporary node issues)
- `BehindCurrentEpochError`: Client is behind current epoch (sync issue)
- `BlobNotCertifiedError`: Blob not certified (might be timing issue)

### Permanent Errors

Errors that don't extend `RetryableWalrusClientError` indicate permanent issues:

- `InconsistentBlobError`: Blob encoding is incorrect (data corruption)
- `BlobBlockedError`: Blob is blocked by nodes (legal/content issue)
- `NoBlobStatusReceivedError`: Could not get status (might be permanent)

## User-Friendly Error Messages

Transform SDK errors into user-friendly messages:

```typescript
function getUserFriendlyError(error: Error): string {
  if (error instanceof NotEnoughBlobConfirmationsError) {
    return 'Upload failed: Not enough storage nodes confirmed. Please try again.';
  }
  
  if (error instanceof NotEnoughSliversReceivedError) {
    return 'Download failed: Could not retrieve enough data. Please try again.';
  }
  
  if (error instanceof BlobNotCertifiedError) {
    return 'Blob not found or not yet certified.';
  }
  
  if (error instanceof BlobBlockedError) {
    return 'This content is not available.';
  }
  
  if (error instanceof InconsistentBlobError) {
    return 'Data integrity check failed. The blob may be corrupted.';
  }
  
  if (error instanceof WalrusClientError) {
    return `Storage error: ${error.message}`;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Usage
try {
  await client.walrus.writeBlob({ blob, deletable: true, epochs: 3, signer: keypair });
} catch (error) {
  const message = getUserFriendlyError(error as Error);
  showUserNotification(message);
  throw error;
}
```

## Error Context Preservation

Preserve error context when wrapping errors:

```typescript
class UploadError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly blobId?: string,
    public readonly attempt?: number
  ) {
    super(message);
    this.name = 'UploadError';
    this.stack = originalError.stack;
  }
}

async function uploadWithContext(blob: Uint8Array) {
  let attempt = 0;
  const maxRetries = 3;
  
  while (attempt < maxRetries) {
    try {
      const result = await client.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
      
      return result;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw new UploadError(
          `Upload failed after ${maxRetries} attempts`,
          error as Error,
          undefined,
          attempt
        );
      }
      
      // Retry logic...
    }
  }
}
```

## Error Classification

Classify errors for different handling strategies:

```typescript
type ErrorCategory = 'network' | 'validation' | 'permission' | 'unknown';

function classifyError(error: Error): ErrorCategory {
  if (error instanceof NotEnoughBlobConfirmationsError ||
      error instanceof NotEnoughSliversReceivedError ||
      error instanceof NoBlobMetadataReceivedError) {
    return 'network';
  }
  
  if (error instanceof InconsistentBlobError) {
    return 'validation';
  }
  
  if (error instanceof BlobBlockedError) {
    return 'permission';
  }
  
  return 'unknown';
}

async function handleUpload(blob: Uint8Array) {
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    const category = classifyError(error as Error);
    
    switch (category) {
      case 'network':
        // Retry with backoff
        return retry(
          () => client.walrus.writeBlob({
            blob,
            deletable: true,
            epochs: 3,
            signer: keypair,
          }),
          { count: 3, delay: 1000 }
        );
      
      case 'validation':
        // Don't retry, show error
        throw new Error('Invalid data. Please check your input.');
      
      case 'permission':
        // Show permission error
        throw new Error('Access denied. This content is not available.');
      
      default:
        throw error;
    }
  }
}
```

## Debugging Information

Include debugging information in error messages for development:

```typescript
function createErrorWithDebugInfo(error: Error, context: Record<string, any>): Error {
  const debugInfo = {
    errorType: error.constructor.name,
    errorMessage: error.message,
    context,
    stack: error.stack,
  };
  
  // In development, include full debug info
  if (process.env.NODE_ENV === 'development') {
    const debugMessage = `${error.message}\n\nDebug Info:\n${JSON.stringify(debugInfo, null, 2)}`;
    const debugError = new Error(debugMessage);
    debugError.stack = error.stack;
    return debugError;
  }
  
  // In production, return user-friendly error
  return error;
}

async function uploadWithDebugInfo(blob: Uint8Array) {
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    throw createErrorWithDebugInfo(error as Error, {
      blobSize: blob.length,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Error Logging

Log errors with appropriate detail levels:

```typescript
class ErrorLogger {
  logError(error: Error, context: Record<string, any> = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    };
    
    // Log to your logging service
    console.error('Walrus Error:', logEntry);
    
    // Send to error tracking service (e.g., Sentry)
    if (this.shouldReport(error)) {
      this.reportToService(logEntry);
    }
  }
  
  private shouldReport(error: Error): boolean {
    // Don't report retryable errors that are expected
    if (error instanceof RetryableWalrusClientError) {
      return false;
    }
    
    return true;
  }
  
  private reportToService(logEntry: any) {
    // Send to error tracking service
  }
}

const logger = new ErrorLogger();

async function uploadWithLogging(blob: Uint8Array) {
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    logger.logError(error as Error, {
      operation: 'upload',
      blobSize: blob.length,
    });
    throw error;
  }
}
```

## Error Recovery Suggestions

Provide recovery suggestions in error messages:

```typescript
function getRecoverySuggestion(error: Error): string | null {
  if (error instanceof NotEnoughBlobConfirmationsError) {
    return 'Try again in a few moments. The network may be experiencing temporary issues.';
  }
  
  if (error instanceof NotEnoughSliversReceivedError) {
    return 'Try downloading again. Some storage nodes may be temporarily unavailable.';
  }
  
  if (error instanceof BlobNotCertifiedError) {
    return 'The blob may still be processing. Please wait a moment and try again.';
  }
  
  if (error instanceof BehindCurrentEpochError) {
    return 'Your client is out of sync. Please refresh and try again.';
  }
  
  return null;
}

async function uploadWithSuggestions(blob: Uint8Array) {
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    const suggestion = getRecoverySuggestion(error as Error);
    
    if (suggestion) {
      throw new Error(`${error.message}. ${suggestion}`);
    }
    
    throw error;
  }
}
```

## Best Practices

1. **Use Error Types**: Check error types to determine handling
2. **Preserve Context**: Include relevant context in error messages
3. **User-Friendly Messages**: Transform technical errors into user-friendly messages
4. **Log Appropriately**: Log errors with appropriate detail levels
5. **Provide Suggestions**: Include recovery suggestions when possible
6. **Don't Swallow Errors**: Always handle or rethrow errors appropriately

## Example: Complete Error Handling

```typescript
async function uploadWithCompleteErrorHandling(blob: Uint8Array) {
  try {
    const result = await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Classify error
    const category = classifyError(error as Error);
    const isRetryable = error instanceof RetryableWalrusClientError;
    
    // Log error
    logger.logError(error as Error, {
      operation: 'upload',
      category,
      isRetryable,
      blobSize: blob.length,
    });
    
    // Get user-friendly message
    const userMessage = getUserFriendlyError(error as Error);
    const suggestion = getRecoverySuggestion(error as Error);
    
    return {
      success: false,
      error: {
        message: userMessage,
        suggestion,
        category,
        isRetryable,
        originalError: process.env.NODE_ENV === 'development' ? error : undefined,
      },
    };
  }
}
```

## Key Takeaways

- Use the SDK's error hierarchy to classify errors
- Transform technical errors into user-friendly messages
- Preserve error context for debugging
- Log errors with appropriate detail levels
- Provide recovery suggestions when possible
- Handle retryable and permanent errors differently
- Include debugging information in development mode

