import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { readFile, stat } from 'fs/promises';
import { createQuilt } from '../../src/create-quilt.js';

async function getQuiltId(): Promise<string> {
    // Check CLI argument (quilt ID or path to JSON file)
    const cliArg = process.argv[2];
    if (cliArg) {
        // Check if it's a file path
        try {
            const stats = await stat(cliArg);
            if (stats.isFile()) {
                try {
                    const data = await readFile(cliArg, 'utf-8');
                    const info = JSON.parse(data);
                    const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
                    if (quiltId) {
                        console.log(`Using Quilt ID from file: ${cliArg}`);
                        return quiltId;
                    }
                } catch (e) {
                    console.log(`Warning: Could not read quilt ID from ${cliArg}, treating as quilt ID`);
                }
            }
        } catch (e) {
            // File doesn't exist, treat as quilt ID
        }
        // Treat as quilt ID
        console.log(`Using Quilt ID from CLI argument: ${cliArg}`);
        return cliArg;
    }

    // Fall back to quilt-info.json in current directory
    try {
        const data = await readFile('quilt-info.json', 'utf-8');
        const info = JSON.parse(data);
        const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
        if (quiltId) {
            console.log(`Using Quilt ID from quilt-info.json: ${quiltId}`);
            return quiltId;
        }
    } catch (error) {
        // Continue to next fallback
    }

    // Fall back to parent directory
    try {
        const data = await readFile('../../quilt-info.json', 'utf-8');
        const info = JSON.parse(data);
        const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
        if (quiltId) {
            console.log(`Using Quilt ID from ../../quilt-info.json: ${quiltId}`);
            return quiltId;
        }
    } catch (error) {
        // Continue to auto-create
    }

    // Auto-create if nothing found
    console.log('No existing quilt-info.json found. Creating a new quilt...');
    const quiltId = await createQuilt();
    console.log(`Created new quilt with ID: ${quiltId}`);
    return quiltId;
}

async function retrieveFromQuilt() {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(walrus());

  const quiltId = await getQuiltId();

  console.log('Retrieving from quilt:', quiltId);
  console.log('Available methods:', Object.keys(client.walrus));

  // Method 1: By identifier
  console.log('\n=== Retrieve by Identifier ===');
  const introFiles = await client.walrus.getFiles({
    ids: [quiltId],
    // identifiers: ['intro'],
  });
  // Note: In the current SDK, filtering by identifier might not be directly supported in getFiles.
  // We should fetch files and filter manually if needed, or use blob.files() as shown in other examples.
  // For this snippet, we'll adapt to fetching by ID first.
  
  // Alternative correct pattern:
  const blob = await client.walrus.getBlob({ blobId: quiltId });
  const files = await blob.files({ identifiers: ['intro'] });
  
  if (files.length > 0) {
    const introContent = new TextDecoder().decode(await files[0].bytes());
    console.log('Intro content:', introContent.substring(0, 50) + '...');
  } else {
    console.log('Intro file not found');
  }

  // Method 2: By tag
  // Note: listing patches via SDK might require a specific version or helper method
  // Skipping this step for now to ensure stability

}

import { fileURLToPath } from 'url';

// ... code ...

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  retrieveFromQuilt()
    .then(() => console.log('\nDone!'))
    .catch(err => console.error('Error:', err));
}

export { retrieveFromQuilt };

