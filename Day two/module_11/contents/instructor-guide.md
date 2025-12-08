# Instructor's Guide: Quilts - Batch Storage in Walrus

## Learning Objectives

By the end of this curriculum, students should be able to:

- **Explain the problem of small blob storage inefficiency** and how quilts solve it (cost + gas).
- **Differentiate between BlobId and QuiltPatchId**, understanding why the latter is compositional.
- **Create quilts using both CLI and SDK**, correctly applying identifiers and tags.
- **Retrieve individual patches** from a quilt without downloading the entire object.
- **Design effective metadata schemas** (identifiers/tags) for queryable collections.
- **Operate the provided hands-on lab** to verify quilt creation and retrieval.
- **Avoid common pitfalls** like duplicate identifiers and exceeding metadata limits.

## Prerequisites

### For Students

- Working knowledge of Walrus CLI commands (`store`, `read`, `blob-status`).
- Basic understanding of TypeScript/JavaScript (if using SDK examples).
- A funded Testnet wallet (SUI + WAL).
- Completed the basic CLI or SDK curriculum modules.

### For Instructor

- Deep understanding of Walrus storage costs (per-object overhead vs. per-byte cost).
- Familiarity with the quilt encoding structure (`crates/walrus-core/src/encoding/quilt_encoding.rs`).
- Comfort with both CLI (`store-quilt`) and SDK (`writeFiles`/`writeFilesFlow`) workflows.
- Ability to explain "sliver alignment" and why it matters for partial retrieval.
- Prepared demo environment with sample small files (images, JSON, text).

## Section-by-Section Guidance

### Section 1: What Quilts Solve (`01-what-quilts-solve.md`)

**Key Points to Emphasize:**
- **Cost Savings**: Up to **413x cheaper** for 10KB files due to shared overhead (testnet figures).
- **Gas Efficiency**: One transaction for up to 666 files vs. 666 individual transactions.
- **Use Cases**: Ideal for NFT collections, static websites, and grouped assets. Not for large files (>10MB) or dynamic collections.
- **Decision Framework**: Use the flowchart to decide when to use quilts vs. regular blobs.

**Teaching Tips:**
- Show the cost comparison table (10KB blob: 6.615 WAL vs 0.016 WAL).
- Ask students to calculate the cost for 1000 files with vs. without quilts.
- Use the "Decision Framework" to walk through scenarios (e.g., "User chat messages" -> No Quilt due to deletion requirement).

**Quick Check:**
- "Why does a 10KB blob cost almost the same as a 100KB blob in regular storage?" (Overhead dominates).
- "What is the maximum number of blobs in a QuiltV1?" (666).

**Discussion Points:**
- The economic impact of on-chain metadata vs. Walrus-native metadata.
- Why quilts are immutable (can't delete single patch).

---

### Section 2: How Data Is Linked (`02-how-data-is-linked.md`)

**Key Points to Emphasize:**
- **Quilt Structure**: A 2D matrix where rows are symbols and columns are slivers.
- **QuiltPatchId**: It is `QuiltBlobId` + `PatchInternalId`. It changes if the quilt composition changes!
- **Metadata**: Stored *inside* the quilt header (QuiltIndex), not on Sui.
- **Sliver Alignment**: Patches align with sliver boundaries, enabling efficient partial reads (only download needed slivers).

**Teaching Tips:**
- Draw the "Visual Comparison" on a whiteboard: Regular Blob vs. Quilt Structure.
- Emphasize that `QuiltPatchId` is **not** content-addressed. The same file in two different quilts has different IDs.
- Explain that the QuiltIndex is the first thing fetched during retrieval.

**Quick Check:**
- "If I move a file from Quilt A to Quilt B, does its ID change?" (Yes).
- "Where is the identifier string (e.g., 'my-photo.jpg') stored?" (In the Quilt Index/Header).

**Discussion Points:**
- Trade-offs of compositional IDs vs. content-addressed IDs.
- How sliver alignment enables "random access" in a distributed system.

---

### Section 3: Creation Process (`03-creation-process.md`)

**Key Points to Emphasize:**
- **CLI Methods**:
  - `--paths`: Simple, recursive, auto-identifiers (filenames).
  - `--blobs`: Advanced, custom identifiers and tags.
  - **Mutually Exclusive**: Can't use both together.
- **SDK Flow**: `writeFiles` (simple one-step) vs. `writeFilesFlow` (advanced control).
- **Limits**:
  - Max 666 blobs.
  - Max 64KB per identifier.
  - Max 64KB total tags size.
- **Dry Run**: Use `--dry-run` to estimate costs before committing funds.

**Teaching Tips:**
- Live code a CLI `store-quilt` with `--paths` for simplicity.
- Show a JSON blob definition for `--blobs` to explain the structure.
- Discuss naming conventions for identifiers (e.g., using paths for uniqueness).

**Quick Check:**
- "Can I use `--paths` and `--blobs` together?" (No).
- "What happens if I have duplicate filenames when using `--paths`?" (Error).

**Discussion Points:**
- Strategies for splitting collections larger than 666 files.
- When to use the SDK `writeFilesFlow` (progress tracking, error handling).

---

### Section 4: Retrieval Process (`04-retrieval-process.md`)

**Key Points to Emphasize:**
- **Efficiency**: Retrieving a patch does **not** download the whole quilt.
- **Methods**:
  - **By Identifier**: Most common (e.g., `intro.txt`).
  - **By Tag**: Bulk retrieval (e.g., `category=images`).
  - **By PatchId**: Direct access (less common for humans).
  - **All**: Download everything.
- **Tools**: `list-patches-in-quilt` is essential for debugging and finding IDs.

**Teaching Tips:**
- Demonstrate `read-quilt --identifiers` vs `read` (which downloads the whole quilt).
- Show how to use `list-patches-in-quilt` to find what's inside before downloading.
- Explain that `read-quilt` logic happens client-side (fetch index -> calculate slivers -> fetch slivers).

**Quick Check:**
- "Which command downloads the entire quilt file?" (`read <QuiltId>` or `read-quilt` with no filters).
- "How do I download all files with `category=images`?" (`read-quilt --tag category images`).

**Discussion Points:**
- Caching metadata client-side for faster lookups.
- Building a "lazy loading" website using quilt retrieval.

---

### Section 5: Real Examples (`05-real-examples.md`)

**Key Points to Emphasize:**
- **NFTs**: Metadata tagging for rarity/traits.
- **Website**: Directory structure mapping to identifiers.
- **Automation**: Using scripts for batch processing.
- **Hybrid Approaches**: Combining CLI for admin and SDK for apps.

**Teaching Tips:**
- Walk through the "Static Website" example code.
- Highlight how tags are used in the "Game Asset" example for level loading.
- Discuss how identifiers effectively replace file paths in web hosting scenarios.

**Quick Check:**
- "In the NFT example, how do we query all 'legendary' items?"
- "How does the static site example handle MIME types?"

**Discussion Points:**
- Integrating quilts into CI/CD pipelines (e.g., deploying docs).
- Using Python vs. TypeScript for different backend tasks.

---

### Section 6: Typical Mistakes (`06-typical-mistakes.md`)

**Key Points to Emphasize:**
1. **Duplicate Identifiers**: The #1 error. Identifiers must be unique within the quilt.
2. **Wrong ID Type**: Trying to `read` a PatchId (fails) vs. `read-quilt`.
3. **Metadata Limits**: Don't store large JSON blobs in tags (<64KB total).
4. **Individual Deletion**: Impossible. Quilts are all-or-nothing.
5. **Mixing Flags**: Using `--paths` and `--blobs` together.
6. **Async Handling**: Forgetting `await` in SDKs.

**Teaching Tips:**
- Intentionally trigger a "Duplicate identifier" error in CLI.
- Intentionally try to `walrus read` a PatchId to show the error.
- Show the error message for "Insufficient funds" so students recognize it.

**Quick Check:**
- "Why can't I store a 1MB JSON object in a tag?"
- "What happens if I try to delete a single patch?"
- "Can I extend the expiration of just one file in a quilt?" (No).

**Discussion Points:**
- Error handling strategies in production apps.
- Validating inputs (size, format, uniqueness) before starting a long upload.

---

### Section 7: Hands-On Lab (`07-hands-on.md`)

**Key Points to Emphasize:**
- **End-to-End Flow**: Create files -> Store Quilt -> Verify List -> Retrieve Partial -> Verify Content.
- **Verification**: The lab script proves data integrity.
- **Flexibility**: Lab can be done via CLI or SDK.

**Teaching Tips:**
- Let students run the `verify-lab.sh` script to check their own work.
- Encourage students to modify the script to test failure cases (e.g., try to retrieve non-existent ID).
- Have students inspect the `quilt-info.sh` or JSON output to see the Quilt ID structure.

**Quick Check:**
- "Did your retrieved file match the original exactly?"
- "How many patches did you successfully store?"

**Discussion Points:**
- Extending the lab to use the TypeScript SDK instead of CLI.
- Adapting the lab for a specific project requirement.

---

## Assessment Suggestions

- **Cost Calculator**: Ask students to calculate the WAL savings for storing 500 x 50KB files as a quilt vs. individually.
- **Schema Design**: Given a hypothetical app (e.g., "Music Player"), ask students to design the Identifier and Tag schema for the files (Songs, Albums, Art).
- **Debugging Challenge**: Provide a quilt ID that "doesn't work" (e.g., expired, or user has wrong ID) and ask them to diagnose using `blob-status` and `list-patches-in-quilt`.
- **Implementation**: Write a script that uploads a directory as a quilt and generates a manifest JSON file.

## Additional Resources

- `crates/walrus-core/src/encoding/quilt_encoding.rs` – Internal encoding logic.
- `crates/walrus-service/src/client/cli/` – CLI implementation references.
- `ts-sdks/packages/walrus/examples/quilt/` – Runnable SDK examples.

## Official Documentation for Reference

- [`docs/book/usage/quilt.md`](../../usage/quilt.md) – User guide.
- [Walrus CLI Reference](https://docs.wal.app/usage/cli.html)
- [Walrus SDK Reference](https://docs.wal.app/usage/sdk.html)

## Module Completion Checklist

- [ ] Student can explain the cost/gas benefits of quilts.
- [ ] Student understands the compositional nature of `QuiltPatchId`.
- [ ] Student has successfully created a quilt using CLI or SDK.
- [ ] Student can retrieve individual files using Identifiers.
- [ ] Student can use Tags to filter and retrieve subsets of data.
- [ ] Student can list common mistakes (duplicates, limits) and how to avoid them.
- [ ] Student has completed the hands-on lab and verified integrity.
