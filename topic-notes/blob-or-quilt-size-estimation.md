# Blob or Quilt Size Estimation

## Key Concepts

- Cost is based on **encoded size**, not original file size — encoding adds both a ~64 MB fixed metadata floor and ~5× erasure coding overhead.
- **Small blobs (< 10 MB)**: encoded size ≈ 64 MB (metadata dominates). A 1 KB file costs nearly the same as a 10 MB file.
- **Large blobs (> 10 MB)**: encoded size ≈ 5 × unencoded size (erasure coding dominates; very accurate for 100 MB+).
- Storage units are calculated as `ceil(encoded_size_bytes / 1_048_576)` — always rounds up.
- `--dry-run` gives the exact encoded size and cost without submitting any transaction.
- `walrus info price` and `walrus info size` show current network pricing and limits.
- Four cost components: WAL storage resource (size × epochs), WAL upload fee (size only, one-time), SUI gas, SUI object deposit (refundable).

## CLI Commands

```bash
# Dry run — shows encoded size and cost without storing
walrus store <FILE> --epochs 10 --dry-run
walrus store-quilt --dry-run --epochs 50 --paths ./large-collection/

# Check current prices (WAL/unit/epoch and write WAL/unit)
walrus info price

# Check size limits
walrus info size

# All system info in one call
walrus info
```

### Dry Run Output Example

```text
Blob ID: 057XMxnkX7a5D7acJ_XJIMYAfneZrqU2VqqzDFZCYmc
Encoding type: RedStuff/Reed-Solomon
Unencoded size: 435 KiB
Encoded size (including replicated metadata): 63.0 MiB
Cost to store as new blob (excluding gas): 0.0033 WAL
```

## Encoded Size Formula

```text
Encoded Size = Total Metadata + Slivers Size

Where (for 1000 shards / Mainnet):
  Metadata per shard = (1000 × 64 bytes) + 32 bytes = 64,032 bytes
  Total Metadata     = 1000 × 64,032 ≈ 61 MB

  Symbol Size        = ceil(Unencoded Size / (334 × 667)) rounded to 2-byte alignment
  Single Shard Size  = (334 + 667) × Symbol Size
  Slivers Size       = 1000 × Single Shard Size
```

### Quick Reference: Encoding Approximations

| Blob Size | Encoded Size (approx.) | Storage Units | Notes |
|---|---|---|---|
| 1 KB | ~64 MB | 64 | Metadata floor dominates |
| 100 KB | ~64 MB | 64 | Still metadata floor |
| 1 MB | ~67 MB | 67 | Metadata + some data |
| 10 MB | ~107 MB | 107 | Transitional range |
| 100 MB | ~512 MB | 512 | ~5.1× |
| 1 GB | ~5.1 GB | ~5,222 | ~5.1× |

### Cost Formula

```text
Total Cost = Storage Resource Cost + Upload Cost + Gas + Object Deposit

Storage Resource Cost = storage_units × price_per_unit_per_epoch × epochs  (WAL)
Upload Cost           = storage_units × write_price_per_unit               (WAL, one-time)
Gas                   = fixed per transaction                               (SUI)
Object Deposit        = fixed per object (mostly refundable on burn)        (SUI)

storage_units = ceil(encoded_size_bytes / 1_048_576)
```

### Example Calculation: 1 MB File for 10 Epochs

```text
Encoded size ≈ 67 MB → 67 storage units

Assume: price_per_unit = 500 WAL/epoch, write_price = 200 WAL/unit

Storage cost = 67 × 500 × 10 = 335,000 WAL
Upload cost  = 67 × 200       =  13,400 WAL
Total WAL    ≈ 348,400 WAL   (plus SUI gas)
```

### Quilt Size Estimation

Quilt cost is based on the **total combined unencoded size** of all patches:

```text
# 600 × 10 KB files = 6 MB total unencoded
# Encoded ≈ 63 MB (< 10 MB → metadata floor)
# ~63 storage units vs 600 × 64 = 38,400 units individually
# Savings: ~609×
```

## Source Files

- `05-Storage-costs/contents/01-cost-model.md`
- `11-Batch-storage/contents/03-creation-process.md`
