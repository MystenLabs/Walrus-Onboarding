/**
 * Basic Download Example
 * 
 * This example demonstrates how to download and read data from Walrus using the SDK.
 * 
 * Source: basic-download-example.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus, BlobNotCertifiedError, NotEnoughSliversReceivedError, BlobBlockedError } from '@mysten/walrus';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(walrus());

// Simple Blob Download
async function downloadBlob(blobId: string) {
  const blobBytes = await client.walrus.readBlob({ blobId });
  
  // Convert to text
  const text = new TextDecoder().decode(blobBytes);
  console.log('Blob content:', text);
  
  // Or use as Blob for file operations
  const blob = new Blob([blobBytes]);
  
  return blobBytes;
}

// Download with Error Handling
async function downloadWithErrorHandling(blobId: string) {
  try {
    const blobBytes = await client.walrus.readBlob({ blobId });
    return blobBytes;
  } catch (error: any) {
    if (error instanceof BlobNotCertifiedError) {
      console.error('Blob is not certified or does not exist');
    } else if (error instanceof NotEnoughSliversReceivedError) {
      console.error('Could not retrieve enough slivers to reconstruct blob');
      // Retry logic here
    } else if (error instanceof BlobBlockedError) {
      console.error('Blob is blocked by storage nodes');
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Use a test blob ID if provided, otherwise use a known test blob
    const blobId = process.argv[2] || 'OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk';
    
    console.log(`=== Downloading blob: ${blobId} ===`);
    await downloadBlob(blobId);
    
    console.log('\n✅ Download example completed successfully!');
  } catch (error) {
    console.error('❌ Error running download example:', error);
    // Don't throw if blob doesn't exist (it's expected in test environment)
    if (error instanceof Error && error.message.includes('not certified')) {
      console.log('ℹ️  This is expected if the blob ID doesn\'t exist yet.');
      return;
    }
    throw error;
  }
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1] || '') || import.meta.url.includes('basic-download-example.ts')) {
  main().catch(console.error);
}

export { downloadBlob, downloadWithErrorHandling };

