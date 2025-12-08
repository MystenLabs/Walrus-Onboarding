#!/bin/bash
# Retrieve by Identifier

# Load quilt ID from previous step if available, otherwise use placeholder
if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

echo "Using Quilt ID: $QUILT_ID"

# Create output directory
mkdir -p ./downloads

# Retrieve specific documents from a quilt
# Note: You might need to adjust identifiers based on what's actually in your quilt
walrus read-quilt --out ./downloads/ \
  --quilt-id "$QUILT_ID" \
  --identifiers chapter-01.html chapter-02.html intro.html

echo "Retrieval complete. Check ./downloads/"

