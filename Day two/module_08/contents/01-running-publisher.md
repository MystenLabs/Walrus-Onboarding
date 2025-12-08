# Running a Publisher

## What is a Publisher?

A Publisher is an **optional** infrastructure component that provides an HTTP interface for blob uploads.

**Key functions**:
- Receives blobs via HTTP PUT
- Encodes blobs into slivers (Reed-Solomon)
- Distributes slivers to Storage Nodes
- Handles on-chain registration

**Important**: Publishers are untrusted - clients can verify their work.

---

## Prerequisites

To run a publisher you need:

1. **Walrus binary** - Download from releases or use Docker
2. **Sui wallet** with:
   - SUI tokens (for gas)
   - WAL tokens (for storage)
3. **Client configuration file** (`client_config.yaml`)

> **Note**: Official hardware requirements are not documented. Start small and scale based on your workload.

---

## Follow Along: Installation

### Download the Binary

```bash
# Download latest version
curl -LO "https://github.com/MystenLabs/walrus/releases/download/v1.0.0/walrus-linux-x86_64"

# Make executable
chmod +x walrus-linux-x86_64
sudo mv walrus-linux-x86_64 /usr/local/bin/walrus

# Verify
walrus --version
```

**Or use Docker**:
```bash
docker pull mysten/walrus:latest
docker run --rm mysten/walrus:latest --version
```

---

## Starting Your First Publisher

### Basic Command

```bash
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**Key options**:
- `--bind-address`: Where to listen (localhost or 0.0.0.0 for all interfaces)
- `--sub-wallets-dir`: Directory for sub-wallets (used for parallel requests)
- `--n-clients`: Number of sub-wallets (default: 8, more = more concurrent uploads)

### ✅ Checkpoint: Verify It's Running

```bash
# Check health endpoint
curl http://localhost:31415/health

# Expected: {"status":"healthy","epoch":123}
```

**💬 Discussion**: What does the epoch number represent?

---

## Try It Yourself: Production Deployment

### Create a Systemd Service

```bash
sudo nano /etc/systemd/system/walrus-publisher.service
```

**Service file**:
```ini
[Unit]
Description=Walrus Publisher
After=network-online.target

[Service]
Type=simple
User=walrus
WorkingDirectory=/var/lib/walrus
ExecStart=/usr/local/bin/walrus publisher \
  --bind-address 0.0.0.0:31415 \
  --sub-wallets-dir /var/lib/walrus/sub-wallets
Restart=on-failure
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Setup and Start

```bash
# Create user and directories
sudo useradd -r -s /bin/false walrus
sudo mkdir -p /var/lib/walrus
sudo chown -R walrus:walrus /var/lib/walrus

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable walrus-publisher
sudo systemctl start walrus-publisher

# Check status
sudo systemctl status walrus-publisher
```

### ✅ Checkpoint: Check Logs

```bash
sudo journalctl -u walrus-publisher -n 50
```

**Look for**:
```
INFO: Starting publisher on 0.0.0.0:31415
INFO: Committee synchronized, epoch 123
INFO: Publisher ready to accept requests
```

**💬 Discussion**: What would happen if the publisher can't connect to Sui RPC?

---

## Docker Alternative

```bash
docker run -d \
  --name walrus-publisher \
  -p 31415:31415 \
  -v walrus-sub-wallets:/walrus/sub-wallets \
  mysten/walrus:latest \
  publisher \
    --bind-address 0.0.0.0:31415 \
    --sub-wallets-dir /walrus/sub-wallets
```

---

## Common Issues

| Problem | Symptom | Solution |
|---------|---------|----------|
| Port in use | `Address already in use` | Use different port or stop conflicting service |
| Can't reach Sui | `Failed to fetch committee` | Check network, verify RPC endpoint |
| Permission denied | `Permission denied (os error 13)` | Use port >= 1024 or run with appropriate permissions |

---

## Key Takeaways

- Publishers provide HTTP interface for blob uploads
- Require Sui wallet with SUI and WAL tokens
- Use sub-wallets for concurrent request handling
- Systemd recommended for production
- Health endpoint at `/health`

**Next**: [Publisher Configuration Choices](./02-publisher-configuration.md)
