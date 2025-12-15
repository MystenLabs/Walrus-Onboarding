# Control Boundaries: CLI vs SDK

Understanding what the CLI controls versus what the SDK (Rust crate) exposes is important for choosing the right tool and knowing what you're responsible for managing.

## Overview

Walrus provides two main ways to interact with the system programmatically:

1. **Walrus CLI**: Command-line tool for high-level operations with sensible defaults
2. **Walrus SDK (`walrus-sdk` Rust crate)**: Low-level library for building custom applications with fine-grained control
 3. Walrus SDK (TypeScript): Official SDK for building custom applications (@mysten/walrus)

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

**You don't control:**
- Encoding parameters (uses defaults)
- Parallelism level
- Retry logic parameters
- Timeout values
- Gas estimation strategy

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

## Comparison Table

| Aspect | CLI | SDK (Rust Crate) |
|--------|-----|------------------|
| **Use Case** | Command-line tool, scripts | Application integration |
| **Language** | Any (shell out) | Rust only |
| **Control Level** | High-level (complete workflows) | Low-level (building blocks) |
| **Defaults** | Sensible defaults provided | You must specify everything |
| **Error Handling** | Exit codes, stderr | Programmatic Result types |
| **Retry Logic** | Built-in (not customizable) | You implement |
| **Parallelism** | Automatic (not customizable) | You control |
| **Progress Tracking** | Limited | You implement |
| **Gas Management** | Automatic | You manage |
| **Wallet** | From config file | You load and manage |
| **Encoding** | Automatic with defaults | You call encoding functions |
| **Distribution** | Automatic | You manage distribution |
| **Retrieval** | Automatic | You manage fetching and reconstruction |
| **Verification** | Built-in (default or strict) | You call verification functions |
| **Learning Curve** | Low | Medium to High |
| **Flexibility** | Low | High |

---

## Decision Tree: CLI vs SDK

```
Do you need to integrate into a Rust application?
├─ Yes → Use SDK
└─ No
    └─ Do you need custom retry logic, parallel uploads, or fine-grained control?
        ├─ Yes → Use SDK (or build your own wrapper around CLI)
        └─ No
            └─ Are default CLI settings sufficient?
                ├─ Yes → Use CLI
                └─ No → Use SDK
```

---

## Hybrid Approach: Using Both

You can use CLI for some operations and SDK for others:

### Example: CLI for Testing, SDK for Production

```bash
# Development/testing: Use CLI
walrus store test.txt
walrus read <blob-id>

# Production: Use SDK in your Rust application
# (Call SDK functions for customized behavior)
```

### Example: CLI in Scripts, SDK in Application

```bash
# Bash script for backups (uses CLI)
#!/bin/bash
for file in /backups/*.tar.gz; do
  walrus store "$file" --epochs 50
done

# Main application (uses SDK in Rust code)
# Custom upload logic with progress tracking and retry
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

### SDK (Rust Crate)
- **Low-level library**: Building blocks for custom applications
- **Full control**: Customize everything (retry, parallelism, error handling)
- **Rust only**: Must use Rust language
- **More responsibility**: You must handle wallet, gas, errors, retries

### Publishers/Aggregators
- **Optional infrastructure**: Handle operations on your behalf
- **Untrusted**: Always verify their work
- **Convenient**: HTTP API, reduces bandwidth
- **Limited control**: Can't customize their internal logic

### Choosing The Right Tool
- **CLI**: Quick uploads, testing, scripts, defaults are fine
- **SDK**: Production apps, custom logic, performance optimization, Rust integration
- **Publishers/Aggregators**: HTTP access, convenience, willing to trust (with verification)

## Next Steps

Now that you understand control boundaries, proceed to [Practical Constraints](./practical-constraints.md) to learn about real-world limitations when building on Walrus.
