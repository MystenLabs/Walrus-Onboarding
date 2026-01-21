# Design Choices

Master the decision-making frameworks for designing Walrus storage solutions. Learn when to use each feature and why.

---

## Decision Framework Overview

### Key Questions for Every Design

When designing a Walrus solution, answer these:

1. **What are you storing?** (size, type, mutability)
2. **Who accesses it?** (frequency, patterns, privacy)
3. **How long should it last?** (temporary, permanent, archival)
4. **What's your budget?** (cost constraints, optimization priority)
5. **What performance is needed?** (real-time, eventual, archival)

**💬 Discussion**: Why does order matter? Can you skip questions?

---

## Choice 1: Blob vs Quilt

### Decision Framework

**Use individual blobs when**:
- ✅ File size > 1 MB
- ✅ Independent access needed
- ✅ Different epoch requirements per file
- ✅ Frequent updates to specific files
- ✅ Individual verifiability required

**Use quilts when**:
- ✅ Many small files (< 1 MB each)
- ✅ Accessed together as a group
- ✅ Same epoch requirements
- ✅ Cost optimization priority
- ✅ Files rarely change

### Cost Comparison

**Example**: 500 metadata files, 5 KB each

**Individual blobs**:
```
500 files × 64.01 MB (overhead) = 32,005 MB encoded
32,005 MB / 1024 = ~31.25 GB
31.25 GB / 1 MiB = ~32,000 storage units
Cost/year: 32,000 × 500 × 26 = 416,000,000 WAL
```

**Quilt**:
```
500 files × 5 KB = 2.5 MB total
Encoded: ~12.5 MB
12.5 MB / 1 MiB = ~13 storage units
Cost/year: 13 × 500 × 26 = 169,000 WAL
```

**Savings**: 99.96% reduction with quilt!

### Decision Tree

```
Is file < 1 MB?
├─ No → Use individual blob
└─ Yes → Multiple files with same lifecycle?
    ├─ Yes → Use quilt
    └─ No → Individual blob if accessed independently
```

### ✅ Checkpoint: Apply Framework

Categorize these:
1. 10,000 NFT metadata JSONs (2 KB each)
2. User profile pictures (varies: 50 KB - 2 MB)
3. Game sprites (20 KB each, 1000 files)
4. ML model checkpoints (5 GB each)

**Blob or quilt for each? Why?**

**Instructor**: Review answers, discuss edge cases.

---

## Choice 2: Epoch Planning

### Decision Framework

**Factors to consider**:
- Data lifetime requirements
- Update frequency
- Funding availability
- Extension management overhead

### Epoch Strategy Table

| Use Case | Initial Epochs | Extension Strategy |
|----------|---------------|-------------------|
| **Temporary cache** | 1-2 | Don't extend, let expire |
| **Active project data** | 4-13 | Extend quarterly/yearly |
| **Archival records** | 52-260+ | Monitor, extend as needed |
| **Permanent assets** | 52+ | Community/DAO funded extensions |

### Cost vs Commitment Trade-off

**Short epochs** (1-4):
- Lower initial commitment
- Flexibility to abandon
- Must monitor closely
- Risk of forgetting to extend

**Long epochs** (52+):
- Higher initial cost
- Peace of mind
- Less management overhead
- Locked commitment

### Calculation Example

**1 GB file stored for 2 years**:

**Option A**: 2 epochs initially, extend 12 times
```
Initial: 5 units × 500 × 2 = 5,000 WAL
Extensions: (5 units × 500 × 2) × 12 = 60,000 WAL
Gas costs: 13 transactions × gas
Total: 65,000 WAL + gas
```

**Option B**: 52 epochs upfront
```
Initial: 5 units × 500 × 52 = 130,000 WAL
Extensions: 0
Gas costs: 1 transaction × gas
Total: 130,000 WAL + gas
```

**Trade-off**: Option A costs less WAL but more gas and management overhead. Option B costs more WAL but simpler.

### ✅ Checkpoint: Plan Epochs

For each scenario, choose epochs:
1. Proof of concept (might abandon in 1 month)
2. Legal document (must keep 10 years minimum)
3. NFT collection (permanent, community will fund)
4. Website assets (update quarterly)

**Pair Discussion**: Justify your choices.

---

## Choice 3: Direct vs Publisher

### Decision Framework

**Use direct storage (CLI/SDK) when**:
- ✅ One-time uploads
- ✅ Controlled environment
- ✅ Technical users
- ✅ No need for HTTP API

**Use publisher when**:
- ✅ Web application uploads
- ✅ Non-technical users
- ✅ High-frequency uploads
- ✅ Need HTTP interface

### Publisher Deployment Considerations

**When to run your own publisher**:
- High upload volume (> 100/day)
- Privacy requirements (don't want to share publisher)
- Custom logic needed
- Cost optimization (shared wallet)

**When to use shared publisher**:
- Low upload volume
- Testing/prototyping
- No infrastructure to manage
- Cost not a concern

### Cost Analysis

**Shared publisher** (public):
- No infrastructure costs
- Pay only storage costs
- May have rate limits
- Less control

**Own publisher**:
- Infrastructure: ~$10-50/month (VPS)
- Storage costs: Same as direct
- Wallet management needed
- Full control

### ✅ Checkpoint: Choose Deployment

Your app uploads:
- 1000 files/day
- Users are non-technical
- Privacy important

**Should you run your own publisher? Why?**

**💬 Group Poll**: How many would run their own? Why?

---

## Choice 4: Storage Location - Walrus, Sui, or Both?

### Decision Matrix

| Data Type | Walrus | Sui | Both |
|-----------|--------|-----|------|
| **Large media** (images, videos) | ✅ | ❌ | - |
| **Small metadata** (< 1 KB) | ❌ | ✅ | - |
| **Searchable data** | ❌ | ✅ | - |
| **Immutable history** | ✅ | - | ✅ |
| **Access control** | ❌ | ✅ | ✅ (encrypted on Walrus, keys on Sui) |
| **Indexes/catalogs** | - | ✅ | ✅ (redundancy) |

### Hybrid Architecture Pattern

**Common pattern**:
```
Sui: Metadata + blob references + access control
Walrus: Large data blobs
```

**Example - Photo sharing app**:
```move
// On Sui
public struct Photo has key {
    id: UID,
    title: String,           // Searchable
    owner: address,
    tags: vector<String>,    // Searchable
    blob_id: vector<u8>,     // Points to Walrus
    thumbnail_blob_id: vector<u8>,  // Points to Walrus
    upload_timestamp: u64,
}
```

```
// On Walrus
- Thumbnail image (50 KB)
- Full resolution image (5 MB)
```

**Query workflow**:
1. Search photos by tag on Sui
2. Display thumbnails from Walrus
3. Fetch full image when clicked

### ✅ Checkpoint: Design Hybrid Storage

For a blogging platform with:
- Post text (1-10 KB)
- Featured images (500 KB - 2 MB)
- Full-text search needed
- Author attribution

**What goes on Sui? What goes on Walrus?**

**Instructor**: Draw architecture on whiteboard.

---

## Choice 5: Encryption and Privacy

### Decision Framework

**Encrypt when**:
- ✅ Private/sensitive data
- ✅ Access control required
- ✅ Regulatory compliance (HIPAA, GDPR)
- ✅ User expects privacy

**Don't encrypt when**:
- ✅ Public data
- ✅ Verifiability by third parties needed
- ✅ Performance critical
- ✅ No privacy requirements

### Encryption Approaches

**Option 1: Client-side encryption with Seal**

**Using Seal** (Sui ecosystem tool):

Seal is an encryption tool in the Sui/Walrus ecosystem that allows you to encrypt data before uploading to Walrus.

```javascript
// Example: Encrypt data locally before upload using Seal
// Encrypt file with Seal library
const encryptedData = await seal.encrypt(plaintext, encryptionKey);

// Upload encrypted data to Walrus
const blobId = await walrus.store(encryptedData);

// Manage keys on Sui for access control
await sui.storeKeyMetadata({
  blobId,
  authorizedViewers: [address1, address2]
});
```

**Workflow**:
1. Encrypt data locally using Seal
2. Upload encrypted blob to Walrus
3. Manage encryption keys and access control on Sui
4. Authorized users decrypt using their keys

**Pros**:
- Ecosystem-native encryption solution
- Publisher/aggregator never sees plaintext
- Full privacy and user control
- Integrates well with Sui for key management

**Cons**:
- Lost key = lost data permanently
- Key management complexity
- Must securely distribute keys to authorized users

**Option 2: Publisher-side encryption**
```javascript
// Publisher encrypts
const encrypted = publisherEncrypt(data);
const blobId = await walrus.store(encrypted);
```

**Pros**:
- Simpler for users
- Publisher can manage keys

**Cons**:
- Must trust publisher
- Publisher is attack vector

### Access Control Pattern

**Fine-grained access**:
```move
public struct SecureDocument has key {
    id: UID,
    encrypted_blob_id: vector<u8>,  // Encrypted data on Walrus
    authorized_viewers: Table<address, EncryptedKey>,  // Different key per viewer
}

// Grant access
public fun grant_access(
    doc: &mut SecureDocument,
    viewer: address,
    viewer_pubkey: vector<u8>,
    ctx: &TxContext
) {
    // Encrypt document key with viewer's public key
    let encrypted_key = encrypt_for_viewer(doc.master_key, viewer_pubkey);
    table::add(&mut doc.authorized_viewers, viewer, encrypted_key);
}
```

### ✅ Checkpoint: Privacy Design

Medical records app:
- Patient data (private)
- Doctor notes (private to patient + doctor)
- Lab results (private until patient approves sharing)

**Design encryption and access control strategy.**

**Pair Discussion**: Compare approaches.

---

## Choice 6: Cost vs Performance

### Trade-off Spectrum

```
Low Cost <──────────────────────────────> High Performance

Walrus only                    Hybrid (Walrus + CDN)
Long epochs                    Short epochs (frequent updates)
Large chunks                   Small chunks (parallel)
Quilts                         Individual blobs
```

### Optimization Strategies

**Optimize for cost**:
- Use quilts aggressively
- Large chunks (less overhead)
- Long epochs (fewer extensions)
- Minimal redundancy
- Direct storage (no publisher costs)

**Optimize for performance**:
- Individual blobs (parallel fetch)
- CDN layer for hot data
- Smaller chunks (faster to first byte)
- Multiple aggregators
- Pre-caching strategies

### Hybrid: Best of Both Worlds

**Pattern**: Walrus for cold data, CDN for hot data

```javascript
// Write to both
await walrus.store(data);          // Permanent, cheap
await cdn.upload(data);             // Fast access

// Read: Try CDN first, fallback to Walrus
let content;
try {
  content = await cdn.fetch(id);    // Fast path
} catch {
  content = await walrus.fetch(id); // Reliable fallback
  await cdn.upload(content);        // Cache for next time
}
```

### Cost-Performance Matrix

| Strategy | Cost | Performance | Use When |
|----------|------|-------------|----------|
| **Walrus only** | Lowest | Moderate | Archival, infrequent access |
| **Walrus + CDN** | Medium | High | Frequently accessed data |
| **CDN + Walrus backup** | Higher | Highest | Critical, hot data |
| **Quilts** | Lowest | Low | Small files, batch access |
| **Individual blobs** | Higher | Higher | Large files, parallel access |

### ✅ Checkpoint: Optimize

For each use case, choose strategy:
1. Government archives (rarely accessed, must last 50 years)
2. Social media feed (high frequency, real-time expectations)
3. NFT marketplace images (moderate frequency, must be permanent)

**Cost priority? Performance priority? Balanced?**

**Instructor**: Discuss trade-offs for each.

---

## Choice 7: Update Patterns

### Immutable vs Versioned

**Immutable** (one blob, never changes):
- NFT metadata
- Legal documents
- Historical records
- Permanent references

**Versioned** (new blob for each version):
- Software releases
- Dataset updates
- Website deployments
- Evolving content

### Versioning Strategies

**Option 1: Version in filename**
```bash
walrus store model-v1.0.bin
walrus store model-v1.1.bin
walrus store model-v2.0.bin
```

**Pros**: Simple, explicit
**Cons**: No automated linkage between versions

**Option 2: Version on Sui**
```move
public struct VersionedAsset has key {
    id: UID,
    current_version: u64,
    versions: Table<u64, vector<u8>>,  // version -> blob_id
}
```

**Pros**: Programmatic access, history tracking
**Cons**: More complex

**Option 3: Pointer update**
```move
public struct MutableReference has key {
    id: UID,
    current_blob_id: vector<u8>,  // Updates to point to new blob
}
```

**Pros**: Single reference, updates in place
**Cons**: Lose history (unless tracked separately)

### ✅ Checkpoint: Choose Update Pattern

For each scenario:
1. Smart contract ABI (updates quarterly)
2. User avatar (user changes occasionally)
3. Scientific dataset (major versions annually)

**Which versioning strategy fits best?**

**Pair Discussion**: Justify choices.

---

## Putting It All Together: Design Checklist

### For Every Walrus Project

**1. Data Characterization**
- [ ] Size of typical file?
- [ ] Number of files?
- [ ] Update frequency?
- [ ] Access patterns?

**2. Storage Decisions**
- [ ] Individual blobs or quilts?
- [ ] Initial epochs?
- [ ] Extension strategy?
- [ ] Direct or via publisher?

**3. Architecture**
- [ ] What on Walrus?
- [ ] What on Sui?
- [ ] Hybrid with other systems?
- [ ] Privacy/encryption needed?

**4. Cost Analysis**
- [ ] Encoded size calculated?
- [ ] Storage units estimated?
- [ ] Annual cost acceptable?
- [ ] Optimization opportunities?

**5. Performance Planning**
- [ ] Latency requirements?
- [ ] CDN or caching needed?
- [ ] Parallel upload/download?
- [ ] Aggregator strategy?

**6. Operational Readiness**
- [ ] Epoch monitoring planned?
- [ ] Extension funding secured?
- [ ] Error handling implemented?
- [ ] Backup strategy?

### ✅ Checkpoint: Apply Checklist

Use the checklist for:
- A decentralized photo gallery
- 10,000 users
- 100 photos/user (500 KB each)
- Must last 5 years

**Work through checklist in pairs.**

**Instructor**: Review 2-3 designs as class.

---

## Decision Templates

### Template 1: NFT Collection

**Scenario**: 10,000 NFT collection

**Decisions**:
1. **Blob vs Quilt**: Quilt for metadata, individual for images
2. **Epochs**: 52 epochs (2 years) initially, community extends
3. **Storage**: Images on Walrus, attributes on Sui
4. **Cost**: ~1.5M WAL for 2 years (~$0.30)

### Template 2: Document Archive

**Scenario**: Legal document storage

**Decisions**:
1. **Blob vs Quilt**: Individual blobs (need independent verification)
2. **Epochs**: 260 epochs (10 years) upfront
3. **Storage**: Encrypted documents on Walrus, metadata + keys on Sui
4. **Cost**: ~3.25M WAL for 10 years (~$0.50)

### Template 3: Media Library

**Scenario**: Photo sharing platform

**Decisions**:
1. **Blob vs Quilt**: Quilt for thumbnails, individual for full res
2. **Epochs**: 26 epochs (1 year), extend based on activity
3. **Storage**: Hybrid (Walrus + CDN for hot images)
4. **Cost**: Walrus ~500K WAL/year, CDN ~$50/month

### Template 4: Dataset Distribution

**Scenario**: Scientific dataset (100 GB)

**Decisions**:
1. **Blob vs Quilt**: Multi-part (500 MB chunks)
2. **Epochs**: 104 epochs (4 years) for archival
3. **Storage**: Chunks on Walrus, index on Sui, torrent as backup
4. **Cost**: ~13M WAL for 4 years (~$2)

**💬 Discussion**: Which template is closest to your use case?

---

## Common Decision Mistakes

### Mistake 1: Optimizing Too Early

**What happens**:
- Spend hours optimizing for scale
- Project never reaches scale
- Wasted effort

**Better approach**:
- Start simple
- Use quilts for small files (easy win)
- Optimize when you have real usage data

### Mistake 2: Ignoring Total Cost of Ownership

**What happens**:
- Focus only on Walrus storage costs
- Forget gas costs, infrastructure, monitoring
- Budget overruns

**Better approach**:
- Calculate: Walrus storage + gas + infrastructure + labor
- Factor in epoch extension management time
- Consider monitoring/alerting costs

### Mistake 3: Assuming Performance

**What happens**:
- Expect CDN-like performance from Walrus
- Users complain about slow loads
- Architecture redesign needed

**Better approach**:
- Test with real data and real aggregators
- Measure latency, not assumptions
- Plan caching/CDN if performance critical

### Mistake 4: No Exit Strategy

**What happens**:
- Epochs expire
- No funding for extensions
- Data lost

**Better approach**:
- Plan funding for extensions upfront
- Set up monitoring and alerts
- Have backup/migration plan

### ✅ Checkpoint: Avoid Mistakes

Review a design:
- 1M user app
- 10 GB data/user
- Expects instant loads

**What mistakes might this design make?**

**💬 Group Discussion**: Identify pitfalls.

---

## Key Takeaways

**Decision Frameworks**:
- Blob vs quilt: File size and access patterns
- Epochs: Lifetime requirements and funding
- Direct vs publisher: Volume and user type
- Storage location: Query needs and data size
- Encryption: Privacy requirements
- Cost vs performance: Usage patterns and budget

**Design Principles**:
- Characterize your data first
- Calculate costs before commitment
- Plan for operations (monitoring, extensions)
- Test performance assumptions
- Have backup strategies

**Common Patterns**:
- Hybrid (Sui + Walrus)
- Quilts for small files
- Individual blobs for large files
- Encryption for privacy
- Versioning on Sui
- CDN for hot data, Walrus for cold

**Avoid**:
- Premature optimization
- Ignoring total cost
- Assuming performance
- No operational plan

**Next**: [Hands-On Lab](./06-hands-on-lab.md) - Capstone project applying all lessons
