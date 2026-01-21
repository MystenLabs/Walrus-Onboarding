# NFT Metadata Storage

NFTs need permanent, verifiable, and censorship-resistant metadata storage. Learn how Walrus provides this.

---

## The NFT Metadata Problem

### Current Situation

**Typical NFT structure**:
```json
{
  "name": "Cool NFT #1234",
  "image": "https://centralized-server.com/image.png",
  "attributes": [...]
}
```

**Problems**:
- ❌ Centralized servers can go down
- ❌ Images can be changed or deleted
- ❌ No guarantee of permanence
- ❌ Single point of failure

**💬 Discussion**: Have you seen NFTs with broken images? Why does this happen?

---

## Why Walrus for NFT Metadata?

### Key Benefits

| Requirement | Walrus Solution |
|-------------|-----------------|
| **Permanence** | Extend storage epochs indefinitely |
| **Verifiability** | Blob IDs are content-addressed |
| **Availability** | Byzantine fault tolerant (2/3 quorum) |
| **Decentralization** | Distributed across storage nodes |
| **Cost-effective** | ~$0.0059/GB/year (Mainnet pricing) |

### ✅ Checkpoint: Understanding Benefits

Which Walrus feature addresses each problem?
1. "My NFT image disappeared" → ?
2. "I can't verify the image is original" → ?
3. "The storage service shut down" → ?

**Instructor**: Review answers as a class.

---

## Architecture Pattern

### Option 1: Images on Walrus, Metadata on Sui

```
Sui NFT Object
├─ name: "Cool NFT #1234"
├─ image_blob_id: "057MX9P..."
└─ attributes: [...]
```

**Workflow**:
1. Upload image to Walrus → get blob ID
2. Create NFT on Sui with blob ID
3. Client fetches image from Walrus using blob ID

**Pros**:
- Image is permanent and verifiable
- Metadata queryable on Sui
- Low cost for large images

**Cons**:
- Two systems to integrate
- Sui object size limits for attributes

### Option 2: Everything on Walrus

```json
{
  "name": "Cool NFT #1234",
  "image": "<embedded-base64-or-blob-id>",
  "attributes": [...]
}
```

Store entire metadata JSON on Walrus, reference from Sui NFT.

**Pros**:
- Single blob for all metadata
- No Sui storage costs for metadata
- Can include unlimited attributes

**Cons**:
- Metadata not queryable on Sui
- Need aggregator to read metadata

**💬 Discussion**: Which pattern would you choose for a 10,000 NFT collection? Why?

---

## Cost Analysis

### Single NFT

**Image**: 500 KB JPEG
- Encoded size: ~2.5 MB (5x expansion)
- Storage units: 3 (ceil(2.5 MB / 1 MiB))
- Cost per epoch: 3 × 500 WAL = 1,500 WAL
- **Annual cost**: 1,500 WAL × 26 epochs ≈ 39,000 WAL

**Metadata JSON**: 2 KB
- Encoded size: ~64.01 MB (metadata overhead dominates)
- Storage units: 65
- Cost per epoch: 65 × 500 WAL = 32,500 WAL
- **Annual cost**: ~845,000 WAL

**Problem**: Small metadata files are expensive due to overhead!

### Using Quilts for NFT Collections

**10,000 NFTs, each with 2 KB metadata**:

**Without quilts**:
- 10,000 × 845,000 WAL/year = 8.45 billion WAL/year

**With quilts** (batch 666 metadatas per quilt):
- 15 quilts needed (10,000 / 666)
- Quilt size: ~1.3 MB per quilt
- Storage units per quilt: ~7
- Cost per quilt/year: 7 × 500 × 26 = 91,000 WAL
- **Total annual cost**: 15 × 91,000 = 1,365,000 WAL

**Savings**: 8.45B → 1.37M WAL = **99.98% reduction!**

### ✅ Checkpoint: Calculate Costs

Your NFT collection:
- 5,000 NFTs
- 1 MB images each
- 3 KB metadata each

Calculate:
1. Image storage cost (without quilts)
2. Metadata cost (with quilts)
3. Total annual cost

**Instructor**: Work through calculation as a class.

---

## Implementation Pattern

### Step 1: Upload Images

```bash
# Upload each image
for image in images/*.png; do
  BLOB_ID=$(walrus store "$image" --epochs 26 | grep "Blob ID" | awk '{print $3}')
  echo "$image,$BLOB_ID" >> image-mapping.csv
done
```

### Step 2: Create Metadata Files

```javascript
// generate-metadata.js
const metadata = nfts.map((nft, i) => ({
  name: `NFT #${i}`,
  image: imageBlobIds[i],
  attributes: nft.attributes
}));

fs.writeFileSync('metadata.json', JSON.stringify(metadata));
```

### Step 3: Upload as Quilt

```bash
# Upload all metadata as one quilt
walrus store-quilt --paths metadata/*.json --epochs 26
```

### Step 4: Mint NFTs

```move
// Simplified Move code
public fun mint_nft(
    image_blob_id: vector<u8>,
    metadata_quilt_id: vector<u8>,
    metadata_index: u64,
    ctx: &mut TxContext
): NFT {
    NFT {
        id: object::new(ctx),
        image_blob_id,
        metadata_quilt_id,
        metadata_index,
    }
}
```

### ✅ Checkpoint: Trace the Flow

With a partner, trace how a user would:
1. View an NFT on a marketplace
2. Retrieve the image
3. Retrieve the metadata

Where does each piece of data live?

---

## Best Practices

### 1. Plan Epochs in Advance

```bash
# Mint year: Extend for 26 epochs (1 year)
walrus store nft-image.png --epochs 26

# Later: Extend before expiration
walrus extend <blob-id> --additional-epochs 26
```

**Tip**: Set up monitoring to alert before epoch expiration.

### 2. Use Quilts for Small Files

**Quilt-appropriate**:
- ✅ Metadata JSONs (few KB each)
- ✅ Trait images (small icons)
- ✅ Thumbnails

**Single blob**:
- ✅ Full-size images (hundreds of KB+)
- ✅ Videos
- ✅ 3D models

### 3. Make Blob IDs Immutable

```move
public struct NFT has key, store {
    id: UID,
    image_blob_id: vector<u8>,  // Immutable after creation
    // ...
}
```

**Why**: Ensures image can't be swapped after minting.

### 4. Provide Fallback Aggregators

```javascript
const AGGREGATORS = [
  'https://aggregator.walrus.space',
  'https://backup-aggregator.example.com',
  'https://aggregator2.example.com'
];

async function fetchImage(blobId) {
  for (const aggregator of AGGREGATORS) {
    try {
      return await fetch(`${aggregator}/v1/${blobId}`);
    } catch (e) {
      continue; // Try next aggregator
    }
  }
  throw new Error('All aggregators failed');
}
```

### 5. Document Storage Strategy

Include in your NFT project documentation:
- Where images are stored
- Where metadata is stored
- Epoch extension plan
- Who pays for extensions
- Aggregator URLs

**💬 Discussion**: Who should be responsible for extending epochs? The creator or the community?

---

## Real Example: SuiFrens

**SuiFrens** (official Sui NFT collection) uses Walrus:

**Architecture**:
- Accessory images stored on Walrus
- Each accessory is a blob
- Frens composed from multiple accessories
- Metadata references Walrus blob IDs

**Key decisions**:
- Individual blobs (not quilts) for accessories
- Allows mixing and matching
- Images can be reused across Frens
- Cost amortized across many NFTs

**Lesson**: Design for your specific use case, not a generic template.

---

## Try It Yourself: Mini NFT Collection

**Exercise** (15 min):

1. Create 3 test images (or use placeholders)
2. Upload images to Walrus
3. Create metadata JSONs referencing blob IDs
4. Upload metadata as a quilt
5. Calculate total storage cost

```bash
# Your commands here
walrus store image1.png --epochs 1
# ... (record blob IDs)
# Create metadata JSONs
walrus store-quilt --paths metadata/*.json --epochs 1
```

### ✅ Checkpoint: Share Results

**Report to class**:
- How many blobs created?
- Quilt ID?
- Total cost for 1 epoch?
- How would cost scale to 10,000 NFTs?

---

## Key Takeaways

- NFT metadata needs permanent, verifiable storage
- Walrus provides decentralization and fault tolerance
- **Use quilts for small metadata files** (massive savings)
- Use individual blobs for images
- Plan epochs for long-term storage
- Make blob IDs immutable in contracts
- Provide multiple aggregator endpoints
- Document your storage strategy

**Next**: [Walrus Sites](./02-walrus-sites.md) - Decentralized website hosting
