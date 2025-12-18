/**
 * Retry Patterns
 * 
 * Implementing robust retry logic is crucial for reliable uploads and downloads
 * in distributed systems. The Walrus SDK provides utilities and patterns for handling retries.
 * 
 * Source: retry-patterns.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import {
  walrus,
  RetryableWalrusClientError,
  NotEnoughBlobConfirmationsError,
  NotEnoughSliversReceivedError,
  NoBlobMetadataReceivedError,
} from '@mysten/walrus';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';
import { validateTestnetConfig } from '../utils/validateTestnet.js';
import { isMainModule } from '../utils/isMainModule.js';

const network = 'testnet';
const url = getFullnodeUrl(network);
validateTestnetConfig(network, url);

const client = new SuiClient({
  url,
  network,
}).$extend(walrus());

// Simple retry utility
async function retry<T>(
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
          setTimeout(
            resolve,
            (options.delay ?? 1000) + (options.jitter ? Math.random() * options.jitter : 0),
          ),
        );
      }
    }
  }

  throw new Error('Retry count exceeded');
}

// Basic Usage
async function uploadWithRetry(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  
  return retry(
    () => client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    }),
    {
      count: 5,
      delay: 1000,
      jitter: 500,
    }
  );
}

// Conditional Retries
async function uploadWithConditionalRetry(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  
  return retry(
    () => client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    }),
    {
      count: 5,
      delay: 1000,
      condition: (error) => {
        // Only retry retryable errors
        return error instanceof RetryableWalrusClientError;
      },
    }
  );
}

// Exponential Backoff
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  let attempt = 0;
  let lastError: Error;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt >= maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Usage with exponential backoff
async function uploadWithExponentialBackoff(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  
  return retryWithExponentialBackoff(
    () => client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    }),
    5
  );
}

// Smart Retry Strategy
async function uploadWithSmartRetry(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  let attempt = 0;
  const maxRetries = 5;
  
  while (attempt < maxRetries) {
    try {
      return await client.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
    } catch (error: any) {
      attempt++;
      
      // Don't retry non-retryable errors
      if (!(error instanceof RetryableWalrusClientError)) {
        throw error;
      }
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Longer delay for confirmation errors
      const delay = error instanceof NotEnoughBlobConfirmationsError
        ? 2000 * attempt
        : 1000 * attempt;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Upload failed after retries');
}

// Retry for Downloads
async function downloadWithRetry(blobId: string) {
  return retry(
    () => client.walrus.readBlob({ blobId }),
    {
      count: 3,
      delay: 1000,
      condition: (error) => {
        // Retry on network errors or insufficient slivers
        return error instanceof NotEnoughSliversReceivedError ||
               error instanceof NoBlobMetadataReceivedError;
      },
    }
  );
}

// Main execution
async function main() {
  try {
    const data = new TextEncoder().encode('Retry Pattern Test - ' + Date.now());
    
    console.log('=== Testing Basic Retry ===');
    const result1 = await uploadWithRetry(data);
    console.log('✅ Basic retry successful:', result1.blobId);
    
    console.log('\n=== Testing Conditional Retry ===');
    const result2 = await uploadWithConditionalRetry(data);
    console.log('✅ Conditional retry successful:', result2.blobId);
    
    console.log('\n✅ All retry pattern examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running retry pattern examples:', error);
    throw error;
  }
}

// Run if executed directly
if (isMainModule(import.meta.url)) {
  main().catch(console.error);
}

export {
  retry,
  uploadWithRetry,
  uploadWithConditionalRetry,
  uploadWithExponentialBackoff,
  uploadWithSmartRetry,
  downloadWithRetry,
};
