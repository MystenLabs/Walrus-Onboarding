#!/bin/bash

# Example 2: Store an NFT collection (Testnet)
# Assumes directory structure under ./examples-files/nft-collection/ :
#   nft-collection/
#     ├── image001.png
#     └── metadata/
#         └── meta001.json
#
# Requirements:
# - walrus CLI configured with a TESTNET context.
# - Your Sui wallet for that context funded with enough WAL on testnet.

walrus --context testnet store-quilt --epochs 20 --paths ../examples-files/nft-collection/


