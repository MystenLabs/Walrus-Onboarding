# Module 8: Setup and Operation of Publishers and Aggregators

Welcome to Module 8 of the Walrus Training Program! This module provides training on deploying, configuring, and operating Walrus Publishers and Aggregators - the optional infrastructure components that simplify client interactions with the Walrus network.

> **⚠️ Important Notice**: This module is based on limited official documentation. Official hardware requirements, performance benchmarks, and many configuration details are not publicly documented. The guidance provided here focuses on documented command-line options and general operational best practices. Resource requirements depend heavily on your specific workload and should be tested in your environment.

## 📚 Overview

This module teaches you how to:

- Deploy and configure Publisher nodes for handling client uploads
- Deploy and configure Aggregator nodes for handling client downloads
- Validate that your infrastructure is operating correctly
- Monitor system health through logs and metrics
- Diagnose and recover from common operational issues
- Observe and handle epoch transitions
- Simulate failures and implement recovery patterns

## 🎯 Learning Objectives

By completing this module, you will be able to:

1. **Deploy and run publishers and aggregators correctly** - Set up and configure both types of infrastructure nodes with appropriate settings

2. **Diagnose common operational issues** - Identify problems through logs and metrics, and apply recovery patterns

## 📖 Curriculum Structure

The module is organized into 9 comprehensive lessons:

### Publisher Operations

1. **[Running a Publisher](./contents/01-running-publisher.md)** - Publisher deployment and configuration
   - Prerequisites and system requirements
   - Installation and setup process
   - Configuration file structure
   - Command-line options
   - Network connectivity requirements
   - Starting and stopping the publisher

2. **[Publisher Configuration Choices](./contents/02-publisher-configuration.md)** - Optimizing publisher settings
   - Port and network binding options
   - Storage backend configuration
   - Performance tuning parameters
   - Rate limiting and capacity planning
   - Security considerations

3. **[Validating Publisher Health](./contents/03-validating-publisher.md)** - Ensuring publisher operates correctly
   - Health check endpoints
   - Testing upload functionality
   - Verifying storage node connectivity
   - Monitoring resource usage
   - Common issues and troubleshooting

### Aggregator Operations

4. **[Running an Aggregator](./contents/04-running-aggregator.md)** - Aggregator deployment and configuration
   - Prerequisites and system requirements
   - Installation and setup process
   - Configuration file structure
   - Command-line options
   - Starting and stopping the aggregator

5. **[Aggregator Configuration Choices](./contents/05-aggregator-configuration.md)** - Optimizing aggregator settings
   - Port and network binding options
   - Caching strategies
   - Performance tuning parameters
   - Rate limiting configuration
   - Security considerations

6. **[Validating Aggregator Sealing](./contents/06-validating-aggregator.md)** - Ensuring aggregator operates correctly
   - Health check endpoints
   - Testing download functionality
   - Verifying sliver retrieval
   - Read performance validation
   - Common issues and troubleshooting

### Monitoring and Operations

7. **[Observing Epoch Transitions](./contents/07-epoch-transitions.md)** - Understanding epoch lifecycle effects
   - What happens during epoch transitions
   - Expected log patterns
   - Committee updates and synchronization
   - Temporary unavailability periods
   - Handling epoch-related errors

8. **[Monitoring and Log Patterns](./contents/08-monitoring-logs.md)** - System observability
   - Log levels and configuration
   - Expected operational log patterns
   - Error patterns and their meanings
   - Metrics and performance monitoring
   - Setting up alerting
   - Integration with monitoring systems

9. **[Failure Simulation and Recovery](./contents/09-failure-recovery.md)** - Handling operational issues
   - Simulating common failures
   - Storage node unavailability
   - Network partition scenarios
   - Resource exhaustion
   - Recovery patterns and procedures
   - Automated recovery strategies

### Practice

10. **[Hands-On Lab](./contents/10-hands-on-lab.md)** - Practical operational exercise
    - Set up local publisher and aggregator
    - Perform test uploads and downloads
    - Observe logs during operations
    - Identify expected vs unexpected states
    - Simulate a failure and recover
    - Verify epoch transition handling

## 🚀 Getting Started

### Prerequisites

Before starting this module, ensure you have:

- ✅ Completed Module 1 (Introduction to Walrus) and Module 2 (Architecture)
- ✅ Understanding of the roles of Publishers and Aggregators
- ✅ Linux/Unix system administration experience
- ✅ Familiarity with command-line tools and log analysis
- ✅ A system for hands-on exercises (resource needs vary by workload)
- ✅ Docker installed (for containerized deployment, optional)
- ✅ Access to Walrus Testnet
- ✅ Sui wallet with SUI and WAL tokens (for Publisher deployment)

### Quick Start

1. **Read the curriculum**: Start with the [index page](./contents/index.md)

2. **Follow along**: Progress through lessons 1-10 in order

3. **Run exercises**: Use the hands-on lab to practice deployments

4. **Practice**: Complete the operational scenarios in lesson 10

## 💻 Hands-On Components

The `hands-on-source-code/` directory contains:

- **Docker Compose Setup**: Pre-configured publisher and aggregator containers
- **Configuration Templates**: Sample configuration files with documentation
- **Test Scripts**: Upload and download test utilities
- **Monitoring Setup**: Prometheus and Grafana configuration examples
- **Failure Simulation Scripts**: Tools for testing recovery scenarios

See [hands-on-source-code/README.md](./hands-on-source-code/README.md) for detailed instructions.

## 🔧 Operational Focus

This module is designed for:

- **Infrastructure operators** who will deploy and manage Publishers/Aggregators
- **DevOps engineers** setting up Walrus infrastructure for applications
- **Developers** who need to understand operational characteristics
- **Site reliability engineers** responsible for uptime and monitoring

---

**Ready to start?** Head to [contents/index.md](./contents/index.md) or jump straight to [Lesson 1: Running a Publisher](./contents/01-running-publisher.md)!
