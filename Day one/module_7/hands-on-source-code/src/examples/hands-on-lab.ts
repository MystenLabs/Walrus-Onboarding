/**
 * Hands-On Lab: Robust Upload Script
 * 
 * In this lab, you will write a robust upload script that uses the Upload Relay,
 * handles errors, and verifies the upload.
 * 
 * Source: hands-on.md
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus, RetryableWalrusClientError } from '@mysten/walrus';
import { getFundedKeypair } from '../utils/getFundedKeypair.js';
import { validateTestnetConfig } from '../utils/validateTestnet.js';

// Initialize the client with uploadRelay config
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

async function main() {
  const signer = await getFundedKeypair();
  const content = "Hands On Lab Content - " + Date.now();
  const file = new TextEncoder().encode(content);

  console.log("Starting upload...");

  let blobId: string | undefined;
  let blobObject: any;

  // Wrap this in a try/catch loop to handle RetryableWalrusClientError
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await client.walrus.writeBlob({
        blob: file,
        deletable: true,
        epochs: 1,
        signer,
      });
      blobId = result.blobId;
      blobObject = result.blobObject;
      break; // Success, exit retry loop
    } catch (e) {
      attempt++;
      const error = e as Error;
      
      // Handle retry logic here
      if (error instanceof RetryableWalrusClientError && attempt < maxRetries) {
        console.log(`Upload failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw e;
    }
  }

  if (!blobId) {
    throw new Error('Upload failed after retries');
  }

  console.log(`Uploaded: ${blobId}`);

  // Verification
  // 1. Read the blob back using client.walrus.readBlob
  // 2. Decode it to string
  // 3. Compare with original `content`
  
  const downloadedBytes = await client.walrus.readBlob({ blobId });
  const downloadedContent = new TextDecoder().decode(downloadedBytes);

  if (downloadedContent === content) {
    console.log("SUCCESS: Integrity verified!");
  } else {
    console.error("FAILURE: Content mismatch!");
    console.error(`Original length: ${content.length}, Downloaded length: ${downloadedContent.length}`);
    throw new Error('Content verification failed');
  }
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.includes('hands-on-lab.ts') ||
                     process.argv[1]?.endsWith('hands-on-lab.ts');
if (isMainModule) {
  main().catch(console.error);
}

export { main as handsOnLab };

