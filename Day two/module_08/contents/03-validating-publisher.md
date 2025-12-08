# Validating Publisher Health

Once your publisher is running, validate it's working correctly.

---

## Health Check

```bash
curl http://localhost:31415/health
```

**Expected**:
```json
{
  "status": "healthy",
  "epoch": 123,
  "committee_size": 1000
}
```

**Unhealthy** (503 status):
```json
{
  "status": "unhealthy",
  "reason": "Committee not synchronized"
}
```

### ✅ Checkpoint: Verify Health

1. Check health endpoint
2. Note the epoch number
3. Verify committee_size > 0

**💬 Discussion**: What would cause an unhealthy status?

---

## Testing Upload Functionality

### Simple Test

```bash
# Create test file
echo "Hello, Walrus!" > test.txt

# Test upload
curl -X PUT http://localhost:31415/v1/blobs --data-binary @test.txt

# Should return blob ID in response
```

### Full Integration Test

```bash
# Configure CLI to use your publisher
export WALRUS_PUBLISHER_URL=http://localhost:31415

# Upload via CLI
walrus store test.txt --epochs 1

# Expected output includes:
# - Blob ID
# - Blob Object ID
# - Success confirmation
```

### ✅ Checkpoint: Complete Upload

1. Create a test file
2. Upload it via your publisher
3. Save the blob ID
4. Verify you can retrieve it

**💬 Discussion**: What's the difference between the curl test and the CLI test?

---

## Checking Storage Node Connectivity

Enable debug logging to see connection status:

```bash
RUST_LOG=debug walrus publisher --bind-address "127.0.0.1:31415"
```

**Look for**:
```
INFO: Committee contains 1000 storage nodes
INFO: Successfully connected to 998/1000 storage nodes
```

**⚠️ Warnings to watch**:
```
WARN: Failed to connect to storage node (timeout)
ERROR: Committee synchronization failed
```

### ✅ Checkpoint: Observe Logs

While publisher is running, watch logs and identify:
1. How many storage nodes in committee?
2. How many connections successful?
3. Any connection failures?

---

## Monitoring Resource Usage

### Quick Resource Check

```bash
# CPU and memory
systemctl status walrus-publisher

# Or using top
top -p $(pgrep walrus)
```

**What to expect**:
- **CPU**: Spikes during uploads, idle otherwise
- **Memory**: Stable (1-4 GB depending on concurrency)
- **Network**: Bursts during uploads (~5x blob size to storage nodes)

### ✅ Checkpoint: Monitor an Upload

1. Start monitoring: `watch -n 1 'ps aux | grep walrus'`
2. Upload a large file (10+ MB)
3. Observe CPU and memory spikes

**💬 Discussion**: Why does network traffic = ~5x blob size?

---

## Common Issues

| Issue | Symptoms | Quick Fix |
|-------|----------|-----------|
| **Committee not available** | Health shows unhealthy | Check Sui RPC connectivity |
| **Storage node failures** | WARN logs, slow uploads | Check firewall, network |
| **Out of memory** | Process crashes | Reduce `--n-clients` or add RAM |
| **Slow uploads** | Long encoding times | Check CPU, increase cores |

### Try It Yourself: Simulate Issue

**Firewall test**:
1. Block outbound port 80/443 temporarily
2. Try uploading
3. Observe error messages
4. Restore connectivity

**💬 Discussion**: How does the publisher handle partial storage node failures?

---

## Validation Script

Quick validation script:

```bash
#!/bin/bash
# validate-publisher.sh

PUBLISHER_URL="http://localhost:31415"

echo "=== Publisher Validation ==="

# Health check
echo -n "Health: "
STATUS=$(curl -s $PUBLISHER_URL/health | jq -r '.status')
if [ "$STATUS" = "healthy" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL ($STATUS)"
    exit 1
fi

# Test upload
echo -n "Upload: "
TEST=$(echo "test $(date)" | curl -s -X PUT $PUBLISHER_URL/v1/blobs --data-binary @-)
if echo "$TEST" | grep -q "blobId"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    exit 1
fi

echo "=== All checks passed ==="
```

### ✅ Checkpoint: Run Validation

1. Save script as `validate-publisher.sh`
2. Make executable: `chmod +x validate-publisher.sh`
3. Run it: `./validate-publisher.sh`
4. Verify all checks pass

---

## Validation Checklist

Before moving on, verify:

- [ ] Health endpoint returns 200 OK
- [ ] Test upload succeeds
- [ ] Blob ID is returned
- [ ] CPU/memory usage is reasonable
- [ ] Logs show committee synchronized
- [ ] No errors during idle periods

---

## Key Takeaways

- Health endpoint shows status and epoch
- Test uploads with both curl and CLI
- Monitor logs for storage node connectivity
- Watch resource usage during uploads
- Validation script automates health checks

**Next**: [Running an Aggregator](./04-running-aggregator.md)
