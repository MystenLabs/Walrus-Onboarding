# Hands-On Lab: Capstone Project

Apply everything you've learned to design a complete Walrus storage solution from requirements to implementation plan.

---

## Lab Overview

**Duration**: 90-120 minutes

**Format**: Individual or pairs

**Deliverable**: Storage plan presentation (5-10 minutes)

**Objective**: Demonstrate your ability to map Walrus capabilities to real solutions by designing a complete, cost-effective storage architecture.

---

## Lab Structure

### Phase 1: Use Case Selection (10 min)

**Choose one** of the provided use cases or propose your own (with instructor approval).

### Phase 2: Requirements Analysis (20 min)

Analyze storage requirements, access patterns, and constraints.

### Phase 3: Architecture Design (30 min)

Design complete solution using Walrus features learned in this course.

### Phase 4: Cost Analysis (20 min)

Calculate storage costs and compare alternatives.

### Phase 5: Implementation Plan (20 min)

Create step-by-step deployment plan with code snippets.

### Phase 6: Presentations (30-60 min)

Present your design to the class (5-10 min each).

---

## Provided Use Cases

### Use Case 1: Decentralized Academic Journal

**Description**: Platform for publishing peer-reviewed research papers with permanent, verifiable record.

**Requirements**:
- 1,000 papers/year published
- Paper PDFs (1-5 MB each)
- Supplementary datasets (10 MB - 1 GB)
- Metadata (author, abstract, keywords, citations)
- Peer review history (must be verifiable)
- Must remain available for 50+ years
- Full-text search needed
- DOI-like permanent identifiers

**Constraints**:
- Grant funding for initial 5 years only
- Authors may fund epoch extensions
- Must comply with academic archival standards

**💬 Discussion Prompts**:
- How do you ensure 50-year availability?
- What goes on Walrus vs Sui?
- How do you handle supplementary datasets of varying sizes?

---

### Use Case 2: Decentralized Social Media Platform

**Description**: Twitter/X alternative with censorship-resistant content storage.

**Requirements**:
- 100,000 active users
- Text posts (up to 500 characters)
- Image attachments (up to 4 images, 2 MB each)
- Video attachments (up to 50 MB)
- User profile pictures (500 KB avg)
- Real-time feed expectations
- Edit capability wanted
- Content can be archived after 1 year

**Constraints**:
- Users expect fast loads (< 1 second)
- Free tier for users (platform pays storage)
- Budget: $1,000/month for storage

**💬 Discussion Prompts**:
- How do you handle performance expectations?
- What's your strategy for "editing" immutable posts?
- How do you optimize costs with budget constraint?

---

### Use Case 3: DAO Governance Archive

**Description**: Permanent record of all DAO proposals, votes, and discussions.

**Requirements**:
- 50 proposals/month
- Proposal documents (1-10 MB PDFs/docs)
- Discussion threads (text, varies)
- Vote records (must be immutable)
- Supporting materials (images, presentations)
- Must prove historical state at any point in time
- Public access (no encryption)
- Indexed by proposal number, date, topic

**Constraints**:
- DAO treasury funds extensions
- Must be auditable and verifiable
- No centralized dependencies

**💬 Discussion Prompts**:
- How do you structure data for historical queries?
- What ensures verifiable voting records?
- How do you handle ongoing funding for epochs?

---

### Use Case 4: Medical Imaging Archive

**Description**: Hospital system storing medical images (X-rays, MRIs, CT scans) with patient privacy.

**Requirements**:
- 10,000 images/month
- DICOM images (5-50 MB each)
- Patient records (linked to images)
- Must retain for 7 years (legal requirement)
- HIPAA compliance (encryption, access control)
- Only authorized doctors can access
- Patients can request their own images
- Audit trail of all access

**Constraints**:
- Privacy is critical (encryption mandatory)
- Performance important for diagnosis
- Cannot risk data loss
- Budget: Hospital pays, cost-conscious

**💬 Discussion Prompts**:
- How do you implement HIPAA-compliant encryption?
- What's your access control strategy?
- How do you ensure availability for 7 years?

---

### Use Case 5: NFT Game Assets

**Description**: Blockchain game with player-owned assets stored as NFTs.

**Requirements**:
- 100,000 NFTs (items, characters, skins)
- Item images (50-200 KB each)
- 3D models for premium items (5-20 MB)
- Metadata (stats, rarity, history)
- New season every 3 months with new assets
- Players trade items on marketplace
- Must prove asset authenticity
- Game evolves, old assets remain valid

**Constraints**:
- Game studio pays initial storage
- Community may fund later
- Performance for in-game loading
- Cost optimization important (100K NFTs)

**💬 Discussion Prompts**:
- Quilts or individual blobs for items?
- How do you handle seasonal updates?
- What proves asset authenticity?

---

### Use Case 6: Scientific Dataset Repository

**Description**: Repository for climate science datasets used in research.

**Requirements**:
- 50 datasets (10 GB - 500 GB each)
- Daily measurements (time series data)
- Researchers query date ranges and regions
- Multiple versions per dataset (corrections/updates)
- Must be citeable in papers
- Collaborative (multiple institutions contribute)
- Download speed important (researchers are impatient)
- Must remain available for decades

**Constraints**:
- NSF grant covers 5 years
- No guaranteed funding after
- International collaboration
- Must be verifiable for reproducibility

**💬 Discussion Prompts**:
- How do you structure large datasets?
- What's your versioning strategy?
- How do you ensure long-term availability without guaranteed funding?

---

### Custom Use Case

**Propose your own** use case with instructor approval.

**Must include**:
- Clear description
- Specific requirements (size, volume, access patterns)
- Constraints (cost, performance, compliance)
- Success criteria

**Instructor approval required before proceeding.**

---

## Phase 1: Use Case Selection (10 min)

### Instructions

1. **Review** all provided use cases
2. **Discuss** with partner (if working in pairs)
3. **Choose** one use case or propose custom
4. **Get approval** from instructor (for custom)

### ✅ Checkpoint 1.1

**Raise your hand** when you've selected your use case.

**Instructor**: Ensure even distribution of use cases across class (if possible).

---

## Phase 2: Requirements Analysis (20 min)

### Instructions

Analyze your chosen use case systematically.

### Analysis Template

**Fill out this template**:

```markdown
## Use Case: [Name]

### Data Characterization
- **Total data volume**: [Calculate initial + annual growth]
- **File sizes**: [Range and distribution]
- **File types**: [PDFs, images, video, etc.]
- **Number of files**: [Initial + growth rate]
- **Update frequency**: [Never, rare, frequent]

### Access Patterns
- **Who accesses**: [Users, applications, public]
- **Access frequency**: [Per day/month/year]
- **Access latency requirements**: [Real-time, eventual, archival]
- **Query patterns**: [By ID, by metadata, full-text search]

### Constraints
- **Retention period**: [Days, years, permanent]
- **Budget**: [Total, per year, unlimited]
- **Performance**: [Critical, moderate, flexible]
- **Compliance**: [Privacy, encryption, audit]
- **Verifiability**: [Required, nice-to-have, not needed]

### Success Criteria
- [What does success look like?]
- [How do you measure it?]
- [What are the must-haves vs nice-to-haves?]
```

### Example: Academic Journal

```markdown
## Use Case: Decentralized Academic Journal

### Data Characterization
- **Total data volume**:
  - Papers: 1,000/year × 3 MB avg = 3 GB/year
  - Datasets: 500/year × 100 MB avg = 50 GB/year
  - Total: ~53 GB/year, 265 GB over 5 years
- **File sizes**: Papers (1-5 MB), datasets (10 MB - 1 GB)
- **File types**: PDFs, CSV, compressed datasets
- **Number of files**: 1,500/year
- **Update frequency**: Never (immutable after publication)

### Access Patterns
- **Who accesses**: Researchers worldwide, general public
- **Access frequency**:
  - New papers: high (100s of downloads/week)
  - Old papers: moderate (10s/week)
  - Datasets: low (few/month)
- **Access latency requirements**: Moderate (a few seconds acceptable)
- **Query patterns**: By DOI, author, keyword, date

### Constraints
- **Retention period**: 50+ years (permanent archive)
- **Budget**: $500/year for storage
- **Performance**: Moderate (researchers tolerate 2-3 second loads)
- **Compliance**: None
- **Verifiability**: Critical (academic integrity)

### Success Criteria
- All papers accessible for 50+ years
- Costs < $500/year
- Verifiable integrity (blob IDs = proof)
- Searchable metadata
- Downloads complete within 10 seconds
```

### ✅ Checkpoint 2.1

**Complete** the requirements analysis template for your use case.

**Pair Activity**: Share analysis with neighboring pair, get feedback.

**Instructor**: Circulate and review analyses, provide guidance.

---

## Phase 3: Architecture Design (30 min)

### Instructions

Design your complete storage architecture.

### Design Template

```markdown
## Architecture Design

### Storage Decisions

**1. Blob vs Quilt**
- [List what goes in quilts and why]
- [List what goes as individual blobs and why]

**2. Walrus vs Sui vs Both**
- **On Walrus**: [List with sizes]
- **On Sui**: [List with gas implications]
- **Justification**: [Why this split?]

**3. Epochs**
- **Initial epochs**: [Number and reasoning]
- **Extension strategy**: [How and when?]
- **Funding plan**: [Who pays? How long?]

**4. Privacy/Encryption**
- **Encrypted**: [What and why?]
- **Public**: [What and why?]
- **Access control**: [How implemented?]

**5. Publisher/Aggregator**
- **Publisher**: [Own, shared, direct? Why?]
- **Aggregator**: [Strategy for reliability?]

### Architecture Diagram

[Draw or describe system architecture]

Example:
```
User Browser
    ↓
Application (Sui queries)
    ↓
Sui (metadata, indexes)
    ↓
Walrus (blobs via aggregator)
```

### Data Flow

**Upload workflow**:
1. [Step 1]
2. [Step 2]
3. [...]

**Download workflow**:
1. [Step 1]
2. [Step 2]
3. [...]

### Scalability Plan

**Year 1**: [Expected data, costs, infrastructure]
**Year 2-5**: [Growth projections]
**Year 5+**: [Long-term sustainability]
```

### Example: Academic Journal

```markdown
## Architecture Design: Academic Journal

### Storage Decisions

**1. Blob vs Quilt**
- **Quilts**:
  - Paper metadata (1 KB each, 1000/year) → ~7 storage units
  - Justification: Massive cost savings (99.98%)
- **Individual blobs**:
  - Paper PDFs (1-5 MB each)
  - Datasets (10 MB - 1 GB)
  - Justification: Size requires individual blobs, independent access

**2. Walrus vs Sui vs Both**
- **On Walrus**:
  - Paper PDFs (~3 GB/year)
  - Supplementary datasets (~50 GB/year)
- **On Sui**:
  - Paper metadata (title, authors, DOI, abstract, keywords)
  - Dataset indexes (chunk manifest for large datasets)
  - Peer review records (verifiable history)
- **Justification**: Sui enables search/discovery, Walrus stores large files

**3. Epochs**
- **Initial epochs**: 260 epochs (10 years)
- **Extension strategy**:
  - Monitoring system alerts 1 year before expiration
  - Author or journal funds extensions
  - Community DAO for orphaned papers
- **Funding plan**:
  - Grant covers 5 years
  - Authors contribute at publication ($1 fee)
  - DAO treasury for long-tail

**4. Privacy/Encryption**
- **Encrypted**: None (open access requirement)
- **Public**: All papers and datasets
- **Access control**: None needed (public good)

**5. Publisher/Aggregator**
- **Publisher**: Shared publisher (low volume, 1000/year)
- **Aggregator**: Multiple aggregators for redundancy
  - Primary: https://aggregator.walrus.space
  - Backup: Self-hosted aggregator
  - Tertiary: Community aggregator

### Architecture Diagram

```
Researcher
    ↓
Journal Web App
    ↓
    ├─→ Sui (search by author, keyword, DOI)
    │   └─→ Returns: Paper metadata + blob_ids
    │
    └─→ Walrus Aggregator
        └─→ Fetch PDF by blob_id
```

### Data Flow

**Upload workflow (submission)**:
1. Author uploads PDF + dataset via web app
2. App uploads PDF to Walrus via publisher → get blob_id
3. If dataset large, chunk and upload parts → get quilt_id or blob_ids
4. App creates Paper object on Sui with metadata + blob_ids
5. Assign DOI (maps to Sui object ID)
6. Publication complete

**Download workflow**:
1. User searches by keyword on Sui
2. App queries Sui, returns list of papers
3. User clicks paper
4. App fetches PDF from Walrus using blob_id
5. Display PDF in browser

### Scalability Plan

**Year 1**:
- 1,000 papers × 3 MB = 3 GB
- ~15 storage units
- Cost: 15 × 500 × 260 = 1,950,000 WAL (~$0.40) for 10 years

**Year 2-5**:
- 4,000 more papers = 12 GB
- ~60 storage units
- Additional: 60 × 500 × 260 = 7,800,000 WAL (~$1.60)

**Total 5 years**: ~$2 for 5 GB permanent storage

**Year 5+**:
- DAO funded extensions
- Author publication fees fund new papers
- Sustainable model
```

### ✅ Checkpoint 3.1

**Complete** architecture design template.

**Instructor**: Review 2-3 designs, discuss alternatives.

**💬 Group Discussion**: Compare blob vs quilt decisions across different use cases.

---

## Phase 4: Cost Analysis (20 min)

### Instructions

Calculate detailed storage costs for your design.

### Cost Calculation Template

```markdown
## Cost Analysis

### Encoded Size Calculation

**Component 1: [Name]**
- Raw size: [X MB/GB]
- Erasure coding (5x): [5X MB/GB]
- Storage units: ceil([encoded] / 1 MiB) = [N units]

**Component 2: [Name]**
- ...

**Total storage units**: [Sum]

### Epoch Costs

**Per epoch**:
- [N] storage units × 500 WAL = [Total] WAL

**Annual** (26 epochs):
- [Per epoch] × 26 = [Annual] WAL

**Total commitment** ([X] years):
- [Annual] × [X years] = [Total] WAL

### Cost in USD

**Conversion** (approximate):
- [Total WAL] × $0.0000002 ≈ $[Amount]

### Cost Comparison

Compare to traditional alternatives:

| Solution | Setup | Annual | 5-Year Total |
|----------|-------|--------|--------------|
| Walrus | $0 | $[X] | $[Y] |
| AWS S3 | $0 | $[X] | $[Y] |
| Google Cloud | $0 | $[X] | $[Y] |
| Dedicated server | $[X] | $[X] | $[Y] |

**Winner**: [Walrus/Alternative and why]

### Optimization Opportunities

**Current design**: [Cost]

**Optimizations considered**:
1. [Option 1]: [Savings, trade-offs]
2. [Option 2]: [Savings, trade-offs]

**Chosen optimizations**: [Which and why]

**Optimized cost**: [New cost]
```

### Example: Academic Journal

```markdown
## Cost Analysis: Academic Journal

### Encoded Size Calculation

**Component 1: Paper PDFs**
- Raw size: 5,000 papers × 3 MB = 15,000 MB = 15 GB
- Erasure coding (5x): 15 GB × 5 = 75 GB
- Storage units: ceil(75 GB / 1 MiB) = 76,800 MB / 1 MiB ≈ 75 units

**Component 2: Datasets (5 years)**
- Raw size: 2,500 datasets × 100 MB avg = 250 GB
- Erasure coding (5x): 250 GB × 5 = 1,250 GB
- Storage units: 1,250 GB / 1 MiB ≈ 1,250 units

**Component 3: Metadata Quilt**
- Raw size: 5,000 metadata × 1 KB = 5 MB
- As quilt (666 metadata per quilt): 8 quilts
- Each quilt ~1.3 MB encoded → 8 × 7 units = 56 units

**Total storage units**: 75 + 1,250 + 56 = 1,381 units

### Epoch Costs

**Per epoch**:
- 1,381 units × 500 WAL = 690,500 WAL

**Annual** (26 epochs):
- 690,500 × 26 = 17,953,000 WAL

**Total commitment** (10 years = 260 epochs):
- 1,381 × 500 × 260 = 179,530,000 WAL

### Cost in USD

**Conversion**:
- 179,530,000 WAL × $0.0000002 ≈ $36

**Cost per paper**: $36 / 5,000 papers = $0.007 per paper

### Cost Comparison

| Solution | Setup | Annual | 10-Year Total |
|----------|-------|--------|---------------|
| Walrus | $0 | $3.60 | $36 |
| AWS S3 (Standard) | $0 | $69 | $690 |
| AWS S3 (Glacier) | $0 | $12 | $120 |
| Dedicated server | $1,000 | $600 | $7,000 |

**Winner**: Walrus by far! 19x cheaper than Glacier, 194x cheaper than dedicated.

### Optimization Opportunities

**Current design**: $36 for 10 years

**Optimizations considered**:
1. **Store metadata on Sui instead of quilt**:
   - Savings: ~$0.10
   - Trade-offs: Gas costs may be higher
   - Decision: Keep quilt (simpler)

2. **Shorter initial epochs, extend as needed**:
   - Savings: Lower upfront commitment
   - Trade-offs: More management, gas costs, risk of forgetting
   - Decision: Use 260 epochs (peace of mind)

3. **Compress PDFs before upload**:
   - Savings: ~20% size reduction → ~$7 saved
   - Trade-offs: Processing time, quality
   - Decision: ✅ Implement compression

**Chosen optimizations**: PDF compression

**Optimized cost**: $36 - $7 = $29 for 10 years
```

### ✅ Checkpoint 4.1

**Complete** cost analysis for your design.

**Pair Activity**: Compare costs with another pair, discuss optimizations.

**Instructor**: Show cost comparison across all use cases on whiteboard.

---

## Phase 5: Implementation Plan (20 min)

### Instructions

Create step-by-step deployment plan with code.

### Implementation Plan Template

```markdown
## Implementation Plan

### Prerequisites

**Tools needed**:
- [ ] Walrus CLI installed
- [ ] Sui CLI installed
- [ ] Wallet with SUI and WAL tokens
- [ ] [Other tools]

**Infrastructure**:
- [ ] Publisher (if applicable)
- [ ] Aggregator access
- [ ] [Other infrastructure]

### Step 1: [Name]

**What**: [Description]

**How**:
```bash
# Commands
walrus ...
```

**Verification**:
```bash
# How to verify this step worked
```

**Expected output**: [What should you see?]

### Step 2: [Name]

...

### Error Handling

**Common errors**:
1. **Error**: [Error message]
   **Cause**: [Why it happens]
   **Fix**: [How to resolve]

### Monitoring Plan

**What to monitor**:
- Epoch expiration (alert X days before)
- Storage costs
- [Other metrics]

**Tools**: [Cron jobs, monitoring services, etc.]

### Testing Plan

**Test 1**: [What to test]
- **Steps**: [How to test]
- **Expected**: [What should happen]

**Test 2**: ...

### Deployment Checklist

- [ ] Upload test data
- [ ] Verify retrieval
- [ ] Set up monitoring
- [ ] Fund wallet for extensions
- [ ] Document blob IDs
- [ ] Backup index
- [ ] [Other tasks]
```

### Example: Academic Journal (Abbreviated)

```markdown
## Implementation Plan: Academic Journal

### Prerequisites

**Tools needed**:
- [x] Walrus CLI installed
- [x] Sui CLI installed
- [x] Wallet with 100,000 WAL, 10 SUI
- [x] Node.js (for automation scripts)

**Infrastructure**:
- [x] Access to shared publisher at https://publisher.walrus.space
- [x] Sui smart contract deployed (Paper management)

### Step 1: Upload First Paper PDF

**What**: Upload paper PDF to Walrus, get blob ID

**How**:
```bash
# Upload paper
walrus store paper-001.pdf --epochs 260

# Expected output
# Storing file: paper-001.pdf
# Blob ID: 057MX9P4aF3kL...
# Epochs: 260
# Expiration: Epoch 310
```

**Verification**:
```bash
# Fetch blob info
walrus blob-info 057MX9P4aF3kL...

# Should show:
# Status: Available
# Size: 3145728 bytes
# End epoch: 310
```

**Expected output**: Blob ID to use in Step 2

### Step 2: Create Paper Object on Sui

**What**: Store paper metadata on Sui with blob ID reference

**How**:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module journal \
  --function publish_paper \
  --args \
    "Climate Change in the Arctic" \
    "['Dr. Alice', 'Dr. Bob']" \
    "10.5281/walrus.12345" \
    "057MX9P4aF3kL..." \
    "['climate', 'arctic', 'science']" \
  --gas-budget 10000000
```

**Verification**:
```bash
# Query paper object
sui client object <PAPER_OBJECT_ID>

# Should show metadata + blob_id field
```

**Expected output**: Paper object ID (serves as permanent reference)

### Step 3: Upload Supplementary Dataset (Large)

**What**: Split large dataset into chunks, upload as multi-part

**How**:
```bash
# Split dataset
split -b 100M dataset-001.csv chunks/chunk_

# Upload chunks in parallel
ls chunks/* | parallel -j 8 'walrus store {} --epochs 260'

# Create index
cat > dataset-index.json <<EOF
{
  "dataset_id": "dataset-001",
  "chunks": [
    {"index": 0, "blob_id": "abc123..."},
    {"index": 1, "blob_id": "def456..."}
  ]
}
EOF

# Upload index
walrus store dataset-index.json --epochs 260
```

**Verification**:
```bash
# Test reassembly
for chunk in chunks/*; do
  blob_id=$(jq ".chunks[] | select(.index == $i) | .blob_id" dataset-index.json)
  curl https://aggregator.walrus.space/v1/$blob_id > $chunk.downloaded
done

cat chunks/*.downloaded > dataset-reassembled.csv
diff dataset-001.csv dataset-reassembled.csv  # Should be identical
```

### Step 4: Create Metadata Quilt

**What**: Batch upload metadata for multiple papers

**How**:
```bash
# Prepare metadata files (one per paper)
for i in {1..1000}; do
  cat > metadata/paper-$i.json <<EOF
{
  "title": "Paper $i",
  "authors": ["Author A"],
  "doi": "10.5281/walrus.$i",
  "keywords": ["keyword1"]
}
EOF
done

# Upload as quilt
walrus store-quilt --paths metadata/*.json --epochs 260
```

**Expected output**: Quilt ID and mapping of file to index

### Step 5: Set Up Epoch Monitoring

**What**: Automated monitoring for epoch expiration

**How**:
```javascript
// monitor.js
const CRITICAL_BLOBS = ['057MX9P...', 'abc123...'];
const ALERT_THRESHOLD = 26; // Alert 6 months before expiration

async function checkEpochs() {
  const currentEpoch = await getCurrentEpoch();

  for (const blobId of CRITICAL_BLOBS) {
    const info = await walrus.blobInfo(blobId);
    const remaining = info.endEpoch - currentEpoch;

    if (remaining < ALERT_THRESHOLD) {
      console.log(`⚠️  ALERT: ${blobId} expires in ${remaining} epochs`);
      await sendEmail(`Extend blob ${blobId}`);
    }
  }
}

// Run daily
setInterval(checkEpochs, 24 * 60 * 60 * 1000);
```

**Verification**: Trigger alert by setting threshold high, verify email sent

### Error Handling

**Common errors**:

1. **Error**: "Insufficient balance"
   **Cause**: Wallet doesn't have enough WAL
   **Fix**: `walrus buy-tokens --amount 100000`

2. **Error**: "Blob not found on aggregator"
   **Cause**: Aggregator hasn't cached blob yet
   **Fix**: Wait 30-60 seconds and retry

3. **Error**: "Transaction failed: gas budget exceeded"
   **Cause**: Sui gas budget too low
   **Fix**: Increase `--gas-budget` to 20000000

### Monitoring Plan

**What to monitor**:
- Epoch expiration (alert 26 epochs before)
- Wallet balance (alert if < 10,000 WAL)
- Upload success rate
- Aggregator availability

**Tools**:
- Custom Node.js script (above)
- Walrus CLI in cron job
- Uptime monitoring for aggregator

### Testing Plan

**Test 1**: Upload and retrieve paper
- Upload test PDF
- Fetch via aggregator
- Compare checksums
- ✅ Pass if identical

**Test 2**: Search metadata on Sui
- Create paper object
- Query by keyword
- Verify results
- ✅ Pass if found

**Test 3**: Multi-part dataset
- Upload 5-chunk dataset
- Download and reassemble
- Verify integrity
- ✅ Pass if diff clean

### Deployment Checklist

- [ ] Upload 10 test papers
- [ ] Verify retrieval from 3 aggregators
- [ ] Set up epoch monitoring (test alert)
- [ ] Fund wallet with 200,000 WAL (buffer)
- [ ] Document all blob IDs in database
- [ ] Backup index and metadata locally
- [ ] Deploy Sui smart contracts to mainnet
- [ ] Create runbook for epoch extensions
- [ ] Train team on wallet management
```

### ✅ Checkpoint 5.1

**Complete** implementation plan for your use case.

**Instructor**: Review one plan in detail, discuss deployment best practices.

---

## Phase 6: Presentations (30-60 min)

### Instructions

Present your storage plan to the class.

### Presentation Format

**Time**: 5-10 minutes per team

**Structure**:
1. **Use Case** (1 min): What are you building?
2. **Requirements** (1 min): Key constraints and needs
3. **Architecture** (2-3 min): How you're solving it
4. **Costs** (1-2 min): What it costs and why
5. **Interesting Decisions** (1-2 min): Key trade-offs you made
6. **Q&A** (2-3 min): Class questions

### Presentation Tips

**Do**:
- ✅ Focus on WHY you made decisions, not just WHAT
- ✅ Highlight trade-offs you considered
- ✅ Share lessons learned or surprises
- ✅ Use your architecture diagram
- ✅ Be ready to defend design choices

**Don't**:
- ❌ Read code line by line
- ❌ Assume everyone knows your use case details
- ❌ Skip the cost analysis
- ❌ Ignore performance or operational concerns

### ✅ Checkpoint 6.1

**Prepare** 3-5 slides or notes for presentation.

**Instructor**: Set presentation order, manage time strictly.

---

## Peer Review

### During Presentations

**For each presentation**, evaluate:

**Architecture** (1-5 stars):
- Are design decisions justified?
- Is the architecture complete?
- Are Walrus features used appropriately?

**Cost Analysis** (1-5 stars):
- Are calculations correct?
- Are optimizations identified?
- Is cost comparison fair?

**Implementation** (1-5 stars):
- Is plan executable?
- Are errors considered?
- Is monitoring planned?

**Interesting Questions**:
- What's one thing you'd challenge or change?
- What's one thing you'd steal for your own design?

### ✅ Checkpoint 6.2

**After all presentations**, vote:
- Most cost-effective design
- Most innovative architecture
- Best operational plan

**Instructor**: Facilitate discussion of winning designs.

---

## Instructor Feedback

### Assessment Rubric

**Requirement Analysis** (20 points):
- Comprehensive data characterization
- Realistic access patterns
- Clear constraints identified

**Architecture Design** (30 points):
- Appropriate use of blobs vs quilts
- Smart Walrus/Sui split
- Thoughtful epoch planning
- Privacy/encryption where needed

**Cost Analysis** (20 points):
- Accurate calculations
- Realistic comparisons
- Optimization opportunities identified

**Implementation Plan** (20 points):
- Step-by-step clarity
- Code snippets provided
- Error handling considered
- Monitoring planned

**Presentation** (10 points):
- Clear communication
- Defended decisions
- Engaged with questions

**Total**: 100 points

### ✅ Checkpoint 6.3

**Instructor**: Provide written feedback to each team (can be after class).

---

## Reflection Questions

**After completing the lab**, reflect:

1. What Walrus feature was most valuable for your use case?
2. What constraint drove your design most (cost, performance, compliance)?
3. What surprised you during cost analysis?
4. If you had 10x more budget, what would you change?
5. If you had to launch this in production, what would you need to learn more about?

**💬 Group Discussion**: Share reflections as a class.

---

## Key Takeaways

**You've successfully**:
- ✅ Analyzed real-world storage requirements
- ✅ Mapped Walrus capabilities to solutions
- ✅ Made informed design decisions (blobs, quilts, epochs)
- ✅ Calculated accurate storage costs
- ✅ Created executable implementation plans
- ✅ Communicated technical designs clearly

**You're now prepared to**:
- Design production Walrus storage solutions
- Evaluate trade-offs confidently
- Optimize for cost and performance
- Deploy and operate Walrus-based systems

---

## Next Steps

**Congratulations!** You've completed the Walrus Training Program.

**Continue learning**:
1. Build your capstone project for real
2. Contribute to Walrus community
3. Explore advanced topics (custom aggregators, publisher deployment)
4. Join Walrus Discord for ongoing support

**Resources**:
- Walrus Documentation: https://docs.walrus.site
- Walrus GitHub: https://github.com/MystenLabs/walrus-docs
- [Community Discord](https://discord.com/invite/sui)
- [Office Hours](https://cal.com/forms/08983b87-8001-4df6-896a-0d7b60acfd79)]

**Stay curious, keep building!** 🚀
