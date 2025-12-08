# Failure Simulation and Recovery

Practice handling common failures so you're prepared when they happen in production.

---

## Failure Categories

### Transient Failures
- **Temporary** - resolve with retries
- **Examples**: Network timeouts, storage node temporarily down
- **Recovery**: Automatic retries with backoff

### Permanent Failures
- **Require intervention**
- **Examples**: Invalid config, port conflicts, disk full
- **Recovery**: Manual fix required

**💬 Discussion**: How do you tell the difference?

---

## Simulation 1: Process Crash

### Simulate

```bash
# Kill the publisher process
sudo kill -9 $(pgrep walrus)
```

### Expected Behavior

- Systemd detects exit
- Waits `RestartSec` (default: 10s)
- Automatically restarts
- Publisher recovers

### Verify Recovery

```bash
# Check service restarted
sudo systemctl status walrus-publisher

# Check logs
sudo journalctl -u walrus-publisher -n 20

# Test functionality
curl http://localhost:31415/health
```

### ✅ Checkpoint: Crash Recovery

1. Kill publisher process
2. Watch systemd restart it
3. Time how long recovery takes
4. Verify health check passes

**💬 Discussion**: How would you prevent repeated crashes from exhausting restart attempts?

---

## Simulation 2: Network Partition

### Simulate

```bash
# Block outbound connections to storage nodes
sudo iptables -A OUTPUT -p tcp --dport 8080 -j DROP

# Allow localhost
sudo iptables -I OUTPUT -o lo -j ACCEPT
```

### Expected Behavior

- Upload requests fail
- Publisher retries different storage nodes
- If can't reach quorum (2/3), upload fails

### Logs

```
WARN: Failed to connect to storage node (connection timeout)
ERROR: Unable to reach quorum of storage nodes
```

### Restore

```bash
# Remove firewall rule
sudo iptables -D OUTPUT -p tcp --dport 8080 -j DROP

# Test
walrus store test.txt --epochs 1
```

### ✅ Checkpoint: Network Failure

1. Apply iptables rule
2. Try uploading
3. Observe error logs
4. Restore network
5. Verify uploads work again

**💬 Discussion**: How many storage nodes can be down before uploads fail?

---

## Simulation 3: Disk Full

### Simulate

```bash
# Create large file to fill disk (BE CAREFUL!)
sudo fallocate -l 10G /tmp/fill.dat

# Check disk usage
df -h /
```

### Expected Behavior

- Encoding operations fail
- Logs show disk write errors
- Service may crash

### Logs

```
ERROR: Failed to write encoded blob: No space left on device
```

### Recover

```bash
# Remove fill file
sudo rm /tmp/fill.dat

# Restart if crashed
sudo systemctl restart walrus-publisher
```

### ✅ Checkpoint: Disk Exhaustion

1. Fill disk with temp file
2. Try uploading
3. Observe errors
4. Free space
5. Restart and verify recovery

**⚠️ Warning**: Do this carefully! Don't fill your actual disk completely.

---

## Simulation 4: Out of Memory

### Simulate

```bash
# Limit memory via systemd
sudo systemctl edit walrus-publisher

# Add:
[Service]
MemoryMax=512M

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart walrus-publisher
```

### Expected Behavior

- Large blob uploads fail
- OOM killer may kill process
- Systemd restarts automatically

### Logs

```
ERROR: Out of memory during encoding
# System journal may show: "Out of memory: Killed process..."
```

### Recover

```bash
# Increase limit
sudo systemctl edit walrus-publisher

# Update to:
[Service]
MemoryMax=4G

sudo systemctl daemon-reload
sudo systemctl restart walrus-publisher
```

### ✅ Checkpoint: Memory Limit

1. Set low memory limit
2. Try uploading large file
3. Observe OOM behavior
4. Increase limit
5. Verify recovery

---

## Simulation 5: Epoch Transition Failure

### Simulate

```bash
# Block access to Sui RPC
sudo iptables -A OUTPUT -d <sui-rpc-host> -j DROP
```

### Expected Behavior

- Publisher can't fetch new committee
- Uploads fail with epoch mismatch
- Service logs errors but stays running

### Logs

```
INFO: Epoch transition detected
ERROR: Failed to fetch committee for new epoch
ERROR: Sui RPC connection timeout
```

### Recover

```bash
# Restore network
sudo iptables -D OUTPUT -d <sui-rpc-host> -j DROP

# Publisher automatically retries committee fetch
```

### ✅ Checkpoint: Epoch Failure

1. Block Sui RPC access (during epoch transition if possible)
2. Observe errors
3. Restore access
4. Watch publisher recover

**💬 Discussion**: Why doesn't this require a restart?

---

## Automated Recovery

### Systemd Configuration

```ini
[Service]
Restart=on-failure
RestartSec=10
StartLimitBurst=5
StartLimitIntervalSec=300
```

**Behavior**:
- Restart on any failure
- Wait 10s between restarts
- Give up after 5 restarts in 5 minutes

### Health Check Script

```bash
#!/bin/bash
# /usr/local/bin/walrus-health-check.sh

HEALTH_URL="http://localhost:31415/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$STATUS" != "200" ]; then
    echo "Publisher unhealthy, restarting..."
    systemctl restart walrus-publisher
fi
```

**Crontab**:
```cron
*/5 * * * * /usr/local/bin/walrus-health-check.sh
```

### ✅ Checkpoint: Set Up Auto-Recovery

1. Create health check script
2. Add to crontab
3. Test by killing publisher
4. Verify script restarts it

---

## Manual Recovery Procedure

When automatic recovery fails:

1. **Check status**
   ```bash
   sudo systemctl status walrus-publisher
   ```

2. **Review logs**
   ```bash
   sudo journalctl -u walrus-publisher -n 100
   ```

3. **Attempt restart**
   ```bash
   sudo systemctl restart walrus-publisher
   ```

4. **Verify recovery**
   ```bash
   curl http://localhost:31415/health
   walrus store test.txt --epochs 1
   ```

5. **If still failing, check resources**
   ```bash
   df -h  # Disk
   free -h  # Memory
   ping google.com  # Network
   ```

---

## Recovery Drill Checklist

Practice all scenarios:

- [ ] Process crash → automatic restart
- [ ] Network partition → graceful degradation
- [ ] Disk full → error handling
- [ ] Memory exhaustion → OOM and restart
- [ ] Epoch transition failure → automatic retry

**Time your recoveries** - how long does each take?

---

## Key Takeaways

- Distinguish transient from permanent failures
- Systemd provides automatic restart
- Test failure scenarios before production
- Health checks enable automated recovery
- Manual procedures for complex issues
- Document recovery times (RTO)

**Next**: [Hands-On Lab](./10-hands-on-lab.md)
