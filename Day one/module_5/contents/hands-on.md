# Hands-On Exercises

This section provides practical exercises to reinforce your understanding of storage costs in Walrus. Complete these exercises to gain hands-on experience with cost estimation and optimization.

## Prerequisites

Before starting, ensure you have:

1. ✅ Walrus CLI installed and configured
2. ✅ A Sui wallet with SUI and WAL tokens
3. ✅ Network connectivity
4. ✅ Basic understanding of the cost model (see [Cost Model](./cost-model.md))

Verify your setup:

```sh
walrus --version
walrus info
```

## Exercise 1: Calculate Cost for a Single Blob

In this exercise, you'll calculate the cost of storing a single blob.

### Step 1: Get Current Prices

Check current Walrus prices:

```sh
walrus info
```

Record the following:

- Price per encoded storage unit per epoch: ________ WAL
- Write price per encoded storage unit: ________ WAL

### Step 2: Create a Test File

Create a test file of a specific size:

```sh
# Create a 5MB file
dd if=/dev/urandom of=test-5mb.bin bs=1M count=5

# Or on macOS:
mkfile 5m test-5mb.bin
```

### Step 3: Estimate Encoded Size

Use dry-run to see the encoded size:

```sh
walrus store test-5mb.bin --epochs 1 --dry-run
```

Record:

- Encoded size: ________ bytes
- Storage units: ________ (calculate: ceil(encoded_size / 1_MiB))

### Step 4: Calculate Storage Cost

Calculate the cost for storing this blob for 10 epochs:

**Storage Resource Cost**:

```text
Storage units × Price per unit per epoch × Epochs = ________ WAL
```

**Upload Cost**:

```text
Storage units × Write price per unit = ________ WAL
```

**Total WAL Cost**:

```text
Storage Resource Cost + Upload Cost = ________ WAL
```

### Step 5: Verify with Actual Store

Store the blob and observe actual costs:

```sh
walrus store test-5mb.bin --epochs 10
```

Check the transaction in Sui Explorer and compare:

- Actual WAL cost: ________ WAL
- Actual SUI cost: ________ SUI
- How does this compare to your estimate?

### Step 6: Calculate Cost per Epoch

Calculate the cost per epoch:

```text
Total WAL Cost / Epochs = ________ WAL per epoch
```

## Exercise 2: Compare Small vs Large Blob Costs

In this exercise, you'll compare costs for small and large blobs.

### Step 1: Create Test Files

Create files of different sizes:

```sh
# Small file: 1MB
dd if=/dev/urandom of=small-1mb.bin bs=1M count=1

# Large file: 100MB
dd if=/dev/urandom of=large-100mb.bin bs=1M count=100
```

### Step 2: Estimate Costs for Small Blob

```sh
walrus store small-1mb.bin --epochs 1 --dry-run
```

Record:
- Encoded size: ________ bytes
- Storage units: ________
- Estimated cost for 10 epochs: ________ WAL

### Step 3: Estimate Costs for Large Blob

```sh
walrus store large-100mb.bin --epochs 1 --dry-run
```

Record:
- Encoded size: ________ bytes
- Storage units: ________
- Estimated cost for 10 epochs: ________ WAL

### Step 4: Compare Costs

Calculate:
- **Cost ratio**: Large blob cost / Small blob cost = ________
- **Size ratio**: Large blob size / Small blob size = ________
- **Cost efficiency**: Which is more cost-efficient per MB?

**Questions to consider**:
- Why is the cost ratio different from the size ratio?
- What dominates costs for small blobs?
- What dominates costs for large blobs?

## Exercise 3: Calculate Cost for a Scenario

In this exercise, you'll calculate costs for a realistic scenario.

### Scenario: Document Storage Service

**Requirements**:
- Store 1,000 documents per month
- Average document size: 2MB
- Storage duration: 6 months (12 epochs)
- Documents are deletable after 6 months

### Step 1: Get Current Prices

```sh
walrus info
```

Record current prices.

### Step 2: Calculate Encoded Size

Create a sample 2MB file and check encoded size:

```sh
dd if=/dev/urandom of=sample-2mb.bin bs=1M count=2
walrus store sample-2mb.bin --epochs 1 --dry-run
```

Record:
- Encoded size: ________ bytes
- Storage units: ________

### Step 3: Calculate Cost per Document

**Storage Resource Cost**:
```
Storage units × Price per unit per epoch × 12 epochs = ________ WAL
```

**Upload Cost**:
```
Storage units × Write price per unit = ________ WAL
```

**Total per Document**:
```
Storage Resource Cost + Upload Cost = ________ WAL
```

### Step 4: Calculate Monthly Cost

**Monthly WAL Cost**:
```
1,000 documents × Cost per document = ________ WAL/month
```

**Monthly SUI Cost** (estimate):
```
1,000 documents × 2 transactions × ~0.01 SUI = ________ SUI/month
```

### Step 5: Calculate Total 6-Month Cost

**Total WAL Cost**:
```
Monthly WAL Cost × 6 months = ________ WAL
```

**Total SUI Cost**:
```
Monthly SUI Cost × 6 months = ________ SUI
```

### Step 6: Optimize the Scenario

Now apply optimization strategies:

**Option A: Use Quilt Storage**
- Estimate: 60% reduction in storage costs
- Optimized WAL cost: ________ WAL/month

**Option B: Delete Early (after 3 months)**
- Estimate: 50% reduction in storage costs
- Optimized WAL cost: ________ WAL/month

**Option C: Both Strategies**
- Combined savings: ________ WAL/month
- Percentage reduction: ________%

## Exercise 4: Compare Storage Duration Strategies

In this exercise, you'll compare different storage duration strategies.

### Scenario

Store a 10MB blob for 1 year (24 epochs).

### Step 1: Calculate Upfront Cost

Calculate cost for storing 24 epochs upfront:

```sh
# Create 10MB file
dd if=/dev/urandom of=test-10mb.bin bs=1M count=10
walrus store test-10mb.bin --epochs 1 --dry-run
```

Record encoded size and calculate:
- Cost for 24 epochs upfront: ________ WAL

### Step 2: Calculate Periodic Extension Cost

Calculate cost for storing 6 epochs at a time, extending 4 times:

- Cost for 6 epochs: ________ WAL
- Extension cost (4 extensions): ________ WAL
- Total cost: ________ WAL

**Note**: Extension costs are typically just the additional epochs.

### Step 3: Calculate Early Deletion Cost

Calculate cost for storing 24 epochs but deleting after 12 epochs:

- Cost for 24 epochs: ________ WAL
- If deletable, can reuse remaining 12 epochs
- Effective cost: ________ WAL (only paying for 12 epochs used)

### Step 4: Compare Strategies

| Strategy | Total Cost | Pros | Cons |
|----------|------------|------|------|
| Upfront (24 epochs) | ________ WAL | Simple, guaranteed | Higher upfront cost |
| Periodic (6 epochs × 4) | ________ WAL | Lower upfront, flexible | More transactions |
| Early deletion (24 epochs, delete at 12) | ________ WAL | Reuse resources | Requires management |

**Which strategy is best for your use case?**

## Exercise 5: Real-World Project Budget

In this exercise, you'll create a budget plan for a real-world project.

### Choose Your Project

Select one of these projects or create your own:

**Option A: Photo Sharing App**
- 10,000 photos/month
- Average size: 5MB
- Storage duration: 1 year

**Option B: Log Analytics Platform**
- 100,000 log files/month
- Average size: 500KB
- Storage duration: 3 months

**Option C: Video Archive**
- 500 videos/month
- Average size: 1GB
- Storage duration: 5 years

### Step 1: Define Requirements

Document your project requirements:
- Number of files per month: ________
- Average file size: ________
- Storage duration: ________ epochs
- Other requirements: ________

### Step 2: Get Current Prices

```sh
walrus info
```

Record current prices.

### Step 3: Calculate Base Costs

Calculate costs without optimization:
- Cost per file: ________ WAL
- Monthly cost: ________ WAL
- Total cost: ________ WAL

### Step 4: Identify Optimization Opportunities

List optimization strategies that apply:
- [ ] Quilt storage
- [ ] Early deletion
- [ ] Compression
- [ ] Batch operations
- [ ] Other: ________

### Step 5: Calculate Optimized Costs

Estimate savings from each strategy:
- Strategy 1: ________% savings
- Strategy 2: ________% savings
- Combined savings: ________%

Calculate optimized costs:
- Optimized monthly cost: ________ WAL
- Optimized total cost: ________ WAL

### Step 6: Create Budget Plan

Create a budget plan:
- **Monthly budget**: ________ WAL, ________ SUI
- **Quarterly budget**: ________ WAL, ________ SUI
- **Annual budget**: ________ WAL, ________ SUI
- **Buffer (20%)**: ________ WAL, ________ SUI

### Step 7: Document Assumptions

Document your assumptions:
- Price stability: ________
- Growth rate: ________
- Optimization effectiveness: ________
- Other assumptions: ________

## Exercise 6: Cost Monitoring Practice

In this exercise, you'll practice monitoring and tracking costs.

### Step 1: Store Multiple Blobs

Store several blobs of different sizes:

```sh
# Store small blob
walrus store small-1mb.bin --epochs 5

# Store medium blob
walrus store test-5mb.bin --epochs 10

# Store large blob
walrus store large-100mb.bin --epochs 3
```

### Step 2: Track Costs

For each blob, record:
- Blob ID: ________
- Size: ________
- Epochs: ________
- WAL cost: ________
- SUI cost: ________

### Step 3: Calculate Metrics

Calculate:
- **Average cost per blob**: ________ WAL
- **Average cost per MB**: ________ WAL/MB
- **Average cost per epoch**: ________ WAL/epoch
- **Total cost**: ________ WAL, ________ SUI

### Step 4: Identify Patterns

Analyze your data:
- Which blob size is most cost-efficient per MB?
- How does storage duration affect cost per epoch?
- What percentage of cost is storage vs. upload?

### Step 5: Optimize

Based on your analysis, identify optimization opportunities:
- What would you change?
- What savings could you achieve?
- How would you implement the changes?

## Additional Challenges

### Challenge 1: Cost Comparison Tool

Create a simple script or spreadsheet to compare costs for different scenarios:
- Input: File size, epochs, current prices
- Output: Total cost, cost breakdown, cost per MB

### Challenge 2: Optimization Calculator

Build a tool that suggests optimization strategies:
- Input: Use case, file sizes, storage duration
- Output: Recommended strategies, estimated savings

### Challenge 3: Budget Tracker

Create a system to track actual costs vs. budget:
- Track costs per project
- Compare actual vs. planned
- Generate reports

## Summary

After completing these exercises, you should be able to:

1. ✅ Calculate storage costs for any blob size and duration
2. ✅ Compare costs across different scenarios
3. ✅ Identify optimization opportunities
4. ✅ Create budget plans for real projects
5. ✅ Monitor and track actual costs

## Next Steps

- Review the [Cost Model](./cost-model.md) if you need clarification
- Explore [Cost Reduction Ideas](./cost-reduction.md) for more optimization strategies
- Check [Scenarios](./scenarios.md) for additional real-world examples
- Apply these skills to your own projects!

