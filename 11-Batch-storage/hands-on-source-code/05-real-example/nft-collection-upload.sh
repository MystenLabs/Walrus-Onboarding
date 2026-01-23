#!/bin/bash
# nft-collection-upload.sh

QUILT_EPOCHS=1
QUILT_BLOBS=""

# Create directories and dummy files if they don't exist
mkdir -p images metadata
for i in $(seq -f "%03g" 1 5); do
  # Create dummy image
  echo "Image data $i" > "images/nft-${i}.png"
  
  # Create dummy metadata
  RARITY="common"
  if [ "$i" -eq 1 ]; then RARITY="legendary"; fi
  if [ "$i" -eq 2 ]; then RARITY="rare"; fi
  
  echo "{\"name\": \"NFT #$i\", \"rarity\": \"$RARITY\"}" > "metadata/nft-${i}.json"
done

# Build JSON for all NFTs (limiting to 5 for test)
for i in $(seq -f "%03g" 1 5); do
  # Need to read rarity from json file, use grep/sed as jq might not be available
  # simplistic parsing
  RARITY=$(grep -o '"rarity": "[^"]*"' "metadata/nft-${i}.json" | cut -d'"' -f4)
  
  QUILT_BLOBS+=" '{\"path\":\"images/nft-${i}.png\",\"identifier\":\"nft-${i}-image\",\"tags\":{\"rarity\":\"${RARITY}\",\"type\":\"image\"}}'"
  QUILT_BLOBS+=" '{\"path\":\"metadata/nft-${i}.json\",\"identifier\":\"nft-${i}-meta\",\"tags\":{\"rarity\":\"${RARITY}\",\"type\":\"metadata\"}}'"
done

# Store as quilt
echo "Running command: walrus store-quilt --epochs \"$QUILT_EPOCHS\" --blobs $QUILT_BLOBS"
eval walrus --context testnet store-quilt --epochs "$QUILT_EPOCHS" --blobs $QUILT_BLOBS
