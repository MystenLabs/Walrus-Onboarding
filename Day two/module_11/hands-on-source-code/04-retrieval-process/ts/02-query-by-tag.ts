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

    // Get the quilt blob first
    const blob = await client.walrus.getBlob({ blobId: quiltId });

    // Get all patches with specific tag
    // Note: tags filter expects an array of tag objects to match
    const patches = await blob.files({
        tags: [{ status: 'final' }],
    });

    for (const patch of patches) {
        console.log('Identifier:', await patch.getIdentifier());
        console.log('Content:', new TextDecoder().decode(await patch.bytes()));
    }
}

main().catch(console.error);
