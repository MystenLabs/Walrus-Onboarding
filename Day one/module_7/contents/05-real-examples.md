# Real Examples

This section provides complete, working examples for common quilt use cases using CLI, TypeScript SDK, and HTTP APIs.

## Example 1: NFT Image Collection (CLI)

Store and manage a collection of NFT images with metadata.

### Scenario

You have a collection of 100 profile picture NFTs, each with metadata about rarity, attributes, etc.

### Directory Structure

```text
nft-collection/
├── images/
│   ├── nft-001.png
│   ├── nft-002.png
│   └── ...
└── metadata/
    ├── nft-001.json
    ├── nft-002.json
    └── ...
```

### Step 1: Create the Quilt with Custom Metadata

```sh
walrus store-quilt --epochs 50 \
  --blobs '{"path":"images/nft-001.png","identifier":"nft-001-image","tags":{"rarity":"legendary","type":"image"}}' \
          '{"path":"metadata/nft-001.json","identifier":"nft-001-meta","tags":{"rarity":"legendary","type":"metadata"}}' \
          '{"path":"images/nft-002.png","identifier":"nft-002-image","tags":{"rarity":"common","type":"image"}}' \
          '{"path":"metadata/nft-002.json","identifier":"nft-002-meta","tags":{"rarity":"common","type":"metadata"}}'
```


**Output**:

```text
Successfully stored quilt!
Quilt ID: GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc
Blob object ID: 0x1a2b3c...
End epoch: 150
Patches: 4
Storage cost: 0.012 WAL
```

### Step 2: List All NFTs in the Collection

```sh
walrus list-patches-in-quilt GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc
```

### Step 3: Retrieve Only Legendary NFTs

```sh
# Get all legendary NFT images
walrus read-quilt --out ./legendary/ \
  --quilt-id GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc \
  --tag rarity legendary
```

### Step 4: Retrieve a Specific NFT

```sh
# Get specific NFT by identifier
walrus read-quilt --out ./nft-001/ \
  --quilt-id GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc \
  --identifiers nft-001-image nft-001-meta
```

**Shell Script for Automation**:

[View full source code](./hands-on-source-code/05-real-example/nft-collection-upload.sh)

## Example 2: Static Website Hosting (TypeScript SDK)

Deploy a static website using quilts for cost-efficient hosting.

### Scenario

Deploy a documentation website with HTML, CSS, JavaScript, and image files.

### Complete Code

[View full source code](./hands-on-source-code/05-real-example/website-deploy.ts)

**Source Reference**: Based on [`ts-sdks/packages/walrus/examples/quilt/write-flow.ts`](../../../../ts-sdks/packages/walrus/examples/quilt/write-flow.ts)

### Retrieving the Website

[View full source code](./hands-on-source-code/05-real-example/website-retrieve.ts)

## Example 3: Game Asset Management (TypeScript)

Store game level assets with efficient retrieval.

### Scenario

A game needs to load textures, sounds, and configuration files for each level.

### Code

[View full source code](./hands-on-source-code/05-real-example/game-assets.ts)

## Example 4: Batch Processing Output (CLI + Script)

Store batch processing results with metadata.

### Scenario

A data pipeline processes 1000 files and stores results as a quilt for analysis.

### Shell Script

[View full source code](./hands-on-source-code/05-real-example/process-and-store.sh)

### Retrieval Script

[View full source code](./hands-on-source-code/05-real-example/retrieve-batch-results.sh)

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



