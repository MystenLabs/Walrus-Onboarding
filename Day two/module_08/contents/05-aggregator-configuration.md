# Aggregator Configuration Choices

Aggregators have minimal configuration compared to publishers - they're read-only with no wallet required.

---

## Network Binding

Same concepts as publisher:

```bash
# Development (localhost only)
walrus aggregator --bind-address "127.0.0.1:31416"

# Production (all interfaces)
walrus aggregator --bind-address "0.0.0.0:31416"
```

---

## Blob Size Limits

Control maximum response sizes:

```bash
walrus aggregator \
  --bind-address "127.0.0.1:31416" \
  --max-body-size $((50 * 1024 * 1024)) \  # 50 MiB
  --max-quilt-body-size $((200 * 1024 * 1024))  # 200 MiB
```

**Defaults**:
- Blobs: 10 MiB
- Quilts: 100 MiB

---

## Metrics

```bash
# Default metrics port
curl http://127.0.0.1:27182/metrics

# Custom metrics address
walrus aggregator \
  --bind-address "127.0.0.1:31416" \
  --metrics-address "0.0.0.0:9090"
```

### ✅ Checkpoint: Explore Metrics

Visit the metrics endpoint and identify:
1. How many blobs have been read?
2. What's the current epoch?
3. Any error counters?

---

## Security Configuration

### No Gas Costs = Lower Risk

Since aggregators don't consume gas, you can be more permissive:
- ✅ Can expose publicly without cost concerns
- ⚠️ Still recommend rate limiting to prevent abuse

### Rate Limiting Example

```nginx
limit_req_zone $binary_remote_addr zone=aggregator:10m rate=50r/s;

server {
    listen 80;
    location / {
        limit_req zone=aggregator burst=100 nodelay;
        proxy_pass http://127.0.0.1:31416;
    }
}
```

**💬 Discussion**: Why would you still rate-limit if there's no gas cost?

---

## Logging

```bash
# Debug mode
RUST_LOG=debug walrus aggregator --bind-address "127.0.0.1:31416"

# JSON logs
RUST_LOG_FORMAT=json walrus aggregator --bind-address "127.0.0.1:31416"
```

---

## Daemon Mode (Combined Publisher + Aggregator)

Run both services on one port:

```bash
walrus daemon \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets \
  --n-clients 8
```

**Routes**:
- `GET /` → Aggregator (download blobs)
- `PUT /` → Publisher (upload blobs)
- `GET /health` → Combined health check

### ✅ Checkpoint: Test Daemon Mode

1. Start daemon mode
2. Upload a blob via PUT
3. Download it via GET
4. Check health endpoint

---

## Comparison Table

| Feature | Publisher Only | Aggregator Only | Daemon Mode |
|---------|---------------|-----------------|-------------|
| Ports needed | 1 (31415) | 1 (31416) | 1 (31415) |
| Wallet required | Yes | No | Yes |
| Gas costs | Yes | No | Yes (uploads only) |
| Upload support | ✅ | ❌ | ✅ |
| Download support | ❌ | ✅ | ✅ |
| Use case | Write-only service | Read-only service | Full-featured service |

**💬 Discussion**: Which deployment would you choose for:
1. A public CDN for Walrus blobs?
2. An internal upload service?
3. A full-featured API?

---

## Key Takeaways

- Aggregators have minimal configuration (just bind address and size limits)
- No wallet = simpler operations
- Daemon mode provides both upload and download on one port
- Still use reverse proxy for TLS and rate limiting
- Monitor via metrics endpoint on port 27182

**Next**: [Validating Aggregator Operation](./06-validating-aggregator.md)
