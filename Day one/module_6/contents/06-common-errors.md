# Common Errors

This section covers common errors you may encounter when using the Walrus CLI and how to resolve them. The errors listed here are based on actual error messages from the Walrus CLI source code, making it easier to identify and resolve issues when they occur.

## Configuration Errors

### "could not find a valid Walrus configuration file"

**Source**: `crates/walrus-sdk/src/config.rs:80`

**Cause**: The CLI can't find a configuration file in any of the default locations.

**Solution**:
1. Create the directory if it doesn't exist:
   ```sh
   mkdir -p ~/.config/walrus
   ```
2. Download the configuration:
   ```sh
   curl https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
   ```
3. Or specify a custom path:
   ```sh
   walrus info --config /path/to/client_config.yaml
   ```

### "unable to parse the client config file"

**Source**: `crates/walrus-sdk/src/config.rs:170-175`

**Full message**: "unable to parse the client config file: [config_filename='{path}', error='{error}']

see https://docs.wal.app/usage/setup.html#configuration for the correct format"

**Cause**: The configuration file has invalid syntax, missing required fields, or cannot be parsed as valid YAML.

**Solution**:
1. Validate YAML syntax
2. Ensure `system_object` and `staking_object` are present
3. Check for typos in field names
4. Download a fresh configuration file:
   ```sh
   curl https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
   ```

**Note**: This error is shown when the config file exists but cannot be parsed. If the config file doesn't exist at all, you'll see "could not find a valid Walrus configuration file" instead.

## Storage Errors

### "there is enough balance to cover the requested amount of type {0}, but cannot be achieved with less than the maximum number of coins allowed"

**Source**: `crates/walrus-sui/src/client.rs:189-193`

**Cause**: You have enough balance but it's spread across too many coins.

**Solution**: Merge your coins in the wallet and retry the operation.

### Consistency Check Failure

**Cause**: The downloaded data doesn't match what was originally stored (rare, indicates corruption or attack).

**Solution**:
1. Retry the download (may be transient)
2. Use strict consistency check for more details:
   ```sh
   walrus read <BLOB_ID> --strict-consistency-check
   ```
3. If it persists, contact the blob owner or report the issue

## Validation and Input Errors

### "deletable blobs cannot be shared"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:721, 1006`

**Cause**: Trying to share a deletable blob. Only permanent blobs can be shared.

**Solution**: Create the blob as permanent (`--permanent`) if you want to share it, or convert it to permanent before sharing.

### "either epochs or earliest_expiry_time or end_epoch must be provided"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2122`

**Cause**: No storage duration was specified when storing a blob.

**Solution**: Provide one of `--epochs`, `--earliest-expiry-time`, or `--end-epoch` when storing.

### "expiry time is too far in the future"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2108`

**Cause**: The specified expiry time exceeds the maximum allowed duration.

**Solution**: Use a shorter duration or check the maximum epochs allowed with `walrus info`.

### "invalid epoch count; please a number >0 or `max`"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1760`

**Cause**: Invalid value provided for `--epochs` flag.

**Solution**: Provide a positive integer or `max` for the `--epochs` flag.

### "either the file or blob ID must be defined"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1277`

**Cause**: A command requiring a blob identifier was called without providing one.

**Solution**: Provide either `--file` or `--blob-id` option.

### "cannot provide both paths and blob_inputs"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:1245`

**Cause**: Both `--paths` and `--blobs` options were provided to `store-quilt`.

**Solution**: Use either `--paths` or `--blobs`, not both.

### "either paths or blob_inputs must be provided"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:1274`

**Cause**: No input was provided to `store-quilt`.

**Solution**: Provide either `--paths` or `--blobs` option.

### "exactly one of `address` or `object` must be set"

**Source**: `crates/walrus-service/src/client/cli/args.rs:813`

**Cause**: A command requires either an address or object ID, but both or neither were provided.

**Solution**: Provide exactly one of the required options.

### "exactly one of `epochs`, `earliest-expiry-time`, or `end-epoch` must be specified"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1821`

**Cause**: Multiple storage duration options were provided when storing a blob. Only one duration option can be used at a time.

**Solution**: Provide exactly one of `--epochs`, `--earliest-expiry-time`, or `--end-epoch` when storing.

### "end_epoch must be greater than the current epoch"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:1366, 2117`

**Cause**: The `--end-epoch` value provided is not greater than the current epoch.

**Solution**: Provide an `--end-epoch` value that is greater than the current epoch. Check the current epoch with `walrus info epoch`.

### "earliest_expiry_time must be greater than the current epoch start time and the current time"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2101`

**Cause**: The `--earliest-expiry-time` value provided is not greater than both the current epoch start time and the current time.

**Solution**: Provide an `--earliest-expiry-time` value that is in the future relative to both the current epoch start and current time.

### "blobs can only be stored for up to {max_epochs} epochs ahead; {requested} epochs were requested"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:1774, 2130`

**Cause**: The requested storage duration exceeds the maximum allowed epochs ahead.

**Solution**: Reduce the number of epochs or use `max` to store for the maximum allowed duration. Check the maximum with `walrus info`.

### "no files, blob IDs, or object IDs specified"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1580`

**Cause**: A command requiring blob identifiers (like `delete` or `burn-blobs`) was called without providing any identifiers.

**Solution**: Provide at least one of `--files`, `--blob-id`, or `--object-id` options.

### "exactly one of `objectIds`, `all`, or `allExpired` must be specified"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1627`

**Cause**: Multiple or no selection options were provided to `burn-blobs`. Only one selection method can be used.

**Solution**: Provide exactly one of `--object-ids`, `--all`, or `--all-expired` when burning blobs.

### "exactly one of `nodeId`, `nodeUrl`, `committee`, or `activeSet` must be specified"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1675`

**Cause**: Multiple or no node selection options were provided to a command that requires node selection (like `health`). Only one selection method can be used.

**Solution**: Provide exactly one of `--node-id`, `--node-url`, `--committee`, or `--active-set` when selecting nodes.

### "node URL {url} not found in active set; try to query it by node ID"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1698-1700`

**Cause**: The provided node URL doesn't match any node in the active set.

**Solution**: Verify the node URL is correct, or use `--node-id` instead to query by node ID.

### "Exactly one query pattern must be specified. Valid query patterns are: ..."

**Source**: `crates/walrus-service/src/client/cli/args.rs:1418-1425`

**Full message**: "Exactly one query pattern must be specified. Valid query patterns are:\n- quiltId + identifiers: {\"quiltId\": \"<ID>\", \"identifiers\": [\"<IDENTIFIER>\", ...]}\n- quiltId + tag: {\"quiltId\": \"<ID>\", \"tag\": [\"<KEY>\", \"<VALUE>\"]}\n- quiltPatchIds: {\"quiltPatchIds\": [\"<PATCH_ID>\", ...]}\n- quiltId only: {\"quiltId\": \"<ID>\"}"

**Cause**: Invalid combination of query options provided to `read-quilt` or `list-patches-in-quilt`. Multiple query patterns were specified or none were specified.

**Solution**: Use exactly one of the valid query patterns:
- `--quilt-id` with `--identifiers`
- `--quilt-id` with `--tag`
- `--quilt-patch-ids` alone
- `--quilt-id` alone

### "unrecognised trace exporter '{value}'"

**Source**: `crates/walrus-service/src/client/cli/args.rs:1734`

**Cause**: Invalid value provided for `--trace-cli` flag. Only `otlp` or `file=path` are supported.

**Solution**: Use either `--trace-cli otlp` or `--trace-cli file=/path/to/file` format.

### "The object ID of an exchange object must be specified either in the config file or as a command-line argument"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:1754-1758`

**Cause**: The `get-wal` command requires an exchange object ID, but none was provided in the config file or as a command-line argument. This command is only available on Testnet.

**Solution**: Either specify the exchange object ID:
```sh
walrus get-wal --exchange-id <EXCHANGE_OBJECT_ID>
```
Or ensure your configuration file includes exchange objects. Note: This command is only available on Testnet.

### "operation cancelled by user"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2155`

**Cause**: The user declined a confirmation prompt (e.g., for upload relay tip confirmation).

**Solution**: Re-run the command and confirm when prompted, or use appropriate flags to skip confirmation (e.g., `--skip-tip-confirmation` for upload relay).

### "No valid target provided"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2069`

**Cause**: The `delete` command was called without providing any valid blob identifiers (file, blob ID, or object ID).

**Solution**: Provide at least one identifier:
```sh
walrus delete --file <FILE>
walrus delete --blob-id <BLOB_ID>
walrus delete --object-id <OBJECT_ID>
```

### "Failed to get post-deletion status: {error}"

**Source**: `crates/walrus-service/src/client/cli/runner.rs:2041`

**Full message**: "Failed to get post-deletion status: {e}" (where `{e}` contains the actual error details)

**Cause**: After deleting a blob, the CLI couldn't verify the deletion status. This is a non-fatal error - the deletion may have succeeded.

**Solution**: 
1. Check if the blob was actually deleted using `walrus blob-status --blob-id <BLOB_ID>`
2. If deletion failed, retry the delete operation
3. Use `--no-status-check` flag to skip status verification if this error persists

### "Sui RPC url is not specified as a CLI argument or in the client configuration, and no valid Sui wallet was provided"

**Source**: `crates/walrus-service/src/client/cli.rs:152-155`

**Full message**: "Sui RPC url is not specified as a CLI argument or in the client configuration, and no valid Sui wallet was provided ({e})"

**Cause**: The CLI cannot determine which Sui RPC endpoint to use. No RPC URL was provided via `--rpc-url`, the config file doesn't have RPC URLs, and no valid wallet was found. The `({e})` suffix contains details about why the wallet couldn't be loaded.

**Solution**:
1. Specify an RPC URL:
   ```sh
   walrus <command> --rpc-url https://fullnode.mainnet.sui.io:443
   ```
2. Add RPC URLs to your configuration file
3. Ensure your Sui wallet is properly configured

### "you seem to be using a numeric value in decimal format corresponding to a Walrus blob ID"

**Source**: `crates/walrus-service/src/client/cli/cli.rs:415-420`

**Full message**: "you seem to be using a numeric value in decimal format corresponding to a Walrus blob ID (maybe copied from a Sui explorer) whereas Walrus uses URL-safe base64 encoding;\nthe Walrus blob ID corresponding to the provided value is {0}"

**Cause**: A decimal blob ID (often copied from Sui explorer) was provided instead of the base64-encoded format that Walrus uses.

**Solution**: The error message includes the correct blob ID. Use the provided blob ID, or convert it using:
```sh
walrus convert-blob-id <DECIMAL_VALUE>
```

### "the provided blob ID is invalid"

**Source**: `crates/walrus-service/src/client/cli/cli.rs:422`

**Cause**: The provided blob ID string cannot be parsed as either a base64-encoded blob ID or a decimal value.

**Solution**: 
1. Verify the blob ID is correct
2. If you copied from Sui explorer, use `walrus convert-blob-id` to convert it
3. Ensure the blob ID is in URL-safe base64 format (43 characters)

### "cannot connect to Sui RPC nodes at {urls}"

**Source**: `crates/walrus-service/src/client/cli.rs:165-168`

**Full message**: "cannot connect to Sui RPC nodes at {urls}" (where `{urls}` is replaced with the actual comma-separated list of RPC URLs)

**Cause**: The CLI couldn't establish a connection to any of the specified Sui RPC endpoints.

**Solution**:
1. Check your internet connection
2. Verify the RPC URLs are correct
3. Try a different RPC endpoint:
   ```sh
   walrus <command> --rpc-url https://fullnode.mainnet.sui.io:443
   ```
4. Check if the RPC nodes are experiencing downtime

## Debugging Strategies

### Enable Debug Logging

The most powerful tool for debugging is debug logging:

```sh
RUST_LOG=walrus=debug walrus <command> <args>
```

This shows:
- Configuration file and wallet being used
- Network requests and responses
- Storage node interactions
- Detailed error information

### Check System Status

Before troubleshooting, verify the system is operational:

```sh
# Check system info
walrus info

# Check node health
walrus health --committee

# Verify configuration
RUST_LOG=info walrus info
```

### Verify Installation

Ensure you're using the latest CLI:

```sh
walrus --version
which walrus  # Verify which binary is being used
```

### Common Debug Workflow

1. **Enable debug logging**: `RUST_LOG=walrus=debug walrus <command>`
2. **Check system status**: `walrus info` and `walrus health`
3. **Verify configuration**: Ensure config file is up to date
4. **Check network**: Verify connectivity to RPC endpoints
5. **Verify tokens**: Ensure sufficient SUI and WAL balances

## Getting Help

If you encounter an error not covered here:

1. Check the [Troubleshooting guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/troubleshooting.md)
2. Enable debug logging and review the output
3. Check [GitHub Issues](https://github.com/MystenLabs/walrus/issues) for similar problems
4. Verify you're using the latest CLI version
5. Review the [client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md) for additional usage details

## Key Takeaways

- **Configuration errors** often stem from missing files, invalid syntax, or wrong object IDs for the network
- **Input validation errors** provide clear messages about what's wrong - read them carefully
- **Network errors** can often be resolved by trying different RPC endpoints or waiting briefly
- **Debug logging** (`RUST_LOG=walrus=debug`) is your most powerful troubleshooting tool
- Error messages include source code references - use these to understand the exact cause
- Most errors have straightforward solutions documented in this guide

## Next Steps

Learn best practices for avoiding errors in [Operational Habits](./07-operational-habits.md).

