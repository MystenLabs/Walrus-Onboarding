# Walrus CLI Developer Curriculum

Welcome to the Walrus CLI Developer Curriculum! This curriculum is designed to help developers learn how to effectively use the Walrus command-line interface to upload, download, and manage data on the Walrus decentralized storage system.

## Learning Objectives

By the end of this curriculum, you will be able to:

1. **Use the CLI to upload and download data** - Successfully store blobs on Walrus and retrieve them using command-line tools
2. **Inspect objects** - Query blob status, list owned blobs, and examine blob metadata
3. **Debug CLI level failures** - Identify and resolve common errors and issues when using the CLI

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[Install CLI](./install.md)** - Set up the Walrus CLI tool on your system
   - Prerequisites
   - Installation methods
   - Basic setup

2. **[Configuration](./configuration.md)** - Configure the CLI to connect to Walrus networks
   - Configuration file structure
   - Multiple contexts (Mainnet/Testnet)
   - Wallet configuration and generation
   - Advanced settings
   - Global CLI options (JSON output, completion, JSON mode)

3. **[Upload Workflow](./upload-workflow.md)** - Understanding how to store data on Walrus
   - Basic upload commands
   - Storage duration options
   - Blob types (deletable vs permanent)
   - Batch operations
   - Quilt storage (batch storage for small blobs)
   - Blob lifecycle management (extend, share, delete, burn)

4. **[Download Workflow](./download-workflow.md)** - Understanding how to retrieve data from Walrus
   - Reading blobs
   - Output options
   - Consistency checks
   - Reading from quilts

5. **[Inspect Commands](./inspect-commands.md)** - Tools for examining stored objects
   - Checking blob status
   - Listing owned blobs
   - Blob ID utilities
   - System information (info subcommands)
   - Health checks with advanced options

6. **[Common Errors](./common-errors.md)** - Troubleshooting CLI failures
   - Configuration errors
   - Network issues
   - Storage errors
   - Recovery strategies

7. **[Operational Habits](./operational-habits.md)** - Best practices for CLI usage
   - Cost optimization
   - Error prevention
   - Monitoring and maintenance

8. **[Hands-On Exercises](./hands-on.md)** - Practical exercises
   - Full upload and download workflow
   - Inspecting stored objects
   - Triggering and recovering from failures

## Prerequisites

Before starting this curriculum, you should have:

- Basic command-line interface (CLI) experience
- A Sui wallet with SUI and WAL tokens (see [Setup](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/setup.md) for details)


For more information on setting up your wallet and obtaining tokens, see the [Setup guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/setup.md#prerequisites).

## For Instructors

If you're teaching this curriculum, see the [Instructor's Guide](./instructor-guide.md) for:
- Teaching strategies and approaches
- Section-by-section guidance
- Assessment suggestions

## Next Steps

Start with [Install CLI](./install.md) to set up the Walrus CLI tool, then configure it using [Configuration](./configuration.md), and proceed through the workflow sections to learn how to upload and download data, followed by inspection and troubleshooting sections.

