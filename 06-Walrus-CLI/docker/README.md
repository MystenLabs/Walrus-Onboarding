# CLI Module Docker Environment

Docker environment for the Walrus CLI hands-on exercises.

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
| `make upload-download` | Full upload and download workflow |
| `make inspect` | Inspect objects and system info |
| `make failure-recovery` | Test failure scenarios |
| `make clean` | Remove containers and images |

## Prerequisites

- Docker Desktop installed
- Sui wallet with SUI and WAL tokens (for uploads)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUI_WALLET_PATH` | Path to Sui wallet config directory |
| `RUST_LOG` | Log level (default: info) |

