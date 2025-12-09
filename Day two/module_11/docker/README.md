# Quilts Module Docker Environment

Docker environment for Quilts hands-on exercises.

## Quick Start

```sh
make build
SUI_WALLET_PATH=~/.sui/sui_config make run
```

## Available Commands (CLI)

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make run` | Start interactive shell |
| `make create-test-files` | Create test files for quilt exercises |
| `make clean` | Remove containers and images |

## TypeScript SDK Exercises

For TypeScript exercises, use the setup in `hands-on-source-code/`:

```sh
cd ../hands-on-source-code
make build
PASSPHRASE='your passphrase' make test
```

