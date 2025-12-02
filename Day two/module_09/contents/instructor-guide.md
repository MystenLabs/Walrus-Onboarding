# Instructor's Guide: Walrus Upload Transaction Lifecycle

## Module Overview

| Feature | Details |
| :--- | :--- |
| **Total Estimated Time** | 90 Minutes |
| **Hands-On Components** | Yes - Log tracing with CLI |

## Learning Objectives

By the end of this module, students should be able to:

- **Understand the complete transaction path** of a Walrus upload, distinguishing between on-chain coordination and off-chain data transfer.
- **Trace a real upload** through its stages using system logs and identifying key events.
- **Explain the role** of Reed-Solomon encoding ($n, k$ parameters) in data redundancy.
- **Identify** how the system ensures consensus on data availability (Quorum & Certification).

## Prerequisites

### For Students

- Basic understanding of blockchain transactions and Sui Move (high level).
- Familiarity with the Walrus CLI (`walrus`).
- Concept of Erasure Encoding (basic).

### For Instructor

- A working local Walrus environment (Devnet/Testnet) for demonstration.
- `walrus` CLI installed and configured.
- Ability to show real-time logs (e.g., `RUST_LOG` enabled).

## Classroom Setup & Preparation

**Materials Needed:**
- Terminal with `walrus` CLI.
- Access to the [Walrus Docs](https://docs.walrus.site).
- Diagrams from the curriculum (Files 01-07).

**Advance Prep Tasks:**
- Verify local devnet is running: `walrus info`.
- Prepare a sample file for upload: `echo "test" > test.txt`.
- Review the log patterns in `08-hands-on-trace-logs.md`.

## Section-by-Section Guidance

### Section 1: Chunk Creation (Encoding) (Time: 15 min)

**Reference Material:**
- `01-chunk-creation.md`

**Key Points to Emphasize:**
-   **Client-Side**: The original file *never* leaves the client in its raw form.
-   **Reed-Solomon**: Explain parameters $n$ (total shards) and $k$ (min shards).
    -   Primary Encoding: $k \le n - 2f$.
-   **Artifacts**: The output is Slivers (Primary/Secondary) + Blob ID (Merkle Root).

**Common Misconceptions:**
-   *Misconception*: "The file is encrypted."
    -   *Correction*: It is **encoded** for redundancy, not encrypted for privacy (unless the user encrypts it first).
-   *Misconception*: "The file is stored on the blockchain."
    -   *Correction*: Only metadata and the Blob ID are on-chain; slivers are off-chain.

**Teaching Tips:**
-   Use the Mermaid diagram in `01-chunk-creation.md` to visualize the split.

**Quick Check:**
-   "If we have $n=10$ shards and $k=3$, how many nodes can we lose and still recover the file?" (Answer: 7).

---

### Section 2: Submission (Registration) (Time: 15 min)

**Reference Material:**
-   `02-submission.md`

**Key Points to Emphasize:**
-   **Two-Step Process**:
    1.  **Reserve Space**: User pays **WAL tokens** to buy a `StorageResource`.
    2.  **Register Blob**: User consumes the resource to register the Blob ID.
-   **Payment Mechanics**: Tokens are **transferred** to the system (Future Accounting) for distribution to storage nodes, not burned.

**Common Misconceptions:**
-   *Misconception*: "I pay the storage nodes directly when I upload."
    -   *Correction*: You pay the *System* on-chain during registration. Nodes are paid rewards later by the system.

**Discussion Points:**
-   Why separate Reservation from Registration? (Allows buying storage in bulk/advance).

---

### Section 3: Sealing (Store Slivers) (Time: 15 min)

**Reference Material:**
-   `03-sealing.md`

**Key Points to Emphasize:**
-   **Parallelism**: Clients partition slivers by destination node and upload concurrently.
    -   TS SDK uses `Promise.all`.
    -   Rust SDK uses `FuturesUnordered`.
-   **Endpoint**: `PUT /v1/blobs/...`.
-   **Quilts**: Explain that Quilts (bundles of files) go through this exact same process.

**Teaching Tips:**
-   Show the difference between a serial upload (slow) and parallel (fast) using a whiteboard.

**Quick Check:**
-   "What happens if one storage node is offline during upload?" (Upload proceeds; we only need a quorum later).

---

### Section 4 & 5: Proof & Certification (Time: 20 min)

**Reference Material:**
-   `04-proof-creation.md`
-   `05-storage-confirmation.md`

**Key Points to Emphasize:**
-   **Proof of Availability**: Aggregated BLS signatures from $2f+1$ nodes.
-   **Node Checks**: Nodes check **Local State** (synced from chain) + **Local DB** (slivers) before signing.
-   **On-Chain Verification (Optimization)**: The smart contract subtracts the weight of *non-signers* instead of summing signers to save gas.

**Common Misconceptions:**
-   *Misconception*: "The smart contract downloads the file to check it."
    -   *Correction*: The contract only checks the *signatures* of the nodes. The nodes checked the file.

**Discussion Points:**
-   Why do we need a "Certified" state? Why isn't "Registered" enough? (Registered = "I want to store"; Certified = "The network confirms it is stored").

---

### Section 6: Retrieval (Time: 10 min)

**Reference Material:**
-   `06-retrieval-flow.md`

**Key Points to Emphasize:**
-   **Efficiency**: Only need to fetch $k$ slivers.
-   **Integrity**: Client validates the hash against the Blob ID.

---

### Section 7: Hands-On Walkthrough (Time: 15 min)

**Reference Material:**
-   `08-hands-on-trace-logs.md`

**Key Points to Emphasize:**
-   Show the mapping between CLI logs and the theoretical steps.
-   `starting to register blobs` -> Registration.
-   `starting to store sliver` -> Sealing.
-   `certifying blob on Sui` -> Certification.

**Teaching Tips:**
-   Run the command with `RUST_LOG=debug` live.
-   Pause at each log block and ask students to identify the stage.

---

## Assessment Checklist

- [ ] **Objective 1 Check:** Ask a student to draw the lifecycle on a whiteboard.
- [ ] **Objective 2 Check:** Provide a log snippet (e.g., `NotEnoughConfirmations`) and ask what stage failed.
- [ ] **Objective 3 Check:** Ask students to explain the difference between a Primary and Secondary sliver.

## Instructor Cheat Sheet (Condensed Reference)

-   **Blob ID**: derived from content hash (Merkle Root).
-   **Slivers**: $n$ total, $k$ needed to recover.
-   **Quorum**: $2f+1$ signatures needed for certification.
-   **Endpoints**:
    -   Upload: `PUT /v1/blobs/{id}/slivers/...`
    -   Confirm: `GET /v1/blobs/{id}/confirmation/...`
-   **CLI Command**: `walrus store <file>`

## Module Completion Checklist

- [ ] Students have successfully uploaded a file via CLI.
- [ ] Students have identified at least 3 distinct stages in their logs.
- [ ] Concepts of "Pay WAL" vs "Burn WAL" have been clarified.
