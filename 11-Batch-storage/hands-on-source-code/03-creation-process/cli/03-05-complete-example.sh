#!/bin/bash

# Example 5: Complete CLI example (Testnet)
# Creates a quilt with custom metadata for image assets and a config file.
#
# Requirements:
# - walrus CLI configured with a TESTNET context.
# - Your Sui wallet for that context funded with enough WAL on testnet.

walrus --context testnet store-quilt --epochs 25 \
  --blobs '{"path":"../examples-files/assets/logo.png","identifier":"logo","tags":{"type":"image","format":"png","size":"small"}}' \
          '{"path":"../examples-files/assets/banner.jpg","identifier":"banner","tags":{"type":"image","format":"jpg","size":"large"}}' \
          '{"path":"../examples-files/config/app.json","identifier":"config","tags":{"type":"config","format":"json"}}'


