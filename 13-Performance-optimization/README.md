# Module 13: Performance Optimization

Welcome to **Module 13: Performance Optimization**! This module focuses on techniques to maximize throughput, minimize latency, and optimize costs when building applications on Walrus.

## Overview

This module teaches you how to optimize your Walrus applications for production by implementing parallel processing, smart publisher selection, efficient caching strategies, and cost-effective storage management.

## Module Structure

```text
13-Performance-optimization/
├── contents/              # Curriculum materials and documentation
│   ├── index.md          # Module overview and learning objectives
│   ├── 01-parallel-chunking.md
│   ├── 02-parallel-uploads.md
│   ├── 03-publisher-selection.md
│   ├── 04-storage-extensions.md
│   ├── 05-local-caching.md
│   ├── 06-production-metrics.md
│   ├── 07-hands-on.md
│   └── instructor-guide.md
└── hands-on-source-code/  # Practical exercises and code
    ├── README.md         # Detailed lab instructions
    ├── ts/
    │   ├── throughput-tuner.ts
    │   └── utils.ts
    └── package.json
```

## Learning Objectives

By the end of this module, you will be able to:

1. **Improve throughput** - Implement parallel processing techniques for data uploads and encoding
2. **Reduce latency** - Apply strategies for optimal publisher selection and caching layers
3. **Optimize costs** - Manage storage duration efficiently to avoid unnecessary expenses

## Curriculum Topics

1. **[Parallel Chunking](./contents/01-parallel-chunking.md)** - Breaking large datasets into manageable pieces
2. **[Parallel Uploads](./contents/02-parallel-uploads.md)** - Maximizing network utilization
3. **[Publisher Selection Strategy](./contents/03-publisher-selection.md)** - Choosing the right upload path
4. **[Avoiding Unnecessary Storage Extensions](./contents/04-storage-extensions.md)** - Managing storage duration
5. **[Local Caching](./contents/05-local-caching.md)** - Accelerating data retrieval
6. **[Metrics that Matter in Production](./contents/06-production-metrics.md)** - Monitoring for performance
7. **[Hands-On Lab: Tune Upload Parameters](./contents/07-hands-on.md)** - Practical exercises

## Prerequisites

Before starting this module, you should have:

- ✅ Completed the CLI or SDK/Upload Relay curriculum
- ✅ Working knowledge of Walrus SDK basics (`writeBlob`)
- ✅ Basic understanding of async/await patterns in TypeScript/JavaScript
- ✅ A funded Testnet wallet with SUI and WAL tokens
- ✅ Node.js 18+ installed

## Quick Start

1. **Read the curriculum**: Start with the [module index](./contents/index.md) for an overview, then work through each topic sequentially.

2. **Run the hands-on lab**: Navigate to the [hands-on-source-code](./hands-on-source-code/) directory and follow the instructions in its README to:
   - Compare sequential vs parallel upload performance
   - Measure throughput improvements
   - Experiment with concurrency limits

3. **Apply the concepts**: Use the techniques learned here to optimize your own Walrus applications.

## Key Takeaways

- **Parallel chunking enables 2-4x throughput improvement** for large uploads
- **Chunk sizes of 10MB-100MB** provide a good balance between overhead and parallelism
- **Sub-wallet count limits concurrent operations** - configure `--n-clients` appropriately
- **Immutable blob IDs** make caching trivially easy (no invalidation needed)
- **Estimate storage duration upfront** to avoid extension transaction overhead

## Hands-On Lab

The practical lab in `hands-on-source-code/` demonstrates:

- Sequential vs parallel upload comparison
- Throughput measurement and analysis
- Concurrency limit implementation
- Real-world performance tuning

See the [hands-on lab README](./hands-on-source-code/README.md) for detailed instructions.

---

**Start here**: [Module Index](./contents/index.md) | [Hands-On Lab](./hands-on-source-code/README.md)
