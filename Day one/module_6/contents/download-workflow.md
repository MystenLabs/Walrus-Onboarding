# Download Workflow

This section covers how to download (read) data from Walrus using the CLI. The `walrus read` command retrieves blobs that have been stored on the Walrus network.

## Basic Download Command

The basic syntax for reading a blob is:

```sh
walrus read <BLOB_ID>
```

For example:

```sh
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik
```

By default, the blob data is written to standard output (stdout). You can pipe it to a file or process it directly:

```sh
# Save to a file
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik > output.txt

# Pipe to another command
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik | head -n 100
```

## Specifying Output File

Use the `--out` option to save directly to a file:

```sh
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik --out downloaded-file.pdf
```

This is more convenient than redirecting stdout, especially for binary files.

## Reading from File Reference

If you have the original file, you can derive the blob ID and read it:

```sh
# First, get the blob ID from a file
walrus blob-id original-file.txt

# Then read using that blob ID
walrus read <BLOB_ID> --out downloaded-file.txt
```

## Consistency Checks

Walrus performs integrity checks to ensure the downloaded data matches what was originally stored. There are three consistency check modes:

### Default Consistency Check (v1.37+)

The default check is performant and sufficient for most cases:

```sh
walrus read <BLOB_ID> --out file.txt
```

### Strict Consistency Check

For maximum verification, use the strict check:

```sh
walrus read <BLOB_ID> --out file.txt --strict-consistency-check
```

This performs a more thorough verification but is slower.

### Skip Consistency Check

Only skip consistency checks if you trust the blob writer:

```sh
walrus read <BLOB_ID> --out file.txt --skip-consistency-check
```

**Warning**: Skipping consistency checks should only be used when you know and trust the blob writer.

For detailed information about how consistency checks work and what guarantees they provide, see the [encoding documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/encoding.md#data-integrity-and-consistency). The implementation uses the `ConsistencyCheckType` enum with three variants: `Skip`, `Default`, and `Strict` (see the [encoding common module](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-core/src/encoding/common.rs) for details).

## Using Different RPC Endpoints

You can specify a different Sui RPC node:

```sh
walrus read <BLOB_ID> --out file.txt --rpc-url https://fullnode.mainnet.sui.io:443
```

This is useful if you're experiencing connectivity issues with the default RPC endpoint.

## Understanding Download Behavior

When you run `walrus read`:

1. **Blob lookup**: The CLI queries the Sui blockchain to find the blob's availability certificate
2. **Sliver retrieval**: It contacts storage nodes to retrieve the encoded slivers
3. **Decoding**: The slivers are decoded back into the original blob
4. **Verification**: Consistency checks verify the data integrity
5. **Output**: The blob is written to stdout or the specified output file

For more details on the encoding and decoding process, see the [encoding documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/encoding.md). For additional CLI usage information, see the [client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md#reading-blobs).

## Common Download Scenarios

### Download to a Specific File

```sh
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik --out my-document.pdf
```

### Download and Verify Strictly

```sh
walrus read 057MX9PAaUIQLliItM_khR_cp5jPHzJWf-CuJr1z1ik --out file.txt --strict-consistency-check
```

### Download Using Different RPC

```sh
walrus read <BLOB_ID> --out file.txt --rpc-url https://custom-rpc.example.com
```

### Download and Process Immediately

```sh
walrus read <BLOB_ID> | grep "search term"
```

## Troubleshooting Downloads

### Blob Not Found

If you get an error that the blob doesn't exist:

1. **Verify the blob ID**: Double-check that you're using the correct blob ID
2. **Check blob status**: Use `walrus blob-status --blob-id <BLOB_ID>` to see if the blob is available
3. **Expired blob**: The blob may have expired. Check the end epoch

### Network Errors

If downloads fail due to network issues:

1. **Try a different RPC**: Use `--rpc-url` to specify an alternative Sui RPC endpoint
2. **Check connectivity**: Ensure you can reach Sui RPC nodes and Walrus aggregators
3. **Retry**: Network issues are often transient, try again after a moment

### Consistency Check Failures

If consistency checks fail:

1. **Verify blob ID**: Ensure you're reading the correct blob
2. **Storage node issues**: Some storage nodes may be experiencing problems
3. **Try strict check**: Use `--strict-consistency-check` for more detailed error information

### Debug Logging

Enable debug logging to see detailed download information:

```sh
RUST_LOG=walrus=debug walrus read <BLOB_ID> --out file.txt
```

This shows:
- Which storage nodes are contacted
- Sliver retrieval progress
- Decoding steps
- Consistency check details

## Verifying Downloads

After downloading, you can verify the blob matches the original:

```sh
# Get blob ID of original file
walrus blob-id original-file.txt

# Get blob ID of downloaded file
walrus blob-id downloaded-file.txt

# Compare (they should match)
```

If the blob IDs match, the files are identical.

## Reading Blobs from Quilts

**Note**: The quilt feature is only available in Walrus version v1.29 or higher.

Quilts allow you to retrieve individual blobs (patches) without downloading the entire quilt. The `read-quilt` command supports multiple query methods.

### Reading by Identifiers

Read specific blobs by their identifiers:

```sh
walrus read-quilt --out <DOWNLOAD_DIR> \
  --quilt-id <QUILT_ID> --identifiers file1.pdf file2.pdf
```

The blobs are written to the download directory with the same name as their identifier.

### Reading by Tags

Read all blobs matching a tag:

```sh
walrus read-quilt --out <DOWNLOAD_DIR> \
  --quilt-id <QUILT_ID> --tag author Alice
```

This downloads all blobs with the tag `author=Alice`.

**Note**: Only one tag query is supported at a time.

### Reading by Quilt Patch IDs

Read blobs using their QuiltPatchIds (retrieved from `list-patches-in-quilt`):

```sh
walrus read-quilt --out <DOWNLOAD_DIR> \
  --quilt-patch-ids <PATCH_ID1> <PATCH_ID2>
```

### Reading All Patches

Read all patches from a quilt:

```sh
walrus read-quilt --out <DOWNLOAD_DIR> --quilt-id <QUILT_ID>
```

### Listing Patches in a Quilt

To see all patches in a quilt with their identifiers and QuiltPatchIds:

```sh
walrus list-patches-in-quilt <QUILT_ID>
```

This shows:
- Patch identifiers
- QuiltPatchIds
- Metadata for each patch

**Note**: The `list-patches-in-quilt` command is also available as `resolve-quilt` (alias).

For more information about quilts, see the [Quilt documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md).

## Next Steps

Learn how to inspect stored objects in [Inspect Commands](./inspect-commands.md).

