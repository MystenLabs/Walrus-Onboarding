# Hands-On: Log Inspection and Troubleshooting

This hands-on exercise teaches you to inspect logs from Walrus components to identify key operational events, diagnose issues, and understand what's happening during uploads and retrievals.

## Learning Objectives

By the end of this exercise, you will be able to:

- Inspect publisher logs to identify encoding, distribution, and certificate posting events
- Inspect aggregator logs to identify metadata queries, sliver fetching, and reconstruction events
- Identify error conditions and failure scenarios in logs
- Trace a complete upload or retrieval flow through log entries
- Diagnose common issues using log analysis

## Prerequisites

- Completed Modules 1 and 2
- Understanding of upload and retrieval flows
- Access to Walrus CLI with verbose logging enabled
- OR sample log files provided by instructor

---

## Part 1: Generating Logs with CLI

### Exercise 1.1: Enable Verbose Logging

The Walrus CLI and components use Rust's logging framework. Enable verbose logging:

```bash
# Set log level to debug
export RUST_LOG=debug

# Or for even more detail
export RUST_LOG=trace

# Run a store operation
walrus store sample.txt 2>&1 | tee upload.log

# Run a read operation
walrus read <blob-id> 2>&1 | tee retrieval.log
```

**What to observe:**
- Log output now shows detailed information about each step
- Timestamps for each operation
- Component names (e.g., `walrus-sdk`, `walrus-service`)
- Log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`

---

## Part 2: Analyzing Upload Logs

### Sample Upload Log

Below is a sample (simplified) log from an upload operation. Study it and answer the questions:

```
[2025-01-15T10:30:00.123Z INFO  walrus] Starting blob upload: sample.txt
[2025-01-15T10:30:00.125Z DEBUG walrus_sdk::encoding] Reading file: sample.txt, size: 1048576 bytes
[2025-01-15T10:30:00.130Z INFO  walrus_sdk::encoding] Encoding blob with RedStuff...
[2025-01-15T10:30:00.250Z DEBUG walrus_sdk::encoding] Created 1000 sliver pairs
[2025-01-15T10:30:00.255Z DEBUG walrus_sdk::encoding] Computing sliver hashes...
[2025-01-15T10:30:00.280Z DEBUG walrus_sdk::encoding] Building Merkle tree...
[2025-01-15T10:30:00.285Z INFO  walrus_sdk::encoding] Blob ID: 0xabc123def456...
[2025-01-15T10:30:00.290Z INFO  walrus_sdk] Querying Sui for storage nodes...
[2025-01-15T10:30:00.350Z DEBUG walrus_sdk] Found 1000 storage nodes across shards
[2025-01-15T10:30:00.355Z INFO  walrus_sdk] Registering blob on Sui...
[2025-01-15T10:30:01.200Z INFO  walrus_sdk] Blob registered, object ID: 0x789abc...
[2025-01-15T10:30:01.205Z INFO  walrus_sdk] Distributing slivers to storage nodes...
[2025-01-15T10:30:01.210Z DEBUG walrus_sdk] Sending sliver to node 1 (shard 0)
[2025-01-15T10:30:01.215Z DEBUG walrus_sdk] Sending sliver to node 2 (shard 1)
...
[2025-01-15T10:30:02.100Z DEBUG walrus_sdk] Received signature from node 1
[2025-01-15T10:30:02.105Z DEBUG walrus_sdk] Received signature from node 2
...
[2025-01-15T10:30:03.500Z INFO  walrus_sdk] Collected 700/1000 signatures (quorum reached)
[2025-01-15T10:30:03.505Z INFO  walrus_sdk] Aggregating certificates...
[2025-01-15T10:30:03.600Z INFO  walrus_sdk] Posting certificate to Sui...
[2025-01-15T10:30:04.200Z INFO  walrus_sdk] Certificate posted, transaction: 0xdef456...
[2025-01-15T10:30:04.205Z INFO  walrus] Blob available at point of availability
[2025-01-15T10:30:04.210Z INFO  walrus] Upload complete: blob ID 0xabc123def456...
```

### Exercise 2.1: Identify Key Events

**Question 1:** At what timestamp did encoding complete?

<details>
<summary>Answer</summary>
2025-01-15T10:30:00.285Z - When blob ID was computed after Merkle tree construction
</details>

**Question 2:** How many sliver pairs were created?

<details>
<summary>Answer</summary>
1000 sliver pairs
</details>

**Question 3:** How many signatures were collected? Was quorum reached?

<details>
<summary>Answer</summary>
700/1000 signatures. Yes, quorum was reached (need 2/3 = 667 signatures)
</details>

**Question 4:** What is the blob ID?

<details>
<summary>Answer</summary>
0xabc123def456...
</details>

**Question 5:** How long did the entire upload take (from start to "Upload complete")?

<details>
<summary>Answer</summary>
Approximately 4.1 seconds (10:30:00.123Z to 10:30:04.210Z)
</details>

### Exercise 2.2: Identify Phases

Map the log entries to the upload flow phases:

1. **Encoding Phase**: Lines ______ to ______
2. **On-Chain Registration Phase**: Lines ______ to ______
3. **Distribution Phase**: Lines ______ to ______
4. **Certificate Collection Phase**: Lines ______ to ______
5. **Certificate Posting Phase**: Lines ______ to ______

<details>
<summary>Answer</summary>

1. Encoding Phase: "Reading file" to "Blob ID computed" (10:30:00.125Z to 10:30:00.285Z)
2. On-Chain Registration Phase: "Registering blob" to "Blob registered" (10:30:00.355Z to 10:30:01.200Z)
3. Distribution Phase: "Distributing slivers" to start of signature collection (10:30:01.205Z to 10:30:02.100Z)
4. Certificate Collection Phase: "Received signature" entries to "Quorum reached" (10:30:02.100Z to 10:30:03.500Z)
5. Certificate Posting Phase: "Posting certificate" to "Certificate posted" (10:30:03.600Z to 10:30:04.200Z)

</details>

---

## Part 3: Analyzing Failure Scenarios

### Sample Failed Upload Log

```
[2025-01-15T11:00:00.100Z INFO  walrus] Starting blob upload: large-file.bin
[2025-01-15T11:00:00.105Z DEBUG walrus_sdk::encoding] Reading file: large-file.bin, size: 15000000000 bytes
[2025-01-15T11:00:00.110Z ERROR walrus_sdk::encoding] Blob size exceeds maximum: 15 GB > 13.3 GB
[2025-01-15T11:00:00.115Z ERROR walrus] Upload failed: BlobTooLarge
```

### Exercise 3.1: Diagnose the Problem

**Question 1:** What went wrong?

<details>
<summary>Answer</summary>
The blob size (15 GB) exceeds the maximum allowed size (13.3 GiB).
</details>

**Question 2:** At what phase did the failure occur?

<details>
<summary>Answer</summary>
During the initial encoding phase, before encoding even started (file size check).
</details>

**Question 3:** How would you fix this?

<details>
<summary>Answer</summary>
Split the file into chunks smaller than 13.3 GiB each, then upload each chunk separately.
</details>

### Sample Network Failure Log

```
[2025-01-15T11:15:00.100Z INFO  walrus_sdk] Distributing slivers to storage nodes...
[2025-01-15T11:15:00.110Z DEBUG walrus_sdk] Sending sliver to node 1 (shard 0)
[2025-01-15T11:15:00.115Z DEBUG walrus_sdk] Sending sliver to node 2 (shard 1)
...
[2025-01-15T11:15:01.100Z WARN  walrus_sdk] Node 5 unreachable: Connection timeout
[2025-01-15T11:15:01.105Z WARN  walrus_sdk] Node 12 unreachable: Connection refused
[2025-01-15T11:15:01.110Z WARN  walrus_sdk] Node 23 unreachable: Connection timeout
...
[2025-01-15T11:15:05.200Z INFO  walrus_sdk] Collected 650/1000 signatures
[2025-01-15T11:15:05.205Z WARN  walrus_sdk] Quorum not reached (need 667, got 650)
[2025-01-15T11:15:05.210Z ERROR walrus] Upload failed: InsufficientSignatures
```

### Exercise 3.2: Diagnose Network Issues

**Question 1:** How many nodes were unreachable?

<details>
<summary>Answer</summary>
At least 3 nodes (5, 12, 23) explicitly mentioned, likely more based on signature count (350 nodes didn't respond out of 1000).
</details>

**Question 2:** What was the quorum requirement? How many signatures were collected?

<details>
<summary>Answer</summary>
Quorum: 667 signatures (2/3 of 1000). Collected: 650 signatures.
</details>

**Question 3:** Was the upload successful? Why or why not?

<details>
<summary>Answer</summary>
No, upload failed because quorum wasn't reached (650 < 667 required).
</details>

**Question 4:** What would you do to retry?

<details>
<summary>Answer</summary>
Retry the upload. Different nodes may be online, or network conditions may improve. The system needs 2/3 quorum, so some node failures are tolerable.
</details>

---

## Part 4: Analyzing Retrieval Logs

### Sample Retrieval Log

```
[2025-01-15T12:00:00.100Z INFO  walrus] Starting blob retrieval: 0xabc123def456...
[2025-01-15T12:00:00.105Z DEBUG walrus_sdk] Querying Sui for blob metadata...
[2025-01-15T12:00:00.200Z INFO  walrus_sdk] Blob found: size 1048576 bytes, epoch 100
[2025-01-15T12:00:00.205Z DEBUG walrus_sdk] Blob status: Certified
[2025-01-15T12:00:00.210Z INFO  walrus_sdk] Fetching 334 primary slivers...
[2025-01-15T12:00:00.215Z DEBUG walrus_sdk] Requesting sliver from node 1 (shard 0)
[2025-01-15T12:00:00.220Z DEBUG walrus_sdk] Requesting sliver from node 2 (shard 1)
...
[2025-01-15T12:00:01.100Z DEBUG walrus_sdk] Received sliver from node 1, hash verified
[2025-01-15T12:00:01.105Z DEBUG walrus_sdk] Received sliver from node 2, hash verified
...
[2025-01-15T12:00:02.500Z INFO  walrus_sdk] Fetched 334/334 slivers successfully
[2025-01-15T12:00:02.505Z INFO  walrus_sdk] Reconstructing blob...
[2025-01-15T12:00:02.700Z DEBUG walrus_sdk] Erasure decoding complete
[2025-01-15T12:00:02.705Z INFO  walrus_sdk] Performing consistency check (default)...
[2025-01-15T12:00:02.800Z INFO  walrus_sdk] Consistency check passed
[2025-01-15T12:00:02.805Z INFO  walrus] Blob retrieved successfully
```

### Exercise 4.1: Trace Retrieval Flow

**Question 1:** What was the blob status on Sui?

<details>
<summary>Answer</summary>
Certified (meaning certificate was posted and blob is available)
</details>

**Question 2:** How many slivers were fetched? Was this sufficient?

<details>
<summary>Answer</summary>
334/334 slivers. Yes, this is the minimum required for reconstruction.
</details>

**Question 3:** What consistency check level was used?

<details>
<summary>Answer</summary>
Default consistency check (verifies first 334 primary sliver hashes)
</details>

**Question 4:** How long did retrieval take?

<details>
<summary>Answer</summary>
Approximately 2.7 seconds (12:00:00.100Z to 12:00:02.805Z)
</details>

---

## Part 5: Real-World Exercise

### Exercise 5.1: Generate and Analyze Your Own Logs

**Task:** Perform an upload and retrieval with verbose logging, then analyze the logs.

**Steps:**

1. Create a test file:
   ```bash
   echo "Hello, Walrus!" > test-file.txt
   ```

2. Upload with verbose logging:
   ```bash
   RUST_LOG=debug walrus store test-file.txt 2>&1 | tee my-upload.log
   ```

3. Analyze your upload log:
   - Identify the blob ID
   - Find the encoding phase duration
   - Count how many signatures were collected
   - Verify quorum was reached
   - Note the total upload time

4. Retrieve with verbose logging:
   ```bash
   RUST_LOG=debug walrus read <your-blob-id> 2>&1 | tee my-retrieval.log
   ```

5. Analyze your retrieval log:
   - Find when Sui was queried
   - Count slivers fetched
   - Identify consistency check level and result
   - Note total retrieval time

### Exercise 5.2: Simulate a Failure

**Task:** Try to upload a file that will fail and analyze the error.

**Scenario 1: Insufficient Funds**

```bash
# Check wallet balance first
sui client gas

# If balance is low, try upload and observe error
RUST_LOG=debug walrus store test-file.txt 2>&1 | tee failure-insufficient-funds.log
```

**Analyze:** Find the error message and identify at what phase the failure occurred.

**Scenario 2: Network Timeout** (simulate by setting short timeout if possible, or by disconnecting network briefly)

**Analyze:** Look for timeout errors and see how many nodes responded before timeout.

---

## Key Events to Look For

### Upload Logs

| Event | Log Indicator | Phase |
|-------|---------------|-------|
| File read | "Reading file" | Pre-encoding |
| Encoding start | "Encoding blob" | Encoding |
| Sliver creation | "Created N sliver pairs" | Encoding |
| Blob ID computed | "Blob ID: 0x..." | Encoding |
| Sui registration | "Registering blob on Sui" | On-chain |
| Distribution start | "Distributing slivers" | Distribution |
| Signature received | "Received signature from node" | Collection |
| Quorum reached | "Collected X/Y signatures (quorum reached)" | Collection |
| Certificate posted | "Certificate posted" | On-chain |
| Point of availability | "Blob available at point of availability" | Complete |

### Retrieval Logs

| Event | Log Indicator | Phase |
|-------|---------------|-------|
| Sui query | "Querying Sui for blob metadata" | Metadata |
| Blob found | "Blob found: size X" | Metadata |
| Sliver fetch start | "Fetching N primary slivers" | Fetching |
| Sliver received | "Received sliver from node, hash verified" | Fetching |
| Reconstruction start | "Reconstructing blob" | Reconstruction |
| Decoding complete | "Erasure decoding complete" | Reconstruction |
| Consistency check | "Performing consistency check" | Verification |
| Success | "Blob retrieved successfully" | Complete |

### Error Indicators

| Error Type | Log Indicator |
|------------|---------------|
| Blob too large | "ERROR" + "Blob size exceeds maximum" |
| Insufficient funds | "ERROR" + "Insufficient" + "SUI" or "WAL" |
| Network timeout | "WARN" or "ERROR" + "timeout" |
| Node unreachable | "WARN" + "unreachable" |
| Quorum not reached | "ERROR" + "Quorum not reached" or "InsufficientSignatures" |
| Blob not found | "ERROR" + "Blob not found" or "HTTP 404" |
| Hash mismatch | "ERROR" + "hash mismatch" or "Consistency check failed" |

---

## Summary

You've now learned to:

- ✅ Enable verbose logging for Walrus operations
- ✅ Identify key events in upload logs (encoding, distribution, signatures, certificate)
- ✅ Identify key events in retrieval logs (metadata query, fetching, reconstruction)
- ✅ Diagnose failure scenarios from error messages
- ✅ Trace complete upload/retrieval flows through logs
- ✅ Generate and analyze your own logs

**Next steps:**
- Practice log analysis with more complex scenarios
- Set up monitoring and alerting based on log patterns
- Use logs to troubleshoot issues in your own applications

## Key Points

- **Enable verbose logging**: `RUST_LOG=debug` or `RUST_LOG=trace`
- **Key upload events**: Encoding → Registration → Distribution → Signatures → Certificate
- **Key retrieval events**: Metadata query → Sliver fetching → Reconstruction → Consistency check
- **Error diagnosis**: Look for ERROR and WARN log levels, identify phase where error occurred
- **Timing analysis**: Use timestamps to calculate duration of each phase
- **Troubleshooting**: Logs are essential for diagnosing production issues

## Related Sections

- [Component Duties](./component-duties.md) - Understand what each component is responsible for
- [Failure Modes](./failure-modes.md) - Learn about common failure scenarios
- [System Guarantees](./guarantees.md) - Know what to verify in logs
