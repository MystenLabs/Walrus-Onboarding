# Inspect Commands

This section covers the various CLI commands for inspecting and examining objects stored on Walrus. These commands help you understand the status, metadata, and properties of your stored blobs.

## Checking Blob Status

The `blob-status` command tells you whether a blob is stored and its availability period.

### Using Blob ID

```sh
walrus blob-status --blob-id 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik
```

### Using File Path

If you have the original file, you can check its status:

```sh
walrus blob-status --file original-file.txt
```

The CLI will re-encode the file, derive the blob ID, and check its status.

### Timeout Configuration

Control the timeout for status requests to storage nodes:

```sh
walrus blob-status --blob-id <BLOB_ID> --timeout 5s
```

The default timeout is 1 second. Use longer timeouts if you're experiencing slow network conditions.

### Status Output

The command returns:
- **Availability status**: Whether the blob is currently available
- **End epoch**: When the blob expires
- **BlobCertified event**: The Sui event ID that certifies availability (transaction ID + sequence number)

Example output:

```
Blob status:
  Blob ID: 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik
  Status: Available
  End epoch: 15
  Certified event: Transaction 0x1234... Sequence 0
```

## Listing Your Blobs

The `list-blobs` command shows all blob objects owned by your wallet:

```sh
walrus list-blobs
```

This displays:
- **Blob ID**: The content identifier
- **Object ID**: The Sui object ID for this blob instance
- **End epoch**: Expiration epoch
- **Deletable status**: Whether the blob can be deleted

### Including Expired Blobs

To also see expired blobs:

```sh
walrus list-blobs --include-expired
```

This is useful for cleaning up old blob objects.

## Getting Blob ID from File

The `blob-id` command computes the blob ID for any file:

```sh
walrus blob-id my-file.txt
```

Output:

```
Blob ID: 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik
```

This is useful for:
- Verifying file integrity
- Finding the blob ID before uploading
- Comparing files (same content = same blob ID)

### Specifying Number of Shards

By default, the blob ID is computed using the number of shards from the chain. You can override this:

```sh
walrus blob-id my-file.txt --n-shards 1000
```

This is useful for testing or when you want to compute a blob ID for a different shard configuration.

## Converting Blob ID Formats

Some Sui explorers display blob IDs as decimal numbers. Convert them to the base64 format used by the CLI:

```sh
walrus convert-blob-id 1234567890123456789012345678901234567890
```

This converts the decimal representation to the URL-safe base64 format.

**Note**: The CLI automatically detects when you provide a decimal blob ID and will show a helpful error message with the correct base64 format. However, using `convert-blob-id` is more convenient when you know you have a decimal value.

## System Information

The `info` command provides comprehensive information about the Walrus system:

```sh
walrus info
```

This shows:
- **Current epoch**: The current epoch number and timing
- **Storage nodes**: Number of nodes and shards
- **Blob size limits**: Maximum blob size and storage unit size
- **Storage prices**: Cost per storage unit and write operations
- **Epoch duration**: How long each epoch lasts

### Detailed System Information

For more detailed information:

```sh
walrus info all
```

This includes:
- Encoding parameters
- BFT system information
- Storage node details (current and next committee)
- Node IDs, stake distribution, and shard assignments

### Specific Information Subcommands

You can query specific aspects of the system:

```sh
# Epoch information only
walrus info epoch

# Storage node information
walrus info storage

# Size limits and storage unit information
walrus info size

# Storage prices and costs
walrus info price

# Byzantine fault tolerance (BFT) system details
walrus info bft

# Committee information (with sorting options)
walrus info committee
```

The `info committee` subcommand supports sorting:

```sh
# Sort by node ID
walrus info committee --sort-by id

# Sort by node name (default)
walrus info committee --sort-by name

# Sort by node URL
walrus info committee --sort-by url

# Sort in descending order
walrus info committee --sort-by name --desc
```

When no subcommand is provided, `walrus info` prints epoch, storage, size, and price information by default.

## Health Checks

Check the health of storage nodes:

```sh
# Check all current committee members
walrus health --committee

# Check specific nodes by ID
walrus health --node-ids <NODE_ID1> <NODE_ID2>

# Check specific nodes by URL
walrus health --node-urls https://node1.example.com https://node2.example.com

# Check all nodes in the active set
walrus health --active-set
```

**Note**: Only one of `--node-ids`, `--node-urls`, `--committee`, or `--active-set` can be specified.

### Detailed Health Information

Get detailed health information:

```sh
walrus health --committee --detail
```

This provides more comprehensive information about each node's status.

### Sorting Health Results

Sort health check results:

```sh
# Sort by status (default)
walrus health --committee --sort-by status

# Sort by node ID
walrus health --committee --sort-by id

# Sort by node name
walrus health --committee --sort-by name

# Sort by node URL
walrus health --committee --sort-by url

# Sort in descending order
walrus health --committee --sort-by status --desc
```

### Concurrent Requests

Control the number of concurrent requests sent to storage nodes:

```sh
walrus health --committee --concurrent-requests 100
```

The default is 60 concurrent requests. Increase this for faster health checks, or decrease it if you're experiencing rate limiting.

## Blob Attributes

Blobs can have custom attributes (key-value pairs). View them:

```sh
walrus get-blob-attribute <BLOB_OBJ_ID>
```

Set attributes:

```sh
walrus set-blob-attribute <BLOB_OBJ_ID> --attr "Content-Type" "image/png" --attr "Author" "Alice"
```

Remove specific attributes:

```sh
walrus remove-blob-attribute-fields <BLOB_OBJ_ID> --keys "Content-Type,Author"
```

Remove all attributes:

```sh
walrus remove-blob-attribute <BLOB_OBJ_ID>
```

**Note**: Attributes are associated with blob object IDs, not blob IDs. Different blob objects for the same blob content can have different attributes.

## Common Inspection Workflows

### Check if a File is Already Stored

```sh
# Get blob ID
walrus blob-id my-file.txt

# Check status
walrus blob-status --file my-file.txt
```

### List All Your Blobs

```sh
walrus list-blobs
```

### Verify Downloaded File Matches Original

```sh
# Get blob IDs
walrus blob-id original.txt
walrus blob-id downloaded.txt

# Compare (should be identical)
```

### Check System Health Before Upload

```sh
# Check system info
walrus info

# Check storage node health
walrus health --committee
```

### Find Blob Object ID from Blob ID

If you have a blob ID but need the object ID:

```sh
# List your blobs and find the matching blob ID
walrus list-blobs | grep <BLOB_ID>
```

For more detailed information about inspection commands and additional CLI features, see the [client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md).

## Key Takeaways

- **`blob-status`** checks availability and expiration of blobs by ID or file
- **`list-blobs`** shows all blob objects owned by your wallet, including expired ones with `--include-expired`
- **`blob-id`** computes the deterministic blob ID from any file - useful for verification and lookup
- **`info`** provides system information: epoch, storage prices, node counts, and limits
- **`health`** checks storage node status - essential for troubleshooting and planning operations
- Blob attributes (key-value pairs) can be set, retrieved, and removed per blob object

## Next Steps

Learn about common errors and how to handle them in [Common Errors](./06-common-errors.md).

