# Lesson 3: Aggregator Operations

## Learning Objectives

- Start and run an aggregator
- Configure aggregator settings
- Test blob retrieval

---

## What is an Aggregator?

An **aggregator** provides an HTTP interface for downloading blobs from Walrus.

**What it does**:
- Receives HTTP GET requests
- Retrieves slivers from storage nodes
- Reconstructs original blobs
- Returns data to clients
- **Requires**: NO wallet or tokens (read-only)

---

## Starting an Aggregator

### Basic Command

```bash
walrus aggregator --bind-address "127.0.0.1:31416"
```

**Key difference from publisher**: No sub-wallets needed!

---

## Configuration Options

### Common Settings

**Localhost only**:
```bash
walrus aggregator --bind-address "127.0.0.1:31416"
```

**Accept remote connections**:
```bash
walrus aggregator --bind-address "0.0.0.0:31416"
```

**Custom metrics port**:
```bash
walrus aggregator \
  --bind-address "127.0.0.1:31416" \
  --metrics-address "127.0.0.1:9090"
```

---

## Testing Your Aggregator

### Retrieve a Blob

```bash
# Use a blob ID from a previous upload
curl http://localhost:31416/v1/blobs/<BLOB_ID>
```

**Expected**: The original blob data

### Verify Data Integrity

```bash
# Upload a file
echo "Test data" > original.txt
curl -X PUT http://localhost:31415/v1/blobs --data-binary @original.txt

# Save the blobId from response
# Then retrieve it
curl http://localhost:31416/v1/blobs/<BLOB_ID> -o retrieved.txt

# Compare
diff original.txt retrieved.txt
```

**Expected**: No differences (files match perfectly)

---

## Retrieval Methods

### By Blob ID (Most Common)
```bash
curl http://localhost:31416/v1/blobs/<BLOB_ID>
```

### By Sui Object ID
```bash
curl http://localhost:31416/v1/blobs/by-object-id/<OBJECT_ID>
```

### From Quilts
```bash
curl http://localhost:31416/v1/blobs/by-quilt-id/<QUILT_ID>/<IDENTIFIER>
```

---

## Health Validation

### Check Metrics

```bash
curl http://localhost:27182/metrics | grep aggregator
```

**Look for**:
- `aggregator_requests_total` - Total downloads
- `aggregator_errors_total` - Failed downloads (should be low)
- `aggregator_requests_active` - Currently processing

### Healthy Aggregator Indicators

✅ Responds to HTTP requests
✅ Downloads complete successfully
✅ Retrieved data matches originals
✅ Error rate < 5%

---

## Running Daemon (Combined Service)

Instead of separate publisher + aggregator, run both together:

```bash
# Create sub-wallets directory (daemon needs it for publisher functionality)
mkdir -p ~/.walrus/sub-wallets

# Start daemon
walrus daemon \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**Handles**:
- PUT requests (publisher functionality)
- GET requests (aggregator functionality)
- Same port for both

**Systemd example for daemon**:
```ini
[Service]
ExecStart=/usr/local/bin/walrus daemon \
  --bind-address 0.0.0.0:31415 \
  --sub-wallets-dir /var/lib/walrus/sub-wallets
```

---

## Production Deployment

### Systemd Service

Create `/etc/systemd/system/walrus-aggregator.service`:

```ini
[Unit]
Description=Walrus Aggregator
After=network-online.target

[Service]
Type=simple
User=walrus
ExecStart=/usr/local/bin/walrus aggregator --bind-address 0.0.0.0:31416
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Enable and start**:
```bash
sudo systemctl enable walrus-aggregator
sudo systemctl start walrus-aggregator
sudo systemctl status walrus-aggregator
```

**💡 Tip**: Instead of running separate publisher and aggregator services, you can use `daemon` mode to run both in one process. See the daemon section below.

---

## Key Differences: Publisher vs Aggregator

| Feature | Publisher | Aggregator |
|---------|-----------|------------|
| Purpose | Upload | Download |
| HTTP Method | PUT | GET |
| Needs wallet | Yes | No |
| Sub-wallets | Yes | No |
| On-chain actions | Yes | No |

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Port in use | Use different port |
| 404 Not Found | Verify blob ID is correct |
| Cannot connect to Sui | Check `client_config.yaml` RPC URL |
| Slow downloads | Check network, storage node availability |

---

## Key Takeaways

✅ Start aggregator: `walrus aggregator --bind-address "127.0.0.1:31416"`

✅ Aggregators don't need wallets (read-only)

✅ Retrieval endpoint: `GET /v1/blobs/<BLOB_ID>`

✅ Always verify data integrity with `diff`

✅ Can run combined service with `walrus daemon`

---

**Next**: [Lesson 4: Monitoring](./04-monitoring.md)
