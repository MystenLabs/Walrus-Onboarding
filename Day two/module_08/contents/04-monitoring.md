# Lesson 4: Monitoring

## Learning Objectives

- Access and read metrics
- Understand key operational metrics
- Recognize healthy vs unhealthy states

---

## Metrics Endpoint

Both publishers and aggregators expose metrics at:

```bash
curl http://localhost:27182/metrics
```

**Format**: Prometheus-compatible metrics

**⚠️ Note**: Actual metric names may vary depending on the Walrus implementation version. To see the exact metric names available in your deployment, check the `/metrics` endpoint of your running service:
```bash
curl -s http://localhost:27182/metrics | grep -v "^#" | head -20
```

---

## Key Metrics

### Publisher Metrics

```bash
curl http://localhost:27182/metrics | grep publisher
```

**Important metrics**:
- `publisher_requests_total` - Total uploads since start
- `publisher_errors_total` - Failed uploads
- `publisher_requests_active` - Currently uploading

### Aggregator Metrics

```bash
curl http://localhost:27182/metrics | grep aggregator
```

**Important metrics**:
- `aggregator_requests_total` - Total downloads
- `aggregator_errors_total` - Failed downloads
- `aggregator_requests_active` - Currently downloading

---

## Health Indicators

### Healthy State

✅ `requests_total` increasing over time
✅ `errors_total` low (< 5% of requests)
✅ `requests_active` fluctuating (not stuck)

### Unhealthy State

❌ `errors_total` high (> 10% of requests)
❌ `requests_active` stuck at maximum
❌ No requests completing

---

## Epoch Transitions

Walrus operates in **epochs** (time periods with stable storage nodes).

**During epoch transitions**:
- Brief latency increase (< 30 seconds)
- Temporary slowdowns are normal
- Services recover automatically

**Expected behavior**:
- ✅ Short delays OK
- ✅ Operations resume normally
- ❌ Don't restart services during transitions

---

## Basic Monitoring Setup

### Using Prometheus (Optional)

**Install Prometheus**:
```bash
# Ubuntu
sudo apt install prometheus

# macOS
brew install prometheus
```

**Configure** (`prometheus.yml`):
```yaml
scrape_configs:
  - job_name: 'walrus'
    static_configs:
      - targets: ['localhost:27182']
```

**Start**:
```bash
prometheus --config.file=prometheus.yml
```

Access UI at: `http://localhost:9090`

---

## Key Takeaways

✅ Metrics at `http://127.0.0.1:27182/metrics`

✅ Watch error rates (should be < 5%)

✅ Monitor active requests for saturation

✅ Epoch transitions cause brief slowdowns (normal)

---

**Next**: [Lesson 5: Troubleshooting](./05-troubleshooting.md)
