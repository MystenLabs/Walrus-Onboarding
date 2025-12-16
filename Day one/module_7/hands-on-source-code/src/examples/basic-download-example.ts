/**
 * Basic Download Example
 * 
 * This example demonstrates how to download and read data from Walrus using the SDK.
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

// Main execution
async function main() {
  try {
    // Accept either an on-chain numeric blob ID (decimal string) or the short Walrus blob ID.
    // If you pass a decimal string, we convert it to the Walrus blobId string using blobIdFromInt().
    // If you omit the argument, we fall back to the demo blob ID from the docs:
    //   OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk
    const arg = process.argv[2];
    const isNumeric = !!(arg && /^\d+$/.test(arg));
    const blobId: string =
      isNumeric
        ? blobIdFromInt(BigInt(arg))
        : (arg || 'OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk');

    console.log(
      `=== Downloading blob (input format: ${
        isNumeric ? 'on-chain numeric' : 'Walrus blobId'
      }, normalized: ${blobId}): ${arg ?? 'OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk'} ===`,
    );
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

