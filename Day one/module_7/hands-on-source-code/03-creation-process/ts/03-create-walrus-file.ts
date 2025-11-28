import { WalrusFile } from '@mysten/walrus';
import { readFile } from 'fs/promises';

async function main() {
  // From string
  const file1 = WalrusFile.from({
    contents: new TextEncoder().encode('text content'),
    identifier: 'my-file',
    tags: { key: 'value' },
  });
  console.log('Created file1');

  // From Uint8Array (binary data)
  const binaryData = new Uint8Array([1, 2, 3]);
  const file2 = WalrusFile.from({
    contents: binaryData,
    identifier: 'binary-file',
  });
  console.log('Created file2');

  // From file system (Node.js)
  try {
    const fileData = await readFile('./path/to/file.pdf');
    const file3 = WalrusFile.from({
      contents: new Uint8Array(fileData),
      identifier: 'document.pdf',
      tags: { format: 'pdf', author: 'Alice' },
    });
    console.log('Created file3');
  } catch (e) {
    console.log('Skipped file system example (file not found)');
  }

  // From Blob (Browser environment simulation)
  try {
    // Note: fetch and Blob are global in modern Node.js or browser
    const response = await fetch('https://example.com/image.png');
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const file4 = WalrusFile.from({
      contents: new Uint8Array(arrayBuffer),
      identifier: 'image.png',
      tags: { source: 'external' },
    });
    console.log('Created file4');
  } catch (e) {
    console.log('Skipped fetch example');
  }
}

main().catch(console.error);

