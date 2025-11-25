# SDK Upload Relay Code Verification

This directory contains all source code examples extracted from the SDK Upload Relay curriculum markdown files, organized as executable TypeScript files for local verification.

## Directory Structure

```
hands_on_code/
├── src/
│   ├── examples/
│   │   ├── basic-upload-example.ts      # Basic upload examples
│   │   ├── basic-download-example.ts    # Basic download examples
│   │   ├── hands-on-lab.ts              # Hands-on lab exercise
│   │   ├── retry-patterns.ts            # Retry pattern implementations
│   │   ├── partial-failures.ts          # Partial failure handling
│   │   └── integrity-checks.ts          # Integrity verification examples
│   ├── utils/
│   │   └── getFundedKeypair.ts          # Utility for test keypairs
│   └── run-all.ts                       # Main test runner
├── package.json                         # Node.js dependencies
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # This file
```

## Setup

### Option 1: Docker (Recommended for Students)

Docker provides a consistent environment across all systems. This is the recommended approach for students.

**Prerequisites:**
- Docker Desktop installed ([Download Docker](https://www.docker.com/products/docker-desktop/))
- Docker Compose (usually included with Docker Desktop)
- **A passphrase (mnemonic)** for keypair derivation

**Quick Start:**

```bash
cd hands_on_code

# 1. Set your passphrase (choose one method):
#    Option A: Copy .env.example to .env and edit it
cp .env.example .env
#    Edit .env and add: PASSPHRASE="your passphrase here"

#    Option B: Export as environment variable
export PASSPHRASE="your passphrase here"

# 2. Build the Docker image
make build

# 3. Run all tests (with passphrase)
make test
# Or pass directly: PASSPHRASE="your passphrase" make test

# Run specific tests
PASSPHRASE="your passphrase" make test-upload
PASSPHRASE="your passphrase" make test-hands-on
PASSPHRASE="your passphrase" make test-integrity
```

**⚠️ Important:** Most test commands require the `PASSPHRASE` environment variable. See [DOCKER.md](./DOCKER.md) for detailed instructions.

**Using Makefile (easier):**

```bash
make help                   # Show all available commands
make build                  # Build Docker image
make test                   # Run all tests
make test-upload            # Run basic upload test
make test-download          # Run basic download test
make test-hands-on          # Run hands-on lab
make test-integrity         # Run integrity checks
make test-retry             # Run retry patterns test
make test-partial-failures  # Run partial failures test
make shell                  # Open interactive shell in container
make clean                  # Clean up containers and images
```

**Interactive Shell:**

```bash
# Start an interactive shell to explore and run commands manually
make shell

# Inside the container, you can run:
npm test                    # Run all tests
npm run test:basic-upload   # Run specific test
node --version              # Check Node version
```

### Option 2: Local Node.js Setup

1. **Prerequisites:**
   - Node.js 20+ installed
   - npm installed

2. **Install dependencies:**
   ```bash
   cd hands_on_code
   npm install
   ```

3. **Ensure you have a funded Sui testnet wallet:**
   - The `getFundedKeypair` utility will attempt to request SUI from the faucet
   - Or manually fund a keypair if needed

## Running Examples

### Using Docker (Recommended)

```bash
# Run all tests
make test

# Run individual tests
make test-upload
make test-download
make test-hands-on
make test-integrity
make test-retry
make test-partial-failures
```

### Using Local Node.js

**Run All Examples:**
```bash
npm test
```

**Run Individual Examples:**

```bash
# Basic upload example
npm run test:basic-upload

# Basic download example (requires a blob ID)
npm run test:basic-download <blob-id>

# Hands-on lab
npm run test:hands-on

# Retry patterns
npm run test:retry


# Partial failures
npm run test:partial-failures

# Integrity checks
npm run test:integrity-checks
```

## Code Examples Included

### 1. Basic Upload Example (`basic-upload-example.ts`)
- Simple blob upload without relay
- Upload with relay configured
- Demonstrates the upload API

### 2. Basic Download Example (`basic-download-example.ts`)
- Simple blob download
- Download with error handling
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
- `ts-node`: TypeScript execution environment

## Notes

- All examples use the Sui testnet
- **Important**: You need a funded keypair with both SUI (for gas) and WAL (for storage) tokens to run upload examples
- The `getFundedKeypair` utility will attempt to request SUI from the faucet, but rate limits may apply
- Some examples may fail if network conditions are poor or nodes are unavailable
- The test runner includes delays between tests to avoid overwhelming the network
- Errors related to insufficient funds are expected if the keypair is not funded

## Running with Your Own Keypair

To use your own funded keypair, you can modify `src/utils/getFundedKeypair.ts` to load a keypair from environment variables or a file:

```typescript
// Example: Load from environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (PRIVATE_KEY) {
  const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
  return keypair;
}
```

## Source Documentation

All code examples are extracted from the markdown files in:
- `docs/book/curriculum/sdk_upload_relay/`

Each file includes a comment indicating its source markdown file.

