# Hands-On Exercises

This section provides practical exercises to reinforce your understanding of the Walrus CLI. Complete these exercises to gain hands-on experience with uploading, downloading, inspecting, and troubleshooting.

## Prerequisites

Before starting, ensure you have:

1. ✅ Walrus CLI installed and configured
2. ✅ A Sui wallet with SUI and WAL tokens
3. ✅ Network connectivity
4. ✅ A test file to work with (we'll create one)

Verify your setup:

```sh
walrus --version
walrus info
```

## Running in Docker (Recommended for Consistent Results)

For a consistent environment across all operating systems, use the Docker setup in the `docker/` directory:

```sh
# From the cli module directory
cd docker
make build
SUI_WALLET_PATH=~/.sui/sui_config make run

# Or run specific exercises
make upload-download   # Full upload and download workflow
make inspect           # Inspect objects and system info
make failure-recovery  # Test failure scenarios
```

> 📝 **Docker Requirements:**
> - Docker Desktop must be installed and running
> - You need a Sui wallet with SUI and WAL tokens
> - Mount your wallet config using `SUI_WALLET_PATH`

## Exercise 1: Full Upload and Download Workflow

This exercise walks you through a complete upload and download cycle.

### Step 1: Create a Test File

Create a simple test file:

**Mac/Linux:**

```sh
echo "Hello, Walrus! This is a test file for the CLI curriculum." > test-file.txt
cat test-file.txt
```

**Windows (Command Prompt):**

```cmd
echo Hello, Walrus! This is a test file for the CLI curriculum. > test-file.txt
type test-file.txt
```

**Windows (PowerShell):**

```powershell
"Hello, Walrus! This is a test file for the CLI curriculum." | Out-File -Encoding utf8 test-file.txt
Get-Content test-file.txt
```

### Step 2: Get the Blob ID

Before uploading, get the blob ID of your file:

```sh
walrus blob-id test-file.txt
```

Save this blob ID - you'll use it later. Note that the blob ID is deterministic: the same file content always produces the same blob ID.

### Step 3: Check if Already Stored

Check if this blob is already stored:

```sh
walrus blob-status --file test-file.txt
```

If it shows as available, note the end epoch. Otherwise, proceed to upload.

### Step 4: Upload the File

Store the file on Walrus:

```sh
walrus store test-file.txt --epochs 10
```

**What to observe**:
- The blob ID (should match what you got in Step 2)
- The blob object ID
- The end epoch
- The transaction ID

Save the blob ID for the next steps.

### Step 5: Verify Upload Status

Check that the blob is now available:

```sh
walrus blob-status --blob-id <BLOB_ID_FROM_STEP_4>
```

Verify it shows as "Available" and note the end epoch.

### Step 6: Download the Blob

Download the blob to a new file:

```sh
walrus read <BLOB_ID> --out downloaded-file.txt
```

### Step 7: Verify Download

Compare the original and downloaded files:

**Mac/Linux:**

```sh
# Compare blob IDs (should be identical)
walrus blob-id test-file.txt
walrus blob-id downloaded-file.txt

# Compare file contents
diff test-file.txt downloaded-file.txt
# Or:
cmp test-file.txt downloaded-file.txt
```

**Windows (Command Prompt):**

```cmd
walrus blob-id test-file.txt
walrus blob-id downloaded-file.txt

fc test-file.txt downloaded-file.txt
```

**Windows (PowerShell):**

```powershell
walrus blob-id test-file.txt
walrus blob-id downloaded-file.txt

Compare-Object (Get-Content test-file.txt) (Get-Content downloaded-file.txt)
```

The files should be identical. If they differ, investigate why (check for errors in the download).

### Step 8: List Your Blobs

See all blobs you own:

```sh
walrus list-blobs
```

You should see the blob you just uploaded, including:
- Blob ID
- Object ID
- End epoch
- Deletable status

**Exercise Complete!** You've successfully uploaded and downloaded a blob.

## Exercise 2: Inspect Stored Objects

This exercise focuses on inspection and metadata commands.

### Step 1: Upload Multiple Files

Create and upload multiple test files:

**Mac/Linux:**

```sh
echo "File 1 content" > file1.txt
echo "File 2 content" > file2.txt
echo "File 3 content" > file3.txt

walrus store file1.txt file2.txt file3.txt --epochs 5
```

**Windows (Command Prompt):**

```cmd
echo File 1 content > file1.txt
echo File 2 content > file2.txt
echo File 3 content > file3.txt

walrus store file1.txt file2.txt file3.txt --epochs 5
```

**Windows (PowerShell):**

```powershell
"File 1 content" | Out-File -Encoding utf8 file1.txt
"File 2 content" | Out-File -Encoding utf8 file2.txt
"File 3 content" | Out-File -Encoding utf8 file3.txt

walrus store file1.txt file2.txt file3.txt --epochs 5
```

Save the blob IDs for each file.

### Step 2: List All Your Blobs

```sh
walrus list-blobs
```

**Questions to answer**:
- How many blob objects do you own?
- What are their end epochs?
- Which ones are deletable?

### Step 3: Check Individual Blob Status

For each blob ID from Step 1:

```sh
walrus blob-status --blob-id <BLOB_ID>
```

**What to observe**:
- Availability status
- End epoch
- Certified event information

### Step 4: Get System Information

```sh
walrus info
```

**Questions to answer**:
- What is the current epoch?
- How many storage nodes are in the system?
- What is the maximum blob size?
- What is the current storage price per epoch?

### Step 5: Check Storage Node Health

```sh
walrus health --committee
```

**What to observe**:
- How many nodes are healthy?
- Are there any unhealthy nodes?
- What is the response time?

### Step 6: Get Blob IDs from Files

Verify you can derive blob IDs:

```sh
walrus blob-id file1.txt
walrus blob-id file2.txt
walrus blob-id file3.txt
```

Compare these with the blob IDs from Step 1 - they should match.

**Exercise Complete!** You've learned how to inspect stored objects and system information.

## Exercise 3: Trigger a Small Failure and Recover

This exercise demonstrates common failure scenarios and recovery techniques.

### Step 1: Attempt to Read Non-Existent Blob

Try to read a blob that doesn't exist:

```sh
walrus read 00000000000000000000000000000000000000000000 --out test.txt
```

**What happens?**
- Note the error message
- Understand what it means

### Step 2: Attempt Upload with Insufficient Tokens

If you have a wallet with very few tokens, try uploading a large file:

**Mac/Linux:**

```sh
# Create a large test file (adjust size based on your token balance)
dd if=/dev/zero of=large-file.bin bs=1M count=100

walrus store large-file.bin --epochs 10
```

**Windows (Command Prompt):**

```cmd
:: Create a 100MB file
fsutil file createnew large-file.bin 104857600

walrus store large-file.bin --epochs 10
```

**Windows (PowerShell):**

```powershell
# Create a 100MB file filled with zeros
$bytes = New-Object byte[] (100MB)
[System.IO.File]::WriteAllBytes("large-file.bin", $bytes)

walrus store large-file.bin --epochs 10
```

**What happens?**
- If it fails, note the error
- Check your token balances
- Understand the cost requirements

**Recovery**: Either obtain more tokens or use a smaller file.

### Step 3: Upload with Invalid Parameters

Try uploading with an invalid epoch value:

```sh
walrus store test-file.txt --epochs 1000
```

**What happens?**
- Note the error message
- Check the maximum epochs allowed with `walrus info`

### Step 4: Download with Wrong Blob ID

Try downloading with a slightly modified blob ID:

**Mac/Linux:**

```sh
# Get a real blob ID first
REAL_BLOB_ID=$(walrus blob-id test-file.txt)
echo "Real blob ID: $REAL_BLOB_ID"

# Try with a modified ID (this will fail)
walrus read "${REAL_BLOB_ID}x" --out test.txt
```

**Windows (PowerShell):**

```powershell
# Get a real blob ID first
$REAL_BLOB_ID = walrus blob-id test-file.txt
Write-Output "Real blob ID: $REAL_BLOB_ID"

# Try with a modified ID (this will fail)
walrus read "${REAL_BLOB_ID}x" --out test.txt
```

**What happens?**
- Note the error message
- Understand how blob IDs are validated

### Step 5: Recover from Configuration Error

Simulate a configuration issue:

```sh
# Try with a non-existent config file
walrus info --config /nonexistent/config.yaml
```

**What happens?**
- Note the error
- Understand configuration file requirements

**Recovery**: Use the correct configuration path or download a fresh config.

### Step 6: Use Debug Logging to Diagnose

Enable debug logging to see detailed information:

**Mac/Linux:**

```sh
RUST_LOG=walrus=debug walrus blob-status --file test-file.txt
```

**Windows (Command Prompt):**

```cmd
set RUST_LOG=walrus=debug
walrus blob-status --file test-file.txt
```

**Windows (PowerShell):**

```powershell
$env:RUST_LOG = "walrus=debug"
walrus blob-status --file test-file.txt
```

**What to observe**:
- Configuration file being used
- Wallet being used
- Network requests
- Detailed status information

### Step 7: Verify Recovery

After encountering errors, verify your setup still works:

```sh
# Check system status
walrus info

# Verify a known blob
walrus blob-status --file test-file.txt

# Test a simple operation
walrus blob-id test-file.txt
```

**Exercise Complete!** You've experienced common failures and learned recovery techniques.

## Bonus Exercises

### Bonus 1: Batch Operations

Upload multiple files and verify all were stored:

**Mac/Linux:**

```sh
# Create multiple files
for i in {1..5}; do
  echo "Content of file $i" > "batch-file-$i.txt"
done

# Upload all at once
walrus store batch-file-*.txt --epochs 5

# Verify all are stored
for i in {1..5}; do
  walrus blob-status --file "batch-file-$i.txt"
done
```

**Windows (PowerShell):**

```powershell
# Create multiple files
1..5 | ForEach-Object {
  "Content of file $_" | Out-File -Encoding utf8 "batch-file-$_.txt"
}

# Upload all at once
walrus store batch-file-1.txt batch-file-2.txt batch-file-3.txt batch-file-4.txt batch-file-5.txt --epochs 5

# Verify all are stored
1..5 | ForEach-Object {
  walrus blob-status --file "batch-file-$_.txt"
}
```

### Bonus 2: Blob Attributes

Set and retrieve blob attributes:

```sh
# Upload a file
walrus store test-file.txt --epochs 5
# Save the blob object ID from the output

# Set attributes
walrus set-blob-attribute <BLOB_OBJ_ID> --attr "Author" "Your Name" --attr "Purpose" "Testing"

# Get attributes
walrus get-blob-attribute <BLOB_OBJ_ID>

# Remove attributes
walrus remove-blob-attribute-fields <BLOB_OBJ_ID> --keys "Author"
```

### Bonus 3: Consistency Checks

Compare default and strict consistency checks:

**Mac/Linux:**

```sh
BLOB_ID=$(walrus blob-id test-file.txt)

# Default check
time walrus read $BLOB_ID --out default-check.txt

# Strict check
time walrus read $BLOB_ID --out strict-check.txt --strict-consistency-check

# Verify both downloads are identical
diff default-check.txt strict-check.txt
```

**Windows (PowerShell):**

```powershell
$BLOB_ID = walrus blob-id test-file.txt

# Default check
Measure-Command { walrus read $BLOB_ID --out default-check.txt }

# Strict check
Measure-Command { walrus read $BLOB_ID --out strict-check.txt --strict-consistency-check }

# Verify both downloads are identical
Compare-Object (Get-Content default-check.txt) (Get-Content strict-check.txt)
```

## Key Takeaways

- **Complete workflow**: Upload → verify status → download → verify integrity forms the core usage pattern
- **Deterministic blob IDs**: Same content always produces the same blob ID, enabling verification
- **Debug logging**: `RUST_LOG=walrus=debug` reveals configuration, network requests, and detailed errors
- **Error recovery**: Most failures have clear solutions - read error messages and check system status
- **Verification**: Always compare blob IDs of original and downloaded files to ensure integrity
- **Docker option**: Use the provided Docker setup for consistent, reproducible exercise environments

## Next Steps

- Review any sections where you encountered difficulties
- Explore advanced features like quilts, shared blobs, and blob extension
- Integrate Walrus CLI into your own workflows and scripts
- Refer back to the curriculum sections as needed

For more examples and use cases, see the [examples documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/examples.md) and the [client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md).

**Congratulations on completing the Walrus CLI Developer Curriculum!** 🎉

