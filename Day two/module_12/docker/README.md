# Failure Handling Module Docker Environment

Docker environment for Failure Handling hands-on exercises.

## Quick Start

```sh
# Build the Docker image
make build

# Run the debug scenario (broken code)
make test

# Run the solution
make solution
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make test` | Run the debug scenario (broken code) |
| `make solution` | Run the solution |
| `make shell` | Open interactive shell |
| `make clean` | Remove containers and images |

## About the Lab

This lab uses mock clients to simulate failure scenarios. No wallet or passphrase is required - the exercises focus on implementing retry patterns and error handling.

**Debug Scenario**: The broken code attempts an upload but doesn't handle failures.

**Your Task**: Implement proper retry logic to handle transient failures.

## TypeScript Source Code

For the TypeScript exercises source code, see `../hands-on-source-code/`:

```sh
cd ../hands-on-source-code
npm install
npm run debug-scenario   # Run broken code
npm run solution         # Run the solution
```

