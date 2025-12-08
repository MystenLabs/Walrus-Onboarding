# Storage Costs Module Docker Environment

Docker environment for storage cost calculation exercises.

## Quick Start

```sh
make build
SUI_WALLET_PATH=~/.sui/sui_config make run
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make run` | Start interactive shell |
| `make single-blob-cost` | Calculate cost for a single blob |
| `make compare-sizes` | Compare costs for different sizes (requires wallet) |
| `make encoding-overhead` | Understand encoding overhead (creates test file) |
| `make clean` | Remove containers and images |

