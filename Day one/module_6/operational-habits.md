# Operational Habits

This section covers best practices and good operational habits when using the Walrus CLI. Following these practices will help you avoid errors, optimize costs, and maintain reliable workflows.

## Cost Optimization

### Reuse Storage Resources

The CLI automatically reuses unused storage resources when possible. To maximize this:

- **Don't delete blob objects unnecessarily**: Even if you delete a blob, keeping the blob object allows you to reuse its storage resource
- **Batch uploads**: Store multiple blobs in a single command to potentially reuse resources:
  ```sh
  walrus store file1.txt file2.txt file3.txt --epochs 10
  ```

### Understand Storage Costs

Check current prices before uploading:

```sh
walrus info
```

This shows:
- Price per encoded storage unit per epoch
- Additional write costs
- Maximum blob size

Plan your storage duration accordingly. Storing for fewer epochs when possible can save costs.

For a comprehensive guide to storage costs, cost optimization strategies, and understanding the different sources of cost, see the [costs documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/costs.md).

### Use Appropriate Blob Types

- **Deletable blobs**: Use for temporary data you may want to remove early
- **Permanent blobs**: Use when you need guaranteed availability for the full duration

Remember: Deletable blobs are the default starting with CLI v1.33.

## Error Prevention

### Verify Before Uploading

Check if a blob already exists before uploading:

```sh
walrus blob-status --file my-file.txt
```

If it's already stored for sufficient epochs, you can skip the upload.

### Save Blob IDs

Always save the blob ID returned after uploading:

```sh
walrus store file.txt --epochs 10 > upload-log.txt
```

Or capture it programmatically:

```sh
BLOB_ID=$(walrus store file.txt --epochs 10 | grep "Blob ID" | awk '{print $3}')
echo $BLOB_ID
```

### Verify Downloads

After downloading, verify the blob matches the original:

```sh
# Upload
walrus store original.txt --epochs 10

# Download
walrus read <BLOB_ID> --out downloaded.txt

# Verify
walrus blob-id original.txt
walrus blob-id downloaded.txt
# Compare the outputs - they should match
```

### Use Appropriate Epochs

- **Avoid very short durations**: Blobs expire at the beginning of their end epoch, so `--epochs 1` right before an epoch change may expire almost immediately
- **Plan for maximum duration**: Use `--epochs max` for long-term storage (53 epochs = ~2 years)
- **Consider extension**: You can extend blob lifetimes later if needed

## Monitoring and Maintenance

### Regular Health Checks

Periodically check system health:

```sh
# Weekly or monthly
walrus health --committee
walrus info
```

This helps you:
- Identify issues before they affect your operations
- Understand system changes (new epochs, price changes)
- Verify storage nodes are operational

### Monitor Your Blobs

Regularly list and review your stored blobs:

```sh
# List all blobs
walrus list-blobs

# Include expired ones for cleanup
walrus list-blobs --include-expired
```

This helps you:
- Track storage costs
- Identify blobs approaching expiration
- Clean up expired blob objects

### Check Blob Status Before Critical Operations

Before relying on a blob being available:

```sh
walrus blob-status --blob-id <BLOB_ID>
```

Verify:
- The blob is still available
- It hasn't expired
- The end epoch meets your needs

## Configuration Management

### Keep Configuration Updated

Walrus Testnet resets periodically, and Mainnet may have updates. Keep your configuration current:

```sh
# Download latest config periodically
curl https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
```

### Use Contexts for Multiple Networks

If you work with both Mainnet and Testnet, use contexts:

```sh
# Mainnet operations
walrus info --context mainnet
walrus store file.txt --epochs 10 --context mainnet

# Testnet operations
walrus info --context testnet
walrus store file.txt --epochs 10 --context testnet
```

### Verify Configuration on Startup

When starting a new session, verify your configuration:

```sh
walrus info
```

If this fails, your configuration likely needs updating.

## Logging and Debugging

### Use Appropriate Log Levels

- **Default (info)**: Sufficient for normal operations
- **Debug**: When troubleshooting issues:
  ```sh
  RUST_LOG=walrus=debug walrus <command>
  ```
- **Trace**: For deep debugging (very verbose):
  ```sh
  RUST_LOG=walrus=trace walrus <command>
  ```

### Log Important Operations

For production workflows, log important operations:

```sh
# Log uploads
walrus store important-file.txt --epochs 20 2>&1 | tee upload-$(date +%Y%m%d).log

# Log downloads
walrus read <BLOB_ID> --out file.txt 2>&1 | tee download-$(date +%Y%m%d).log
```

## Security Practices

### Protect Your Wallet

- **Never share your wallet file**: Your Sui wallet controls your blobs and funds
- **Use separate wallets**: Consider using different wallets for different purposes
- **Backup wallet files**: Store backups securely

### Understand Public Nature of Blobs

Remember:
- **All blobs are public**: Anyone with the blob ID can download your blob
- **Don't store secrets**: Never store private keys, passwords, or sensitive data without encryption
- **Delete doesn't guarantee privacy**: Deleted blobs may still be cached or copied by others

### Verify Before Trusting

When downloading blobs from others:
- Use consistency checks (default or strict)
- Verify blob IDs match expected values
- Don't skip consistency checks unless you trust the source

## Workflow Best Practices

### Document Your Workflows

Keep notes on:
- Blob IDs and their purposes
- Storage durations and reasons
- Important blob object IDs (for extension/deletion)
- Any custom scripts or workflows

### Test Before Production

For critical operations:
1. Test on Testnet first
2. Verify with small files
3. Check costs and timing
4. Then proceed with production data

## Version Management

### Keep CLI Updated

Regularly update to the latest CLI version:

```sh
# Check current version
walrus --version

# Update (if using install script)
curl -sSf https://install.wal.app | sh -s -- -f
```

New versions may include:
- Bug fixes
- Performance improvements
- New features
- Security updates

### Verify Binary Location

Ensure you're using the intended binary:

```sh
which walrus
```

If you have multiple installations, this helps identify which one is being used.

## Summary

Good operational habits include:

1. ✅ **Cost optimization**: Reuse resources, understand pricing, choose appropriate blob types
2. ✅ **Error prevention**: Verify before operations, save blob IDs, verify downloads
3. ✅ **Monitoring**: Regular health checks, blob status monitoring, configuration updates
4. ✅ **Security**: Protect wallets, understand public nature, verify downloads
5. ✅ **Workflow**: Use scripts, document processes, test before production
6. ✅ **Maintenance**: Keep CLI and configuration updated, verify installations

For more information on CLI usage and advanced features, see the [client CLI documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md).

Following these practices will help you use Walrus CLI effectively and reliably.

## Next Steps

Put these concepts into practice with [Hands-On Exercises](./hands-on.md).

