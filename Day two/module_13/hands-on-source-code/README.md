# Performance Optimization Lab - Source Code

This directory contains the source code for the Performance Optimization hands-on lab.

## Files

- `ts/throughput-tuner.ts` - Main experiment script comparing sequential vs parallel uploads
- `ts/utils.ts` - Utility functions for wallet setup and random data generation
- `package.json` - Node.js dependencies
- `tsconfig.json` - TypeScript configuration

## Running the Lab

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your wallet passphrase (use `.env` or export):
   ```bash
   echo "PASSPHRASE='your testnet passphrase'" > .env
   ```

3. Run the experiment:
   ```bash
   npm start  # defaults: 5 blobs, 128KB each, concurrency=1, wallets=1
   ```

   The script will display configuration at startup:
   ```
   📊 Running with: CONCURRENCY=1, NUM_WALLETS=1
   ```

   **Available npm scripts:**
   ```bash
   npm start          # Default: concurrency=1, wallets=1
   npm run start:c2   # concurrency=2, wallets=2
   npm run start:c3   # concurrency=3, wallets=3
   npm run start:c5   # concurrency=5, wallets=5
   npm run start:w2   # concurrency=1, wallets=2
   npm run start:w3c2 # concurrency=2, wallets=3
   npm run start:w4c5 # concurrency=5, wallets=4
   ```

   Or set environment variables directly:
   ```bash
   CONCURRENCY=2 NUM_WALLETS=2 npm start
   ```
   - `CONCURRENCY` sets parallel uploads (default: 1)
   - `NUM_WALLETS` derives/funds multiple wallets from `PASSPHRASE` to reduce coin contention (default: 1)
   - Derived wallet details are written to `.generated_wallets.env` (address, public key, secret key)

## What It Does

The throughput tuner:

1. Generates 5 random blobs (128KB each)
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
