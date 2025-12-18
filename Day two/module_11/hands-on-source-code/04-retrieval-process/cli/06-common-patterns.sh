#!/bin/bash
# Common Retrieval Patterns

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/06-examples"
QUILT_INFO="$SCRIPT_DIR/06-quilt-info.json"

# Load quilt ID from previous step, or create a new quilt
if [ -f "$QUILT_INFO" ]; then
    QUILT_ID=$(jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId' "$QUILT_INFO")
    echo "Using existing Quilt ID: $QUILT_ID"
else
    echo "No quilt-info.json found. Creating a new quilt with categorized content..."
    
    # Create a quilt with typed and identifiable content
    RESULT=$(walrus --context testnet store-quilt --json --epochs 10 \
      --blobs '{"path":"'"$EXAMPLES_DIR"'/hero-banner.svg","identifier":"hero-banner","tags":{"type":"image"}}' \
              '{"path":"'"$EXAMPLES_DIR"'/product-icon.svg","identifier":"product-icon","tags":{"type":"image"}}' \
              '{"path":"'"$EXAMPLES_DIR"'/tutorial-part1.html","identifier":"tutorial-part1","tags":{"type":"document"}}' \
              '{"path":"'"$EXAMPLES_DIR"'/tutorial-part2.html","identifier":"tutorial-part2","tags":{"type":"document"}}')
    
    QUILT_ID=$(echo "$RESULT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId')
    echo "$RESULT" > "$QUILT_INFO"
    echo "Created new quilt with ID: $QUILT_ID"
fi

# Pattern 1: Selective Download by Category
mkdir -p "$SCRIPT_DIR/06-images" "$SCRIPT_DIR/06-docs"
walrus --context testnet read-quilt --out "$SCRIPT_DIR/06-images/" --quilt-id "$QUILT_ID" --tag type image
walrus --context testnet read-quilt --out "$SCRIPT_DIR/06-docs/" --quilt-id "$QUILT_ID" --tag type document

# Pattern 2: Download by List of Identifiers
cat > "$SCRIPT_DIR/files-to-download.txt" << EOF
tutorial-part1
tutorial-part2
EOF

mkdir -p "$SCRIPT_DIR/06-tutorials"
for identifier in $(cat "$SCRIPT_DIR/files-to-download.txt"); do
  walrus --context testnet read-quilt --out "$SCRIPT_DIR/06-tutorials/" \
    --quilt-id "$QUILT_ID" \
    --identifiers "$identifier"
done
rm "$SCRIPT_DIR/files-to-download.txt"

echo "Pattern retrieval complete. Check ./06-images/, ./06-docs/, and ./06-tutorials/"