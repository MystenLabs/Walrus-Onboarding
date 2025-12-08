# Upload Transaction Lifecycle Module Docker Environment

Docker environment for tracing the upload transaction lifecycle.

## Quick Start

```sh
make build
SUI_WALLET_PATH=~/.sui/sui_config make trace-lifecycle
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make run` | Start shell with debug logging |
| `make trace-lifecycle` | Trace full upload lifecycle |
| `make analyze-logs` | Show log patterns to look for |
| `make clean` | Remove containers and images |

