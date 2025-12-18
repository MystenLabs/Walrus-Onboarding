# SDK Upload Relay - Source Code

This directory contains TypeScript source code examples for the SDK Upload Relay curriculum module.

## Directory Structure

```
hands-on-source-code/
├── src/
│   ├── examples/
│   │   ├── basic-upload-example.ts      # Basic upload examples
│   │   ├── basic-download-example.ts    # Basic download examples
│   │   ├── hands-on-lab.ts              # Hands-on lab exercise
│   │   ├── retry-patterns.ts            # Retry pattern implementations
│   │   ├── partial-failures.ts          # Partial failure handling
│   │   └── integrity-checks.ts          # Integrity verification examples
│   ├── utils/
│   │   ├── getFundedKeypair.ts          # Utility for test keypairs
│   │   ├── isMainModule.ts              # Utility for detecting main module
│   │   └── validateTestnet.ts           # Testnet environment validation
│   └── run-all.ts                       # Main test runner
├── package.json                         # Node.js dependencies
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # This file
```

## Docker Setup (Recommended for Students)

For a consistent Docker-based environment, see the `../docker/` folder:

```sh
cd ../docker
make build
PASSPHRASE='your passphrase' make test
```

## Local Setup

### Prerequisites

- Node.js 20+ installed
- npm installed
- A funded Sui testnet wallet (with SUI for gas and WAL for storage)

### Install Dependencies

```sh
npm install
```

### Set Your Passphrase

**⚠️ REQUIRED:** The examples need a keypair to sign transactions. Set your passphrase:

```sh
export PASSPHRASE='your twelve word passphrase here'
```

Or pass it inline when running commands:

```sh
PASSPHRASE='your passphrase' npm run test:hands-on
```

## Running Examples

### Run All Examples

```sh
PASSPHRASE='your passphrase' npm test
```

### Run Individual Examples

```sh
# Basic upload example
PASSPHRASE='your passphrase' npm run test:basic-upload

# Basic download example (uploads first if no blob ID provided)
PASSPHRASE='your passphrase' npm run test:basic-download

# Or download a specific blob by ID
PASSPHRASE='your passphrase' npm run test:basic-download <blob-id>

# Hands-on lab
PASSPHRASE='your passphrase' npm run test:hands-on

# Retry patterns
PASSPHRASE='your passphrase' npm run test:retry

# Partial failures
PASSPHRASE='your passphrase' npm run test:partial-failures

# Integrity checks
PASSPHRASE='your passphrase' npm run test:integrity-checks
```

## Code Examples Included

### 1. Basic Upload Example (`basic-upload-example.ts`)
- Simple blob upload without relay
- Upload with relay configured
- Demonstrates the upload API

### 2. Basic Download Example (`basic-download-example.ts`)
- Uploads a test blob first if no blob ID is provided
- Simple blob download
- Download with error handling
- Content verification
- Demonstrates the download API

### 3. Hands-On Lab (`hands-on-lab.ts`)
- Complete upload script with retry logic
- Integrity verification
- Full workflow example

### 4. Retry Patterns (`retry-patterns.ts`)
- Basic retry utility
- Conditional retries
- Exponential backoff
- Smart retry strategies

### 5. Partial Failures (`partial-failures.ts`)
- Quorum checking
- Recovery strategies
- Error classification
- Partial failure handling

### 6. Integrity Checks (`integrity-checks.ts`)
- Manual integrity verification
- Blob content comparison
- Hash verification
- Upload and verify workflow

## Dependencies

- `@mysten/sui`: Sui blockchain client
- `@mysten/walrus`: Walrus SDK for storage operations
- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution environment

## Notes

- All examples use the Sui testnet
- You need a funded keypair with both SUI (for gas) and WAL (for storage) tokens
- Some examples may fail if network conditions are poor or nodes are unavailable
- Errors related to insufficient funds are expected if the keypair is not funded

## Source Documentation

All code examples are extracted from the markdown files in:
- `docs/book/curriculum/sdk_upload_relay/`
