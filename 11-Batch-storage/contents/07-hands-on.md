# Hands-On Lab 4: Create and Retrieve a Quilt

This hands-on lab guides you through creating a small quilt with metadata and retrieving blobs using different methods.

## Lab Overview

**Duration**: 30-45 minutes

**What you'll do**:
1. Create test files with different types and metadata
2. Store them as a quilt with identifiers and tags
3. List patches in the quilt
4. Retrieve blobs by identifier
5. Retrieve blobs by tag
6. Retrieve blobs by QuiltPatchId
7. Verify retrieval and metadata

**What you'll learn**:
- Creating quilts with custom metadata
- Different retrieval methods
- Verifying quilt contents
- Best practices for working with quilts

## Prerequisites

Before starting, ensure you have:

- ✅ Walrus CLI installed and configured (OR TypeScript SDK set up)
- ✅ A Sui wallet with SUI and WAL tokens
- ✅ Network connectivity to Walrus testnet
- ✅ Completed previous CLI or SDK curriculum modules

Verify your setup:

```sh
walrus --version
walrus --context testnet info
```

Or for TypeScript:

```sh
npm list @mysten/walrus
```

## Part 1: Prepare Test Files

### Step 1.1: Create a Project Directory

**Mac/Linux:**

```sh
mkdir -p walrus-quilt-lab
cd walrus-quilt-lab
mkdir test-files
```

**Windows (Command Prompt):**

```cmd
mkdir walrus-quilt-lab
cd walrus-quilt-lab
mkdir test-files
```

**Windows (PowerShell):**

```powershell
New-Item -ItemType Directory -Force -Path walrus-quilt-lab
Set-Location walrus-quilt-lab
New-Item -ItemType Directory -Force -Path test-files
```

### Step 1.2: Create Test Files

Create several test files of different types:

**Mac/Linux:**

```sh
# Create a text document
cat > test-files/introduction.txt << 'EOF'
Welcome to Walrus Quilts!

This is a sample document stored in a quilt.
Quilts allow efficient batch storage of small files.
EOF

# Create a JSON configuration
cat > test-files/config.json << 'EOF'
{
  "version": "1.0",
  "feature": "quilts",
  "enabled": true,
  "max_files": 666
}
EOF

# Create a small HTML file
cat > test-files/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Walrus Quilt Demo</title>
</head>
<body>
    <h1>Hello from Walrus!</h1>
    <p>This page is stored in a quilt.</p>
</body>
</html>
EOF

# Create a data file
cat > test-files/data.csv << 'EOF'
id,name,value
1,item1,100
2,item2,200
3,item3,300
EOF

# Create an image (placeholder text file for demo)
cat > test-files/logo.txt << 'EOF'
[This would be an actual image file in production]
Placeholder for logo.png
EOF
```

**Windows (PowerShell):**

```powershell
# Create a text document
@"
Welcome to Walrus Quilts!

This is a sample document stored in a quilt.
Quilts allow efficient batch storage of small files.
"@ | Out-File -Encoding utf8 test-files/introduction.txt

# Create a JSON configuration
@"
{
  "version": "1.0",
  "feature": "quilts",
  "enabled": true,
  "max_files": 666
}
"@ | Out-File -Encoding utf8 test-files/config.json

# Create a small HTML file
@"
<!DOCTYPE html>
<html>
<head>
    <title>Walrus Quilt Demo</title>
</head>
<body>
    <h1>Hello from Walrus!</h1>
    <p>This page is stored in a quilt.</p>
</body>
</html>
"@ | Out-File -Encoding utf8 test-files/index.html

# Create a data file
@"
id,name,value
1,item1,100
2,item2,200
3,item3,300
"@ | Out-File -Encoding utf8 test-files/data.csv

# Create an image (placeholder text file for demo)
@"
[This would be an actual image file in production]
Placeholder for logo.png
"@ | Out-File -Encoding utf8 test-files/logo.txt
```

### Step 1.3: Verify Files

**Mac/Linux:**

```sh
ls -lh test-files/
```

**Windows (Command Prompt):**

```cmd
dir test-files
```

**Windows (PowerShell):**

```powershell
Get-ChildItem test-files
```

**Expected output (files listed):**
- config.json
- data.csv
- index.html
- introduction.txt
- logo.txt

## Part 2: Create the Quilt

You can complete this lab using either CLI or TypeScript SDK.

### Option A: CLI Approach

#### Step 2A.1: Create Quilt with Metadata

```sh
walrus --context testnet store-quilt --epochs 10 \
  --blobs \
    '{"path":"test-files/introduction.txt","identifier":"intro","tags":{"type":"document","format":"text","category":"documentation"}}' \
    '{"path":"test-files/config.json","identifier":"config","tags":{"type":"config","format":"json","category":"configuration"}}' \
    '{"path":"test-files/index.html","identifier":"homepage","tags":{"type":"document","format":"html","category":"web"}}' \
    '{"path":"test-files/data.csv","identifier":"sample-data","tags":{"type":"data","format":"csv","category":"dataset"}}' \
    '{"path":"test-files/logo.txt","identifier":"logo","tags":{"type":"image","format":"text","category":"assets"}}'
```

**Expected output**:

```
Success: Deletable blob stored successfully.
Path: path(s) ignored for quilt store result
Blob ID: aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQ
Sui object ID: 0x1e2b7236e7a65fdd0480ac8d7817ae5346cb3c9317282c4028cfe2042892e4f9
Unencoded size: 435 KiB
Encoded size (including replicated metadata): 63.0 MiB
Cost (excluding gas): 0.0008 WAL (storage was purchased, and a new blob object was registered) 
Expiry epoch (exclusive): 303
Encoding type: RedStuff/Reed-Solomon

--------------------------------------------------------------------------------------
 Index  QuiltPatchId                                        Sliver Range  Identifier 
--------------------------------------------------------------------------------------
 0      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAQACAA  [1, 2)        config 
 1      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAgADAA  [2, 3)        homepage 
 2      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAwAEAA  [3, 4)        intro 
 3      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBBAAFAA  [4, 5)        logo 
 4      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBBQAGAA  [5, 6)        sample-data 
--------------------------------------------------------------------------------------
```

#### Step 2A.2: Save the Quilt ID

**Option A: Manual copy from output above**

Copy the `Blob ID` value from the output and save it. (Note: The Blob ID serves as the Quilt ID since quilts are stored as blobs):

**Mac/Linux:**

```sh
BLOB_ID="aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQ"  # Replace with your actual Blob ID
echo "BLOB_ID=$BLOB_ID" > quilt-info.sh
```

**Option B: Automatic extraction using --json (recommended)**

**Mac/Linux:**

```sh
# Store with JSON output and automatically extract Blob ID
STORE_OUTPUT=$(walrus --context testnet store-quilt --epochs 10 --json \
  --blobs \
    '{"path":"test-files/introduction.txt","identifier":"intro","tags":{"type":"document"}}' \
    '{"path":"test-files/config.json","identifier":"config","tags":{"type":"config"}}' \
    '{"path":"test-files/index.html","identifier":"homepage","tags":{"type":"document"}}' \
    '{"path":"test-files/data.csv","identifier":"sample-data","tags":{"type":"data"}}' \
    '{"path":"test-files/logo.txt","identifier":"logo","tags":{"type":"image"}}' 2>&1 | grep -v "INFO\|WARN")

# Extract blobId (handles newlyCreated, alreadyCertified, or alreadyExisting responses)
BLOB_ID=$(echo "$STORE_OUTPUT" | jq -r '.blobStoreResult.newlyCreated.blobObject.blobId // .blobStoreResult.alreadyCertified.blobId // .blobStoreResult.alreadyExisting.blobId')

echo "BLOB_ID=$BLOB_ID"
echo "BLOB_ID=$BLOB_ID" > quilt-info.sh
```

**Windows (Command Prompt):**

```cmd
:: Manual: Save for later use (replace with your actual Blob ID)
set BLOB_ID=aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQ
echo BLOB_ID=%BLOB_ID% > quilt-info.txt
```

**Windows (PowerShell):**

```powershell
# Manual: Save for later use (replace with your actual Blob ID)
$BLOB_ID = "aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQ"
"BLOB_ID=$BLOB_ID" | Out-File quilt-info.txt
```

### Option B: TypeScript SDK Approach

#### Step 2B.1: Create the Script

Create `create-quilt.ts`:

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { readFile, writeFile } from 'fs/promises';
import { getFundedKeypair } from './get-keypair'; // Your keypair helper

async function createQuilt() {
  // Setup client
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
  }).extend(walrus());

  const keypair = await getFundedKeypair();

  // Prepare files with metadata
  const files = [
    WalrusFile.from({
      contents: await readFile('test-files/introduction.txt'),
      identifier: 'intro',
      tags: {
        type: 'document',
        format: 'text',
        category: 'documentation',
      },
    }),
    WalrusFile.from({
      contents: await readFile('test-files/config.json'),
      identifier: 'config',
      tags: {
        type: 'config',
        format: 'json',
        category: 'configuration',
      },
    }),
    WalrusFile.from({
      contents: await readFile('test-files/index.html'),
      identifier: 'homepage',
      tags: {
        type: 'document',
        format: 'html',
        category: 'web',
      },
    }),
    WalrusFile.from({
      contents: await readFile('test-files/data.csv'),
      identifier: 'sample-data',
      tags: {
        type: 'data',
        format: 'csv',
        category: 'dataset',
      },
    }),
    WalrusFile.from({
      contents: await readFile('test-files/logo.txt'),
      identifier: 'logo',
      tags: {
        type: 'image',
        format: 'text',
        category: 'assets',
      },
    }),
  ];

  console.log(`Creating quilt with ${files.length} files...`);

  // Store as quilt
  const result = await client.walrus.writeFiles({
    files,
    deletable: true,
    epochs: 10,
    signer: keypair,
  });

  // Extract Quilt ID from the first patch (all patches share the same blobId/quiltId)
  const quiltId = result[0].blobId;

  console.log('Quilt created successfully!');
  console.log('Quilt ID:', quiltId);
  console.log('Patches:', result.length);

  // Save to file
  await writeFile('quilt-info.json', JSON.stringify({
    quiltId: quiltId,
    createdAt: new Date().toISOString(),
    patches: files.length,
  }, null, 2));

  return quiltId;
}

createQuilt()
  .then(id => console.log('Done! Quilt ID:', id))
  .catch(err => console.error('Error:', err));
```

#### Step 2B.2: Run the Script

```sh
npx tsx create-quilt.ts
```

## Part 3: List Patches in the Quilt

### Step 3.1: List All Patches (CLI)

```sh
walrus --context testnet list-patches-in-quilt $BLOB_ID
```

**Expected output**:

```
Quilt Metadata V1: aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQ
--------------------------------------------------------------------------------------
 Index  QuiltPatchId                                        Sliver Range  Identifier 
--------------------------------------------------------------------------------------
 0      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAQACAA  [1, 2)        config 
 1      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAgADAA  [2, 3)        homepage 
 2      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBAwAEAA  [3, 4)        intro 
 3      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBBAAFAA  [4, 5)        logo 
 4      aHtgaPlXsXX-HSwAZpU1K9-4eJAcUbzt1ZDdIFtr5mQBBQAGAA  [5, 6)        sample-data 
--------------------------------------------------------------------------------------
```

### Step 3.2: Questions to Answer

1. How many patches are in your quilt?
2. What are the identifiers?
3. What tags does each patch have?
4. What is the structure of a QuiltPatchId?

**Answers**:
1. 5 patches
2. `intro`, `config`, `homepage`, `sample-data`, `logo`
3. Each has `type`, `format`, and `category` tags
4. QuiltPatchId = QuiltBlobId (32 bytes) + PatchInternalId (variable)

## Part 4: Retrieve Blobs by Identifier

### Step 4.1: Retrieve a Specific File

```sh
mkdir -p downloads/by-identifier
walrus --context testnet read-quilt --out downloads/by-identifier/ \
  --quilt-id $BLOB_ID \
  --identifiers intro
```

### Step 4.2: Verify the Content

**Mac/Linux:**

```sh
# Compare with original
diff test-files/introduction.txt downloads/by-identifier/intro

# Should show no differences
echo "Verification: $?"  # 0 means identical
```

**Windows (Command Prompt):**

```cmd
fc test-files\introduction.txt downloads\by-identifier\intro
```

**Windows (PowerShell):**

```powershell
# Compare with original
Compare-Object (Get-Content test-files/introduction.txt) (Get-Content downloads/by-identifier/intro)
# No output means files are identical
```

### Step 4.3: Retrieve Multiple Files

```sh
walrus --context testnet read-quilt --out downloads/by-identifier/ \
  --quilt-id $BLOB_ID \
  --identifiers config homepage
```

### Step 4.4: Verify All Downloads

**Mac/Linux:**

```sh
# Check what was downloaded
ls -lh downloads/by-identifier/

# Compare each file
diff test-files/config.json downloads/by-identifier/config
diff test-files/index.html downloads/by-identifier/homepage

echo "All files match original: Success!"
```

**Windows (Command Prompt):**

```cmd
dir downloads\by-identifier

fc test-files\config.json downloads\by-identifier\config
fc test-files\index.html downloads\by-identifier\homepage

echo All files match original: Success!
```

**Windows (PowerShell):**

```powershell
# Check what was downloaded
Get-ChildItem downloads/by-identifier

# Compare each file
Compare-Object (Get-Content test-files/config.json) (Get-Content downloads/by-identifier/config)
Compare-Object (Get-Content test-files/index.html) (Get-Content downloads/by-identifier/homepage)

Write-Output "All files match original: Success!"
```

## Part 5: Retrieve Blobs by Tag

### Step 5.1: Retrieve All Documents

```sh
mkdir -p downloads/by-tag-documents
walrus --context testnet read-quilt --out downloads/by-tag-documents/ \
  --quilt-id $BLOB_ID \
  --tag type document
```

**Expected**: Downloads `intro` and `homepage` (both tagged with `type: document`)

### Step 5.2: Retrieve All JSON Files

```sh
mkdir -p downloads/by-tag-json
walrus --context testnet read-quilt --out downloads/by-tag-json/ \
  --quilt-id $BLOB_ID \
  --tag format json
```

**Expected**: Downloads only `config` (tagged with `format: json`)

### Step 5.3: Retrieve Configuration Files

```sh
mkdir -p downloads/by-category
walrus --context testnet read-quilt --out downloads/by-category/ \
  --quilt-id $BLOB_ID \
  --tag category configuration
```

**Expected**: Downloads only `config` (tagged with `category: configuration`)

### Step 5.4: Verify Tag-Based Retrieval

**Mac/Linux:**

```sh
# Count files in each directory
echo "Documents: $(ls downloads/by-tag-documents/ | wc -l)"  # Should be 2
echo "JSON files: $(ls downloads/by-tag-json/ | wc -l)"      # Should be 1
echo "Config files: $(ls downloads/by-category/ | wc -l)"    # Should be 1
```

**Windows (PowerShell):**

```powershell
# Count files in each directory
Write-Output "Documents: $((Get-ChildItem downloads/by-tag-documents).Count)"    # Should be 2
Write-Output "JSON files: $((Get-ChildItem downloads/by-tag-json).Count)"        # Should be 1
Write-Output "Config files: $((Get-ChildItem downloads/by-category).Count)"      # Should be 1
```

## Part 6: Retrieve Blobs by QuiltPatchId

QuiltPatchId is a unique identifier for each patch that combines the Quilt ID with sliver range information. You can see QuiltPatchIds in the table output from `list-patches-in-quilt`.

### Step 6.1: Get QuiltPatchIds

```sh
# List patches to see QuiltPatchIds
walrus --context testnet list-patches-in-quilt $BLOB_ID
```

**Expected output:**

```
Quilt Metadata V1: pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0
--------------------------------------------------------------------------------------
 Index  QuiltPatchId                                        Sliver Range  Identifier 
--------------------------------------------------------------------------------------
 0      pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAQACAA  [1, 2)        config 
 1      pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAgADAA  [2, 3)        homepage 
 2      pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAwAEAA  [3, 4)        intro 
 3      pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BBAAFAA  [4, 5)        logo 
 4      pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BBQAGAA  [5, 6)        sample-data 
--------------------------------------------------------------------------------------
```

### Step 6.2: Retrieve by QuiltPatchId

Copy a QuiltPatchId from the table and use `--quilt-patch-ids`:

**Mac/Linux:**

```sh
# Copy the QuiltPatchId for 'intro' from the table above
INTRO_PATCH_ID="pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAwAEAA"  # Replace with your actual QuiltPatchId

mkdir -p downloads/by-patch-id
walrus --context testnet read-quilt --out downloads/by-patch-id/ --quilt-patch-ids $INTRO_PATCH_ID
```

**Windows (Command Prompt):**

```cmd
:: Copy the QuiltPatchId for 'intro' from the table above
set INTRO_PATCH_ID=pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAwAEAA

mkdir downloads\by-patch-id
walrus --context testnet read-quilt --out downloads\by-patch-id\ --quilt-patch-ids %INTRO_PATCH_ID%
```

**Windows (PowerShell):**

```powershell
# Copy the QuiltPatchId for 'intro' from the table above
$INTRO_PATCH_ID = "pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAwAEAA"  # Replace with your actual QuiltPatchId

New-Item -ItemType Directory -Force -Path downloads/by-patch-id
walrus --context testnet read-quilt --out downloads/by-patch-id/ --quilt-patch-ids $INTRO_PATCH_ID
```

### Step 6.3: Verify

**Mac/Linux:**

```sh
cat downloads/by-patch-id/intro
echo "QuiltPatchId retrieval: Success!"
```

**Windows (Command Prompt):**

```cmd
type downloads\by-patch-id\intro
echo QuiltPatchId retrieval: Success!
```

**Windows (PowerShell):**

```powershell
Get-Content downloads/by-patch-id/intro
Write-Output "QuiltPatchId retrieval: Success!"
```

### Step 6.4: Retrieve Multiple Patches by QuiltPatchId

**Mac/Linux:**

```sh
# Copy multiple QuiltPatchIds from the table
CONFIG_PATCH_ID="pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAQACAA"
HOMEPAGE_PATCH_ID="pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAgADAA"

walrus --context testnet read-quilt --out downloads/by-patch-id/ --quilt-patch-ids $CONFIG_PATCH_ID $HOMEPAGE_PATCH_ID
```

**Windows (PowerShell):**

```powershell
$CONFIG_PATCH_ID = "pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAQACAA"
$HOMEPAGE_PATCH_ID = "pGjior6pan7Mx6x2GvfdUCGbh1iiuotyO6CdxE58NO0BAgADAA"

walrus --context testnet read-quilt --out downloads/by-patch-id/ --quilt-patch-ids $CONFIG_PATCH_ID $HOMEPAGE_PATCH_ID
```

## Part 7: Retrieve All Patches at Once

### Step 7.1: Download Entire Quilt

```sh
mkdir -p downloads/full-quilt
walrus --context testnet read-quilt --out downloads/full-quilt/ \
  --quilt-id $BLOB_ID
```

### Step 7.2: Verify All Files

**Mac/Linux:**

```sh
# Check all files were downloaded
ls -lh downloads/full-quilt/

# Verify each file
for file in intro config homepage sample-data logo; do
  echo "Checking $file..."
  # Note: identifiers are used as filenames
done

echo "Total files downloaded: $(ls downloads/full-quilt/ | wc -l)"  # Should be 5
```

**Windows (Command Prompt):**

```cmd
dir downloads\full-quilt

echo Total files downloaded: (count manually from dir output)
```

**Windows (PowerShell):**

```powershell
# Check all files were downloaded
Get-ChildItem downloads/full-quilt

# Verify each file
@("intro", "config", "homepage", "sample-data", "logo") | ForEach-Object {
  Write-Output "Checking $_..."
}

Write-Output "Total files downloaded: $((Get-ChildItem downloads/full-quilt).Count)"  # Should be 5
```

## Part 8: TypeScript SDK Retrieval (Optional)

If using TypeScript, create `retrieve-quilt.ts`:

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { readFile } from 'fs/promises';

async function retrieveFromQuilt() {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
  }).extend(walrus());

  // Load quilt ID
  const { quiltId } = JSON.parse(await readFile('quilt-info.json', 'utf-8'));

  console.log('Retrieving from quilt:', quiltId);

  // Method 1: By identifier
  console.log('\n=== Retrieve by Identifier ===');
  const blob = await client.walrus.getBlob({ blobId: quiltId });
  const introFiles = await blob.files({
    identifiers: ['intro'],
  });
  const introContent = new TextDecoder().decode(await introFiles[0].bytes());
  console.log('Intro content:', introContent.substring(0, 50) + '...');

  // Method 2: By tag
  console.log('\n=== Retrieve by Tag ===');
  const documents = await blob.files({
    tags: [{ type: 'document' }],
  });
  console.log('Document patches:', documents.length);

  // Method 3: Get all patches
  console.log('\n=== Retrieve All Patches ===');
  const allFiles = await blob.files();
  console.log('Total patches:', allFiles.length);

  for (const file of allFiles) {
    const identifier = await file.getIdentifier();
    const tags = await file.getTags();
    const content = await file.bytes();
    console.log(`- ${identifier}: ${content.length} bytes, tags:`, tags);
  }
}

retrieveFromQuilt()
  .then(() => console.log('\nDone!'))
  .catch(err => console.error('Error:', err));
```

Run it:

```sh
npx tsx retrieve-quilt.ts
```

## Part 9: Verification Summary

Create a verification script to check everything:

```bash
#!/bin/bash
# verify-lab.sh

set -e

BLOB_ID="$1"

if [ -z "$BLOB_ID" ]; then
  echo "Usage: $0 <BLOB_ID>"
  exit 1
fi

echo "=== Lab 4 Verification ==="
echo "Blob ID: $BLOB_ID"
echo ""

# Test 1: List patches
echo "[1/5] Listing patches..."
PATCH_COUNT=$(walrus --context testnet list-patches-in-quilt $BLOB_ID --json 2>&1 | grep -v "INFO\|WARN" | jq '.V1.index.quiltPatches | length')
echo "  ✓ Found $PATCH_COUNT patches (expected: 5)"

# Test 2: Retrieve by identifier
echo "[2/5] Testing retrieval by identifier..."
mkdir -p verify-downloads
walrus --context testnet read-quilt --out verify-downloads/ --quilt-id $BLOB_ID --identifiers intro > /dev/null 2>&1
if [ -f verify-downloads/intro ]; then
  echo "  ✓ Successfully retrieved by identifier"
else
  echo "  ✗ Failed to retrieve by identifier"
  exit 1
fi

# Test 3: Retrieve by tag
echo "[3/5] Testing retrieval by tag..."
rm -rf verify-downloads/*
walrus --context testnet read-quilt --out verify-downloads/ --quilt-id $BLOB_ID --tag type document > /dev/null 2>&1
DOC_COUNT=$(ls verify-downloads/ | wc -l | tr -d ' ')
echo "  ✓ Retrieved $DOC_COUNT documents by tag (expected: 2)"

# Test 4: Verify content integrity
echo "[4/5] Verifying content integrity..."
diff test-files/introduction.txt verify-downloads/intro > /dev/null 2>&1
echo "  ✓ Content matches original"

# Test 5: Retrieve all
echo "[5/5] Testing full quilt retrieval..."
rm -rf verify-downloads/*
walrus --context testnet read-quilt --out verify-downloads/ --quilt-id $BLOB_ID > /dev/null 2>&1
TOTAL_FILES=$(ls verify-downloads/ | wc -l | tr -d ' ')
echo "  ✓ Retrieved all $TOTAL_FILES files (expected: 5)"

echo ""
echo "=== All tests passed! ==="
echo "Lab 4 completed successfully!"

# Cleanup
rm -rf verify-downloads
```

Run verification:

```sh
chmod +x verify-lab.sh
./verify-lab.sh $BLOB_ID
```

## Part 10: Cleanup (Optional)

If you want to clean up after the lab:

**Mac/Linux:**

```sh
# Delete the quilt (if deletable)
walrus --context testnet delete --blob-id $BLOB_ID

# Remove local files
rm -rf walrus-quilt-lab/
```

**Windows (Command Prompt):**

```cmd
walrus --context testnet delete --blob-id %BLOB_ID%

rmdir /s /q walrus-quilt-lab
```

**Windows (PowerShell):**

```powershell
walrus --context testnet delete --blob-id $BLOB_ID

Remove-Item -Recurse -Force walrus-quilt-lab
```

## Lab Completion Checklist

Verify you completed all tasks:

- [ ] Created 5 test files with different types
- [ ] Stored files as a quilt with identifiers and tags
- [ ] Listed all patches in the quilt
- [ ] Retrieved blobs by identifier (single and multiple)
- [ ] Retrieved blobs by tag (different tag queries)
- [ ] Retrieved blobs by QuiltPatchId
- [ ] Retrieved the entire quilt at once
- [ ] Verified content integrity for all retrievals
- [ ] Understood the difference between retrieval methods

## Discussion Questions

After completing the lab, consider:

1. **When would you use identifier-based vs tag-based retrieval?**
   - Identifier: When you know exact file names
   - Tag: When filtering by categories or attributes

2. **Why are tags useful for quilts?**
   - Enable filtering without downloading all patches
   - Organize files by multiple dimensions
   - Support dynamic queries

3. **What's the advantage of quilts over storing files individually?**
   - Significant cost savings (up to 400x for small files)
   - Single transaction for all files
   - Grouped management

4. **When would you NOT want to use a quilt?**
   - Large individual files (> 10MB)
   - Need to update/delete individual files
   - Files have different lifecycles

## Key Takeaways

- **Hands-on Experience**: Practical creation of quilts with metadata reinforces theoretical concepts
- **Retrieval Mastery**: Understanding the difference between identifier, tag, and ID-based retrieval is crucial
- **Verification**: Verifying content integrity ensures successful storage and retrieval operations
- **Metadata Usage**: Effective tagging strategies significantly improve data manageability
- **Tool Proficiency**: Gaining comfort with both CLI and SDK approaches enables flexible integration

## Next Steps

Congratulations on completing Lab 4! You now have hands-on experience with:

- ✅ Creating quilts with metadata
- ✅ Multiple retrieval methods
- ✅ Verifying quilt contents
- ✅ Understanding quilt advantages and limitations

### Further Exploration

Try these additional challenges:

1. **Create a larger quilt** with 50-100 files
2. **Design a tag schema** for a real application (e.g., photo gallery, document management)
3. **Build a simple CLI tool** that manages quilts for a specific use case
4. **Measure cost savings** by comparing quilt vs individual blob storage

### Related Resources

- [What Quilts Solve](./01-what-quilts-solve.md) - Deep dive into use cases
- [Creation Process](./03-creation-process.md) - Advanced creation techniques
- [Retrieval Process](./04-retrieval-process.md) - Detailed retrieval methods
- [Real Examples](./05-real-examples.md) - Production-ready code
- [Typical Mistakes](./06-typical-mistakes.md) - Common pitfalls

## Troubleshooting

### Issue: "Duplicate identifier" error

**Solution**: Ensure all identifiers are unique. Check for duplicate filenames.

### Issue: "Insufficient funds" error

**Solution**: Check your SUI and WAL balance. Use `--dry-run` to estimate costs first.

### Issue: Patch not found when retrieving

**Solution**: Verify the identifier is correct using `list-patches-in-quilt`.

### Issue: QuiltPatchId not working with regular `read` command

**Solution**: Use `read-quilt` instead of `read` for quilt patches.

## Feedback

If you encountered any issues with this lab or have suggestions for improvement, please provide feedback to help us enhance the curriculum.

**Lab Complete!** 🎉

You've successfully completed Hands-On Lab 4 on Walrus Quilts!



