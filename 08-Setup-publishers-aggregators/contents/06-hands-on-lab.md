# Lesson 6: Hands-On Lab

## Lab Overview

Put everything together: deploy publisher and aggregator, test operations, observe behavior.

**Time**: 30-45 minutes

---

## Prerequisites

- Walrus installed
- Sui wallet with SUI and WAL tokens
- Two terminal windows

**⚠️ Important**: When copying commands, ensure you use **straight quotes** (`"`) not curly/smart quotes (`"`). If you get stuck at a `dquote>` prompt, press Ctrl+C and retype the command with straight quotes.

---

## Part 1: Deploy Publisher (10 minutes)

### Start Publisher

**Terminal 1**:
```bash
# Create sub-wallets directory
mkdir -p ~/.walrus/lab-publisher

# Start publisher
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/lab-publisher
```

Observe startup logs.

### Test Upload

**Terminal 2**:
```bash
# Create test file
echo "Lab test data" > test.txt

# Upload
curl -X PUT http://localhost:31415/v1/blobs \
  --data-binary @test.txt | tee response.json

# Save blob ID
BLOB_ID=$(cat response.json | grep -o '"blobId":"[^"]*' | cut -d'"' -f4)
echo $BLOB_ID > blob_id.txt
echo "Blob ID: $BLOB_ID"
```

**✅ Checkpoint**: Upload succeeded, blob ID saved

---

## Part 2: Deploy Aggregator (5 minutes)

### Start Aggregator

**Terminal 3** (or use screen/tmux):
```bash
walrus aggregator --bind-address "127.0.0.1:31416"
```

### Retrieve Blob

**Terminal 2**:
```bash
BLOB_ID=$(cat blob_id.txt)
curl http://localhost:31416/v1/blobs/$BLOB_ID -o retrieved.txt

# Verify
diff test.txt retrieved.txt
```

**✅ Checkpoint**: Files match (no diff output)

---

## Part 3: Test Operations (10 minutes)

### Upload Multiple Files

```bash
# Upload 3 files
for i in {1..3}; do
  echo "Test file $i" > file$i.txt
  curl -X PUT http://localhost:31415/v1/blobs \
    --data-binary @file$i.txt -s | \
    grep -o '"blobId":"[^"]*' | cut -d'"' -f4 > blob$i.txt &
done
wait

echo "All uploads complete"
```

### Retrieve and Verify

```bash
for i in {1..3}; do
  BLOB_ID=$(cat blob$i.txt)
  curl http://localhost:31416/v1/blobs/$BLOB_ID -o retrieved$i.txt
  diff file$i.txt retrieved$i.txt && echo "File $i: ✓"
done
```

**✅ Checkpoint**: All files match

---

## Part 4: Monitor Operations (5 minutes)

### Check Metrics

```bash
# Publisher metrics
curl -s http://localhost:27182/metrics | grep publisher_requests

# Aggregator metrics
curl -s http://localhost:27182/metrics | grep aggregator_requests

# Check for errors
curl -s http://localhost:27182/metrics | grep errors_total
```

**Expected**:
- requests_total > 0
- errors_total = 0 or very low
- requests_active = 0 (when idle)

**✅ Checkpoint**: Metrics show healthy state

---

## Part 5: Failure Recovery (10 minutes)

### Simulate Failure

```bash
# Stop publisher
pkill -f "walrus publisher"

# Try to upload (should fail)
echo "Should fail" | curl -X PUT http://localhost:31415/v1/blobs --data-binary @-
```

**Expected**: Connection refused

### Recover

**Terminal 1**:
```bash
# Restart publisher
walrus publisher \
  --bind-address "127.0.0.1:31415" \
  --sub-wallets-dir ~/.walrus/lab-publisher
```

**Terminal 2**:
```bash
# Test upload works again
echo "Recovery test" | curl -X PUT http://localhost:31415/v1/blobs --data-binary @-
```

**✅ Checkpoint**: Upload succeeds after recovery

---

## Final Validation

### Complete Health Check

```bash
# 1. Services running
ps aux | grep "walrus publisher"
ps aux | grep "walrus aggregator"

# 2. End-to-end test
echo "Final test" > final.txt
FINAL_ID=$(curl -X PUT http://localhost:31415/v1/blobs --data-binary @final.txt -s | \
  grep -o '"blobId":"[^"]*' | cut -d'"' -f4)
curl http://localhost:31416/v1/blobs/$FINAL_ID -o final-retrieved.txt
diff final.txt final-retrieved.txt && echo "✓ Success!"

# 3. Check metrics
curl -s http://localhost:27182/metrics | grep _requests_total
curl -s http://localhost:27182/metrics | grep _errors_total
```

**✅ Final Checkpoint**: All checks pass

---

## Lab Summary

You have successfully:

✅ Deployed publisher with custom configuration

✅ Deployed aggregator

✅ Uploaded and retrieved multiple blobs

✅ Verified data integrity

✅ Monitored operations using metrics

✅ Simulated and recovered from failure

---

## Cleanup

```bash
# Stop services
pkill -f "walrus publisher"
pkill -f "walrus aggregator"

# Optional: Remove test files
# rm -f test.txt retrieved.txt file*.txt blob*.txt
```

---

## Next Steps

- Deploy with systemd for production
- Set up Prometheus monitoring
- Test with larger files
- Try `walrus daemon` mode

**Congratulations!** You've completed Module 8!
