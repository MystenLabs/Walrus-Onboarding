# Docker Environment Setup Guide

This guide explains how to run the SDK Upload Relay verification code in a Docker environment, ensuring all students have the same consistent environment.

## Prerequisites

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Available for Windows, macOS, and Linux
   - Start Docker Desktop before running commands

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

## Quick Start

### 1. Set Your Passphrase

**⚠️ IMPORTANT: You need a passphrase to run the tests!**

The passphrase is used to derive your keypair for SDK operations. You have three options:

**Option 1: Using .env file (Recommended)**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your passphrase
# PASSPHRASE=your passphrase here
```

**Option 2: Export as environment variable**
```bash
export PASSPHRASE="your passphrase here"
```

**Option 3: Pass directly to commands**
```bash
PASSPHRASE="your passphrase here" make test
```

### 2. Build the Docker Image

```bash
cd sdk_upload_relay_verification
make build
```

Or manually:
```bash
docker-compose build
```

This will:
- Download the Node.js 20 base image
- Install all npm dependencies
- Set up the verification environment

**First build may take 2-5 minutes** (downloads base images and dependencies).

### 3. Run Tests

**⚠️ Remember to set PASSPHRASE before running tests!**

**Run all tests (with passphrase):**
```bash
# If using .env file:
make test

# If using environment variable:
PASSPHRASE="your passphrase" make test

# If using export:
export PASSPHRASE="your passphrase"
make test
```

**Run specific test (with passphrase):**
```bash
PASSPHRASE="your passphrase" make test-upload        # Basic upload example
make test-download                                    # Basic download (no passphrase needed)
PASSPHRASE="your passphrase" make test-hands-on      # Hands-on lab
PASSPHRASE="your passphrase" make test-integrity     # Integrity checks
```

**Or manually with docker-compose:**
```bash
# Using .env file:
docker-compose run --rm sdk-verification npm test

# Passing directly:
docker-compose run --rm -e PASSPHRASE="your passphrase" sdk-verification npm test
docker-compose run --rm -e PASSPHRASE="your passphrase" sdk-verification npm run test:basic-upload
```

### 4. Interactive Shell

To explore and run commands manually:

```bash
# With passphrase:
PASSPHRASE="your passphrase" make shell
# or
docker-compose run --rm -e PASSPHRASE="your passphrase" sdk-verification /bin/bash
```

Inside the container:
```bash
cd /app
export PASSPHRASE="your passphrase"  # Set if not passed via environment
npm test                    # Run all tests
npm run test:hands-on       # Run specific test
node --version              # Check Node version
npm --version               # Check npm version
```

Exit the shell: `exit`

## Available Commands

| Command | Description | Requires PASSPHRASE? |
|---------|-------------|---------------------|
| `make build` | Build the Docker image | ❌ No |
| `make test` | Run all tests | ✅ Yes |
| `make test-upload` | Run basic upload test | ✅ Yes |
| `make test-download` | Run basic download test | ❌ No |
| `make test-hands-on` | Run hands-on lab | ✅ Yes |
| `make test-integrity` | Run integrity checks | ✅ Yes |
| `make shell` | Open interactive shell | Optional |
| `make run` | Start container interactively | Optional |
| `make clean` | Remove containers and images | ❌ No |
| `make help` | Show all commands | ❌ No |

**Note**: Commands requiring PASSPHRASE can be called like:
```bash
PASSPHRASE="your passphrase" make test
# or set it first:
export PASSPHRASE="your passphrase"
make test
```

## Understanding the Docker Setup

### Dockerfile
- Uses Node.js 20 LTS as base image
- Installs all npm dependencies
- Creates a non-root user for security
- Sets up the working directory

### docker-compose.yml
- Defines the service configuration
- Mounts source code for live editing
- Sets up environment variables
- Configures volumes for persistence

### Container vs Host

- **Host**: Your local machine where you edit files
- **Container**: The isolated Docker environment where code runs

The source code is mounted from your host, so you can edit files locally and they'll be reflected in the container.

## Troubleshooting

### Docker daemon not running
**Error**: `Cannot connect to the Docker daemon`

**Solution**: Start Docker Desktop and wait for it to fully start.

### Port already in use
**Error**: `Port 3000 is already allocated`

**Solution**: Change the port in `docker-compose.yml` or stop the conflicting service.

### Permission denied
**Error**: `Permission denied` when running Docker commands

**Solution**:
- Linux: Add your user to the docker group: `sudo usermod -aG docker $USER`
- macOS/Windows: Usually handled by Docker Desktop

### Build fails
**Error**: Build fails with network errors

**Solution**:
- Check your internet connection
- Try: `docker-compose build --no-cache`
- Ensure Docker Desktop is running

### Container runs but tests fail
This is usually expected - tests may fail due to:
- Network connectivity issues
- Insufficient funds in the test wallet
- Node unavailability on testnet

Check the error messages for specific details.

## Advantages of Docker

1. **Consistency**: Same environment for all students
2. **Isolation**: No conflicts with local Node.js versions
3. **Easy Cleanup**: Remove container and start fresh
4. **Portable**: Works on Windows, macOS, and Linux
5. **Reproducible**: Same results every time

## Why Passphrase is Required

The SDK examples need a keypair to sign transactions and interact with the Sui blockchain. The keypair is derived from your passphrase (mnemonic). This ensures:
- Consistent testing with your funded wallet
- Security (passphrase stays in your control)
- No need to manage private keys directly

**Important Security Notes:**
- ⚠️ Never commit your `.env` file to version control
- ⚠️ Keep your passphrase secure and private
- ⚠️ Only use testnet/test passphrases for this exercise

## Next Steps

Once Docker is working:
1. Set up your passphrase (see Step 1 above)
2. Run `PASSPHRASE="your passphrase" make test` to verify everything works
3. Try `PASSPHRASE="your passphrase" make shell` to explore the environment
4. Run individual tests with `PASSPHRASE="your passphrase" make test-<name>`
5. Edit source code files and run tests to see changes

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

