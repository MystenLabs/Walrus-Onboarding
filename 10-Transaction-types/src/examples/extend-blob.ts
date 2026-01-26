// @ts-nocheck
import 'dotenv/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { walrus } from '@mysten/walrus';

const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
}).$extend(walrus());

const privateKey = process.env.WALLET_PRIVATE_KEY;
if (!privateKey) {
    throw new Error('Set WALLET_PRIVATE_KEY in your environment before running.');
}
const keypair = Ed25519Keypair.fromSecretKey(privateKey);

async function extendBlob() {
    const blobObjectId = process.argv[2];
    if (!blobObjectId) {
        throw new Error('Usage: tsx extend-blob.ts <BLOB_OBJECT_ID>');
    }

    // Execute an extension transaction.
    const result = await client.walrus.executeExtendBlobTransaction({
        blobObjectId, // The Sui Object ID of the Blob.
        epochs: 2, // Extend by 2 epochs.
        signer: keypair,
    });

    console.log('Extended blob, digest:', result.digest);
}

void extendBlob();
