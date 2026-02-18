# Install CLI

This section covers installing the Walrus CLI tool on your system. The Walrus CLI is a command-line interface that allows you to interact with the Walrus decentralized storage system.

## Prerequisites

Before installing the Walrus CLI, you need:

1. **A Sui wallet** - The CLI requires a Sui wallet to interact with the blockchain. You can either:
   - Use an existing Sui wallet configured via the Sui CLI
   - Generate a new wallet using `walrus generate-sui-wallet` (after installing Walrus)

2. **SUI and WAL tokens** - You'll need SUI for gas fees and WAL tokens for storage costs. See the [Setup guide](https://docs.wal.app/docs/usage/setup.md#prerequisites) for details on obtaining tokens.

3. **Network access** - The CLI needs to connect to Sui RPC nodes and Walrus aggregators.

## Installation Methods

### Quick Install (Recommended)

The easiest way to install Walrus is using the official install script:

**Mac/Linux:**

```sh
# Install for Mainnet
curl -sSf https://install.wal.app | sh

# Install for Testnet
curl -sSf https://install.wal.app | sh -s -- -n testnet

# Update an existing installation
curl -sSf https://install.wal.app | sh -s -- -f
```

This script downloads the appropriate binary for your system and installs it to `~/.local/bin`. Make sure this directory is in your `$PATH`.

**Windows (PowerShell):**

```powershell
# Install for Mainnet
iwr https://install.wal.app/install.ps1 -useb | iex

# Install for Testnet
$env:WALRUS_NETWORK = "testnet"; iwr https://install.wal.app/install.ps1 -useb | iex

# Update an existing installation
$env:WALRUS_FORCE = "true"; iwr https://install.wal.app/install.ps1 -useb | iex
```

The Windows script installs to `$env:LOCALAPPDATA\walrus`. Make sure to add this directory to your `Path` environment variable.

> **Note**: If the PowerShell install script is not available, download the Windows binary directly from the [GitHub releases page](https://github.com/MystenLabs/walrus/releases) and add it to your PATH manually.

### Verify Installation

After installation, verify that the CLI is working:

```sh
walrus --version
walrus --help
```

You should see version information and a list of available commands.

### Install via suiup (Alternative)

If you use `suiup` to manage Sui ecosystem tools, you can install Walrus through it:

```sh
suiup install walrus@mainnet   # Install latest mainnet release
suiup install walrus@testnet   # Install latest testnet release
suiup install walrus@mainnet-v1.36.1  # Install specific version
```

### Install via Cargo

For developers who want to build from source:

```sh
cargo install --git https://github.com/MystenLabs/walrus --branch mainnet walrus-service --locked
```

Replace `--branch mainnet` with `--tag mainnet-vx.xx.xx` for a specific version, or `--branch testnet` for Testnet.

### Manual Download

You can also download binaries directly:

**Linux (Ubuntu x86_64):**
- **Mainnet**: <https://bin.wal.app/walrus-mainnet-latest-ubuntu-x86_64>
- **Testnet**: <https://bin.wal.app/walrus-testnet-latest-ubuntu-x86_64>

**macOS (Apple Silicon):**
- **Mainnet**: <https://bin.wal.app/walrus-mainnet-latest-macos-arm64>
- **Testnet**: <https://bin.wal.app/walrus-testnet-latest-macos-arm64>

**macOS (Intel):**
- **Mainnet**: <https://bin.wal.app/walrus-mainnet-latest-macos-x86_64>
- **Testnet**: <https://bin.wal.app/walrus-testnet-latest-macos-x86_64>

**Windows:**
- **Mainnet**: <https://bin.wal.app/walrus-mainnet-latest-windows-x86_64.exe>
- **Testnet**: <https://bin.wal.app/walrus-testnet-latest-windows-x86_64.exe>

Or find all releases on [GitHub](https://github.com/MystenLabs/walrus/releases).

After downloading, make sure the binary is executable and in your PATH:

**Mac/Linux:**

```sh
chmod +x walrus-mainnet-latest-*
mv walrus-mainnet-latest-* ~/.local/bin/walrus
```

**Windows (PowerShell):**

```powershell
# Move to a directory in your PATH, or add the download location to PATH
Move-Item walrus-mainnet-latest-windows-x86_64.exe "$env:LOCALAPPDATA\walrus\walrus.exe"
# Add to PATH (run once, or add permanently via System Properties)
$env:PATH += ";$env:LOCALAPPDATA\walrus"
```

## Key Takeaways

- Multiple installation methods are available: install script (recommended), suiup, Cargo, or manual download
- Mainnet and Testnet use different binaries - choose the appropriate one for your use case
- Always verify installation with `walrus --version` and `walrus --help` before proceeding
- The install script places the binary in `~/.local/bin` (Mac/Linux) or `$env:LOCALAPPDATA\walrus` (Windows)
- Keep the CLI updated to get bug fixes, performance improvements, and new features

## Next Steps

After installing the CLI, you need to configure it to connect to Walrus networks. See the [Configuration](./02-configuration.md) section for detailed instructions on:

- Setting up your configuration file
- Configuring multiple network contexts
- Wallet and RPC settings
- Advanced configuration options

For more detailed installation instructions and alternative installation methods, see the [Setup guide](https://docs.wal.app/docs/usage/setup.md#installation). Once configured, proceed to [Upload Workflow](./03-upload-workflow.md) to learn how to store data on Walrus.

