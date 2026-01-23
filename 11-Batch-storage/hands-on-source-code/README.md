# Walrus Quilts Hands-On Lab

This directory contains the source code for the hands-on lab in the Quilts curriculum.

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **Walrus CLI**: Ensure `walrus` is in your PATH and configured (for CLI examples)
3. **Funded Sui Testnet Wallet**: You need a funded Sui Testnet wallet passphrase

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set your wallet passphrase using one of these methods:

   **Option 1: Create a `.env` file (recommended)**

   ```bash
   echo 'PASSPHRASE="your twelve word passphrase here"' > .env
   ```

   **Option 2: Pass inline when running commands**

   ```bash
   PASSPHRASE="your passphrase" npm run create-simple
   ```

   > **Note**: PASSPHRASE is **required**. The examples will automatically request
   > SUI from the faucet and exchange it for WAL tokens if needed.

## Directory Structure

- `03-creation-process/`: Examples for creating quilts and storing files
  - `cli/`: Bash scripts demonstrating CLI commands
  - `ts/`: TypeScript files demonstrating SDK usage
  - `examples-files/`: Sample files used by the examples
- `04-retrieval-process/`: Examples for retrieving data from quilts
  - `cli/`: Bash scripts demonstrating CLI commands
  - `ts/`: TypeScript files demonstrating SDK usage
- `05-real-example/`: Real-world use case examples
  - TypeScript and bash scripts for game assets, website deployment, etc.
- `src/`: Shared utility functions
  - `get-keypair.ts`: Helper to get a funded keypair for testing
  - `create-quilt.ts`: Helper to create quilts

## Running Examples

### Using npm Scripts

From the root directory, you can run examples using npm scripts:

**Creation Examples:**

```bash
npm run create-simple
npm run create-flow
npm run create-walrus-file
```

**Retrieval Examples:**

```bash
npm run retrieve-identifiers
npm run retrieve-tags
npm run retrieve-patch-ids
npm run retrieve-all
npm run retrieve-patterns
```

**Real-World Examples:**

```bash
npm run example-game-assets
npm run example-website-deploy
npm run example-website-retrieve
```

### Verifying Storage Cost Savings

The `verify_costs.sh` script demonstrates the cost efficiency of using Quilts compared
to storing files individually. It performs dry-run comparisons across different file sizes.

```bash
./verify_costs.sh
```

**What it does:**

- Creates test files in various sizes (10KB, 50KB, 100KB, 200KB, 500KB, 1MB)
- Generates 600 copies of each size to simulate a collection
- Compares regular blob storage cost vs. quilt storage cost
- Outputs a table showing the savings factor for each file size

**Requirements:**

- `walrus` CLI must be installed and in your PATH
- `jq` must be installed for JSON parsing

**Example output:**

```
| Blob Size | Regular Storage Cost (WAL) | Quilt Storage Cost (WAL) | Savings Factor |
|----------:|---------------------------:|-------------------------:|---------------:|
|      10KB |                  1.234 WAL |                0.012 WAL |          102x |
|      50KB |                  6.170 WAL |                0.062 WAL |           99x |
...
```

This helps you understand when quilts provide the most benefit—typically when storing
many similar-sized files that can be efficiently packed together.

### Using CLI Scripts

See the README files in each subdirectory for detailed instructions:

- [`03-creation-process/README.md`](./03-creation-process/README.md)
- [`04-retrieval-process/README.md`](./04-retrieval-process/README.md)

## What the Examples Cover

1. **Creation Process** (`03-creation-process/`): Learn how to create quilts and
   store files with metadata and tags
2. **Retrieval Process** (`04-retrieval-process/`): Learn how to retrieve files
   by identifier, tag, patch ID, and other methods
3. **Real Examples** (`05-real-example/`): See practical use cases like game
   asset management, website deployment, and batch processing

## Notes

- All examples use the **Testnet** context by default
- The `getFundedKeypair()` helper function automatically:
  - Requests SUI from the faucet if needed
  - Exchanges SUI for WAL tokens if your WAL balance is insufficient
- Make sure your wallet passphrase is for a **Testnet** wallet, not Mainnet
