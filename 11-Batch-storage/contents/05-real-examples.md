# Real Examples

This section provides complete, working examples for common quilt use cases using CLI, TypeScript SDK, and HTTP APIs.

## Example 1: NFT Image Collection (CLI)

Store and manage a collection of NFT images with metadata.

### Scenario

You have a collection of NFT profile pictures, each with metadata about rarity, attributes, etc.

### Directory Structure

```text
images/
├── nft-001.png
├── nft-002.png
└── ...
metadata/
├── nft-001.json
├── nft-002.json
└── ...
```

### Step 1: Create the Quilt with Custom Metadata

```sh
walrus --context testnet store-quilt --epochs 1 \
  --blobs '{"path":"images/nft-001.png","identifier":"nft-001-image","tags":{"rarity":"legendary","type":"image"}}' \
          '{"path":"metadata/nft-001.json","identifier":"nft-001-meta","tags":{"rarity":"legendary","type":"metadata"}}' \
          '{"path":"images/nft-002.png","identifier":"nft-002-image","tags":{"rarity":"rare","type":"image"}}' \
          '{"path":"metadata/nft-002.json","identifier":"nft-002-meta","tags":{"rarity":"rare","type":"metadata"}}'
```


**Output**:

```text
Success: Deletable blob stored successfully.
Path: path(s) ignored for quilt store result
Blob ID: DZspa25-3gJQsF5T82L91VYXoDh1gmwqwLnwlX4ZUtU
Sui object ID: 0x4b5167a54dcf72821013e78ec854004ff21298faafaf4404a783a651298e6495
Unencoded size: 435 KiB
Encoded size (including replicated metadata): 63.0 MiB
Cost (excluding gas): 0.0002 WAL (storage was purchased, and a new blob object was registered) 
Expiry epoch (exclusive): 294
Encoding type: RedStuff/Reed-Solomon

----------------------------------------------------------------------------------------
 Index  QuiltPatchId                                        Sliver Range  Identifier 
----------------------------------------------------------------------------------------
 0      DZspa25-3gJQsF5T82L91VYXoDh1gmwqwLnwlX4ZUtUBAQACAA  [1, 2)        nft-001-image 
 1      DZspa25-3gJQsF5T82L91VYXoDh1gmwqwLnwlX4ZUtUBAgADAA  [2, 3)        nft-001-meta 
 2      DZspa25-3gJQsF5T82L91VYXoDh1gmwqwLnwlX4ZUtUBAwAEAA  [3, 4)        nft-002-image 
 3      DZspa25-3gJQsF5T82L91VYXoDh1gmwqwLnwlX4ZUtUBBAAFAA  [4, 5)        nft-002-meta 
----------------------------------------------------------------------------------------
```

### Step 2: List All NFTs in the Collection

```sh
walrus --context testnet list-patches-in-quilt GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc
```

### Step 3: Retrieve Only Legendary NFTs

```sh
# Get all legendary NFT images
walrus --context testnet read-quilt --out ./legendary/ \
  --quilt-id GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc \
  --tag rarity legendary
```

### Step 4: Retrieve a Specific NFT

```sh
# Get specific NFT by identifier
walrus --context testnet read-quilt --out ./nft-001/ \
  --quilt-id GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc \
  --identifiers nft-001-image nft-001-meta
```

**Shell Script for Automation**:

[View full source code](../hands-on-source-code/05-real-example/nft-collection-upload.sh)

## Example 2: Static Website Hosting (TypeScript SDK)

Deploy a static website using quilts for cost-efficient hosting.

### Scenario

Deploy a documentation website with HTML, CSS, JavaScript, and image files.

### Complete Code

[View full source code](../hands-on-source-code/05-real-example/website-deploy.ts)

**Source Reference**: Based on [`ts-sdks/packages/walrus/examples/quilt/write-flow.ts`](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/examples/quilt/write-flow.ts)

### Retrieving the Website

[View full source code](../hands-on-source-code/05-real-example/website-retrieve.ts)

## Example 3: Game Asset Management (TypeScript)

Store game level assets with efficient retrieval.

### Scenario

A game needs to load textures, sounds, and configuration files for each level.

### Code

[View full source code](../hands-on-source-code/05-real-example/game-assets.ts)

## Example 4: Batch Processing Output (CLI + Script)

Store batch processing results with metadata.

### Scenario

A data pipeline processes 1000 files and stores results as a quilt for analysis.

### Shell Script

[View full source code](../hands-on-source-code/05-real-example/process-and-store.sh)

### Retrieval Script

[View full source code](../hands-on-source-code/05-real-example/retrieve-batch-results.sh)

## Key Takeaways

- **Versatility**: Quilts support diverse use cases from NFTs and static sites to batch data processing
- **Hybrid approaches**: Combining CLI for administration and SDKs for applications is often effective
- **Metadata power**: Tags are critical for organizing and querying data efficiently within quilts
- **Automation**: Scripts are essential for managing large collections and repetitive tasks
- **Patterns**: Effective use of identifiers and tags simplifies complex data management

## Source References

All examples are based on or inspired by:
- CLI implementation: [`crates/walrus-service/src/client/cli/`](https://github.com/MystenLabs/walrus/tree/main/crates/walrus-service/src/client/cli/)
- TypeScript examples: [`ts-sdks/packages/walrus/examples/quilt/`](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples/quilt/)
- HTTP API: [`crates/walrus-service/src/client/daemon/routes.rs`](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-service/src/client/daemon/routes.rs)
- Python API examples: [`docs/examples/python/`](https://github.com/MystenLabs/walrus/tree/main/docs/examples/python/)

## Next Steps

Proceed to [Typical Mistakes](./06-typical-mistakes.md) to learn about common pitfalls and how to avoid them.



