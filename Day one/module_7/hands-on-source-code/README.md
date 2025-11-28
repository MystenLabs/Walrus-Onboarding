# Walrus Quilts Hands-On Lab

This directory contains the source code for the hands-on lab in the Quilts curriculum.

## Prerequisites

- Docker installed
- A funded Sui Testnet wallet passphrase (optional, default is provided but may not have funds)

## Running the Lab

1. Build the Docker image:
   ```bash
   make build
   ```

2. Run the lab:
   ```bash
   # If you have a funded wallet passphrase:
   PASSPHRASE="your passphrase here" make test

   # Or simply:
   make test
   ```

The lab will:
1. Create test files.
2. Create a quilt with these files using the Walrus SDK.
3. Retrieve files from the quilt using different methods.





