# Scenarios Based on Common Product Needs

This section provides real-world scenarios demonstrating how to estimate and optimize costs for common product use cases.

## Scenario 1: Small File Storage (Documents, Images)

### Use Case

A document management system that stores:

- PDF documents (average 500KB)
- Images (average 2MB)
- Text files (average 100KB)
- Total: 1,000 files per month
- Storage duration: 3 months (6 epochs)

### Cost Analysis

**Data Profile**:

- Average size: ~500KB (small blob)
- Encoded size: ~64MB (metadata dominated)
- Storage units: 64 units per blob

**Cost Calculation** (example prices):

- Storage resource: 64 × 1000 WAL/unit/epoch × 6 epochs = 384,000 WAL per blob
- Upload cost: 64 × 100 WAL/unit = 6,400 WAL per blob
- Total per blob: 390,400 WAL

**Monthly Cost**:

- 1,000 blobs × 390,400 WAL = 390,400,000 WAL/month
- Transaction costs: ~200 SUI/month

### Optimization Strategies

1. **Use Quilt Storage**: Store multiple small files together
   - Reduces metadata overhead significantly
   - Estimated savings: 50-70% reduction in storage costs

2. **Delete Early**: Use deletable blobs, delete when documents are no longer needed
   - Reuse storage resources
   - Estimated savings: 30-50% if deleting after 2 months instead of 3

3. **Batch Uploads**: Upload multiple files together
   - Reduces transaction costs
   - Estimated savings: 10-20% reduction in SUI costs

### Optimized Cost Estimate

With Quilt and early deletion:

- Storage cost: ~150,000,000 WAL/month (60% reduction)
- Transaction cost: ~150 SUI/month (25% reduction)

## Scenario 2: Large File Storage (Videos, Datasets)

### Use Case

A video hosting platform that stores:

- Video files (average 500MB)
- Dataset files (average 1GB)
- Total: 100 files per month
- Storage duration: 12 months (24 epochs)

### Cost Analysis

**Data Profile**:

- Average size: 500MB (large blob)
- Encoded size: ~2.5GB (5× original due to erasure coding)
- Storage units: ~2,441 units per blob

**Cost Calculation** (example prices):

- Storage resource: 2,441 × 1000 WAL/unit/epoch × 24 epochs = 58,584,000 WAL per blob
- Upload cost: 2,441 × 100 WAL/unit = 244,100 WAL per blob
- Total per blob: 58,828,100 WAL

**Monthly Cost**:
- 100 blobs × 58,828,100 WAL = 5,882,810,000 WAL/month
- Transaction costs: ~20 SUI/month

### Optimization Strategies

1. **Compression**: Compress videos before storing
   - Reduces blob size by 20-50%
   - Estimated savings: 20-50% reduction in storage costs

2. **Buy Larger Resources**: Purchase storage resources in bulk
   - May get better rates
   - Estimated savings: 5-10% reduction

3. **Extend Strategically**: Start with shorter duration, extend as needed
   - Only pay for what you use
   - Estimated savings: 10-20% if some videos are deleted early

### Optimized Cost Estimate

With compression and strategic extension:
- Storage cost: ~4,000,000,000 WAL/month (32% reduction)
- Transaction cost: ~18 SUI/month (10% reduction)

## Scenario 3: Temporary Data Storage

### Use Case

A web application that stores:
- User session data (average 50KB)
- Temporary uploads (average 5MB)
- Cache files (average 1MB)
- Total: 10,000 files per day (300,000 per month)
- Storage duration: 1 week (0.5 epochs, but minimum 1 epoch)

### Cost Analysis

**Data Profile**:
- Average size: ~2MB (small blob)
- Encoded size: ~64MB (metadata dominated)
- Storage units: 64 units per blob
- Storage duration: 1 epoch (minimum)

**Cost Calculation** (example prices):
- Storage resource: 64 × 1000 WAL/unit/epoch × 1 epoch = 64,000 WAL per blob
- Upload cost: 64 × 100 WAL/unit = 6,400 WAL per blob
- Total per blob: 70,400 WAL

**Daily Cost**:
- 10,000 blobs × 70,400 WAL = 704,000,000 WAL/day
- Transaction costs: ~2,000 SUI/day

### Optimization Strategies

1. **Quilt Storage**: Essential for this use case
   - Store many small temporary files together
   - Estimated savings: 60-80% reduction in storage costs

2. **Delete Aggressively**: Delete as soon as data is no longer needed
   - Reuse storage resources immediately
   - Estimated savings: 50-70% if deleting after 3 days instead of 7

3. **Batch Operations**: Upload and delete in batches
   - Reduces transaction costs
   - Estimated savings: 30-50% reduction in SUI costs

4. **Use Deletable Blobs**: Essential for temporary data
   - Allows early deletion and resource reuse

### Optimized Cost Estimate

With Quilt, aggressive deletion, and batching:
- Storage cost: ~100,000,000 WAL/day (86% reduction)
- Transaction cost: ~800 SUI/day (60% reduction)

## Scenario 4: Permanent Archive Storage

### Use Case

A compliance system that stores:
- Legal documents (average 10MB)
- Audit logs (average 5MB)
- Compliance records (average 2MB)
- Total: 5,000 files per month
- Storage duration: 10 years (520 epochs, but typically extended periodically)

### Cost Analysis

**Data Profile**:
- Average size: ~6MB (small-medium blob)
- Encoded size: ~64MB (metadata dominated for most)
- Storage units: 64 units per blob

**Cost Calculation** (example prices):
- Storage resource: 64 × 1000 WAL/unit/epoch × 520 epochs = 33,280,000 WAL per blob
- Upload cost: 64 × 100 WAL/unit = 6,400 WAL per blob
- Total per blob: 33,286,400 WAL

**Monthly Cost** (if paying upfront for 10 years):
- 5,000 blobs × 33,286,400 WAL = 166,432,000,000 WAL/month
- Transaction costs: ~100 SUI/month

### Optimization Strategies

1. **Extend Periodically**: Don't pay for 10 years upfront
   - Pay for shorter periods (e.g., 1-2 years), extend as needed
   - Estimated savings: Better cash flow, only pay for what you need

2. **Use Permanent Blobs**: For truly permanent data
   - Guaranteed availability
   - May have different cost structure

3. **Burn Objects Early**: If you don't need lifecycle management
   - Reclaim SUI storage fund deposits
   - Estimated savings: ~50-100 SUI per blob over 10 years

4. **Quilt for Small Files**: Still beneficial for small compliance records
   - Reduces metadata overhead
   - Estimated savings: 50-70% for small files

### Optimized Cost Estimate

With periodic extension and Quilt:
- Storage cost: ~80,000,000,000 WAL/month (52% reduction, but spread over time)
- Transaction cost: ~50 SUI/month (50% reduction)
- Better cash flow: Pay annually instead of upfront

## Scenario 5: High-Volume Use Case

### Use Case

A data analytics platform that stores:
- Log files (average 100KB)
- Metrics data (average 50KB)
- Event streams (average 200KB)
- Total: 1,000,000 files per month
- Storage duration: 6 months (12 epochs)

### Cost Analysis

**Data Profile**:
- Average size: ~100KB (very small blob)
- Encoded size: ~64MB (metadata dominated)
- Storage units: 64 units per blob

**Cost Calculation** (example prices):
- Storage resource: 64 × 1000 WAL/unit/epoch × 12 epochs = 768,000 WAL per blob
- Upload cost: 64 × 100 WAL/unit = 6,400 WAL per blob
- Total per blob: 774,400 WAL

**Monthly Cost**:
- 1,000,000 blobs × 774,400 WAL = 774,400,000,000 WAL/month
- Transaction costs: ~20,000 SUI/month

### Optimization Strategies

1. **Quilt Storage**: Critical for this use case
   - Store thousands of small files per Quilt
   - Estimated savings: 70-90% reduction in storage costs

2. **Aggressive Batching**: Batch operations at scale
   - Upload thousands of files per transaction
   - Estimated savings: 80-90% reduction in transaction costs

3. **Delete Early**: Delete data as soon as analytics are complete
   - Reuse storage resources
   - Estimated savings: 50-70% if deleting after 3 months instead of 6

4. **Compression**: Compress log files before storing
   - Reduces blob sizes
   - Estimated savings: 20-40% additional reduction

5. **Tiered Storage**: Different strategies for different data types
   - Hot data: Short duration, Quilt storage
   - Cold data: Longer duration, individual storage

### Optimized Cost Estimate

With Quilt, batching, early deletion, and compression:
- Storage cost: ~50,000,000,000 WAL/month (94% reduction)
- Transaction cost: ~2,000 SUI/month (90% reduction)

## Scenario Comparison Summary

```mermaid
graph LR
    Base[Base Cost: 774B WAL] --> Opt1[Quilt Storage]
    Opt1 -->|"Save 70-90%"| Step1[~100B WAL]
    Step1 --> Opt2[Batching & Early Delete]
    Opt2 -->|"Save ~50%"| Final[Final Cost: 50B WAL]
    
    style Base fill:#f96,stroke:#333,stroke-width:2px
    style Final fill:#9f6,stroke:#333,stroke-width:2px
    style Opt1 fill:#69f,stroke:#333
    style Opt2 fill:#69f,stroke:#333
```

| Scenario | Monthly Files | Avg Size | Base Cost (WAL) | Optimized Cost (WAL) | Savings |
|----------|---------------|----------|-----------------|----------------------|---------|
| Small Files | 1,000 | 500KB | 390M | 150M | 62% |
| Large Files | 100 | 500MB | 5.9B | 4.0B | 32% |
| Temporary | 300K | 2MB | 21B | 3B | 86% |
| Archive | 5,000 | 6MB | 166B | 80B | 52% |
| High Volume | 1M | 100KB | 774B | 50B | 94% |

**Key Takeaways**:
- Quilt storage provides the biggest savings for small files
- Early deletion and resource reuse are critical for temporary data
- Compression helps for large files
- Batching reduces transaction costs significantly
- Optimization strategies vary by use case

## Next Steps

Now that you've seen real-world scenarios, try the [Hands-On Exercises](./hands-on.md) to practice calculating costs for your own scenarios.

