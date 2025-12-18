#!/bin/bash
# HTTP API Examples

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/07-examples"
QUILT_INFO="$SCRIPT_DIR/07-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with website pages..."
    
    # Create a quilt with website HTML pages
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/homepage.html","identifier":"homepage"}' \
              '{"path":"'"$EXAMPLES_DIR"'/about.html","identifier":"about"}' \
              '{"path":"'"$EXAMPLES_DIR"'/contact.html","identifier":"contact"}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

AGGREGATOR="https://aggregator.walrus-testnet.walrus.space"

echo "1. Get Patch by Identifier (homepage)"
curl "$AGGREGATOR/v1/blobs/by-quilt-id/$QUILT_ID/homepage" -o "$SCRIPT_DIR/07-homepage.html"

echo ""
echo "2. List All Patches"
curl "$AGGREGATOR/v1/quilts/$QUILT_ID/patches"

echo ""
echo ""
echo "Download complete. Check ./07-homepage.html"

# Note: Retrieve by Tag is not supported directly via HTTP API yet.

# Note: Retrieve by Patch ID requires a patch ID which we'd need to parse from the list.
# curl "$AGGREGATOR/v1/blobs/by-quilt-patch-id/<PATCH_ID>" -o output.file
