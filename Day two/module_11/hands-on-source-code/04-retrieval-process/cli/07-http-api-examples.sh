#!/bin/bash
# HTTP API Examples

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

AGGREGATOR="https://aggregator.testnet.walrus.space"

echo "1. Get Patch by Identifier"
curl "$AGGREGATOR/v1/blobs/by-quilt-id/$QUILT_ID/chapter-01" -o chapter-01.html

echo "2. List Patches"
curl "$AGGREGATOR/v1/quilts/$QUILT_ID/patches"

# Note: Retrieve by Tag is not supported directly via HTTP API yet.

# Note: Retrieve by Patch ID requires a patch ID which we'd need to parse from the list.
# curl "$AGGREGATOR/v1/blobs/by-quilt-patch-id/<PATCH_ID>" -o output.file

