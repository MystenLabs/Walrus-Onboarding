# Validating Aggregator Operation

Verify your aggregator is correctly retrieving and reconstructing blobs.

---

## Health Check

```bash
curl http://localhost:31416/health
```

**Expected**:
```json
{
  "status": "healthy",
  "epoch": 123
}
```

### ✅ Checkpoint: Basic Health

1. Check aggregator health endpoint
2. Compare epoch with publisher epoch (should match)
3. Check metrics: `curl http://localhost:27182/metrics`

---

## Testing Download Functionality

### Prerequisites: Upload a Blob First

```bash
# Use publisher or CLI to upload
export WALRUS_PUBLISHER_URL=http://localhost:31415
walrus store test.txt --epochs 1

# Save the blob ID
BLOB_ID="<blob-id-from-output>"
```

### Download via Aggregator

```bash
# Configure CLI to use aggregator
export WALRUS_AGGREGATOR_URL=http://localhost:31416

# Download blob
walrus read $BLOB_ID --out downloaded.txt

# Verify content matches
diff test.txt downloaded.txt
# (No output = files match)
```

### ✅ Checkpoint: End-to-End Test

1. Upload a file via publisher
2. Download it via aggregator
3. Verify content is identical

**💬 Discussion**: What happens if aggregator can't reach enough storage nodes?

---

## Observing Sliver Retrieval

Enable debug logging to see reconstruction:

```bash
RUST_LOG=debug walrus aggregator --bind-address "127.0.0.1:31416"
```

**During download, look for**:
```
INFO: Received read request for blob <blob-id>
DEBUG: Blob requires 334 slivers to reconstruct
INFO: Fetching slivers from storage nodes
DEBUG: Retrieved 334/334 slivers successfully
INFO: Reconstructed blob successfully
```

### ✅ Checkpoint: Observe Reconstruction

1. Start aggregator with debug logging
2. Download a blob
3. Watch logs - how many slivers needed?
4. Were all slivers retrieved successfully?

**💬 Discussion**: Why 334 slivers? (Hint: Reed-Solomon encoding parameters)

---

## Performance Testing

Test with different blob sizes:

```bash
# Create test files
dd if=/dev/urandom of=1mb.bin bs=1M count=1
dd if=/dev/urandom of=10mb.bin bs=1M count=10

# Upload
walrus store 1mb.bin --epochs 1
walrus store 10mb.bin --epochs 1

# Time downloads
time walrus read <1mb-blob-id> --out /dev/null
time walrus read <10mb-blob-id> --out /dev/null
```

### ✅ Checkpoint: Measure Performance

1. Upload blobs of various sizes (1MB, 10MB, 100MB)
2. Time the downloads
3. Note the download speeds

**💬 Discussion**: What factors affect download speed?

---

## Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Insufficient slivers** | Download fails | Check network to storage nodes |
| **Slow downloads** | Long reconstruction time | Check network bandwidth |
| **Hash mismatch** | Reconstruction error | Retry download (may get different slivers) |

### Try It Yourself: Simulate Network Issue

```bash
# Block access to some storage nodes (simulate partial network failure)
# See if aggregator can still reconstruct (needs 334 out of ~1000 slivers)

# Aggregator should succeed even with some nodes unreachable
```

---

## Validation Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Test download completes successfully
- [ ] Downloaded content matches uploaded content
- [ ] Logs show successful sliver retrieval
- [ ] Logs show successful reconstruction
- [ ] No errors during idle periods

---

## Key Takeaways

- Aggregators need 334 primary slivers minimum to reconstruct
- Debug logs show sliver retrieval progress
- Downloads work even if some storage nodes are unavailable
- Content verification happens automatically
- Performance depends on network bandwidth and storage node availability

**Next**: [Observing Epoch Transitions](./07-epoch-transitions.md)
