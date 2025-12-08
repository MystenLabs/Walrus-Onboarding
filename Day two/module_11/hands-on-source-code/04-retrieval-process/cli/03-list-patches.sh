#!/bin/bash
# List patches

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

echo "Listing patches for Quilt ID: $QUILT_ID"

walrus list-patches-in-quilt "$QUILT_ID"

