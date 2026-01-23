#!/bin/bash

# Example 3: Using --blobs with metadata (Testnet)
# The --blobs option allows full control over identifiers and tags.
#
# Requirements:
# - walrus CLI configured with a TESTNET context.
# - Your Sui wallet for that context funded with enough WAL on testnet.

walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"../examples-files/file1.pdf","identifier":"paper-v2","tags":{"author":"Alice","status":"final"}}' \
          '{"path":"../examples-files/file2.pdf","identifier":"paper-v3","tags":{"author":"Bob","status":"draft"}}'


