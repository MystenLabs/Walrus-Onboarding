# Instructor's Guide: Module 1 - Introduction to Walrus

## Quick Reference

**Total Time:** 60-75 minutes
**Difficulty:** Beginner to Intermediate
**Hands-on Components:** None (conceptual module)
**Materials Needed:** Whiteboard or digital board for diagrams

**Key Takeaways:**
- Walrus provides programmable decentralized storage for blobs (large, unstructured files)
- Uses erasure coding (RedStuff) for cost-efficient durability (~4.5x replication vs traditional 5-10x)
- Client-orchestrated architecture: clients encode/decode, network stores slivers
- Public by default - not private without client-side encryption

## Prerequisites

### For Students
- Basic understanding of blockchain concepts (transactions, smart contracts)
- Familiarity with cloud storage services (e.g., S3, Google Drive)
- No programming experience required for this module

### For Instructor
- Understanding of Sui blockchain basics
- Ability to explain erasure coding conceptually (analogies provided)
- Reviewed the mermaid diagram in student material

## Classroom Setup

**Advance Prep (10 min before class):**
- [ ] Test that mermaid diagram renders properly
- [ ] Prepare whiteboard space for drawing storage/retrieval flows
- [ ] Queue up key terms to emphasize: "programmable storage," "erasure coding," "public by default"

**Optional Materials:**
- Physical puzzle or blocks to demonstrate erasure coding concept

## Instructor Cheat Sheet

1. **Intro & Learning Objectives (5 min):** Set expectations - focus on "why" not "how"
2. **Purpose of Walrus (10-12 min):** Programmable storage = key differentiator | Analogy: robotic warehouse vs. digital locker
3. **Design Goals (8-10 min):** Emphasize programmability, robustness, cost efficiency | ⚠️ Address "decentralized = slow" misconception
4. **Durability Model (15-18 min):** Use puzzle piece analogy | Connect to cost efficiency | Explain Proof-of-Availability as enforcement
5. **Storage & Retrieval (12-15 min):** Walk through mermaid diagram | Emphasize client-orchestration | Draw write/read flows
6. **What Walrus Is NOT (5-8 min):** 🚨 Critical: NOT private by default | Discuss client-side encryption
7. **Wrap-up & Check (5 min):** Exit ticket - three one-sentence summaries

---

## Section-by-Section Guidance

### Learning Objectives (5 min)
**Student Material:** Lines 3-11

⏱️ **Duration:** 5 minutes

🎯 **Key Points to Emphasize:**
- This module focuses on concepts, not implementation
- Frame around three questions: Why? What problem? How does durability work?
- Set expectation that technical deep-dives come later

💡 **Teaching Tips:**
- Write the three objectives on the board and refer back to them throughout
- Tell students you'll do an "exit ticket" at the end where they write one sentence per objective

✅ **Quick Check:**
- Ask: "What's the difference between understanding 'why' something exists vs. 'how' it works?"

**Transition to Next Section:**
"Let's start with the 'why' - why does Walrus exist in the first place?"

---

### Purpose of Walrus (10-12 min)
**Student Material:** Lines 15-38

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**
- **Programmable storage** is the core differentiator (not just "decentralized storage")
- Pain points: centralized storage = single point of failure, censorship, cost
- First-gen decentralized storage = slow, expensive, not programmable
- Walrus is optimized for blobs (large, unstructured files)

💡 **Teaching Tips:**
- Use the "robotic warehouse" analogy: Most decentralized storage is like a "digital locker" - you put a file in, get a key (hash), and can retrieve it. Walrus is more like a "robotic warehouse" where the "robotic" part (Sui smart contracts) can actively manage the inventory (the stored data) based on rules.
- Relate blobs to concrete examples students know: NFT images, AI models, game assets, videos

⚠️ **Common Misconceptions:**
- Students may think Walrus is just "Dropbox but decentralized" - emphasize the programmability aspect
- Some may confuse "blobs" with database records - clarify blobs are entire files, not structured data

💬 **Discussion Points:**
- "What are some real-world problems with centralized storage? Has anyone here ever lost access to a file because a service went down or changed its rules?"
- "When we say 'programmable storage,' what kind of 'rules' would you want to program?" (Good answers: auto-delete after 1 year, unlock file only after payment, link game asset to NFT)

✅ **Quick Check:**
- Ask 2-3 students: "In one sentence, what problem does Walrus solve?"

**Transition to Next Section:**
"Now that we know why Walrus exists, let's look at the design goals that shaped how it works."

---

### Design Goals (8-10 min)
**Student Material:** Lines 40-52

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Programmability** (Goal 1): Storage as blockchain objects that smart contracts can manipulate
- **Byzantine Fault Tolerance** (Goal 2): Works even if nodes fail or act maliciously
- **Cost Efficiency** (Goal 3): Directly connected to erasure coding (foreshadow next section)
- **Scalability** (Goal 4): Sui as "control plane" enables scaling to thousands of nodes
- **Ease of Use** (Goal 5): CLI, SDKs, HTTP APIs make it accessible

💡 **Teaching Tips:**
- Explain Byzantine Fault Tolerance simply: "It works even if some participants are offline or actively trying to cheat"
- Connect Cost Efficiency to the next section: "We'll see exactly *how* it's cheaper in the durability model"
- Re-emphasize programmability at the start: "Notice Goal #1 - this keeps coming up because it's the brain of the system"

⚠️ **Common Misconceptions:**
- Students often think "decentralized" automatically means "slow" - point out that Walrus is *designed* for performance, which separates it from first-gen solutions
- Some may think Byzantine Fault Tolerance is only about crashes - clarify it also handles malicious behavior

💬 **Discussion Points:**
- "Why is 'programmability' (Goal 1) a bigger deal than just having a decentralized hard drive (Goal 2)?"
- "Can you think of examples where you'd want storage to 'fail gracefully' even if some nodes are malicious?"

✅ **Quick Check:**
- Quick poll: "Raise your hand if you thought decentralized systems are always slower than centralized ones"

**Transition to Next Section:**
"Let's dig into Goal #3, cost efficiency. The secret sauce here is something called erasure coding."

---

### Durability Model and Retention Guarantees (15-18 min)
**Student Material:** Lines 54-74

⏱️ **Duration:** 15-18 minutes (most technical section)

🎯 **Key Points to Emphasize:**
- **Erasure coding (RedStuff)** splits files into slivers + creates redundant slivers
- Can rebuild the file even if 2/3 of slivers are lost
- ~4.5x replication overhead vs. 5-10x for simple copying
- **Proof-of-Availability (PoA)**: Random challenges ensure nodes store data

💡 **Teaching Tips:**
- Use the **puzzle piece analogy**: "Simple replication is like making 5 full photocopies of your homework. If you lose 4, you still have one. Safe, but you've used 5x the paper. Erasure coding (RedStuff) is like taking your homework, splitting it into 5 unique puzzle pieces, and adding 3 'magic' puzzle pieces. The trick is that *any 5* of the total 8 pieces can rebuild the *entire* page. You get massive safety (losing 3 pieces is fine!) without making 5 full copies."
- If you have physical objects (blocks, puzzle pieces), use them to demonstrate
- Explain PoA as the "enforcement mechanism" - the network doesn't just trust nodes, it randomly checks them

⚠️ **Common Misconceptions:**
- Students may think erasure coding is "lossy" (like JPEG compression) - clarify it's lossless, can perfectly rebuild the file
- Some may think 4.5x replication means 4.5 copies - clarify it means 4.5x the original file size distributed across many nodes
- Students might worry about the complexity - reassure them the client software handles all encoding/decoding automatically

💬 **Discussion Points:**
- "What's the trade-off between replication and erasure coding?" (Replication is simple but expensive; erasure coding is more complex but efficient)
- "Why is it important to have 'random' challenges rather than predictable ones?"

✅ **Quick Check:**
- Draw 8 boxes on the board, label 5 as "original data" and 3 as "parity/redundant"
- Ask: "If I cross out 3 boxes, can we still rebuild the file? What about 4 boxes?"

**If Time Permits / Advanced Group:**
- Discuss: "What would happen if 50% of storage nodes went offline simultaneously?"
- Challenge: "Why use 2D erasure coding instead of simpler 1D encoding?"

**Transition to Next Section:**
"Okay, so we know Walrus uses this clever encoding. Now let's see how data actually flows through the system."

---

### Storage and Retrieval in Simple Terms (12-15 min)
**Student Material:** Lines 76-115

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**
- **Client-orchestrated**: Client does encoding/decoding, not a central server
- Write path: Client encodes → distributes slivers to nodes → registers metadata on Sui
- Read path: Client requests → fetches metadata from Sui → fetches slivers from nodes → rebuilds file
- **Control Plane (Sui) vs. Storage Plane (Nodes)**: Separation enables scalability

💡 **Teaching Tips:**
- Walk through the mermaid diagram step by step (see detailed walkthrough below)
- Draw the write and read flows on whiteboard as you explain:
  - **WRITE:** `[Your File]` → `Client (splits)` → `Slivers to [Nodes]` + `Metadata to [Sui]`
  - **READ:** `Client` → `[Sui] for metadata` → `[Nodes] for slivers` → `Client (rebuilds)` → `[Your File]`
- Emphasize that Sui only handles lightweight metadata (few KB), not the actual file data

#### Mermaid Diagram Walkthrough Script

**Goal:** Use the diagram to visually prove why Walrus is cheap and scalable.

1. **The Client is the Chef (User → File):**
   - "Notice that the first step happens *on the user's device*. The 'Client' is doing the hard work of chopping the file into pieces (slivers) using RedStuff. This isn't happening on a central server."

2. **The Heavy Lifting (File → Storage Nodes):**
   - "Follow the arrow to the Storage Nodes. This is where the 'Heavy Data' goes. If you have a 1GB video, 1GB+ of data (with redundancy) flows here. These nodes are like dumb lockers—they just hold the stuff."

3. **The Brain (User → Sui Blockchain):**
   - "Now look at the arrow going to Sui. This is 'Light Data' (Metadata). Even for a 1GB video, this might only be a few kilobytes of text describing *where* the slivers are. This is why it's cheap: we aren't clogging the blockchain with the actual video file."

4. **The Police (Sui ↔ Storage Nodes):**
   - "Finally, the dotted line. Sui acts as the 'Control Plane.' It doesn't hold the data, but it *polices* the nodes. It randomly challenges them: 'Do you still have piece #45?' If they say yes, Sui pays them. If no, they get fined."

⚠️ **Common Misconceptions:**
- Students may think Sui stores the actual file data - emphasize it only stores metadata
- Some may assume a "central client" does the encoding - clarify each user's client does its own encoding
- Students might wonder "what if the client goes offline after uploading?" - explain the data is already distributed, client only needed for initial upload

💬 **Discussion Points:**
- "Why is it important that the client does the encoding, not a central server?"
- "What happens if some storage nodes are slow or offline when you're trying to read a file?"

✅ **Quick Check:**
- Point to the diagram and ask: "Which part of the diagram handles the 1GB video file?" (Storage Nodes)
- "Which part handles the 'receipt' or 'map'?" (Sui Blockchain)

**If Time Permits:**
- Walk through the read path in detail, emphasizing that you only need *enough* slivers, not *all* slivers

**Transition to Next Section:**
"Alright, we've covered what Walrus *is* and how it works. Now let's talk about what it is *NOT* - this is critical to avoid misunderstandings."

---

### What Walrus Is Not (5-8 min)
**Student Material:** Lines 117-127

⏱️ **Duration:** 5-8 minutes

🎯 **Key Points to Emphasize:**
- 🚨 **NOT private by default** - this is the most critical point
- NOT a traditional cloud provider (it's peer-to-peer)
- NOT a general-purpose database (optimized for blobs, not queries)
- NOT a simple file-sharing service (main power is programmability)

💡 **Teaching Tips:**
- Start with the privacy point and really hammer it home
- Use concrete examples: "If you upload a company logo, anyone with the blob ID can see it"
- Explain client-side encryption: User encrypts file before upload → network stores encrypted blob → only user can decrypt

⚠️ **Common Misconceptions:**
- 🚨 **CRITICAL:** Many people hear "blockchain" or "decentralized" and assume "private" or "anonymous" - Walrus is the opposite, it's a *public* network
- Students may think Walrus can replace their SQL database - clarify it's for file storage, not structured queries
- Some may expect traditional cloud features (versioning, permissions) - these would need to be built in the application layer

💬 **Discussion Points:**
- "If Walrus is totally public, how could you *ever* use it for sensitive data, like a company's financial records?"
  - **Answer:** You (the client) would have to encrypt the file *before* you upload it. The network would store the meaningless, encrypted "blob." This is a key concept: "client-side encryption."
- "Why might a developer choose Walrus over AWS S3 for their application?"

✅ **Quick Check:**
- True/False quiz:
  - "Walrus automatically encrypts my files" (False)
  - "I can run SQL queries on Walrus" (False)
  - "Smart contracts on Sui can interact with my stored files" (True)

**Transition to Wrap-up:**
"Let's take a moment to review what we've covered and check your understanding."

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to write (or verbally share) one-sentence answers to each learning objective:

1. **Why does Walrus exist?** (Expected: To provide programmable, decentralized storage for large files)
2. **What basic problem does it solve?** (Expected: Storing blobs in a way smart contracts can manage)
3. **How does the durability model work?** (Expected: Uses erasure coding to rebuild files even if many pieces are lost)

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Students can explain the difference between Walrus and traditional decentralized storage (programmability)
- [ ] Students can describe erasure coding conceptually (puzzle piece analogy)
- [ ] Students understand the client-orchestrated architecture (who does what)
- [ ] Students know Walrus is public by default and can explain client-side encryption
- [ ] Students can identify appropriate use cases for Walrus (blobs, not databases)

### Quick Poll

- "Raise your hand if you can explain what 'programmable storage' means to a friend"
- "Thumbs up if you understand why erasure coding is cheaper than replication"

---

## Additional Resources

If students want to dive deeper:

- Walrus Whitepaper (for technical details on RedStuff encoding)
- Sui Blockchain Documentation (to understand the smart contract integration)
- Video: "Erasure Coding Explained" (search for visual demonstrations)

---

## Notes for Next Module

Students should now be ready for:
- Hands-on Walrus CLI usage (storing and retrieving blobs)
- Architecture deep-dive (how Sui coordinates storage nodes)
- Building applications that use Walrus storage

**Key Concepts to Reinforce in Future Modules:**
- Programmability (connect to actual smart contract code)
- Client-side encryption (for privacy use cases)
- Control plane vs. storage plane separation
