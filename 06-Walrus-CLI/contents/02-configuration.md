# Configuration

This section covers configuring the Walrus CLI to connect to Walrus networks. Proper
configuration is essential for the CLI to interact with the Walrus system.

## Configuration File Location

The Walrus CLI looks for configuration files in the following locations (in order):

**Mac/Linux:**

1. Current working directory (`./client_config.yaml` or `./client_config.yml`)
2. `$XDG_CONFIG_HOME/walrus/client_config.yaml` (if `XDG_CONFIG_HOME` is set)
3. `~/.config/walrus/client_config.yaml`
4. `~/.walrus/client_config.yaml`

**Windows:**

1. Current working directory (`.\client_config.yaml` or `.\client_config.yml`)
2. `%LOCALAPPDATA%\walrus\client_config.yaml`
3. `%USERPROFILE%\.config\walrus\client_config.yaml`
4. `%USERPROFILE%\.walrus\client_config.yaml`

The CLI accepts both `.yaml` and `.yml` file extensions.

For more details on configuration file structure and advanced options, see the [Setup guide](https://docs.wal.app/docs/usage/setup.md#configuration).

## Quick Start: Download Default Configuration

The easiest way to get started is to download the default configuration:

**Mac/Linux:**

```sh
# For Mainnet
curl https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml

# For Testnet
curl https://docs.wal.app/setup/client_config_testnet.yaml -o ~/.config/walrus/client_config.yaml
```

**Windows (PowerShell):**

```powershell
# Create config directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\walrus"

# For Mainnet
Invoke-WebRequest -Uri "https://docs.wal.app/setup/client_config.yaml" `
  -OutFile "$env:USERPROFILE\.config\walrus\client_config.yaml"

# For Testnet
Invoke-WebRequest -Uri "https://docs.wal.app/setup/client_config_testnet.yaml" `
  -OutFile "$env:USERPROFILE\.config\walrus\client_config.yaml"
```

**Windows (Command Prompt - requires curl):**

```cmd
:: Create config directory
mkdir %USERPROFILE%\.config\walrus

:: For Mainnet
curl https://docs.wal.app/setup/client_config.yaml -o %USERPROFILE%\.config\walrus\client_config.yaml

:: For Testnet
curl https://docs.wal.app/setup/client_config_testnet.yaml -o %USERPROFILE%\.config\walrus\client_config.yaml
```

This gives you a working configuration with all required fields pre-configured.

## Configuration File Structure

### Basic Configuration

A minimal configuration file requires two mandatory fields:

```yaml
# Required: System object ID (specific to each Walrus deployment)
system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2

# Required: Staking object ID (specific to each Walrus deployment)
staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
```

These object IDs are specific to each Walrus deployment (Mainnet vs Testnet) and don't
change over time. For more information about system and staking objects, see the
[developer guide](https://docs.wal.app/docs/dev-guide/sui-struct.md#system-and-staking-information).

### Optional Contract Configuration Fields

Additional contract-related fields can be configured:

```yaml
# Optional: Cache TTL for system and staking objects (in seconds)
# Default: 10 seconds
# Controls how long system and staking objects are cached before being refreshed
cache_ttl_secs: 10

# Optional: Credits object ID (for credit-based operations)
credits_object: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Optional: Walrus subsidies object ID (for subsidy operations)
walrus_subsidies_object: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Exchange Objects

The `exchange_objects` field specifies WAL exchange object IDs used for token exchange operations:

```yaml
# Optional: List of WAL exchange object IDs (defaults to empty list)
# Multiple exchange objects can be specified for redundancy
exchange_objects:
  - 0xa9b00f69d3b033e7b64acff2672b54fbb7c31361954251e235395dea8bd6dcac
  - 0x26a8a417b553b18d13027c23e8016c3466b81e7083225436b55143c127f3c0cb
```

If not specified, defaults to an empty list. Mainnet typically uses an empty list, while
Testnet may have multiple exchange objects configured.

### Multiple Contexts

You can define multiple network contexts in a single configuration file. This is useful if
you work with both Mainnet and Testnet:

```yaml
# Default context (used when --context is not specified)
default_context: mainnet

contexts:
  mainnet:
    system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    rpc_urls:
      - https://fullnode.mainnet.sui.io:443

  testnet:
    system_object: 0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    rpc_urls:
      - https://fullnode.testnet.sui.io:443
```

### Using Contexts

Switch between contexts using the `--context` flag:

```sh
# Use Mainnet context
walrus info --context mainnet
walrus store file.txt --epochs 10 --context mainnet

# Use Testnet context
walrus info --context testnet
walrus store file.txt --epochs 10 --context testnet
```

If you don't specify `--context`, the `default_context` from your configuration is used.

For network-specific parameters and differences between Mainnet and Testnet, see
[Available networks](https://docs.wal.app/docs/usage/networks.md).

## Wallet Configuration

The CLI needs access to your Sui wallet to perform transactions. You can configure the wallet in several ways:

### Generating a New Sui Wallet

If you don't have a Sui wallet, you can generate one using the Walrus CLI:

```sh
# Generate wallet for Mainnet
walrus generate-sui-wallet --sui-network mainnet

# Generate wallet for Testnet
walrus generate-sui-wallet --sui-network testnet

# Generate wallet at a custom path
walrus generate-sui-wallet --path /custom/path/wallet.yaml --sui-network mainnet

# Generate wallet and attempt to get tokens from faucet (Testnet only)
walrus generate-sui-wallet --sui-network testnet --use-faucet
```

The wallet will be created at the default location (`~/.sui/sui_config/client.yaml`) unless you specify a custom path with `--path`.

### Option 1: Use Default Sui Wallet Location

By default, the CLI looks for your Sui wallet at:
1. `./sui_config.yaml` (current directory)
2. `~/.sui/sui_config/client.yaml` (system-wide)

No additional configuration needed if your wallet is in one of these locations.

### Option 2: Specify Wallet in Configuration

You can specify the wallet path in your Walrus configuration:

```yaml
wallet_config:
  # Path to Sui wallet configuration file
  path: ~/.sui/sui_config/client.yaml
  
  # Optional: Override active environment from wallet config
  active_env: mainnet
  
  # Optional: Override active address from wallet config
  active_address: 0x1234567890abcdef...
```

### Option 3: Use --wallet Flag

Override the wallet configuration per command:

```sh
walrus store file.txt --epochs 10 --wallet /path/to/custom/wallet.yaml
```

The `--wallet` flag takes precedence over configuration file settings.

## RPC URLs

The CLI needs Sui RPC endpoints to read blockchain data. You can configure multiple RPC
URLs:

```yaml
rpc_urls:
  - https://fullnode.mainnet.sui.io:443
  - https://sui-mainnet-endpoint.example.com:443
```

If `rpc_urls` is not specified, the CLI uses the RPC URL from your Sui wallet configuration.

You can also override RPC URLs per command:

```sh
walrus read <BLOB_ID> --rpc-url https://custom-rpc.example.com:443
```

## Custom Configuration Path

If you want to use a configuration file in a non-standard location:

```sh
walrus info --config /path/to/custom/config.yaml
walrus store file.txt --epochs 10 --config /path/to/custom/config.yaml
```

This is useful for:
- Testing different configurations
- Using project-specific configurations
- Keeping multiple configuration files for different purposes

## Global CLI Options

### JSON Output

Output commands in JSON format for programmatic use:

```sh
walrus info --json
walrus blob-status --blob-id <BLOB_ID> --json
```

This is useful for scripting and automation.

### Shell Completion

Generate shell completion scripts for your shell:

```sh
# Generate completion script (will prompt for shell type)
walrus completion

# Generate for specific shell
walrus completion --shell bash
walrus completion --shell zsh
walrus completion --shell fish
walrus completion --shell powershell
```

Place the generated script in the appropriate directory:

**Mac/Linux:**
- **bash**: `~/.local/share/bash-completion/completions/walrus` or `/usr/local/etc/bash_completion.d/walrus`
- **zsh**: `~/.zsh/completions/_walrus` or add to `fpath`
- **fish**: `~/.config/fish/completions/walrus.fish`

**Windows (PowerShell):**
Add to your PowerShell profile (`$PROFILE`):

```powershell
# Generate and add to profile
walrus completion --shell powershell >> $PROFILE
```

Or save to a separate file and source it in your profile:

```powershell
walrus completion --shell powershell > "$env:USERPROFILE\Documents\WindowsPowerShell\walrus-completion.ps1"
# Then add to $PROFILE: . "$env:USERPROFILE\Documents\WindowsPowerShell\walrus-completion.ps1"
```

### JSON Mode

Run commands using JSON input (useful for programmatic access):

**Mac/Linux:**

```sh
# Read JSON from stdin
echo '{"command":{"read":{"blobId":"<BLOB_ID>","out":"output.txt"}}}' | walrus json

# Provide JSON as argument
walrus json '{"command":{"info":{}}}'
```

**Windows (PowerShell):**

```powershell
# Read JSON from stdin
'{"command":{"read":{"blobId":"<BLOB_ID>","out":"output.txt"}}}' | walrus json

# Provide JSON as argument
walrus json '{"command":{"info":{}}}'
```

**Windows (Command Prompt):**

```cmd
echo {"command":{"info":{}}} | walrus json
```

In JSON mode, all options use camelCase instead of kebab-case. See the [JSON API documentation](https://docs.wal.app/docs/usage/json-api.md) for details.

## Advanced Configuration Options

For fine-tuning performance and networking behavior, you can configure additional parameters:

### Communication Configuration

These settings control how the CLI communicates with storage nodes:

```yaml
communication_config:
  # Maximum concurrent write operations
  # If null/not specified, defaults to n (number of shards) for optimal write speed
  # Set to a lower value to limit memory usage
  max_concurrent_writes: 10  # or null for auto
  
  # Maximum concurrent sliver reads
  # If null/not specified, defaults to n-2f (where n=shards, f=faulty nodes)
  # This avoids wasted work on storage nodes during reads
  max_concurrent_sliver_reads: 20  # or null for auto
  
  # Maximum concurrent metadata reads
  # Number of nodes contacted in parallel to get blob metadata
  # Default: 3
  max_concurrent_metadata_reads: 3
  
  # Maximum concurrent status reads
  # Number of nodes contacted in parallel to check blob status
  # If null/not specified, defaults to n (all shards)
  # Default: null (uses all shards)
  max_concurrent_status_reads: null  # or specify a number
  
  # Maximum data in flight (bytes)
  # Maximum amount of data associated with concurrent requests
  # Default: 12,500,000 bytes (100 Mbps for 1 second)
  # Controls memory usage and network bandwidth
  max_data_in_flight: 12500000
  
  # HTTP/2 connection settings
  reqwest_config:
    # Total request timeout (milliseconds)
    # Applied from connection start until response body finishes
    # Default: 300000 (5 minutes) - allows for large transfers worldwide
    total_timeout_millis: 300000
    
    # Connection pool idle timeout (milliseconds)
    # Timeout for idle sockets to be kept alive
    # Default: null (connections kept alive indefinitely)
    # Set to a value to close idle connections after specified time
    pool_idle_timeout_millis: null  # or specify milliseconds
    
    # HTTP/2 keep-alive timeout (milliseconds)
    # Timeout for receiving acknowledgement of keep-alive ping
    # Default: 5000 (5 seconds)
    http2_keep_alive_timeout_millis: 5000
    
    # HTTP/2 keep-alive interval (milliseconds)
    # Interval between keep-alive pings
    # Default: 30000 (30 seconds)
    http2_keep_alive_interval_millis: 30000
    
    # HTTP/2 keep-alive while idle
    # Whether to send keep-alive pings on idle connections
    # Default: true
    http2_keep_alive_while_idle: true
  
  # Request rate limiting
  request_rate_config:
    # Maximum connections per storage node
    # Default: 10
    max_node_connections: 10
    
    # Backoff configuration for retries
    backoff_config:
      # Minimum backoff delay (milliseconds)
      min_backoff_millis: 1000
      
      # Maximum backoff delay (milliseconds)
      max_backoff_millis: 30000
      
      # Maximum number of retries
      max_retries: 5
  
  # Disable system proxy usage
  # Set to true to bypass system proxy settings
  # Default: false
  disable_proxy: false
  
  # Disable native certificate validation
  # Set to true to disable OS certificate validation (not recommended for production)
  # Default: false
  disable_native_certs: false
  
  # Sliver write extra time configuration
  # Additional time allowed for sliver writes to ensure more nodes receive them
  # Extra time = (store_time * factor) + base_millis
  sliver_write_extra_time:
    # Multiplication factor for store time
    # Default: 0.5 (50% of store time)
    factor: 0.5
    
    # Base extra time in milliseconds
    # Default: 500 (0.5 seconds)
    base_millis: 500
  
  # Sliver status check threshold (bytes)
  # Below this size, skip status check and directly attempt to store sliver
  # Threshold chosen to ensure direct store takes ~1 RTT (similar to status check latency)
  # Default: 5560 bytes (based on TCP payload size and congestion window)
  sliver_status_check_threshold: 5560
  
  # Enable child process uploads
  # When enabled, slivers are uploaded via detached child process for tail writes
  # Default: false
  child_process_uploads_enabled: false
  
  # Data-in-flight auto-tuning configuration
  # Automatically adjusts write concurrency based on throughput measurements
  # Useful for optimizing performance on different network conditions
  data_in_flight_auto_tune:
    # Enable auto-tuning
    # Default: false
    enabled: false
    
    # Number of completed sliver uploads required per measurement window
    # Default: 20
    window_sample_target: 20
    
    # Maximum time (milliseconds) to gather throughput data for a window
    # Default: 10000 (10 seconds)
    window_timeout_millis: 10000
    
    # Multiplicative factor when searching for higher throughput
    # Default: 2.0
    increase_factor: 2.0
    
    # Factor applied to best-performing permit count when locking result
    # Default: 1.5
    lock_factor: 1.5
    
    # Minimum number of permits auto-tuner will consider
    # Default: 50
    min_permits: 50
    
    # Maximum number of permits auto-tuner will consider
    # Default: 2000
    max_permits: 2000
    
    # Weight for secondary slivers relative to primaries in throughput calculation
    # Default: 0.5
    secondary_weight: 0.5
    
    # Minimum blob size (bytes) required to enable auto-tune
    # Default: 52428800 (50 MB)
    min_blob_size_bytes: 52428800
  
  # Registration delay (milliseconds)
  # Delay before storing data to ensure storage nodes have seen registration event
  # Default: 200 (0.2 seconds)
  registration_delay_millis: 200
  
  # Maximum total blob size (bytes)
  # Maximum combined size allowed when uploading multiple blobs
  # Default: 1073741824 (1 GiB)
  max_total_blob_size: 1073741824
  
  # Committee change backoff configuration
  # Backoff strategy when committee changes are detected
  committee_change_backoff:
    min_backoff_millis: 1000
    max_backoff_millis: 5000
    max_retries: 5
  
  # Sui client request timeout (milliseconds)
  # Request timeout for SuiClient communicating with Sui network
  # If null, uses default timeout from SuiClient
  # Default: null
  sui_client_request_timeout_millis: null  # or specify milliseconds
```

### Committee Refresh Configuration

Controls how often the CLI refreshes committee information from the blockchain:

```yaml
refresh_config:
  # Grace period between refresh requests (seconds)
  # If multiple refreshes are issued within this period, only the first is executed
  # Default: 10 seconds
  refresh_grace_period_secs: 10
  
  # Maximum automatic refresh interval (seconds)
  # Maximum time between automatic cache refreshes
  # Default: 30 seconds
  max_auto_refresh_interval_secs: 30
  
  # Minimum automatic refresh interval (seconds)
  # Minimum time between automatic cache refreshes
  # Default: 5 seconds
  min_auto_refresh_interval_secs: 5
  
  # Epoch change distance threshold (seconds)
  # When within this time of expected epoch change, switches from max to min refresh interval
  # Default: 300 seconds (5 minutes)
  epoch_change_distance_threshold_secs: 300
  
  # Refresher channel size
  # Size of the internal channel for refresh requests
  # Default: 100
  refresher_channel_size: 100
```

### Quilt Client Configuration

Settings for Quilt operations:

```yaml
quilt_client_config:
  max_retrieve_slivers_attempts: 2
  timeout_secs: 10
```

> 💡 **Tip:** Most users don't need to modify these advanced settings. Only adjust them if you're experiencing performance issues or have specific networking requirements. The defaults are optimized for typical use cases.

📖 **Source code:** [SDK configuration module](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-sdk/src/config.rs) - handles loading and validation

## Complete Configuration Example

Here's a complete example configuration file with all available options documented:

```yaml
# Multi-context configuration example
# Default context used when --context is not specified
default_context: mainnet

contexts:
  mainnet:
    # Required: System object ID
    system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2
    
    # Required: Staking object ID
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    
    # Optional: Cache TTL for system/staking objects (seconds)
    cache_ttl_secs: 10
    
    # Optional: Exchange objects (Mainnet typically uses empty list)
    exchange_objects: []
    
    # Optional: Credits object ID
    # credits_object: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
    
    # Optional: Walrus subsidies object ID
    # walrus_subsidies_object: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
    
    # Wallet configuration
    wallet_config:
      # Optional: Path to Sui wallet config file
      # If not specified, uses default locations: ./sui_config.yaml or ~/.sui/sui_config/client.yaml
      # path: ~/.sui/sui_config/client.yaml
      
      # Sui environment to use
      active_env: mainnet
      
      # Optional: Override active address from wallet config
      # active_address: 0x0000000000000000000000000000000000000000000000000000000000000000
    
    # RPC URLs for reading blockchain data
    rpc_urls:
      - https://fullnode.mainnet.sui.io:443
    
    # Communication configuration (all fields optional with sensible defaults)
    communication_config:
      # Concurrency limits (null = auto-calculate based on shards)
      max_concurrent_writes: null  # Auto: defaults to n (number of shards)
      max_concurrent_sliver_reads: null  # Auto: defaults to n-2f
      max_concurrent_metadata_reads: 3
      max_concurrent_status_reads: null  # Auto: defaults to n
      
      # Data limits
      max_data_in_flight: 12500000  # 12.5 MB (100 Mbps for 1 second)
      max_total_blob_size: 1073741824  # 1 GiB
      
      # HTTP/2 connection settings
      reqwest_config:
        total_timeout_millis: 300000  # 5 minutes
        pool_idle_timeout_millis: null  # Keep connections alive
        http2_keep_alive_timeout_millis: 5000  # 5 seconds
        http2_keep_alive_interval_millis: 30000  # 30 seconds
        http2_keep_alive_while_idle: true
      
      # Request rate limiting
      request_rate_config:
        max_node_connections: 10
        backoff_config:
          min_backoff_millis: 1000
          max_backoff_millis: 30000
          max_retries: 5
      
      # Proxy and certificate settings
      disable_proxy: false
      disable_native_certs: false
      
      # Sliver write timing
      sliver_write_extra_time:
        factor: 0.5  # 50% of store time
        base_millis: 500  # Plus 0.5 seconds base
      
      # Status check threshold
      sliver_status_check_threshold: 5560  # bytes
      
      # Advanced features
      child_process_uploads_enabled: false
      
      # Auto-tuning (disabled by default)
      data_in_flight_auto_tune:
        enabled: false
        window_sample_target: 20
        window_timeout_millis: 10000
        increase_factor: 2.0
        lock_factor: 1.5
        min_permits: 50
        max_permits: 2000
        secondary_weight: 0.5
        min_blob_size_bytes: 52428800  # 50 MB
      
      # Timing settings
      registration_delay_millis: 200
      
      # Committee change handling
      committee_change_backoff:
        min_backoff_millis: 1000
        max_backoff_millis: 5000
        max_retries: 5
      
      # Sui client timeout (null = use SuiClient default)
      sui_client_request_timeout_millis: null
    
    # Committee refresh configuration
    refresh_config:
      refresh_grace_period_secs: 10
      max_auto_refresh_interval_secs: 30
      min_auto_refresh_interval_secs: 5
      epoch_change_distance_threshold_secs: 300
      refresher_channel_size: 100
    
    # Quilt client configuration
    quilt_client_config:
      max_retrieve_slivers_attempts: 2
      timeout_secs: 10

  testnet:
    # Testnet configuration
    system_object: 0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    cache_ttl_secs: 10
    
    # Testnet has exchange objects configured for WAL token exchange
    exchange_objects:
      - 0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073
      - 0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862
      - 0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5
      - 0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1
    
    wallet_config:
      active_env: testnet
    
    rpc_urls:
      - https://fullnode.testnet.sui.io:443
    
    # Use defaults for all other settings
    # communication_config, refresh_config, and quilt_client_config
    # will use their default values if not specified
```

### Minimal Configuration Example

For most users, a minimal configuration is sufficient:

```yaml
# Minimal single-context configuration
system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2
staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
rpc_urls:
  - https://fullnode.mainnet.sui.io:443
```

All other fields will use their default values, which are optimized for typical use cases.

## Verifying Configuration

After setting up your configuration, verify it works:

```sh
# Check system information (uses default context)
walrus info

# Check with specific context
walrus info --context mainnet

# Check with custom config file
walrus info --config /path/to/config.yaml
```

If the configuration is correct, you should see:

- Current epoch
- Number of storage nodes
- Maximum blob size
- Storage prices

If you see errors, check:

1. Configuration file syntax (valid YAML)
2. Object IDs match the network you're using
3. RPC URLs are accessible
4. Wallet configuration is correct

## Configuration Troubleshooting

### "Could not find a valid Walrus configuration file"

**Solution**: Ensure your configuration file exists in one of the default locations, or use
`--config` to specify the path.

### "The specified Walrus system object does not exist"

**Solution**:

- Verify you're using the correct object IDs for your network (Mainnet vs Testnet)
- Download the latest configuration from the official docs
- Ensure your Sui wallet is configured for the same network

### Configuration Not Being Used

**Solution**:

**Mac/Linux:**

- Check which configuration file is being used: `RUST_LOG=info walrus info`

**Windows (Command Prompt):**

```cmd
set RUST_LOG=info
walrus info
```

**Windows (PowerShell):**

```powershell
$env:RUST_LOG = "info"
walrus info
```

Also verify:
- You're using the correct `--context` flag
- `default_context` is set if not using `--context`

### Multiple Configuration Files

If you have multiple configuration files, the CLI uses the first one found in the search
order. To use a specific file, use `--config`.

## Best Practices

1. **Keep configurations updated**: Download fresh configurations periodically, especially
   after Testnet resets
2. **Use contexts**: Define multiple contexts in one file rather than maintaining separate
   files
3. **Version control**: Consider keeping configuration files in version control (excluding
   wallet paths with sensitive data)
4. **Test configurations**: Use `walrus info` to verify configurations before performing
   operations
5. **Document custom settings**: If you modify advanced settings, document why for future
   reference

## Key Takeaways

- Configuration files require `system_object` and `staking_object` IDs specific to each network
- Use **contexts** to manage multiple networks (Mainnet/Testnet) in a single configuration file
- Wallet configuration can be automatic (default locations), explicit (config file), or per-command (`--wallet`)
- The CLI searches multiple default locations for configuration files - download official configs to get started quickly
- Advanced settings (communication, refresh, quilt) have sensible defaults; only modify if you have specific requirements

## Next Steps

Once your configuration is set up, proceed to [Upload Workflow](./03-upload-workflow.md) to
learn how to store data on Walrus.
