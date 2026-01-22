# Module 10 SDK Examples

This directory contains runnable TypeScript examples demonstrating Walrus SDK operations.

## Prerequisites

- Node.js v18+
- A funded Sui testnet wallet (SUI + WAL tokens)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file** by copying the template:

   ```bash
   cp .env.template .env
   ```

3. **Add your private key** to the `.env` file:

   ```
   WALLET_PRIVATE_KEY=your_private_key_here
   ```

## Running Examples

All examples use [tsx](https://github.com/privatenumber/tsx) to run TypeScript directly:

```bash
npx tsx <example>.ts [args]
```

### upload.ts

Uploads a simple text blob to Walrus.

```bash
npx tsx upload.ts
```

**Output:**
- Blob ID (content hash)
- Blob Object ID (Sui object for mutations)

### read-blob.ts

Reads a blob by its Blob ID.

```bash
npx tsx read-blob.ts <BLOB_ID>
```

**Example:**
```bash
npx tsx read-blob.ts HgdsoQvwPXUN5r-SPJUR1jr7AZcmipShkQLBY4lruqI
```

### extend-blob.ts

Extends the storage duration of an existing blob.

```bash
npx tsx extend-blob.ts <BLOB_OBJECT_ID>
```

**Note:** Requires the Sui Object ID (not the Blob ID). Get this from `upload.ts` output.

### create-quilt.ts

Creates a Quilt (batched blob) from `config.json` and `avatar.png` in the current directory.

```bash
npx tsx create-quilt.ts
```

**Prerequisites:** Ensure `config.json` and `avatar.png` exist in this directory.

### production-config.ts

Demonstrates production client configuration with timeouts. No network calls—just validates the setup.

```bash
npx tsx production-config.ts
```

## File Reference

| File | Description | Requires Args |
|------|-------------|---------------|
| `upload.ts` | Upload a text blob | No |
| `read-blob.ts` | Read blob by ID | Yes: `<BLOB_ID>` |
| `extend-blob.ts` | Extend blob storage | Yes: `<BLOB_OBJECT_ID>` |
| `create-quilt.ts` | Batch upload files | No (needs `config.json`, `avatar.png`) |
| `production-config.ts` | Production config example | No |

## Troubleshooting

### "Cannot find module '@mysten/sui/client'"

Run `npm install` to install dependencies.

### "Set WALLET_PRIVATE_KEY in your environment"

Create a `.env` file with your private key:

```bash
cp .env.template .env
# Then edit .env and add your private key
```

### Insufficient balance errors

Ensure your wallet has both SUI (for gas) and WAL (for storage) on testnet. Use the [Sui Testnet Faucet](https://faucet.testnet.sui.io/) for SUI.
