# Lesson 2: Publisher Operations

## Learning Objectives

- Start and run a publisher
- Configure publisher settings
- Test publisher functionality

---

## What is a Publisher?

A **publisher** provides an HTTP interface for uploading blobs to Walrus.

**What it does**:
- Receives blobs via HTTP PUT
- Encodes blobs using erasure coding
- Distributes slivers to storage nodes
- Creates Blob objects on Sui blockchain
- **Requires**: SUI (gas) and WAL (storage) tokens

---

## Starting a Publisher

### Basic Command

**First, create the sub-wallets directory**:
```bash
mkdir -p ~/.walrus/sub-wallets
```

**Then start the publisher**:
```bash
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**Required options**:
- `--bind-address`: Where to listen (localhost or 0.0.0.0)
- `--sub-wallets-dir`: Directory for sub-wallets (must exist and be writable)

**Optional**:
- `--n-clients`: Number of sub-wallets (default: 8)

### Understanding Sub-Wallets

Publishers use **sub-wallets** for concurrent uploads:
- Each sub-wallet handles one upload at a time
- Default: 8 sub-wallets = 8 concurrent uploads
- More sub-wallets = higher concurrency

---

## Configuration Options

### Common Settings

**Localhost only** (testing):
```bash
# Create directory first
mkdir -p ~/.walrus/sub-wallets

# Start publisher
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**Accept remote connections** (production):
```bash
walrus publisher \
  --bind-address "0.0.0.0:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

**Adjust concurrency**:
```bash
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets \
  --n-clients 16
```

**Increase max blob size**:
```bash
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets \
  --max-body-size 52428800  # 50 MB
```

---

## Testing Your Publisher

### Upload a Test File

```bash
# Create test file
echo "Hello Walrus\!" > test.txt

# Upload
curl -X PUT http://localhost:31415/v1/blobs \
  --data-binary @test.txt
```

**Expected response** (JSON):
```json
{
  "newlyCreated": {
    "blobObject": {
      "blobId": "abc123...",
      "storedEpoch": 150,
      ...
    }
  }
}
```

Save the `blobId` for later retrieval!

---

## Health Validation

### Check Metrics

```bash
curl http://localhost:27182/metrics | grep publisher
```

**Look for**:
- `publisher_requests_total` - Total uploads
- `publisher_errors_total` - Failed uploads (should be low)
- `publisher_requests_active` - Currently processing

### Healthy Publisher Indicators

✅ Responds to HTTP requests
✅ Uploads complete successfully
✅ Error rate < 5%
✅ Metrics endpoint accessible

---

## Production Deployment

### Systemd Service

Create `/etc/systemd/system/walrus-publisher.service`:

```ini
[Unit]
Description=Walrus Publisher
After=network-online.target

[Service]
Type=simple
User=walrus
ExecStart=/usr/local/bin/walrus publisher \
  --bind-address 0.0.0.0:31415 \
  --sub-wallets-dir /var/lib/walrus/sub-wallets
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Setup and start**:
```bash
# Create user and directories
sudo useradd -r -s /bin/false walrus
sudo mkdir -p /var/lib/walrus/sub-wallets
sudo chown -R walrus:walrus /var/lib/walrus

# Enable and start
sudo systemctl enable walrus-publisher
sudo systemctl start walrus-publisher
sudo systemctl status walrus-publisher
```

**💡 Tip**: To run both publisher and aggregator in one process, replace `publisher` with `daemon` in the `ExecStart` line. This provides both upload (PUT) and download (GET) functionality on the same port.

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Port in use | Use different port: `--bind-address "127.0.0.1:31417"` |
| Cannot connect to Sui | Verify `client_config.yaml` RPC URL |
| Insufficient gas | Add SUI and WAL to wallet |
| Permission denied | Use port ≥ 1024 or run with appropriate permissions |
| Sub-wallets directory error | Create directory: `mkdir -p ~/.walrus/sub-wallets` |

---

## Key Takeaways

✅ Create sub-wallets directory first: `mkdir -p ~/.walrus/sub-wallets`

✅ Start publisher: `walrus publisher --bind-address "127.0.0.1:31415" --sub-wallets-dir ~/.walrus/sub-wallets`

✅ Both `--bind-address` and `--sub-wallets-dir` are required

✅ The sub-wallets directory must exist and be writable

✅ Sub-wallets enable concurrent uploads (default: 8)

✅ Upload endpoint: `PUT /v1/blobs`

✅ Metrics at `http://127.0.0.1:27182/metrics`

✅ Requires funded wallet (SUI + WAL tokens)

---

**Next**: [Lesson 3: Aggregator Operations](./03-aggregator-operations.md)
