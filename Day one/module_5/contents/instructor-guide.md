# Instructor's Guide: Storage Costs and Budget Estimation

This guide provides instructors with structured guidance for teaching Module 5: Storage Costs and Budget Estimation. Use this document to prepare your lessons, understand key concepts, and effectively deliver the curriculum.

## Learning Objectives

By the end of this module, students should be able to:

1. **Identify and explain** the four sources of cost in Walrus storage (Storage Resources, Upload Costs, Transaction Costs, Object Costs)
2. **Calculate** storage costs for blobs of different sizes and durations
3. **Understand** the difference between encoded size and unencoded size, and how it affects costs
4. **Compare** short-term vs extended storage strategies and their cost implications
5. **Create** budget plans for real-world projects with accurate cost estimation
6. **Apply** cost reduction strategies to optimize storage spending
7. **Analyze** real-world scenarios and recommend appropriate storage strategies
8. **Execute** hands-on cost calculation exercises using Walrus CLI

## Prerequisites

### For Students

**Knowledge Prerequisites:**

- **Basic understanding of Walrus CLI**: Familiarity with basic Walrus commands (store, read, info)
- **Understanding of blockchain concepts**: Basic knowledge of transactions, gas fees, and on-chain objects
- **Mathematical concepts**: Comfortable with basic arithmetic, percentages, and unit conversions (MB, GB, epochs)

**Technical Prerequisites (for Hands-On Exercises):**

- **Walrus CLI installed**: Students need the Walrus CLI tool installed on their system
  - Installation guide: [Getting Started](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)
- **Access to Walrus network**: Either testnet or mainnet access
- **Wallet setup**: A wallet with sufficient SUI (for gas) and WAL tokens (for storage fees)
- **Command-line familiarity**: Comfortable using terminal/command prompt
- **Basic file operations**: Ability to create test files of specific sizes

### For Instructor

Before teaching this module, instructors should:

- Have hands-on experience with Walrus CLI, especially cost estimation features (`walrus info`, `--dry-run` flag)
- Be familiar with the cost model and calculation formulas
- Test all hands-on exercises beforehand with current prices
- Have access to a test environment or testnet for demonstrations
- Prepare examples with current WAL/SUI prices (prices may change over time)
- Review all cost calculation examples and verify they're accurate
- Understand the encoded size calculation logic
- Be prepared to explain cost optimization strategies with concrete examples

## Section-by-Section Guidance

### Section 1: Cost Model

**Key Points to Emphasize:**

- **Four distinct cost sources**: Storage Resources (WAL), Upload Costs (WAL), Transaction Costs (SUI), Object Costs (SUI)
- **Encoded size is key**: Costs are based on encoded size, not original size
- **5x expansion for large blobs**: Large blobs (>10MB) expand ~5x due to erasure coding
- **64MB metadata overhead**: Small blobs (<10MB) are dominated by fixed metadata overhead
- **Storage units**: Costs calculated per storage unit (1 MiB), rounded up
- **Linear relationships**: Storage cost scales linearly with size and epochs; upload cost scales linearly with size only

**Teaching Tips:**

- **Start with the Big Picture**: Use the mermaid diagram to show the four cost sources and their relationships
  - Emphasize that WAL costs (storage + upload) are separate from SUI costs (transactions + objects)
  - Show how each cost type behaves differently (variable vs fixed, one-time vs recurring)

- **Encoded Size is Critical**:
  - This is often the most confusing concept - spend extra time here
  - Use concrete examples: 1MB file → ~64MB encoded (metadata dominated), 100MB file → ~500MB encoded (erasure coding dominated)
  - Show the dry-run command to demonstrate actual encoded sizes
  - Explain why encoded size matters: it's what you pay for, not the original size

- **Cost Calculation Formula**:
  - Walk through each component step by step
  - Use a concrete example with actual numbers
  - Show how storage units are calculated: `ceil(encoded_size / 1_MiB)`
  - Demonstrate that upload cost is independent of epochs (charged once)

- **Visual Aids**: Use the cost breakdown diagram to show how costs accumulate. Draw cost curves showing how small vs large blobs behave differently.

**Quick Check:**

Ask students to:

- List all four sources of cost and which token each uses (WAL vs SUI)
- Explain why a 1MB file costs roughly the same as a 5MB file to store
- Calculate storage units for a 65MB encoded blob (Answer: 65 units)
- Identify which costs scale with epochs and which don't

**Discussion Points:**

- **Q: Why is encoded size different from original size?**  

  A: Walrus uses erasure coding for redundancy (5x expansion) and adds metadata overhead (~64MB per blob). The encoded size includes both, which is what actually gets stored and what you pay for.

- **Q: Why do small blobs have such high costs per MB?**  

  A: The fixed metadata overhead (~64MB) dominates for small blobs. A 1MB file still needs ~64MB of metadata, so you're paying for 64MB even though you only stored 1MB. This is why Quilt storage is recommended for small blobs.

- **Q: How can I find out the exact encoded size before storing?**  

  A: Use `walrus store <file> --epochs 1 --dry-run` to see the encoded size without actually storing the blob. This is essential for accurate cost estimation.

- **Q: Why are transaction costs relatively fixed?**  

  A: Transaction costs (SUI gas) are based on computation, not data size. The computation to register a blob is similar regardless of blob size, so gas costs are relatively constant.

- **Q: What happens to object costs when I burn a blob object?**  

  A: Most of the SUI storage fund deposit is refunded. Burning the object reclaims the SUI but doesn't delete the blob on Walrus - it just removes your ability to manage the blob lifecycle.

---

### Section 2: Storage Duration

**Key Points to Emphasize:**

- **Epochs as time units**: Each epoch ≈ 2 weeks on Mainnet
- **Storage cost scales linearly**: More epochs = proportionally higher storage resource cost
- **Upload/transaction costs are fixed**: These don't change with duration
- **Resource reuse**: Deletable blobs can be deleted early to reclaim storage resources
- **Strategic choices**: Short-term vs extended storage have different trade-offs

**Teaching Tips:**

- **Start with the Concept of Epochs**:
  - Explain that epochs are the time unit for storage duration
  - Emphasize that storage resource cost is `price × epochs`, so doubling epochs doubles storage cost
  - Show that upload and transaction costs are the same regardless of duration

- **Short-Term vs Extended Storage**:

  - Use a comparison table or side-by-side examples
  - Emphasize when each strategy is appropriate
  - Show cost calculations for the same blob with different durations

- **Resource Reuse Strategy**:

  - This is a key optimization - spend time explaining it clearly
  - Use the sequence diagram to show how storage resources can be reclaimed
  - Walk through a concrete example: Store for 10 epochs, use for 5, delete early, reuse remaining 5 epochs
  - Emphasize that this only works with deletable blobs

- **Decision Framework**:

  - Walk through the decision tree/questions students should ask
  - Provide examples for each path in the decision tree
  - Show how hybrid approaches can work

**Quick Check:**

Ask students to:

- Convert epochs to approximate time (e.g., 12 epochs = ? months)
- Calculate storage cost for 10MB blob for 1 epoch vs 10 epochs
- Explain when to use short-term vs extended storage
- Describe how resource reuse works and its limitations

**Discussion Points:**

- **Q: Should I always use short-term storage to minimize upfront costs?**  

  A: Not necessarily. If you know you'll need the data for a long time, extended storage can be more cost-effective per epoch and reduces transaction costs from frequent renewals. Also, if you use deletable blobs, you can buy long duration and delete early to reuse resources.

- **Q: What's the difference between extending a blob and buying a new one?**  

  A: Extending adds epochs to an existing blob. Buying a new blob creates a separate blob. Extending is typically cheaper in transaction costs, but you need to manage the extension before expiration.

- **Q: Can I extend a permanent blob?**  

  A: Permanent blobs don't expire, so they don't need extension. They're designed for truly permanent storage.

- **Q: How do I know when to delete a blob early for resource reuse?**  

  A: Delete deletable blobs as soon as they're no longer needed. The earlier you delete, the more epochs you can reclaim. This is most beneficial when you have a steady stream of temporary data.

---

### Section 3: Budget Planning

**Key Points to Emphasize:**

- **Estimation process**: Step-by-step approach to estimate costs
- **Data profile is critical**: Understanding your data characteristics is the foundation
- **Prices can change**: Always check current prices with `walrus info`
- **Multiple budget strategies**: Different allocation strategies for different needs
- **Monitoring is essential**: Track actual costs vs estimates
- **Include buffers**: Always add buffer for unexpected costs

**Teaching Tips:**

- **Walk Through the 8-Step Estimation Process**:

  - Go through each step methodically
  - Use the document storage service example as a detailed walkthrough
  - Show how to use `walrus info` to get current prices
  - Demonstrate `--dry-run` for accurate encoded size calculation
  - Show how to calculate each cost component

- **Budget Allocation Strategies**:

  - Explain when each strategy is appropriate
  - Use examples to show how different strategies work
  - Discuss pros and cons of each approach

- **Monitoring and Tracking**:

  - Show how to track costs using Sui Explorer
  - Explain key metrics to monitor
  - Discuss how to set up cost alerts

- **Cost Forecasting**:

  - Explain short-term vs long-term forecasting approaches
  - Discuss scenario planning (best/base/worst case)
  - Show how to adjust forecasts based on growth trends

- **Real-World Example**:

  - Walk through the document storage service example in detail
  - Show all calculations step by step
  - Discuss optimization opportunities

**Quick Check:**

Ask students to:

- List the 8 steps in cost estimation
- Explain why data profile is important
- Calculate total cost for a scenario given prices and blob characteristics
- Identify which budget allocation strategy to use for a given use case

**Discussion Points:**

- **Q: How accurate are cost estimates?**  

  A: Estimates can be quite accurate if you have good data about your use case. Use `--dry-run` for precise encoded size, check current prices, and include buffers for uncertainty. Actual costs may vary due to price changes, transaction gas fluctuations, and data growth.

- **Q: Should I estimate costs for the entire project upfront?**  

  A: It depends on your project. For fixed-scope projects, yes. For growing projects, estimate monthly/quarterly costs and forecast based on growth. Always include buffers for unexpected costs.

- **Q: How do I account for price changes?**  

  A: Include a price volatility buffer (10-20%). Monitor prices regularly and adjust forecasts. For long-term projects, consider scenario planning with different price assumptions.

- **Q: What's a reasonable buffer percentage?**  

  A: Typically 10-20% for unexpected costs, plus additional buffer for price volatility and growth. The exact amount depends on your risk tolerance and how well you understand your use case.

- **Q: How often should I review my budget?**  

  A: Monthly for cost tracking, quarterly for forecast adjustments, annually for major planning. More frequently if you're approaching budget limits or seeing unexpected costs.

---

### Section 4: Cost Reduction Ideas

**Key Points to Emphasize:**

- **Multiple strategies**: Many ways to reduce costs, often used together
- **Resource reuse is powerful**: Deleting deletable blobs early can significantly reduce costs
- **Quilt for small blobs**: Critical optimization for small file storage
- **Batching reduces transaction costs**: Fewer transactions = lower SUI costs
- **Compression helps large files**: Reduces blob size and thus costs
- **Strategic resource management**: Buying larger resources, splitting/merging strategically

**Teaching Tips:**

- **Resource Reuse**:
  - This is one of the most impactful strategies - emphasize it strongly
  - Walk through the example: Store for 10 epochs, use 5, delete early, reuse 5
  - Show the cost savings calculation
  - Emphasize it only works with deletable blobs
  - Discuss when this strategy is most beneficial

- **Quilt Storage**:

  - Explain why it's so effective for small blobs (amortizes metadata overhead)
  - Show the cost comparison: individual storage vs Quilt
  - Discuss when to use Quilt vs individual storage
  - Emphasize it's specifically designed for this use case

- **Batch Operations**:

  - Show how batching reduces transaction costs
  - Demonstrate with examples: 1 transaction for 10 blobs vs 10 transactions
  - Discuss PTBs for advanced batching

- **Other Strategies**:

  - Compression: Show size reduction examples
  - Resource management: Explain buying larger resources and splitting
  - Object burning: When to burn objects to reclaim SUI
  - Duration optimization: Don't over-provision epochs

- **Cost Reduction Checklist**:

  - Go through the checklist with students
  - Have them identify which strategies apply to their use cases
  - Discuss how strategies can be combined

**Quick Check:**

Ask students to:

- List at least 5 cost reduction strategies
- Explain how resource reuse works and when to use it
- Identify when Quilt storage is most beneficial
- Calculate savings from batching (e.g., 10 individual transactions vs 1 batch)

**Discussion Points:**

- **Q: Which cost reduction strategy provides the biggest savings?**  

  A: It depends on your use case. For small blobs, Quilt storage can save 50-90%. For temporary data, resource reuse can save 30-70%. For high-volume scenarios, batching can save 80-90% on transaction costs. Often the best approach is combining multiple strategies.

- **Q: Can I use Quilt storage for large files?**  

  A: Quilt is designed for small blobs where metadata overhead dominates. For large files, compression and strategic resource management are more effective. Quilt can still be used, but the benefits are smaller.

- **Q: When should I burn blob objects?**  

  A: Burn objects when you don't need lifecycle management (extend, delete, add attributes) and want to reclaim SUI. Don't burn if you might need to extend the blob lifetime or delete it early for resource reuse.

- **Q: How much can I save with compression?**  

  A: Depends on the data type. Text/logs: 50-90% reduction. Images: 20-50% (already compressed). Videos: 20-50% (already compressed). Databases: 30-70%. Trade-off is CPU usage for compression/decompression.

- **Q: Is it worth the effort to optimize costs?**  

  A: Yes, especially for production systems. Cost reductions of 50-90% are common with proper optimization. The effort is usually minimal compared to the savings, especially for high-volume use cases.

---

### Section 5: Scenarios

**Key Points to Emphasize:**

- **Real-world applications**: These scenarios show how theory applies in practice
- **Different strategies for different use cases**: Each scenario requires different optimizations
- **Cost savings vary**: Optimization effectiveness depends on the use case
- **Multiple strategies combined**: Best results come from combining strategies
- **Quantitative analysis**: Show actual cost calculations and savings

**Teaching Tips:**

- **Walk Through Each Scenario**:
  - Start with the use case description
  - Analyze the data profile (size, volume, duration)
  - Calculate base costs step by step
  - Identify applicable optimization strategies
  - Calculate optimized costs and savings
  - Discuss why certain strategies work better for each scenario

- **Compare Scenarios**:
  - Use the comparison table to show how different use cases have different cost profiles
  - Discuss why optimization strategies vary
  - Show how the same strategies have different effectiveness in different scenarios

- **Key Takeaways**:
  - Emphasize the main lessons from the scenarios
  - Help students identify patterns across scenarios
  - Connect scenarios back to cost reduction strategies

- **Encourage Analysis**:
  - Have students analyze which strategies would work for their own use cases
  - Discuss trade-offs between different approaches

**Quick Check:**

Ask students to:

- Identify which optimization strategies apply to each scenario
- Explain why Quilt storage is critical for small file scenarios
- Calculate cost savings for a scenario given optimization strategies
- Recommend strategies for a new use case

**Discussion Points:**

- **Q: Why does the high-volume scenario have such high base costs?**  

  A: High volume (1M files/month) combined with small file sizes means massive metadata overhead. Each 100KB file still needs ~64MB of metadata, so costs scale quickly. This is why Quilt storage is critical for this use case.

- **Q: Why don't all scenarios benefit equally from the same strategies?**  

  A: Different use cases have different cost drivers. Small files are dominated by metadata overhead (Quilt helps). Large files are dominated by erasure coding (compression helps). Temporary data benefits from resource reuse. The key is identifying your cost drivers.

- **Q: How do I know which scenario matches my use case?**  

  A: Analyze your data profile: file sizes, volume, duration, access patterns. Match these to the scenarios. Your use case might be a combination of multiple scenarios, requiring a hybrid approach.

- **Q: Are these cost estimates realistic?**  

  A: The calculations use example prices. Actual costs depend on current prices, which can change. The important thing is understanding the methodology and relative costs. Always check current prices with `walrus info` for your own estimates.

- **Q: Can I achieve these savings in practice?**  

  A: Yes, these savings are realistic with proper implementation. The key is applying the right strategies for your use case. Start with the highest-impact strategies (Quilt for small files, resource reuse for temporary data, batching for high volume).

---

### Section 6: Hands-On Exercises

**Key Points to Emphasize:**

- **Practical application**: Exercises reinforce theoretical concepts
- **Use actual tools**: Students work with real Walrus CLI commands
- **Compare estimates vs actual**: See how estimates compare to real costs
- **Build confidence**: Hands-on practice builds confidence in cost estimation
- **Troubleshooting**: Learn to handle common issues

**Teaching Tips:**

- **Set Up Properly**:
  - Ensure all students have Walrus CLI installed and configured
  - Verify they have access to network and sufficient tokens
  - Test the `walrus info` command to show current prices
  - Create sample files of different sizes beforehand

- **Exercise 1: Single Blob Cost**:
  - Walk through each step together first
  - Show how to use `walrus info` to get prices
  - Demonstrate `--dry-run` to get encoded size
  - Have students calculate costs, then verify with actual store
  - Compare estimates to actual costs

- **Exercise 2: Small vs Large Blobs**:
  - This exercise demonstrates the metadata overhead concept
  - Have students create files and compare costs
  - Discuss why the cost ratio differs from size ratio
  - Emphasize the "cost per MB" metric

- **Exercise 3: Scenario Calculation**:
  - This is a comprehensive exercise combining multiple concepts
  - Walk through the scenario step by step
  - Show how to apply optimization strategies
  - Calculate savings from each optimization

- **Exercise 4: Storage Duration Strategies**:
  - Compare different duration approaches
  - Show cost differences between strategies
  - Discuss when each strategy is appropriate

- **Exercise 5: Real-World Project Budget**:
  - This is the capstone exercise
  - Have students choose or create their own project
  - Guide them through the full budget planning process
  - Review their budgets and provide feedback

- **Exercise 6: Cost Monitoring**:
  - Practical exercise in tracking costs
  - Show how to use Sui Explorer
  - Calculate metrics and identify patterns

- **Common Issues**:
  - **Insufficient tokens**: Help students check balances and get more tokens
  - **Network issues**: Troubleshoot connectivity problems
  - **CLI errors**: Help debug command syntax and options
  - **Calculation errors**: Review cost calculation formulas

**Quick Check:**

Students should successfully:

- Calculate costs for blobs of different sizes
- Use `walrus info` and `--dry-run` for cost estimation
- Compare costs across different scenarios
- Create a budget plan for a project
- Track and analyze actual costs

**Discussion Points:**

- **Q: My calculated costs don't match the actual costs. Why?**  

  A: Several reasons: prices may have changed, transaction gas costs vary, encoded size calculation might differ slightly, or there may be calculation errors. Use `--dry-run` for accurate encoded size and check current prices.

- **Q: How do I know if my cost estimates are accurate?**  

  A: Compare your estimates to actual costs from test stores. If they're close (within 10-20%), your methodology is good. Remember to account for price changes and gas fluctuations.

- **Q: What if I don't have enough tokens for the exercises?**  

  A: Use `--dry-run` to practice calculations without spending tokens. For actual stores, use small files and short durations to minimize costs. Consider using testnet if available.

- **Q: How do I track costs for multiple blobs?**  

  A: Keep a spreadsheet or database tracking blob IDs, sizes, epochs, and costs. Use Sui Explorer to verify transaction costs. Aggregate by project or time period.

---

## Assessment Suggestions

### Formative Assessment (During Learning)

1. **Quick Checks**: After each section, ask 2-3 questions to gauge understanding
2. **Cost Calculation Practice**: Give students scenarios and have them calculate costs
3. **Strategy Matching**: Present use cases and have students identify appropriate optimization strategies
4. **Estimation Accuracy**: Have students estimate costs, then verify with `--dry-run` or actual stores
5. **Think-Pair-Share**: Have students explain cost concepts to each other

### Summative Assessment (End of Module)

1. **Conceptual Questions**:

   - Explain the four sources of cost and how each is calculated

   - Describe the difference between encoded size and unencoded size

   - Compare short-term vs extended storage strategies

   - Explain how resource reuse works and when to use it

2. **Practical Exercises**:

   - Calculate costs for a given scenario (file size, epochs, current prices)

   - Create a budget plan for a project with specific requirements

   - Identify and recommend optimization strategies for a use case

   - Compare costs for different storage strategies

3. **Case Study**:

   - Present a real-world use case

   - Have students analyze data profile, estimate costs, identify optimizations, and create a budget plan

   - Evaluate their recommendations and cost estimates

## Official Documentation for Reference

- [Walrus Cost Model Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/cost-model.md)

- [Walrus CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md)

- [Getting Started Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/started.md)

- [Quilt Storage Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md)

- [Sui Documentation](https://docs.sui.io/) - For understanding transaction costs and object storage

- [Sui Explorer](https://suiexplorer.com/) - For inspecting transactions and costs

## Module Completion Checklist

By the end of this module, students should be able to:

- [ ] Identify and explain all four sources of cost (Storage Resources, Upload Costs, Transaction Costs, Object Costs)
- [ ] Understand the difference between encoded size and unencoded size
- [ ] Calculate encoded size for blobs of different sizes
- [ ] Calculate storage costs for blobs given size, epochs, and current prices
- [ ] Use `walrus info` to get current prices
- [ ] Use `walrus store --dry-run` to estimate encoded size and costs
- [ ] Compare short-term vs extended storage strategies
- [ ] Explain how storage resource reuse works and when to use it
- [ ] Create budget plans for real-world projects
- [ ] Estimate costs using the 8-step process
- [ ] Identify appropriate cost reduction strategies for different use cases
- [ ] Calculate cost savings from optimization strategies
- [ ] Analyze real-world scenarios and recommend storage strategies
- [ ] Track and monitor actual costs vs estimates
- [ ] Troubleshoot common cost estimation issues
- [ ] Apply multiple optimization strategies together
- [ ] Create cost forecasts for short-term and long-term planning

---
