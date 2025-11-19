# Instructor's Guide: Walrus Architecture

This guide provides instructors with structured guidance for teaching Module 2: Walrus Architecture. Use this document to prepare your lessons, understand key concepts, and effectively deliver the curriculum.

## Learning Objectives

By the end of this module, students should be able to:

1. **Identify and explain** the three main components of Walrus (Storage Nodes, Publishers, Aggregators)
2. **Understand** how erasure coding works and why it's used in Walrus
3. **Trace** the complete data flow from blob upload to retrieval
4. **Execute** hands-on exercises to store and retrieve blobs
5. **Explain** key concepts like slivers, blob IDs, and point of availability

## Prerequisites

### For Students

**Knowledge Prerequisites:**

- **Basic understanding of blockchain concepts**: Familiarity with blockchain basics, smart contracts, and on-chain transactions
- **HTTP APIs**: Understanding of REST APIs, HTTP methods (GET, PUT), and how web services work
- **Command-line familiarity**: Comfortable using terminal/command prompt for basic operations
- **Basic programming concepts**: Understanding of data structures, encoding, and cryptographic concepts (hashes, Merkle trees)

**Technical Prerequisites (for Hands-On Exercises):**

- **Walrus CLI installed**: Students need the Walrus CLI tool installed on their system
  - Installation guide: [Getting Started](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)
- **Access to Walrus network**: Either testnet or mainnet access
- **Wallet setup**: A wallet with sufficient SUI (for gas) and WAL tokens (for storage fees) for direct uploads
  - **OR** access to a publisher endpoint for HTTP-based uploads (alternative to direct CLI uploads)
- **Sui CLI** (optional but recommended): For inspecting on-chain state during exercises

### For Instructor

Before teaching this module, instructors should:

- Have hands-on experience with Walrus CLI
- Be familiar with the Walrus architecture documentation
- Test all hands-on exercises beforehand
- Have access to a test environment or testnet for demonstrations
- Prepare troubleshooting responses for common issues
- Review all visual aids and diagrams before class
- Understand the complete data flow from upload to retrieval

## Section-by-Section Guidance

### Section 1: System Components

**Key Points to Emphasize:**

- **Storage Nodes are core**: Everything else is optional infrastructure
- **Decentralization**: No single point of failure
- **Untrusted Publishers**: Users can verify publisher work
- **Byzantine Tolerance**: System works even if 1/3 of nodes are malicious
- **Shard Assignment**: Controlled by Sui smart contracts and changes every storage epoch (2 weeks)

**Teaching Tips:**

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

**Quick Check:**

Ask students to:

- List the three components and their roles
- Explain why Publishers are considered "untrusted"
- Describe what happens during a storage epoch transition
- Identify which component is required vs. optional

**Discussion Points:**

- **Q: Why are Publishers and Aggregators optional?**  
  A: Users can interact directly with Sui and storage nodes. Publishers/Aggregators provide convenience (HTTP APIs) but aren't required for the system to function.

- **Q: How do users verify Publishers are working correctly?**  
  A: Three methods: (1) Check for point of availability event on-chain, (2) Perform a read to verify blob is retrievable, (3) Re-encode the blob and compare blob ID.

- **Q: What happens if a storage node goes offline?**  
  A: The system only needs 1/3 of slivers to reconstruct, so it can tolerate many nodes being offline. Shard assignments change every epoch (2 weeks).
DHT.

---

### Section 2: Chunk Creation and Encoding

**Key Points to Emphasize:**

- **Erasure Coding**: Creates redundancy without full replication
- **5x Expansion**: Blob size increases ~5x during encoding (independent of shard count)
- **Systematic Encoding**: First 334 primary slivers contain original (padded) data
- **Deterministic**: Same blob always produces same slivers and blob ID
- **1/3 Reconstruction**: Only need 1/3 of slivers to recover blob
- **Merkle Tree**: Blob ID derived from Merkle root of sliver hashes

**Teaching Tips:**

- **Start with the Problem**: Why do we need erasure coding?
  - Redundancy without full replication
  - Fault tolerance
  - Byzantine tolerance
  - Use analogies like RAID systems if helpful

- **Explain Reed-Solomon Codes**:
  - Split into k symbols, encode into n > k symbols
  - Only need k symbols to reconstruct (but Walrus needs 1/3)
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

**Quick Check:**

Ask students to:

- Explain why erasure coding is used
- Describe what happens during encoding (high-level)
- Explain why blob ID is deterministic
- Calculate: If a blob is 100MB, approximately how large will it be after encoding? (Answer: ~500MB)

**Discussion Points:**

- **Q: Why 5x expansion? Isn't that inefficient?**  
  A: The expansion provides redundancy and fault tolerance. You can reconstruct with only 1/3 of slivers, so it's a trade-off between storage efficiency and reliability.

- **Q: What if someone modifies a sliver?**  
  A: The blob ID won't match, and consistency checks will fail. The system can detect and reject corrupted data.

- **Q: How does erasure coding work mathematically?**  
  A: Reed-Solomon codes create linear combinations of source symbols. The encoding matrix allows reconstruction from any k symbols, but Walrus's specific implementation requires 1/3.

- **Q: Why Merkle trees for blob IDs?**  
  A: Merkle trees provide efficient verification - you can verify any sliver without downloading all slivers. The root hash uniquely identifies the entire blob.

---

### Section 3: Data Flow

**Key Points to Emphasize:**

- **Upload Flow**: 8 distinct steps from client to point of availability
- **Retrieval Flow**: 5 steps from request to blob reconstruction
- **Parallel Operations**: Slivers distributed/fetched in parallel for efficiency
- **Point of Availability**: When blob becomes retrievable after certificate posting
- **Verification at Each Step**: Multiple verification points ensure data integrity
- **Redundancy**: Only 1/3 of slivers needed for reconstruction

**Teaching Tips:**

- **Walk Through Upload Flow Step-by-Step**:
  - Use the upload flow sequence diagram as a visual guide
  - Emphasize parallel sliver distribution to multiple storage nodes
  - Explain certificate aggregation (needs 2/3 quorum)
  - Point out the "point of availability" milestone
  - Highlight each verification step

- **Walk Through Retrieval Flow**:
  - Show how aggregator queries Sui first for metadata
  - Emphasize parallel fetching (only needs 334 slivers)
  - Explain consistency checks (default and strict)
  - Discuss caching opportunities for aggregators

- **Key Properties to Highlight**:
  - Redundancy: 1/3 needed for reconstruction
  - Verifiability: Multiple verification points
  - Efficiency: Parallel operations, caching
  - Decentralization: No single point of failure

- **Use Visual Aids**: Refer to both upload and download flow diagrams. Walk through the sequence diagrams step by step.

**Quick Check:**

Ask students to:

- Trace the upload flow from start to finish (list all 8 steps)
- Explain what "point of availability" means and when it occurs
- Describe the retrieval flow (list all 5 steps)
- Explain why only 334 slivers are needed for retrieval
- Identify where verification happens in each flow

**Discussion Points:**

- **Q: What happens if a storage node doesn't respond during upload?**  
  A: The publisher needs 2/3 of shard signatures for quorum. If some nodes don't respond, the publisher can retry or the upload may fail if quorum isn't reached.

- **Q: Can I retrieve a blob immediately after upload?**  
  A: Only after the certificate is posted and point of availability is reached. This happens after storage nodes confirm receipt.

- **Q: What if an aggregator returns wrong data?**  
  A: Clients can verify by re-encoding and comparing blob IDs. The aggregator is untrusted, but clients can detect incorrect responses.

- **Q: What happens during a storage epoch transition?**  
  A: Shard assignments change. Storage nodes must migrate data to new shard owners. Blobs remain accessible throughout the transition.

---

### Section 4: Hands-On Walkthrough

**Key Points to Emphasize:**

- **Two Upload Methods**: Direct CLI upload or HTTP upload via Publisher
- **Encoding Overhead**: Observe the 5x expansion during encoding
- **Parallel Distribution**: Slivers are sent to multiple storage nodes simultaneously
- **Verification Steps**: Storage nodes validate slivers before storing; consistency checks verify integrity
- **On-Chain Tracking**: Sui blockchain records blob metadata, certificates, and point of availability events
- **Retrieval Requirements**: Only 334 primary slivers needed to reconstruct the blob

**Teaching Tips:**

- **Demonstrate First**: Show the complete flow before students try
  - Upload a blob using CLI (`walrus store`)
  - Show the blob ID returned
  - Retrieve the blob (`walrus read`)
  - Inspect on-chain state with Sui CLI
  - Use verbose logging (`RUST_LOG=debug`) to show what's happening

- **Common Issues to Watch For**:
  - **Wallet issues**: Insufficient SUI/WAL tokens
  - **Network connectivity**: Can't reach storage nodes
  - **Blob size**: Exceeding limits (13.3 GiB)
  - **CLI not installed**: Provide installation instructions

**Quick Check:**

Students should successfully:


- Explain what happened at each step
- Identify where encoding, distribution, and verification occurred

**Discussion Points:**

- **Q: Can I delete a blob?**  
  A: Depends on persistence type. Permanent blobs cannot be deleted. Deletable blobs can be removed by the owner.

---

## Assessment Suggestions

### Formative Assessment (During Learning)

1. **Quick Checks**: After each section, ask 2-3 questions to gauge understanding
2. **Think-Pair-Share**: Have students explain concepts to each other
3. **Diagram Labeling**: Provide blank diagrams for students to fill in component names and flows
4. **Flow Tracing**: Give a scenario and ask students to trace the upload/retrieval flow

### Summative Assessment (End of Module)

1. **Conceptual Questions**:
   - Explain the role of each component (Storage Nodes, Publishers, Aggregators)
   - Describe the encoding process and why erasure coding is used
   - Trace a complete upload/retrieval flow with all steps

2. **Practical Exercise**:
   - Inspect on-chain state and explain what you see

### Diagrams

All diagrams are available in:

- `images/` - SVG format for presentations
- `assets/` - Excalidraw source files for editing

**Tip**: Use the Excalidraw source files to customize diagrams or draw on them during lectures.

## Official Documentation for Reference

- [Walrus Architecture Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/architecture.md)
- [Developer Operations Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/dev-operations.md)
- [Properties Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/properties.md)
- [Getting Started Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)
- [Client CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md)
- [Web API Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/web-api.md)
- [Storage Node Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/operator-guide/storage-node.md)
- [Aggregator Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/operator-guide/aggregator.md)
- [Authenticated Publisher Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/operator-guide/auth-publisher.md)

## Module Completion Checklist

By the end of this module, students should be able to:

- [ ] Identify and explain the three main components of Walrus (Storage Nodes, Publishers, Aggregators)
- [ ] Understand how erasure coding works and why it's used in Walrus
- [ ] Explain key concepts: slivers, blob IDs, point of availability, storage epochs
- [ ] Trace the complete upload flow from client to point of availability (all 8 steps)
- [ ] Trace the complete retrieval flow from request to blob reconstruction (all 5 steps)
- [ ] Successfully upload a blob using Walrus CLI
- [ ] Successfully retrieve a blob and verify it matches the original
- [ ] Inspect blob metadata on Sui blockchain
- [ ] Explain the role of each component in the system
- [ ] Understand why Publishers and Aggregators are optional infrastructure
- [ ] Calculate approximate encoding overhead (5x expansion)
- [ ] Troubleshoot common issues (insufficient funds, network connectivity, etc.)

---