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

    // Get all patches
    const blob = await client.walrus.getBlob({ blobId: quiltId });
    const allFiles = await blob.files();

    console.log(`Retrieved ${allFiles.length} patches`);

    for (const file of allFiles) {
        const identifier = await file.getIdentifier();
        const tags = await file.getTags();
        const content = await file.bytes();
        
        console.log(`File: ${identifier}, Size: ${content.length} bytes`);
    }
}

main().catch(console.error);
