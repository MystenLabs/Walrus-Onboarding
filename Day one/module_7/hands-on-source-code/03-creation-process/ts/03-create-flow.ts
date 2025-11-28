import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { readFile } from 'fs/promises';
import { getFundedKeypair } from '../../src/get-keypair.js';

async function readFileData(path: string): Promise<Uint8Array> {
    try {
        return await readFile(path);
    } catch {
        // Fallback for demo if file doesn't exist
        return new TextEncoder().encode(`Content for ${path}`);
    }
}

async function main() {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  }).$extend(walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: { max: 1_000 },
    },
  }));

  const keypair = await getFundedKeypair();

  // Prepare files
  const files = [
    WalrusFile.from({
      contents: await readFileData('./file1.txt'),
      identifier: 'file1',
      tags: { category: 'documents' },
    }),
    WalrusFile.from({
      contents: await readFileData('./file2.txt'),
      identifier: 'file2',
      tags: { category: 'documents' },
    }),
  ];

  // Step 1: Create the flow
  const flow = await client.walrus.writeFilesFlow({ files });

  // Step 2: Encode the files into quilt structure
  await flow.encode();

  // Step 3: Register on Sui
  const { digest } = await client.signAndExecuteTransaction({
    transaction: flow.register({
      deletable: true,
      epochs: 10,
      owner: keypair.toSuiAddress(),
    }),
    signer: keypair,
  });

  // Step 4: Upload to storage nodes
  await flow.upload({ digest });

  // Step 5: Certify the upload
  await client.signAndExecuteTransaction({
    transaction: flow.certify(),
    signer: keypair,
  });

  // Step 6: Get the result
  const result = await flow.listFiles();
  console.log('Stored patches:', result);
}

main().catch(console.error);

