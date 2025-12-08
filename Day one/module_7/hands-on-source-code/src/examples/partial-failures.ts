/**
 * How to Handle Partial Failures
 * 
 * In a distributed system like Walrus, partial failures are common.
 * The SDK is designed to handle these gracefully, but understanding how to
 * manage them is important for building robust applications.
 * 
 * Source: partial-failures.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus, NotEnoughBlobConfirmationsError, NotEnoughSliversReceivedError, InconsistentBlobError, BlobBlockedError } from '@mysten/walrus';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(walrus());

// Upload with Quorum Check
async function uploadWithQuorumCheck(blob: Uint8Array) {
  try {
    const keypair = await getFundedKeypair();
    const { blobId, blobObject } = await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
    
    return { blobId, blobObject };
  } catch (error) {
    if (error instanceof NotEnoughBlobConfirmationsError) {
      // Quorum not met - too many nodes failed
      console.error('Not enough nodes confirmed storage');
      // Retry logic here
      throw error;
    }
    throw error;
  }
}

// Upload with Recovery
async function uploadWithRecovery(blob: Uint8Array, maxRetries = 3) {
  let attempt = 0;
  const keypair = await getFundedKeypair();
  
  while (attempt < maxRetries) {
    try {
      const { blobId, blobObject } = await client.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
      
      return { blobId, blobObject };
    } catch (error) {
      attempt++;
      
      if (error instanceof NotEnoughBlobConfirmationsError) {
        if (attempt >= maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts`);
        }
        
        // Wait before retry (nodes might recover)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      
      // Don't retry non-recoverable errors
      throw error;
    }
  }
  
  throw new Error('Upload failed after retries');
}

// Error Classification
function classifyError(error: Error): 'retryable' | 'permanent' | 'unknown' {
  if (error instanceof NotEnoughBlobConfirmationsError) {
    return 'retryable'; // Nodes might recover
  }
  
  if (error instanceof NotEnoughSliversReceivedError) {
    return 'retryable'; // Network might improve
  }
  
  if (error instanceof InconsistentBlobError) {
    return 'permanent'; // Data is corrupted
  }
  
  if (error instanceof BlobBlockedError) {
    return 'permanent'; // Blob is blocked
  }
  
  return 'unknown';
}

// Upload with Classification
async function uploadWithClassification(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  
  try {
    return await client.walrus.writeBlob({
      blob,
      deletable: true,
      epochs: 3,
      signer: keypair,
    });
  } catch (error) {
    const classification = classifyError(error as Error);
    
    if (classification === 'retryable') {
      // Retry with backoff
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await client.walrus.writeBlob({
        blob,
        deletable: true,
        epochs: 3,
        signer: keypair,
      });
    }
    
    // Don't retry permanent errors
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('=== Testing Partial Failure Handling ===');
    
    const keypair = await getFundedKeypair();
    const data = new TextEncoder().encode('Partial Failure Test - ' + Date.now());
    
    console.log('\n=== Testing Upload with Quorum Check ===');
    const result1 = await uploadWithQuorumCheck(data);
    console.log('✅ Upload successful:', result1.blobId);
    
    console.log('\n=== Testing Upload with Recovery ===');
    const result2 = await uploadWithRecovery(data);
    console.log('✅ Upload successful:', result2.blobId);
    
    console.log('\n✅ All partial failure handling examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running partial failure examples:', error);
    // These errors are expected in some scenarios
    if (error instanceof NotEnoughBlobConfirmationsError) {
      console.log('ℹ️  This error indicates network or node issues, which is expected in test environments.');
      return;
    }
    throw error;
  }
}

// Run if executed directly (not when imported as a module)
const isDirectRun = process.argv[1]?.includes('partial-failures');
if (isDirectRun) {
  main().catch(console.error);
}

export { 
  uploadWithQuorumCheck, 
  uploadWithRecovery, 
  classifyError, 
  uploadWithClassification,
};

