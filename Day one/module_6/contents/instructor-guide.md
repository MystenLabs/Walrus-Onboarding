# Instructor's Guide: Walrus CLI Developer Curriculum

This guide provides instructors with the information needed to effectively teach the Walrus CLI Developer Curriculum (Module 6).

## Learning Objectives

By the end of this module, students should be able to:

1. **Install and configure** the Walrus CLI tool
2. **Upload data** to Walrus using various storage options
3. **Download data** from Walrus with proper verification
4. **Inspect stored objects** and system information
5. **Troubleshoot common errors** and debug CLI failures
6. **Apply best practices** for operational habits

## Prerequisites

### Student Prerequisites

Before starting this module, students should have:

- **Basic CLI experience**: Comfortable using terminal/command line
- **Sui wallet**: A Sui wallet with SUI and WAL tokens
- **Network access**: Ability to connect to Sui RPC nodes and Walrus aggregators
- **Basic understanding**: Familiarity with blockchain concepts (helpful but not required)

### Instructor Prerequisites

Instructors should:

- Have completed the module themselves
- Have a working Walrus CLI installation
- Have test wallets with sufficient tokens (both Mainnet and Testnet recommended)
- Be familiar with common CLI errors and troubleshooting
- Have access to the [official Walrus documentation](https://github.com/MystenLabs/walrus/tree/main/docs/book)

## Section-by-Section Guidance

### 1. Install CLI

**Key Points to Emphasize:**
- Multiple installation methods available
- Mainnet vs Testnet distinction
- Verification is crucial

**Teaching Tips:**
- Have students verify installation immediately
- Show how to check which binary is being used (`which walrus`)
- Demonstrate version checking (`walrus --version`)

**Quick Check:**
```sh
walrus --version
walrus --help
```

### 2. Configuration

**Key Points to Emphasize:**
- Configuration file locations and precedence
- Multiple contexts for Mainnet/Testnet
- Wallet configuration options
- System and staking object IDs are network-specific

**Teaching Tips:**
- Walk through downloading default config together
- Show how to verify config with `walrus info`
- Explain context switching early
- Demonstrate wallet generation if needed

**Quick Check:**
```sh
walrus info
walrus info --context testnet  # if using contexts
```

**Important:** Ensure all students can run `walrus info` successfully before proceeding.

### 3. Upload Workflow

**Key Points to Emphasize:**
- Blob ID is deterministic (same content = same ID)
- Storage duration options (epochs, dates, end-epoch)
- Deletable vs permanent blobs
- Automatic optimizations (deduplication, resource reuse)
- Blob lifecycle management

**Teaching Tips:**
- Start with a small test file
- Show blob ID calculation before upload
- Demonstrate `--dry-run` for cost estimation
- Explain the difference between blob ID and object ID clearly
- Use visual diagrams (quilt structure, blob lifecycle)

**Key Commands to Demonstrate:**
```sh
# Basic upload
walrus store file.txt --epochs 10

# Check before uploading
walrus blob-id file.txt
walrus blob-status --file file.txt

# Dry run for cost estimation
walrus store file.txt --epochs 10 --dry-run
```

**Discussion Points:**
- When to use deletable vs permanent blobs
- Cost implications of storage duration
- When to use quilts vs individual blobs

### 4. Download Workflow

**Key Points to Emphasize:**
- Consistency checks and their importance
- Different output options
- Reading from quilts
- Verification after download

**Teaching Tips:**
- Always verify downloads match originals
- Show different consistency check modes
- Demonstrate troubleshooting network issues
- Explain quilt reading methods clearly

**Key Commands to Demonstrate:**
```sh
# Basic download
walrus read <BLOB_ID> --out file.txt

# With strict verification
walrus read <BLOB_ID> --out file.txt --strict-consistency-check

# Verify download
walrus blob-id original.txt
walrus blob-id downloaded.txt
```

### 5. Inspect Commands

**Key Points to Emphasize:**
- Status checking before operations
- System information for planning
- Health checks for troubleshooting
- Blob ID utilities

**Teaching Tips:**
- Show practical workflows (check before upload, verify after)
- Explain system info fields and their meaning
- Demonstrate health checks and what they indicate
- Show blob ID conversion utilities

**Key Commands to Demonstrate:**
```sh
# Check status
walrus blob-status --blob-id <BLOB_ID>

# List owned blobs
walrus list-blobs

# System information
walrus info
walrus info all

# Health checks
walrus health --committee
```

### 6. Common Errors 

**Key Points to Emphasize:**
- Error messages contain useful information
- Debug logging is your friend
- Most errors have clear solutions
- Prevention is better than cure

**Teaching Tips:**
- Go through errors systematically
- Show how to read error messages
- Demonstrate debug logging
- Create a troubleshooting checklist
- Use actual errors as examples

**Key Debugging Tools:**
```sh
# Enable debug logging
RUST_LOG=walrus=debug walrus <command>

# Check system status
walrus info
walrus health --committee

# Verify configuration
RUST_LOG=info walrus info
```

### 7. Operational Habits 

**Key Points to Emphasize:**
- Cost optimization strategies
- Error prevention techniques
- Monitoring and maintenance
- Security considerations

**Teaching Tips:**
- Emphasize practical impact (cost savings)
- Show real examples of good vs bad practices
- Discuss security implications
- Create a checklist for students


### 8. Hands-On Exercises

**Key Points to Emphasize:**
- Complete workflow practice
- Error recovery
- Verification at each step
- Independent problem-solving

**Teaching Tips:**
- Walk through Exercise 1 together
- Let students attempt Exercises 2-3 independently
- Be available for questions
- Review solutions together
- Encourage experimentation

**Exercise Facilitation:**
- **Exercise 1**: Guide students step-by-step, emphasize verification
- **Exercise 2**: Let students work independently, check in periodically
- **Exercise 3**: Encourage exploration, discuss errors encountered
- **Bonus Exercises**: For advanced students or extra practice

## Assessment Suggestions

### Formative Assessment (During Learning)

1. **Quick Checks**: After each section, have students demonstrate:
   - Installation verification
   - Successful config test
   - Upload and download cycle
   - Status check

2. **Think-Pair-Share**: 
   - "Why would you use a permanent blob?"
   - "When would you use quilts?"
   - "How would you troubleshoot a failed download?"

3. **Live Coding**: 
   - Have students walk through commands
   - Catch mistakes early
   - Provide immediate feedback

### Summative Assessment (End of Module)

1. **Practical Exercise**: 
   - Upload multiple files
   - Download and verify
   - Check status and system info
   - Handle a simulated error

2. **Written Reflection**:
   - "Explain when to use deletable vs permanent blobs"
   - "List three best practices for CLI usage"

3. **Troubleshooting Scenario**:
   - Present a scenario with an error
   - Have students identify the issue
   - Walk through the solution

## Additional Resources

### Official Documentation
- [Walrus Documentation](https://github.com/MystenLabs/walrus/tree/main/docs/book)
- [Setup Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/setup.md)
- [Client CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md)
- [Examples](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/examples.md)

## Module Completion Checklist

Before considering the module complete, ensure students can:

- [ ] Install and verify Walrus CLI
- [ ] Configure CLI for Mainnet/Testnet
- [ ] Upload a file and retrieve it
- [ ] Check blob status and system info
- [ ] Handle at least one common error
- [ ] Explain deletable vs permanent blobs
- [ ] Use at least one inspection command
- [ ] Complete Exercise 1 successfully