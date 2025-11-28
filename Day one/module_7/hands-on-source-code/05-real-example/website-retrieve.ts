// website-retrieve.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

async function downloadWebsite(quiltId: string, outputDir: string) {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(walrus());
  
  // Get all patches
  const blob = await client.walrus.getBlob({ blobId: quiltId });
  const patches = await blob.files();
  
  console.log(`Downloading ${patches.length} files...`);
  
  for (const patch of patches) {
    const identifier = await patch.getIdentifier();
    const content = await patch.bytes();
    
    if (identifier) {
        const outputPath = join(outputDir, identifier);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, content);
        
        console.log(`Downloaded: ${identifier}`);
    }
  }
  
  console.log('Website downloaded!');
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: tsx website-retrieve.ts <quilt_id> [output_dir]");
    } else {
        downloadWebsite(args[0], args[1] || './downloaded-site')
            .catch(console.error);
    }
}
