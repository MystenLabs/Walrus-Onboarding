// website-deploy.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { readFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import { getFundedKeypair } from '../src/get-keypair.js'; // Adjusted path

async function deployWebsite(siteDirectory: string, epochs: number) {
  // Set up Walrus client
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(
    walrus({
      uploadRelay: {
        host: 'https://upload-relay.testnet.walrus.space',
        sendTip: { max: 1_000 },
      },
    })
  );

  const keypair = await getFundedKeypair();

  // Collect all files
  const files: WalrusFile[] = [];
  
  async function collectFiles(dir: string, prefix = '') {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const identifier = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        await collectFiles(fullPath, identifier);
      } else {
        const contents = await readFile(fullPath);
        const ext = extname(entry.name).toLowerCase();
        
        // Determine file type
        let fileType = 'other';
        let mimeType = 'application/octet-stream';
        
        if (['.html', '.htm'].includes(ext)) {
          fileType = 'html';
          mimeType = 'text/html';
        } else if (ext === '.css') {
          fileType = 'css';
          mimeType = 'text/css';
        } else if (ext === '.js') {
          fileType = 'javascript';
          mimeType = 'application/javascript';
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
          fileType = 'image';
          mimeType = `image/${ext.slice(1)}`;
        }
        
        files.push(
          WalrusFile.from({
            contents: new Uint8Array(contents),
            identifier,
            tags: {
              type: fileType,
              mime: mimeType,
              originalName: entry.name,
            },
          })
        );
        
        console.log(`Collected: ${identifier} (${fileType})`);
      }
    }
  }
  
  console.log('Collecting files...');
  await collectFiles(siteDirectory);
  console.log(`Total files: ${files.length}`);
  
  // Upload as quilt
  console.log('Creating quilt...');
  const flow = await client.walrus.writeFilesFlow({ files });
  
  console.log('Encoding...');
  await flow.encode();
  
  console.log('Registering on Sui...');
  const { digest } = await client.signAndExecuteTransaction({
    transaction: flow.register({
      deletable: false, // Permanent website hosting
      epochs,
      owner: keypair.toSuiAddress(),
    }), // Fixed: removed .registerTransaction access
    signer: keypair,
  });
  
  console.log('Uploading to storage nodes...');
  await flow.upload({ digest });
  
  console.log('Certifying...');
  await client.signAndExecuteTransaction({
    transaction: flow.certify(),
    signer: keypair,
  });
  
  const result = await flow.listFiles();
  
  let quiltId = '';
  if (result.length > 0) {
      quiltId = result[0].blobId;
  }

  console.log('Deployment complete!');
  console.log('Quilt ID:', quiltId);
  console.log('Total patches:', result.length);
  
  // Generate access URLs
  console.log('\nAccess your site:');
  console.log(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${quiltId}/by-identifier/index.html`);
  
  return {
      quiltId,
      patches: result
  };
}

// Create dummy website for testing
import { mkdir, writeFile } from 'fs/promises';
async function createDummySite() {
    await mkdir('my-website', { recursive: true });
    await writeFile('my-website/index.html', '<h1>Hello World</h1>');
    await writeFile('my-website/style.css', 'body { color: blue; }');
    await writeFile('my-website/script.js', 'console.log("loaded");');
}

// Usage
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    createDummySite().then(() => {
        deployWebsite('./my-website', 30)
          .then((result) => console.log('Success:', result))
          .catch((error) => console.error('Error:', error));
    });
}
