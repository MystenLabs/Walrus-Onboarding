#!/bin/bash
# process-and-store.sh

set -e

RESULTS_DIR="./processing-results"
BATCH_ID="batch-$(date +%Y%m%d-%H%M%S)"
EPOCHS=20

echo "Processing data batch: $BATCH_ID"

# Process data (placeholder)
mkdir -p "$RESULTS_DIR"
# Reduced loop count for test speed
for i in $(seq 1 10); do
  # Simulate processing
  echo "Processing item $i..."
  echo "{\"result\": \"data-$i\", \"processed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
    > "$RESULTS_DIR/result-$(printf "%04d" $i).json"
done

echo "Building quilt command..."

# Build store-quilt command with all results
BLOBS_JSON=""
for result_file in "$RESULTS_DIR"/*.json; do
  filename=$(basename "$result_file")
  item_num=$(echo "$filename" | grep -o '[0-9]\+')
  
  # Add to blobs JSON
  blob_entry=$(cat <<EOF
{"path":"$result_file","identifier":"result-$item_num","tags":{"batch":"$BATCH_ID","type":"result","item":"$item_num"}}
EOF
  )
  
  BLOBS_JSON="$BLOBS_JSON '$blob_entry'"
done

echo "Storing quilt with results..."

# Store as quilt
eval walrus --context testnet store-quilt --epochs "$EPOCHS" --blobs $BLOBS_JSON --json > quilt-info.json

QUILT_ID=$(grep -o '"quilt_id":"[^"]*"' quilt-info.json | cut -d'"' -f4)
if [ -z "$QUILT_ID" ]; then
    # Current camelCase blobId field from walrus --json output
    QUILT_ID=$(grep -o '"blobId": *"[^"]*"' quilt-info.json | head -n 1 | cut -d'"' -f4)
fi

echo "✓ Batch results stored!"
echo "  Batch ID: $BATCH_ID"
echo "  Quilt ID: $QUILT_ID"
echo "  Items: 10"
echo "  Epochs: $EPOCHS"

# Save metadata
cat > "batch-metadata-$BATCH_ID.json" <<EOF
{
  "batch_id": "$BATCH_ID",
  "quilt_id": "$QUILT_ID",
  "items": 10,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "epochs": $EPOCHS
}
EOF

echo "Metadata saved to: batch-metadata-$BATCH_ID.json"
