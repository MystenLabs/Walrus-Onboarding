# Install CLI

This section covers installing the Walrus CLI tool on your system. The Walrus CLI is a command-line interface that allows you to interact with the Walrus decentralized storage system.

## Prerequisites

Before installing the Walrus CLI, you need:

1. **A Sui wallet** - The CLI requires a Sui wallet to interact with the blockchain. You can either:
   - Use an existing Sui wallet configured via the Sui CLI
   - Generate a new wallet using `walrus generate-sui-wallet` (after installing Walrus)

2. **SUI and WAL tokens** - You'll need SUI for gas fees and WAL tokens for storage costs. See the [Setup guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/setup.md#prerequisites) for details on obtaining tokens.

3. **Network access** - The CLI needs to connect to Sui RPC nodes and Walrus aggregators.

## Installation Methods

### Quick Install (Recommended)

The easiest way to install Walrus is using the official install script:

```sh
# Install for Mainnet
curl -sSf https://install.wal.app | sh

# Install for Testnet
curl -sSf https://install.wal.app | sh -s -- -n testnet

# Update an existing installation
curl -sSf https://install.wal.app | sh -s -- -f
```

This script downloads the appropriate binary for your system and installs it to `~/.local/bin`. Make sure this directory is in your `$PATH`.

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

- **Mainnet**: <https://bin.wal.app/walrus-mainnet-latest-ubuntu-x86_64>
- **Testnet**: <https://bin.wal.app/walrus-testnet-latest-ubuntu-x86_64>

Or find all releases on [GitHub](https://github.com/MystenLabs/walrus/releases).

## Next Steps

After installing the CLI, you need to configure it to connect to Walrus networks. See the [Configuration](./configuration.md) section for detailed instructions on:

- Setting up your configuration file
- Configuring multiple network contexts
- Wallet and RPC settings
- Advanced configuration options

For more detailed installation instructions and alternative installation methods, see the [Setup guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/setup.md#installation). Once configured, proceed to [Upload Workflow](./upload-workflow.md) to learn how to store data on Walrus.

