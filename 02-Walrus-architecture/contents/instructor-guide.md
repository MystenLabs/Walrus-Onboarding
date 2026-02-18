# Instructor's Guide: Module 2 - Walrus Architecture

## Quick Reference

**Total Time:** 75-90 minutes

**Difficulty:** Beginner to Intermediate

**Hands-on Components:** Yes - Upload and retrieve blobs using CLI (20-30 min)

**Materials Needed:** Whiteboard for diagrams, Walrus CLI access, sample files for upload

**Key Takeaways:**

- Storage Nodes are core infrastructure; Publishers and Aggregators are optional convenience layers
- Erasure coding (RedStuff) provides ~4.5-5x expansion with 1/3 reconstruction capability
- Publishers and Aggregators are untrusted - clients must verify blob IDs and on-chain events
- Point of Availability (PoA) marks when a blob becomes retrievable after certificate posting
- 334 primary slivers needed for reconstruction; 2/3 quorum needed for certificate

## Prerequisites

### For Students

**Knowledge Prerequisites:**

- Basic understanding of blockchain concepts (transactions, smart contracts)
- Familiarity with HTTP APIs (REST, GET, PUT methods)
- Command-line familiarity for basic operations

**Technical Prerequisites (for Hands-On Exercises):**

- Walrus CLI installed ([Getting Started](https://docs.wal.app/docs/usage/started))
- Access to Walrus network (testnet or mainnet)
- Wallet with sufficient SUI (gas) and WAL tokens (storage fees)
- **OR** access to a publisher endpoint for HTTP-based uploads

### For Instructor

- Hands-on experience with Walrus CLI
- Understanding of Walrus architecture documentation
- Test all hands-on exercises beforehand
- Access to testnet for demonstrations
- Prepared troubleshooting responses for common issues
- Reviewed all visual aids and diagrams

## Classroom Setup

**Advance Prep (15 min before class):**

- [ ] Test that SVG diagrams render properly
- [ ] Verify Walrus CLI works with `walrus info`
- [ ] Prepare sample files for upload demonstration
- [ ] Queue up Excalidraw source files for live annotation if needed
- [ ] Have Sui explorer ready for inspecting on-chain state
- [ ] Test `RUST_LOG=debug` logging works

**Materials:**

- Component diagrams (Storage Node, Publisher, Aggregator)
- Data flow diagrams (Upload flow, Download flow)
- Chunk creation diagram
- Whiteboard for drawing custom explanations

## Instructor Cheat Sheet

1. **System Components (15-20 min):** Storage Nodes = core | Publishers/Aggregators = optional, untrusted | 2/3 Byzantine tolerance

2. **Chunk Creation (15-20 min):** RedStuff erasure coding | ~5x expansion | 334 primary slivers | Deterministic blob ID from Merkle root

3. **Data Flow (15-20 min):** Upload: 8 steps → PoA | Retrieval: 5 steps | Parallel operations | 2/3 quorum for certificate

4. **Hands-On (20-30 min):** Demonstrate first | CLI store/read | Verbose logging | Troubleshoot common issues

---

## Section-by-Section Guidance

### Section 1: System Components (15-20 min)

**Student Material:** [01-components.md](./01-components.md)

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**

- **Storage Nodes are core**: Everything else is optional infrastructure
- **Decentralization**: No single point of failure
- **Untrusted Publishers**: Users can verify publisher work
- **Byzantine Tolerance**: System works even if 1/3 of nodes are malicious
- **Shard Assignment**: Controlled by Sui smart contracts, changes every storage epoch (2 weeks on Mainnet)

💡 **Teaching Tips:**

- **Start with Storage Nodes**: They're the foundation - everything else builds on them
  - Explain shard assignment and storage epochs
  - Emphasize the role of Sui smart contracts in coordination
  - Use the Storage Node diagram to visualize the architecture

- **Publishers as Optional Infrastructure**:
  - Explain why they're useful (HTTP interface, bandwidth savings)
  - Stress that they're untrusted - users can verify
  - Show the verification methods (on-chain events, re-encoding)
  - Use the Publisher diagram to show the upload flow

- **Aggregators as Optional Infrastructure**:
  - Explain their role in reconstruction
  - Emphasize they don't perform on-chain actions (only reads)
  - Discuss caching benefits and CDN-like behavior
  - Use the Aggregator diagram to illustrate retrieval

- **Visual Aids**: Refer to component diagrams frequently. Use Excalidraw source files to customize or draw on diagrams during lectures.

⚠️ **Common Misconceptions:**

- Students may think Publishers/Aggregators are part of the "core" system - clarify they're optional infrastructure
- Some may assume Publishers are trusted - emphasize they're untrusted and must be verified
- "Decentralized = slow" misconception - Walrus is designed for performance
- Students might think shards are static - they change every epoch (2 weeks)

💬 **Discussion Points:**

- **Q: Why are Publishers and Aggregators optional?**  
  A: Users can interact directly with Sui and storage nodes. Publishers/Aggregators provide convenience (HTTP APIs) but aren't required for the system to function.

- **Q: How do users verify Publishers are working correctly?**  
  A: Three methods: (1) Check for point of availability event on-chain, (2) Perform a read to verify blob is retrievable, (3) Re-encode the blob and compare blob ID.

- **Q: What happens if a storage node goes offline?**  
  A: The system only needs 1/3 of slivers to reconstruct, so it can tolerate many nodes being offline. Shard assignments change every epoch (2 weeks).

✅ **Quick Check:**

- Ask students to list the three components and their roles
- "Why are Publishers considered 'untrusted'?"
- "Which component is required vs. optional?"
- "What happens during a storage epoch transition?"

**Transition to Next Section:**

"Now that you understand the components, let's look at how data is actually encoded. The secret sauce is something called erasure coding."

---

### Section 2: Chunk Creation and Encoding (15-20 min)

**Student Material:** [02-chunk-creation.md](./02-chunk-creation.md)

⏱️ **Duration:** 15-20 minutes (most technical section)

🎯 **Key Points to Emphasize:**

- **Erasure Coding**: Creates redundancy without full replication
- **5x Expansion**: Blob size increases ~4.5-5x during encoding (independent of shard count)
- **Systematic Encoding**: First 334 primary slivers contain original (padded) data
- **Deterministic**: Same blob always produces same slivers and blob ID
- **1/3 Reconstruction**: Only need 334 primary slivers to recover blob
- **Merkle Tree**: Blob ID derived from Merkle root of sliver hashes

💡 **Teaching Tips:**

- **Start with the Problem**: Why do we need erasure coding?
  - Redundancy without full replication
  - Fault tolerance
  - Byzantine tolerance
  - Use the **puzzle piece analogy**: "Simple replication is like making 5 photocopies. Erasure coding is like splitting into puzzle pieces where any subset can rebuild the whole picture."

- **Explain Reed-Solomon Codes**:
  - Split into k symbols, encode into n > k symbols
  - Only need 1/3 of symbols to reconstruct
  - Use the Chunk Creation diagram to visualize the process

- **Blob ID Computation**:
  - Merkle tree from sliver hashes
  - Cryptographic identifier
  - Deterministic nature ensures same blob = same ID

- **Systematic Encoding**:
  - First 334 primary slivers contain original data
  - Enables fast random-access reads without full reconstruction
  - Important for performance optimization

- **Visual Demonstration**: Use the encoding diagram to walk through each step of the process.

⚠️ **Common Misconceptions:**

- Students may think erasure coding is "lossy" (like JPEG) - clarify it's lossless
- "5x expansion means 5 copies" - no, it means 5x the size distributed across many nodes
- May worry about complexity - client software handles all encoding/decoding automatically
- Might think 334 is arbitrary - it's based on the encoding parameters for 1000 shards

💬 **Discussion Points:**

- **Q: Why 5x expansion? Isn't that inefficient?**  
  A: The expansion provides redundancy and fault tolerance. You can reconstruct with only 1/3 of slivers, so it's a trade-off between storage efficiency and reliability.

- **Q: What if someone modifies a sliver?**  
  A: The blob ID won't match, and consistency checks will fail. The system can detect and reject corrupted data.

- **Q: How does erasure coding work mathematically?**  
  A: Reed-Solomon codes create linear combinations of source symbols. The encoding matrix allows reconstruction from any subset of symbols.

- **Q: Why Merkle trees for blob IDs?**  
  A: Merkle trees provide efficient verification - you can verify any sliver without downloading all slivers. The root hash uniquely identifies the entire blob.

✅ **Quick Check:**

- "Explain why erasure coding is used (one sentence)"
- "If a blob is 100MB, approximately how large will it be after encoding?" (Answer: ~500MB)
- "Why is the blob ID deterministic?"
- Draw 8 boxes on board, ask: "If I cross out 3 boxes, can we still rebuild?" (Yes - need only 1/3)

**Transition to Next Section:**

"Okay, so we know how data is encoded. Now let's see how it actually flows through the system from upload to retrieval."

---

### Section 3: Data Flow (15-20 min)

**Student Material:** [03-data-flow.md](./03-data-flow.md)

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**

- **Upload Flow**: 8 distinct steps from client to point of availability
- **Retrieval Flow**: 5 steps from request to blob reconstruction
- **Parallel Operations**: Slivers distributed/fetched in parallel for efficiency
- **Point of Availability**: When blob becomes retrievable after certificate posting
- **Verification at Each Step**: Multiple verification points ensure data integrity
- **Redundancy**: Only 1/3 of slivers needed for reconstruction
- **2/3 Quorum**: Need signatures from 2/3 of shards to create certificate

💡 **Teaching Tips:**

- **Walk Through Upload Flow Step-by-Step**:
  - Use the upload flow sequence diagram as a visual guide
  - Emphasize parallel sliver distribution to multiple storage nodes
  - Explain certificate aggregation (needs 2/3 quorum)
  - Point out the "point of availability" milestone
  - Highlight each verification step

- **Walk Through Retrieval Flow**:
  - Show how aggregator queries Sui first for metadata
  - Emphasize parallel fetching (only needs 334 slivers)
  - Explain consistency checks (default and strict). **Note**: Starting with v1.37, the default is the performant check, not strict.
  - Discuss caching opportunities for aggregators

- **Key Properties to Highlight**:
  - Redundancy: 1/3 needed for reconstruction
  - Verifiability: Multiple verification points
  - Efficiency: Parallel operations, caching
  - Decentralization: No single point of failure

- **Use Visual Aids**: Walk through both upload and download flow diagrams step by step. Draw flows on whiteboard:
  - **WRITE:** `[File]` → `Client (encodes)` → `Slivers to [Nodes]` + `Metadata to [Sui]` → `Certificate` → `PoA`
  - **READ:** `Client` → `[Sui] for metadata` → `[Nodes] for slivers` → `Client (rebuilds)` → `[File]`

⚠️ **Common Misconceptions:**

- Students may think Sui stores the actual file data - emphasize it only stores metadata (few KB)
- May assume a "central server" does the encoding - each client does its own encoding
- "What if client goes offline after upload?" - data is already distributed, client only needed for initial upload
- May think blob is available immediately - brief delay for certificate posting (PoA)

💬 **Discussion Points:**

- **Q: What happens if a storage node doesn't respond during upload?**  
  A: The publisher needs 2/3 of shard signatures for quorum. If some nodes don't respond, the publisher can retry or the upload may fail if quorum isn't reached.

- **Q: Can I retrieve a blob immediately after upload?**  
  A: Only after the certificate is posted and point of availability is reached. This happens after storage nodes confirm receipt.

- **Q: What if an aggregator returns wrong data?**  
  A: Clients can verify by re-encoding and comparing blob IDs. The aggregator is untrusted, but clients can detect incorrect responses.

- **Q: What happens during a storage epoch transition?**  
  A: Shard assignments change. Storage nodes must migrate data to new shard owners. Blobs remain accessible throughout the transition.

✅ **Quick Check:**

- "Trace the upload flow from start to finish (list the key steps)"
- "What is 'point of availability' and when does it occur?"
- "Why only 334 slivers needed for retrieval?"
- "Where does verification happen in each flow?"

**Transition to Next Section:**

"Theory is great, but let's get hands-on. We're going to upload and retrieve a real blob and see all of this in action."

---

### Section 4: Hands-On Walkthrough (20-30 min)

**Student Material:** [04-hands-on.md](./04-hands-on.md)

⏱️ **Duration:** 20-30 minutes

🎯 **Key Points to Emphasize:**

- **Two Upload Methods**: Direct CLI upload (`walrus store`) or HTTP upload via Publisher (`curl PUT`)
- **Encoding Overhead**: Observe the ~5x expansion during encoding
- **Parallel Distribution**: Slivers are sent to multiple storage nodes simultaneously
- **Verification Steps**: Storage nodes validate slivers before storing; consistency checks verify integrity
- **On-Chain Tracking**: Sui blockchain records blob metadata, certificates, and point of availability events
- **Retrieval Requirements**: Only 334 primary slivers needed to reconstruct the blob

💡 **Teaching Tips:**

- **Demonstrate First**: Show the complete flow before students try
  - Upload a blob using CLI: `walrus store my-blob.txt --epochs 1`
  - Show the blob ID returned
  - Retrieve the blob: `walrus read <blob-id>`
  - Inspect on-chain state with Sui CLI: `sui client object <blob-object-id>`
  - Use verbose logging: `RUST_LOG=debug walrus store my-blob.txt --epochs 1`

- **Sample Demonstration Flow:**
  1. Create a test file: `echo "Hello, Walrus!" > my-blob.txt`
  2. Upload with debug logging to show phases
  3. Point out key events: encoding time, blob ID, distribution, signatures, certificate
  4. Retrieve and verify content matches
  5. Show on-chain state in Sui explorer

- **Common Issues to Watch For**:
  - **Wallet issues**: Insufficient SUI/WAL tokens
  - **Network connectivity**: Can't reach storage nodes
  - **Blob size**: Exceeding limits (check `walrus info` for current max)
  - **CLI not installed**: Provide installation instructions

⚠️ **Common Misconceptions:**

- Students may expect instant results - encoding takes time for larger files
- May not realize they need both SUI (gas) and WAL (storage) tokens
- Might think blob IDs are random - they're deterministically derived from content
- Could confuse blob ID with Sui object ID - they're different identifiers

💬 **Discussion Points:**

- **Q: Can I delete a blob?**  
  A: Depends on persistence type. Permanent blobs cannot be deleted. Deletable blobs can be removed by the owner.

- **Q: What happens if my upload times out?**  
  A: Check on-chain state first - upload may have succeeded. If not, retry. Don't assume failure.

- **Q: How do I know my upload succeeded?**  
  A: Check for point of availability event on-chain, or perform a read to verify retrievability.

✅ **Quick Check:**

Students should successfully:

- Upload a blob using `walrus store`
- Retrieve a blob using `walrus read`
- Explain what happened at each step
- Identify where encoding, distribution, and verification occurred
- Read the blob ID from the output

**Troubleshooting During Hands-On:**

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Add SUI and WAL to wallet |
| "Blob too large" | Use smaller test file or check `walrus info` for limits |
| CLI not found | Verify installation, check PATH |
| Network timeout | Retry, check network connectivity |
| `RUST_LOG` not working | `export RUST_LOG=debug` before command |

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **Name the three main components and their roles.**
   - Expected: Storage Nodes (store slivers), Publishers (encode/distribute), Aggregators (fetch/reconstruct)

2. **Explain erasure coding in one sentence.**
   - Expected: Splits blob into slivers with redundancy so any 1/3 can reconstruct the original.

3. **What is Point of Availability?**
   - Expected: The moment when certificate is posted on Sui and blob becomes retrievable.

4. **Why are Publishers untrusted?**
   - Expected: They could encode incorrectly or not distribute properly - clients verify via blob ID comparison.

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Students can identify and explain Storage Nodes, Publishers, Aggregators
- [ ] Students understand erasure coding concept (~5x expansion, 1/3 reconstruction)
- [ ] Students can trace upload flow (8 steps) and retrieval flow (5 steps)
- [ ] Students understand Point of Availability and certificate quorum (2/3)
- [ ] Students know Publishers/Aggregators are optional and untrusted
- [ ] Students successfully uploaded and retrieved a blob
- [ ] Students can explain why blob IDs are deterministic

### Quick Poll

- "Raise your hand if you can explain what 'programmable storage' means"
- "Thumbs up if you understand why erasure coding is cheaper than full replication"
- "Show of hands: Who successfully uploaded and retrieved a blob?"

---

## Additional Resources

### For Students

- [Walrus Architecture Documentation](https://docs.wal.app/docs/design/architecture)
- [Encoding Documentation](https://docs.wal.app/docs/design/encoding)
- [Properties and Guarantees](https://docs.wal.app/docs/design/properties)
- [Client CLI Documentation](https://docs.wal.app/docs/usage/client-cli)
- [Web API Documentation](https://docs.wal.app/docs/usage/web-api)

### For Instructors

- [Developer Operations Guide](https://docs.wal.app/docs/dev-guide/dev-operations)
- [Aggregator Operator Guide](https://docs.wal.app/docs/operator-guide/aggregator)
- [Authenticated Publisher Guide](https://docs.wal.app/docs/operator-guide/auth-publisher)

### Diagrams

All diagrams are available in:

- `images/` - SVG format for presentations
- `assets/` - Excalidraw source files for editing

**Tip**: Use the Excalidraw source files to customize diagrams or draw on them during lectures.

---

## Notes for Next Module

Students should now be ready for:

- CLI deep-dive (advanced commands, configuration, troubleshooting)
- Failure handling and recovery strategies
- Storage costs and epoch management
- Building applications using Walrus SDK

**Key Concepts to Reinforce in Future Modules:**

- Verification is critical (blob IDs, on-chain state)
- Publishers/Aggregators are untrusted - always verify
- Point of Availability marks true completion
- Erasure coding enables cost-efficient redundancy
- Storage epochs and blob expiration management

---

## Module Completion Checklist

By the end of this module, students should be able to:

- [ ] Identify and explain the three main components of Walrus (Storage Nodes, Publishers, Aggregators)
- [ ] Understand how erasure coding works and why it's used in Walrus
- [ ] Explain key concepts: slivers, blob IDs, point of availability, storage epochs
- [ ] Trace the complete upload flow from client to point of availability (8 steps)
- [ ] Trace the complete retrieval flow from request to blob reconstruction (5 steps)
- [ ] Successfully upload a blob using Walrus CLI
- [ ] Successfully retrieve a blob and verify it matches the original
- [ ] Inspect blob metadata on Sui blockchain
- [ ] Explain the role of each component in the system
- [ ] Understand why Publishers and Aggregators are optional and untrusted
- [ ] Calculate approximate encoding overhead (~5x expansion)
- [ ] Troubleshoot common issues (insufficient funds, network connectivity, etc.)
