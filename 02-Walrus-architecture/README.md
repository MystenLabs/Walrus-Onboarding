# Module 2: Walrus Architecture

This module provides a comprehensive introduction to the Walrus decentralized storage system architecture. You'll learn about the core components, how data flows through the system, and get hands-on experience with uploading and retrieving blobs.

## Overview

Walrus is a decentralized storage system built on Sui that provides verifiable, redundant, and fault-tolerant blob storage. This module covers:

- **System Components**: Storage Nodes, Publishers, and Aggregators
- **Encoding Process**: How blobs are transformed into slivers using erasure coding
- **Data Flow**: Complete upload and retrieval workflows
- **Hands-On Practice**: Step-by-step walkthrough of storing and retrieving blobs

## Module Structure

```text
02-Walrus-architecture/
├── README.md (this file)
├── contents/
│   ├── index.md              # Module overview and curriculum flow
│   ├── 01-components.md      # System components (Storage Nodes, Publishers, Aggregators)
│   ├── 02-chunk-creation.md  # Encoding process and erasure coding
│   ├── 03-data-flow.md       # Upload and retrieval flows
│   ├── 04-hands-on.md        # Practical walkthrough
│   └── instructor-guide.md   # Teaching guide for instructors
├── docker/                   # Docker environment for hands-on exercises
│   ├── README.md             # Docker setup instructions
│   ├── Dockerfile            # Container definition
│   ├── docker-compose.yml    # Service configuration
│   ├── Makefile              # Convenient commands
│   └── workspace/            # Working directory (mounted)
├── images/                   # SVG diagrams
└── assets/                   # Excalidraw source files for diagrams
```

## Getting Started

### Setup Options

**Option 1: Docker Environment (Recommended)**

For a consistent, cross-platform experience:

```bash
cd docker
make build
SUI_WALLET_PATH=~/.sui/sui_config make run
```

See [Docker README](./docker/README.md) for all available commands.

**Option 2: Local Installation**

Install Walrus CLI locally following the [Getting Started guide](https://docs.wal.app/docs/getting-started).

### Learning Path

1. **Start with the [Module Index](./contents/index.md)** - Overview and learning path
2. **Read [System Components](./contents/01-components.md)** - Understand the building blocks
3. **Learn [Chunk Creation and Encoding](./contents/02-chunk-creation.md)** - How data is transformed
4. **Study [Data Flow](./contents/03-data-flow.md)** - See how everything works together
5. **Complete [Hands-On Walkthrough](./contents/04-hands-on.md)** - Practice what you've learned

## Learning Path

### 1. System Components

Learn about the three main components:

- **Storage Nodes**: Core infrastructure that stores encoded blob data
- **Publishers**: Optional HTTP interfaces for blob uploads
- **Aggregators**: Optional HTTP interfaces for blob retrieval

[→ Read Components Guide](./contents/01-components.md)

### 2. Chunk Creation and Encoding

Understand how blobs are encoded:

- Erasure coding with Reed-Solomon codes
- Sliver creation and distribution
- Blob ID computation
- Encoding properties and consistency checks

[→ Read Encoding Guide](./contents/02-chunk-creation.md)

### 3. Data Flow

Trace data through the system:

- **Upload Flow**: Client → Publisher → Encoding → Sui → Storage Nodes → Certificates
- **Retrieval Flow**: Client → Aggregator → Sui → Storage Nodes → Reconstruction

[→ Read Data Flow Guide](./contents/03-data-flow.md)

### 4. Hands-On Walkthrough

Practice with real examples:

- Upload a blob using CLI or HTTP
- Verify upload success
- Retrieve and reconstruct blobs
- Monitor the process

[→ Start Hands-On Exercise](./contents/04-hands-on.md)

## Key Concepts

- **Slivers**: Encoded chunks of data distributed across storage nodes
- **Blob ID**: Cryptographic identifier derived from Merkle root of sliver hashes
- **Erasure Coding**: Redundancy mechanism requiring only 1/3 of slivers for reconstruction
- **Point of Availability**: When a blob becomes retrievable after certificate posting
- **Byzantine Tolerance**: System tolerates up to 1/3 of storage nodes being Byzantine

## Prerequisites

Before starting this module, you should have:

- Basic understanding of blockchain concepts
- Familiarity with HTTP APIs
- Access to a Walrus network (testnet or mainnet)

**For Hands-On Exercises:**
- **Docker** (recommended): Docker and docker-compose installed
- **OR Local Setup**: Walrus CLI installed following the [Getting Started guide](https://docs.wal.app/docs/usage/started)

## Resources

### For Students

- [Walrus Documentation](https://github.com/MystenLabs/walrus)
- [Architecture Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/design/architecture.md)
- [Developer Guide](https://docs.wal.app/docs/dev-guide/dev-operations)

### For Instructors

- **[Instructor Guide](./contents/instructor-guide.md)** - Comprehensive teaching guide with lesson plans, common questions, and assessment strategies

## Diagrams

This module includes several visual diagrams:

- Data Flow Diagram
- Upload Flow Diagram
- Download/Retrieval Flow Diagram
- Component-specific diagrams (Storage Nodes, Publishers, Aggregators)
- Chunk Creation Diagram

All diagrams are available in SVG format in the `images/` directory, with Excalidraw source files in `assets/` for editing.

## Next Steps

After completing this module, you should:

- Understand the Walrus architecture and components
- Know how data flows through the system
- Be able to upload and retrieve blobs
- Understand encoding and erasure coding concepts

Proceed to the next module to continue your Walrus training journey.

---

## Instructor Resources

If you're teaching this module, be sure to review the **[Instructor Guide](./contents/instructor-guide.md)** which includes:

- Detailed lesson plans for each section
- Teaching tips and strategies
- Common student questions with answers
- Assessment strategies and rubrics
- Time management suggestions
- Troubleshooting guides
