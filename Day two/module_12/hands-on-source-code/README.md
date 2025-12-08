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

## Docker Setup (Recommended)

For a consistent Docker-based environment, see the `../docker/` folder:

```sh
cd ../docker
make build
make test       # Run broken code
make solution   # Run the solution
```

## Local Setup

### Prerequisites

- Node.js 20+ installed
- npm installed

### Install Dependencies

```sh
npm install
```

## Running Examples

```sh
# Run the debug scenario (broken code - students fix this)
npm run debug-scenario

# Run the solution
npm run solution
```

## About the Lab

This lab uses mock clients to simulate failure scenarios without needing network access:

- **debug-scenario.ts**: Broken code that doesn't handle failures - students implement retry logic
- **debug-scenario-solution.ts**: Complete solution with proper retry patterns

The mock client simulates transient failures (network errors, 503 errors) before succeeding, demonstrating why retry logic is essential.

