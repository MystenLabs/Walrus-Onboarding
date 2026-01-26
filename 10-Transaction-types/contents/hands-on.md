# Hands-On: Transaction Classification

## Objective
Test your understanding of Walrus transaction types by classifying the following real-world scenarios into the correct technical operations.

## Instructions
For each scenario below, identify:
1.  **Primary Transaction/Operation Type** (Upload, Extension, Retrieval, Quilt, or SharedBlob).
2.  **Key On-Chain Function(s)** involved (e.g., `register_blob`, `extend_blob`).

### Scenario A: The Daily Backup
A server generates a 500GB database backup every night. This file needs to be stored for exactly 30 days.
*   **Your Answer:** ____________________

### Scenario B: The NFT Collection
An artist launches a collection of 10,000 generated images (each ~50KB). They all need to be stored permanently.
*   **Your Answer:** ____________________

### Scenario C: The Community Archive
A historical document is uploaded. You want to ensure it stays online forever, but you only have funds for 1 year. You hope others will chip in later.
*   **Your Answer:** ____________________

### Scenario D: The "Keep Alive" Signal
You have a critical blob expiring in 2 epochs. You have plenty of WAL tokens in your wallet.
*   **Your Answer:** ____________________

### Scenario E: Verify & Download
A user wants to download a file and cryptographically prove it hasn't been tampered with since it was stored.
*   **Your Answer:** ____________________

---

*See the Instructor Guide for solutions.*

## Key Takeaways

- Each scenario maps to a specific transaction type and set of Move functions.
- Use blob object IDs for mutations (extend/delete/share), blob IDs for content addressing.
- Certified reads combine off-chain download with an on-chain `BlobCertified` check.
- Quilts suit large sets of small files; SharedBlob enables community-funded persistence.

## Next Steps

Review solutions in the [Instructor Guide](./instructor-guide.md), browse the SDK examples in [`../src/examples`](../src/examples), and then apply the patterns to your own use case or proceed to the production guidance.

