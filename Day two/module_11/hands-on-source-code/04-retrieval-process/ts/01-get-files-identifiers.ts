import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import * as fs from 'fs';

async function main() {
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
        network: 'testnet' as any,
    }).$extend(walrus());

    let quiltId = '057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik';
    try {
        const info = JSON.parse(fs.readFileSync('quilt-info.json', 'utf-8'));
        quiltId = info.quiltId;
        console.log(`Using Quilt ID from info: ${quiltId}`);
    } catch (e) {
        try {
            const info = JSON.parse(fs.readFileSync('../../quilt-info.json', 'utf-8'));
            quiltId = info.quiltId;
            console.log(`Using Quilt ID from info (parent path): ${quiltId}`);
        } catch (e2) {
            console.log(`Using default Quilt ID: ${quiltId}`);
        }
    }

    // Method 1: Build patch IDs manually (example logic, actual retrieval below)
    const patchIds = [
        `${quiltId}:identifier:chapter-01`,
        `${quiltId}:identifier:chapter-02`,
    ];

    // Method 2: Use the WalrusBlob interface
    const blob = await client.walrus.getBlob({ blobId: quiltId });
    const files = await blob.files({
        identifiers: ['chapter-01', 'chapter-02'],
    });

    // Access the file data
    for (const file of files) {
        const identifier = await file.getIdentifier();
        const tags = await file.getTags();
        const content = await file.bytes();
        
        console.log('File:', identifier);
        console.log('Tags:', tags);
        console.log('Size:', content.length, 'bytes');
    }
}

main().catch(console.error);

