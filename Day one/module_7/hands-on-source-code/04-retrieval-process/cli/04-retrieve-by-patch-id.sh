#!/bin/bash
# Retrieve by Patch ID

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

# First list patches to get IDs
echo "To retrieve by patch ID, first list them:"
walrus list-patches-in-quilt "$QUILT_ID"

echo ""
echo "Then run:"
echo "walrus read-quilt --out ./downloads/ --quilt-patch-ids <PATCH_ID_1> <PATCH_ID_2>"

