# Hands-On Lab: Publisher and Aggregator Operations

**Duration**: 60-90 minutes
**Format**: Instructor-led with hands-on exercises

---

## Lab Overview

**What you'll do**:
1. Deploy local publisher and aggregator
2. Perform upload/download operations
3. Analyze logs and identify states
4. Simulate failures and recover
5. Establish performance baselines

**Prerequisites**:
- Docker installed
- Walrus CLI configured
- Sui wallet with test tokens (for publisher)

---

## Part 1: Deployment (15 min)

### Setup: Docker Compose

**Instructor will guide you through creating `docker-compose.yml`**:

```yaml
version: '3.8'

services:
  publisher:
    image: mysten/walrus:latest
    command: publisher --bind-address "0.0.0.0:31415" --sub-wallets-dir /walrus/sub-wallets
    ports:
      - "31415:31415"
      - "27182:27182"
    volumes:
      - publisher-wallets:/walrus/sub-wallets
    restart: unless-stopped

  aggregator:
    image: mysten/walrus:latest
    command: aggregator --bind-address "0.0.0.0:31416"
    ports:
      - "31416:31416"
    restart: unless-stopped

volumes:
  publisher-wallets:
```

**Deploy**:
```bash
docker-compose up -d
```

### ✅ Checkpoint 1: Verify Deployment

Everyone should verify:
```bash
# Check containers running
docker-compose ps

# Check health endpoints
curl http://localhost:31415/health
curl http://localhost:31416/health
```

**Expected**: Both return `{"status":"healthy","epoch":...}`

**💬 Group Discussion**:
- What epoch number do you see?
- Are both services on the same epoch?
- What does the epoch represent?

**Instructor**: Review anyone having issues before proceeding.

---

## Part 2: Upload Operations (15 min)

### Exercise 2.1: First Upload

**Everyone do this together**:

```bash
# Create test file
echo "Lab test - Your Name" > test.txt

# Configure CLI
export WALRUS_PUBLISHER_URL=http://localhost:31415

# Upload
walrus store test.txt --epochs 1
```

### ✅ Checkpoint 2.1

Raise your hand when complete. Note your blob ID.

**💬 Pair Activity**:
- Compare blob IDs with neighbor
- Same file, different IDs? Why?

### Exercise 2.2: Observe Logs

**Watch logs while uploading**:

```bash
# Terminal 1: Watch logs
docker logs -f walrus-publisher-1

# Terminal 2: Upload
echo "Test 2" > test2.txt
walrus store test2.txt --epochs 1
```

### ✅ Checkpoint 2.2

**Group Share**: What did you see in the logs?
- Encoding message?
- Storage node distribution?
- Completion message?

**Instructor**: Show example logs on screen, highlight key patterns.

---

## Part 3: Download Operations (15 min)

### Exercise 3.1: Download via Aggregator

```bash
# Configure for aggregator
export WALRUS_AGGREGATOR_URL=http://localhost:31416

# Download your blob (use your blob ID from Part 2)
walrus read <YOUR-BLOB-ID> --out downloaded.txt

# Verify
diff test.txt downloaded.txt
```

### ✅ Checkpoint 3.1

Thumbs up if download succeeded and files match!

### Exercise 3.2: Debug Mode

**Instructor demonstrates**:
```bash
# Stop aggregator
docker-compose stop aggregator

# Run with debug logging
docker run --rm \
  -p 31416:31416 \
  -e RUST_LOG=debug \
  mysten/walrus:latest \
  aggregator --bind-address "0.0.0.0:31416"
```

**Everyone**: Download a blob while watching debug output.

**💬 Group Discussion**:
- How many slivers needed? (Look for "requires X slivers")
- Where does this number come from?

**Instructor**: Explain Reed-Solomon parameters (334 primary slivers from ~1000 total).

---

## Part 4: Log Analysis (10 min)

### Exercise 4.1: Identify Patterns

**In pairs**, examine logs and find:

1. **Startup pattern**:
   ```
   INFO: Committee synchronized, epoch X
   ```

2. **Success pattern**:
   ```
   INFO: Upload completed successfully
   ```

3. **Warning pattern** (if any):
   ```
   WARN: Failed to connect to storage node
   ```

### ✅ Checkpoint 4.1

**Each pair shares**: What's one pattern you found?

**Instructor**: Create master list on whiteboard of expected vs unexpected patterns.

---

## Part 5: Failure Simulation (20 min)

### Exercise 5.1: Process Crash

**Everyone do simultaneously**:

```bash
# Kill publisher
docker kill walrus-publisher-1

# Try to upload (should fail)
walrus store crash-test.txt --epochs 1

# Wait for Docker to restart it
sleep 10

# Try again (should succeed)
walrus store crash-test.txt --epochs 1
```

### ✅ Checkpoint 5.1

**Group Poll**:
- How many seconds until restart?
- Upload worked after restart?

**💬 Discussion**: What if Docker didn't auto-restart? How would you handle this in production?

### Exercise 5.2: Resource Limit (Demo)

**Instructor demonstrates on screen**:

```bash
# Update docker-compose.yml
#   deploy:
#     resources:
#       limits:
#         memory: 512M

# Try uploading large file
dd if=/dev/urandom of=100mb.bin bs=1M count=100
walrus store 100mb.bin --epochs 1
```

**Watch for**: OOM kill in logs

**💬 Discussion**: How would you determine appropriate memory limits?

---

## Part 6: Metrics and Performance (15 min)

### Exercise 6.1: Metrics Exploration

**In groups of 3**:

```bash
# Get metrics
curl http://localhost:27182/metrics > metrics.txt

# Find these metrics:
grep "walrus_uploads_total" metrics.txt
grep "walrus_downloads_total" metrics.txt
grep "walrus_encoding_duration" metrics.txt
```

### ✅ Checkpoint 6.1

**Each group reports**:
- Total uploads so far?
- Any failures?

### Exercise 6.2: Performance Baseline

**Everyone measures**:

```bash
# Create 5MB file
dd if=/dev/urandom of=5mb.bin bs=1M count=5

# Time upload
time walrus store 5mb.bin --epochs 1

# Time download
time walrus read <BLOB-ID> --out /dev/null
```

### ✅ Checkpoint 6.2

**On whiteboard**: Instructor collects timing data from class.
- Fastest upload?
- Slowest upload?
- Average?

**💬 Discussion**: What causes variation in times?

---

## Part 7: Final Validation (10 min)

### Completion Checklist

**Individually verify**:

- [ ] Publisher health returns 200
- [ ] Aggregator health returns 200
- [ ] Can upload files successfully
- [ ] Can download files successfully
- [ ] Downloaded content matches uploaded
- [ ] Observed healthy log patterns
- [ ] Simulated crash and recovered
- [ ] Collected performance metrics

### ✅ Final Checkpoint

**Raise hand when all checkboxes complete**.

**Instructor**: Review any issues before cleanup.

---

## Cleanup

**Everyone run**:

```bash
# Stop and remove
docker-compose down -v

# Clean up test files
rm -f test.txt test2.txt downloaded.txt *.bin metrics.txt
```

---

## Key Takeaways (Instructor-Led Review)

**Instructor asks class**:

1. What's the minimum number of slivers needed to reconstruct?
   - Answer: 334

2. What happens if publisher crashes?
   - Answer: Docker restarts automatically

3. Where are metrics available?
   - Answer: Port 27182

4. What's a "healthy" log pattern?
   - Answer: Committee synchronized, ready to accept requests

5. Why do epochs matter?
   - Answer: Define storage node committee, require synchronization

---

## Optional Advanced Challenges

**If time permits**, try these:

### Challenge 1: Daemon Mode
Deploy both services on one port. Test both upload and download.

### Challenge 2: Concurrent Uploads
Create a script to upload 10 files simultaneously. Observe resource usage.

### Challenge 3: Prometheus
Add Prometheus to docker-compose and create a dashboard.

**💬 Discussion**: Which challenge interests you most? Why?

---

## Lab Complete!

**Congratulations!** You've successfully:
- ✅ Deployed Walrus infrastructure
- ✅ Performed operations end-to-end
- ✅ Analyzed logs and metrics
- ✅ Handled failure scenarios
- ✅ Established performance baselines

**You're now ready to operate Publishers and Aggregators in production.**

---

## Feedback Form

**Before leaving**, please share:
1. What was the most valuable part of this lab?
2. What was confusing?
3. What would you like to explore more?

