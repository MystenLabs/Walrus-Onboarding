# Performance Optimization Lab - Source Code

This directory contains the source code for the Performance Optimization hands-on lab.

## Files

- `ts/throughput-tuner.ts` - Main experiment script comparing sequential vs parallel uploads
- `ts/utils.ts` - Utility functions for wallet setup and random data generation
- `package.json` - Node.js dependencies
- `tsconfig.json` - TypeScript configuration

## Running the Lab

### Using Docker (Recommended)

See the `../docker/` directory for Docker-based execution:

```bash
cd ../docker
make build
PASSPHRASE='your testnet passphrase' make run
```

### Local Execution

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the experiment:
   ```bash
   PASSPHRASE='your testnet passphrase' npm start
   ```

## What It Does

The throughput tuner:

1. Generates 5 random blobs (1MB each)
2. Uploads them **sequentially** and measures throughput
3. Uploads them **in parallel** and measures throughput
4. Reports the performance improvement percentage

## Expected Results

Results vary significantly based on network conditions and Testnet load:

- Sequential throughput: ~0.04-0.5 MB/s
- Parallel throughput: ~0.07-2.0 MB/s
- Improvement: 30-400%

> **Note:** The key insight is the *relative* improvement between sequential and parallel, not absolute numbers. Network conditions, geographic location, and Testnet congestion heavily influence results.

## Key Concepts Demonstrated

- **Two parallelism levels**: Your code controls inter-blob parallelism; SDK handles intra-blob (sliver distribution to ~1000 shards)
- **Coin contention**: Single wallet causes conflicts in parallel Sui transactions
- **HTTP 429 handling**: Rate limiting requires exponential backoff
- **Production solution**: Publisher with `--n-clients 8+` uses sub-wallets

## Challenge

Modify `ts/throughput-tuner.ts` to:

1. Increase `TOTAL_BLOBS` to 20
2. Implement concurrency limiting (max 5 simultaneous uploads)
3. Compare results with different concurrency limits (1, 2, 5, 10)
4. Watch for HTTP 429 responses when pushing concurrency too high

Hint: Use a library like `p-limit` for concurrency control.

