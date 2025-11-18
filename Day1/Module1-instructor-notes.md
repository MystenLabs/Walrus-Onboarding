# Teacher's Notes: Module 1 - Introduction to Walrus

## 1. Overall Goal

Your goal in this module is to get students to understand the *'why'* behind Walrus. Don't get too bogged down in the deep technical details (like the specifics of RedStuff algorithms) just yet. Focus on the *problem* it solves and the *concepts* it introduces, especially "programmable storage."

## 2. On "Learning Objectives"

* **Instructor's Goal:** Your main job is to ensure that by the end, students can *answer* these three questions. Use them to frame your teaching.

* **Elaboration Guide & Key Points:**

  * **Objective 1: Understand *why* Walrus exists.**

    * **Elaborate on:** The *pain points* of centralized storage (e.g., censorship, single point of failure, high costs) AND the *limitations* of first-gen decentralized storage (e.g., slow, expensive, not-programmable).

    * **Key Point to Hammer:** Walrus wasn't built just to be "decentralized"; it was built to be *usable and programmable* for Web3, which existing solutions weren't.

  * **Objective 2: Understand the *basic problem* Walrus solves.**

    * **Elaborate on:** The "blob" concept (large, unstructured files like videos, AI models, game assets). This is different from a database.

    * **Key Point to Hammer:** The problem isn't just "storing files" (like Dropbox). It's "storing *large* files in a way that *smart contracts* can manage and interact with." This "programmability" is the core solution.

  * **Objective 3: Understand the *durability model*.**

    * **Elaborate on:** Why simple "replication" (making 5 copies) is inefficient and expensive.

    * **Key Point to Hammer:** You don't need to be a math expert, but you *must* convey the core concept of erasure coding (like the "puzzle piece" analogy in section 5) to explain how Walrus achieves high durability *without* massive costs.

* **Suggested Check-in (Exit Ticket):** At the end of the module, ask students to summarize (or write down) a one-sentence answer for each. This confirms they've grasped the key points you elaborated on.

## 3. On "Purpose of Walrus"

* **Key Talking Point:** The most important phrase here is **"programmable storage."** This is the key differentiator.

  * **Analogy:** Most decentralized storage is like a "digital locker." You put a file in, get a key (hash), and can get it back. Walrus is more like a "robotic warehouse" where the "robotic" part (Sui smart contracts) can actively manage the inventory (the stored data) based on rules.

* **Discussion Questions:**

  * "What are some real-world problems with centralized storage? Has anyone here ever lost access to a file because a service went down or changed its rules?"

  * "When we say 'programmable storage,' what kind of 'rules' would you want to program? (Good answers: auto-deleting files after 1 year, "unlocking" a file only after 100 people have paid, linking a game asset to an NFT, etc.)"

## 4. On "Design Goals"

* **Key Talking Points:**

  1. **Programmability:** Re-emphasize this. It's the "brain."

  2. **Robustness (Byzantine Fault Tolerance):** This is a fancy term for "it works even if some participants are offline or actively trying to cheat." This is essential for a trustless, decentralized network.

  3. **Cost Efficiency:** Connect this directly to the Durability Model. The *way* it stores data (erasure coding) is *why* it's cheaper.

* **Common Misconception:** Students might think "decentralized" always means "slow." Point out that Walrus is *designed* for performance, which is what separates it from many first-generation "storage" blockchains.

* **Discussion Question:** "Why is 'programmability' (Goal 1) a bigger deal than just having a decentralized hard drive (Goal 2)?"

## 5. On "Durability Model and Retention Guarantees"

* **Key Talking Point:** This is the most technical part. Use an analogy.

  * **Analogy:** "Simple replication is like making 5 full photocopies of your homework. If you lose 4, you still have one. It's safe, but you've used 5x the paper."

  * "**Erasure coding (RedStuff)** is more like a magic trick. It's like taking your homework, splitting it into 5 unique puzzle pieces, and adding 3 "magic" puzzle pieces. The trick is that *any 5* of the total 8 pieces can be used to rebuild the *entire* page. You get massive safety (losing 3 pieces is fine!) without making 5 full copies. It's more efficient."

* **Key Concept:** The "Proof-of-Availability" is the "random check" to make sure the nodes don't just throw away their puzzle pieces. It's the enforcement mechanism.

* **Discussion Question:** "What's the trade-off? (Replication is simple but expensive. Erasure coding is more complex but more efficient.)"

## 6. On "Storage and Retrieval in Simple Terms"

* **Key Talking Point:** Emphasize that the **client** (the user's app/computer) does the work of splitting and rebuilding. The network's job is just to store the slivers. This is a key part of its decentralized design—there's no "central server" doing the encoding for you.

* **Whiteboard Activity:** This is a great place to draw two diagrams:

  1. **WRITE:** `[Your File]` -> `Client (splits)` -> `Slivers sent to [Node 1, Node 2, ...]` -> `Metadata sent to [Sui Blockchain]`

  2. **READ:** `Client` -> `Asks [Sui Blockchain] for metadata` -> `Client uses metadata to ask [Node 1, 3, 7...] for slivers` -> `Client (rebuilds)` -> `[Your File]`

## 7. On "What Walrus Is Not"

* **CRITICAL POINT:** Hammer this home: **"It is not private by default."**

* **Common Misconception:** Many people hear "blockchain" or "decentralized" and assume "private" or "anonymous." Walrus is the opposite; it's a *public* network.

* **Discussion Question:**

  * "If Walrus is totally public, how could you *ever* use it for sensitive data, like a company's financial records?"

  * **Answer:** You (the client) would have to encrypt the file *before* you upload it. The network would store the meaningless, encrypted "blob." This is a key concept: "client-side encryption."