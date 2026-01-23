import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import * as fs from 'fs';
import { createQuilt } from '../../src/create-quilt.js';

async function getQuiltId(): Promise<string> {
    // Check CLI argument (quilt ID or path to JSON file)
    const cliArg = process.argv[2];
    if (cliArg) {
        // Check if it's a file path
        if (fs.existsSync(cliArg) && fs.statSync(cliArg).isFile()) {
            try {
                const info = JSON.parse(fs.readFileSync(cliArg, 'utf-8'));
                const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
                if (quiltId) {
                    console.log(`Using Quilt ID from file: ${cliArg}`);
                    return quiltId;
                }
            } catch (e) {
                console.log(`Warning: Could not read quilt ID from ${cliArg}, treating as quilt ID`);
            }
        }
        // Treat as quilt ID
        console.log(`Using Quilt ID from CLI argument: ${cliArg}`);
        return cliArg;
    }

    // Fall back to quilt-info.json in current directory
    try {
        const info = JSON.parse(fs.readFileSync('quilt-info.json', 'utf-8'));
        const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
        if (quiltId) {
            console.log(`Using Quilt ID from quilt-info.json: ${quiltId}`);
            return quiltId;
        }
    } catch (e) {
        // Continue to next fallback
    }

    // Fall back to parent directory
    try {
        const info = JSON.parse(fs.readFileSync('../../quilt-info.json', 'utf-8'));
        const quiltId = info.quiltId || info.blobStoreResult?.newlyCreated?.blobObject?.blobId || info.blobStoreResult?.alreadyCertified?.blobId;
        if (quiltId) {
            console.log(`Using Quilt ID from ../../quilt-info.json: ${quiltId}`);
            return quiltId;
        }
    } catch (e2) {
        // Continue to auto-create
    }

    // Auto-create if nothing found
    console.log('No existing quilt-info.json found. Creating a new quilt...');
    const quiltId = await createQuilt();
    console.log(`Created new quilt with ID: ${quiltId}`);
    return quiltId;
}

async function main() {
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
        network: 'testnet' as any,
    }).$extend(walrus());

    const quiltId = await getQuiltId();

    // Fetch all patch IDs from the Walrus HTTP API, then retrieve by patch ID.
    const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

    console.log(`Fetching patch list from ${AGGREGATOR} for quilt ${quiltId}...`);
    const res = await fetch(`${AGGREGATOR}/v1/quilts/${quiltId}/patches`);
    if (!res.ok) {
        console.error(`Failed to fetch patches: HTTP ${res.status} - ${await res.text()}`);
        return;
    }

    const patches: { identifier: string; patch_id: string; tags: Record<string, string> }[] =
        await res.json();

    if (patches.length === 0) {
        console.log('No patches found for this quilt.');
        return;
    }

    const patchIds = patches.map(p => p.patch_id);
    console.log('All patch IDs:', patchIds);

    // Retrieve the first few patches by ID using the SDK
    const selectedIds = patchIds.slice(0, 3); // Limit to first 3 patches for demonstration
    console.log('Retrieving patches by ID:', selectedIds);

    const files = await client.walrus.getFiles({ ids: selectedIds });

    for (const [index, file] of files.entries()) {
        const content = await file.bytes();
        console.log(`Retrieved patch #${index}, size:`, content.length, 'bytes');
    }
}

main().catch(console.error);
