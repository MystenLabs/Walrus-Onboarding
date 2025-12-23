# Upload Transaction Lifecycle Module Docker Environment

Docker environment for tracing the upload transaction lifecycle with detailed debug logging.

## Prerequisites

- Docker and Docker Compose installed
- A funded Sui wallet at `~/.sui/sui_config/` (with testnet SUI and WAL tokens)

## Quick Start

```sh
# Build the Docker image
make build

# Run the full lifecycle trace (auto-uploads a test file)
SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle
```

> **Note**: The entrypoint script automatically patches your Sui wallet configuration to work inside the container. Your original wallet files are mounted read-only and are not modified.

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make run` | Start interactive shell with debug logging |
| `make trace-lifecycle` | Upload a test file and trace the full lifecycle |
| `make grep-logs` | Search saved logs for lifecycle stage patterns |
| `make analyze-logs` | Show log patterns reference guide |
| `make clean` | Remove containers and images |

## Log Patterns

The trace will show logs for each lifecycle stage:

1. **Chunk Creation**: `starting to encode blob with metadata`
2. **Registration**: `starting to register blobs`
3. **Sealing**: `sliver upload completed on node`, `finished storing slivers`
4. **Proof Creation**: `retrieving confirmation`, `ThresholdReached`
5. **Certification**: `obtained blob certificate`, `finished certifying`

## Troubleshooting

**"ERROR: SUI_WALLET_PATH is not set!"**
- You must specify your wallet path when running commands:
  ```sh
  SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle
  ```

**"No managed addresses" or wallet errors:**
- Ensure your Sui wallet has funds: `sui client gas`
- Make sure WAL tokens are available for storage payment
- Verify your wallet contains `client.yaml` and `sui.keystore`
