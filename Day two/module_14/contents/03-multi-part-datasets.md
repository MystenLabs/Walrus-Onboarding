# Multi-Part Datasets

Large datasets need to be split into manageable chunks. Learn strategies for handling multi-part data on Walrus.

---

## The Large Dataset Problem

### Challenges with Large Files

**Typical scenarios**:
- Machine learning models (1-50 GB)
- Scientific datasets (100 GB+)
- Media libraries (TB scale)
- Database backups (varies)

**Problems with monolithic storage**:
- ❌ Upload failures harder to recover
- ❌ Can't parallelize operations
- ❌ All-or-nothing downloads
- ❌ Difficult to update portions
- ❌ Higher latency to first byte

**💬 Discussion**: Why might you want to split a 10 GB ML model into parts?

---

## Multi-Part Strategy Benefits

### Advantages of Chunking

| Benefit | Explanation |
|---------|-------------|
| **Parallelization** | Upload/download chunks concurrently |
| **Fault tolerance** | Re-upload only failed chunks |
| **Partial access** | Retrieve specific parts without full download |
| **Incremental updates** | Replace changed chunks only |
| **Cost efficiency** | Extend epochs per chunk based on usage |

### ✅ Checkpoint: Understand Trade-offs

For a 5 GB video file, would you:
- Store as one blob?
- Split into chunks?

**Pair Discussion**: What factors influence your decision?

---

## Chunking Strategies

### Strategy 1: Fixed-Size Chunks

**Pattern**:
```bash
# Split file into 100 MB chunks
split -b 100M large-file.bin chunk_

# Uploads chunks
for chunk in chunk_*; do
  walrus store "$chunk" --epochs 26
done
```

**Chunk naming**:
```
chunk_aa
chunk_ab
chunk_ac
...
```

**Pros**:
- Simple to implement
- Predictable chunk count
- Easy to parallelize

**Cons**:
- May split logical boundaries (e.g., video frames)

### Strategy 2: Logical Boundaries

**Pattern**: Split at natural boundaries

**Examples**:
- Video: Split by keyframes or scenes
- ML model: Split by layers
- Database: Split by table or partition
- Archive: Split by file

**Pros**:
- Chunks have semantic meaning
- Can serve parts independently
- More efficient partial updates

**Cons**:
- Variable chunk sizes
- Requires format understanding

### Strategy 3: Hybrid Approach

**Pattern**: Logical boundaries with max size limit

```javascript
// Pseudocode
chunks = [];
currentChunk = [];
maxSize = 100 * 1024 * 1024; // 100 MB

for (item in dataset) {
  if (currentChunk.size + item.size > maxSize) {
    chunks.push(currentChunk);
    currentChunk = [item];
  } else {
    currentChunk.push(item);
  }
}
```

**Best of both worlds**: Semantic meaning + predictable sizes

**💬 Discussion**: For a dataset of 10,000 images (varying sizes), which strategy fits best?

---

## Index Management

### Why Indexes Matter

**Without index**:
- How do you know chunk order?
- How do you verify completeness?
- How do you find specific data?

**With index**:
- Maps chunks to blob IDs
- Stores metadata (size, hash, order)
- Enables verification and reassembly

### Index Structure

**Simple index** (JSON):
```json
{
  "dataset_name": "ml-model-v1.2",
  "total_size": 5368709120,
  "chunk_size": 104857600,
  "chunks": [
    {
      "index": 0,
      "blob_id": "057MX9P...",
      "size": 104857600,
      "sha256": "a3f2b1..."
    },
    {
      "index": 1,
      "blob_id": "1aF3kL...",
      "size": 104857600,
      "sha256": "9c4d8e..."
    }
  ]
}
```

**Store index on**:
- **Walrus**: Decentralized, but requires aggregator to read
- **Sui**: Queryable on-chain, structured data
- **Both**: Redundancy and different access patterns

### ✅ Checkpoint: Index Design

Design an index for a dataset with:
- 100 chunks
- Logical grouping (by category)
- Different epoch requirements per chunk

What fields would your index include?

**Instructor**: Review 2-3 student designs on whiteboard.

---

## Parallel Upload Pattern

### Sequential vs Parallel

**Sequential**:
```bash
# Slow: one at a time
for chunk in chunks/*; do
  walrus store "$chunk" --epochs 26
done
```

**Time**: 50 chunks × 10 seconds = ~8 minutes

**Parallel** (using GNU parallel or similar):
```bash
# Fast: 8 concurrent uploads
ls chunks/* | parallel -j 8 'walrus store {} --epochs 26'
```

**Time**: 50 chunks ÷ 8 workers × 10 seconds = ~63 seconds

**Speedup**: ~7.6x faster

### Upload Script with Index Creation

```bash
#!/bin/bash

# Split large file
split -b 100M dataset.bin chunks/chunk_

# Parallel upload with index creation
INDEX_FILE="index.json"
echo '{"chunks":[' > $INDEX_FILE

first=true
for chunk in chunks/*; do
  # Upload chunk
  BLOB_ID=$(walrus store "$chunk" --epochs 26 | grep "Blob ID" | awk '{print $3}')

  # Add to index
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> $INDEX_FILE
  fi

  echo "{\"name\":\"$chunk\",\"blob_id\":\"$BLOB_ID\"}" >> $INDEX_FILE
done

echo ']}' >> $INDEX_FILE

# Upload index to Walrus
walrus store $INDEX_FILE --epochs 26
```

**💬 Pair Activity**: Modify script to calculate SHA256 hashes for verification.

---

## Parallel Download Pattern

### Download and Reassemble

```bash
#!/bin/bash

# Fetch index
AGGREGATOR="https://aggregator.walrus.space"
INDEX_BLOB_ID="abc123..."

curl "$AGGREGATOR/v1/$INDEX_BLOB_ID" > index.json

# Parse index and download chunks in parallel
jq -r '.chunks[] | "\(.blob_id) \(.name)"' index.json | \
  parallel -j 8 --colsep ' ' \
    "curl $AGGREGATOR/v1/{1} > {2}"

# Reassemble
cat chunks/* > dataset-restored.bin

# Verify
sha256sum dataset-restored.bin
```

### Error Handling

```bash
# Download with retries
download_chunk() {
  blob_id=$1
  output=$2
  retries=3

  for i in $(seq 1 $retries); do
    if curl -f "$AGGREGATOR/v1/$blob_id" > "$output"; then
      return 0
    fi
    echo "Retry $i for $blob_id"
    sleep 2
  done

  echo "Failed to download $blob_id" >&2
  return 1
}

export -f download_chunk
parallel -j 8 download_chunk {blob_id} {output} :::: chunk_list.txt
```

### ✅ Checkpoint: Test Recovery

**Try It Yourself** (10 min):
1. Create a test file
2. Split into chunks
3. Upload chunks in parallel
4. Simulate one chunk failure
5. Retry only the failed chunk

**💬 Group Discussion**: Share your retry strategies.

---

## Use Case: Machine Learning Models

### ML Model Characteristics

**Typical PyTorch model**:
- Weights file: 2-20 GB
- Multiple checkpoints during training
- Frequent iterations

### Storage Pattern

**Option 1**: Store each checkpoint fully
- Simple
- Expensive (duplicate weights)
- No deduplication

**Option 2**: Store deltas between checkpoints
- Complex
- More cost-effective
- Requires custom logic

**Option 3**: Split model by layers
- Layer 1-10 → Chunk 1
- Layer 11-20 → Chunk 2
- ...

**Benefits**:
- Reuse unchanged layer chunks
- Selective loading for inference
- Partial model updates

### Example: Vision Transformer Model

**Model structure**:
```
vit-large-patch16-384/
├── embeddings.bin (500 MB)
├── encoder-blocks-1-6.bin (3 GB)
├── encoder-blocks-7-12.bin (3 GB)
└── head.bin (200 MB)
```

**Storage**:
```bash
# Upload each component
walrus store embeddings.bin --epochs 52  # Keep 2 years
walrus store encoder-blocks-1-6.bin --epochs 52
walrus store encoder-blocks-7-12.bin --epochs 52
walrus store head.bin --epochs 26  # Update more frequently
```

**Cost calculation**:
- Embeddings: ~2.5 GB encoded = 3 units × 500 × 52 = 78,000 WAL
- Encoder 1-6: ~15 GB encoded = 15 units × 500 × 52 = 390,000 WAL
- Encoder 7-12: ~15 GB encoded = 15 units × 500 × 52 = 390,000 WAL
- Head: ~1 GB encoded = 1 unit × 500 × 26 = 13,000 WAL
- **Total**: ~871,000 WAL for 2 years

**💬 Discussion**: How would you version this model? New blob IDs or extend epochs?

---

## Use Case: Scientific Datasets

### Genomic Data Example

**Dataset**: Human genome variants (100 GB)

**Structure**:
```
variants/
├── chr1.vcf.gz (8 GB)
├── chr2.vcf.gz (7 GB)
...
├── chrX.vcf.gz (3 GB)
└── chrY.vcf.gz (2 GB)
```

**Access pattern**: Researchers query specific chromosomes

### Storage Strategy

**Split by chromosome**:
- Natural logical boundary
- Independent access
- Different usage patterns

```bash
# Upload each chromosome
for chr in variants/chr*.vcf.gz; do
  BLOB_ID=$(walrus store "$chr" --epochs 52 | grep "Blob ID" | awk '{print $3}')
  echo "$chr,$BLOB_ID" >> genome-index.csv
done

# Upload index
walrus store genome-index.csv --epochs 52
```

**Index on Sui**:
```move
public struct GenomeDataset has key {
    id: UID,
    chromosomes: vector<ChromosomeData>,
}

public struct ChromosomeData has store {
    name: String,       // "chr1"
    blob_id: vector<u8>,
    size: u64,
}
```

**Query pattern**:
```bash
# Researcher wants chromosome 7
BLOB_ID=$(sui client object <dataset-id> | jq -r '.chromosomes[6].blob_id')
curl https://aggregator.walrus.space/v1/$BLOB_ID > chr7.vcf.gz
```

### ✅ Checkpoint: Design Scientific Storage

For a climate dataset with:
- Daily measurements (365 files/year)
- 10 years of data
- Researchers query by date range

Design:
1. Chunking strategy
2. Index structure
3. Query workflow

**Instructor**: Walk through one design as a class.

---

## Use Case: Media Libraries

### Photo Library Example

**Dataset**: 50,000 photos (500 GB total)

**Requirements**:
- Browse by date/album
- Thumbnails load quickly
- Full resolution on demand

### Storage Pattern

**Separate thumbnails from full images**:

```bash
# Upload thumbnails as quilt (small files)
walrus store-quilt --paths thumbnails/*.jpg --epochs 26

# Upload full images in batches
for batch in full-res-batches/*; do
  walrus store "$batch" --epochs 52
done
```

**Index structure**:
```json
{
  "albums": [
    {
      "name": "Vacation 2024",
      "thumbnail_quilt_id": "057MX...",
      "photos": [
        {
          "id": "photo-001",
          "thumbnail_index": 0,
          "full_res_blob_id": "1aF3kL..."
        }
      ]
    }
  ]
}
```

**Access workflow**:
1. Load album index from Sui
2. Fetch thumbnail quilt → display grid
3. User clicks photo → fetch full res blob

**Cost savings**:
- Thumbnails: 50K × 10 KB = 500 MB → Use quilt → ~7 storage units
- Full images: 500 GB → 500 individual blobs → ~2500 storage units
- **Quilt saves** ~413x for thumbnails vs individual blobs

---

## Recovery Patterns

### Verification After Upload

```bash
#!/bin/bash

upload_and_verify() {
  chunk=$1
  expected_hash=$(sha256sum "$chunk" | awk '{print $1}')

  # Upload
  BLOB_ID=$(walrus store "$chunk" --epochs 26 | grep "Blob ID" | awk '{print $3}')

  # Download and verify
  curl "https://aggregator.walrus.space/v1/$BLOB_ID" > "$chunk.downloaded"
  actual_hash=$(sha256sum "$chunk.downloaded" | awk '{print $1}')

  if [ "$expected_hash" = "$actual_hash" ]; then
    echo "$chunk verified: $BLOB_ID"
    rm "$chunk.downloaded"
    echo "$BLOB_ID" >> verified-chunks.txt
  else
    echo "$chunk FAILED verification!" >&2
    exit 1
  fi
}

export -f upload_and_verify
parallel -j 4 upload_and_verify ::: chunks/*
```

### Partial Failure Recovery

**Scenario**: 48 of 50 chunks uploaded successfully

```bash
# Check which chunks are missing
for i in $(seq 0 49); do
  if ! grep -q "chunk_$i" index.json; then
    echo "Missing: chunk_$i"
    walrus store "chunks/chunk_$i" --epochs 26 >> recovery.log
  fi
done
```

### ✅ Checkpoint: Test Failure Recovery

**Group Exercise** (15 min):
1. Split a file into 10 chunks
2. Upload 8 successfully
3. Simulate 2 failures (skip uploads)
4. Write script to detect and re-upload missing chunks

**Instructor**: Have groups share their detection logic.

---

## Best Practices

### 1. Choose Appropriate Chunk Size

**Guidelines**:
- **Small datasets (<1 GB)**: Consider single blob
- **Medium (1-10 GB)**: 100-500 MB chunks
- **Large (10-100 GB)**: 500 MB - 2 GB chunks
- **Very large (>100 GB)**: 1-5 GB chunks

**Why**: Balance parallelization vs overhead

### 2. Store Index Redundantly

```bash
# Store on Walrus
walrus store index.json --epochs 52

# Also store on Sui
sui client call --function store_index \
  --args <index-data>

# Keep local backup
cp index.json backups/index-$(date +%Y%m%d).json
```

### 3. Include Metadata in Index

**Comprehensive index**:
```json
{
  "dataset": "genome-v2",
  "created": "2024-01-15T10:30:00Z",
  "total_size": 107374182400,
  "chunk_count": 100,
  "chunk_size": 1073741824,
  "hash_algorithm": "sha256",
  "total_hash": "3f9a8b...",
  "chunks": [...]
}
```

### 4. Plan Epochs by Usage

```javascript
// Different epochs for different parts
{
  "active_data": {
    "epochs": 4,    // 2 months
    "chunks": [...]
  },
  "archive_data": {
    "epochs": 104,  // 4 years
    "chunks": [...]
  }
}
```

### 5. Parallelize Wisely

**Don't overload**:
```bash
# Bad: 1000 concurrent uploads
parallel -j 1000 walrus store {} ::: chunks/*

# Good: Reasonable concurrency
parallel -j 8 walrus store {} ::: chunks/*
```

**Consider**: Network bandwidth, storage node capacity, publisher limits

---

## Try It Yourself: Multi-Part Upload

**Exercise** (20 min):

1. Create a test file:
   ```bash
   dd if=/dev/urandom of=testfile.bin bs=1M count=500
   ```

2. Split into chunks:
   ```bash
   split -b 100M testfile.bin chunks/chunk_
   ```

3. Upload chunks in parallel (record blob IDs)

4. Create index JSON

5. Download and reassemble

6. Verify with checksum:
   ```bash
   sha256sum testfile.bin
   sha256sum testfile-restored.bin
   ```

### ✅ Checkpoint: Share Results

**Report to class**:
- How many chunks created?
- Upload time (sequential vs parallel)?
- Any chunks fail?
- Checksums match?

**Instructor**: Discuss performance differences observed.

---

## Limitations and Considerations

### Current Limitations

**Storage size**:
- Individual blob max: ~10 GB practical limit
- Total dataset: No limit, but costs scale linearly

**Performance**:
- Upload/download bandwidth varies
- Aggregator may have rate limits
- Network latency affects small chunks more

**Cost**:
- Each chunk incurs storage costs
- More chunks = more index complexity
- Balance granularity vs overhead

### When to Use Multi-Part

**Good fit**:
- ✅ Large datasets (>1 GB)
- ✅ Parallel upload/download beneficial
- ✅ Partial access needed
- ✅ Incremental updates expected

**Poor fit**:
- ❌ Small files (<100 MB)
- ❌ Always accessed as whole
- ❌ No update pattern
- ❌ Excessive chunking overhead

**💬 Discussion**: At what dataset size does chunking become essential?

---

## Key Takeaways

- Split large datasets into chunks for parallelization and fault tolerance
- Choose chunk size based on dataset size and access patterns
- Logical boundaries better than arbitrary splits when possible
- Always create and maintain an index (on Walrus, Sui, or both)
- Parallel upload/download significantly faster than sequential
- Verify chunks after upload with checksums
- Plan epochs per chunk based on usage patterns
- Use quilts for small metadata/thumbnails, individual blobs for large chunks
- Include recovery logic for failed uploads
- Balance chunk granularity vs management overhead

**Next**: [Proof of Concept Patterns](./04-proof-of-concepts.md) - Lessons from production systems
