#!/bin/bash
# Retrieve by Tag

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

echo "Using Quilt ID: $QUILT_ID"

mkdir -p ./finals
mkdir -p ./en-docs

# Example: Retrieve all final-status documents
walrus read-quilt --out ./finals/ \
  --quilt-id "$QUILT_ID" \
  --tag status final

# Example: Retrieve all English documentation
walrus read-quilt --out ./en-docs/ \
  --quilt-id "$QUILT_ID" \
  --tag language en

echo "Retrieval complete. Check ./finals/ and ./en-docs/"

