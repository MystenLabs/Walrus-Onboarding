// @ts-nocheck
import 'dotenv/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { walrus } from '@mysten/walrus';

const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
}).$extend(walrus());

const mnemonic = process.env.SUI_MNEMONIC;
if (!mnemonic) {
    throw new Error('Set SUI_MNEMONIC in your environment before running.');
}
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);

async function upload() {
    const fileData = new TextEncoder().encode('Hello Walrus!');

    // High-level method: handles reserve, register, upload, certify.
    const { blobId, blobObject } = await client.walrus.writeBlob({
        blob: fileData,
        epochs: 5, // Store for 5 epochs.
        deletable: true, // Allow early deletion.
        signer: keypair,
    });

    console.log(`Uploaded Blob ID: ${blobId}`);
    console.log(`Blob Object ID: ${blobObject.id.id}`);
}

void upload();
