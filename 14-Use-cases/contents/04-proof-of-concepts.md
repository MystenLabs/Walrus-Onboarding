# Proof of Concept Patterns

Learn from real production systems and proof of concepts built on Walrus. Discover what works, what doesn't, and why.

---

## Learning from Production

### Why Study POCs?

**Value of real implementations**:
- Reveals practical constraints
- Shows unexpected challenges
- Validates (or invalidates) assumptions
- Provides concrete cost data
- Demonstrates actual performance

**💬 Discussion**: What's the difference between theoretical design and production reality?

---

## Pattern 1: Social Media Content Storage

### Use Case: Decentralized Social Platform

**Requirements**:
- User posts (text + images)
- Profile pictures
- Media attachments
- Immutable history
- Censorship resistance

### Architecture

**What was built**:
```
User posts → Publisher → Walrus (media blobs)
                     ↓
                  Sui (post metadata + blob IDs)
```

**Post structure on Sui**:
```move
public struct Post has key, store {
    id: UID,
    author: address,
    text: String,          // Short text on Sui
    media_blob_id: Option<vector<u8>>,  // Images/videos on Walrus
    timestamp: u64,
}
```

### What Worked

**✅ Immutable content**:
- Posts can't be deleted or altered
- Verifiable history
- Content-addressed blobs ensure authenticity

**✅ Cost-effective media**:
- 1 MB image: ~5 MB encoded = 5 storage units
- Cost: 5 × 500 × 26 = 65,000 WAL/year ≈ $0.0001/year
- Compare: S3 at $0.023/GB/month = $0.28/year (2800x more expensive)

**✅ Censorship resistance**:
- No central authority can remove content
- Byzantine fault tolerance ensures availability

### What Didn't Work

**❌ Performance expectations**:
- **Problem**: Users expected instant image loads
- **Reality**: Aggregator latency 500ms-2s
- **Learning**: Not suitable for real-time social feeds

**❌ Edit functionality**:
- **Problem**: Users wanted to edit posts
- **Reality**: Blobs are immutable
- **Workaround**: Create new blob, update Sui pointer (costs gas)
- **Learning**: Immutability conflicts with user expectations

**❌ High-frequency posting**:
- **Problem**: Every post costs gas on Sui
- **Reality**: Active users post 10-50 times/day
- **Learning**: Gas costs accumulate for frequent writers

### Lessons Learned

| Challenge | Solution |
|-----------|----------|
| Slow image loads | Use thumbnails in quilts, full res on demand |
| Immutability vs edits | Clarify "append-only" in UX, hide old versions |
| Gas costs for posts | Batch multiple posts, use Sui's sponsored transactions |
| Content moderation | Layer 2 indexers can filter without censoring storage |

### ✅ Checkpoint: Apply Lessons

You're building a photo-sharing platform. Based on this POC:
1. How would you handle image storage?
2. How would you manage user expectations about immutability?
3. What's your strategy for performance?

**Pair Discussion**: Share your approaches.

---

## Pattern 2: Gaming Asset Management

### Use Case: NFT-Based Game

**Requirements**:
- Character sprites (1000+ images)
- Item images (5000+ assets)
- 3D models for premium items
- Game updates with new assets
- Player-owned items as NFTs

### Architecture

**What was built**:
```
Game Assets:
- Common sprites → Quilt (small, numerous)
- Item images → Quilt (small, numerous)
- 3D models → Individual blobs (large)

NFT Reference:
- Sui NFT object → blob_id + quilt_id + index
```

### What Worked

**✅ Quilt efficiency for sprites**:
- 1000 sprites × 20 KB each = 20 MB total
- As quilt: ~100 MB encoded = 100 storage units
- Without quilt: 1000 × 65 units = 65,000 storage units
- **Savings**: 650x reduction!

**✅ Update strategy**:
- New season: Upload new quilt with updated sprites
- Update game client to reference new quilt ID
- Old quilt remains for historical NFTs
- Cost: Only new quilt, not re-uploading all assets

**✅ Player-owned verifiability**:
- NFT references specific blob ID
- Players can verify their item's image hasn't changed
- Provable rarity (blob ID proves original asset)

### What Didn't Work

**❌ Dynamic asset loading**:
- **Problem**: Game needed to load assets on-demand
- **Reality**: Walrus fetch too slow for real-time gameplay
- **Learning**: Pre-download asset pack at game launch

**❌ Frequent asset updates**:
- **Problem**: Weekly updates with 100+ new assets
- **Reality**: Creating new quilts weekly costs accumulate
- **Learning**: Batch updates monthly, not weekly

**❌ Large 3D models**:
- **Problem**: Some models were 50-100 MB
- **Reality**: Encoding to ~250-500 MB, slow downloads
- **Learning**: Optimize models before upload (LODs, compression)

### Lessons Learned

**Asset loading strategy**:
```javascript
// At game launch
async function loadGameAssets() {
  // Download all quilts (sprites, items)
  const spriteQuilt = await fetchQuilt(SPRITE_QUILT_ID);
  const itemQuilt = await fetchQuilt(ITEM_QUILT_ID);

  // Cache locally
  localStorage.set('sprites', spriteQuilt);
  localStorage.set('items', itemQuilt);

  // Load 3D models on demand (rare, premium items)
  // User won't notice latency when inspecting premium item
}
```

**Update cadence**:
- **Daily**: Too expensive, too much overhead
- **Weekly**: Still costly
- **Monthly**: ✅ Optimal balance
- **Quarterly**: Too slow for active game

### ✅ Checkpoint: Design Game Storage

Your game has:
- 5000 common items (10 KB sprites each)
- 500 rare items (50 KB sprites each)
- 50 legendary items (5 MB 3D models each)

Design storage strategy:
1. What goes in quilts?
2. What's individual blobs?
3. Update strategy?

**Instructor**: Review one design as a class.

---

## Pattern 3: Document Archive

### Use Case: Legal Document Storage

**Requirements**:
- Immutable records
- Long-term retention (10+ years)
- Verifiable timestamps
- Search by metadata
- Access control

### Architecture

**What was built**:
```
Documents → Walrus (PDF blobs)
Metadata → Sui (searchable, access control)
Index → Sui (document catalog)
```

**Document metadata on Sui**:
```move
public struct Document has key {
    id: UID,
    title: String,
    blob_id: vector<u8>,
    upload_timestamp: u64,
    hash: vector<u8>,        // SHA-256 for verification
    authorized_viewers: vector<address>,
}
```

### What Worked

**✅ Immutability guarantee**:
- Legal requirement: documents can't be altered
- Walrus blob IDs = content hash
- Perfect match for compliance

**✅ Long-term cost predictability**:
- 10,000 documents × 500 KB avg = 5 GB
- Encoded: ~25 GB = 25 storage units
- 10 years = 260 epochs
- Total: 25 × 500 × 260 = 3,250,000 WAL ≈ $0.50 total
- Compare: Cloud storage at $0.023/GB/month × 12 months × 10 years × 5 GB = $13.80

**✅ Verifiable integrity**:
- Blob ID doubles as content hash
- Proof of existence at specific time (Sui timestamp)
- Court-admissible evidence of document state

### What Didn't Work

**❌ Full-text search**:
- **Problem**: Needed to search document contents
- **Reality**: Walrus doesn't provide search
- **Workaround**: Extract text, store on Sui or indexer
- **Learning**: Walrus = storage, not search engine

**❌ Access control on Walrus**:
- **Problem**: Wanted to restrict who can download
- **Reality**: Blob IDs are public, anyone with ID can fetch
- **Workaround**: Encrypt documents, manage keys on Sui
- **Learning**: Privacy requires encryption layer

**❌ Automatic epoch extension**:
- **Problem**: Expected "set and forget" storage
- **Reality**: Must manually extend epochs before expiration
- **Learning**: Need monitoring system for epoch tracking

### Lessons Learned

**Encryption pattern**:
```javascript
// Upload encrypted document
const encrypted = encrypt(documentPDF, userKey);
const blobId = await walrus.store(encrypted);

// Store decryption key on Sui (access controlled)
await sui.storeKey({
  documentId: docId,
  encryptedKey: encrypt(userKey, ownerPublicKey),
  authorizedViewers: [owner, lawyer, judge]
});

// Authorized viewer retrieves
const encryptedDoc = await walrus.fetch(blobId);
const key = await sui.getKey(docId);  // Access control checked
const document = decrypt(encryptedDoc, key);
```

**Epoch monitoring**:
```javascript
// Check epoch status
const info = await walrus.blobInfo(blobId);
const epochsRemaining = info.endEpoch - currentEpoch;

if (epochsRemaining < 10) {
  // Extend before expiration
  await walrus.extend(blobId, 52);  // Add 1 year
}
```

### ✅ Checkpoint: Privacy Design

For medical records requiring:
- HIPAA compliance
- Patient access only
- Doctor access with patient consent
- Immutable history

How would you design storage and access control?

**💬 Group Discussion**: Compare approaches.

---

## Pattern 4: Dataset Distribution

### Use Case: Open Science Dataset Sharing

**Requirements**:
- Large datasets (10-100 GB)
- High availability
- Version control
- Citeable (DOI-like reference)
- Collaboration (multiple contributors)

### Architecture

**What was built**:
```
Dataset chunks → Walrus (multi-part upload)
Index → Sui (chunk manifest + metadata)
DOI mapping → Sui (permanent reference)
```

**Dataset object**:
```move
public struct Dataset has key {
    id: UID,
    doi: String,              // "10.5281/walrus.12345"
    version: u64,
    chunk_count: u64,
    total_size: u64,
    chunks: vector<ChunkInfo>,
    contributors: vector<address>,
}
```

### What Worked

**✅ Permanent citeable reference**:
- Sui object ID = permanent dataset ID
- Maps to traditional DOI
- Blob IDs ensure data integrity
- Perfect for scientific reproducibility

**✅ Version control**:
- New version = new Dataset object
- References previous version
- Can extend epochs per version based on usage
- Old versions remain accessible

**✅ Decentralized distribution**:
- No single institution pays for hosting
- Community can fund epoch extensions
- Resistant to institution shutdowns

### What Didn't Work

**❌ Collaborative editing**:
- **Problem**: Multiple researchers want to update dataset
- **Reality**: Each update creates new blobs (no delta updates)
- **Learning**: Better for finalized datasets than work-in-progress

**❌ Partial dataset updates**:
- **Problem**: Fixed typo in one file, wanted to update just that chunk
- **Reality**: Must upload new chunk, update index, costs gas
- **Learning**: Chunk granularity matters (too fine = overhead)

**❌ Download performance for large datasets**:
- **Problem**: 100 GB dataset slow to download
- **Reality**: Aggregator bandwidth limited
- **Workaround**: Provide torrent as alternative
- **Learning**: Walrus best for archival, supplement with CDN for hot data

### Lessons Learned

**Versioning strategy**:
```javascript
// Create new version
const newVersion = {
  doi: dataset.doi,          // Same DOI
  version: dataset.version + 1,
  parentVersion: dataset.id,
  chunks: updatedChunks,     // Most chunks reused from previous version
  changelog: "Fixed bug in preprocessing script"
};
```

**Hybrid distribution**:
```markdown
Dataset available via:
1. **Walrus** (permanent, verifiable): Use for long-term archive
2. **IPFS** (decentralized, faster): Use for active downloads
3. **CDN** (fast, centralized): Use for hot data

Recommend: Download from CDN, verify against Walrus blob IDs
```

### ✅ Checkpoint: Research Data Plan

You're publishing a genomics dataset:
- 50 GB total
- Used in 100+ research papers
- Must remain available for 20+ years
- May need corrections/updates

Design:
1. Chunking strategy
2. Versioning approach
3. Long-term funding for epochs

**Instructor**: Discuss funding models (grants, DAOs, etc.).

---

## Common Patterns Across POCs

### Pattern: Hybrid Storage

**What**: Combine Walrus with other systems

**Why**: Play to each system's strengths

**How**:
| Data Type | Storage | Reason |
|-----------|---------|--------|
| Media (images, videos) | Walrus | Immutable, verifiable |
| Metadata (searchable) | Sui | Queryable, indexed |
| Temporary data | Traditional DB | Mutable, fast |
| Hot data (frequently accessed) | CDN | Performance |
| Cold data (archival) | Walrus | Cost-effective |

### Pattern: Quilt First, Blob Later

**What**: Start with quilts, split out to individual blobs as needed

**Why**: Optimize costs initially

**How**:
```javascript
// Phase 1: Small project, use quilts
const allAssets = await walrus.storeQuilt(assets);

// Phase 2: Growth, some assets accessed frequently
const hotAssets = await Promise.all(
  frequentlyAccessed.map(asset => walrus.store(asset))
);
const coldAssets = await walrus.storeQuilt(infrequentlyAccessed);
```

### Pattern: Index on Sui, Data on Walrus

**What**: Store metadata on Sui for queries, large data on Walrus

**Why**: Leverage Sui's query capabilities

**How**:
```move
// Searchable on Sui
public struct Asset has key {
    id: UID,
    name: String,
    category: String,
    tags: vector<String>,
    blob_id: vector<u8>,  // Points to Walrus
}

// Query on Sui
let assets = sui.query("SELECT * FROM Asset WHERE category = 'legal'");

// Fetch data from Walrus
for asset in assets {
    let data = walrus.fetch(asset.blob_id);
}
```

### Pattern: Epoch Extension Monitoring

**What**: Automated monitoring and extension before expiration

**Why**: Prevent data loss

**How**:
```javascript
// Cron job runs daily
async function monitorEpochs() {
  const criticalAssets = await db.query('SELECT blob_id FROM assets WHERE critical = true');

  for (const asset of criticalAssets) {
    const info = await walrus.blobInfo(asset.blob_id);
    const epochsRemaining = info.endEpoch - currentEpoch;

    if (epochsRemaining < 10) {
      console.log(`Extending ${asset.blob_id}`);
      await walrus.extend(asset.blob_id, 26);  // Add 6 months
      await db.update(`UPDATE assets SET last_extended = NOW() WHERE blob_id = '${asset.blob_id}'`);
    }
  }
}
```

### ✅ Checkpoint: Identify Patterns

For each use case, which patterns apply?
1. NFT marketplace
2. Decentralized blog
3. Scientific collaboration platform

**Pair Discussion**: Map patterns to use cases.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using Walrus as a Database

**Mistake**:
```javascript
// DON'T: Store frequently-changing data on Walrus
const user = { name: "Alice", score: 100 };
const blobId = await walrus.store(user);

// User scores change every game
user.score = 150;
const newBlobId = await walrus.store(user);  // New blob, old one wasted
```

**Why it's bad**:
- Creates many orphaned blobs
- Costs accumulate
- Immutability fights frequent updates

**Better approach**:
```javascript
// DO: Use Sui for mutable data
public struct User has key {
    id: UID,
    name: String,
    score: u64,  // Updates in place
}

// Use Walrus only for immutable game assets
```

### Anti-Pattern 2: Assuming Instant Availability

**Mistake**:
```javascript
// DON'T: Upload and immediately expect fast download
const blobId = await walrus.store(largeFile);
window.location = `https://aggregator.walrus.space/v1/${blobId}`;  // May be slow!
```

**Why it's bad**:
- Aggregators may not have blob cached
- First fetch can be slow
- Poor user experience

**Better approach**:
```javascript
// DO: Set expectations, show loading state
const blobId = await walrus.store(largeFile);
showMessage("File uploaded! Generating preview...");
await sleep(2000);  // Give aggregator time to cache
const url = `https://aggregator.walrus.space/v1/${blobId}`;
```

### Anti-Pattern 3: Not Planning Epochs

**Mistake**:
```bash
# DON'T: Use default epochs without thinking
walrus store important-data.pdf  # Uses default, might expire soon!
```

**Why it's bad**:
- Data may expire unexpectedly
- Emergency extensions cost more (last-minute)
- Risk of data loss

**Better approach**:
```bash
# DO: Plan epochs based on data lifecycle
walrus store important-data.pdf --epochs 52  # 2 years for important data
walrus store temp-cache.bin --epochs 1      # 2 weeks for temporary data
```

### Anti-Pattern 4: Ignoring Quilt Opportunities

**Mistake**:
```bash
# DON'T: Upload 1000 small files individually
for file in metadata/*.json; do
  walrus store "$file" --epochs 26
done
# Cost: 1000 × 65 units × 500 × 26 = 845,000,000 WAL!
```

**Why it's bad**:
- Metadata overhead dominates
- Unnecessarily expensive
- Wastes resources

**Better approach**:
```bash
# DO: Use quilts for small files
walrus store-quilt --paths metadata/*.json --epochs 26
# Cost: ~7 units × 500 × 26 = 91,000 WAL
# Savings: 99.99%!
```

### ✅ Checkpoint: Spot Anti-Patterns

Review this code:
```javascript
// User uploads profile picture
const blobId = await walrus.store(profilePic, { epochs: 1 });
await sui.updateUser({ userId, profileBlobId: blobId });

// User changes picture weekly
// Each week: new blob, old blob expires after 2 weeks
```

What's the anti-pattern? How would you fix it?

**💬 Group Discussion**: Share solutions.

---

## Key Takeaways

**What Works**:
- ✅ Immutable content (legal docs, NFTs, archives)
- ✅ Quilts for collections of small files (massive savings)
- ✅ Hybrid architectures (Sui for metadata, Walrus for data)
- ✅ Long-term archival (cost-effective, reliable)
- ✅ Multi-part storage for large datasets (parallelization)

**What Doesn't Work**:
- ❌ Real-time/interactive applications (latency issues)
- ❌ Frequently updated data (immutability conflicts)
- ❌ High-frequency writes (gas costs accumulate)
- ❌ Fine-grained access control without encryption
- ❌ Full-text search (need external indexer)

**Patterns to Apply**:
- Hybrid storage leveraging strengths
- Quilt first, split later if needed
- Index on Sui, data on Walrus
- Epoch extension monitoring
- Encryption for privacy
- Pre-download for performance

**Anti-Patterns to Avoid**:
- Using Walrus as a database
- Not planning epochs
- Ignoring quilt opportunities
- Assuming instant availability

**Next**: [Design Choices](./05-design-choices.md) - Framework for making practical decisions
