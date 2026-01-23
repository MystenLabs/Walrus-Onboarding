import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { getFundedKeypair } from '../../src/get-keypair.js';

async function main() {
  // Set up client
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  }).$extend(walrus());

  const keypair = await getFundedKeypair();

  // Prepare files with metadata
  const files = [
    WalrusFile.from({
      contents: new TextEncoder().encode('Hello, World! +' + new Date().toISOString()),
      identifier: 'hello',
      tags: {
        type: 'text',
        language: 'en',
      },
    }),
    WalrusFile.from({
      contents: new TextEncoder().encode('Second file content +' + new Date().toISOString()),
      identifier: 'second-file',
      tags: {
        type: 'text',
        language: 'en',
      },
    }),
  ];

  // Store as quilt (all in one call)
  const quilt = await client.walrus.writeFiles({
    files,
    deletable: true,
    epochs: 10,
    signer: keypair,
  });

  console.log('Quilt created:', JSON.stringify(quilt, null, 2));
}

main().catch(console.error);

