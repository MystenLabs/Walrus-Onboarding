# Instructor's Guide: Storage Costs

## Learning Objectives

By the end of this module, students should be able to:

- **Calculate Storage Costs**: Accurately estimate WAL and SUI costs for storing blobs of any size and duration using the cost model formula.
- **Understand Cost Drivers**: Identify and explain how encoded size, storage duration, metadata overhead, and erasure coding affect total costs.
- **Understanding Cost Optimization Basic Strategies**: Discussing cost reduction techniques including resource reuse, batching, grouping small blobs, and strategic duration planning.
- **Plan Storage Budgets**: Create realistic budget plans for real-world projects with proper cost estimation, allocation strategies, and monitoring approaches.
- **Analyze Cost Trade-offs**: Compare different storage strategies (short-term vs. extended, individual vs. batched) and choose optimal approaches for specific use cases.

## Prerequisites

### For Students

- Basic understanding of the Walrus CLI (see [CLI Curriculum](../cli/index.md))
- Familiarity with WAL and SUI tokens
- Basic command-line interface experience
- Understanding of epochs and storage duration (from [Epochs and Storage Continuity](../epochs_continuity/index.md))
- Ability to perform basic arithmetic calculations

### For Instructor

- Deep understanding of the Walrus cost model and encoding system
- Familiarity with `system_state_inner.move` contract functions (`reserve_space`, `register_blob`, `process_storage_payments`)
- Knowledge of erasure coding and metadata overhead calculations (see [`crates/walrus-core/src/encoding/config.rs`](../../../../crates/walrus-core/src/encoding/config.rs))
- Understanding of storage resource lifecycle and reuse mechanisms
- Prepared examples of cost calculations for different blob sizes
- Access to current Walrus prices (via `walrus info`)

## Section-by-Section Guidance

### Section 1: Cost Model

**Key Points to Emphasize:**

- **Four distinct cost sources**: Storage resources (WAL, linear with size × epochs), upload costs (WAL, linear with size), transaction gas (SUI, fixed per transaction), and object deposits (SUI, mostly refundable).
- **Encoded size is critical**: Costs are based on encoded size, not original size. Small blobs (< 10MB) are dominated by ~64MB metadata overhead, while large blobs (> 10MB) scale with ~5x erasure coding.
- **Storage units calculation**: `storage_units = ceil(encoded_size / 1_MiB)` - this rounding can significantly impact costs for small blobs.
- **Cost independence**: Upload costs and transaction costs are independent of storage duration; only storage resource costs scale with epochs.

**Teaching Tips:**

- Start with the mermaid diagram showing the four cost sources - it's a great visual anchor.
- Use concrete examples: "A 1MB file costs ~67 storage units (not 1!) because of metadata overhead."
- Walk through the encoded size calculation formula step-by-step for a small blob (1MB) to show where the ~64MB comes from.
- Emphasize the "gotcha" that small blobs are expensive per MB due to fixed metadata overhead.
- Use `walrus store --dry-run` to show actual encoded sizes before storing.

**Quick Check:**

- "If I store a 5MB blob for 10 epochs, which costs scale with epochs?" (Answer: Only storage resource cost; upload and transaction costs are fixed).
- "Why does a 1MB blob cost almost as much as a 10MB blob?" (Answer: Both are dominated by ~64MB metadata overhead).

**Discussion Points:**

- **Why does Walrus use encoded size instead of original size?**
  - **Erasure coding overhead**: Walrus uses erasure coding (Reed-Solomon) to provide redundancy and fault tolerance. This requires storing approximately 5x the original data size across multiple storage nodes. This is a real cost to the network - the storage nodes must actually store this encoded data.
  - **Metadata overhead**: Each blob requires significant metadata (~61-64MB) including hash digests, blob IDs, and encoding parameters. This metadata must be stored and maintained by the network.
  - **Fair cost allocation**: Charging based on encoded size ensures users pay for the actual resources consumed by the network (storage space, bandwidth, computation for encoding/decoding), not just the original file size.
  - **Economic sustainability**: If Walrus charged based on original size, the network would lose money on small blobs (where metadata dominates) and wouldn't accurately reflect the true cost of providing redundancy and fault tolerance.
  - **Analogy**: It's like shipping - you pay for the box size and packaging, not just the item inside. The network must handle the "packaging" (encoding, metadata, redundancy) to provide reliable storage.

- **What are the cost implications of the fixed metadata overhead?**
  - Small blobs (< 10MB) have much higher cost per MB because the ~64MB metadata is a fixed overhead regardless of file size.
  - Large blobs (> 10MB) have lower cost per MB because the metadata becomes a smaller percentage of total encoded size.
  - The storage unit rounding (`ceil(encoded_size / 1_MiB)`) can significantly impact small blobs - a 1MB file uses 67 storage units, not 1.
  - This creates a "minimum cost floor" - even tiny files have substantial costs due to metadata overhead.

---

### Section 2: Short Storage versus Extended Storage

**Key Points to Emphasize:**

- **Duration directly affects storage resource cost**: Linear relationship - 10 epochs costs 10x more than 1 epoch for storage resources.
- **Resource reuse is powerful**: Deleting deletable blobs early reclaims storage resources, allowing reuse of remaining epochs for free.
- **Upload/transaction costs are duration-independent**: These are one-time costs regardless of how long you store the blob.
- **Strategic choice**: Short-term for temporary/uncertain data; extended for permanent/predictable needs.

**Teaching Tips:**

- Use the sequence diagram to illustrate resource reuse - it's a key optimization that students often miss.
- Walk through a concrete example: "Buy 10 epochs, use for 5, delete early, reuse remaining 5 epochs for a new blob."
- Contrast the upfront cost difference: "10 epochs costs 10x more upfront, but you might only need 5."
- Explain the "buy long, delete early" strategy: Store for many epochs as deletable, delete when done to maximize reuse.

**Quick Check:**

- "If I store a blob for 20 epochs but delete it after 5 epochs, can I reuse the remaining 15 epochs?" (Answer: Yes, if it's deletable and you have a matching storage resource).
- "What's the difference in cost between storing for 1 epoch vs. 10 epochs?" (Answer: Storage resource cost is 10x higher; upload and transaction costs are the same).

**Discussion Points:**

- When should you use short-term storage vs. extended storage? (Consider data lifetime, budget constraints, optimization opportunities).
- What are the trade-offs of the "buy long, delete early" strategy? (Requires active management, but maximizes resource reuse).

---

### Section 3: Budget Planning in Real Projects

**Key Points to Emphasize:**

- **Eight-step estimation process**: From understanding data profile to calculating total costs - follow the systematic approach.
- **Multiple budget strategies**: Per-blob, per-project, per-time-period, and tiered budgets each have their use cases.
- **Monitoring is essential**: Track actual costs vs. estimates, identify optimization opportunities, set up alerts.
- **Always include buffers**: 10-20% buffer for unexpected costs, price volatility, and growth.

**Teaching Tips:**

- Walk through the document storage service example step-by-step - it demonstrates the full estimation process.
- Emphasize the importance of getting current prices (`walrus info`) - prices can change.
- Show how to use dry-run for accurate encoded size estimation before committing to storage.
- Discuss the real-world example in detail - students can use it as a template for their own projects.

**Quick Check:**

- "What's the first step in budget planning?" (Answer: Understand your data profile - size, volume, duration, access patterns).
- "Why do we need a buffer in our budget?" (Answer: For unexpected costs, price changes, and unplanned growth).

**Discussion Points:**

- How do you choose between different budget allocation strategies? (Consider project structure, cost tracking needs, flexibility requirements).
- What metrics should you track to optimize costs over time? (Cost per blob, cost per MB, cost per epoch, total spending trends).

---

### Section 4: Scenarios Based on Common Product Needs

**Key Points to Emphasize:**

- **Real-world cost examples**: Five scenarios demonstrate how costs scale with different use cases (small files, large files, temporary data, archives, high volume).
- **Price awareness**: All examples use Testnet prices - emphasize that students must check current prices for their network.
- **Cost scaling patterns**: Small files have high per-file costs due to metadata; large files scale more linearly with size.
- **Optimization opportunities**: Each scenario has different optimization strategies (grouping, early deletion, compression).

**Teaching Tips:**

- Walk through each scenario's cost calculation step-by-step to reinforce the cost model.
- Use the comparison table to highlight cost differences - "Why does high volume cost so much even with small files?"
- Emphasize the price note at the top - students must check current prices, not use examples blindly.
- Connect scenarios to optimization strategies from the cost reduction section.

**Quick Check:**

- "Why does Scenario 5 (high volume) cost more than Scenario 1 (small files) even though files are smaller?" (Answer: Volume - 1M files vs. 1K files, even with lower per-file cost).
- "Which scenario would benefit most from grouping small blobs?" (Answer: Scenario 5 - high volume of small files).

**Discussion Points:**

- How would you optimize each scenario? (Grouping for small files, compression for large files, early deletion for temporary data).
- What are the cost implications of different storage durations in each scenario? (Temporary data benefits from short duration + early deletion; archives need extended duration).

---

### Section 5: Cost Reduction Ideas

**Key Points to Emphasize:**

- **Resource reuse is the most powerful**: Deleting deletable blobs early to reclaim and reuse storage resources can dramatically reduce costs.
- **Grouping small blobs**: Sharing metadata overhead across multiple blobs in a batch can reduce costs by 60%+ for small files.
- **Batching operations**: Combining multiple operations in PTBs reduces transaction costs and improves efficiency.
- **Strategic trade-offs**: Each optimization has trade-offs (grouping reduces individual control, burning objects removes lifecycle management).

**Teaching Tips:**

- Start with resource reuse - it's the most impactful and often overlooked strategy.
- Use concrete examples: "100 small files individually = 6,400MB encoded; grouped = much less due to shared metadata."
- Walk through the grouping section carefully - it's complex but very valuable for small blob use cases.
- Emphasize the cost reduction checklist - students should use it as a practical tool.

**Quick Check:**

- "What's the most effective cost reduction strategy for temporary data?" (Answer: Resource reuse - buy long, delete early, reuse remaining epochs).
- "When should you group small blobs together?" (Answer: When you have many small files (< 10MB) with similar lifetimes that can be managed together).

**Discussion Points:**

- What are the trade-offs of grouping blobs? (Lose individual lifecycle management, but gain significant cost savings).
- When should you burn blob objects? (When you don't need lifecycle management and want to reclaim SUI deposits).

---

### Section 6: Hands-On Exercises

**Key Points to Emphasize:**

- **Practice reinforces learning**: Students must actually calculate costs, not just read about them.
- **Dry-run is essential**: Use `--dry-run` to estimate costs without spending tokens.
- **Compare estimates vs. actual**: Always verify calculations with actual stores to build intuition.
- **Real-world application**: Exercise 5 (project budget) ties everything together.

**Teaching Tips:**

- Start with Exercise 1 (single blob) - it's foundational and builds confidence.
- Emphasize using `walrus info` to get current prices - don't use outdated examples.
- Walk through Exercise 3 (scenario calculation) in class - it demonstrates the full process.
- Use Exercise 5 (project budget) as a capstone - students should complete this independently.
- Encourage students to try the additional challenges if they finish early.

**Quick Check:**

- "What command do you use to estimate costs without storing?" (Answer: `walrus store <file> --epochs N --dry-run`).
- "How do you calculate storage units from encoded size?" (Answer: `ceil(encoded_size / 1_MiB)`).

**Discussion Points:**

- What did you learn from comparing your estimates to actual costs? (Encoded size surprises, transaction cost variations).
- How would you optimize the scenario you calculated in Exercise 3? (Apply strategies from cost reduction section).

---

## Assessment Suggestions

- **Cost Calculation Quiz**: Give students a blob size, epochs, and current prices; ask them to calculate total WAL cost, storage units, and cost breakdown.
- **Scenario Analysis**: Provide a use case (e.g., "10,000 photos/month, 5MB each, 1 year storage") and ask students to estimate costs and suggest optimizations.
- **Optimization Strategy Selection**: Present a scenario and ask students to identify which cost reduction strategies apply and estimate savings.
- **Budget Planning Project**: Students create a complete budget plan for a real or hypothetical project, including cost estimation, allocation strategy, monitoring plan, and optimization opportunities.
- **Code Review**: Show a cost calculation snippet with errors (e.g., using unencoded size instead of encoded size) and ask students to identify and fix the issues.

## Additional Resources

- **Walrus Source Code**: 
  - Cost calculations: [`contracts/walrus/sources/system/system_state_inner.move`](../../../../contracts/walrus/sources/system/system_state_inner.move)
  - Encoding configuration: [`crates/walrus-core/src/encoding/config.rs`](../../../../crates/walrus-core/src/encoding/config.rs)
  - Storage resources: [`contracts/walrus/sources/system/storage_resource.move`](../../../../contracts/walrus/sources/system/storage_resource.move)
- **CLI Documentation**: `walrus info`, `walrus store --dry-run` commands for cost estimation
- **Sui Explorer**: To view actual transaction costs and WAL/SUI balances

## Official Documentation for Reference

- [Cost Model](./cost-model.md) - Detailed cost structure and formulas
- [Storage Duration](./storage-duration.md) - Duration strategies and resource reuse
- [Budget Planning](./budget-planning.md) - Practical planning guidance
- [Cost Reduction](./cost-reduction.md) - Optimization strategies
- [Scenarios](./scenarios.md) - Real-world examples
- [Hands-On Exercises](./hands-on.md) - Practice problems

## Module Completion Checklist

- [ ] Student can accurately calculate encoded size for small and large blobs
- [ ] Student understands the four cost sources and how they scale
- [ ] Student can estimate total costs (WAL + SUI) for any blob size and duration
- [ ] Student understands when to use short-term vs. extended storage
- [ ] Student can explain resource reuse and how to implement it
- [ ] Student can create a budget plan for a real-world project
- [ ] Student can identify and apply appropriate cost reduction strategies
- [ ] Student has completed hands-on exercises and verified calculations with actual stores
- [ ] Student understands the trade-offs of different optimization strategies
- [ ] Student can use `walrus info` and `walrus store --dry-run` for cost estimation
