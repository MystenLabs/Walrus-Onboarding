#!/bin/bash
# retrieve-batch-results.sh

QUILT_ID="$1"
OUTPUT_DIR="./retrieved-results"

if [ -z "$QUILT_ID" ]; then
  echo "Usage: $0 <QUILT_ID>"
  exit 1
fi

echo "Retrieving batch results from quilt: $QUILT_ID"

mkdir -p "$OUTPUT_DIR"

# Get all results
walrus read-quilt --out "$OUTPUT_DIR" --quilt-id "$QUILT_ID"

# Count files
NUM_FILES=$(ls -1 "$OUTPUT_DIR" | wc -l)

echo "✓ Retrieved $NUM_FILES result files to $OUTPUT_DIR"

# Optional: Parse and analyze results
echo "Analyzing results..."
for result_file in "$OUTPUT_DIR"/*.json; do
  # Process each result
  # simple grep extraction since jq might not be available everywhere
  RESULT=$(grep -o '"result": "[^"]*"' "$result_file" | cut -d'"' -f4)
  echo "  - $(basename "$result_file"): $RESULT"
done
