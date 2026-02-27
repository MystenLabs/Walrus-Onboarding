# Smart Contract Integration

## Key Concepts

- **Blob IDs as Move struct fields**: store Walrus blob IDs (`vector<u8>`) inside Sui Move structs to link on-chain objects to off-chain content. Blob IDs are content-addressed and immutable after the struct is created.
- **Hybrid architecture**: Sui holds metadata, access control, and blob references; Walrus holds large binary data. This separates queryable state (Sui) from storage costs (Walrus).
- **Walrus Sites**: static websites are deployed by uploading assets to Walrus and writing a `Site` Sui object whose **dynamic fields** map URL paths to blob IDs. The portal resolves paths against Sui and fetches blobs from Walrus.
- **Seal encryption pattern**: encrypt data client-side with Seal before uploading to Walrus, then manage encryption keys and access control on Sui. The blob remains opaque to aggregators/nodes.
- Design choice — what on Sui vs Walrus: put **searchable**, **small**, or **access-controlled** data on Sui; put **large binary**, **media**, or **archival** data on Walrus.

## NFT Metadata Pattern

```move
// Option 1: Image on Walrus, attributes on Sui (queryable)
public struct NFT has key, store {
    id: UID,
    name: String,
    image_blob_id: vector<u8>,    // Points to Walrus blob
    attributes: vector<String>,   // Searchable on-chain
}

// Option 2: Everything on Walrus (single blob for all metadata)
public struct NFT has key, store {
    id: UID,
    metadata_blob_id: vector<u8>, // Full JSON metadata on Walrus
}

// Mint with immutable blob reference
public fun mint_nft(
    image_blob_id: vector<u8>,
    metadata_quilt_id: vector<u8>,
    metadata_index: u64,
    ctx: &mut TxContext,
): NFT {
    NFT {
        id: object::new(ctx),
        image_blob_id,
        metadata_quilt_id,
        metadata_index,
    }
}
```

**Why make blob IDs immutable**: prevents swapping the image after minting. The NFT's content is anchored by the Walrus blob ID.

## Walrus Sites Pattern

```move
// Site object on Sui — dynamic fields map paths to blob IDs
struct Site {
    id: UID,
    name: String,
    // Dynamic fields: "/index.html" → blob_id_1
    //                 "/style.css"  → blob_id_2
}
```

Request flow:
```
Browser → wal.app portal → Sui (Site object + dynamic fields) → Walrus (fetch blob) → Browser
```

Deployment:
```bash
# Build static site, then deploy (Rust CLI)
site-builder deploy ./dist --epochs 26

# Update — unchanged files reuse existing blob IDs (deduplication)
site-builder deploy ./dist --epochs 26
```

## Hybrid Architecture (Sui + Walrus)

```move
// Photo sharing app example
public struct Photo has key {
    id: UID,
    title: String,            // Searchable on Sui
    owner: address,           // Access control on Sui
    tags: vector<String>,     // Queryable on Sui
    blob_id: vector<u8>,      // Full image on Walrus
    thumbnail_blob_id: vector<u8>, // Thumbnail on Walrus
    upload_timestamp: u64,
}
```

Query pattern:
1. Search/filter photos by tag on Sui
2. Display thumbnails from Walrus using `thumbnail_blob_id`
3. Fetch full image from Walrus on demand using `blob_id`

## Seal Encryption Pattern

```javascript
// Encrypt data locally before uploading to Walrus
const encryptedData = await seal.encrypt(plaintext, encryptionKey);

// Upload encrypted blob to Walrus
const blobId = await walrus.store(encryptedData);

// Manage keys and access control on Sui
await sui.storeKeyMetadata({
  blobId,
  authorizedViewers: [address1, address2],
});
```

```move
// Fine-grained access control on Sui
public struct SecureDocument has key {
    id: UID,
    encrypted_blob_id: vector<u8>,              // Encrypted data on Walrus
    authorized_viewers: Table<address, EncryptedKey>, // Per-viewer encrypted keys
}
```

## Storage Location Decision Matrix

| Data Type | On Sui | On Walrus |
|---|---|---|
| Large media (images, video) | ❌ | ✅ |
| Small metadata (< 1 KB) | ✅ | ❌ |
| Searchable / queryable data | ✅ | ❌ |
| Immutable history | — | ✅ |
| Access control & keys | ✅ | ❌ |
| Blob references / index | ✅ | — |

## Versioning Patterns

```move
// Versioned asset — track history on Sui
public struct VersionedAsset has key {
    id: UID,
    current_version: u64,
    versions: Table<u64, vector<u8>>,  // version number → blob_id
}

// Mutable pointer — single reference updated in place
public struct MutableReference has key {
    id: UID,
    current_blob_id: vector<u8>,  // Updated to point at new blob
}
```

## Source Files

- `14-Use-cases/contents/01-nft-metadata.md`
- `14-Use-cases/contents/02-walrus-sites.md`
- `14-Use-cases/contents/05-design-choices.md`
