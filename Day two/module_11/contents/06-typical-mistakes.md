# Typical Mistakes

This section covers common pitfalls when working with quilts and how to avoid them.

## Mistake 1: Duplicate Identifiers

### The Problem

```sh
walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"./file1.txt","identifier":"config.json"}' \
          '{"path":"./file2.txt","identifier":"config.json"}'

# Error: Duplicate identifier 'config.json' in quilt
```

**Why it happens**:
- Two or more files given the same identifier
- Using `--paths` on directories with duplicate filenames in different subdirectories

### Example with `--paths`

```
project/
├── api/
│   └── config.json      ← Identifier: "config.json"
└── web/
    └── config.json      ← Identifier: "config.json" (DUPLICATE!)
```

```sh
walrus --context testnet store-quilt --epochs 10 --paths ./project/

# Error: Duplicate identifier 'config.json'
```

### How to Avoid

**Solution 1**: Use unique identifiers with `--blobs`

```sh
walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"./project/api/config.json","identifier":"api-config"}' \
          '{"path":"./project/web/config.json","identifier":"web-config"}'
```

**Solution 2**: Include path in identifier

```typescript
// Automatically generate unique identifiers with paths
const files = await collectFiles('./project/');
const walrusFiles = files.map(({ path, contents }) => 
  WalrusFile.from({
    contents,
    identifier: path.replace(/\//g, '-'), // project-api-config.json
    tags: { originalPath: path },
  })
);
```

**Solution 3**: Validate before creating

```typescript
function validateUniqueIdentifiers(files: WalrusFile[]): void {
  const seen = new Set<string>();
  
  for (const file of files) {
    if (seen.has(file.identifier)) {
      throw new Error(`Duplicate identifier: ${file.identifier}`);
    }
    seen.add(file.identifier);
  }
}

// Use before creating quilt
validateUniqueIdentifiers(files);
```

**CLI Script to Check**:

```bash
# Check for duplicate filenames before uploading
find ./project -type f -exec basename {} \; | sort | uniq -d

# If output is empty, no duplicates exist
```

## Mistake 2: Using BlobId Instead of QuiltPatchId

### The Problem

```sh
# User tries to read a patch using the regular BlobId
walrus --context testnet read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik --out file.txt

# This downloads the ENTIRE quilt, not the individual patch!
```

**Why it happens**:
- Confusion between BlobId (for the whole quilt) and QuiltPatchId (for individual patches)
- Not understanding that quilts have a different retrieval method

### Visual Explanation

```
Regular Blob:
  walrus read <BlobId> → Downloads the blob ✓

Quilt:
  walrus read <QuiltBlobId> → Downloads entire quilt ✓
  walrus read-quilt --quilt-id <QuiltBlobId> --identifiers <name> → Downloads specific patch ✓
  
WRONG:
  walrus read <QuiltPatchId> → ERROR! ✗
```

### How to Avoid

**Solution 1**: Use `read-quilt` for patches

```sh
# Correct way to read a specific patch
walrus --context testnet read-quilt --out ./output/ \
  --quilt-id 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik \
  --identifiers my-file.pdf
```

**Solution 2**: Use QuiltPatchId with `read-quilt`

```sh
# First, list patches to get QuiltPatchIds
walrus --context testnet list-patches-in-quilt 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik

# Then use the QuiltPatchId
walrus --context testnet read-quilt --out ./output/ \
  --quilt-patch-ids 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ikBAAACAAA
```

**In Code**: Always use the correct API

```typescript
// WRONG: Regular blob read
const blob = await client.walrus.getBlob(quiltPatchId); // ERROR!

// CORRECT: Quilt patch read
const blob = await client.walrus.getBlob({ blobId: quiltId });
const files = await blob.files({
  identifiers: ['my-file.pdf'],
});
```

## Mistake 3: Trying to Delete Individual Patches

### The Problem

```sh
# User tries to delete a specific file from a quilt
walrus --context testnet delete --blob-id <QuiltPatchId>

# Error: Operation not supported on quilt patches
```

**Why it happens**:
- Not understanding that quilts only support quilt-level operations
- Expecting same operations as regular blobs

### What You Can't Do

```
❌ Delete a single patch
❌ Extend a single patch
❌ Share a single patch
❌ Modify a single patch
```

### What You CAN Do

```
✓ Delete the entire quilt
✓ Extend the entire quilt
✓ Share the entire quilt
✓ Create a new quilt with updated contents
```

### How to Avoid

**Solution 1**: Design quilts for static collections

Only use quilts for collections that won't need individual file modifications:

- ✅ NFT collections (immutable)
- ✅ Published documentation versions (immutable)
- ✅ Batch processing results (immutable)
- ❌ User editable documents (need individual updates)

**Solution 2**: Create a new quilt when updates are needed

```typescript
// To "update" a quilt, create a new one
async function updateQuilt(
  oldQuiltId: string,
  filesToAdd: WalrusFile[],
  filesToRemove: string[]
) {
  // 1. Download existing patches
  const blob = await client.walrus.getBlob({ blobId: oldQuiltId });
  const existingFiles = await blob.files();
  
  // 2. Filter out files to remove
  const keptFiles = existingFiles.filter(
    async (f) => !filesToRemove.includes(await f.getIdentifier())
  );
  
  // 3. Combine with new files
  const allFiles = [...keptFiles, ...filesToAdd];
  
  // 4. Create new quilt
  const newQuilt = await client.walrus.writeFiles({
    files: allFiles,
    deletable: true,
    epochs: 30,
    signer: keypair,
  });
  
  // 5. Delete old quilt (optional)
  await client.walrus.deleteBlob(oldQuiltId);
  
  return newQuilt[0].blobId;
}
```

**Solution 3**: Use regular blobs for dynamic collections

If you need individual file operations, don't use quilts:

```typescript
// For dynamic collections, store separately
for (const file of userFiles) {
  const blobId = await client.walrus.writeBlob({
    contents: file.contents,
    deletable: true,
    epochs: 30,
    signer: keypair,
  });
  
  // Store mapping in your application database
  await db.saveFileMapping(userId, file.name, blobId);
}

// Now you can delete individual files
await client.walrus.deleteBlob(specificBlobId);
```

## Mistake 4: Exceeding Metadata Size Limits

### The Problem

```sh
walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"file.txt","identifier":"file","tags":{"data":"'$(cat huge-data.txt)'"}}'

# Error: Total tags size exceeds 64 KB limit
```

**Why it happens**:
- Storing large data in tags
- Not understanding size constraints
- Accumulating too many tags across all patches

### Size Limits

```
Identifier: 64 KB maximum per identifier
Tags: 64 KB maximum for ALL tags in the quilt combined
```

### How to Avoid

**Solution 1**: Keep tags small and semantic

```json
// BAD: Large data in tags
{
  "identifier": "document.pdf",
  "tags": {
    "content": "<entire document text...>",  // ✗ Too large
    "metadata": "{...huge JSON...}"           // ✗ Too large
  }
}

// GOOD: Concise semantic tags
{
  "identifier": "document.pdf",
  "tags": {
    "author": "Alice",                        // ✓ Small
    "category": "technical",                  // ✓ Small
    "year": "2024",                           // ✓ Small
    "status": "published"                     // ✓ Small
  }
}
```

**Solution 2**: Store large metadata as separate patches

```typescript
// Store metadata as a separate patch
const files = [
  // The actual document
  WalrusFile.from({
    contents: documentData,
    identifier: 'document.pdf',
    tags: { type: 'document' },
  }),
  
  // Metadata as a separate file
  WalrusFile.from({
    contents: new TextEncoder().encode(JSON.stringify(largeMetadata)),
    identifier: 'document.pdf.metadata',
    tags: { type: 'metadata', for: 'document.pdf' },
  }),
];
```

**Solution 3**: Validate size before uploading

```typescript
function validateMetadataSize(files: WalrusFile[]): void {
  const MAX_IDENTIFIER_SIZE = 64 * 1024; // 64 KB
  const MAX_TOTAL_TAGS_SIZE = 64 * 1024; // 64 KB
  
  let totalTagsSize = 0;
  
  for (const file of files) {
    // Check identifier size
    const idSize = new TextEncoder().encode(file.identifier).length;
    if (idSize > MAX_IDENTIFIER_SIZE) {
      throw new Error(`Identifier too large: ${file.identifier} (${idSize} bytes)`);
    }
    
    // Check tags size
    const tagsStr = JSON.stringify(file.tags);
    const tagsSize = new TextEncoder().encode(tagsStr).length;
    totalTagsSize += tagsSize;
  }
  
  if (totalTagsSize > MAX_TOTAL_TAGS_SIZE) {
    throw new Error(`Total tags size exceeds limit: ${totalTagsSize} bytes`);
  }
}
```

## Mistake 5: Expecting Content-Based QuiltPatchIds

### The Problem

```typescript
// User expects same QuiltPatchId for same content
const quilt1 = await storeQuilt([fileA, fileB, fileC]);
const quilt2 = await storeQuilt([fileA, fileX, fileY]); // fileA reused

// WRONG ASSUMPTION:
// fileA has same QuiltPatchId in both quilts ✗

// REALITY:
// fileA has DIFFERENT QuiltPatchIds in each quilt ✓
```

**Why it happens**:
- Expecting QuiltPatchId to work like regular BlobId (content-addressed)
- Not understanding that QuiltPatchId depends on the entire quilt

### Visual Explanation

```
Regular Blob:
  Content: "Hello World"
  BlobId: ABC123...
  
  Same content ALWAYS has same BlobId ✓

Quilt Patch:
  Content: "Hello World" in Quilt A
  QuiltPatchId: ABC123...XYZ111
  
  Content: "Hello World" in Quilt B
  QuiltPatchId: DEF456...UVW222
  
  Same content has DIFFERENT QuiltPatchIds ✓
```

### How to Avoid

**Solution 1**: Don't rely on QuiltPatchId for deduplication

```typescript
// WRONG: Trying to deduplicate by QuiltPatchId
const seenPatches = new Set<QuiltPatchId>();

if (seenPatches.has(patchId)) {
  // This won't work across quilts!
}

// RIGHT: Deduplicate by content hash (BlobId) before creating quilt
const contentHashes = new Map<BlobId, FileContent>();

for (const file of files) {
  const blobId = computeBlobId(file.contents);
  if (!contentHashes.has(blobId)) {
    contentHashes.set(blobId, file);
  }
}

// Use unique content for quilt
const uniqueFiles = Array.from(contentHashes.values());
```

**Solution 2**: Use identifiers for lookup, not QuiltPatchIds

```typescript
// GOOD: Use identifiers for stable references
const myFile = await getFileByIdentifier(quiltId, 'config.json');

// AVOID: Storing QuiltPatchIds for later use
// (they're only valid for this specific quilt)
```

**Solution 3**: Store metadata externally if needed

```typescript
// Store mapping in application database
interface FileMapping {
  identifier: string;
  quiltId: string;
  contentHash: string; // For deduplication
  createdAt: Date;
}

// This way you can track files across quilts
```

## Mistake 6: Using `--paths` and `--blobs` Together

### The Problem

```sh
walrus --context testnet store-quilt --epochs 10 \
  --paths ./directory/ \
  --blobs '{"path":"./file.txt","identifier":"myfile"}'

# Error: Cannot use both --paths and --blobs options
```

**Why it happens**:
- Trying to combine convenience of `--paths` with flexibility of `--blobs`
- Not understanding that these are mutually exclusive

### How to Avoid

**Solution 1**: Choose one method

```sh
# Option A: Use only --paths (simpler, auto-identifiers)
walrus --context testnet store-quilt --epochs 10 --paths ./directory/

# Option B: Use only --blobs (more control)
walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"./file1.txt","identifier":"file1"}' \
          '{"path":"./file2.txt","identifier":"file2"}'
```

**Solution 2**: Convert `--paths` to `--blobs` with script

```bash
#!/bin/bash
# Convert directory to --blobs format

DIR="$1"
BLOBS_ARGS=""

for file in $(find "$DIR" -type f); do
  filename=$(basename "$file")
  identifier="${filename%.*}" # Remove extension
  
  BLOBS_ARGS+=" '{\"path\":\"$file\",\"identifier\":\"$identifier\"}'"
done

# Now use with --blobs
eval walrus --context testnet store-quilt --epochs 10 --blobs $BLOBS_ARGS
```

## Mistake 7: Forgetting to Handle Asynchronous Operations

### The Problem (TypeScript)

```typescript
// WRONG: Not awaiting async operations
const files = getAllFiles().map(f => 
  WalrusFile.from({
    contents: fs.readFileSync(f), // Synchronous, may block
    identifier: f,
  })
);

const quilt = client.walrus.writeFiles({ files }); // Missing await!
console.log(quilt); // Prints Promise instead of result
```

### How to Avoid

**Solution**: Always await async operations

```typescript
// CORRECT: Proper async handling
const fileContents = await Promise.all(
  getAllFiles().map(async (f) => ({
    path: f,
    contents: await fs.promises.readFile(f),
  }))
);

const files = fileContents.map(({ path, contents }) =>
  WalrusFile.from({
    contents: new Uint8Array(contents),
    identifier: path,
  })
);

const quilt = await client.walrus.writeFiles({
  files,
  deletable: true,
  epochs: 10,
  signer: keypair,
  });

console.log('Quilt created:', quilt[0].blobId);
```

## Mistake 8: Not Validating Identifier Format

### The Problem

```sh
walrus --context testnet store-quilt --epochs 10 \
  --blobs '{"path":"./file.txt","identifier":" invalid-identifier"}'

# Error: Identifier ' invalid-identifier' contains leading whitespace
```

**Invalid identifier formats**:
- ❌ Leading/trailing whitespace: `" file"`, `"file "`
- ❌ Starting with non-alphanumeric: `"-file"`, `"_file"`
- ❌ Too large: `"a".repeat(70000)` (> 64 KB)

### How to Avoid

**Solution**: Validate and sanitize identifiers

```typescript
function sanitizeIdentifier(id: string): string {
  // Remove leading/trailing whitespace
  id = id.trim();
  
  // Ensure it starts with alphanumeric
  if (!/^[a-zA-Z0-9]/.test(id)) {
    id = 'file-' + id;
  }
  
  // Check size
  const size = new TextEncoder().encode(id).length;
  if (size > 64 * 1024) {
    throw new Error(`Identifier too large: ${size} bytes`);
  }
  
  return id;
}

// Use before creating quilt
const files = rawFiles.map(f => 
  WalrusFile.from({
    contents: f.contents,
    identifier: sanitizeIdentifier(f.name),
    tags: f.tags,
  })
);
```

## Mistake 9: Not Handling Insufficient Funds

### The Problem

```sh
walrus --context testnet store-quilt --epochs 50 --paths ./large-collection/

# Error: Insufficient funds for transaction
# Required: 0.5 SUI + 2.5 WAL
# Available: 0.1 SUI + 0.5 WAL
```

**Why it happens**:
- Not estimating costs before upload
- Running out of tokens mid-operation

### How to Avoid

**Solution 1**: Use dry-run to estimate costs

```sh
# Check cost before actual upload
walrus --context testnet store-quilt --dry-run --epochs 50 --paths ./large-collection/

# Output:
# Estimated cost: 2.5 WAL
# Estimated gas: 0.5 SUI
# Total files: 500
```

**Solution 2**: Check balance first

```typescript
async function ensureSufficientFunds(
  client: SuiClient,
  address: string,
  requiredSui: number,
  requiredWal: number
) {
  const suiBalance = await client.getBalance({ owner: address, coinType: '0x2::sui::SUI' });
  const walBalance = await client.getBalance({ owner: address, coinType: WAL_COIN_TYPE });
  
  if (BigInt(suiBalance.totalBalance) < BigInt(requiredSui)) {
    throw new Error(`Insufficient SUI: need ${requiredSui}, have ${suiBalance.totalBalance}`);
  }
  
  if (BigInt(walBalance.totalBalance) < BigInt(requiredWal)) {
    throw new Error(`Insufficient WAL: need ${requiredWal}, have ${walBalance.totalBalance}`);
  }
}

// Use before expensive operations
await ensureSufficientFunds(client, address, estimatedSuiCost, estimatedWalCost);
```

## Mistake 10: Not Planning for Quilt Limits

### The Problem

```sh
# Trying to store 1000 files in one quilt
walrus --context testnet store-quilt --epochs 10 --paths ./1000-files/

# Error: QuiltV1 supports maximum 666 blobs, attempted 1000
```

**QuiltV1 Limits**:
- Maximum patches: 666
- Maximum identifier size: 64 KB each
- Maximum tags size: 64 KB total

### How to Avoid

**Solution**: Split large collections

```bash
#!/bin/bash
# Split large collection into multiple quilts

MAX_FILES_PER_QUILT=600
FILES_DIR="$1"

# Count total files
total_files=$(find "$FILES_DIR" -type f | wc -l)
num_quilts=$(( (total_files + MAX_FILES_PER_QUILT - 1) / MAX_FILES_PER_QUILT ))

echo "Splitting $total_files files into $num_quilts quilts"

# Create quilts
batch=0
find "$FILES_DIR" -type f | while IFS= read -r file; do
  quilt_num=$(( batch / MAX_FILES_PER_QUILT ))
  
  # Store in batches
  # (Implementation details omitted for brevity)
  
  batch=$((batch + 1))
done
```

## Prevention Checklist

Before creating a quilt, verify:

- [ ] All identifiers are unique
- [ ] Identifiers start with alphanumeric characters
- [ ] No identifier exceeds 64 KB
- [ ] Total tags size < 64 KB
- [ ] Number of patches ≤ 666 (QuiltV1)
- [ ] Sufficient SUI and WAL tokens
- [ ] Collection is relatively static (no individual edits needed)
- [ ] Using correct retrieval method (`read-quilt`, not `read`)
- [ ] Not mixing `--paths` and `--blobs`

## Key Takeaways

- **Uniqueness matters**: Identifiers must be unique within a quilt; deduplication is manual
- **Context-dependent IDs**: QuiltPatchIds change if the quilt changes, unlike regular BlobIds
- **Metadata limits**: Keep individual identifiers and total tags under 64KB
- **Async handling**: Always await operations in SDKs to prevent silent failures
- **Validation**: Validate inputs (uniqueness, size, format) before attempting creation

## Next Steps

Now that you know what to avoid, proceed to [Hands-On Lab 4](./07-hands-on.md) to practice creating and retrieving quilts with proper techniques.



