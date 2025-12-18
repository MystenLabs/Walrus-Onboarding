#!/bin/bash
# List patches

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/03-examples"
QUILT_INFO="$SCRIPT_DIR/03-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with quarterly reports..."
    
    # Create a quilt with report files
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/report-2024-q1.txt","identifier":"report-q1"}' \
              '{"path":"'"$EXAMPLES_DIR"'/report-2024-q2.txt","identifier":"report-q2"}' \
              '{"path":"'"$EXAMPLES_DIR"'/report-2024-q3.txt","identifier":"report-q3"}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

echo "Listing patches for Quilt ID: $QUILT_ID"
walrus --context testnet list-patches-in-quilt "$QUILT_ID"
