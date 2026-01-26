# Day 1 Comprehensive Quiz: Walrus Fundamentals

This quiz covers Modules 1-7 from Day 1 of the Walrus Training Program.

---

## Section 1: Fundamentals

### Question 1.1 (Multiple Choice)
What is the primary differentiator that makes Walrus unique compared to other decentralized storage solutions?

A) It uses blockchain technology
B) It's faster than centralized storage
C) Programmable storage via Sui smart contracts
D) It's completely free to use

### Question 1.2 (True/False)

Mark each statement as TRUE or FALSE:

a) \_\_\_ Walrus provides privacy by default - your data is automatically encrypted.

b) \_\_\_ Walrus uses erasure coding (RedStuff) to achieve durability with approximately 4.5x replication overhead.

c) \_\_\_ Storage Nodes are optional infrastructure components, similar to Publishers and Aggregators.

d) \_\_\_ The same blob uploaded twice will produce different blob IDs each time.

### Question 1.3 (Fill in the Blank)

Complete the following statements:

a) Walrus requires \_\_\_\_\_\_\_\_ primary slivers to reconstruct a blob.

b) To reach quorum during upload, a Publisher needs signatures from at least \_\_\_\_\_\_ of storage nodes.

c) The maximum blob size that Walrus currently supports is \_\_\_\_\_\_\_\_.

d) Walrus can tolerate up to \_\_\_\_\_\_ of storage nodes being Byzantine (malicious or offline).

---

## Section 2: Architecture and Components

### Question 2.1 (Multiple Choice)
Which component is responsible for encoding blobs and distributing slivers to storage nodes?

A) Aggregator
B) Storage Node
C) Publisher
D) Sui Blockchain

### Question 2.2 (Matching)
Match each component to its primary responsibility:

Components:
1. Storage Node
2. Publisher
3. Aggregator
4. Client
5. Sui Blockchain

Responsibilities:
A) Stores slivers and serves them to clients
B) Fetches slivers and reconstructs blobs
C) Encodes blobs and collects signatures
D) Verifies blob IDs and implements retry logic
E) Stores blob metadata and certificates

\_\_\_ Storage Node → \_\_\_
\_\_\_ Publisher → \_\_\_
\_\_\_ Aggregator → \_\_\_
\_\_\_ Client → \_\_\_
\_\_\_ Sui Blockchain → \_\_\_

### Question 2.3 (Short Answer)
Explain the difference between a Publisher and an Aggregator. Why are both considered "untrusted" infrastructure?

---

## Section 3: Data Flow and Operations

### Question 3.1 (Ordering)
Place the following upload workflow steps in the correct order (1-6):

\_\_\_ Post certificate to Sui blockchain
\_\_\_ Encode blob into slivers using erasure coding
\_\_\_ Distribute slivers to storage nodes
\_\_\_ Register blob object on Sui
\_\_\_ Collect signatures from storage nodes
\_\_\_ Client uploads blob to Publisher

### Question 3.2 (Multiple Choice)
What event indicates that a blob has reached its "point of availability"?

A) When the client receives the blob ID
B) When encoding is complete
C) When the certificate is posted to Sui blockchain
D) When all storage nodes have confirmed receipt

### Question 3.3 (Scenario)
You upload a 1 GB file to Walrus. During the upload:
- 700 out of 1000 storage nodes respond with signatures
- The rest timeout or are unreachable

**Questions:**
a) Will the upload succeed? Why or why not?

b) After a successful upload, what's the approximate total size of data stored across all storage nodes?

c) Later, when retrieving this blob, 400 storage nodes are offline. Will retrieval succeed? Explain.

---

## Section 4: Failure Modes and Guarantees

### Question 4.1 (Classification)
Classify each failure as RETRYABLE or NON-RETRYABLE:

a) \_\_\_\_\_\_\_\_\_\_\_\_ Network timeout during sliver distribution
b) \_\_\_\_\_\_\_\_\_\_\_\_ Blob size exceeds 13.3 GiB
c) \_\_\_\_\_\_\_\_\_\_\_\_ Insufficient SUI for gas fees
d) \_\_\_\_\_\_\_\_\_\_\_\_ Transaction timeout (transaction status unknown)
e) \_\_\_\_\_\_\_\_\_\_\_\_ Storage node returned corrupted sliver
f) \_\_\_\_\_\_\_\_\_\_\_\_ Aggregator temporarily offline

### Question 4.2 (Short Answer)
A client uploads a blob but experiences a timeout before receiving confirmation.

a) What should the client check first before retrying?

b) Name two ways the client can verify that the upload actually succeeded.

c) If the client retries without checking and the original upload succeeded, what might happen?

---

## Section 5: System Guarantees vs. Client Responsibilities

### Question 5.1 (True/False)

Mark each as TRUE or FALSE:

a) \_\_\_ The system guarantees that Publishers will encode blobs correctly without verification.

b) \_\_\_ If a blob ID matches expectations, the data is cryptographically guaranteed to be authentic.

c) \_\_\_ Clients must implement their own retry logic for network failures.

### Question 5.2 (Short Answer)
You're building a healthcare application that stores patient medical records on Walrus.

a) Is it safe to store these records without additional measures? Why or why not?

b) What steps must you take to ensure patient data privacy?

c) How would you verify that retrieved medical records haven't been tampered with?

---

## Section 6: CLI vs SDK and Practical Constraints

### Question 6.1 (Multiple Choice)
Which tool should you use if you need to upload 10,000 blobs with custom retry logic and progress tracking?

A) Walrus CLI
B) Walrus Rust SDK
C) Either CLI or SDK works the same
D) HTTP API to Publisher

### Question 6.2 (Multiple Choice)
What programming language is the Walrus SDK written in?

A) Python
B) JavaScript
C) Rust
D) Go

### Question 6.3 (Short Answer)
You need to encode a 6 GB blob. Approximately how much RAM should your machine have available?

---

## Section 7: Epochs and Storage Management (Bonus Section)

### Question 7.1 (Multiple Choice)
What happens to a blob after its storage epochs expire?

A) It's automatically extended for free
B) It's moved to cheaper "cold storage"
C) It may be deleted by storage nodes
D) Nothing - blobs last forever

### Question 7.2 (Short Answer)
Explain why storage epochs exist in Walrus. What problem do they solve, and what responsibility do they place on developers?

---

## Section 8: Practical Scenario (Bonus)

You're building a decentralized video streaming platform using Walrus. Each video is 2 GB.

**Answer the following:**

a) Can you upload each video as a single blob? If not, what should you do?

b) If a user reports that video playback fails halfway through, what are three possible causes and how would you diagnose them?

c) To keep costs manageable, should you store videos for 1 year or mark them as permanent? Justify your answer.