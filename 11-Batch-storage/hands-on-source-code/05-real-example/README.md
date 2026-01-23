# 05 - Real-World Examples

This directory contains comprehensive real-world examples demonstrating practical
applications of Walrus quilts, corresponding to Module 11, Section 5 of the curriculum.

## Prerequisites

1. **Walrus CLI**: Ensure `walrus` is in your PATH and configured.
2. **Node.js**: Required for TypeScript examples.
3. **Testnet Configuration**: The examples use `testnet` context. Ensure your Walrus
   config has a Testnet context set up.
4. **Funded Wallet**: Your Sui wallet needs sufficient WAL tokens on Testnet to
   store quilts.

## Directory Structure

- `game-assets.ts`: Game asset management example using quilts.
- `nft-collection-upload.sh`: NFT collection upload script.
- `process-and-store.sh`: Batch data processing and storage script.
- `retrieve-batch-results.sh`: Batch results retrieval script.
- `website-deploy.ts`: Static website deployment example.
- `website-retrieve.ts`: Website download/retrieval example.
- `images/`: Directory for NFT images (created by scripts).
- `metadata/`: Directory for NFT metadata (created by scripts).
- `processing-results/`: Directory for batch processing results (created by scripts).
- `retrieved-results/`: Directory for retrieved batch results (created by scripts).

## Examples Overview

### 1. Game Asset Management (`game-assets.ts`)

Demonstrates how to organize and retrieve game assets using quilts with tag-based
filtering. Features include:

- **Level-based loading**: Load all assets for a specific game level.
- **Type-based loading**: Load assets by type (texture, sound, config).
- **Common asset preloading**: Preload shared assets used across levels.
- **Tagging strategy**: Use tags like `level`, `type`, and `common` for organization.

```bash
# Run from the hands-on-source-code directory
npm run example-game-assets
```

### 2. NFT Collection Upload (`nft-collection-upload.sh`)

Shows how to upload an NFT collection with images and metadata as a quilt:

- Creates paired image and metadata files for each NFT.
- Tags files with `rarity` and `type` for easy filtering.
- Demonstrates bulk upload using the `store-quilt` command.

```bash
cd 05-real-example
chmod +x nft-collection-upload.sh
./nft-collection-upload.sh
```

### 3. Batch Data Processing (`process-and-store.sh`)

Demonstrates a data processing pipeline that stores results in a quilt:

- Simulates processing of data items.
- Stores all results as a single quilt with batch metadata.
- Generates a batch metadata JSON file for tracking.
- Tags each result with `batch`, `type`, and `item` information.

```bash
cd 05-real-example
chmod +x process-and-store.sh
./process-and-store.sh
```

### 4. Batch Results Retrieval (`retrieve-batch-results.sh`)

Retrieves and analyzes batch processing results from a quilt:

- Downloads all files from a quilt by ID.
- Parses and displays result contents.
- Useful for verifying batch processing outputs.

```bash
cd 05-real-example
chmod +x retrieve-batch-results.sh
./retrieve-batch-results.sh <QUILT_ID>
```

### 5. Website Deployment (`website-deploy.ts`)

Complete example of deploying a static website to Walrus:

- Recursively collects all files from a directory.
- Automatically detects MIME types for HTML, CSS, JS, and images.
- Uses the `writeFilesFlow` API for fine-grained control.
- Generates access URLs for the deployed site.

```bash
# Run from the hands-on-source-code directory
npm run example-website-deploy
```

### 6. Website Retrieval (`website-retrieve.ts`)

Downloads a complete website from Walrus:

- Retrieves all files from a quilt.
- Recreates the original directory structure locally.
- Useful for backup or migration purposes.

```bash
# Run from the hands-on-source-code directory
npm run example-website-retrieve -- <QUILT_ID> [output_dir]
```

## Use Cases Demonstrated

| Example | Use Case | Key Features |
|---------|----------|--------------|
| Game Assets | Game development | Level-based loading, asset caching, tag filtering |
| NFT Collection | Digital collectibles | Paired files, rarity tagging, bulk upload |
| Batch Processing | Data pipelines | Automated storage, batch tracking, result analysis |
| Website Deploy | Static hosting | Directory traversal, MIME detection, flow API |
| Website Retrieve | Content backup | Full download, structure preservation |

## Running TypeScript Examples

Ensure dependencies are installed in the root `hands-on-source-code` directory:

```bash
cd ..
npm install
```

Then run examples using npm scripts:

```bash
npm run example-game-assets
npm run example-website-deploy
npm run example-website-retrieve -- <QUILT_ID> [output_dir]
```

## Notes

- All examples use the `testnet` context by default.
- The TypeScript examples use a helper function `getFundedKeypair()` from
  `../src/get-keypair.ts` to get a funded keypair for Testnet.
- Shell scripts create necessary directories and dummy files automatically.
- The `my-website/` directory is created by `website-deploy.ts` for testing.
- Output directories (`processing-results/`, `retrieved-results/`, etc.) are
  created automatically by the scripts.

