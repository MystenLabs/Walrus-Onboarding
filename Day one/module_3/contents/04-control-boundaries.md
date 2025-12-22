# Control Boundaries: CLI vs TypeScript SDK

Understanding what the CLI controls versus what the TypeScript SDK exposes is important for choosing the right tool and knowing what you're responsible for managing.

> **Note for this audience**: This module focuses on the **CLI** and **TypeScript SDK** as they're most relevant for fullstack and frontend developers. Walrus also provides a Rust SDK (`walrus-sdk`) for low-level systems programming, but that's outside the scope of this training.

## Overview

Walrus provides two main ways to interact with the system that are relevant for web developers:

1. **Walrus CLI**: Command-line tool for high-level operations with sensible defaults
2. **Walrus SDK (TypeScript `@mysten/walrus`)**: Official SDK for building web and Node.js applications with programmatic access

---

## Walrus CLI

The CLI is a high-level tool that handles complete workflows with reasonable defaults.

### What The CLI Controls

#### 1. Complete Upload Workflow

**Command:**
```bash
walrus store file.txt
```

**What it does automatically:**
- Reads the file from disk
- Encodes the blob using default encoding (RedStuff)
- Queries Sui for current storage nodes and shard assignments
- Distributes slivers to storage nodes in parallel
- Collects signatures from storage nodes
- Creates and signs Sui transaction to register blob
- Posts certificate to Sui blockchain
- Returns blob ID and metadata

**You control:**
- Which file to upload
- Number of storage epochs (via `--epochs` flag)
- Whether blob is deletable (via `--deletable` flag)
- Wallet to use (via config)
- Upload relay mode (via `--upload-relay` flag, v1.29+) for limited bandwidth clients

**You don't control:**
- Encoding parameters (uses defaults)
- Parallelism level
- Retry logic parameters
- Timeout values
- Gas estimation strategy

#### 1a. Upload Relay Mode (v1.29+)

**For clients with limited bandwidth:**

```bash
# Use upload relay to offload encoding and distribution
walrus store file.txt --upload-relay
```

**What `--upload-relay` does:**
- Sends raw file to a relay server (Publisher)
- Relay performs encoding and distribution
- Significantly reduces client bandwidth requirements
- Client doesn't need to upload slivers to all storage nodes
- Relay handles sliver distribution on your behalf

**When to use upload relay:**
- Limited client bandwidth (e.g., mobile, slow connections)
- Large files where uploading encoded slivers would take too long
- Client device has limited computational resources
- Using a Publisher that supports relay functionality

**Trade-offs:**
- Must trust the relay/Publisher to encode correctly (verify blob ID after)
- Relay must be available and accessible
- Adds one more dependency to the upload process
- May incur relay service fees (depends on relay provider)

**Example:**
```bash
# Standard upload: Client encodes + distributes slivers
# Bandwidth: ~4.5x file size (erasure coding overhead)
walrus store 1GB-file.dat
# Client uploads: ~4.5 GB

# Upload relay: Client sends raw file to relay
# Bandwidth: 1x file size (relay does the rest)
walrus store 1GB-file.dat --upload-relay
# Client uploads: ~1 GB (4.5x bandwidth savings!)
```

#### 2. Complete Retrieval Workflow

**Command:**
```bash
walrus read <blob-id>
```

**What it does automatically:**
- Queries Sui for blob metadata
- Identifies storage nodes with slivers
- Fetches 334 primary slivers in parallel
- Reconstructs the blob using erasure decoding
- Performs consistency check (default level)
- Outputs blob data to stdout

**You control:**
- Which blob to retrieve (blob ID)
- Output destination (stdout or file via shell redirection)
- Consistency level (via query parameter when using aggregator)

**You don't control:**
- Which storage nodes to fetch from (automatic selection)
- Parallelism level
- Retry logic
- Timeout values

#### 3. Wallet Management

**Commands:**
```bash
walrus # Uses wallet from config
sui client active-address # Shows active wallet
```

**What it manages:**
- Loading wallet credentials from config
- Signing transactions
- Estimating and paying gas
- Managing transaction nonces

**You control:**
- Which wallet to configure
- Wallet private keys (stored in Sui config)

**You don't control:**
- Gas estimation algorithm
- Transaction retry logic
- Nonce management details

#### 4. Network Configuration

**Config file** (`~/.walrus/config.yaml` or similar):

**What it configures:**
- Sui RPC endpoints
- Default storage epochs
- Default encoding type
- Publisher/Aggregator endpoints (if using)

**You control:**
- Which endpoints to use
- Timeout values (in some cases)
- Default parameters

**You don't control:**
- Network protocol details
- Connection pooling
- Internal retry logic

### CLI Limitations

**What you CAN'T do with CLI alone:**

1. **Custom encoding logic**: Can't modify encoding parameters
2. **Advanced retry strategies**: Can't customize retry behavior
3. **Parallel operations**: Can't upload multiple blobs simultaneously in one CLI invocation
4. **Custom verification**: Can't implement custom consistency checks
5. **Integration**: Can't embed directly in your application (need to shell out)
6. **Streaming**: Limited control over streaming large blobs
7. **Progress tracking**: Limited progress callbacks
8. **Error handling**: Can't catch and handle errors programmatically (exit codes only)

### When To Use CLI

✅ **Use CLI when:**
- Quick uploads/downloads from command line
- Testing and debugging
- Scripting simple automation
- Default settings are sufficient
- You don't need custom logic
- Limited bandwidth (use `--upload-relay` flag)

❌ **Don't use CLI when:**
- Building a production application
- Need custom retry/error handling
- Need to upload many blobs efficiently
- Need progress tracking or callbacks
- Need fine-grained control

---

## Walrus SDK (Rust Crate)

The SDK provides low-level building blocks for custom applications.

### What The SDK Exposes

#### 1. Low-Level Encoding

**SDK functions** (from `walrus-sdk` crate):

```rust
// Conceptual API (refer to actual Rust documentation)
pub fn encode_blob(data: &[u8], encoding_type: EncodingType) -> Result<EncodedBlob>
pub fn compute_blob_id(encoded: &EncodedBlob) -> BlobId
```

**What you control:**
- When to encode
- Encoding parameters (if customizable)
- How to handle encoded slivers
- Error handling for encoding failures

**What you must implement:**
- Reading data into memory or streaming
- Memory management for large blobs
- Progress tracking if needed

#### 2. Low-Level Distribution

**SDK functions:**

```rust
// Conceptual API
pub fn send_sliver_to_node(node: &StorageNode, sliver: &Sliver) -> Result<Signature>
pub fn distribute_slivers_parallel(slivers: Vec<Sliver>, nodes: Vec<StorageNode>) -> Result<Vec<Signature>>
```

**What you control:**
- Which nodes to send to
- Parallelism level (how many concurrent requests)
- Timeout values per request
- Retry logic for failed sends
- Progress tracking

**What you must implement:**
- Error handling for node failures
- Collecting responses
- Determining when quorum is reached (2/3 of signatures)

#### 3. On-Chain Interaction

**SDK functions:**

```rust
// Conceptual API
pub fn register_blob_on_sui(blob_metadata: BlobMetadata, wallet: &Wallet) -> Result<TransactionId>
pub fn post_certificate(certificate: Certificate, wallet: &Wallet) -> Result<TransactionId>
```

**What you control:**
- Transaction parameters
- Gas budget
- When to submit transactions
- Wallet to use

**What you must implement:**
- Transaction retry logic
- Confirmation waiting
- Error handling for transaction failures

#### 4. Retrieval and Reconstruction

**SDK functions:**

```rust
// Conceptual API
pub fn fetch_blob_metadata(blob_id: BlobId) -> Result<BlobMetadata>
pub fn fetch_sliver(node: &StorageNode, sliver_id: SliverId) -> Result<Sliver>
pub fn reconstruct_blob(slivers: Vec<Sliver>, metadata: &BlobMetadata) -> Result<Vec<u8>>
pub fn verify_consistency(blob: &[u8], blob_id: BlobId, level: ConsistencyLevel) -> Result<bool>
```

**What you control:**
- Which nodes to fetch from
- How many slivers to fetch (minimum 334)
- Parallelism and timeouts
- Consistency check level
- Retry logic

**What you must implement:**
- Node selection logic
- Error handling for missing slivers
- Fallback to other nodes if failures occur

### SDK Advantages

**What you CAN do with SDK that you can't with CLI:**

1. **Custom retry strategies**: Exponential backoff, circuit breakers, etc.
2. **Parallel operations**: Upload many blobs concurrently
3. **Progress tracking**: Implement callbacks for progress updates
4. **Custom error handling**: Catch errors programmatically and respond
5. **Integration**: Embed in your application (no shelling out)
6. **Streaming**: Stream large blobs without loading entirely in memory
7. **Optimization**: Fine-tune parallelism, timeouts, connection pooling
8. **Custom verification**: Implement application-specific consistency checks

### SDK Responsibilities

**What you MUST handle when using SDK:**

1. **Wallet management**: Load keys, sign transactions, handle nonces
2. **Gas estimation**: Estimate gas costs, handle insufficient funds
3. **Retry logic**: Implement retries for network failures, transaction failures
4. **Error handling**: Handle all error cases (network, encoding, on-chain)
5. **Concurrency**: Manage parallelism and avoid overwhelming nodes
6. **Progress tracking**: Implement if needed for user feedback
7. **Memory management**: Handle large blobs efficiently
8. **Configuration**: Manage RPC endpoints, timeouts, etc.

### When To Use SDK

✅ **Use SDK when:**
- Building a production application
- Need custom retry/error handling
- Need to upload many blobs efficiently (parallelism)
- Need progress tracking or callbacks
- Need fine-grained control over operations
- Performance optimization is critical
- Integration into a larger Rust application

❌ **Don't use SDK when:**
- Quick one-off uploads/downloads
- Prototyping or testing
- Default CLI behavior is sufficient
- You're not comfortable with Rust
- Overhead of integration isn't worth it

---

## Walrus SDK (TypeScript)

The TypeScript SDK (`@mysten/walrus`) provides programmatic access to Walrus for web and Node.js applications.

### What The TypeScript SDK Exposes

#### Installation

```bash
npm install @mysten/walrus @mysten/sui
```

#### 1. Client Initialization

**First, initialize the Walrus client by extending a Sui JSON-RPC client:**

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';

// Create a Sui client and extend it with Walrus functionality
const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
}).$extend(walrus());

// Now you can use client.walrus.* methods
```

**What you control:**
- Which Sui network to use (testnet, mainnet, etc.)
- Sui RPC endpoint configuration

#### 2. Store Operations

**Write blobs directly:**

```typescript
// Example: Store text as a blob
const file = new TextEncoder().encode('Hello from the TS SDK!!!\n');

const { blobId } = await client.walrus.writeBlob({
    blob: file,
    deletable: false,
    epochs: 3,
    signer: keypair, // Your Sui keypair
});

console.log('Blob ID:', blobId);
```

**Write files with metadata:**

```typescript
import { WalrusFile } from '@mysten/walrus';

// Create a file with identifier
const file1 = WalrusFile.from({
    contents: new Uint8Array([1, 2, 3]),
    identifier: 'file1.bin',
});

// Write multiple files (creates a Quilt)
const results = await client.walrus.writeFiles({
    files: [file1],
    epochs: 3,
    deletable: true,
    signer: keypair,
});
```

**What you control:**
- Blob content (Uint8Array)
- Storage epochs (how long to store)
- Deletable flag (whether blob can be deleted)
- Signer (your wallet keypair)

**What you must implement:**
- Wallet/keypair management
- Converting your data to Uint8Array
- Error handling for upload failures
- Retry logic for network failures

#### 3. Read Operations

**Read blobs directly:**

```typescript
// Read a blob by its ID
const blob = await client.walrus.readBlob({
    blobId: 'your-blob-id-here'
});

// blob is a Uint8Array
const text = new TextDecoder().decode(blob);
console.log('Blob content:', text);
```

**Read files from blobs or Quilts:**

```typescript
// Get files by ID (works with both individual blobs and Quilts)
const [file1, file2] = await client.walrus.getFiles({
    ids: ['blob-id-1', 'quilt-id-2']
});

// Multiple ways to extract data
const bytes = await file1.bytes();      // Get as Uint8Array
const text = await file1.text();        // Get as text string
const json = await file2.json();        // Parse as JSON
```

**What you control:**
- Which blob/file IDs to retrieve
- How to process retrieved data (bytes, text, JSON)

**What you must implement:**
- Error handling for missing blobs
- Caching strategy (if needed)
- Data processing after retrieval
- Retry logic for failed reads

#### 4. Complete Working Example

**Here's a full end-to-end example showing upload and retrieval:**

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// 1. Initialize the Walrus client
const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
}).$extend(walrus());

// 2. Set up your keypair (from environment variable or secure storage)
const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC!);

async function storeAndRetrieve() {
    try {
        // 3. Store a blob
        const data = new TextEncoder().encode('Hello from Walrus TS SDK!');

        console.log('Storing blob...');
        const { blobId } = await client.walrus.writeBlob({
            blob: data,
            deletable: false,
            epochs: 5,
            signer: keypair,
        });

        console.log('✓ Blob stored with ID:', blobId);

        // 4. Retrieve the blob
        console.log('Retrieving blob...');
        const retrievedBlob = await client.walrus.readBlob({ blobId });

        const retrievedText = new TextDecoder().decode(retrievedBlob);
        console.log('✓ Retrieved content:', retrievedText);

        // 5. Verify data integrity
        if (retrievedText === 'Hello from Walrus TS SDK!') {
            console.log('✓ Data integrity verified!');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

storeAndRetrieve();
```

**Working with Quilts (multiple small files):**

```typescript
import { WalrusFile } from '@mysten/walrus';

async function storeQuilt() {
    // Create multiple files
    const file1 = WalrusFile.from({
        contents: new TextEncoder().encode('{"name": "Alice"}'),
        identifier: 'user1.json',
    });

    const file2 = WalrusFile.from({
        contents: new TextEncoder().encode('{"name": "Bob"}'),
        identifier: 'user2.json',
    });

    // Store as a Quilt (batched)
    const results = await client.walrus.writeFiles({
        files: [file1, file2],
        epochs: 5,
        deletable: true,
        signer: keypair,
    });

    console.log('✓ Quilt stored:', results);

    // Retrieve files from Quilt
    const [retrievedFile1, retrievedFile2] = await client.walrus.getFiles({
        ids: [results.quiltId] // Or individual blob IDs
    });

    const userData1 = await retrievedFile1.json();
    console.log('User 1:', userData1);
}
```

**Reference:** Full examples available at https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples

### TypeScript SDK Advantages

**What you CAN do with TypeScript SDK:**

1. **Web application integration**: Use directly in React, Vue, Angular apps
2. **Node.js backend**: Integrate into Express, NestJS servers
3. **HTTP API access**: Leverages Publisher/Aggregator HTTP endpoints
4. **Modern async/await**: Clean promise-based API
5. **Browser compatibility**: Works in both browser and Node.js
6. **TypeScript types**: Full type safety and autocomplete
7. **Easier than Rust**: More accessible for web developers

### TypeScript SDK Limitations

**What you CAN'T do (compared to Rust SDK):**

1. **No direct encoding**: Must use Publisher for encoding
2. **No direct distribution**: Can't talk directly to storage nodes
3. **HTTP dependency**: Requires Publisher/Aggregator infrastructure
4. **Less control**: Higher-level than Rust SDK
5. **Trust Publisher/Aggregator**: Must rely on their operations
6. **No on-chain operations**: Can't post certificates directly to Sui (uses Publisher)

### When To Use TypeScript SDK

✅ **Use TypeScript SDK when:**
- Building web applications (frontend)
- Building Node.js backend services
- Using JavaScript/TypeScript ecosystem
- Publisher/Aggregator infrastructure available
- Don't need low-level control
- Want easier integration than Rust

❌ **Don't use TypeScript SDK when:**
- Need direct storage node access
- Need custom encoding logic
- Can't rely on Publisher/Aggregator
- Need maximum performance (use Rust)
- Building systems-level applications

---

## Comparison Table

| Aspect | CLI | TypeScript SDK |
|--------|-----|----------------|
| **Use Case** | Command-line tool, scripts | Web/Node.js applications |
| **Language** | Any (shell out) | JavaScript/TypeScript |
| **Control Level** | High-level (complete workflows) | Mid-level (HTTP API wrapper) |
| **Defaults** | Sensible defaults provided | Some defaults via Publisher/Aggregator |
| **Error Handling** | Exit codes, stderr | Promises, try/catch |
| **Retry Logic** | Built-in (not customizable) | You implement |
| **Parallelism** | Automatic (not customizable) | You control (via async/await) |
| **Progress Tracking** | Limited | You implement |
| **Gas Management** | Automatic | You provide keypair (gas paid via Sui) |
| **Wallet** | From config file | You provide signer/keypair |
| **Encoding** | Automatic with defaults | Publisher handles |
| **Distribution** | Automatic | Publisher handles |
| **Retrieval** | Automatic | Aggregator handles |
| **Verification** | Built-in (default or strict) | Limited (via Aggregator) |
| **Infrastructure** | None required | Requires Publisher/Aggregator |
| **Bandwidth Optimization** | `--upload-relay` flag (v1.29+) | Via Publisher (automatic) |
| **Learning Curve** | Low | Low to Medium |
| **Flexibility** | Low | Medium |

---

## Decision Tree: Which Tool to Use?

```
What are you building?
├─ Web/Node.js application?
│   ├─ Yes → TypeScript SDK (requires Publisher/Aggregator)
│   └─ No → Continue
│
├─ Limited bandwidth or computational resources?
│   ├─ Yes → CLI with --upload-relay flag
│   └─ No → Continue
│
├─ Command-line scripts or one-off operations?
│   ├─ Yes → CLI
│   └─ No → Continue
│
└─ Need programmatic integration in web app?
    ├─ Yes → TypeScript SDK
    └─ No → CLI (for scripts and testing)
```

---

## Hybrid Approach: Using Both

You can use CLI for some operations and TypeScript SDK for others:

### Example: CLI for Testing, TypeScript SDK for Production

```bash
# Development/testing: Use CLI
walrus store test.txt
walrus read <blob-id>
```

```typescript
// Production: Use TypeScript SDK in your web application
// Custom upload logic with progress tracking and retry
const { blobId } = await client.walrus.writeBlob({
  blob: fileData,
  epochs: 50,
  signer: keypair
});
```

### Example: CLI in Scripts, TypeScript SDK in Application

```bash
# Bash script for backups (uses CLI)
#!/bin/bash
for file in /backups/*.tar.gz; do
  walrus store "$file" --epochs 50
done
```

```typescript
// Main web application (uses TypeScript SDK)
// Custom upload logic with progress tracking and retry
async function uploadWithProgress(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  return await uploadWithRetry(client, data);
}
```

---

## What Publishers/Aggregators Control

When using Publishers/Aggregators, they handle operations on your behalf:

### Publisher Controls

- Encoding your blob
- Distributing slivers to storage nodes
- Collecting signatures
- Posting certificate to Sui
- Managing their own wallet and gas

### Aggregator Controls

- Querying Sui for metadata
- Fetching slivers from storage nodes
- Reconstructing blob
- Performing consistency checks
- Optional caching

### You Control (When Using Publisher/Aggregator)

- Which blob to upload/retrieve
- Storage epochs (upload parameter)
- Consistency level (retrieval parameter)

### You Don't Control

- How they manage gas (publisher's wallet)
- Their retry logic
- Their parallelism strategy
- Their caching policy (aggregator)

**Important:** Publishers and Aggregators are untrusted. Always verify their work (check blob IDs, consistency checks).

---

## Key Points

### CLI
- **High-level tool**: Complete workflows with sensible defaults
- **Easy to use**: Low learning curve, good for scripts and testing
- **Limited control**: Can't customize retry logic, parallelism, error handling
- **Automatic**: Handles wallet, gas, distribution, reconstruction automatically
- **Upload relay mode** (v1.29+): `--upload-relay` flag for limited bandwidth clients (4.5x bandwidth savings)

### TypeScript SDK
- **Mid-level library**: HTTP API wrapper for web/Node.js applications
- **Web-friendly**: Works in browser and Node.js with modern async/await
- **Publisher/Aggregator required**: Relies on HTTP infrastructure
- **Programmatic control**: Can implement custom retry logic, error handling, and application integration
- **Best for web developers**: Designed for building applications on Walrus

### Publishers/Aggregators
- **Optional infrastructure**: Handle operations on your behalf
- **Untrusted**: Always verify their work
- **Convenient**: HTTP API, reduces bandwidth
- **Limited control**: Can't customize their internal logic
- **Required for TypeScript SDK**: TypeScript SDK uses these endpoints

### Choosing The Right Tool
- **CLI**: Quick uploads, testing, scripts, defaults are fine, limited bandwidth (with `--upload-relay`)
- **TypeScript SDK**: Web/Node.js apps, JavaScript/TypeScript ecosystem, when Publisher/Aggregator available, need custom application logic
- **Publishers/Aggregators**: HTTP access, convenience, willing to trust (with verification)

## Next Steps

Now that you understand control boundaries, proceed to [Practical Constraints](./05-practical-constraints.md) to learn about real-world limitations when building on Walrus.
