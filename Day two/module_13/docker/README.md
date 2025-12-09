# Performance Optimization Module Docker Environment

Docker environment for the Walrus Performance Optimization hands-on exercises.

## Quick Start

```sh
make build
make run
```

To use your own wallet passphrase:
```sh
PASSPHRASE='your testnet passphrase' make run
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the Docker image |
| `make run` | Run the throughput tuner experiment |
| `make shell` | Start interactive shell for exploration |
| `make clean` | Remove containers and images |

## Prerequisites

- Docker Desktop installed
- Internet access (for Sui testnet and Walrus nodes)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PASSPHRASE` | Your Sui testnet wallet passphrase (optional - uses default if not set) |

## What the Lab Does

The performance lab compares sequential vs concurrent blob uploads:

1. Generates 5 random blobs (1MB each)
2. Uploads them **sequentially** and measures throughput
3. Uploads them **concurrently** (with controlled concurrency) and measures throughput
4. Reports the performance improvement percentage

## Expected Results

Typical results (varies significantly by network conditions):
- Sequential throughput: ~0.04-0.5 MB/s
- Concurrent throughput: ~0.07-2.0 MB/s
- Improvement: 30-400%

> **Note:** Results vary significantly based on network conditions, Testnet load, and geographic location. The key insight is the *relative* improvement, not absolute numbers.

## Key Insights from the Lab

- **Two parallelism levels**: Your code controls inter-blob parallelism; SDK handles intra-blob (sliver distribution to ~1000 shards)
- **Single wallet limitation**: Concurrent transactions with one wallet cause coin contention
- **Production solution**: Use Publisher with multiple sub-wallets (`--n-clients 8` or higher)
- **HTTP 429 awareness**: Watch for rate limiting when pushing concurrency too high
- **Retry logic**: Essential for handling transient blockchain conflicts
- **Concurrency limits**: Prevent overwhelming network and reduce errors

## Verified Working

✅ Tested and verified on: December 2024
- Docker build: Success
- Full execution: Success (5/5 uploads in both scenarios)
- Performance improvement demonstrated
