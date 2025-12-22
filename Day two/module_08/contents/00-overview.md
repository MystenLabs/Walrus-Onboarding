# Module 8: Setup and Operation of Publishers and Aggregators

## Overview

Learn how to deploy and operate **Walrus Publishers and Aggregators** - HTTP infrastructure components that provide easy access to the Walrus decentralized storage network.

---

## Learning Objectives

1. **Deploy and run publishers and aggregators correctly**
   - Install Walrus
   - Configure and start publishers for uploads
   - Configure and start aggregators for downloads

2. **Diagnose common operational issues**
   - Validate health
   - Interpret metrics
   - Troubleshoot problems
   - Apply recovery patterns

---

## Module Content

### Lessons (7 total, ~2 hours)

1. **[Setup and Installation](./01-setup-installation.md)** (15 min)
   - Installing Walrus
   - Configuration setup
   - Wallet preparation

2. **[Publisher Operations](./02-publisher-operations.md)** (25 min)
   - Starting publishers
   - Configuration options
   - Testing uploads
   - Health validation

3. **[Aggregator Operations](./03-aggregator-operations.md)** (20 min)
   - Starting aggregators
   - Configuration options
   - Testing downloads
   - Health validation

4. **[Monitoring](./04-monitoring.md)** (15 min)
   - Metrics endpoint
   - Key metrics to track
   - Epoch transitions
   - Basic Prometheus setup

5. **[Troubleshooting](./05-troubleshooting.md)** (15 min)
   - Diagnostic process
   - Common issues and fixes
   - Recovery procedures

6. **[Hands-On Lab](./06-hands-on-lab.md)** (30-45 min)
   - End-to-end deployment
   - Operational testing
   - Failure simulation
   - Recovery practice

---

## What Are Publishers and Aggregators?

**Publisher**: HTTP interface for uploading blobs
- Receives PUT requests
- Encodes using erasure coding
- Distributes to storage nodes
- **Requires**: SUI + WAL tokens

**Aggregator**: HTTP interface for downloading blobs
- Receives GET requests
- Retrieves slivers from storage nodes
- Reconstructs original blobs
- **Requires**: No tokens (read-only)

**Daemon**: Combined publisher + aggregator

---

## Prerequisites

- Sui wallet with Testnet tokens (for publisher)

---

## Getting Started

Begin with **[Lesson 1: Setup and Installation](./01-setup-installation.md)**

---

**For Instructors**: See [Instructor Guide](./instructor-guide.md)
