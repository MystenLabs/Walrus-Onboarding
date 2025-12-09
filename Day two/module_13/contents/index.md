# Module 13: Performance Optimization

Welcome to the **Performance Optimization** curriculum! This module focuses on techniques to maximize throughput, minimize latency, and optimize costs when building applications on Walrus.

## Learning Objectives

By the end of this module, you will be able to:

1. **Improve throughput** - Implement parallel processing techniques for data uploads and encoding
2. **Reduce latency** - Apply strategies for optimal publisher selection and caching layers
3. **Optimize costs** - Manage storage duration efficiently to avoid unnecessary expenses

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[Parallel Chunking](./01-parallel-chunking.md)** - Breaking large datasets into manageable pieces
   - Why chunking matters for large uploads
   - Memory and CPU efficiency benefits
   - Optimal chunk sizing strategies
   - Pipeline processing patterns

2. **[Parallel Uploads](./02-parallel-uploads.md)** - Maximizing network utilization
   - Inter-blob parallelism (multiple blobs)
   - Intra-blob parallelism (slivers to nodes)
   - Sub-wallet configuration for concurrency
   - Rate limiting awareness

3. **[Publisher Selection Strategy](./03-publisher-selection.md)** - Choosing the right upload path
   - Public vs private publishers
   - Direct SDK writes (client as publisher)
   - Latency and load-based selection
   - Geographic considerations

4. **[Avoiding Unnecessary Storage Extensions](./04-storage-extensions.md)** - Managing storage duration
   - Understanding cost drivers
   - Upfront estimation vs extensions
   - Avoiding "zombie" data costs
   - Expiration as deletion strategy

5. **[Local Caching](./05-local-caching.md)** - Accelerating data retrieval
   - Aggregator-level caching
   - Application-level caching
   - CDN and edge caching
   - Cache-Control header configuration

6. **[Metrics that Matter in Production](./06-production-metrics.md)** - Monitoring for performance
   - Prometheus metrics endpoints
   - Key performance indicators
   - Alerting thresholds
   - Grafana dashboard setup

7. **[Hands-On Lab: Tune Upload Parameters](./07-hands-on.md)** - Practical exercises
   - Sequential vs parallel upload comparison
   - Throughput measurement
   - Concurrency limit implementation

## Prerequisites

Before starting this module, you should have:

- ✅ Completed the CLI or SDK/Upload Relay curriculum
- ✅ Working knowledge of Walrus SDK basics (`writeBlob`)
- ✅ Basic understanding of async/await patterns in TypeScript/JavaScript
- ✅ A funded Testnet wallet with SUI and WAL tokens
- ✅ Node.js 18+ installed (or Docker)

## Key Takeaways

- **Parallel chunking enables 2-4x throughput improvement** for large uploads
- **Chunk sizes of 10MB-100MB** provide a good balance between overhead and parallelism
- **Sub-wallet count limits concurrent operations** - configure `--n-clients` appropriately
- **Immutable blob IDs** make caching trivially easy (no invalidation needed)
- **Estimate storage duration upfront** to avoid extension transaction overhead

## Next Steps

Start with **[Parallel Chunking](./01-parallel-chunking.md)** to understand how to break large datasets into efficient pieces, then work through each section to build your performance optimization toolkit.
