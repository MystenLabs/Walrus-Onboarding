# Instructor's Guide: Walrus Upload Transaction Lifecycle

## Quick Reference

**Total Time:** 90-105 minutes
**Difficulty:** Intermediate
**Hands-on Components:** Yes - Log tracing with CLI (15-20 min)
**Materials Needed:** Terminal with Walrus CLI, whiteboard for diagrams, sample log files

**Key Takeaways:**
- Upload lifecycle has four distinct phases: Encoding → Registration → Sealing → Certification
- Hybrid architecture: on-chain coordination (Sui) + off-chain data storage (Storage Nodes)
- Client-driven process: the client (or SDK) orchestrates the entire upload
- BLS signature aggregation with 2/3 quorum provides cryptographic proof of availability
- Event-driven synchronization ensures network-wide consistency after certification

## Prerequisites

### For Students
- Completed Module: Introduction to Walrus (understanding of erasure coding concept)
- Completed Module: Walrus Architecture (components and data flow)
- Basic understanding of blockchain transactions and Sui
- Familiarity with the Walrus CLI (`walrus store`, `walrus info`)
- Comfort reading logs and basic code structure

### For Instructor
- Working Walrus environment (Testnet recommended)
- `walrus` CLI installed and configured with funded wallet
- Ability to run commands with `RUST_LOG=debug` for demonstrations
- Understanding of Reed-Solomon encoding parameters
- Familiarity with BLS signature aggregation

## Classroom Setup

**Advance Prep (15 min before class):**
- [ ] Verify Walrus CLI is working: `walrus info`
- [ ] Prepare sample file: `echo "Hello Walrus Lifecycle" > test.txt`
- [ ] Test debug logging: `RUST_LOG=walrus_sdk=debug walrus store test.txt`
- [ ] Prepare whiteboard space for sequence diagrams
- [ ] Queue up key diagrams from student materials (especially `07-full-lifecycle-diagram.md`)
- [ ] Have sample log files ready (successful upload, failed upload)

**Optional Materials:**
- Pre-captured log files for students without CLI access
- Sui explorer access to show on-chain blob objects and events

## Instructor Cheat Sheet

1. **Encoding (15-18 min):** Reed-Solomon RS(n,k) | $k_{primary} = n - 2f$ | Client-side processing | Blob ID = Merkle root
2. **Registration (12-15 min):** `register_blob` on Sui | Pays WAL tokens | Creates `Blob` object in `Registered` state
3. **Sealing (12-15 min):** Parallel HTTP PUTs to storage nodes | `/v1/blobs/{id}/slivers/...` | Node validates & stores
4. **Proof Creation (15-18 min):** BLS signatures from nodes | Dual verification (on-chain + local DB) | Quorum = 2/3 shards
5. **Certification (12-15 min):** `certify_blob` on Sui | `BlobCertified` event triggers sync | State: `Registered` → `Certified`
6. **Retrieval (8-10 min):** Fetch $k$ slivers | Decode | Verify blob ID
7. **Hands-On (15-20 min):** `RUST_LOG=debug` | Map logs to phases | Identify key events

---

## Section-by-Section Guidance

### Section 1: Chunk Creation & Encoding (15-18 min)
**Student Material:** `01-chunk-creation.md`

⏱️ **Duration:** 15-18 minutes

🎯 **Key Points to Emphasize:**
- **Client-Side Processing**: The original file *never* leaves the client in its raw form - encoding happens locally
- **Reed-Solomon Parameters**: Derived from BFT settings, not arbitrary
  - $f = \lfloor(n-1)/3\rfloor$ (max Byzantine nodes)
  - $k_{primary} = n - 2f$ (primary source symbols)
  - $k_{secondary} = n - f$ (secondary source symbols)
- **Example for 1000 shards**: $f = 333$, $k_{primary} = 334$, $k_{secondary} = 667$
- **Blob ID**: Derived from Merkle root of sliver hashes - cryptographically bound to content
- **Output Artifacts**: Sliver pairs (Primary + Secondary) + Blob ID + Metadata

💡 **Teaching Tips:**
- Use the Mermaid flowchart in student material to visualize the encoding pipeline
- Draw the matrix expansion on whiteboard: "Original data → Add parity rows → Slice into slivers"
- Emphasize determinism: "Same blob always produces same slivers and same blob ID"
- Connect to Module 1: "Remember the 4.5x expansion factor? This is where it happens"

⚠️ **Common Misconceptions:**
- *Misconception*: "The file is encrypted during encoding"
  - *Correction*: Erasure coding is for redundancy, NOT privacy. Data is encoded, not encrypted.
- *Misconception*: "Primary slivers are 'better' than secondary slivers"
  - *Correction*: Primary contains original data (systematic encoding); secondary contains parity. Both are essential.
- *Misconception*: "334 is a magic number"
  - *Correction*: It's computed from $n - 2f$ where $n = 1000$ shards. Different networks may have different values.

💬 **Discussion Points:**
- "Why does the client do the encoding instead of a central server?"
  - **Answer:** Decentralization - no single point of trust/failure. Also enables client-side encryption before encoding.
- "If encoding is deterministic, what prevents someone from discovering what blob you uploaded?"
  - **Answer:** Nothing - Walrus is public by default! Client must encrypt sensitive data before encoding.

✅ **Quick Check:**
- "If we have 1000 shards and $f = 333$, how many primary slivers do we need to reconstruct the blob?" (Answer: 334)
- "Where does the Blob ID come from?" (Answer: Merkle root of sliver hashes)
- "Is the encoding lossy like JPEG compression?" (Answer: No, it's lossless - can perfectly reconstruct)

**Transition to Next Section:**
"The blob is now encoded locally. Next, we need to tell the Sui blockchain that we want to store this blob."

---

### Section 2: Submission (Registration) (12-15 min)
**Student Material:** `02-submission.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Two-Step Process**:
  1. **Reserve Space**: Pay WAL tokens to acquire a `StorageResource`
  2. **Register Blob**: Consume the resource to register the Blob ID on-chain
- **Payment Mechanics**: WAL tokens are *transferred* to the system (Future Accounting), NOT burned. They're distributed to storage nodes as rewards later.
- **Output**: A `Blob` object on Sui with status `Registered` - data is NOT yet stored on storage nodes
- **PTB Optimization**: Both steps are often batched into a single Programmable Transaction Block (PTB)

💡 **Teaching Tips:**
- Use the sequence diagram in student material to show the Sui transaction flow
- Draw on whiteboard: `WAL Tokens → System Contract → Storage Resource → Blob Object`
- Emphasize: "At this point, we've told Sui we *want* to store data, but we haven't actually stored it yet"
- Show the log message: `starting to register blobs`

⚠️ **Common Misconceptions:**
- *Misconception*: "I pay storage nodes directly when I upload"
  - *Correction*: You pay the *System Contract* on Sui. Nodes receive rewards from the system later.
- *Misconception*: "Registration means my data is stored"
  - *Correction*: Registration only creates the on-chain record. Data distribution happens in the next phase (Sealing).
- *Misconception*: "WAL tokens are burned"
  - *Correction*: They're transferred to the storage fund and distributed to nodes as rewards.

💬 **Discussion Points:**
- "Why separate reservation from registration? Why not just one step?"
  - **Answer:** Allows buying storage in bulk/advance, splitting/merging resources, and separating payment from blob creation.
- "What happens if you register a blob but never upload the slivers?"
  - **Answer:** You've paid for storage but the blob will never be certified. Wasted resources. The system doesn't automatically refund.

✅ **Quick Check:**
- "After registration, what is the state of the Blob object?" (Answer: `Registered`)
- "Where do WAL tokens go when you pay for storage?" (Answer: System contract / storage fund)
- "Can you retrieve a blob right after registration?" (Answer: No - it's not stored yet)

**Transition to Next Section:**
"Now that Sui knows about our blob, we need to actually send the data to the storage nodes."

---

### Section 3: Sealing (Storing Slivers) (12-15 min)
**Student Material:** `03-sealing.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Parallel Distribution**: Client sends slivers to multiple storage nodes simultaneously
- **Shard Assignment**: Each storage node manages specific shards; client must respect the mapping
- **HTTP API**: `PUT /v1/blobs/{blob_id}/slivers/{sliver_pair_index}/{sliver_type}`
- **Node Validation**: Storage nodes actively verify:
  1. They're responsible for this shard
  2. Sliver hash matches the Blob ID (integrity check)
- **Same for Quilts**: Quilts (bundled files) go through the exact same upload process

💡 **Teaching Tips:**
- Draw parallel upload on whiteboard: `Client → [Node 1, Node 2, ... Node N]` with arrows
- Emphasize the efficiency: "We don't wait for Node 1 to finish before starting Node 2"
- Show the API endpoint structure - students should recognize REST patterns
- Mention: "TypeScript uses `Promise.all`, Rust uses `FuturesUnordered`"

⚠️ **Common Misconceptions:**
- *Misconception*: "All nodes store all slivers"
  - *Correction*: Each node only stores slivers for shards it manages. Clients send specific slivers to specific nodes.
- *Misconception*: "If one node is down, the upload fails"
  - *Correction*: Upload proceeds to other nodes. We only need 2/3 quorum for certification later.
- *Misconception*: "Storage nodes trust the client"
  - *Correction*: Nodes actively verify sliver integrity against the registered Blob ID before storing.

💬 **Discussion Points:**
- "What happens if 400 out of 1000 storage nodes are offline during upload?"
  - **Answer:** Upload to remaining 600 nodes proceeds. Later, we need 2/3 (667) signatures for certification - might fail if too few stored. But nodes that missed upload will sync after certification event.
- "Why do storage nodes verify the sliver hash?"
  - **Answer:** Prevents clients from sending garbage data. Ensures integrity before committing storage resources.

✅ **Quick Check:**
- "What HTTP method is used to store slivers?" (Answer: PUT)
- "Does a storage node store all slivers or just some?" (Answer: Only slivers for its assigned shards)
- "What does the storage node check before storing a sliver?" (Answer: Shard assignment + sliver hash/integrity)

**Transition to Next Section:**
"Slivers are now distributed across the network. But the network doesn't *know* they're there yet. We need proof."

---

### Section 4: Proof Creation (Collecting Signatures) (15-18 min)
**Student Material:** `04-proof-creation.md`

⏱️ **Duration:** 15-18 minutes (important conceptual section)

🎯 **Key Points to Emphasize:**
- **Dual Verification by Nodes**: Before signing, each node checks:
  1. **On-chain registration**: Is this blob registered and paid for? (prevents spam)
  2. **Local storage**: Do I have all slivers for my assigned shards?
- **BLS Signatures**: Nodes sign with their private keys, attestations can be aggregated
- **Quorum Threshold**: Need signatures from nodes representing > 2/3 of total shards (voting power)
- **Formula**: $3 \times weight \geq 2 \times n_{shards} + 1$ (strictly > 2/3)
- **Aggregation**: Individual signatures combined into a single compact certificate

💡 **Teaching Tips:**
- Draw the verification flow: `Client → Node: "Do you have my blob?" → Node checks DB + Chain → Signs if yes`
- Emphasize the two checks: "Node won't sign for unpaid blobs (spam protection) or unstored blobs (honesty)"
- Explain why BLS is used: "Signatures can be aggregated into one compact proof - gas efficient"
- Connect to Byzantine tolerance: "Even if 1/3 of nodes lie or refuse, we still get quorum"

⚠️ **Common Misconceptions:**
- *Misconception*: "Nodes sign anything the client asks"
  - *Correction*: Nodes only sign after verifying registration (on-chain) AND storage (local DB).
- *Misconception*: "We need signatures from all nodes"
  - *Correction*: Only need > 2/3 quorum. This is the Byzantine tolerance threshold.
- *Misconception*: "The smart contract checks the actual data"
  - *Correction*: The contract only verifies signatures. Nodes checked the data.

💬 **Discussion Points:**
- "Why require > 2/3 instead of just > 1/2 (majority)?"
  - **Answer:** Byzantine fault tolerance. With up to 1/3 malicious nodes, > 2/3 honest quorum ensures overlap with any honest subset.
- "What would happen if a malicious node signs without actually storing the data?"
  - **Answer:** If detected (via challenges later), the node is penalized. Also, honest nodes can recover missing slivers via peer sync.
- "Why check on-chain registration before signing?"
  - **Answer:** Prevents spam. Without this, attackers could flood nodes with unsigned data requests.

✅ **Quick Check:**
- "Name the two things a storage node checks before signing a confirmation" (Answer: On-chain registration + local storage)
- "What percentage of shard weight is needed for quorum?" (Answer: Strictly > 2/3)
- "Why is BLS signature aggregation useful?" (Answer: Many signatures → one compact proof, saves gas on-chain)

**Transition to Next Section:**
"We have proof that the network stored our data. Now we finalize this on the blockchain."

---

### Section 5: Storage Confirmation (Certification) (12-15 min)
**Student Material:** `05-storage-confirmation.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **`certify_blob` Transaction**: Submits aggregated signatures to Sui
- **On-Chain Verification Optimization**: Contract sums *non-signers* and subtracts from total (fewer non-signers = cheaper gas)
- **State Transition**: Blob object status changes from `Registered` → `Certified`
- **`BlobCertified` Event**: Critical trigger for network synchronization
- **Point of Availability (PoA)**: After certification, blob is officially available for retrieval

💡 **Teaching Tips:**
- Show the state machine: `Registered → Certified` on whiteboard
- Explain the gas optimization: "With 900/1000 signers, it's cheaper to process 100 non-signers than 900 signers"
- Emphasize the event: "This `BlobCertified` event is the signal that triggers network-wide sync"
- Show the log message: `certifying blob on Sui`

⚠️ **Common Misconceptions:**
- *Misconception*: "Certification means downloading and checking the file on-chain"
  - *Correction*: The contract only verifies the aggregated BLS signature. The nodes already checked the data.
- *Misconception*: "The blob can be retrieved right after sealing"
  - *Correction*: Must wait for certification. Only after PoA is the blob officially available.
- *Misconception*: "Only nodes that received slivers during upload have the data"
  - *Correction*: After `BlobCertified` event, nodes that missed upload will sync from peers automatically.

💬 **Discussion Points:**
- "Why emit a `BlobCertified` event instead of just updating the object?"
  - **Answer:** Events are indexed by all nodes. Triggers automatic peer sync for nodes that missed the upload.
- "What happens if a node was offline during upload but sees the `BlobCertified` event?"
  - **Answer:** It initiates peer recovery - fetches missing slivers from other nodes. Self-healing network.
- "After certification, can the client disconnect safely?"
  - **Answer:** Yes! The upload is complete. The client's job is done.

✅ **Quick Check:**
- "What is the blob status after certification?" (Answer: `Certified`)
- "What event triggers network synchronization?" (Answer: `BlobCertified`)
- "Why does the smart contract sum non-signers instead of signers?" (Answer: Gas optimization - fewer non-signers)

**Transition to Next Section:**
"Upload complete! Now let's quickly see how retrieval reverses this process."

---

### Section 6: Retrieval Flow (8-10 min)
**Student Material:** `06-retrieval-flow.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Efficiency**: Only need $k_{primary}$ slivers (e.g., 334 out of 1000) to reconstruct
- **Parallel Fetching**: Client queries multiple nodes simultaneously, uses first $k$ valid responses
- **Client-Side Reconstruction**: Decoding happens on client (or aggregator), not storage nodes
- **Integrity Verification**: Reconstructed blob is hashed and compared to Blob ID

💡 **Teaching Tips:**
- Contrast with upload: "Upload: send to ALL nodes. Retrieval: fetch from SOME nodes"
- Emphasize the performance benefit: "Don't wait for slow nodes - first $k$ wins"
- Connect to erasure coding: "This is why RS encoding is powerful - partial data reconstructs full file"

⚠️ **Common Misconceptions:**
- *Misconception*: "Need to fetch all slivers to reconstruct"
  - *Correction*: Only need $k$ (e.g., 334) slivers. Reed-Solomon magic!
- *Misconception*: "Storage nodes do the decoding"
  - *Correction*: Client (or aggregator) does decoding. Nodes just serve raw slivers.

💬 **Discussion Points:**
- "Why fetch more than exactly $k$ slivers?"
  - **Answer:** Tail latency optimization. Request from many, use first $k$ valid responses. Don't wait for slow nodes.

✅ **Quick Check:**
- "How many slivers are needed to reconstruct a blob on a 1000-shard network?" (Answer: 334)
- "Who performs the decoding - storage nodes or client?" (Answer: Client or aggregator)

**Transition to Next Section:**
"You now understand the full lifecycle conceptually. Let's trace it in real logs!"

---

### Section 7: Hands-On Log Tracing (15-20 min)
**Student Material:** `07-full-lifecycle-diagram.md` and `08-hands-on-trace-logs.md`

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**
- **Log Levels**: `RUST_LOG=walrus_sdk=debug,walrus_core=debug,walrus_sui=debug`
- **Key Log Messages by Phase**:
  - Encoding: `starting to encode blob with metadata` → `successfully encoded blob`
  - Registration: `starting to register blobs`
  - Sealing: `starting to store sliver` (trace level)
  - Proof: `get N blobs certificates`
  - Certification: `certifying blob on Sui`
- **Storage Node Logs** (if accessible):
  - `sliver stored successfully`
  - `process_blob_certified_event`
  - `skipping syncing blob during certified event processing` (already has data)

💡 **Teaching Tips:**
- **Demonstrate first**: Run a live upload with `RUST_LOG=debug` before students try
- Walk through each log block, pause, ask students to identify the phase
- Show both CLI output AND what to look for in logs
- Have pre-captured logs ready for students without CLI access

**Live Demonstration Script:**
```bash
# 1. Set up logging
export RUST_LOG="walrus_sdk=debug,walrus_core=debug,walrus_sui=debug"

# 2. Create test file
echo "Hello Walrus Lifecycle" > test.txt

# 3. Upload with verbose output
walrus store test.txt 2>&1 | tee upload.log

# 4. Review key log lines together
grep -E "encode|register|store|certif" upload.log
```

⚠️ **Common Misconceptions:**
- *Misconception*: "All phases produce INFO-level logs"
  - *Correction*: Some phases (like individual sliver uploads) are TRACE level - need to enable specifically.
- *Misconception*: "Logs show exactly what's happening on storage nodes"
  - *Correction*: Client logs show client activity. Storage node logs are separate (need node access).

💬 **Discussion Points:**
- "If you see `NotEnoughConfirmations` error, at what phase did it fail?"
  - **Answer:** Proof Creation phase - couldn't get 2/3 quorum signatures.
- "How can you tell from logs how long encoding took?"
  - **Answer:** Timestamp difference between `starting to encode` and `successfully encoded blob`.

✅ **Quick Check:**
- Students should identify in their logs:
  - [ ] Blob ID generated
  - [ ] Registration transaction
  - [ ] Certification transaction (or attempt)
  - [ ] Total upload time

**Troubleshooting During Hands-On:**
- **Issue**: `RUST_LOG` not working
  - **Fix**: Ensure exported: `export RUST_LOG=debug` (not just `RUST_LOG=debug`)
- **Issue**: Too much output
  - **Fix**: Pipe to file and grep: `walrus store test.txt 2>&1 | tee log.txt` then `grep "INFO\|ERROR" log.txt`
- **Issue**: No Walrus CLI
  - **Fix**: Provide pre-captured sample logs

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to answer:

1. **Name the four main phases of an upload lifecycle**
   - Expected: Encoding → Registration → Sealing → Certification

2. **What triggers storage nodes to sync data they missed during upload?**
   - Expected: The `BlobCertified` event emitted on Sui

3. **Why do storage nodes check on-chain registration before signing confirmations?**
   - Expected: To prevent spam - ensures blob is paid for before committing resources

4. **What's the minimum number of slivers needed to reconstruct a blob on a 1000-shard network?**
   - Expected: 334 (computed as $n - 2f$ where $f = 333$)

### Assessment Checklist

- [ ] Students can name and order the four lifecycle phases
- [ ] Students understand the on-chain vs off-chain separation (Sui coordinates, nodes store)
- [ ] Students can explain the quorum requirement (> 2/3)
- [ ] Students can identify lifecycle stages from log messages
- [ ] Students understand the `BlobCertified` event's role in synchronization

### Quick Poll

- "Raise your hand if you can draw the upload lifecycle on a whiteboard"
- "Thumbs up if you understand why we need > 2/3 quorum"
- "Show of hands: Who successfully traced an upload in the logs?"

---

## Additional Resources

### For Students
- [Walrus Design: Operations Off-Chain](../../../design/operations-off-chain.md)
- [Walrus Design: Operations on Sui](../../../design/operations-sui.md)
- [Walrus CLI Usage](../../../usage/client-cli.md)

### For Instructors
- Sample log files (successful upload, failed upload, retrieval)
- Failure scenario scripts for demonstrations
- [Walrus Encoding Documentation](../../../design/encoding.md)

---

## Notes for Next Module

Students should now be ready for:
- Deep-dive into storage costs and pricing
- Epochs and storage continuity
- SDK usage for building applications
- Advanced failure handling and recovery

**Key Concepts to Reinforce in Future Modules:**
- Client-driven architecture (client orchestrates everything)
- Event-driven synchronization (`BlobCertified` triggers peer sync)
- Quorum requirements (2/3 for certification)
- State transitions (`Registered` → `Certified`)
