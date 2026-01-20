## Answer Key

### Section 1: Publishers and Aggregators

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 1.1 | B | Publisher handles encode + upload; Aggregator handles fetch + reconstruct |
| 1.2 | C | Publishers are untrusted; clients verify via BlobIds |
| 1.3 | B | Aggregators are read-only and don't require a wallet |
| 1.4 | B | Brief delays (1-2 seconds) may occur during transitions |
| 1.5 | B | `--n-clients` parameter controls concurrency |
| 1.6 | A, C | Monitor request/error rates and latency percentiles |
| 1.7 | B | Disk space is a permanent failure until resolved |
| 1.8 | A, C | Check service status and run test upload |
| 1.9 | B | Automatic epoch detection and committee refresh |

### Section 2: Upload Transaction Lifecycle

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 2.1 | C | Encoding is the first phase |
| 2.2 | B | Encoding → Registration → Sealing → Certification |
| 2.3 | C | `BlobCertified` event signals availability |
| 2.4 | A, D | BlobId is derived from content and computable pre-transaction |
| 2.5 | B | Initial status is "Registered" |
| 2.6 | D | Only 334 slivers needed for reconstruction |
| 2.7 | A, B | Checks on-chain registration and local storage |
| 2.8 | B | 667 signatures required; 650 fails quorum |
| 2.9 | B | BlobCertified triggers peer recovery sync |

### Section 3: Transaction Types

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 3.1 | B | reserve_space purchases storage capacity |
| 3.2 | B | register_blob associates blob ID with storage |
| 3.3 | C | certify_blob posts aggregated signatures |
| 3.4 | C | Standard readBlob is free and off-chain |
| 3.5 | A, C | Extensions before expiry; reusing Storage is cheaper |
| 3.6 | B | extend_blob pays WAL; extend_blob_with_resource merges Storage |
| 3.7 | B | Bundling keeps uploads atomic |
| 3.8 | B | Upfront avoids multiple gas fees |

### Section 4: Quilts

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 4.1 | B | Quilts reduce costs for many small blobs |
| 4.2 | C | 666 patches maximum (667 secondary - 1 for index) |
| 4.3 | C | Operations apply to entire quilt |
| 4.4 | A, C | Composite ID depends on quilt composition |
| 4.5 | B | Metadata stored within quilt structure |
| 4.6 | C | 64 KB identifier limit |
| 4.7 | B | `walrus read-quilt` command |
| 4.8 | B | Best for files < 1 MB |
| 4.9 | C | Create new quilt with corrected data |

### Section 5: Failure Handling

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 5.1 | B | Network timeouts are transient/retryable |
| 5.2 | B | Blocked content is permanently non-retryable |
| 5.3 | B | Data corruption - do not use the data |
| 5.4 | B | Rate limiting is temporary |
| 5.5 | B | Exponential increase with random variation |
| 5.6 | B | Same content always produces same BlobId |
| 5.7 | C | Expired data may be garbage collected |
| 5.8 | B | Automatically refreshes committee state |

### Section 6: Performance Optimization

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 6.1 | B | 10MB - 100MB is recommended |
| 6.2 | B | Parallel sliver distribution within one blob |
| 6.3 | B | Immutable = no cache invalidation needed |
| 6.4 | C | Long max-age with immutable flag |
| 6.5 | B | Browser cache is closest to user |
| 6.6 | A, C | Reduce concurrency and add backoff |
| 6.7 | A, C | Track status and enable resume |

### Section 7: Applied Scenarios

| Question | Answer(s) | Explanation |
|----------|-----------|-------------|
| 7.1 | B | Quilts for small files; individual blobs for large PDFs |
| 7.2 | B | 500KB images too large for quilt benefits |
| 7.3 | B | 10,000 ÷ 666 = 15.01 → 16 quilts needed |
| 7.4 | B | BlobId is content hash; verify against contract |
| 7.5 | B | Storage epochs expired |
| 7.6 | B | Only 334 slivers needed; 700 available |
| 7.7 | B | f < n/3, so max 333 Byzantine nodes |
| 7.8 | B | 50-100MB chunks with manifest |
| 7.9 | A, C | Parallel upload and granular retries |
| 7.10 | A, B | Large single blobs and single aggregator are problems |
