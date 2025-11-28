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

    // First list all patches to get an ID (simulation)
    const blob = await client.walrus.getBlob({ blobId: quiltId });
    const allFiles = await blob.files();
    if (allFiles.length === 0) {
        console.log("No files in quilt to retrieve.");
        return;
    }
    
    // NOTE: The extracted example used hardcoded IDs. We can't easily guess valid patch IDs without listing.
    // The SDK example uses `getFiles({ ids: patchIds })`.
    
    const patchIds = [
      '057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ikBAAACAAA', // Example
      '057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ikBAgADAAA', // Example
    ];

    console.log("Warning: Using example patch IDs. These will likely fail if the quilt ID is different.");

    try {
        const files = await client.walrus.getFiles({ ids: patchIds });

        for (const file of files) {
            const content = await file.bytes();
            console.log('Retrieved patch, size:', content.length);
        }
    } catch (e) {
        console.log("Failed to retrieve by ID (expected if IDs are invalid):", e);
    }
}

main().catch(console.error);
