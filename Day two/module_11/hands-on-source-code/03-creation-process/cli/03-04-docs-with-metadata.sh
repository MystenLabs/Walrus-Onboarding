#!/bin/bash

# Example 4: Store documentation with metadata (Testnet)
# Demonstrates multiple HTML docs with chapter/lang/version tags.
#
# Requirements:
# - walrus CLI configured with a TESTNET context.
# - Your Sui wallet for that context funded with enough WAL on testnet.

walrus --context testnet store-quilt --epochs 30 \
  --blobs '{"path":"../examples-files/docs/intro.html","identifier":"intro","tags":{"chapter":"1","lang":"en","version":"1.0"}}' \
          '{"path":"../examples-files/docs/getting-started.html","identifier":"getting-started","tags":{"chapter":"2","lang":"en","version":"1.0"}}' \
          '{"path":"../examples-files/docs/api-reference.html","identifier":"api-ref","tags":{"chapter":"3","lang":"en","version":"1.0"}}'


