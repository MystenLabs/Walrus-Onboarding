#!/bin/bash

# Example 1: Simple File Collection (Testnet)
# Uses the --paths option to recursively include files from specified directories.
#
# Requirements:
# - walrus CLI configured with a TESTNET context.
# - Your Sui wallet for that context funded with enough WAL on testnet.
#
# Example:
#   walrus --context testnet store-quilt --epochs 10 --paths ./examples-files/directory1 ./examples-files/directory2

walrus --context testnet store-quilt --epochs 10 --paths ../examples-files/directory1 ../examples-files/directory2


