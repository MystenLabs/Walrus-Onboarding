# Instructor's Guide: Module 10 - Transaction Types

## Quick Reference

**Total Time:** 60-75 minutes

**Difficulty:** Intermediate

**Hands-on Components:** Yes - Transaction Classification Exercise (15-20 min)

**Materials Needed:** Whiteboard for flow diagrams, printed/projected scenario cards

**Key Takeaways:**
- **Upload is a multi-step process:** Reserve Space -> Register Blob -> Upload (Off-chain) -> Certify Blob.
- **Extensions must happen before expiry:** Once a blob expires, it's gone. Use `extend_blob` for payment or `extend_blob_with_resource` for merging storage.
- **Retrieval is mostly off-chain:** Reading is free and fast. "Certified Read" adds on-chain verification of the `BlobCertified` event.
- **Quilts change the unit of transaction:** One on-chain blob represents many small files. Operations (delete/extend) apply to the *whole quilt*, not individual patches.
- **SharedBlob enables community funding:** Allows multiple parties to pay for extensions.

**Code Examples (TypeScript):**
- [`upload.ts`](../src/examples/upload.ts)
- [`extend-blob.ts`](../src/examples/extend-blob.ts)
- [`read-blob.ts`](../src/examples/read-blob.ts)
- [`create-quilt.ts`](../src/examples/create-quilt.ts)
- [`production-config.ts`](../src/examples/production-config.ts)

## Prerequisites

### For Students

- **Walrus Basics**: Understanding of what a Blob and Storage Node are.
- **Blockchain Concepts**: Familiarity with "transactions", "gas", and "epochs".
- **Module 6 (CLI) or 7 (SDK)**: Prior exposure to basic store/read commands is helpful.

### For Instructor

- **Contract Knowledge**: Familiarity with `walrus::system` and `walrus::blob` module logic.
- **Cost Model**: Understanding why bundling transactions (PTBs) saves money.
- **Quilt Structure**: Basic knowledge of how Quilts differ from regular Blobs (see Module 11 for depth, but high-level here).

## Classroom Setup

**Advance Prep (10 min before class):**

- [ ] Draw the "Upload Lifecycle" diagram on the whiteboard (Reserve -> Register -> Upload -> Certify).
- [ ] Prepare the scenario list for the Hands-On section (or ensure students have access to `hands-on.md`).
- [ ] Review the "Transaction Strategy Matrix" in `05-production.md`.

**Materials:**

- Whiteboard markers (different colors for On-Chain vs Off-Chain actions).

## Instructor Cheat Sheet

| Transaction Type | Key Function(s) | Key Concept |
| :--- | :--- | :--- |
| **Upload** | `reserve_space`, `register_blob`, `certify_blob` | Multi-step process; only `certify` guarantees availability. |
| **Extension** | `extend_blob`, `extend_blob_with_resource` | Must happen **before** `end_epoch`. |
| **Retrieval** | N/A (Off-chain HTTP) | "Certified Read" checks on-chain event `BlobCertified`. |
| **Quilt** | Same as Upload (but 1 blob = N files) | Atomic unit on-chain; individual patches cannot be deleted/extended. |
| **SharedBlob** | `walrus::shared_blob::new`, `fund`, `extend` (or `blob.share()`) | "Tip jar" model for public data. |

---

## Section-by-Section Guidance

### Section 1: Upload Transactions (15 min)

**Student Material:** `01-upload.md`

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**
- **Not Atomic**: Unlike a simple token transfer, storage is a process.
- **The "Promise"**: `register_blob` tells nodes to *expect* data. `certify_blob` proves they *have* it.
- **Reserve vs. Register**: You can buy storage (`reserve`) way before you use it (`register`).

💡 **Teaching Tips:**
- **Analogy**: Compare it to booking a flight.
    1.  `reserve_space`: Buying the ticket (paying capacity).
    2.  `register_blob`: Checking in (assigning specific passenger/data).
    3.  Upload: Boarding the plane (transferring data).
    4.  `certify_blob`: Plane takes off (system confirms availability).
- Draw the flow: On-Chain (Sui) vs Off-Chain (Storage Nodes).

⚠️ **Common Misconceptions:**
- "I send the file to the smart contract." -> **Correction**: No! You send hashes to the contract; data goes to Storage Nodes.
- "If I reserve space, my data is safe." -> **Correction**: No, you must complete the upload and certification.

✅ **Quick Check:**
- "Which step actually moves the data bytes?" (Step 3: Upload to Storage Nodes - Off-chain)
- "What happens if I reserve space but never upload?" (You wasted your WAL tokens; the space expires unused.)

---

### Section 2: Extension Transactions (10 min)

**Student Material:** `02-extension.md`

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**
- **Strict Deadline**: Extensions are only valid if `current_epoch < end_epoch`.
- **Two Methods**:
    1.  **Pay**: Simple top-up (`extend_blob`).
    2.  **Merge**: efficient management (`extend_blob_with_resource`).
- **SharedBlob**: Unique feature for public goods.

💡 **Teaching Tips:**
- Draw a timeline. Show a blob ending at Epoch 10. Show a "rescue" transaction at Epoch 9 extending it to Epoch 20.
- Ask: "Why can't I extend an expired blob?" (Data might be garbage collected already).

⚠️ **Common Misconceptions:**
- "Extension re-uploads the data." -> **Correction**: No, it just updates the metadata (expiration date) on-chain.
- "Anyone can delete my SharedBlob." -> **Correction**: SharedBlobs are shared Sui objects for *permanent* blobs; they are not deletable before expiry.

---

### Section 3: Retrieval Operations (10 min)

**Student Material:** `03-retrieval.md`

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**
- **Read = Free**: No gas, no WAL cost.
- **Trust Levels**:
    - **Standard**: Trust the storage node returns correct data (verified by hash).
    - **Certified**: Verify on-chain that this specific blob ID is valid and active.
- **Blob ID = Content Hash**: Integrity is built-in.

💡 **Teaching Tips:**
- Discuss "Why don't we pay for reads?" (Bandwidth is off-chain; usually assumed to be part of the storage node service, though robust systems might rate-limit).
- Highlight that "Retrieval" isn't a *transaction* in the blockchain sense.

✅ **Quick Check:**
- "Do I need a Sui wallet to read a public image from Walrus?" (No, just an HTTP client).

---

### Section 4: Quilt Operations (10 min)

**Student Material:** `04-quilt.md`

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**
- **The "Container" Concept**: One `Blob` on chain contains many user files.
- **Trade-offs**:
    - **Pro**: Massive cost savings (1 SUI object vs 1000).
    - **Con**: Rigid lifecycle. Can't delete file #5 without deleting the whole Quilt.
- **Addressing**: `QuiltPatchId` changes if the quilt changes.

💡 **Teaching Tips:**
- Use the "Shipping Container" analogy.
    - Standard Blob: sending a single package.
    - Quilt: filling a shipping container. You pay for the container. The ship (blockchain) doesn't care what's inside.
- Refer back to Module 11 (Quilts) for deep dives, keep this focused on the *transaction* aspect (1 tx vs many).

⚠️ **Common Misconceptions:**
- "I can extend just one file in a Quilt." -> **Correction**: No, the Quilt is the atomic unit of storage.

---

### Section 5: Production Guidance (10 min)

**Student Material:** `05-production.md`

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**
- **Cost Management**: Use Quilts for small things, Standard Blobs for large/independent things.
- **Optimization**: PTBs (Programmable Transaction Blocks) are essential. Group `reserve` + `register`.
- **Error Handling**: Monitor `end_epoch`.

💡 **Teaching Tips:**
- Walk through the "Matrix" in the student guide.
- Ask students for their own project ideas and classify them live.

---

### Section 6: Hands-On Exercise (15-20 min)

**Student Material:** `hands-on.md`

⏱️ **Duration:** 15-20 minutes

**Activity:**
Students read 5 scenarios and must identify:
1.  The Transaction Type.
2.  The specific Move functions or operations involved.

**Solution Key:**

| Scenario | Answer | Explanation |
| :--- | :--- | :--- |
| **A: Daily Backup (500GB)** | **Standard Upload** | Large single file, definite retention. Uses `reserve_space`, `register_blob`. |
| **B: NFT Collection (10k items)** | **Quilt Upload** | 10,000 small files. Individual registration is too expensive. Quilt amortizes SUI object costs. |
| **C: Community Archive** | **SharedBlob** | Needs crowd-funding for longevity. `blob.share()` (calls `walrus::shared_blob::new`) wraps the blob. |
| **D: "Keep Alive" Signal** | **Extension (Payment)** | Simple `extend_blob` call. Urgency implies ad-hoc payment is best. |
| **E: Verify & Download** | **Certified Retrieval** | Off-chain read + On-chain event lookup (`BlobCertified`). |

**Facilitation Tips:**
- Have students vote on the answer for Scenario C (SharedBlob vs Standard). Discuss why "hope others will chip in" implies SharedBlob.
- Discuss Scenario B: Ask "How much gas would 10,000 individual transactions cost?" (A lot).

---

## Wrap-up and Assessment (5 min)

### Exit Ticket
1.  **What is the only on-chain action required to read a file?** (None for standard read; Event lookup for certified read).
2.  **Can you delete a single file from a Quilt?** (No).
3.  **True/False**: You upload the file data to the Sui Smart Contract. (False).

### Assessment Checklist
- [ ] Student can distinguish between "Reserve" and "Register".
- [ ] Student knows when to use Quilt vs. Standard Blob.
- [ ] Student understands that Extensions must happen *before* expiration.

## Additional Resources

- [Walrus Docs: Storage Costs](https://docs.walrus.site/dev-guide/costs.html)
- [Walrus Docs: Quilts](https://docs.walrus.site/usage/quilt.html)
- [Sui Move: Programmable Transaction Blocks](https://docs.sui.io/concepts/transactions/prog-txn-blocks)

## Notes for Next Module

Students should now be ready for:
- **Module 11 (Quilts Deep Dive)**: If they haven't done it, this module sets the stage for the *transactional* benefit.
- **Module 12 (Failure Handling)**: Understanding the multi-step upload process helps explain *where* failures can occur (e.g., reserved but failed to upload).

## Key Takeaways

- Emphasize the on-chain/off-chain split: reserve/register/certify on Sui, data bytes off-chain.
- Only certification guarantees availability; extensions must occur before `end_epoch`.
- Quilts are atomic for lifecycle; SharedBlob is permanent and fundable by anyone.
- Retrieval is free/off-chain; certified reads add an on-chain `BlobCertified` check.
- PTBs and batching reduce latency/cost; use the scenarios to surface misconceptions early.

## Next Steps

Assign Module 11 (Quilts Deep Dive) or Module 12 (Failure Handling) based on cohort needs, and reuse the transaction classification exercise for quick refreshers.
