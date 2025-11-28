#!/bin/bash
# Retrieve All Patches

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

mkdir -p ./all-files

walrus read-quilt --out ./all-files/ \
  --quilt-id "$QUILT_ID"

echo "All files retrieved to ./all-files/"

