# Lesson 5: Troubleshooting

## Learning Objectives

- Diagnose common issues
- Apply quick fixes
- Know when to restart services

---

## Troubleshooting Process

1. **Check if service is running**: `ps aux | grep walrus`
2. **Check logs**: `journalctl -u walrus-publisher -n 50`
3. **Test connectivity**: `curl http://localhost:31415/`
4. **Check metrics**: `curl http://localhost:27182/metrics`

---

## Common Issues

### Stuck at Quote Prompt (`dquote>`)

**Symptom**: After typing a command, you see `dquote>` prompt and can't exit

**Cause**: Smart/curly quotes (`"`) instead of straight quotes (`"`)

**Fix**:
```bash
# Press Ctrl+C to exit
# Then retype with straight quotes
echo "Hello Walrus!" > test.txt
```

---

## Common Publisher Issues

### Service Won't Start

**Check**:
```bash
# Is port in use?
netstat -tuln | grep 31415

# Does config exist?
ls ~/.config/walrus/client_config.yaml
```

**Fix**:
- Use different port: `--bind-address "127.0.0.1:31417"`
- Re-download config if missing

### Uploads Fail with Gas Errors

**Check**:
```bash
sui client gas
```

**Fix**:
- Add SUI tokens (faucet: https://faucet.testnet.sui.io/)
- Restart publisher to fund sub-wallets

### Uploads Are Slow

**Check**:
```bash
curl http://localhost:27182/metrics | grep requests_active
```

**Fix**:
- If saturated (active = n_clients), increase `--n-clients`
- Check network connectivity

---

## Common Aggregator Issues

### Downloads Return 404

**Check**:
- Verify blob ID is correct (no extra spaces)
- Check if blob was actually uploaded

**Fix**:
- Re-upload blob
- Wait a few seconds after upload before downloading

### Downloads Are Slow

**Check**:
- Test with multiple different blobs
- Check network connectivity

**Fix**:
- Try at different times
- Verify Sui RPC is responsive

---

## Quick Recovery Steps

### Restart Service

```bash
# Systemd
sudo systemctl restart walrus-publisher

# Or kill and restart manually
pkill -f "walrus publisher"
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/sub-wallets
```

### Reset Sub-Wallets

```bash
# Stop service
sudo systemctl stop walrus-publisher

# Clear sub-wallets (but keep directory)
rm -rf ~/.walrus/sub-wallets/*

# Verify directory exists
mkdir -p ~/.walrus/sub-wallets

# Restart (will create new sub-wallets)
sudo systemctl start walrus-publisher
```

### Reset Configuration

```bash
# Download fresh config
curl --create-dirs https://docs.wal.app/setup/client_config.yaml \
  -o ~/.config/walrus/client_config.yaml

# Restart services
sudo systemctl restart walrus-publisher
```

---

## When Things Break

### Service Crash Recovery

**Symptoms**:
- Process not running
- Connection refused

**Recovery**:
1. Check logs for errors
2. Restart service
3. Test with simple upload/download

### Network Issues

**Symptoms**:
- Timeouts
- RPC connection errors

**Recovery**:
1. Check internet connectivity
2. Verify RPC URL in config
3. Wait and retry

---

## Key Takeaways

✅ Check process status first

✅ Most issues solved by restart

✅ Check wallet balance for gas errors

✅ Verify config file exists and is correct

✅ Look at metrics to identify saturation

---

**Next**: [Lesson 6: Hands-On Lab](./06-hands-on-lab.md)
