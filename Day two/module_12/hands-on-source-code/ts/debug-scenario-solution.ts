/**
 * Solution: Debugging Failure Scenarios
 * 
 * This file demonstrates proper retry logic and error handling
 * for Walrus operations.
 */

export {}; // Make this an ES module to avoid global scope conflicts

// --- Mock Client Wrapper to Simulate Failures ---
// In a real scenario, you would import and use the actual WalrusClient.

class MockClient {
    private attemptCount = 0;

    async storeBlob(data: string): Promise<string> {
        this.attemptCount++;
        console.log(`[MockClient] Attempt ${this.attemptCount} to store blob...`);

        // Simulate 2 failures then success
        if (this.attemptCount < 3) {
            if (Math.random() > 0.5) {
                throw new Error("Network Error: Connection refused");
            } else {
                const err: any = new Error("Service Unavailable");
                err.status = 503;
                throw err;
            }
        }

        return "blob_id_success_12345";
    }
}

// --- Solution: Retry Logic with Exponential Backoff ---

interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    jitter?: boolean;
}

/**
 * Determines if an error is retryable.
 * - Network errors (connection refused, timeout) -> retry
 * - HTTP 5xx errors (503 Service Unavailable) -> retry
 * - HTTP 429 Too Many Requests -> retry
 * - HTTP 4xx client errors (except 429) -> do NOT retry
 */
function isRetryableError(error: any): boolean {
    // Network-level errors
    if (error.message?.includes("Network Error") || 
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNREFUSED")) {
        return true;
    }
    
    // HTTP status-based errors
    if (typeof error.status === 'number') {
        // 5xx server errors are retryable
        if (error.status >= 500 && error.status < 600) {
            return true;
        }
        // 429 Too Many Requests is retryable
        if (error.status === 429) {
            return true;
        }
        // 4xx client errors (except 429) are NOT retryable
        if (error.status >= 400 && error.status < 500) {
            return false;
        }
    }
    
    // Default: retry unknown errors (conservative approach)
    return true;
}

/**
 * Executes a function with exponential backoff retry logic.
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 5,
        baseDelay = 100,
        maxDelay = 10000,
        jitter = true
    } = options;

    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < maxAttempts) {
        attempt++;
        
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Check if we should retry this error
            if (!isRetryableError(error)) {
                console.error(`Attempt ${attempt} failed with non-retryable error:`, error.message);
                throw error; // Fail fast for non-retryable errors
            }
            
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            // Don't wait after the last attempt
            if (attempt >= maxAttempts) {
                break;
            }
            
            // Calculate delay with exponential backoff
            let delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            
            // Add jitter to prevent thundering herd
            if (jitter) {
                delay += Math.random() * baseDelay;
            }
            
            console.log(`Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError ?? new Error("Retry failed without error");
}

// --- Main Application Logic ---

async function main() {
    const client = new MockClient();
    const data = "Hello Walrus";

    console.log("Starting upload with retry logic...\n");

    try {
        const blobId = await retryWithBackoff(
            () => client.storeBlob(data),
            {
                maxAttempts: 5,
                baseDelay: 100,
                jitter: true
            }
        );
        
        console.log(`\n✅ Success! Blob ID: ${blobId}`);
    } catch (error: any) {
        console.error(`\n❌ Upload failed after all retries:`, error.message);
        process.exit(1);
    }
}

main();

