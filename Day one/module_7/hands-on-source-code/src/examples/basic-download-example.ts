/**
 * Basic Download Example
 * 
 * This example demonstrates how to download and read data from Walrus using the SDK.
 * If no blob ID is provided, it first uploads a test blob and then downloads it.
 * 
 * Source: basic-download-example.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import {
  walrus,
  BlobNotCertifiedError,
  NotEnoughSliversReceivedError,
  BlobBlockedError,
  blobIdFromInt,
} from '@mysten/walrus';
import { validateTestnetConfig } from '../utils/validateTestnet.js';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';
import { isMainModule } from '../utils/isMainModule.js';

// Validate environment is testnet before creating client
const network = 'testnet';
const url = getFullnodeUrl(network);
validateTestnetConfig(network, url);

const client = new SuiClient({
  url,
  network,
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

// Upload a test blob (used when no blob ID is provided)
async function uploadTestBlob(): Promise<{ blobId: string; content: string }> {
  console.log('No blob ID provided. Uploading a test blob first...\n');
  
  const keypair = await getFundedKeypair();
  const content = `Download Example Test - ${Date.now()}`;
  const data = new TextEncoder().encode(content);
  
  console.log('Uploading test blob...');
  const { blobId } = await client.walrus.writeBlob({
    blob: data,
    deletable: true,
    epochs: 1,
    signer: keypair,
  });
  
  console.log(`✅ Uploaded test blob: ${blobId}\n`);
  
  // Wait a moment for the blob to be available
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return { blobId, content };
}

// Main execution
async function main() {
  try {
    // Accept either an on-chain numeric blob ID (decimal string) or the short Walrus blob ID.
    // If you pass a decimal string, we convert it to the Walrus blobId string using blobIdFromInt().
    // If you omit the argument, we upload a test blob first and then download it.
    const arg = process.argv[2];
    
    let blobId: string;
    let expectedContent: string | undefined;
    
    if (arg) {
      // User provided a blob ID
      const isNumeric = /^\d+$/.test(arg);
      blobId = isNumeric ? blobIdFromInt(BigInt(arg)) : arg;
      
      console.log(
        `=== Downloading blob (input format: ${
          isNumeric ? 'on-chain numeric' : 'Walrus blobId'
        }, normalized: ${blobId}) ===`,
      );
    } else {
      // No blob ID provided - upload first
      const uploadResult = await uploadTestBlob();
      blobId = uploadResult.blobId;
      expectedContent = uploadResult.content;
      
      console.log(`=== Downloading the uploaded blob: ${blobId} ===`);
    }
    
    const downloadedBytes = await downloadBlob(blobId);
    
    // Verify content if we uploaded it ourselves
    if (expectedContent) {
      const downloadedContent = new TextDecoder().decode(downloadedBytes);
      if (downloadedContent === expectedContent) {
        console.log('\n✅ Content verification successful! Downloaded content matches uploaded content.');
      } else {
        console.error('\n❌ Content mismatch!');
        console.error(`Expected: ${expectedContent}`);
        console.error(`Got: ${downloadedContent}`);
        throw new Error('Content verification failed');
      }
    }
    
    console.log('\n✅ Download example completed successfully!');
  } catch (error) {
    console.error('❌ Error running download example:', error);
    throw error;
  }
}

// Run if executed directly
if (isMainModule(import.meta.url)) {
  main().catch(console.error);
}

export { downloadBlob, downloadWithErrorHandling };
