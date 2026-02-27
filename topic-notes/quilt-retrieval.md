# Quilt Retrieval

## Key Concepts

- Individual patches can be retrieved **without downloading the entire quilt** — only the relevant slivers are fetched from storage nodes.
- Retrieval latency for a single patch is **comparable to regular blob retrieval** due to sliver alignment.
- Four retrieval methods: by **identifier**, by **tag**, by **QuiltPatchId**, or **all patches**.
- **Identifiers** (set at creation time) are human-readable; **QuiltPatchIds** are the low-level cryptographic patch references encoded in the quilt index.
- HTTP tag retrieval is not directly supported — list patches first, filter client-side, then fetch by ID.
- The first step in any retrieval is downloading the **QuiltIndex** (a small header), then fetching only the needed slivers.
- CLI alias: `resolve-quilt` is the same as `list-patches-in-quilt`.

## CLI Commands

```bash
# List all patches and their QuiltPatchIds (no data download)
walrus list-patches-in-quilt <QUILT_BLOB_ID>
# alias:
walrus resolve-quilt <QUILT_BLOB_ID>

# Retrieve by identifier(s)
walrus read-quilt --out ./downloads/ \
  --quilt-id <QUILT_BLOB_ID> \
  --identifiers intro.html getting-started.html

# Retrieve by tag (one tag at a time)
walrus read-quilt --out ./downloads/ \
  --quilt-id <QUILT_BLOB_ID> \
  --tag author Alice

# Retrieve by QuiltPatchId
walrus read-quilt --out ./downloads/ \
  --quilt-patch-ids <PATCH_ID1> <PATCH_ID2>

# Retrieve ALL patches from the quilt
walrus read-quilt --out ./downloads/ --quilt-id <QUILT_BLOB_ID>

# Check quilt status
walrus blob-status --blob-id <QUILT_BLOB_ID>
```

### Common Error Fixes

```bash
# "Patch not found" — check available identifiers first
walrus list-patches-in-quilt <QUILT_BLOB_ID>

# "Quilt not available" — check if expired
walrus blob-status --blob-id <QUILT_BLOB_ID>
```

## SDK / Code

```typescript
// Retrieve by identifier(s) using SDK
const quiltBlob = await client.getBlob({ blobId: quiltId });
const files = await quiltBlob.files({
  identifiers: ['intro', 'api-ref'],
});

// Retrieve by tag
const files = await quiltBlob.files({
  tag: { key: 'author', value: 'Alice' },
});

// Retrieve all patches
const files = await quiltBlob.files();

// Retrieve by QuiltPatchId
const files = await quiltBlob.files({
  patchIds: [patchId1, patchId2],
});

// Safe retrieval with error handling
async function safeRetrieve(quiltId: string, identifier: string) {
  try {
    const quiltBlob = await client.getBlob({ blobId: quiltId });
    const files = await quiltBlob.files({ identifiers: [identifier] });
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    console.error(`Failed to retrieve ${identifier}:`, error);
    return null;
  }
}
```

### HTTP API

```bash
# Get patch by identifier
GET /v1/quilts/<QUILT_BLOB_ID>/patches/<IDENTIFIER>
# Response headers include X-Walrus-Quilt-Patch-Id

# Get patch by QuiltPatchId
GET /v1/quilts/patches/<QUILT_PATCH_ID>

# List all patches (metadata only)
GET /v1/quilts/<QUILT_BLOB_ID>/patches

# Note: tag-based retrieval requires client-side filtering after listing
```

### Retrieval Performance

| Method | Data Downloaded | Notes |
|---|---|---|
| Single patch by identifier | Patch slivers + small index | Same latency as regular blob |
| Multiple patches | Combined patch slivers | Efficient |
| All patches | Full quilt | Equivalent to individual download of all blobs |

## Source Files

- `11-Batch-storage/contents/04-retrieval-process.md`
