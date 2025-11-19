# Hands-On Walkthrough: Upload Flow

This hands-on section walks you through an actual upload flow with a visual sequence. You'll see each step of the process in detail.

## Prerequisites

Before starting, ensure you have:

- Completed the [System Components](./components.md) section to understand the architecture
- Reviewed the [Data Flow](./data-flow.md) section to understand how data moves through the system
- Understood [Chunk Creation and Encoding](./chunk-creation.md) to know how blobs are encoded
- Walrus CLI installed (see [Getting Started](../usage/started.md))
- Access to a Walrus network (testnet or mainnet)
- A wallet with sufficient SUI and WAL tokens (for direct uploads)
- Or access to a publisher endpoint (for HTTP uploads)

## Scenario: Uploading a File

Let's upload a simple text file to Walrus and trace its journey through the system.

### Step 1: Prepare Your Blob

First, create a simple file to upload:

```bash
echo "Hello, Walrus! This is my first blob." > my-blob.txt
```

This creates a small text file that we'll store in Walrus.

### Step 2: Choose Your Upload Method

You have two options:

#### Option A: Direct Upload (Using CLI)

```bash
walrus store my-blob.txt
```

This command:
1. Reads the file
2. Encodes it into slivers
3. Distributes to storage nodes
4. Registers on Sui
5. Returns the blob ID

```admonish info title="Blob Size Limits"
Walrus currently supports blobs up to a maximum size of 13.3 GiB. Larger blobs can be split into smaller chunks before storage. Check the maximum blob size using `walrus info`.
```

For detailed CLI command reference, see the [Client CLI documentation](../usage/client-cli.md).

#### Option B: Upload via Publisher (Using HTTP)

```bash
curl -X PUT http://publisher.example.com:31416/ \
  -H "Content-Type: application/octet-stream" \
  --data-binary @my-blob.txt
```

This sends the blob to a publisher, which handles all the encoding and distribution.

For HTTP API details, see the [Web API documentation](../usage/web-api.md).

### Step 3: Visual Sequence of Upload Flow

Let's trace what happens behind the scenes:

#### Phase 1: Encoding (Publisher/Client)

```
┌─────────────────────────────────────────┐
│  Original Blob: "Hello, Walrus!..."     │
│  Size: 38 bytes                          │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Encoding Process                        │
│  ────────────────────────                │
│  1. Split into symbols (k=334)          │
│  2. Apply Reed-Solomon encoding          │
│  3. Create sliver pairs                 │
│  4. Compute sliver hashes               │
│  5. Build Merkle tree                   │
│  6. Compute blob ID                     │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Encoded Result:                         │
│  • Blob ID: 0xabc123...                  │
│  • Sliver pairs: ~1000 pairs             │
│  • Metadata: size, encoding, hashes     │
│  • Total encoded size: ~190 bytes        │
└─────────────────────────────────────────┘
```

#### Phase 2: On-Chain Registration

```
┌─────────────────────────────────────────┐
│  Publisher/Client                       │
└───────────────┬─────────────────────────┘
                │ Create transaction
                │ • Register blob object
                │ • Reserve storage space
                │ • Post metadata
                ▼
┌─────────────────────────────────────────┐
│  Sui Blockchain                         │
│  ────────────────────────                │
│  Transaction:                            │
│  • Blob Object ID: 0xdef456...          │
│  • Blob ID: 0xabc123...                  │
│  • Size: 38 bytes                        │
│  • Encoding: RS2                        │
│  • Status: Registering                  │
└─────────────────────────────────────────┘
```

#### Phase 3: Sliver Distribution

```
┌─────────────────────────────────────────┐
│  Publisher/Client                       │
│  Has: 1000 sliver pairs                 │
└───────────────┬─────────────────────────┘
                │
                ├─────────────────┬─────────────────┬──────────────┐
                │                 │                 │              │
                ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Storage Node │  │ Storage Node │  │ Storage Node │  │ Storage Node │
│   Shard 1    │  │   Shard 2    │  │   Shard 3    │  │   Shard N    │
│              │  │              │  │              │  │              │
│ Receives:    │  │ Receives:    │  │ Receives:    │  │ Receives:    │
│ • Sliver 1   │  │ • Sliver 2   │  │ • Sliver 3   │  │ • Sliver N   │
│ • Metadata   │  │ • Metadata   │  │ • Metadata   │  │ • Metadata   │
│              │  │              │  │              │  │              │
│ Validates:   │  │ Validates:   │  │ Validates:   │  │ Validates:   │
│ ✓ Hash OK    │  │ ✓ Hash OK    │  │ ✓ Hash OK    │  │ ✓ Hash OK    │
│ ✓ Blob ID OK │  │ ✓ Blob ID OK │  │ ✓ Blob ID OK │  │ ✓ Blob ID OK │
│              │  │              │  │              │  │              │
│ Stores:      │  │ Stores:      │  │ Stores:      │  │ Stores:      │
│ • Sliver 1   │  │ • Sliver 2   │  │ • Sliver 3   │  │ • Sliver N   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       │ Signs certificate                  │                 │
       │                                   │                 │
       └─────────────────┬─────────────────┴─────────────────┘
                        │ Return signatures
                        ▼
┌─────────────────────────────────────────┐
│  Publisher/Client                       │
│  Collects signatures from storage nodes │
│  Aggregates into confirmation certificate│
└───────────────┬─────────────────────────┘
                │ Post certificate
                ▼
┌─────────────────────────────────────────┐
│  Sui Blockchain                         │
│  ────────────────────────                │
│  Certificate Posted:                     │
│  • Blob ID: 0xabc123...                  │
│  • Signatures: [sig1, sig2, sig3, ...]   │
│  • Status: Certified                     │
│                                          │
│  Event Emitted:                          │
│  • Point of Availability                 │
│  • Blob is now retrievable              │
└─────────────────────────────────────────┘
```

### Step 4: Verify Upload Success

After the upload completes, you'll receive a blob ID. Verify it was stored:

```bash
# Using CLI
walrus read <blob-id>

# Or via aggregator HTTP
curl http://aggregator.example.com:31415/<blob-id>
```

You should receive back: `"Hello, Walrus! This is my first blob."`

For more information about reading blobs and consistency checks, see the [Developer Operations guide](../dev-guide/dev-operations.md#read).

### Step 5: Inspect On-Chain State

Check the blob on Sui:

```bash
# Get blob object ID from the store result, then:
sui client object <blob-object-id>
```

You'll see:
- Blob metadata
- Storage epoch
- Certificate information
- Point of availability event

### Step 6: Trace the Retrieval Flow

Now let's see how retrieval works:

#### Retrieval Sequence

```
┌─────────────────────────────────────────┐
│  Client Request: GET /<blob-id>         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Aggregator                             │
│  1. Query Sui for blob metadata         │
│     • Blob ID: 0xabc123...              │
│     • Size: 38 bytes                    │
│     • Storage epoch: 42                 │
│     • Shard assignments                 │
└───────────────┬─────────────────────────┘
                │
                │ 2. Request slivers
                │    (needs 334 primary)
                │
                ├──────┬──────┬──────┬──────┐
                │      │      │      │      │
                ▼      ▼      ▼      ▼      ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Storage   │ │Storage   │ │Storage   │ │Storage   │
│Node 1    │ │Node 2    │ │Node 3    │ │Node N    │
│          │ │          │ │          │ │          │
│Returns:  │ │Returns:  │ │Returns:  │ │Returns:  │
│Sliver 1  │ │Sliver 2  │ │Sliver 3  │ │Sliver N  │
└─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘
      │           │           │           │
      └───────────┴───────────┴───────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Aggregator                             │
│  3. Decode 334 slivers                  │
│  4. Consistency check                   │
│     ✓ Sliver hashes match metadata     │
│  5. Reconstruct blob                    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Client Receives:                       │
│  "Hello, Walrus! This is my first blob."│
└─────────────────────────────────────────┘
```

## Key Observations

### During Upload

1. **Encoding overhead**: Small blob (38 bytes) becomes ~190 bytes encoded (5x expansion)
2. **Parallel distribution**: Slivers sent to many storage nodes simultaneously
3. **Verification at each step**: Storage nodes validate before storing
4. **On-chain coordination**: Sui tracks the entire process

### During Retrieval

1. **Partial reconstruction**: Only needs 334 slivers (1/3 of total)
2. **Parallel fetching**: Requests multiple storage nodes in parallel
3. **Verification**: Consistency check ensures data integrity
4. **Caching opportunity**: Aggregator can cache reconstructed blob

## Advanced: Monitoring the Flow

You can monitor the upload process:

```bash
# Enable verbose logging
RUST_LOG=debug walrus store my-blob.txt

# Or check metrics (if publisher/aggregator exposes them)
curl http://publisher.example.com:9090/metrics
```

Look for:
- Encoding duration
- Sliver distribution progress
- Storage node response times
- Certificate aggregation time

## Troubleshooting

### Upload Fails

- Check wallet has sufficient SUI/WAL
- Verify network connectivity to storage nodes
- Check blob size limits
- Review error messages for specific failures

### Retrieval Fails

- Verify blob ID is correct
- Check blob status on Sui (might be invalid)
- Ensure sufficient storage nodes are online
- Try different aggregator if one fails

## Related Sections

- **[System Components](./components.md)** - Review the components you've interacted with
- **[Chunk Creation and Encoding](./chunk-creation.md)** - Deep dive into the encoding process you've seen
- **[Data Flow](./data-flow.md)** - Review the complete flow you've just executed

## Next Steps

Now that you've completed the hands-on walkthrough:

1. Try uploading larger files
2. Experiment with different encoding types
3. Set up your own publisher or aggregator
4. Explore the [Developer Guide](../dev-guide/dev-guide.md) for more details
5. Check the [Operator Guide](../operator-guide/operator-guide.md) to run infrastructure

## Summary

You've now seen:
- ✅ How blobs are encoded into slivers
- ✅ How slivers are distributed to storage nodes
- ✅ How certificates are created and posted
- ✅ How blobs are retrieved and reconstructed
- ✅ The complete end-to-end flow

Congratulations! You now understand the Walrus architecture and data flow.

