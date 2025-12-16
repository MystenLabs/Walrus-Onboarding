/**
 * Basic Upload Example
 * 
 * This example demonstrates how to upload data to Walrus using the SDK,
 * with examples for both direct uploads and relay-based uploads.
 * 
 * Source: basic-upload-example.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';
import { validateTestnetConfig } from '../utils/validateTestnet.js';

// Simple Blob Upload
async function uploadBlob() {
  const network = 'testnet';
  const url = getFullnodeUrl(network);
  validateTestnetConfig(network, url);
  
  const client = new SuiClient({
    url,
    network,
  }).$extend(walrus());

  const keypair = await getFundedKeypair();
  
  // Your data as bytes
  const data = new TextEncoder().encode('Hello, Walrus!');
  
  const { blobId, blobObject } = await client.walrus.writeBlob({
    blob: data,
    deletable: true,
    epochs: 3,
    signer: keypair,
  });
  
  console.log('Uploaded blob:', blobId);
  console.log('Blob object:', blobObject);
  
  return { blobId, blobObject };
}

// Upload with Relay
async function uploadWithRelay() {
  const network = 'testnet';
  const url = getFullnodeUrl(network);
  validateTestnetConfig(network, url);
  
  const client = new SuiClient({
    url,
    network,
  }).$extend(
    walrus({
      uploadRelay: {
        host: 'https://upload-relay.testnet.walrus.space',
        sendTip: {
          max: 1_000, // Maximum tip in MIST
        },
      },
    }),
  );

  const keypair = await getFundedKeypair();
  
  const data = new TextEncoder().encode('Hello, Walrus with Relay!');
  
  // Same API, but uses relay internally
  const { blobId, blobObject } = await client.walrus.writeBlob({
    blob: data,
    deletable: true,
    epochs: 3,
    signer: keypair,
  });
  
  return { blobId, blobObject };
}

// Main execution
async function main() {
  try {
    console.log('=== Testing Simple Blob Upload ===');
    await uploadBlob();
    
    console.log('\n=== Testing Upload with Relay ===');
    await uploadWithRelay();
    
    console.log('\n✅ All upload examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running upload examples:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1] || '') || import.meta.url.includes('basic-upload-example.ts')) {
  main().catch(console.error);
}

export { uploadBlob, uploadWithRelay };

