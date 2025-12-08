#!/bin/bash

# Example 1: Simple File Collection
# The --paths option recursively includes files from specified directories
walrus store-quilt --epochs 10 --paths /path/to/directory1 /path/to/directory2

# Example 2: Store an NFT collection
# Assumes directory structure:
# nft-collection/
#   ├── image001.png
#   ├── metadata/
#       ├── meta001.json
walrus store-quilt --epochs 20 --paths ./nft-collection/

# Example 3: Using --blobs (Advanced with Metadata)
# The --blobs option allows full control over identifiers and tags
walrus store-quilt --epochs 10 \
  --blobs '{"path":"/path/to/file1.pdf","identifier":"paper-v2","tags":{"author":"Alice","status":"final"}}' \
          '{"path":"/path/to/file2.pdf","identifier":"paper-v3","tags":{"author":"Bob","status":"draft"}}'

# Example 4: Store documentation with metadata
walrus store-quilt --epochs 30 \
  --blobs '{"path":"./docs/intro.html","identifier":"intro","tags":{"chapter":"1","lang":"en","version":"1.0"}}' \
          '{"path":"./docs/getting-started.html","identifier":"getting-started","tags":{"chapter":"2","lang":"en","version":"1.0"}}' \
          '{"path":"./docs/api-reference.html","identifier":"api-ref","tags":{"chapter":"3","lang":"en","version":"1.0"}}'

# Example 5: Complete CLI Example
# Create a quilt with custom metadata
walrus store-quilt --epochs 25 \
  --blobs '{"path":"./assets/logo.png","identifier":"logo","tags":{"type":"image","format":"png","size":"small"}}' \
          '{"path":"./assets/banner.jpg","identifier":"banner","tags":{"type":"image","format":"jpg","size":"large"}}' \
          '{"path":"./config/app.json","identifier":"config","tags":{"type":"config","format":"json"}}'

# Example 6: Dry Run for Cost Estimation
walrus store-quilt --dry-run --epochs 50 --paths ./large-collection/

