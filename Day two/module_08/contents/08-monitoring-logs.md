# Monitoring and Log Patterns

Learn to identify healthy vs problematic log patterns.

---

## Log Levels

Choose based on environment:

```bash
# Development
RUST_LOG=debug walrus publisher

# Production
RUST_LOG=info walrus publisher

# Production (minimal)
RUST_LOG=error walrus publisher
```

### ✅ Checkpoint: Compare Log Levels

1. Start publisher with `RUST_LOG=debug`
2. Upload a blob
3. Restart with `RUST_LOG=info`
4. Upload again
5. Note the difference in log output

**💬 Discussion**: When would you use debug logs in production?

---

## Expected Log Patterns

### Healthy Startup

**Publisher**:
```
INFO: Starting publisher on 0.0.0.0:31415
INFO: Committee synchronized, epoch 123, 1000 nodes
INFO: Publisher ready to accept requests
```

**Aggregator**:
```
INFO: Starting aggregator on 0.0.0.0:31416
INFO: Committee synchronized, epoch 123
INFO: Aggregator ready to serve requests
```

### Healthy Upload

```
INFO: Received blob upload request, size: 1048576 bytes
DEBUG: Encoding blob with RS2 erasure coding
DEBUG: Encoded size: 5242880 bytes (5.0x expansion)
INFO: Upload completed successfully, blob ID: <blob-id>
```

### Healthy Download

```
INFO: Received read request for blob: <blob-id>
DEBUG: Blob requires 334 slivers to reconstruct
INFO: Fetching slivers from storage nodes
INFO: Download completed successfully, size: 1048576 bytes
```

---

## Error Patterns to Recognize

| Error | Meaning | Action |
|-------|---------|--------|
| `Failed to connect to storage node (timeout)` | Network issues | Monitor rate; high rate = problem |
| `Sui RPC connection timeout` | Can't reach Sui | Check RPC endpoint |
| `Out of memory during encoding` | Resource exhaustion | Reduce `--n-clients` or add RAM |
| `Disk space low` | Storage full | Free up space |

### ✅ Checkpoint: Identify Errors

Instructor will show example log files. For each:
1. Identify if it's healthy or problematic
2. What's the issue?
3. What would you do to fix it?

**💬 Discussion**: How do you distinguish transient errors from systemic problems?

---

## Structured Logging

Enable JSON format for log aggregation:

```bash
RUST_LOG_FORMAT=json walrus publisher
```

**Example JSON output**:
```json
{
  "timestamp": "2024-12-08T10:30:45Z",
  "level": "INFO",
  "message": "Upload completed",
  "blob_id": "057MX9PAaUIQLliItM...",
  "size": 1048576,
  "duration_ms": 1250
}
```

**Benefits**: Easy parsing with `jq`, log aggregation tools

---

## Working with systemd Journal

```bash
# Follow logs live
sudo journalctl -u walrus-publisher -f

# Last hour
sudo journalctl -u walrus-publisher --since "1 hour ago"

# Filter for errors
sudo journalctl -u walrus-publisher | grep ERROR

# Export to file
sudo journalctl -u walrus-publisher > logs.txt
```

### ✅ Checkpoint: Log Analysis

Using journalctl:
1. Find all ERROR messages from last hour
2. Count how many uploads completed
3. Identify the most common WARN message

---

## Metrics Endpoint

Prometheus metrics available at port 27182:

```bash
curl http://localhost:27182/metrics
```

**Key metrics**:
- `walrus_uploads_total`
- `walrus_uploads_failed_total`
- `walrus_encoding_duration_seconds`
- `walrus_downloads_total`

### Try It Yourself: Metrics Setup

**Quick Prometheus config**:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'walrus'
    static_configs:
      - targets: ['localhost:27182']
```

### ✅ Checkpoint: Metrics

1. Access metrics endpoint
2. Find upload count metric
3. Upload a file
4. Check if metric increased

**💬 Discussion**: What metrics would you alert on?

---

## Alerting Example

**Prometheus alert** for down publisher:

```yaml
- alert: PublisherDown
  expr: up{job="walrus-publisher"} == 0
  for: 2m
  annotations:
    summary: "Publisher is down"
```

**Other important alerts**:
- High error rate (`> 10%`)
- High memory usage (`> 7GB`)
- Stuck on old epoch

---

## Quick Log Analysis

### Success Rate

```bash
# Count successes
SUCCESS=$(journalctl -u walrus-publisher --since "1 hour ago" | grep -c "Upload completed")

# Count failures
FAILED=$(journalctl -u walrus-publisher --since "1 hour ago" | grep -c "Upload failed")

# Calculate
echo "Success: $SUCCESS, Failed: $FAILED"
```

### Find Slow Operations

```bash
# Find slowest uploads
journalctl -u walrus-publisher | grep "duration_ms" | sort -n | tail -5
```

### ✅ Checkpoint: Calculate Metrics

From your running publisher:
1. Calculate upload success rate for last hour
2. Find the 5 slowest uploads
3. Count ERROR messages by type

---

## Key Takeaways

- Debug logs for development, info for production
- Recognize healthy vs error log patterns
- JSON format enables log aggregation
- Metrics endpoint provides operational data
- Set up alerts for critical conditions
- Use journalctl for log analysis

**Next**: [Failure Simulation and Recovery](./09-failure-recovery.md)
