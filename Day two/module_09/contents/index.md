# Walrus Upload Transaction Lifecycle Curriculum

Welcome to the **Walrus Upload Transaction Lifecycle** curriculum. This module is designed for developers who need to understand the low-level mechanics of how a file becomes a permanent, certified blob on the Walrus network.

While the high-level architecture covers the *roles* of components, and the SDK curriculum covers *how to build apps*, this module dives deep into the **protocol execution**. You will trace the exact path of data, transaction calls, and system logs from start to finish.

## Learning Objectives

By the end of this module, you will be able to:
1.  **Trace the complete transaction path** of a blob upload, from local encoding to on-chain certification.
2.  **Identify specific log messages** associated with each stage of the lifecycle for debugging.
3.  **Explain the "Sealing" and "Proof" mechanisms** that ensure data availability before certification.
4.  **Debug stuck uploads** by pinpointing exactly which stage (Submission, Storage, or Certification) failed.

## Curriculum Structure

1.  **[Chunk Creation & Encoding](./01-chunk-creation.md)**
    *   Deep dive into `RS(n,k)` encoding, sliver generation, and metadata hashing.
    *   Trace the Rust/WASM implementation in `walrus-core`.

2.  **[Submission (Registration)](./02-submission.md)**
    *   Analyze the `register_blob` Sui transaction.
    *   Understand storage reservation and cost calculation.

3.  **[Sealing (Storing Slivers)](./03-sealing.md)**
    *   Follow the parallel HTTP `PUT` requests to storage nodes.
    *   Trace the `store_sliver` RPC on the storage node side.

4.  **[Proof Creation (Collecting Signatures)](./04-proof-creation.md)**
    *   Understand how validity proofs are generated.
    *   See how nodes verify on-chain registration before signing.

5.  **[Storage Confirmation (Certification)](./05-storage-confirmation.md)**
    *   Analyze the `certify_blob` transaction.
    *   Learn how the `BlobCertified` event triggers network synchronization.

6.  **[Retrieval Flow](./06-retrieval-flow.md)**
    *   Reverse the process: fetch, decode, and verify.
    *   Understand the reconstruction logic.

7.  **[Full Lifecycle Diagram](./07-full-lifecycle-diagram.md)**
    *   A comprehensive sequence diagram tying all components together.

8.  **[Hands-On: Trace Logs](./08-hands-on-trace-logs.md)**
    *   Practical exercise: Run a local upload and `grep` for the lifecycle markers in your logs.

## Prerequisites

*   Familiarity with the [Walrus Architecture](../walrus_architecture/index.md).
*   Basic understanding of [Sui Transactions](https://docs.sui.io).
*   Comfort reading logs and basic Rust code structure.

## Key Takeaways

- **Four-Phase Lifecycle**: Encoding -> Registration -> Sealing -> Certification.
- **Hybrid Architecture**: Combines on-chain coordination (Sui) with off-chain data storage (Storage Nodes).
- **Client-Driven**: The client (or SDK) orchestrates the entire process, including generating proofs.
- **Durability Guarantees**: Erasure coding and quorum proofs ensure data survives node failures.

## Next Steps

Start your deep dive with **[Chunk Creation & Encoding](./01-chunk-creation.md)** to see how a file is prepared for the network.

