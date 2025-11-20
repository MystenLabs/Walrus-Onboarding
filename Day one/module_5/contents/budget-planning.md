# Budget Planning in Real Projects

This section provides practical guidance for planning storage budgets in real-world projects, including cost estimation, allocation strategies, and monitoring.

## Estimating Costs for Your Use Case

Before starting a project, estimate storage costs to plan your budget effectively.

### Step 1: Understand Your Data Profile

Identify key characteristics of your data:

- **Average blob size**: What's the typical size of files you'll store?
- **Total data volume**: How much data will you store in total?
- **Storage duration**: How long does each blob need to be stored?
- **Access patterns**: How often will you read/update/delete blobs?
- **Growth rate**: How quickly will your data volume grow?

### Step 2: Get Current Prices

Check current Walrus prices:

```sh
walrus info
```

This shows:

- Price per encoded storage unit per epoch
- Write price per encoded storage unit
- Maximum blob size

**Note**: Prices can change over time. For long-term planning, consider:

- Current prices as a baseline
- Potential price volatility
- Historical price trends (if available)

### Step 3: Calculate Encoded Size

Remember that costs are based on **encoded size**, not original size:

- **Small blobs (< 10MB)**: Encoded size ≈ 64MB (dominated by metadata)
- **Large blobs (> 10MB)**: Encoded size ≈ 5 × original size (erasure coding)

For precise calculation logic, refer to [`crates/walrus-core/src/encoding/config.rs`](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-core/src/encoding/config.rs).

For more accurate estimates, use dry-run:

```sh
walrus store <SAMPLE_FILE> --epochs 1 --dry-run
```

### Step 4: Estimate Storage Resource Costs

For each blob:

```text
Storage Resource Cost = storage_units × price_per_unit × epochs
```

Where `storage_units = ceil(encoded_size / 1_MiB)`

### Step 5: Estimate Upload Costs

For each blob:

```text
Upload Cost = storage_units × write_price_per_unit
```

### Step 6: Estimate Transaction Costs

Transaction costs are relatively fixed per transaction:

- **Acquire storage + Register**: ~fixed SUI cost
- **Certify**: ~fixed SUI cost

Multiply by the number of blobs you'll store.

### Step 7: Estimate Object Costs

Object costs are:

- Fixed SUI deposit per blob object
- Mostly refundable when objects are burned
- Consider whether you'll burn objects early

### Step 8: Calculate Total Costs

```text
Total Cost = (Storage Resource Cost + Upload Cost) × number_of_blobs + Transaction Costs + Object Costs
```

## Budget Allocation Strategies

### Strategy 1: Per-Blob Budget

Allocate a fixed budget per blob:

```text
Budget per blob = Storage Cost + Upload Cost + Transaction Costs
```

Useful when:

- Blobs are similar in size and duration
- You have a fixed number of blobs to store
- Simple cost tracking

### Strategy 2: Per-Project Budget

Allocate a total budget for the entire project:

```text
Total Budget = Sum of all blob costs + Buffer for unexpected costs
```

Useful when:

- Multiple types of blobs with varying costs
- Need flexibility in allocation
- Want to optimize across different blob types

### Strategy 3: Per-Time-Period Budget

Allocate budget per time period (monthly, quarterly):

```text
Period Budget = Expected new blobs in period × Average cost per blob
```

Useful when:

- Continuous data ingestion
- Need to track spending over time
- Want to control monthly/quarterly costs

### Strategy 4: Tiered Budget

Allocate different budgets for different data tiers:

- **Tier 1 (Critical)**: High budget, extended storage, permanent blobs
- **Tier 2 (Important)**: Medium budget, moderate storage duration
- **Tier 3 (Temporary)**: Low budget, short storage duration, deletable blobs

## Monitoring and Tracking Costs

### Track Actual Costs

Monitor your actual spending:

1. **Use Sui Explorer**: Check transaction history to see WAL and SUI costs
2. **Track per blob**: Record costs for each blob you store
3. **Aggregate by project**: Sum costs by project or use case
4. **Monitor over time**: Track costs per time period

### Key Metrics to Track

- **Total WAL spent**: Sum of storage resource and upload costs
- **Total SUI spent**: Sum of transaction and object costs
- **Cost per blob**: Average cost across all blobs
- **Cost per MiB**: Cost efficiency metric
- **Cost per epoch**: Storage cost efficiency

### Cost Alerts

Set up alerts for:

- **Budget thresholds**: Alert when approaching budget limits
- **Unusual spending**: Alert on unexpected cost spikes
- **Price changes**: Alert when Walrus prices change significantly

## Cost Forecasting

### Short-Term Forecasting (1-3 months)

Based on current usage patterns:

```text
Forecast = Current monthly cost × Number of months
```

Adjust for:

- Expected growth in data volume
- Planned new features or use cases
- Seasonal variations

### Long-Term Forecasting (6-12 months)

Consider:

- **Growth trends**: How fast is your data volume growing?
- **Price volatility**: How might Walrus prices change?
- **Feature plans**: What new storage needs are coming?
- **Optimization opportunities**: Can you reduce costs?

### Scenario Planning

Plan for different scenarios:

- **Best case**: Lower growth, stable prices, successful optimizations
- **Base case**: Expected growth and prices
- **Worst case**: Higher growth, price increases, no optimizations

## Budget Optimization

### Regular Reviews

Review your budget regularly:

- **Monthly**: Check actual vs. planned costs
- **Quarterly**: Review and adjust forecasts
- **Annually**: Major budget planning and optimization

### Cost Reduction Opportunities

Look for opportunities to reduce costs:

- **Delete unused blobs**: Reclaim storage resources
- **Optimize blob sizes**: Use Quilt for small blobs
- **Batch operations**: Reduce transaction costs
- **Burn unused objects**: Reclaim SUI storage fund deposits
- **Adjust storage duration**: Use shorter durations when possible

### Budget Buffer

Always include a buffer in your budget:

- **10-20% buffer**: For unexpected costs
- **Price volatility buffer**: For price changes
- **Growth buffer**: For unplanned data growth

## Real-World Budget Planning Example

### Scenario: Document Storage Service

**Requirements**:

- Store 10,000 documents per month
- Average document size: 2MB
- Storage duration: 6 months (12 epochs)
- Documents are deletable after 6 months

**Cost Estimation**:

1. **Data profile**:
   - 10,000 blobs/month × 12 months = 120,000 blobs total
   - Average size: 2MB (small blob, so encoded size ≈ 64MB)
   - Storage units: ceil(64MB / 1MB) = 64 units per blob

2. **Get prices** (example):
   - Storage price: 1000 WAL per unit per epoch
   - Write price: 100 WAL per unit

3. **Calculate costs per blob**:
   - Storage resource: 64 × 1000 × 12 = 768,000 WAL
   - Upload cost: 64 × 100 = 6,400 WAL
   - Total WAL per blob: 774,400 WAL

4. **Total WAL cost**:
   - 120,000 blobs × 774,400 WAL = 92,928,000,000 WAL

5. **Transaction costs** (estimate):
   - 2 transactions per blob × 120,000 blobs = 240,000 transactions
   - Estimate SUI cost per transaction: 0.01 SUI
   - Total SUI: 2,400 SUI

6. **Budget allocation**:
   - Monthly WAL budget: 92,928,000,000 / 12 = 7,744,000,000 WAL/month
   - Monthly SUI budget: 2,400 / 12 = 200 SUI/month
   - Add 20% buffer: 9,292,800,000 WAL/month, 240 SUI/month

### Optimization Opportunities

- Use Quilt storage for small documents (reduces metadata overhead)
- Delete documents early when possible (reuse storage resources)
- Batch uploads to reduce transaction costs
- Burn blob objects after 6 months to reclaim SUI

## Next Steps

Now that you understand budget planning, learn about [Cost Reduction Ideas](./cost-reduction.md) to optimize your storage spending.

