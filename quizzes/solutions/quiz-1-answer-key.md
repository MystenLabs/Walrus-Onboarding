## Answer Key

### Section 1: Fundamentals

**1.1:** C) Programmable storage via Sui smart contracts

**1.2:**
a) FALSE - Walrus is public by default, clients must encrypt data themselves
b) TRUE
c) FALSE - Storage Nodes are core infrastructure; Publishers and Aggregators are optional
d) FALSE - Encoding is deterministic; same blob → same blob ID

**1.3:**
a) 334
b) 2/3 (or 667 out of 1000)
c) 13.3 GiB
d) 1/3 (or up to 33%)

### Section 2: Architecture and Components

**2.1:** C) Publisher

**2.2:**
Storage Node → A
Publisher → C
Aggregator → B
Client → D
Sui Blockchain → E

**2.3:** Publishers encode blobs and distribute slivers; Aggregators fetch slivers and reconstruct blobs. Both are untrusted because they're optional infrastructure that could act maliciously or incorrectly. Clients must verify their work by checking blob IDs, performing consistency checks, and verifying on-chain state.

### Section 3: Data Flow and Operations

**3.1:**
6 - Post certificate to Sui blockchain
2 - Encode blob into slivers using erasure coding
4 - Distribute slivers to storage nodes
3 - Register blob object on Sui
5 - Collect signatures from storage nodes
1 - Client uploads blob to Publisher

**3.2:** C) When the certificate is posted to Sui blockchain

**3.3:**
a) Yes, upload will succeed. Need 2/3 quorum = 667 signatures. Got 700, which exceeds the requirement.
b) Approximately 4.5 GB (1 GB × 4.5x expansion factor)
c) Yes, retrieval will succeed. Only need 334 primary slivers to reconstruct. With 600 nodes online (60%), there are more than enough slivers available.

### Section 4: Failure Modes and Guarantees

**4.1:**
a) RETRYABLE
b) NON-RETRYABLE
c) NON-RETRYABLE (must add funds first)
d) RETRYABLE (but must check on-chain state first!)
e) RETRYABLE (system fetches from other nodes)
f) RETRYABLE

**4.2:**
a) Check on-chain state to see if the blob was registered (query Sui for blob object)
b) Two ways: (1) Check for blob object on Sui using blob ID, (2) Check for point of availability event, (3) Try to retrieve the blob
c) Could waste gas on duplicate transactions, or if transaction is idempotent, just waste gas but no other harm

### Section 5: System Guarantees vs. Client Responsibilities

**5.1:**
a) FALSE - Publishers are untrusted; clients must verify
b) TRUE
c) TRUE

**5.2:**
a) No, not safe. Walrus is public by default - anyone with the blob ID can retrieve the data.
b) Must encrypt patient data client-side before uploading to Walrus. Only authorized users should have decryption keys. Implement proper key management.
c) Re-encode the retrieved data and verify the blob ID matches expectations. Use strict consistency checks. Successful decryption also indicates data hasn't been corrupted (would fail to decrypt if tampered).

### Section 6: CLI vs SDK and Practical Constraints

**6.1:** B) Walrus Rust SDK (need fine-grained control and custom logic)

**6.2:** C) Rust

**6.3:** Approximately 12-18 GB RAM (need ~2-3x the blob size for encoding)

### Section 7: Epochs and Storage Management

**7.1:** C) It may be deleted by storage nodes

**7.2:** Storage epochs exist because storage resources are finite and storage nodes need to be compensated for the time they store data. They solve the problem of preventing unlimited storage accumulation and ensuring fair payment for storage services. This places responsibility on developers to track blob expiration dates and extend storage epochs before blobs expire, or re-upload critical data.

### Section 8: Practical Scenario

**a)** Yes, 2 GB is under the 13.3 GiB limit, so can upload as a single blob. However, for better streaming experience, might want to split into segments for adaptive streaming.

**b)** Three possible causes:
1. Storage nodes holding needed slivers are offline - diagnose by checking aggregator logs for sliver fetch failures
2. Network issues on client side - diagnose by checking client network connectivity and timeouts
3. Blob storage epochs expired and blob was deleted - diagnose by checking blob status on Sui blockchain

**c)** Store for 1 year (not permanent). Reasoning: Videos may become outdated, user preferences change, storage costs accumulate. Better to extend epochs periodically for popular content and let unpopular content expire. Permanent storage locks in costs forever for content that may not be accessed long-term. Can implement analytics to decide which videos to keep.