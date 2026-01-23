#!/bin/bash
# Retrieve by Identifier

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/01-examples"
QUILT_INFO="$SCRIPT_DIR/01-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with identifiable documents..."
    
    # Create a quilt with identifiable HTML documents
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/intro.html","identifier":"intro.html"}' \
              '{"path":"'"$EXAMPLES_DIR"'/chapter-01.html","identifier":"chapter-01.html"}' \
              '{"path":"'"$EXAMPLES_DIR"'/chapter-02.html","identifier":"chapter-02.html"}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

# Create output directory
mkdir -p "$SCRIPT_DIR/01-downloads"

# Retrieve specific documents from a quilt
walrus --context testnet read-quilt --out "$SCRIPT_DIR/01-downloads/" \
  --quilt-id "$QUILT_ID" \
  --identifiers chapter-01.html chapter-02.html intro.html

echo "Retrieval complete. Check ./01-downloads/"
