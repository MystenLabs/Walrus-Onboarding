# Lesson 1: Setup and Installation

## Learning Objectives

- Install the Walrus binary
- Configure Walrus for Testnet
- Verify installation works

---

## Installation

### Install Walrus

Choose one method:

**Option 1: Installation Script (Recommended)**

```bash
# For Testnet
curl -sSf https://install.wal.app | sh -s -- -n testnet

# Or using suiup
suiup install walrus@testnet
```

**Option 2: Binary Download**

Download from [GitHub releases](https://github.com/MystenLabs/walrus/releases)

---

## Configuration

### Download Config File

```bash
curl --create-dirs https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
```

---

## Wallet Setup (For Publisher)

Publishers need SUI and WAL tokens.

### Setup Wallet

```bash
# Check Sui CLI
sui --version

# Create or import wallet
sui client new-address ed25519

# Get Testnet tokens
# SUI: https://faucet.testnet.sui.io/
# WAL (swap testnet SUI for WAL at 1:1 rate)
walrus get-wal

# Check balance
sui client gas
```

---

## Verify Installation

```bash
# Check version
walrus --version

# View help
walrus --help
```

**Expected**: Version info and command list displayed

---

## Key Takeaways

✅ Install with `curl -sSf https://install.wal.app | sh -s -- -n testnet`

✅ Config file at `~/.config/walrus/client_config.yaml`

✅ Publishers need funded wallet; aggregators don't

---

**Next**: [Lesson 2: Publisher Operations](./02-publisher-operations.md)
