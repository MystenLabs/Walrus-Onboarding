# Running an Aggregator

## What is an Aggregator?

An **optional** infrastructure component that provides an HTTP interface for blob downloads.

**Key functions**:
- Receives read requests via HTTP GET
- Fetches slivers from Storage Nodes
- Decodes slivers to reconstruct blobs
- Returns reconstructed blobs to clients

**Key difference from Publisher**:
- ✅ No wallet required (read-only operations)
- ✅ No gas costs
- ✅ Simpler to operate

---

## Starting Your First Aggregator

### Basic Command

```bash
walrus aggregator --bind-address "127.0.0.1:31416"
```

**Key options**:
- `--bind-address`: Where to listen (default port: 31416)
- `--metrics-address`: Metrics endpoint (default: 127.0.0.1:27182)
- `--max-body-size`: Maximum blob size (default: 10 MiB)

### ✅ Checkpoint: Verify It's Running

```bash
# Check health
curl http://localhost:31416/health

# Expected: {"status":"healthy","epoch":123}

# Check metrics
curl http://localhost:27182/metrics
```

**💬 Discussion**: Why don't aggregators need a wallet?

---

## Try It Yourself: Systemd Service

### Create Service File

```bash
sudo nano /etc/systemd/system/walrus-aggregator.service
```

```ini
[Unit]
Description=Walrus Aggregator
After=network-online.target

[Service]
Type=simple
User=walrus
WorkingDirectory=/var/lib/walrus
ExecStart=/usr/local/bin/walrus aggregator \
  --bind-address 0.0.0.0:31416
Restart=on-failure
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Start and Verify

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable walrus-aggregator
sudo systemctl start walrus-aggregator

# Check logs
sudo journalctl -u walrus-aggregator -n 20
```

**Look for**:
```
INFO: Starting aggregator on 0.0.0.0:31416
INFO: Committee synchronized, epoch 123
INFO: Aggregator ready to serve requests
```

---

## Running Both Publisher and Aggregator

### Option 1: Separate Ports

```bash
# Publisher on 31415
sudo systemctl start walrus-publisher

# Aggregator on 31416
sudo systemctl start walrus-aggregator

# Check both
sudo systemctl status walrus-*
```

### Option 2: Daemon Mode (Combined)

Run both on the same port:

```bash
walrus daemon \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**How daemon mode works**:
- GET requests → aggregator (reads)
- PUT/POST requests → publisher (writes)

### ✅ Checkpoint: Test Both

With daemon mode running:
```bash
# Upload (should work - publisher)
curl -X PUT http://localhost:31415/ --data-binary @test.txt

# Download (should work - aggregator)
curl http://localhost:31415/<blob-id>

# Health check
curl http://localhost:31415/health
```

**💬 Discussion**: When would you use daemon mode vs separate services?

---

## Docker Alternative

```bash
docker run -d \
  --name walrus-aggregator \
  -p 31416:31416 \
  mysten/walrus:latest \
  aggregator --bind-address 0.0.0.0:31416
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Port conflict | Use different port or stop conflicting service |
| Can't reach Storage Nodes | Check network, verify firewall allows outbound connections |
| Slow downloads | Check network bandwidth, Storage Node availability |

---

## Key Takeaways

- Aggregators provide HTTP interface for blob downloads
- No wallet or gas required (read-only)
- Default port: 31416
- Daemon mode combines publisher + aggregator on one port
- Simpler to operate than publishers

**Next**: [Aggregator Configuration Choices](./05-aggregator-configuration.md)
