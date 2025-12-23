# 8. Hands-On: Trace a Real Upload

In this hands-on exercise, you will run a local upload and inspect the logs to identify the lifecycle steps we've discussed.

## Prerequisites
-   A running local Walrus Devnet or Testnet.
-   The `walrus` CLI installed.
-   Access to log output (e.g., via `docker logs` or running the binary directly).

## Running in Docker (Recommended for Consistent Results)

For a consistent environment across all operating systems, use the Docker setup in the `../docker/` directory (from the module root):

```sh
# From the upload_transaction_lifecycle module directory
cd docker
make build
SUI_WALLET_PATH=~/.sui/sui_config make run

# Or run the trace lifecycle exercise (SUI_WALLET_PATH is required)
SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle
```

> 💡 **Docker Benefits:** Debug logging is pre-configured to show all lifecycle stages.

## Step 1: Prepare the Environment

Set the `RUST_LOG` environment variable to enable debug logs for the client.

```bash
export RUST_LOG="walrus_sdk=debug,walrus_core=debug,walrus_sui=debug"
```

## Step 2: Perform an Upload

Upload a small file using the CLI.

```bash
# Create a dummy file
echo "Hello Walrus Lifecycle" > test.txt

# Upload
walrus store test.txt
```

## Step 3: Analyze the Logs

Look for the following patterns in your terminal output. If using the Docker setup, run `make grep-logs` to automatically search for these patterns, or `make analyze-logs` to see the reference guide.

### 1. Chunk Creation
Find the encoding traces:
```text
DEBUG ... starting to encode blob with metadata
INFO ... finished blob encoding duration=...
```

### 2. Submission (Registration)
Find the Sui transaction traces:
```text
DEBUG ... starting to register blobs
DEBUG ... registering blobs
INFO ... finished registering blobs duration=...
```

### 3. Sealing (Store Slivers)
Find the storage node interaction traces:
```text
DEBUG ... sliver upload completed on node
DEBUG ... finished storing slivers on node
DEBUG ... storing metadata and sliver pairs finished
```

### 4. Proof Creation
Find the confirmation collection traces:
```text
DEBUG ... retrieving confirmation
DEBUG ... return=ThresholdReached
```
The `ThresholdReached` message indicates enough signatures have been collected.

### 5. Certification
Find the certification transaction:
```text
INFO ... obtained 1 blob certificate duration=...
INFO ... finished certifying and extending blobs on Sui duration=...
INFO ... finished storing blobs duration=...
```
Or look for the final success message with the Blob ID.

## Step 4: Storage Node Logs (Optional)

If you have access to the storage node logs (e.g., in a local docker setup), look for:

```text
INFO ... process_blob_certified_event
```
(Note: Sliver storage success is typically reported via HTTP 200 responses or metrics like `slivers_stored_total`, rather than explicit INFO logs per sliver.)

## Challenge

Try uploading a file larger than 10MB. Does the logging pattern change? Do you see multiple encoding steps or batched uploads?

## Key Takeaways

- **Log Visibility**: Debug logs provide a step-by-step trace of the entire upload lifecycle.
- **Stage Identification**: Specific log messages map directly to protocol phases:
  - Encoding: `starting to encode blob` → `finished blob encoding`
  - Registration: `starting to register blobs` → `finished registering blobs`
  - Sealing: `sliver upload completed` → `storing metadata and sliver pairs finished`
  - Proof: `retrieving confirmation` → `ThresholdReached`
  - Certification: `obtained blob certificate` → `finished storing blobs`
- **Troubleshooting**: Tracing logs allows you to pinpoint exactly where an upload failed (e.g., node interaction vs. blockchain transaction).
- **Verification**: Logs serve as confirmation that the client is correctly executing the distributed protocol.
- **Docker Tools**: Use `make grep-logs` for automated pattern matching and `make analyze-logs` for the reference guide.


