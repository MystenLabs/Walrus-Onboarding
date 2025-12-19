# Failure Handling - Source Code

This directory contains TypeScript source code for the Failure Handling curriculum module.

## Directory Structure

```
hands-on-source-code/
├── ts/
│   ├── debug-scenario.ts          # Broken code - students fix this
│   └── debug-scenario-solution.ts # Complete solution
├── package.json
├── tsconfig.json
└── README.md
```

## Local Setup

### Prerequisites

- Node.js 20+ installed
- npm installed

### Install Dependencies

```sh
npm install
```

## Environment Setup

Create a `.env` file in this directory with your Sui mnemonic (12/24-word):

```
PASSPHRASE="word1 word2 word3 ..."
```

You’ll need testnet SUI (for gas) and WAL tokens (for storage).

## Running Examples

```sh
# Run the debug scenario (broken code - students fix this)
npm run debug-scenario

# Run the solution
npm run solution

```


## About the Lab

This lab uses the real Walrus SDK against testnet:

- **debug-scenario.ts**: Minimal real SDK code (no retries) — students implement robust retry logic
- **debug-scenario-solution.ts**: Complete solution with proper retry patterns

Notes:
- You need testnet SUI (for gas) and WAL tokens (for storage). Use appropriate faucets or funding sources before running.
- This uses `network: 'testnet'` and the default Sui fullnode URL for testnet.
