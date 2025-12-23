# SDK Upload Relay Module Docker Environment

Docker environment for SDK Upload Relay hands-on exercises.

## Quick Start

```sh
# Build the Docker image
make build

# Run all tests (requires passphrase)
PASSPHRASE='your passphrase here' make test
```

## Available Commands

| Command | Description | Requires PASSPHRASE? |
|---------|-------------|---------------------|
| `make build` | Build the Docker image | ❌ No |
| `make test` | Run all tests | ✅ Yes |
| `make test-upload` | Run basic upload test | ✅ Yes |
| `make test-download` | Run basic download test (uploads first if no blob ID) | ✅ Yes (if no BLOB_ID) |
| `make test-hands-on` | Run hands-on lab | ✅ Yes |
| `make test-integrity` | Run integrity checks | ✅ Yes |
| `make test-retry` | Run retry patterns test | ✅ Yes |
| `make test-partial-failures` | Run partial failures test | ✅ Yes |
| `make shell` | Open interactive shell | Optional |
| `make clean` | Remove containers and images | ❌ No |

## Setting Your Passphrase

**⚠️ You need a passphrase to run most tests!**

The passphrase is used to derive your keypair for SDK operations.

**Option 1: Pass directly to commands**
```sh
PASSPHRASE='your passphrase here' make test
```

**Option 2: Export as environment variable**
```sh
export PASSPHRASE='your passphrase here'
make test
```

## TypeScript Source Code

For the TypeScript exercises source code, see `../hands-on-source-code/`:

```sh
cd ../hands-on-source-code
npm install
npm test
```

## Understanding the Setup

### Directory Structure

```
module_7/
├── docker/                    # Docker environment (this folder)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Makefile
│   └── README.md
└── hands-on-source-code/      # TypeScript source code
    ├── src/
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

### How It Works

- **Dockerfile**: Builds a Node.js 20 environment with all dependencies
- **docker-compose.yml**: Mounts source code from `../hands-on-source-code`
- **Makefile**: Provides convenient commands for building and testing

Source code is mounted from your host, so you can edit files locally and they'll be reflected in the container.

## Troubleshooting

### Docker daemon not running
**Error**: `Cannot connect to the Docker daemon`  
**Solution**: Start Docker Desktop and wait for it to fully start.

### Build fails
**Error**: Build fails with network errors  
**Solution**:
- Check your internet connection
- Try: `docker-compose build --no-cache`

### Tests fail
This may be expected due to:
- Network connectivity issues
- Insufficient funds in the test wallet
- Node unavailability on testnet

Check the error messages for specific details.

## Security Notes

- ⚠️ Never commit your passphrase to version control
- ⚠️ Keep your passphrase secure and private
- ⚠️ Only use testnet passphrases for this exercise

