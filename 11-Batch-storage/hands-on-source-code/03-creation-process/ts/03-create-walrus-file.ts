import { WalrusFile } from '@mysten/walrus';
import { readFile } from 'fs/promises';

async function main() {
  // From string
  const file1 = WalrusFile.from({
    contents: new TextEncoder().encode('text content'),
    identifier: 'my-file',
    tags: { key: 'value' },
  });
  console.log('Created file1:', JSON.stringify(file1, null, 2));

  // From Uint8Array (binary data)
  const binaryData = new Uint8Array([1, 2, 3]);
  const file2 = WalrusFile.from({
    contents: binaryData,
    identifier: 'binary-file',
  });
  console.log('Created file2:', JSON.stringify(file2, null, 2));

  // From file system (Node.js)
  try {
    const fileData = await readFile('./03-creation-process/ts/create-flow-example-files/file.pdf');
    const file3 = WalrusFile.from({
      contents: new Uint8Array(fileData),
      identifier: 'document.pdf',
      tags: { format: 'pdf', author: 'Alice' },
    });
    console.log('Created file3:', JSON.stringify(file3, null, 2));
  } catch (e) {
    console.log('Skipped file system example (file not found):', e);
  }

  
}

main().catch(console.error);

