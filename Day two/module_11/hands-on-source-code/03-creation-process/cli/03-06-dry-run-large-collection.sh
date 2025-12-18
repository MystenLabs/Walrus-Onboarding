#!/bin/bash

# Example 6: Dry run for cost estimation (Testnet)
# Runs a dry-run store-quilt command against a sample large-collection directory.
#
# Requirements:
# - walrus CLI configured with a TESTNET context.

walrus --context testnet store-quilt --dry-run --epochs 50 --paths ../examples-files/large-collection/


