# Instructor's Guide: Storage Costs

## Quick Reference

**Total Time:** 90-120 minutes

**Difficulty:** Intermediate

**Hands-on Components:** Cost calculation exercises (30-40 min)

**Materials Needed:** Calculator, access to Walrus CLI, whiteboard for cost diagrams

**Key Takeaways:**

- Storage costs come from four sources: storage resources (WAL), upload costs (WAL), transaction gas (SUI), and object deposits (SUI)

- Encoded size (not original size) drives costs: ~64MB metadata overhead for all blobs + ~5x erasure coding for data

- Small blobs (< 10MB) are expensive per MB due to fixed metadata overhead

- Resource reuse (delete early, reuse epochs) is the most powerful cost optimization

- [Walrus Quilt](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) can reduce costs up to 409x for small files by batching

## Prerequisites

### For Students

- Basic understanding of the Walrus CLI
- Familiarity with WAL and SUI tokens
- Basic command-line interface experience
- Understanding of epochs and storage duration
- Ability to perform basic arithmetic calculations

### For Instructor

- Deep understanding of the Walrus cost model and encoding system
- Familiarity with `system_state_inner.move` contract functions (`reserve_space`, `register_blob`, `process_storage_payments`)
- Knowledge of erasure coding and metadata overhead calculations (see [`crates/walrus-core/src/encoding/config.rs`](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-core/src/encoding/config.rs))
- Understanding of storage resource lifecycle and reuse mechanisms
- Prepared examples of cost calculations for different blob sizes
- Access to current Walrus prices (via `walrus info`)
- Understanding of FROST/WAL conversion (1 WAL = 1,000,000,000 FROST)

## Classroom Setup

**Advance Prep (15 min before class):**

- [ ] Run `walrus info` to get current prices and note them on whiteboard
- [ ] Prepare sample files of different sizes (1MB, 10MB, 100MB) for demonstrations
- [ ] Test `walrus store --dry-run` to ensure it works
- [ ] Queue up key formulas: `storage_units = ceil(encoded_size / 1_MiB)`
- [ ] Prepare whiteboard space for cost breakdown diagrams

**Materials:**

- Calculator (or spreadsheet) for cost calculations
- Sample files for dry-run demonstrations
- Access to Sui explorer for viewing transaction costs
- Whiteboard markers for drawing cost flow diagrams

## Instructor Cheat Sheet

1. **Cost Model (20-25 min):** Four cost sources | Encoded size formula | Small vs large blob costs | Use mermaid diagram

2. **Storage Duration (15-20 min):** Linear scaling with epochs | Resource reuse mechanism | "Buy long, delete early" strategy

3. **Budget Planning (15-20 min):** 8-step process | Multiple allocation strategies | Buffer importance

4. **Scenarios (10-15 min):** Walk through 5 real-world examples | Connect to optimization strategies

5. **Cost Reduction (15-20 min):** Resource reuse | Quilt for batching | PTBs for transaction costs | Checklist

6. **Hands-On (30-40 min):** Exercise 1 first | Use dry-run | Compare estimates vs actual

---

## Section-by-Section Guidance

### Section 1: Cost Model

**Student Material:** [01-cost-model.md](./01-cost-model.md)

⏱️ **Duration:** 20-25 minutes (most foundational section)

🎯 **Key Points to Emphasize:**

- **Four distinct cost sources**: Storage resources (WAL, linear with size × epochs), upload costs (WAL, linear with size), transaction gas (SUI, fixed per transaction), and object deposits (SUI, mostly refundable)
- **Encoded size is critical**: Costs are based on encoded size, not original size. Small blobs (< 10MB) are dominated by ~64MB metadata overhead, while large blobs (> 10MB) scale with ~5x erasure coding
- **Storage units calculation**: `storage_units = ceil(encoded_size / 1_MiB)` - this rounding can significantly impact costs for small blobs
- **Cost independence**: Upload costs and transaction costs are independent of storage duration; only storage resource costs scale with epochs

💡 **Teaching Tips:**

- Start with the mermaid diagram showing the four cost sources - it's a great visual anchor
- Use concrete examples: "A 1MB file costs ~67 storage units (not 1!) because of metadata overhead"
- Walk through the encoded size calculation formula step-by-step for a small blob (1MB) to show where the ~64MB comes from
- Emphasize the "gotcha" that small blobs are expensive per MB due to fixed metadata overhead
- Use `walrus store --dry-run` to show actual encoded sizes before storing
- Draw the cost formula on whiteboard: `Total = (units × price × epochs) + (units × write_price) + gas + deposit`

⚠️ **Common Misconceptions:**

- Students think costs are based on original file size - emphasize encoded size repeatedly
- May assume small files are cheap - the ~64MB metadata makes them expensive per MB
- Confusion between WAL costs and SUI costs - clarify which token pays for what
- May think transaction costs scale with blob size - they're mostly fixed per transaction

💬 **Discussion Points:**

- **Why does Walrus use encoded size instead of original size?**
  - **Erasure coding overhead**: Walrus uses erasure coding (Reed-Solomon) to provide redundancy and fault tolerance. This requires storing approximately 5x the original data size across multiple storage nodes
  - **Metadata overhead**: Each blob requires significant metadata (~61-64MB) including hash digests, blob IDs, and encoding parameters
  - **Fair cost allocation**: Charging based on encoded size ensures users pay for the actual resources consumed by the network
  - **Analogy**: It's like shipping - you pay for the box size and packaging, not just the item inside

- **What are the cost implications of the fixed metadata overhead?**
  - Small blobs (< 10MB) have much higher cost per MB because the ~64MB metadata is a fixed overhead
  - Large blobs (> 10MB) have lower cost per MB because the metadata becomes a smaller percentage
  - This creates a "minimum cost floor" - even tiny files have substantial costs

✅ **Quick Check:**

- "If I store a 5MB blob for 10 epochs, which costs scale with epochs?" (Answer: Only storage resource cost; upload and transaction costs are fixed)
- "Why does a 1MB blob cost almost as much as a 10MB blob?" (Answer: Both are dominated by ~64MB metadata overhead)
- "What's the formula for storage units?" (Answer: `ceil(encoded_size / 1_MiB)`)

**Transition to Next Section:**

"Now that you understand the cost model, let's see how storage duration affects these costs and how you can optimize by choosing the right duration strategy."

---

### Section 2: Short Storage versus Extended Storage

**Student Material:** [02-storage-duration.md](./02-storage-duration.md)

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**

- **Duration directly affects storage resource cost**: Linear relationship - 10 epochs costs 10x more than 1 epoch for storage resources
- **Resource reuse is powerful**: Deleting deletable blobs early reclaims storage resources, allowing reuse of remaining epochs for free
- **Upload/transaction costs are duration-independent**: These are one-time costs regardless of how long you store the blob
- **Strategic choice**: Short-term for temporary/uncertain data; extended for permanent/predictable needs

💡 **Teaching Tips:**

- Use the sequence diagram to illustrate resource reuse - it's a key optimization that students often miss
- Walk through a concrete example: "Buy 10 epochs, use for 5, delete early, reuse remaining 5 epochs for a new blob"
- Contrast the upfront cost difference: "10 epochs costs 10x more upfront, but you might only need 5"
- Explain the "buy long, delete early" strategy: Store for many epochs as deletable, delete when done to maximize reuse
- Draw the Storage resource lifecycle on whiteboard: Create → Use → Delete → Reclaim → Reuse

⚠️ **Common Misconceptions:**

- Students may think deleting a blob deletes the storage resource - clarify it returns the resource to you
- May assume storage resources can only be used once - they can be reused for any blob of matching size
- Confusion about epoch timing - remaining epochs = `end_epoch - current_epoch`
- May think permanent blobs can be deleted - only deletable blobs support early deletion

💬 **Discussion Points:**

- When should you use short-term storage vs. extended storage? (Consider data lifetime, budget constraints, optimization opportunities)
- What are the trade-offs of the "buy long, delete early" strategy? (Requires active management, but maximizes resource reuse)
- How does the Storage resource track remaining epochs? (Via `end_epoch` - remaining epochs = `end_epoch - current_epoch`)

✅ **Quick Check:**

- "If I store a blob for 20 epochs but delete it after 5 epochs, can I reuse the remaining 15 epochs?" (Answer: Yes, if it's deletable and you have a matching storage resource)
- "What's the difference in cost between storing for 1 epoch vs. 10 epochs?" (Answer: Storage resource cost is 10x higher; upload and transaction costs are the same)
- "When reusing a reclaimed Storage resource, do I pay the storage resource cost again?" (Answer: No, you only pay the write cost/upload cost)

**Transition to Next Section:**

"Understanding duration strategies is great, but how do you actually plan a budget for a real project? Let's walk through a systematic approach."

---

### Section 3: Budget Planning in Real Projects

**Student Material:** [03-budget-planning.md](./03-budget-planning.md)

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**

- **Eight-step estimation process**: From understanding data profile to calculating total costs - follow the systematic approach
- **Multiple budget strategies**: Per-blob, per-project, per-time-period, and tiered budgets each have their use cases
- **Monitoring is essential**: Track actual costs vs. estimates, identify optimization opportunities, set up alerts
- **Always include buffers**: 10-20% buffer for unexpected costs, price volatility, and growth

💡 **Teaching Tips:**

- Walk through the document storage service example step-by-step - it demonstrates the full estimation process
- Emphasize the importance of getting current prices (`walrus info`) - prices can change
- Show how to use dry-run for accurate encoded size estimation before committing to storage
- Discuss the real-world example in detail - students can use it as a template for their own projects
- Highlight the cost forecasting section - students should plan for different scenarios (best case, base case, worst case)
- Create a simple spreadsheet template on screen showing the calculation flow

⚠️ **Common Misconceptions:**

- Students may use example prices instead of checking current prices - emphasize `walrus info`
- May forget to account for encoded size (use original size instead)
- Often underestimate buffer needs - 20% is safer than 10%
- May not consider price volatility in long-term planning

💬 **Discussion Points:**

- How do you choose between different budget allocation strategies? (Consider project structure, cost tracking needs, flexibility requirements)
- What metrics should you track to optimize costs over time? (Cost per blob, cost per MB, cost per epoch, total spending trends)
- How often should you review and adjust budgets? (Monthly checks, quarterly reviews, annual planning)

✅ **Quick Check:**

- "What's the first step in budget planning?" (Answer: Understand your data profile - size, volume, duration, access patterns)
- "Why do we need a buffer in our budget?" (Answer: For unexpected costs, price changes, and unplanned growth)
- "What command gives you current prices?" (Answer: `walrus info`)

**Transition to Next Section:**

"Let's see these concepts in action with real-world scenarios that you might encounter in your projects."

---

### Section 4: Scenarios Based on Common Product Needs

**Student Material:** [05-scenarios.md](./05-scenarios.md)

⏱️ **Duration:** 10-15 minutes

🎯 **Key Points to Emphasize:**

- **Real-world cost examples**: Five scenarios demonstrate how costs scale with different use cases (small files, large files, temporary data, archives, high volume)
- **Price awareness**: All examples use Testnet prices - emphasize that students must check current prices for their network
- **Cost scaling patterns**: Small files have high per-file costs due to metadata; large files scale more linearly with size
- **Optimization opportunities**: Each scenario has different optimization strategies (Quilt for grouping, early deletion, compression)

💡 **Teaching Tips:**

- Walk through each scenario's cost calculation step-by-step to reinforce the cost model
- Use the comparison table to highlight cost differences - "Why does high volume cost so much even with small files?"
- Emphasize the price note at the top - students must check current prices, not use examples blindly
- Connect scenarios to optimization strategies from the cost reduction section
- Ask students which scenario most resembles their use case

⚠️ **Common Misconceptions:**

- Students may copy example prices directly - these are Testnet prices and may differ from Mainnet
- May not realize high volume of small files is more expensive than fewer large files (metadata overhead)
- Could assume all scenarios need the same optimization strategy

💬 **Discussion Points:**

- How would you optimize each scenario? (Quilt for small files, compression for large files, early deletion for temporary data)
- What are the cost implications of different storage durations in each scenario? (Temporary data benefits from short duration + early deletion; archives need extended duration)
- Which scenario would benefit most from Quilt? (Scenario 5 - high volume of small files, up to 409x savings)

✅ **Quick Check:**

- "Why does Scenario 5 (high volume) cost more than Scenario 1 (small files) even though files are smaller?" (Answer: Volume - 1M files vs. 1K files, even with lower per-file cost)
- "Which scenario would benefit most from grouping small blobs?" (Answer: Scenario 5 - high volume of small files)

**Transition to Next Section:**

"Now let's dive into specific strategies to reduce these costs. This is where you can save significant money on your projects."

---

### Section 5: Cost Reduction Ideas

**Student Material:** [04-cost-reduction.md](./04-cost-reduction.md)

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**

- **Resource reuse is the most powerful**: Deleting deletable blobs early to reclaim and reuse storage resources can dramatically reduce costs
- **Quilt for grouping small blobs**: [Walrus Quilt](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) can reduce costs up to 409x for 10KB files by sharing metadata overhead
- **Batching operations**: Combining multiple operations in PTBs reduces transaction costs and improves efficiency
- **Strategic trade-offs**: Each optimization has trade-offs (grouping reduces individual control, burning objects removes lifecycle management)

💡 **Teaching Tips:**

- Start with resource reuse - it's the most impactful and often overlooked strategy
- Use concrete examples: "100 small files individually = 6,400MB encoded; with Quilt = dramatically less due to shared metadata"
- Walk through the Quilt section carefully - it's complex but very valuable for small blob use cases
- Emphasize the cost reduction checklist at the end - students should use it as a practical tool
- Show the Quilt cost savings table from the documentation

⚠️ **Common Misconceptions:**

- Students may think Quilt is the same as simple batching - it's a specific feature with unique ID system
- May not realize trade-offs of grouping (lose individual lifecycle management)
- Could assume burning objects deletes the blob data - it only reclaims SUI deposit
- May think all optimizations apply to all scenarios - each has specific use cases

💬 **Discussion Points:**

- What are the trade-offs of using Quilt? (Lose individual lifecycle management, different ID system, but gain massive cost savings)
- When should you burn blob objects? (When you don't need lifecycle management and want to reclaim SUI deposits)
- When should you NOT use Quilt? (Files that need individual lifecycle management, different expiration dates, independent sharing/extending, very large files, content-derived IDs required)

✅ **Quick Check:**

- "What's the most effective cost reduction strategy for temporary data?" (Answer: Resource reuse - buy long, delete early, reuse remaining epochs)
- "When should you use Quilt?" (Answer: When you have many small files (< 10MB) with similar lifetimes that can be managed together)
- "What's the maximum cost savings Quilt can provide?" (Answer: Up to 409x for 10KB files)

**Transition to Next Section:**

"Theory is great, but let's put this into practice. Time for hands-on exercises to build your cost calculation skills."

---

### Section 6: Hands-On Exercises

**Student Material:** [06-hands-on.md](./06-hands-on.md)

⏱️ **Duration:** 30-40 minutes

🎯 **Key Points to Emphasize:**

- **Practice reinforces learning**: Students must actually calculate costs, not just read about them
- **Dry-run is essential**: Use `--dry-run` to estimate costs without spending tokens
- **Compare estimates vs. actual**: Always verify calculations with actual stores to build intuition
- **Real-world application**: Exercise 5 (project budget) ties everything together

💡 **Teaching Tips:**

- Start with Exercise 1 (single blob) - it's foundational and builds confidence
- Emphasize using `walrus info` to get current prices - don't use outdated examples
- Walk through Exercise 3 (scenario calculation) in class - it demonstrates the full process
- Use Exercise 5 (project budget) as a capstone - students should complete this independently
- Encourage students to try the additional challenges if they finish early
- Have students work in pairs for peer learning

**Exercise Walkthrough:**

1. **Exercise 1 (Single Blob)**: Demonstrate first, then have students replicate
2. **Exercise 2 (Small vs Large)**: Great for showing metadata overhead impact
3. **Exercise 3 (Scenario)**: Core exercise - ensure all students complete this
4. **Exercise 4 (Duration Strategies)**: Reinforces resource reuse concepts
5. **Exercise 5 (Project Budget)**: Capstone - students apply all concepts

⚠️ **Common Misconceptions:**

- Students may forget to convert FROST to WAL (1 WAL = 1,000,000,000 FROST)
- May use original size instead of encoded size in calculations
- Could miss the storage unit rounding (ceil function)
- May not verify calculations with actual dry-run output

💬 **Discussion Points:**

- What did you learn from comparing your estimates to actual costs? (Encoded size surprises, transaction cost variations)
- How would you optimize the scenario you calculated in Exercise 3? (Apply strategies from cost reduction section)
- What surprised you most about the cost calculations? (Usually the small blob overhead)

✅ **Quick Check:**

- "What command do you use to estimate costs without storing?" (Answer: `walrus store <file> --epochs N --dry-run`)
- "How do you calculate storage units from encoded size?" (Answer: `ceil(encoded_size / 1_MiB)`)
- "What's the most common mistake in cost calculations?" (Answer: Using original size instead of encoded size)

---

## Wrap-up and Assessment (5-10 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **What are the four sources of storage cost?** (Expected: Storage resources, upload costs, transaction gas, object deposits)

2. **Why does a 1MB blob cost almost as much as a 10MB blob?** (Expected: ~64MB metadata overhead dominates both)

3. **What's the most effective cost reduction strategy?** (Expected: Resource reuse - delete early, reuse remaining epochs; or Quilt for small files)

4. **How do you estimate costs before storing?** (Expected: `walrus store --dry-run` and `walrus info`)

### Assessment Checklist

Use this to gauge if the module was successful:

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

### Quick Poll

- "Raise your hand if you can calculate encoded size for a small blob"
- "Thumbs up if you understand why Quilt saves money for small files"
- "Show of hands: Who can explain resource reuse to a friend?"

---

## Assessment Suggestions

- **Cost Calculation Quiz**: Give students a blob size, epochs, and current prices; ask them to calculate total WAL cost, storage units, and cost breakdown
- **Scenario Analysis**: Provide a use case (e.g., "10,000 photos/month, 5MB each, 1 year storage") and ask students to estimate costs and suggest optimizations
- **Optimization Strategy Selection**: Present a scenario and ask students to identify which cost reduction strategies apply and estimate savings
- **Budget Planning Project**: Students create a complete budget plan for a real or hypothetical project, including cost estimation, allocation strategy, monitoring plan, and optimization opportunities
- **Code Review**: Show a cost calculation snippet with errors (e.g., using unencoded size instead of encoded size) and ask students to identify and fix the issues

---

## Additional Resources

### For Students

- [Walrus Costs Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/costs.md) - Official cost guide
- [Quilt Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) - Batch storage for cost reduction
- [Walrus CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md) - CLI reference

### For Instructors

- **Walrus Source Code**: 
  - Cost calculations: [`contracts/walrus/sources/system/system_state_inner.move`](https://github.com/MystenLabs/walrus/blob/main/contracts/walrus/sources/system/system_state_inner.move)
  - Encoding configuration: [`crates/walrus-core/src/encoding/config.rs`](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-core/src/encoding/config.rs)
  - Storage resources: [`contracts/walrus/sources/system/storage_resource.move`](https://github.com/MystenLabs/walrus/blob/main/contracts/walrus/sources/system/storage_resource.move)
- **CLI Commands**: `walrus info`, `walrus store --dry-run` for cost estimation
- **Sui Explorer**: To view actual transaction costs and WAL/SUI balances

---

## Notes for Next Module

Students should now be ready for:

- Advanced storage strategies (epochs, continuity, extensions)
- Building applications with cost-aware storage logic
- Integrating Walrus SDK with budget management
- Performance optimization alongside cost optimization

**Key Concepts to Reinforce in Future Modules:**

- Encoded size vs. original size (connect to architecture module)
- Resource reuse patterns (connect to SDK usage)
- Quilt for production applications with many small files
- Cost monitoring and alerting in production systems
