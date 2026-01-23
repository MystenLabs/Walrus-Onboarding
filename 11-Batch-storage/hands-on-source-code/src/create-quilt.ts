import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { readFile, writeFile } from 'fs/promises';
import { getFundedKeypair } from './get-keypair.js';

async function createQuilt() {
  // Setup client
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(walrus());

  const keypair = await getFundedKeypair();

  // Prepare files with metadata
  // Note: We are creating dummy files in memory if they don't exist, 
  // or reading from the expected location if running in the lab context.
  // For simplicity in this standalone script, let's create the content buffers directly.
  
  const files = [
    WalrusFile.from({
      contents: new TextEncoder().encode('Welcome to Walrus Quilts!\n\nThis is a sample document stored in a quilt.\nQuilts allow efficient batch storage of small files.'),
      identifier: 'intro',
      tags: {
        type: 'document',
        format: 'text',
        category: 'documentation',
      },
    }),
    WalrusFile.from({
      contents: new TextEncoder().encode('{\n  "version": "1.0",\n  "feature": "quilts",\n  "enabled": true,\n  "max_files": 666\n}'),
      identifier: 'config',
      tags: {
        type: 'config',
        format: 'json',
        category: 'configuration',
      },
    }),
    WalrusFile.from({
      contents: new TextEncoder().encode('<!DOCTYPE html>\n<html>\n<head>\n    <title>Walrus Quilt Demo</title>\n</head>\n<body>\n    <h1>Hello from Walrus!</h1>\n    <p>This page is stored in a quilt.</p>\n</body>\n</html>'),
      identifier: 'homepage',
      tags: {
        type: 'document',
        format: 'html',
        category: 'web',
      },
    }),
    WalrusFile.from({
      contents: new TextEncoder().encode('id,name,value\n1,item1,100\n2,item2,200\n3,item3,300'),
      identifier: 'sample-data',
      tags: {
        type: 'data',
        format: 'csv',
        category: 'dataset',
      },
    }),
    WalrusFile.from({
      contents: new TextEncoder().encode('[This would be an actual image file in production]\nPlaceholder for logo.png'),
      identifier: 'logo',
      tags: {
        type: 'image',
        format: 'text',
        category: 'assets',
      },
    }),
  ];

  console.log(`Creating quilt with ${files.length} files...`);

  // Store as quilt
  const result = await client.walrus.writeFiles({
    files,
    deletable: true,
    epochs: 10,
    signer: keypair,
  });

  // console.log('Quilt result:', JSON.stringify(result, null, 2));
  
  let quiltId: string;
  if (Array.isArray(result) && result.length > 0) {
      // In newer SDKs, writeFiles returns an array of stored patches
      // The blobId property on any patch corresponds to the Quilt ID
      quiltId = (result[0] as any).blobId;
  } else if ((result as any).quiltId) {
      // Fallback for other return shapes
      quiltId = (result as any).quiltId;
  } else {
      throw new Error('Could not determine Quilt ID from result');
  }

  console.log('Quilt created successfully!');
  console.log('Quilt ID:', quiltId);
  console.log('Patches:', Array.isArray(result) ? result.length : (result as any).patches?.length || files.length);

  // Save to file
  await writeFile('quilt-info.json', JSON.stringify({
    quiltId: quiltId,
    createdAt: new Date().toISOString(),
    patches: files.length,
  }, null, 2));

  return quiltId;
}

import { fileURLToPath } from 'url';

// ... code ...

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createQuilt()
    .then(id => console.log('Done! Quilt ID:', id))
    .catch(err => console.error('Error:', err));
}

export { createQuilt };

