# Observing Epoch Transitions

Epochs are time periods (~2 weeks on Mainnet) with a fixed storage node committee. Learn what happens when epochs change.

---

## What is an Epoch Transition?

**When**: Approximately every 2 weeks on Mainnet

**What changes**:
- Storage node committee may update
- System parameters (prices, capacity) may change
- Publishers/Aggregators must sync new committee info

**Impact**: Brief degradation (1-2 seconds), but operations continue

---

## Expected Log Patterns

### Before Transition

```
INFO: Current epoch: 123
INFO: Committee size: 1000 storage nodes
```

### During Transition

```
INFO: Epoch transition detected, old epoch: 123, new epoch: 124
INFO: Fetching new committee for epoch 124
DEBUG: Committee contains 1000 storage nodes
INFO: Committee synchronized, epoch 124
INFO: Epoch transition completed
```

### ✅ Checkpoint: Observe a Transition

On Testnet (epochs change more frequently):
1. Watch logs: `sudo journalctl -u walrus-publisher -f | grep -i epoch`
2. Note current epoch from `/health` endpoint
3. Wait for epoch change
4. Observe transition logs

**💬 Discussion**: Why do epochs exist? What problem do they solve?

---

## Impact on Operations

### Uploads During Transition

**What happens**:
1. Upload request uses old epoch
2. Storage nodes reject with "epoch mismatch"
3. Publisher refetches committee
4. Upload retries with new epoch
5. Upload succeeds

**Expected behavior**:
```
DEBUG: Upload failed: EpochMismatch
INFO: Refetching committee information
DEBUG: Retrying upload with epoch 124
INFO: Upload succeeded
```

**User experience**: Slight delay (1-2 seconds)

### Downloads During Transition

**What happens**: Downloads continue normally

**Why**: Blob metadata is epoch-agnostic

---

## Monitoring Epoch Transitions

### Track Current Epoch

```bash
# Continuously monitor
watch -n 10 'curl -s http://localhost:31415/health | jq .epoch'

# When epoch changes: 123 -> 124
```

### Set Up Alerts

```yaml
# Prometheus alert
- alert: EpochTransition
  expr: changes(walrus_current_epoch[5m]) > 0
  annotations:
    summary: "Epoch changed to {{$value}}"
```

### ✅ Checkpoint: Monitor Transition

1. Set up epoch monitoring
2. Watch for next transition
3. Time how long degradation lasts
4. Verify both publisher and aggregator update

---

## Handling Epoch Errors

### Client Errors

```
Error: Blob registration failed: EpochMismatch
```

**Solution**: Retry - SDK automatically refetches committee

### Publisher Stuck on Old Epoch

**Symptoms**:
- Health shows old epoch
- All uploads fail with epoch mismatch

**Diagnosis**:
```bash
# Check current epoch on Sui
walrus info | grep epoch

# Compare to Publisher
curl http://localhost:31415/health | jq .epoch
```

**Solution**:
```bash
# Restart to force refresh
sudo systemctl restart walrus-publisher
```

### ✅ Checkpoint: Simulate Stuck Epoch

Try to trigger the issue (if on test network where you control things) and practice recovery.

**💬 Discussion**: What could cause a publisher to get stuck on old epoch?

---

## Best Practices

**For Operators**:
- ✅ Monitor epoch changes
- ✅ Expect 1-2 second degradation
- ✅ Don't restart during transitions
- ✅ Set up alerts for failed transitions

**For Developers**:
- ✅ Implement retry logic for epoch errors
- ✅ Use SDK (handles transitions automatically)
- ✅ Cache blob IDs, not epochs
- ✅ Monitor error rate spikes

---

## Testing Epoch Handling

### Continuous Upload Test

```bash
# Run continuous uploads to observe transition
while true; do
    echo "Test $(date)" > test.txt
    walrus store test.txt --epochs 1
    sleep 5
done
```

**What to observe**:
- Most uploads succeed immediately
- During transition: 1-2 second delay
- No upload failures (retries handle transition)

### ✅ Checkpoint: Transition Test

1. Start continuous upload script
2. Wait for epoch transition
3. Observe any failures or delays
4. Verify uploads resume normally

---

## Key Takeaways

- Epochs change every ~2 weeks on Mainnet
- Transitions cause brief (1-2s) degradation
- Publishers/Aggregators handle transitions automatically
- Retry logic essential for clients
- Monitor epoch changes for network awareness

**Next**: [Monitoring and Log Patterns](./08-monitoring-logs.md)
