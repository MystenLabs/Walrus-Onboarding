# Setup and Operation of Publishers and Aggregators

Welcome to the **Setup and Operation of Publishers and Aggregators** curriculum! This module focuses on the practical aspects of deploying and managing Walrus infrastructure. While Publishers and Aggregators are optional components, they significantly simplify client interactions and improve performance.

> **⚠️ Documentation Limitations**: Official documentation for operating Publishers and Aggregators is limited. This module focuses on documented command-line options and general best practices. Specific hardware requirements, detailed performance tuning, and many configuration parameters are not officially documented. Always test deployments in your specific environment and scale based on observed performance.

## Learning Objectives

By the end of this module, you will be able to:

1. **Deploy and run publishers and aggregators correctly** - Set up both types of infrastructure nodes with appropriate configuration and validation
2. **Diagnose common operational issues** - Identify problems through logs, metrics, and system behavior, and apply appropriate recovery patterns

## Why This Module Matters

Publishers and Aggregators are the infrastructure layer that sits between clients and Storage Nodes:

- **Publishers** handle the encoding and distribution of blob data to Storage Nodes, offloading this work from clients
- **Aggregators** handle the retrieval and reconstruction of blobs, providing a simple read interface

Understanding how to operate these components is essential for:
- Running production Walrus infrastructure
- Supporting multiple client applications
- Optimizing performance and reliability
- Troubleshooting client issues

## Curriculum Structure

This curriculum is organized into the following sections:

### Publisher Operations

1. **[Running a Publisher](./01-running-publisher.md)**
   - Installation and deployment
   - Configuration file structure
   - Network requirements
   - Starting and stopping services

2. **[Publisher Configuration Choices](./02-publisher-configuration.md)**
   - Port and binding configuration
   - Storage backend options
   - Performance tuning
   - Security settings

3. **[Validating Publisher Health](./03-validating-publisher.md)**
   - Health check endpoints
   - Testing upload functionality
   - Resource monitoring
   - Troubleshooting common issues

### Aggregator Operations

4. **[Running an Aggregator](./04-running-aggregator.md)**
   - Installation and deployment
   - Configuration file structure
   - Network requirements
   - Starting and stopping services

5. **[Aggregator Configuration Choices](./05-aggregator-configuration.md)**
   - Port and binding configuration
   - Caching strategies
   - Performance tuning
   - Security settings

6. **[Validating Aggregator Sealing](./06-validating-aggregator.md)**
   - Health check endpoints
   - Testing download functionality
   - Sliver retrieval verification
   - Troubleshooting common issues

### Monitoring and Operations

7. **[Observing Epoch Transitions](./07-epoch-transitions.md)**
   - Epoch lifecycle effects
   - Expected log patterns
   - Committee synchronization
   - Handling epoch-related errors

8. **[Monitoring and Log Patterns](./08-monitoring-logs.md)**
   - Log configuration
   - Operational log patterns
   - Error identification
   - Metrics and alerting

9. **[Failure Simulation and Recovery](./09-failure-recovery.md)**
   - Common failure scenarios
   - Simulation techniques
   - Recovery procedures
   - Automated recovery strategies

### Practice

10. **[Hands-On Lab](./10-hands-on-lab.md)**
    - Deploy local publisher and aggregator
    - Perform test operations
    - Analyze logs and metrics
    - Simulate and recover from failures

## Prerequisites

- Familiarity with Walrus architecture (Module 2)
- Basic Linux/Unix system administration
- Understanding of networking concepts
- Experience with command-line tools
- Docker knowledge (helpful for hands-on lab)

## Key Takeaways

- **Publishers and Aggregators are optional** but recommended for production deployments
- **Proper configuration** is essential for performance and reliability
- **Monitoring and logging** enable proactive issue detection
- **Understanding epoch transitions** prevents confusion during network updates
- **Recovery patterns** minimize downtime during failures
- **Health validation** ensures infrastructure is operating correctly

## Operational Philosophy

This module emphasizes:

- **Defense in depth**: Multiple layers of validation and monitoring
- **Fail-fast detection**: Quick identification of issues
- **Graceful degradation**: Maintaining service during partial failures
- **Observable systems**: Rich logging and metrics for troubleshooting
- **Automated recovery**: Reducing manual intervention

## Next Steps

Start with **[Running a Publisher](./01-running-publisher.md)** to learn how to deploy your first Publisher node, then progress through the Aggregator sections before diving into monitoring and failure handling.
