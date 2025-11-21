# Scenarios Based on Common Product Needs

This section provides real-world scenarios demonstrating how to estimate and optimize costs for common product use cases.

> **Important Note on Pricing**: All cost calculations in this document use **Testnet prices**
> (as of November 2025). Testnet prices are set arbitrarily for testing purposes and may differ
> from Mainnet.
>
> **Testnet Prices** (verified November 2025, prices are dynamic and may change):
> - Storage: 100,000,000 FROST/unit/epoch = 0.0001 WAL/unit/epoch
> - Upload: 25,000 FROST/unit = 0.000025 WAL/unit
> - *Note: 1 WAL = 1,000,000,000 FROST*
>
> **Mainnet Prices** (for reference, verified November 2025):
> - Storage: 11,000 FROST/unit/epoch = 0.000011 WAL/unit/epoch
> - Upload: 20,000 FROST/unit = 0.00002 WAL/unit
>
> **Always check current prices** using `walrus info` (or `walrus info --context <network>`)
> before making cost estimates for your project, as prices can change over time.
> Prices are shown in FROST by default; divide by 1,000,000,000 to convert to WAL.

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

**Cost Calculation** (using Testnet prices):
- Storage resource: 64 × 0.0001 WAL/unit/epoch × 6 epochs = 0.0384 WAL per blob
- Upload cost: 64 × 0.000025 WAL/unit = 0.0016 WAL per blob
- Total per blob: 0.04 WAL

**Monthly Cost**:
- 1,000 blobs × 0.04 WAL = 40 WAL/month


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
- Encoded size: ~2.2GB (4.6x original due to erasure coding)
- Storage units: ~2,206 units per blob

**Cost Calculation** (using Testnet prices):
- Storage resource: 2,206 × 0.0001 WAL/unit/epoch × 24 epochs = 5.29 WAL per blob
- Upload cost: 2,206 × 0.000025 WAL/unit = 0.055 WAL per blob
- Total per blob: 5.35 WAL

**Monthly Cost**:
- 100 blobs × 5.35 WAL = 535 WAL/month

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

**Cost Calculation** (using Testnet prices):
- Storage resource: 64 × 0.0001 WAL/unit/epoch × 1 epoch = 0.0064 WAL per blob
- Upload cost: 64 × 0.000025 WAL/unit = 0.0016 WAL per blob
- Total per blob: 0.008 WAL

**Daily Cost**:
- 10,000 blobs × 0.008 WAL = 80 WAL/day

**Monthly Cost** (300,000 blobs):
- 300,000 blobs × 0.008 WAL = 2,400 WAL/month

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
- Encoded size: ~88MB (metadata + data)
- Storage units: 88 units per blob

**Cost Calculation** (using Testnet prices):
- Storage resource: 88 × 0.0001 WAL/unit/epoch × 520 epochs = 4.576 WAL per blob
- Upload cost: 88 × 0.000025 WAL/unit = 0.0022 WAL per blob
- Total per blob: 4.58 WAL

**Monthly Cost** (if paying upfront for 10 years):
- 5,000 blobs × 4.58 WAL = 22,900 WAL/month

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

**Cost Calculation** (using Testnet prices):
- Storage resource: 64 × 0.0001 WAL/unit/epoch × 12 epochs = 0.0768 WAL per blob
- Upload cost: 64 × 0.000025 WAL/unit = 0.0016 WAL per blob
- Total per blob: 0.0784 WAL

**Monthly Cost**:
- 1,000,000 blobs × 0.0784 WAL = 78,400 WAL/month

## Scenario Comparison Summary


| Scenario | Monthly Files | Avg Size | Cost (WAL) |
|----------|---------------|----------|-----------------|
| Small Files | 1,000 | 500KB | 40 |
| Large Files | 100 | 500MB | 535 |
| Temporary | 300K | 2MB | 2,400 |
| Archive | 5,000 | 6MB | 22,900 |
| High Volume | 1M | 100KB | 78,400 |

**Key Takeaways**:

- Early deletion and resource reuse are critical for temporary data
- Compression helps for large files

## Next Steps

Now that you've seen real-world scenarios, try the [Hands-On Exercises](./hands-on.md) to practice calculating costs for your own scenarios.

