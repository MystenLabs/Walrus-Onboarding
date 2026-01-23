#!/bin/bash
# Retrieve All Patches

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/05-examples"
QUILT_INFO="$SCRIPT_DIR/05-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with config files..."
    
    # Create a quilt with configuration files
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/config.yaml","identifier":"config.yaml"}' \
              '{"path":"'"$EXAMPLES_DIR"'/settings.json","identifier":"settings.json"}' \
              '{"path":"'"$EXAMPLES_DIR"'/manifest.txt","identifier":"manifest.txt"}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

mkdir -p "$SCRIPT_DIR/05-all-files"

walrus --context testnet read-quilt --out "$SCRIPT_DIR/05-all-files/" \
  --quilt-id "$QUILT_ID"

echo "All files retrieved to ./05-all-files/"
