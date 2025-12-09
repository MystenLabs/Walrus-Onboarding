# Instructor's Guide: Module 11 - Quilts: Batch Storage in Walrus

## Quick Reference

**Total Time:** 75-90 minutes
**Difficulty:** Intermediate
**Hands-on Components:** Lab 4 - Create and retrieve a quilt (30-45 min)
**Materials Needed:** Walrus CLI, TypeScript environment (optional), whiteboard for diagrams

**Key Takeaways:**
- Quilts provide up to **413x cost savings** for storing small blobs (<1MB) by sharing overhead
- QuiltPatchId is compositional (quilt_id + patch_id) - same file in different quilts has different IDs
- Maximum 666 blobs per QuiltV1, with 64KB limits on identifiers and total tags
- Individual patches can be retrieved without downloading the entire quilt (sliver alignment)
- Quilts are immutable: cannot delete, extend, or share individual patches

## Prerequisites

### For Students

- Completed CLI or SDK/Upload Relay curriculum modules
- Working knowledge of Walrus CLI commands (`store`, `read`, `blob-status`)
- Basic understanding of TypeScript/JavaScript (if using SDK examples)
- A funded Testnet wallet with SUI + WAL tokens
- Understanding of blob storage costs and epochs

### For Instructor

- Deep understanding of Walrus storage costs (per-object overhead vs. per-byte cost)
- Familiarity with quilt encoding structure (`crates/walrus-core/src/encoding/quilt_encoding.rs`)
- Comfort with both CLI (`store-quilt`) and SDK (`writeFiles`/`writeFilesFlow`) workflows
- Ability to explain "sliver alignment" and why it matters for partial retrieval
- Prepared demo environment with sample small files (images, JSON, text, CSV)

## Classroom Setup

**Advance Prep (15 min before class):**
- [ ] Verify Walrus CLI is installed and configured for testnet
- [ ] Prepare sample files directory (5-10 small files of different types)
- [ ] Test `store-quilt` and `list-patches-in-quilt` commands work
- [ ] Ensure students have funded wallets (SUI + WAL)
- [ ] Queue up cost comparison table for display
- [ ] Prepare whiteboard space for quilt structure diagrams

**Optional Materials:**
- Grid paper or physical blocks to demonstrate 2D matrix structure
- Pre-created quilt ID for demonstration (if testnet is slow)
- Sample log outputs for troubleshooting demonstrations

## Instructor Cheat Sheet

1. **What Quilts Solve (12-15 min):** Cost savings (413x for 10KB) | Gas efficiency (1 tx vs 666) | Use case decision framework
2. **How Data Is Linked (12-15 min):** 2D matrix structure | QuiltPatchId is compositional | Sliver alignment for partial reads
3. **Creation Process (15-18 min):** `--paths` vs `--blobs` (mutually exclusive) | SDK `writeFiles` | Limits (666 blobs, 64KB metadata)
4. **Retrieval Process (12-15 min):** By identifier (most common) | By tag | By PatchId | `list-patches-in-quilt` essential
5. **Real Examples (8-10 min):** NFT collections | Static websites | Game assets | Hybrid CLI + SDK approaches
6. **Typical Mistakes (10-12 min):** ⚠️ Duplicate identifiers (#1 error) | Wrong ID type | Individual deletion impossible
7. **Hands-On Lab (30-45 min):** Create 5-file quilt → List patches → Retrieve by identifier → Retrieve by tag → Verify

---

## Section-by-Section Guidance

### Section 1: What Quilts Solve (12-15 min)
**Student Material:** `01-what-quilts-solve.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Cost Savings**: Up to **413x cheaper** for 10KB files due to shared overhead
- **Gas Efficiency**: One Sui transaction for up to 666 files vs. 666 individual transactions
- **238x Sui gas savings**: Consolidating transactions has massive impact
- **Decision Framework**: Use the flowchart to decide quilts vs. regular blobs
- **When NOT to use**: Large files (>10MB), dynamic collections, individual deletion needed

💡 **Teaching Tips:**
- Start with the cost comparison table - the numbers are dramatic and grab attention
- Ask students to calculate: "What would it cost to store 1000 NFT images (50KB each) individually vs. as quilts?"
  - Answer: ~1044 WAL individual vs. ~6.2 WAL as 2 quilts = **168x savings**
- Use the "robotic warehouse" analogy: Quilts are like shipping a pallet of boxes instead of 666 individual packages
- Walk through the decision flowchart with real scenarios:
  - "User profile pictures for a social app" → Yes (static, same lifecycle)
  - "User chat attachments they can delete" → No (individual deletion needed)

⚠️ **Common Misconceptions:**
- Students may think quilts are just "zip files" - clarify individual patches are retrievable without downloading all
- May assume cost savings apply to large files too - overhead matters less for large blobs
- Could think 666 limit is arbitrary - explain it's derived from network parameters (n=1000, f=333)

💬 **Discussion Points:**
- "Why does a 10KB blob cost almost the same as a 100KB blob in regular storage?"
  - **Answer:** Fixed overhead (Sui objects, erasure coding structures, Merkle proofs) dominates for small files
- "When would you choose regular blobs even for small files?"
  - **Answer:** Need individual deletion, different expiration times, content-addressable IDs, or frequently changing collection
- "What's the break-even point where quilts stop being beneficial?"
  - **Answer:** Roughly >10MB files or <50 files - overhead becomes negligible

✅ **Quick Check:**
- "What is the maximum number of blobs in a QuiltV1?" (666)
- "Why is the gas savings (238x) even larger than the storage savings (413x)?"
  - Answer: Each blob requires multiple Sui transactions; quilts consolidate to one set
- Ask 2-3 students: "Give me a use case where quilts make sense and one where they don't"

**Transition to Next Section:**
"Now that you understand WHY quilts exist, let's look at HOW they're structured internally."

---

### Section 2: How Data Is Linked (12-15 min)
**Student Material:** `02-how-data-is-linked.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Quilt Structure**: 2D matrix - rows are symbols (from RedStuff), columns are slivers
- **QuiltIndex**: First column contains metadata (version, index, patch locations)
- **QuiltPatchId = QuiltBlobId + PatchInternalId**: Compositional, NOT content-addressed
- **Critical insight**: Same file content in two different quilts has DIFFERENT IDs
- **Sliver Alignment**: Patches align with sliver boundaries for efficient partial reads

💡 **Teaching Tips:**
- Draw the 2D matrix structure on whiteboard:
  ```
  Col0 (Index) | Col1 (Patch A) | Col2 (Patch B) | Col3 (Patch C)
  Row0:  [Ver] |     [Data]     |     [Data]     |     [Data]
  Row1:  [Idx] |     [Data]     |     [Data]     |     [Data]
  ...
  ```
- Emphasize the "address" analogy for QuiltPatchId:
  - BlobId = "123 Main Street" (the building)
  - QuiltPatchId = "123 Main Street, Apartment 5B" (specific unit)
- Show visually why retrieving one patch doesn't require downloading all:
  - Client fetches QuiltIndex (Col0) → Finds patch location → Fetches only needed slivers

⚠️ **Common Misconceptions:**
- Students often think QuiltPatchId is content-derived like BlobId - emphasize it's LOCATION-based
- May assume deduplication works across quilts - same content has different IDs in different quilts
- Could think the QuiltIndex is on-chain - it's stored IN the quilt blob itself

💬 **Discussion Points:**
- "If I move a file from Quilt A to Quilt B, does its ID change?"
  - **Answer:** Yes! QuiltPatchId depends on the quilt composition
- "Why does Walrus use sliver alignment instead of byte offsets?"
  - **Answer:** Slivers are the unit storage nodes manage - alignment enables efficient partial retrieval from the network
- "Where is the identifier string (e.g., 'my-photo.jpg') stored?"
  - **Answer:** In the QuiltIndex, which is encoded in the first column of the quilt

✅ **Quick Check:**
- Draw two boxes representing two quilts, show same file in each, ask: "Same ID or different?" (Different)
- "How does sliver alignment enable 'random access' in a distributed system?"
- "What's stored in the QuiltIndex?" (Patch locations, identifiers, tags, version byte)

**If Time Permits:**
- Discuss the 64KB limits: "Why u16 for identifier and tag lengths?" (Practical limit balancing flexibility vs. index size)
- Show the actual BCS encoding from `ts-sdks/packages/walrus/src/utils/bcs.ts`

**Transition to Next Section:**
"Now that you understand the structure, let's create some quilts!"

---

### Section 3: Creation Process (15-18 min)
**Student Material:** `03-creation-process.md`

⏱️ **Duration:** 15-18 minutes

🎯 **Key Points to Emphasize:**
- **CLI Methods**:
  - `--paths`: Simple, recursive, auto-identifiers from filenames
  - `--blobs`: Advanced, custom identifiers and tags via JSON
  - **Mutually Exclusive**: Cannot use both together!
- **SDK Methods**:
  - `writeFiles()`: Simple one-step method
  - `writeFilesFlow()`: Advanced with control over register/upload/certify steps
- **Hard Limits**:
  - Max 666 blobs per quilt
  - Max 64KB per identifier
  - Max 64KB total tags size
- **Dry Run**: Always use `--dry-run` first to estimate costs

💡 **Teaching Tips:**
- Live code a CLI `store-quilt` with `--paths` for a demo directory
- Show the JSON structure for `--blobs`:
  ```json
  {"path":"./file.txt","identifier":"my-id","tags":{"key":"value"}}
  ```
- Demonstrate common naming strategies:
  - Use full paths for uniqueness: `"api/config.json"` vs `"web/config.json"`
  - Use prefixes: `"user-123-profile.jpg"`
- Show dry-run output and explain cost breakdown

⚠️ **Common Misconceptions:**
- Students try to use `--paths` and `--blobs` together - immediate error
- May assume identifiers can be anything - must start with alphanumeric, no trailing whitespace
- Could think tags are unlimited - 64KB TOTAL for all tags combined
- Might not realize dry-run is essential for cost estimation

💬 **Discussion Points:**
- "Can I use `--paths` and `--blobs` together?" (No - mutually exclusive)
- "What happens if I have two files named `config.json` in different subdirectories when using `--paths`?"
  - **Answer:** Error! Filenames become identifiers, and identifiers must be unique
- "When would you use `writeFilesFlow()` instead of `writeFiles()`?"
  - **Answer:** Progress tracking, custom error handling, debugging, staged uploads

✅ **Quick Check:**
- "What's the maximum number of blobs you can put in one quilt?" (666)
- "If identifier is not specified in `--blobs`, what is used?" (Filename)
- Show JSON: `{"path":"./file.txt"}` - "Is this valid? What's the identifier?" (Yes, identifier is "file.txt")

**Demonstration:**
```bash
# Create sample files
mkdir -p demo-quilt
echo "Hello" > demo-quilt/hello.txt
echo '{"test": true}' > demo-quilt/config.json

# Store as quilt (dry-run first!)
walrus store-quilt --dry-run --epochs 5 --paths ./demo-quilt/

# If costs look good, store for real
walrus store-quilt --epochs 5 --paths ./demo-quilt/
```

**Transition to Next Section:**
"Great, now we have a quilt! Let's learn how to get data back out of it."

---

### Section 4: Retrieval Process (12-15 min)
**Student Material:** `04-retrieval-process.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Key insight**: Retrieving a patch does NOT download the whole quilt
- **Four retrieval methods**:
  1. **By Identifier**: Most common - `--identifiers config.json`
  2. **By Tag**: Bulk retrieval - `--tag category images`
  3. **By QuiltPatchId**: Direct access - `--quilt-patch-ids <PATCH_ID>`
  4. **All patches**: No filter - downloads everything
- **Essential command**: `list-patches-in-quilt` - shows what's inside before downloading
- **Performance**: Individual patch retrieval is as fast as regular blob retrieval

💡 **Teaching Tips:**
- Demonstrate `list-patches-in-quilt` FIRST - always explore before retrieving
- Show the output format with identifiers, tags, and QuiltPatchIds
- Contrast `walrus read <QuiltId>` (downloads entire quilt) vs `walrus read-quilt --identifiers` (selective)
- Explain the client-side flow:
  1. Fetch QuiltIndex (first column)
  2. Parse to find patch location
  3. Calculate required slivers
  4. Fetch ONLY those slivers
  5. Decode and return patch data

⚠️ **Common Misconceptions:**
- 🚨 Students try `walrus read <QuiltPatchId>` - this FAILS! Must use `read-quilt`
- May think tag queries are server-side - they're client-side (fetch index, filter locally)
- Could assume retrieving by tag downloads patches one by one - it can batch requests

💬 **Discussion Points:**
- "Which command downloads the entire quilt file?"
  - **Answer:** `walrus read <QuiltBlobId>` OR `walrus read-quilt` with no filters
- "How do I download all files with `category=images`?"
  - **Answer:** `walrus read-quilt --quilt-id <ID> --tag category images`
- "What happens if I request an identifier that doesn't exist?"
  - **Answer:** Error: "Patch with identifier 'X' not found in quilt"

✅ **Quick Check:**
- "What's the first thing you should do before retrieving from a quilt?" (List patches to see what's inside)
- "True or False: `walrus read <QuiltPatchId>` retrieves a single patch" (False - must use `read-quilt`)
- Scenario: "You have a quilt with 100 files, each tagged with `format=png` or `format=jpg`. How do you download only PNGs?"

**Demonstration:**
```bash
# First, list what's in the quilt
walrus list-patches-in-quilt <QUILT_ID>

# Retrieve by identifier
mkdir -p downloads
walrus read-quilt --out ./downloads/ --quilt-id <QUILT_ID> --identifiers hello.txt

# Retrieve by tag
walrus read-quilt --out ./downloads/ --quilt-id <QUILT_ID> --tag type document
```

**Transition to Next Section:**
"Let's look at some real-world examples of how quilts are used in production."

---

### Section 5: Real Examples (8-10 min)
**Student Material:** `05-real-examples.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **NFT Collections**: Metadata tagging for rarity/traits, batch upload of images
- **Static Websites**: Directory structure → identifiers, HTML/CSS/JS files
- **Game Assets**: Level-based tags for on-demand loading
- **Hybrid Approaches**: CLI for admin/setup, SDK for application integration

💡 **Teaching Tips:**
- Walk through the NFT example: "How would you query all 'legendary' items?"
  - Store with tags: `{"rarity": "legendary", "type": "image"}`
  - Retrieve: `--tag rarity legendary`
- Show the static website pattern:
  - Identifiers mirror file paths: `index.html`, `css/main.css`, `js/app.js`
  - Tags for content type: `{"type": "page"}`, `{"type": "asset"}`
- Discuss automation: "How would this fit in a CI/CD pipeline?"
  - Build site → Upload as quilt → Store QuiltId in config → App fetches from quilt

⚠️ **Common Misconceptions:**
- Students may think quilts replace content management systems - they're storage, not CMS
- Could assume MIME types are handled automatically - application must manage

💬 **Discussion Points:**
- "In the NFT example, how do we query all 'legendary' items?"
  - **Answer:** `--tag rarity legendary`
- "How does the static site example handle serving with correct MIME types?"
  - **Answer:** Application determines from file extension or stores as tag
- "Would you use quilts for a frequently-updated blog?"
  - **Answer:** Probably not - would need to recreate entire quilt for each post

✅ **Quick Check:**
- "Give me a tag schema for a music player app storing songs"
  - Example: `{"artist": "...", "album": "...", "genre": "...", "year": "..."}`
- "When would you use CLI vs SDK in a real application?"

**Transition to Next Section:**
"Before the hands-on lab, let's cover the common mistakes so you can avoid them."

---

### Section 6: Typical Mistakes (10-12 min)
**Student Material:** `06-typical-mistakes.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**
1. **Duplicate Identifiers**: #1 error - identifiers MUST be unique within quilt
2. **Wrong ID Type**: Using `walrus read <QuiltPatchId>` fails - must use `read-quilt`
3. **Individual Operations**: Cannot delete/extend/share individual patches
4. **Metadata Limits**: 64KB identifier, 64KB total tags
5. **Mixing Flags**: `--paths` and `--blobs` are mutually exclusive
6. **Async Handling**: Forgetting `await` in SDK code

💡 **Teaching Tips:**
- **Live demonstration of errors** - intentionally trigger them:
  ```bash
  # Duplicate identifier error
  walrus store-quilt --epochs 5 \
    --blobs '{"path":"a.txt","identifier":"config"}' \
            '{"path":"b.txt","identifier":"config"}'
  # Error: Duplicate identifier 'config' in quilt
  ```
- Show the "wrong command" error:
  ```bash
  walrus read <QuiltPatchId>
  # Error or unexpected behavior - downloads entire quilt or fails
  ```
- Emphasize the "Prevention Checklist" at the end of the section

⚠️ **Common Misconceptions:**
- Students think they can delete a single patch - quilts are all-or-nothing
- May assume content deduplication works - same content in different quilts = different IDs
- Could think large metadata is okay if split across patches - 64KB is TOTAL for all patches

💬 **Discussion Points:**
- "Why can't I delete a single patch from a quilt?"
  - **Answer:** Quilts are immutable blobs. The QuiltIndex references all patches. Removing one would require recreating the entire quilt.
- "What happens if I try to store a 1MB JSON object in a tag?"
  - **Answer:** Error: Total tags size exceeds 64KB limit
- "Can I extend the expiration of just one file in a quilt?"
  - **Answer:** No - operations apply to the entire quilt

✅ **Quick Check:**
- "What's the #1 most common error when creating quilts?" (Duplicate identifiers)
- "True or False: I can use `walrus delete --blob-id <QuiltPatchId>`" (False - can only delete entire quilt)
- "Show of hands: Who knows why `--paths` and `--blobs` can't be used together?"

**If Time Permits:**
- Walk through the validation code patterns in the curriculum
- Discuss error handling strategies for production applications

**Transition to Hands-On:**
"Alright, you're ready for the hands-on lab! Let's put all this into practice."

---

### Section 7: Hands-On Lab (30-45 min)
**Student Material:** `07-hands-on.md`

⏱️ **Duration:** 30-45 minutes

🎯 **Key Points to Emphasize:**
- **End-to-end flow**: Create files → Store quilt → List patches → Retrieve partial → Verify content
- **Multiple retrieval methods**: Test identifier, tag, and patch ID approaches
- **Verification**: Content integrity check proves data matches original
- **Flexibility**: Lab can be done via CLI or TypeScript SDK

💡 **Teaching Tips:**
- **Walk through Part 1-2 together** (file creation and quilt storage)
- Let students work independently on Parts 3-7 (retrieval methods)
- Have students pair up for troubleshooting
- Circulate and check progress at key milestones:
  - Checkpoint 1: Quilt created successfully (Part 2)
  - Checkpoint 2: `list-patches-in-quilt` shows 5 patches (Part 3)
  - Checkpoint 3: Identifier retrieval works (Part 4)
  - Checkpoint 4: Tag retrieval returns correct count (Part 5)
- For faster students: Challenge them to try the TypeScript SDK approach

**Common Issues During Lab:**

| Issue | Solution |
|-------|----------|
| "Duplicate identifier" error | Check for duplicate filenames in paths |
| "Insufficient funds" error | Use `walrus get-wal` to exchange SUI for WAL |
| `read-quilt` "No such file or directory" | Create output directory first with `mkdir -p` |
| Wrong network (mainnet vs testnet) | Use `--config` to specify testnet config |
| QuiltPatchId not working | Use `read-quilt --quilt-patch-ids`, not `read` |

**Verification Script:**
Encourage students to run the verify script to check their work:
```bash
./verify-lab.sh <QUILT_ID>
```

⚠️ **Common Misconceptions During Lab:**
- Students may try to use `walrus read` for patches - remind them: `read-quilt` only
- Might forget to create output directories before `read-quilt`
- Could use mainnet config by accident - verify network with `walrus info`

💬 **Discussion Points (during wrap-up):**
- "What surprised you about working with quilts?"
- "Where did you get stuck, and how did you solve it?"
- "How would you apply quilts to a project you're working on?"

✅ **Quick Check (at end of lab):**
- "How many patches did you successfully store?" (Should be 5)
- "Did your retrieved files match the originals exactly?" (Use `diff` to verify)
- "What's the QuiltPatchId structure you observed?"

---

## Wrap-up and Assessment (5-10 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **What problem do quilts solve?**
   - Expected: Cost inefficiency of storing many small blobs (up to 413x savings)

2. **What's the difference between BlobId and QuiltPatchId?**
   - Expected: BlobId is content-derived; QuiltPatchId is compositional (quilt + location)

3. **Name two ways to retrieve patches from a quilt.**
   - Expected: By identifier, by tag, by QuiltPatchId, all patches

4. **What's one thing you CANNOT do with individual patches?**
   - Expected: Delete, extend, or share individually (quilt-level operations only)

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Student can explain the cost/gas benefits of quilts with specific numbers
- [ ] Student understands the compositional nature of QuiltPatchId
- [ ] Student has successfully created a quilt using CLI or SDK
- [ ] Student can retrieve individual files using identifiers
- [ ] Student can use tags to filter and retrieve subsets of data
- [ ] Student can list common mistakes (duplicates, limits) and how to avoid them
- [ ] Student has completed the hands-on lab and verified content integrity

### Quick Poll

- "Raise your hand if you successfully created and retrieved from a quilt"
- "Thumbs up if you understand why QuiltPatchId changes when quilt composition changes"
- "Show of hands: Who can explain when NOT to use quilts?"

---

## Additional Resources

### For Students

- [Walrus Quilt Documentation](https://docs.wal.app/usage/quilt.html) - Official user guide
- [CLI Reference](https://docs.wal.app/usage/client-cli.html) - Command documentation
- `ts-sdks/packages/walrus/examples/quilt/` - Runnable SDK examples
- `hands-on-source-code/` - Lab source code and verification scripts

### For Instructors

- `crates/walrus-core/src/encoding/quilt_encoding.rs` - Internal encoding logic
- `crates/walrus-service/src/client/cli/args.rs` - CLI argument definitions
- `ts-sdks/packages/walrus/src/utils/quilts.ts` - TypeScript encoding utilities
- Sample error logs for troubleshooting demonstrations

---

## Notes for Next Module

Students should now be ready for:

- Advanced storage patterns (combining quilts with regular blobs)
- Application development using Walrus storage
- Cost optimization strategies for large-scale deployments
- Integration with Sui smart contracts for programmable access control

**Key Concepts to Reinforce in Future Modules:**
- Quilts for batch storage, regular blobs for dynamic content
- Always verify content integrity (blob IDs, checksums)
- Design metadata schemas (identifiers, tags) before implementation
- Consider lifecycle requirements when choosing storage approach
