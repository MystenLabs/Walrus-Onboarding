#!/bin/bash
# Common Retrieval Patterns

if [ -f ../../quilt-info.json ]; then
    QUILT_ID=$(jq -r .quiltId ../../quilt-info.json)
else
    QUILT_ID="057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik"
fi

# Pattern 1: Selective Download by Category
mkdir -p ./images ./docs
walrus read-quilt --out ./images/ --quilt-id "$QUILT_ID" --tag type image
walrus read-quilt --out ./docs/ --quilt-id "$QUILT_ID" --tag type document

# Pattern 2: Download by List of Identifiers
cat > files-to-download.txt << EOF
chapter-01.html
chapter-02.html
EOF

mkdir -p ./chapters
for identifier in $(cat files-to-download.txt); do
  walrus read-quilt --out ./chapters/ \
    --quilt-id "$QUILT_ID" \
    --identifiers "$identifier"
done
rm files-to-download.txt

