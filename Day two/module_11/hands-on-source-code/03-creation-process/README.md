# 03 - Creation Process Examples

This directory contains executable examples for creating quilts and storing files,
corresponding to Module 11, Section 3 of the curriculum.

## Prerequisites

1. **Walrus CLI**: Ensure `walrus` is in your PATH and configured.
2. **Node.js**: Required for TypeScript examples.
3. **Testnet Configuration**: The examples use `testnet` context. Ensure your Walrus
   config has a Testnet context set up.
4. **Funded Wallet**: Your Sui wallet needs sufficient WAL tokens on Testnet to
   store quilts.

## Directory Structure

- `cli/`: Bash scripts demonstrating CLI commands for creating quilts.
- `ts/`: TypeScript files demonstrating SDK usage for creating quilts.
- `examples-files/`: Sample files and directories used by the examples.

## Running CLI Examples

All CLI scripts should be run from the `cli/` directory:

```bash
cd cli
chmod +x *.sh
./03-01-simple-file-collection.sh
./03-02-nft-collection.sh
./03-03-blobs-metadata.sh
./03-04-docs-with-metadata.sh
./03-05-complete-example.sh
./03-06-dry-run-large-collection.sh
```

### CLI Examples Overview

- **03-01-simple-file-collection.sh**: Simple example using `--paths` to recursively
  include files from directories.
- **03-02-nft-collection.sh**: Example of storing an NFT collection with images and
  metadata.
- **03-03-blobs-metadata.sh**: Demonstrates adding metadata/tags to files.
- **03-04-docs-with-metadata.sh**: Example of storing documentation files with rich
  metadata.
- **03-05-complete-example.sh**: Comprehensive example combining multiple features.
- **03-06-dry-run-large-collection.sh**: Example for testing large file collections
  without actually storing.

## Running TypeScript Examples

Ensure dependencies are installed in the root `hands-on-source-code` directory:

```bash
cd ../..
npm install
```

Then run the examples using `npx tsx`:

```bash
cd 03-creation-process/ts
npx tsx 03-create-simple.ts
npx tsx 03-create-walrus-file.ts
npx tsx 03-create-flow.ts
```

Alternatively, you can use npm scripts from the root `hands-on-source-code` directory:

```bash
# From the root hands-on-source-code directory
npm run create-simple
npm run create-flow
npm run create-walrus-file
```

### TypeScript Examples Overview

- **03-create-simple.ts**: Basic example of creating a quilt with simple files.
- **03-create-walrus-file.ts**: Demonstrates different ways to create `WalrusFile`
  objects (from string, binary, file system).
- **03-create-flow.ts**: Advanced example using the write flow API for more control
  over the upload process.
- **03-unique-ids.ts**: Shows how to ensure unique identifiers for files in a quilt.
- **03-error-handling.ts**: Example of proper error handling when creating quilts.

## Example Files

The `examples-files/` directory contains sample data used by the examples:

- `directory1/`, `directory2/`: Sample directories with text files
- `assets/`: Image files (banner.jpg, logo.png)
- `docs/`: HTML documentation files
- `nft-collection/`: Sample NFT images and metadata
- `large-collection/`: Multiple files for testing bulk operations
- `config/`: Configuration JSON files

## Notes

- All examples use the `testnet` context by default. Modify the scripts if you want
  to use a different network.
- The TypeScript examples use a helper function `getFundedKeypair()` from
  `../../src/get-keypair.js` to get a funded keypair for Testnet.
- Some examples may require specific file paths to exist. Check the script comments
  for requirements.
