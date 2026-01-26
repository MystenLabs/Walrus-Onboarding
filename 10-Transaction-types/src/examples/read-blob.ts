// @ts-nocheck
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';

const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
}).$extend(walrus());

async function retrieve() {
    const blobId = process.argv[2];
    if (!blobId) {
        throw new Error('Usage: tsx read-blob.ts <BLOB_ID>');
    }

    // Fetches shards, reconstructs, and verifies hash.
    const blobBytes = await client.walrus.readBlob({ blobId });

    // Convert to text or appropriate format.
    const text = new TextDecoder().decode(blobBytes);
    console.log(text);
}

void retrieve();
