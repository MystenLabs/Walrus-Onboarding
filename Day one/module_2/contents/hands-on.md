# Hands-On Walkthrough: Upload Flow

This hands-on section walks you through an actual upload flow with a visual sequence. You'll see each step of the process in detail.

## Prerequisites

Before starting, ensure you have:

- Completed the [System Components](./components.md) section to understand the architecture
- Reviewed the [Data Flow](./data-flow.md) section to understand how data moves through the system
- Understood [Chunk Creation and Encoding](./chunk-creation.md) to know how blobs are encoded
- Walrus CLI installed (see [Getting Started](https://github.com/MystenLabs/walrus/blob/main/docs/usage/started.md))
- Access to a Walrus network (testnet or mainnet)
- A wallet with sufficient SUI and WAL tokens (for direct uploads)
- Or access to a publisher endpoint (for HTTP uploads)

## Scenario: Uploading a File

Let's upload a simple text file to Walrus and trace its journey through the system.

### Step 1: Prepare Your Blob

First, create a simple file to upload:

```bash
echo "Hello, Walrus! " > my-blob.txt
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

For detailed CLI command reference, see the [Client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/usage/client-cli.md).

#### Option B: Upload via Publisher (Using HTTP)

```bash
curl -X PUT http://publisher.example.com:31416/ \
  -H "Content-Type: application/octet-stream" \
  --data-binary @my-blob.txt
```

This sends the blob to a publisher, which handles all the encoding and distribution.

For HTTP API details, see the [Web API documentation](https://github.com/MystenLabs/walrus/blob/main/docs/usage/web-api.md).

### Step 3: Visual Sequence of Upload Flow

Let's trace what happens behind the scenes:

![Upload Flow Diagram](../images/upload-flow-diagram.svg)

*[Excalidraw source file](../assets/upload-flow-diagram.excalidraw.json) - Import into [Excalidraw.com](https://excalidraw.com) to view or edit*

#### Phase 1: Encoding (Publisher/Client)

```mermaid
flowchart TD
    Blob[Original Blob: 'Hello, Walrus!...'] --> Encoding
    
    subgraph Encoding [Encoding Process]
        direction TB
        Split[1. Split into symbols] --> RS[2. Apply Reed-Solomon]
        RS --> Pairs[3. Create sliver pairs]
        Pairs --> Hashes[4. Compute hashes]
        Hashes --> Merkle[5. Build Merkle tree]
        Merkle --> BlobID[6. Compute blob ID]
    end

    Encoding --> Result
    
    subgraph Result [Encoded Result]
        direction TB
        ResID[Blob ID: 0xabc123...]
        ResPairs[Sliver pairs: ~1000]
        ResMeta[Metadata: size, encoding]
        ResSize[Total size: ~190 bytes]
        ResID --- ResPairs
        ResPairs --- ResMeta
        ResMeta --- ResSize
    end
```

#### Phase 2: On-Chain Registration

```mermaid
sequenceDiagram
    participant PC as Publisher/Client
    participant Sui as Sui Blockchain

    Note over PC: Create transaction:<br/>• Register blob object<br/>• Reserve storage space<br/>• Post metadata

    PC->>Sui: Transaction
    Note over Sui: • Blob Object ID: 0xdef456...<br/>• Blob ID: 0xabc123...<br/>• Size: 38 bytes<br/>• Encoding: RS2<br/>• Status: Registering
```

#### Phase 3: Sliver Distribution

```mermaid
sequenceDiagram
    participant PC as Publisher/Client
    participant SN1 as Storage Node (Shard 1)
    participant SN2 as Storage Node (Shard 2)
    participant SN3 as Storage Node (Shard 3)
    participant SNN as Storage Node (Shard N)
    participant Sui as Sui Blockchain

    Note over PC: Has: 1000 sliver pairs

    par Parallel Distribution
        PC->>SN1: Store Sliver 1 + Metadata
        PC->>SN2: Store Sliver 2 + Metadata
        PC->>SN3: Store Sliver 3 + Metadata
        PC->>SNN: Store Sliver N + Metadata
    end

    par Validation & Storage
        Note over SN1: Validate: Hash OK, Blob ID OK<br/>Store: Sliver 1
        Note over SN2: Validate: Hash OK, Blob ID OK<br/>Store: Sliver 2
        Note over SN3: Validate: Hash OK, Blob ID OK<br/>Store: Sliver 3
        Note over SNN: Validate: Hash OK, Blob ID OK<br/>Store: Sliver N
    end

    par Return Signatures
        SN1-->>PC: Signed Certificate
        SN2-->>PC: Signed Certificate
        SN3-->>PC: Signed Certificate
        SNN-->>PC: Signed Certificate
    end

    Note over PC: Collect signatures<br/>Aggregate into confirmation certificate

    PC->>Sui: Post Certificate
    Note over Sui: • Blob ID: 0xabc123...<br/>• Signatures: [sig1, sig2...]<br/>• Status: Certified<br/><br/>Event Emitted:<br/>• Point of Availability
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

For more information about reading blobs and consistency checks, see the [Developer Operations guide](https://github.com/MystenLabs/walrus/blob/main/docs/dev-guide/dev-operations.md#read).

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

![Download/Retrieval Flow Diagram](../images/download-flow-diagram.svg)

*[Excalidraw source file](../assets/download-flow-diagram.excalidraw.json) - Import into [Excalidraw.com](https://excalidraw.com) to view or edit*

#### Retrieval Sequence

```mermaid
sequenceDiagram
    participant Client
    participant Agg as Aggregator
    participant Sui as Sui Blockchain
    participant SN as Storage Nodes (1..N)

    Client->>Agg: GET /<blob-id>
    
    Agg->>Sui: Query Blob Metadata
    Sui-->>Agg: ID, Size, Epoch, Shard Assignments

    Agg->>SN: Request Slivers (needs 334 primary)
    SN-->>Agg: Return Slivers

    Note over Agg: Decode 334 slivers<br/>Consistency check (hashes match)<br/>Reconstruct blob

    Agg-->>Client: "Hello, Walrus! This is my first blob."
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
4. Explore the [Developer Guide](https://github.com/MystenLabs/walrus/blob/main/docs/dev-guide/dev-guide.md) for more details
5. Check the [Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/operator-guide/operator-guide.md) to run infrastructure

## Summary

You've now seen:
- ✅ How blobs are encoded into slivers
- ✅ How slivers are distributed to storage nodes
- ✅ How certificates are created and posted
- ✅ How blobs are retrieved and reconstructed
- ✅ The complete end-to-end flow

Congratulations! You now understand the Walrus architecture and data flow.
