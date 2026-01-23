#!/bin/bash
# Retrieve by Patch ID

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/04-examples"
QUILT_INFO="$SCRIPT_DIR/04-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with contract versions..."
    
    # Create a quilt with contract version files
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/contract-v1.json","identifier":"contract-v1"}' \
              '{"path":"'"$EXAMPLES_DIR"'/contract-v2.json","identifier":"contract-v2"}' \
              '{"path":"'"$EXAMPLES_DIR"'/contract-v3.json","identifier":"contract-v3"}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

# First list patches to get IDs
echo "To retrieve by patch ID, first list them:"
walrus --context testnet list-patches-in-quilt "$QUILT_ID"

echo ""
echo "Now enter one or more QuiltPatchId values from the table above."
echo "You can paste multiple IDs separated by spaces."
read -r -p "QuiltPatchId(s): " PATCH_IDS

if [ -z "$PATCH_IDS" ]; then
  echo "No patch IDs provided. Exiting without downloading."
  exit 0
fi

DOWNLOAD_DIR="$SCRIPT_DIR/04-downloads"
mkdir -p "$DOWNLOAD_DIR"

echo ""
echo "Downloading selected patches into: $DOWNLOAD_DIR"
walrus --context testnet read-quilt --out "$DOWNLOAD_DIR/" --quilt-patch-ids $PATCH_IDS

echo "Done. Check ./04-downloads/ for the retrieved files."
