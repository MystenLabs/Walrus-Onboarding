# Upload History and Blob Registry

## Key Concepts

- `walrus list-blobs` shows all blob **objects** owned by your wallet — each object has a Blob ID (content hash) and an Object ID (Sui object).
- `walrus blob-status` checks whether a specific blob is currently available and returns its certification event and end epoch.
- **Blob IDs are deterministic and content-addressed**: the same file always produces the same Blob ID. You can compute the ID before uploading with `walrus blob-id`.
- Different Sui objects can reference the same Blob ID (e.g., two wallets that uploaded the same file). Each object can have independent attributes.
- **Blob attributes** (key-value pairs) are attached to blob objects, not to blob IDs — two objects for the same content can have different attributes.
- Format conversion: Sui explorers display blob IDs as decimal numbers; `walrus convert-blob-id` converts them to the base64 URL-safe format used by the CLI.

## CLI Commands

### Blob Status

```bash
# Check availability and expiry by blob ID
walrus blob-status --blob-id 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik

# Check by file path (CLI re-encodes the file to derive the blob ID)
walrus blob-status --file original-file.txt

# Control timeout for slow networks
walrus blob-status --blob-id <BLOB_ID> --timeout 5s
```

Status output:
```text
Blob ID: 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik
Status: Available
End epoch: 15
Certified event: Transaction 0x1234... Sequence 0
```

### Blob Listing

```bash
# List all blob objects in your wallet
walrus list-blobs

# Include expired blobs
walrus list-blobs --include-expired
```

### Blob ID Derivation

```bash
# Compute blob ID from file (without uploading)
walrus blob-id my-file.txt

# Override shard count (for non-default configurations)
walrus blob-id my-file.txt --n-shards 1000

# Convert decimal blob ID (from explorer) to base64 URL-safe format
walrus convert-blob-id 1234567890123456789012345678901234567890
```

### Blob Attributes

```bash
# View attributes on a blob object
walrus get-blob-attribute <BLOB_OBJ_ID>

# Set attributes
walrus set-blob-attribute <BLOB_OBJ_ID> --attr "Content-Type" "image/png" --attr "Author" "Alice"

# Remove specific attribute keys (space-separated, not comma-separated)
walrus remove-blob-attribute-fields <BLOB_OBJ_ID> --keys "Content-Type" "Author"

# Remove all attributes
walrus remove-blob-attribute <BLOB_OBJ_ID>
```

### System Information

```bash
# Summary: epoch, prices, size limits, node count
walrus info

# Specific subsections
walrus info epoch    # Current epoch timing
walrus info size     # Max blob size, storage unit size
walrus info price    # WAL price per storage unit / write unit
walrus info storage  # Storage node information
walrus info bft      # Byzantine fault tolerance details
walrus info committee --sort-by name
walrus info all      # Everything including node IDs and shard assignments
```

### Node Health

```bash
walrus health --committee           # Check all current committee nodes
walrus health --committee --detail  # Detailed status per node
walrus health --active-set          # All nodes in the active set
```

### Common Workflows

```bash
# Check if a file is already stored before uploading
walrus blob-status --file my-file.txt

# Find the Object ID for a blob you own (needed for extend/delete)
walrus list-blobs | grep <BLOB_ID>

# Verify downloaded file matches the original
walrus blob-id original.txt
walrus blob-id downloaded.txt
# If blob IDs match, files are identical
```

## Source Files

- `06-Walrus-CLI/contents/05-inspect-commands.md`
