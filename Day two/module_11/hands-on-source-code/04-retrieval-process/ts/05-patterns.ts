import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusClient } from '@mysten/walrus';
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

    console.log("--- Pattern 3: Incremental Download with Tracking ---");
    // Track already downloaded patches (simulated local storage)
    const localStorageMock = new Set<string>(); // JSON.parse(localStorage.getItem('downloaded') || '[]')
    
    // List all patches
    const blob = await client.walrus.getBlob({ blobId: quiltId });
    const allPatches = await blob.files();

    // Download only new ones
    for (const patch of allPatches) {
        const identifier = await patch.getIdentifier();
        if (identifier && !localStorageMock.has(identifier)) {
            const content = await patch.bytes();
            // saveLocally(identifier, content);
            console.log(`Downloaded new patch: ${identifier}`);
            localStorageMock.add(identifier);
        }
    }
    // localStorage.setItem('downloaded', JSON.stringify([...downloadedPatches]));


    console.log("\n--- Pattern 4: On-Demand Lazy Loading ---");
    const loader = new QuiltAssetLoader(quiltId, client.walrus);
    try {
        // Try to load a file we know might exist or fail gracefully
        const identifier = 'chapter-01'; 
        const data = await loader.loadAsset(identifier);
        console.log(`Loaded asset ${identifier}, size: ${data.length}`);
    } catch (e) {
        console.log("Asset loading failed:", e);
    }
}

// In a web app, load patches only when needed
class QuiltAssetLoader {
  constructor(private quiltId: string, private client: WalrusClient) {}

  async loadAsset(identifier: string): Promise<Uint8Array> {
    const quiltBlob = await this.client.getBlob({ blobId: this.quiltId });
    const files = await quiltBlob.files({
      identifiers: [identifier],
    });
    
    if (files.length === 0) {
      throw new Error(`Asset not found: ${identifier}`);
    }
    
    return await files[0].bytes();
  }
}

main().catch(console.error);
