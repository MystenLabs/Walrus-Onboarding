#!/bin/bash
# Retrieve by Tag

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/02-examples"
QUILT_INFO="$SCRIPT_DIR/02-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with tagged documents..."
    
    # Create a quilt with tagged documents (status and language tags)
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/readme-final.md","identifier":"readme","tags":{"status":"final","language":"en"}}' \
              '{"path":"'"$EXAMPLES_DIR"'/guide-final.md","identifier":"guide","tags":{"status":"final","language":"en"}}' \
              '{"path":"'"$EXAMPLES_DIR"'/notes-draft.md","identifier":"notes","tags":{"status":"draft","language":"en"}}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

mkdir -p "$SCRIPT_DIR/02-finals"
mkdir -p "$SCRIPT_DIR/02-en-docs"

# Example: Retrieve all final-status documents
walrus --context testnet read-quilt --out "$SCRIPT_DIR/02-finals/" \
  --quilt-id "$QUILT_ID" \
  --tag status final

# Example: Retrieve all English documentation
walrus --context testnet read-quilt --out "$SCRIPT_DIR/02-en-docs/" \
  --quilt-id "$QUILT_ID" \
  --tag language en

echo "Retrieval complete. Check ./02-finals/ and ./02-en-docs/"
