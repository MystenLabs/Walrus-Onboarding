# 8. Hands-On: Trace a Real Upload

In this hands-on exercise, you will run a local upload and inspect the logs to identify the lifecycle steps we've discussed.

## Prerequisites
-   A running local Walrus Devnet or Testnet.
-   The `walrus` CLI installed.
-   Access to log output (e.g., via `docker logs` or running the binary directly).

## Running in Docker (Recommended for Consistent Results)

For a consistent environment across all operating systems, use the Docker setup in the `docker/` directory:

```sh
# From the upload_transaction_lifecycle module directory
cd docker
make build
SUI_WALLET_PATH=~/.sui/sui_config make run

# Or run the trace lifecycle exercise
make trace-lifecycle
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

Look for the following patterns in your terminal output:

### 1. Chunk Creation
Find the encoding traces:
```text
DEBUG ... starting to encode blob with metadata
INFO ... encoded sliver pairs and metadata
DEBUG ... successfully encoded blob
```

### 2. Submission (Registration)
Find the Sui transaction traces:
```text
DEBUG ... starting to register blobs
```
You might also see logs related to `Sign and submit transaction`.

### 3. Sealing (Store Slivers)
Find the storage node interaction traces. Note that individual sliver uploads are often at `TRACE` level.
```text
TRACE ... starting to store sliver
```
(If running with `RUST_LOG=walrus_storage_node_client=trace`)

### 4. Proof Creation
Find the confirmation collection traces:
```text
INFO ... get {n} blobs certificates
```

### 5. Certification
Find the certification transaction:
```text
DEBUG ... certifying blob on Sui
```
Or successful completion of the command returning the Blob ID.

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
- **Stage Identification**: Specific log messages ("starting to encode", "register_blob", "certify_blob") map directly to protocol phases.
- **Troubleshooting**: Tracing logs allows you to pinpoint exactly where an upload failed (e.g., node interaction vs. blockchain transaction).
- **Verification**: Logs serve as confirmation that the client is correctly executing the distributed protocol.


