# Publisher Configuration Choices

> **Note**: This covers documented configuration options only. Many tuning parameters are not officially documented.

---

## Network Binding

Choose how clients connect to your publisher:

```bash
# Localhost only (development)
walrus publisher --bind-address "127.0.0.1:31415"

# All interfaces (production)
walrus publisher --bind-address "0.0.0.0:31415"

# Specific interface
walrus publisher --bind-address "192.168.1.10:31415"
```

**💬 Discussion**: When would you use localhost vs all interfaces?

---

## Parallel Request Handling

Publishers use **sub-wallets** to handle concurrent uploads:

```bash
# Default: 8 sub-wallets (8 concurrent uploads)
walrus publisher --bind-address "127.0.0.1:31415" --sub-wallets-dir ~/.walrus/sub-wallets

# Increase to 16 for more concurrency
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets \
  --n-clients 16
```

**How it works**:
- Each sub-wallet handles one blob upload at a time
- More sub-wallets = more concurrent uploads
- Publisher automatically funds sub-wallets from main wallet

**Trade-off**: More sub-wallets need more SUI/WAL tokens distributed across them.

---

## Blob Size Limits

Control maximum upload sizes:

```bash
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets \
  --max-body-size $((50 * 1024 * 1024)) \  # 50 MiB (default: 10 MiB)
  --max-quilt-body-size $((200 * 1024 * 1024))  # 200 MiB (default: 100 MiB)
```

### ✅ Checkpoint: Test Size Limits

Try uploading a file larger than your configured limit. What error do you get?

---

## Metrics Endpoint

Publishers expose Prometheus metrics:

```bash
# Default metrics endpoint
curl http://127.0.0.1:27182/metrics

# Custom metrics address
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --metrics-address "127.0.0.1:9090"
```

**💬 Discussion**: How would you integrate this with Prometheus/Grafana?

---

## Security Best Practices

### 1. Use a Reverse Proxy

Publishers consume gas - protect them from abuse:

```nginx
# nginx with rate limiting
limit_req_zone $binary_remote_addr zone=publisher:10m rate=10r/s;

server {
    listen 80;
    location / {
        limit_req zone=publisher burst=20 nodelay;
        proxy_pass http://127.0.0.1:31415;
    }
}
```

### 2. Add TLS

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:31415;
    }
}
```

### 3. Monitor Token Balances

Publishers automatically fund sub-wallets, but the main wallet needs sufficient balance.

```bash
# Check if publisher is running low on funds
# (Look for warnings in logs)
sudo journalctl -u walrus-publisher | grep -i "insufficient"
```

---

## Logging Configuration

Control log verbosity:

```bash
# Debug (very verbose)
RUST_LOG=debug walrus publisher --bind-address "127.0.0.1:31415"

# Info (normal operations)
RUST_LOG=info walrus publisher --bind-address "127.0.0.1:31415"

# JSON format (for log aggregation)
RUST_LOG_FORMAT=json walrus publisher --bind-address "127.0.0.1:31415"
```

### ✅ Checkpoint: Observe Logs

Start a publisher with `RUST_LOG=debug` and observe the output. What additional information do you see?

---

## Configuration Comparison

| Scenario | bind-address | n-clients | max-body-size | Notes |
|----------|--------------|-----------|---------------|-------|
| **Development** | 127.0.0.1:31415 | 4 | 10 MiB (default) | Local testing only |
| **Production (light)** | 0.0.0.0:31415 | 8 (default) | 10 MiB | Standard deployment |
| **Production (heavy)** | 0.0.0.0:31415 | 16-32 | 50 MiB | High-concurrency workload |

---

## Try It Yourself: Production Configuration

Create a production-ready systemd service:

```ini
[Service]
ExecStart=/usr/local/bin/walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir /var/lib/walrus/sub-wallets \
  --n-clients 16 \
  --max-body-size 52428800
Environment="RUST_LOG=info"
Environment="RUST_LOG_FORMAT=json"
```

**Task**: Restart your publisher with these settings and verify it starts correctly.

---

## Key Takeaways

- `--n-clients` controls concurrency (default: 8)
- `--max-body-size` limits blob uploads (default: 10 MiB)
- Metrics available at port 27182 by default
- Use reverse proxy for TLS and rate limiting
- Monitor wallet balances for sub-wallet funding

**Next**: [Validating Publisher Health](./03-validating-publisher.md)
