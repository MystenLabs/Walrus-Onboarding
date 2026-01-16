// @ts-nocheck
import 'dotenv/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { WalrusFile, walrus } from '@mysten/walrus';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
}).$extend(walrus());

const mnemonic = process.env.SUI_MNEMONIC;
if (!mnemonic) {
    throw new Error('Set SUI_MNEMONIC in your environment before running.');
}
const keypair = Ed25519Keypair.deriveKeypair(mnemonic);

async function createQuilt() {
    const configPath = resolve(process.cwd(), 'config.json');
    const avatarPath = resolve(process.cwd(), 'avatar.png');

    if (!existsSync(configPath) || !existsSync(avatarPath)) {
        throw new Error('Expected config.json and avatar.png in the current directory.');
    }

    // Define the files to batch.
    const files = [
        WalrusFile.from({
            contents: readFileSync(configPath),
            identifier: 'config.json',
        }),
        WalrusFile.from({
            contents: readFileSync(avatarPath),
            identifier: 'avatar.png',
        }),
    ];

    // Upload as a single Quilt blob.
    const quiltInfo = await client.walrus.writeFiles({
        files,
        epochs: 5,
        deletable: true,
        signer: keypair,
    });

    // The result is an array with one entry per file.
    // All entries share the same blobId (the Quilt blob).
    console.log(`Quilt Blob ID: ${quiltInfo[0].blobId}`);
    console.log('Files in Quilt:');
    for (const file of quiltInfo) {
        console.log(`  - ${file.id}`);
    }
}

void createQuilt();
