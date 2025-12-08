import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { readFile } from 'fs/promises';

async function retrieveFromQuilt() {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(walrus());

  // Load quilt ID
  let quiltId: string;
  try {
    const data = await readFile('quilt-info.json', 'utf-8');
    quiltId = JSON.parse(data).quiltId;
  } catch (error) {
    console.error('Error reading quilt-info.json. Did you run create-quilt.ts first?');
    process.exit(1);
  }

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

