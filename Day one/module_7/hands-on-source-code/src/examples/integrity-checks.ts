/**
 * Integrity Checks
 * 
 * The Walrus SDK includes multiple mechanisms to verify the integrity of
 * uploaded and downloaded data. Understanding these checks helps ensure data correctness.
 * 
 * Source: integrity-checks.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus, InconsistentBlobError, BlobNotCertifiedError, NotEnoughSliversReceivedError } from '@mysten/walrus';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(walrus());

// Manual Integrity Verification
async function verifyBlobIntegrity(blobId: string, expectedData: Uint8Array) {
  // Download the blob
  const downloadedData = await client.walrus.readBlob({ blobId });
  
  // Compare sizes
  if (downloadedData.length !== expectedData.length) {
    throw new Error('Blob size mismatch');
  }
  
  // Compare content (for small blobs)
  if (downloadedData.length < 1024 * 1024) { // 1MB
    const match = downloadedData.every((byte, i) => byte === expectedData[i]);
    if (!match) {
      throw new Error('Blob content mismatch');
    }
  } else {
    // For larger blobs, compute and compare hashes
    const downloadedHash = await crypto.subtle.digest('SHA-256', downloadedData);
    const expectedHash = await crypto.subtle.digest('SHA-256', expectedData);
    
    const match = new Uint8Array(downloadedHash).every(
      (byte, i) => byte === new Uint8Array(expectedHash)[i]
    );
    
    if (!match) {
      throw new Error('Blob hash mismatch');
    }
  }
  
  return true;
}

// Integrity Check with Error Handling
async function verifyBlobWithErrorHandling(blobId: string, expectedData: Uint8Array) {
  try {
    const blob = await client.walrus.readBlob({ blobId });
    
    // The SDK automatically verifies integrity during read
    // We can also do manual verification
    await verifyBlobIntegrity(blobId, expectedData);
    
    return {
      success: true,
      verified: true,
    };
  } catch (error) {
    if (error instanceof InconsistentBlobError) {
      console.error('Blob integrity check failed');
    } else if (error instanceof BlobNotCertifiedError) {
      console.error('Blob is not certified');
    } else if (error instanceof NotEnoughSliversReceivedError) {
      console.error('Could not retrieve enough slivers to verify');
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Upload and Verify
async function uploadAndVerify(blob: Uint8Array) {
  const keypair = await getFundedKeypair();
  
  // Upload the blob
  console.log('Uploading blob...');
  const { blobId, blobObject } = await client.walrus.writeBlob({
    blob,
    deletable: true,
    epochs: 3,
    signer: keypair,
  });
  
  console.log(`Uploaded blob: ${blobId}`);
  
  // Wait a moment for the blob to be available
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verify integrity
  console.log('Verifying blob integrity...');
  const verification = await verifyBlobWithErrorHandling(blobId, blob);
  
  if (verification.success && verification.verified) {
    console.log('✅ Blob integrity verified successfully!');
  } else {
    console.error('❌ Blob integrity verification failed:', verification.error);
    throw new Error('Integrity verification failed');
  }
  
  return { blobId, blobObject };
}

// Main execution
async function main() {
  try {
    console.log('=== Testing Integrity Checks ===');
    
    // Test with small blob
    const smallData = new TextEncoder().encode('Integrity Test - ' + Date.now());
    console.log('\n=== Testing Upload and Verify (Small Blob) ===');
    const result1 = await uploadAndVerify(smallData);
    console.log('✅ Small blob upload and verify successful:', result1.blobId);
    
    // Test with larger blob
    const largeData = new Uint8Array(10000).fill(42); // 10KB of 0x2A
    console.log('\n=== Testing Upload and Verify (Large Blob) ===');
    const result2 = await uploadAndVerify(largeData);
    console.log('✅ Large blob upload and verify successful:', result2.blobId);
    
    console.log('\n✅ All integrity check examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running integrity check examples:', error);
    throw error;
  }
}

// Run if executed directly (not when imported as a module)
const isDirectRun = process.argv[1]?.includes('integrity-checks');
if (isDirectRun) {
  main().catch(console.error);
}

export { 
  verifyBlobIntegrity, 
  verifyBlobWithErrorHandling, 
  uploadAndVerify,
};

