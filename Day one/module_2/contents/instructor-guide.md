# Instructor Guide: Walrus Architecture

This guide provides instructors with structured guidance for teaching Module 2: Walrus Architecture. Use this document to prepare your lessons, understand key concepts, and effectively deliver the curriculum.

## Prerequisites

Before students begin this module, they should have:

### Knowledge Prerequisites

- **Basic understanding of blockchain concepts**: Familiarity with blockchain basics, smart contracts, and on-chain transactions
- **HTTP APIs**: Understanding of REST APIs, HTTP methods (GET, PUT), and how web services work
- **Command-line familiarity**: Comfortable using terminal/command prompt for basic operations
- **Basic programming concepts**: Understanding of data structures, encoding, and cryptographic concepts (hashes, Merkle trees)

### Technical Prerequisites (for Hands-On Exercises)

- **Walrus CLI installed**: Students need the Walrus CLI tool installed on their system
  - Installation guide: [Getting Started](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)
- **Access to Walrus network**: Either testnet or mainnet access
- **Wallet setup**: A wallet with sufficient SUI (for gas) and WAL tokens (for storage fees) for direct uploads
  - **OR** access to a publisher endpoint for HTTP-based uploads (alternative to direct CLI uploads)
- **Sui CLI** (optional but recommended): For inspecting on-chain state during exercises

### Instructor Preparation

Before teaching this module, instructors should:

- Have hands-on experience with Walrus CLI
- Be familiar with the Walrus architecture documentation
- Test all hands-on exercises beforehand
- Have access to a test environment or testnet for demonstrations
- Prepare troubleshooting responses for common issues (see Troubleshooting Guide section)

## Learning Objectives

By the end of this module, students should be able to:

1. **Identify and explain** the three main components of Walrus (Storage Nodes, Publishers, Aggregators)
2. **Understand** how erasure coding works and why it's used in Walrus
3. **Trace** the complete data flow from blob upload to retrieval
4. **Execute** hands-on exercises to store and retrieve blobs
5. **Explain** key concepts like slivers, blob IDs, and point of availability

## Section-by-Section Guide

### Section 1: System Components (45 minutes)

#### Key Concepts to Emphasize

- **Storage Nodes are core**: Everything else is optional infrastructure
- **Decentralization**: No single point of failure
- **Untrusted Publishers**: Users can verify publisher work
- **Byzantine Tolerance**: System works even if 1/3 of nodes are malicious

#### Teaching Tips

1. **Start with Storage Nodes**: They're the foundation - everything else builds on them
   - Explain shard assignment and storage epochs
   - Emphasize the role of Sui smart contracts in coordination

2. **Publishers as Optional Infrastructure**:
   - Explain why they're useful (HTTP interface, bandwidth savings)
   - Stress that they're untrusted - users can verify
   - Show the verification methods (on-chain events, re-encoding)

3. **Aggregators as Optional Infrastructure**:
   - Explain their role in reconstruction
   - Emphasize they don't perform on-chain actions (only reads)
   - Discuss caching benefits

#### Common Questions

**Q: Why are Publishers and Aggregators optional?**  
A: Users can interact directly with Sui and storage nodes. Publishers/Aggregators provide convenience (HTTP APIs) but aren't required for the system to function.

**Q: How do users verify Publishers are working correctly?**  
A: Three methods: (1) Check for point of availability event on-chain, (2) Perform a read to verify blob is retrievable, (3) Re-encode the blob and compare blob ID.

**Q: What happens if a storage node goes offline?**  
A: The system only needs 1/3 of slivers to reconstruct, so it can tolerate many nodes being offline. Shard assignments change every epoch (2 weeks).

#### Assessment Checkpoint

Ask students to:
- List the three components and their roles
- Explain why Publishers are considered "untrusted"
- Describe what happens during a storage epoch transition

---

### Section 2: Chunk Creation and Encoding (45 minutes)

#### Key Concepts to Emphasize

- **Erasure Coding**: Creates redundancy without full replication
- **5x Expansion**: Blob size increases ~5x during encoding
- **Systematic Encoding**: First 334 slivers contain original data
- **Deterministic**: Same blob always produces same slivers and blob ID
- **1/3 Reconstruction**: Only need 1/3 of slivers to recover blob

#### Teaching Tips

1. **Start with the Problem**: Why do we need erasure coding?
   - Redundancy without full replication
   - Fault tolerance
   - Byzantine tolerance

2. **Explain Reed-Solomon Codes**:
   - Split into k symbols, encode into n > k symbols
   - Only need k symbols to reconstruct (but Walrus needs 1/3)
   - Use analogies if helpful (like RAID systems)

3. **Blob ID Computation**:
   - Merkle tree from sliver hashes
   - Cryptographic identifier
   - Deterministic nature

4. **Systematic Encoding**:
   - First 334 primary slivers contain original data
   - Enables fast random-access reads
   - Important for performance

#### Common Questions

**Q: Why 5x expansion? Isn't that inefficient?**  
A: The expansion provides redundancy and fault tolerance. You can reconstruct with only 1/3 of slivers, so it's a trade-off between storage efficiency and reliability.

**Q: Why exactly 334 primary slivers?**  
A: This is determined by the erasure coding parameters. The first 334 contain the systematic (original) data, enabling fast reads without full reconstruction.

**Q: What if someone modifies a sliver?**  
A: The blob ID won't match, and consistency checks will fail. The system can detect and reject corrupted data.

#### Assessment Checkpoint

Ask students to:
- Explain why erasure coding is used
- Describe what happens during encoding (high-level)
- Explain why blob ID is deterministic
- Calculate: If a blob is 100MB, approximately how large will it be after encoding?

---

### Section 3: Data Flow (60 minutes)

#### Key Concepts to Emphasize

- **Upload Flow**: 8 distinct steps from client to point of availability
- **Retrieval Flow**: 5 steps from request to blob reconstruction
- **Parallel Operations**: Slivers distributed/fetched in parallel
- **Point of Availability**: When blob becomes retrievable
- **Verification at Each Step**: Multiple verification points

#### Teaching Tips

1. **Walk Through Upload Flow Step-by-Step**:
   - Use the sequence diagram as a visual guide
   - Emphasize parallel sliver distribution
   - Explain certificate aggregation (needs 2/3 quorum)
   - Point out the "point of availability" milestone

2. **Walk Through Retrieval Flow**:
   - Show how aggregator queries Sui first
   - Emphasize parallel fetching (only needs 334 slivers)
   - Explain consistency checks
   - Discuss caching opportunities

3. **Key Properties**:
   - Redundancy: 1/3 needed for reconstruction
   - Verifiability: Multiple verification points
   - Efficiency: Parallel operations, caching
   - Decentralization: No single point of failure

#### Common Questions

**Q: What happens if a storage node doesn't respond during upload?**  
A: The publisher needs 2/3 of shard signatures for quorum. If some nodes don't respond, the publisher can retry or the upload may fail if quorum isn't reached.

**Q: Can I retrieve a blob immediately after upload?**  
A: Only after the certificate is posted and point of availability is reached. This happens after storage nodes confirm receipt.

**Q: What if an aggregator returns wrong data?**  
A: Clients can verify by re-encoding and comparing blob IDs. The aggregator is untrusted, but clients can detect incorrect responses.

#### Assessment Checkpoint

Ask students to:
- Trace the upload flow from start to finish
- Explain what "point of availability" means
- Describe the retrieval flow
- Explain why only 334 slivers are needed for retrieval

---

### Section 4: Hands-On Walkthrough (30-45 minutes)

#### Prerequisites Check

Before starting, ensure students have:
- ✅ Walrus CLI installed
- ✅ Access to testnet/mainnet
- ✅ Wallet with SUI/WAL tokens OR access to publisher endpoint
- ✅ Basic command-line familiarity

#### Teaching Tips

1. **Demonstrate First**: Show the complete flow before students try
   - Upload a blob using CLI
   - Show the blob ID returned
   - Retrieve the blob
   - Inspect on-chain state

2. **Common Issues to Watch For**:
   - **Wallet issues**: Insufficient SUI/WAL tokens
   - **Network connectivity**: Can't reach storage nodes
   - **Blob size**: Exceeding limits (13.3 GiB)
   - **CLI not installed**: Provide installation instructions

3. **Encourage Exploration**:
   - Try both upload methods (CLI and HTTP)
   - Use verbose logging (`RUST_LOG=debug`)
   - Inspect on-chain state with Sui CLI
   - Try retrieving from different aggregators

4. **Key Observations to Highlight**:
   - Encoding overhead (5x expansion)
   - Parallel distribution happening
   - Verification steps
   - On-chain coordination

#### Troubleshooting Guide

**Issue**: `walrus store` fails with "insufficient funds"  
**Solution**: Ensure wallet has SUI for gas and WAL tokens for storage fees

**Issue**: Upload hangs or times out  
**Solution**: Check network connectivity to storage nodes. Try verbose logging to see where it's stuck.

**Issue**: Retrieval fails with "blob not found"  
**Solution**: Verify blob ID is correct. Check blob status on Sui - it might be invalid or not yet available.

**Issue**: CLI command not found  
**Solution**: Install Walrus CLI following the [Getting Started guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)

#### Assessment Checkpoint

Students should successfully:
- Upload a blob and receive a blob ID
- Retrieve the blob and verify it matches the original
- Inspect the blob on Sui blockchain
- Explain what happened at each step

---

## Common Student Questions

### General Architecture Questions

**Q: How is Walrus different from IPFS?**  
A: Walrus uses erasure coding and Byzantine fault tolerance, integrates with Sui blockchain for coordination, and has verifiable storage guarantees. IPFS uses content addressing and DHT.

**Q: Can I run my own storage node?**  
A: Yes, but you need to participate in Sui governance and be assigned shards. See the [Storage Node Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/operator-guide/storage-node.md).

**Q: What's the maximum blob size?**  
A: Currently 13.3 GiB. Larger blobs should be split into chunks before storage.

### Technical Deep Dives

**Q: How does erasure coding work mathematically?**  
A: Reed-Solomon codes create linear combinations of source symbols. The encoding matrix allows reconstruction from any k symbols, but Walrus's specific implementation requires 1/3.

**Q: Why Merkle trees for blob IDs?**  
A: Merkle trees provide efficient verification - you can verify any sliver without downloading all slivers. The root hash uniquely identifies the entire blob.

**Q: What happens during a storage epoch transition?**  
A: Shard assignments change. Storage nodes must migrate data to new shard owners. Blobs remain accessible throughout the transition.

### Practical Questions

**Q: How much does it cost to store data?**  
A: Costs depend on blob size, storage duration (epochs), and network fees. Check current rates on the network you're using.

**Q: Can I delete a blob?**  
A: Depends on persistence type. Permanent blobs cannot be deleted. Deletable blobs can be removed by the owner.

**Q: How do I know my data is safe?**  
A: The system provides multiple guarantees: erasure coding redundancy, Byzantine fault tolerance, on-chain verification, and cryptographic proofs.

---

## Assessment Strategies

### Formative Assessment (During Learning)

1. **Quick Checks**: After each section, ask 2-3 questions
2. **Think-Pair-Share**: Have students explain concepts to each other
3. **Diagram Labeling**: Provide blank diagrams for students to fill in
4. **Flow Tracing**: Give a scenario and ask students to trace the flow

### Summative Assessment (End of Module)

1. **Conceptual Questions**:
   - Explain the role of each component
   - Describe the encoding process
   - Trace a complete upload/retrieval flow

2. **Practical Exercise**:
   - Upload a blob and document each step
   - Retrieve a blob and verify integrity
   - Inspect on-chain state

3. **Troubleshooting Scenario**:
   - Present a problem (e.g., "Upload fails")
   - Ask students to diagnose and solve

### Rubric Suggestions

**Excellent (90-100%)**:
- Correctly explains all components and their roles
- Understands encoding process and can explain it
- Successfully completes hands-on exercises
- Can troubleshoot common issues

**Good (75-89%)**:
- Understands most concepts with minor gaps
- Can complete hands-on exercises with minimal help
- Basic troubleshooting ability

**Satisfactory (60-74%)**:
- Understands core concepts
- Needs guidance for hands-on exercises
- Limited troubleshooting ability

---

## Additional Resources

### For Instructors

- [Walrus Architecture Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/design/architecture.md)
- [Developer Operations Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/dev-operations.md)
- [Properties Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/properties.md)

### For Students

- [Getting Started Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)
- [Client CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/usage/client-cli.md)
- [Web API Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/web-api.md)

### Diagrams

All diagrams are available in:
- `images/` - SVG format for presentations
- `assets/` - Excalidraw source files for editing

---

## Time Management

### Suggested Schedule

- **Introduction & Overview**: 10 minutes
- **System Components**: 45 minutes
- **Break**: 10 minutes
- **Chunk Creation & Encoding**: 45 minutes
- **Data Flow**: 60 minutes
- **Break**: 10 minutes
- **Hands-On Walkthrough**: 45 minutes
- **Q&A & Wrap-up**: 15 minutes

**Total**: ~3 hours 20 minutes (with breaks)

### Flexible Options

- **Condensed Version** (2 hours): Focus on components and data flow, skip deep encoding details
- **Extended Version** (4 hours): Add more hands-on practice, deeper technical discussions
- **Self-Paced**: Students can work through content independently with instructor available for questions

---

## Tips for Success

1. **Use Visuals**: The diagrams are essential - refer to them frequently
2. **Encourage Questions**: Stop frequently for Q&A, especially after complex concepts
3. **Relate to Familiar Concepts**: Compare to RAID systems, CDNs, or other distributed systems
4. **Hands-On is Key**: The practical exercise solidifies understanding
5. **Address Misconceptions**: Common ones include:
   - Thinking Publishers are required (they're optional)
   - Believing full replication is used (it's erasure coding)
   - Assuming immediate retrieval after upload (must wait for point of availability)

---

## Feedback and Improvements

This instructor guide is a living document. Please provide feedback on:
- Sections that need more detail
- Common questions not covered
- Teaching strategies that worked well
- Time estimates that need adjustment

---

## Quick Reference: Key Concepts

| Concept | Definition |
|---------|------------|
| **Storage Node** | Core infrastructure that stores encoded blob data in shards |
| **Publisher** | Optional HTTP service that encodes and distributes blobs |
| **Aggregator** | Optional HTTP service that reconstructs blobs from slivers |
| **Sliver** | Collection of symbols assigned to a specific shard |
| **Blob ID** | Cryptographic identifier derived from Merkle root of sliver hashes |
| **Erasure Coding** | Redundancy mechanism requiring only 1/3 of slivers for reconstruction |
| **Point of Availability** | When a blob becomes retrievable after certificate posting |
| **Storage Epoch** | Period (2 weeks) during which shard assignments remain constant |
| **Byzantine Tolerance** | System works correctly even if 1/3 of nodes are malicious |
| **Systematic Encoding** | First 334 primary slivers contain original (padded) data |

---

Good luck with your instruction! Remember: the goal is understanding, not memorization. Encourage students to think about *why* the system works this way, not just *how*.
