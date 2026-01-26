# Walrus Architecture Module Docker Environment

Docker environment for understanding Walrus architecture through hands-on exercises.

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
| `make trace-upload` | Trace upload flow with debug logging |
| `make system-info` | Display Walrus system information |
| `make clean` | Remove containers and images |

