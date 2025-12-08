# Instructor's Guide: Setup and Operation of Publishers and Aggregators

## Module Overview

| Feature | Details |
| :--- | :--- |
| **Total Estimated Time** | 90-120 Minutes |
| **Hands-On Components** | Yes - Local Publisher/Aggregator deployment |
| **Difficulty Level** | Intermediate to Advanced |

## Learning Objectives

By the end of this module, students should be able to:

- **Deploy Publishers and Aggregators** - Install, configure, and start both types of infrastructure nodes
- **Configure infrastructure** - Optimize settings for different deployment scenarios (development vs production)
- **Validate operations** - Use health checks, logs, and testing to ensure correct operation
- **Monitor systems** - Understand log patterns and identify operational issues
- **Handle failures** - Diagnose problems and implement recovery procedures

## Prerequisites

### For Students

- Completed Module 1 (Introduction) and Module 2 (Architecture)
- Basic Linux/Unix system administration skills
- Familiarity with command-line tools
- Understanding of networking concepts (ports, firewalls, HTTP)
- Docker knowledge (helpful but not required)

### For Instructor

- Working Publisher and Aggregator deployment for demonstration
- Docker and Docker Compose installed for hands-on lab
- Access to Walrus Testnet for live demonstrations
- Prepared test files for upload/download demos
- Familiarity with the Walrus repository structure:
  - [`crates/walrus-service/src/publisher/`](https://github.com/MystenLabs/walrus/tree/main/crates/walrus-service/src/publisher) - Publisher implementation
  - [`crates/walrus-service/src/aggregator/`](https://github.com/MystenLabs/walrus/tree/main/crates/walrus-service/src/aggregator) - Aggregator implementation

## Classroom Setup & Preparation

**Materials Needed:**
- Laptop/computer for each student with Docker installed
- Internet connection for accessing Walrus Testnet
- Terminal access
- Text editor

**Advance Prep Tasks:**
- Test Docker Compose setup on instructor machine
- Prepare sample files for upload testing
- Have troubleshooting scenarios ready
- Pre-download Walrus binary and Docker images to save time

## Section-by-Section Guidance

### Section 1: Running a Publisher (Time: 20 min)

**Student Material:** `01-running-publisher.md`

⏱️ **Duration:** 20 minutes

🎯 **Key Points to Emphasize:**

- Publishers are **optional** infrastructure - they simplify client operations but aren't required
- Publishers handle the CPU-intensive encoding operations
- Publishers need outbound connectivity to Storage Nodes (typically 1000+ nodes)
- System requirements scale with upload volume (4+ cores, 8GB+ RAM baseline)

💡 **Teaching Tips:**

- Draw a diagram showing: Client → Publisher → Storage Nodes → Sui
- Explain the economic benefit: one Publisher serves many clients
- Demonstrate the systemd service setup (production best practice)
- Show the difference between development (local) and production (public) binding

⚠️ **Common Misconceptions:**

- *Misconception*: "Publishers store data"
  - *Correction*: Publishers only temporarily hold data during encoding and distribution. Storage Nodes store the data.

- *Misconception*: "I need one Publisher per client"
  - *Correction*: One Publisher can serve many clients concurrently.

💬 **Discussion Points:**

- When would you run your own Publisher vs using a public one?
  - **Answer**: Own Publisher when you need control, privacy, guaranteed capacity, or are serving many clients
- What's the trade-off of running Publisher in Docker vs native?
  - **Answer**: Docker is easier to deploy/manage, native may have slightly better performance

✅ **Quick Check:**

- "What port does the Publisher listen on by default?" (Answer: 31415)
- "What system resources does encoding consume most?" (Answer: CPU)
- "Can the Publisher operate without connection to Sui?" (Answer: No, needs committee information from Sui)

**Transition to Next Section:**
"Now that your Publisher is running, let's optimize its configuration for your specific environment..."

---

### Section 2: Publisher Configuration Choices (Time: 15 min)

**Student Material:** `02-publisher-configuration.md`

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- `max_concurrent_writes` is the key performance tuning parameter
- Network binding impacts security (0.0.0.0 vs 127.0.0.1)
- Use reverse proxy (nginx) for TLS, rate limiting, and security
- Resource limits prevent runaway processes

💡 **Teaching Tips:**

- Show example of increasing `max_concurrent_writes` from 10 to 50 and its effect on throughput
- Demonstrate nginx reverse proxy configuration for production
- Explain CPU affinity and how to use `RAYON_NUM_THREADS` for encoding threads

⚠️ **Common Misconceptions:**

- *Misconception*: "Higher `max_concurrent_writes` always means better performance"
  - *Correction*: Too high can exhaust memory or overwhelm Storage Nodes. Tune based on available resources.

💬 **Discussion Points:**

- How do you decide between vertical scaling (bigger machine) vs horizontal scaling (more Publishers)?
  - **Answer**: Horizontal is better for resilience and beyond ~20 concurrent uploads. Vertical is simpler for moderate loads.

✅ **Quick Check:**

- "What happens if you bind to 0.0.0.0 without a firewall?" (Answer: Publisher is publicly accessible, security risk)
- "Why use a reverse proxy instead of TLS directly in the Publisher?" (Answer: Separation of concerns, maturity of nginx/caddy, easier cert management)

**Transition to Next Section:**
"With your Publisher configured, let's validate it's working correctly..."

---

### Section 3: Validating Publisher Health (Time: 15 min)

**Student Material:** `03-validating-publisher.md`

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- Health checks are essential for load balancing and monitoring
- Test uploads validate end-to-end functionality
- Logs reveal operational issues before they impact users
- Resource monitoring prevents capacity issues

💡 **Teaching Tips:**

- Live demo: Run health check, show healthy response
- Live demo: Upload a test file, watch logs, explain each log line
- Show an intentional failure (e.g., disconnect from Sui RPC) and resulting unhealthy status
- Run the validation script from the lesson

⚠️ **Common Misconceptions:**

- *Misconception*: "HTTP 200 on /health means everything is fine"
  - *Correction*: Check the JSON body - status should be "healthy", not just HTTP 200

💬 **Discussion Points:**

- What monitoring metrics would you track in production?
  - **Answer**: CPU usage, memory usage, upload success rate, average encoding time, committee sync status

✅ **Quick Check:**

- "What does it mean if encoding time is very high?" (Answer: CPU bottleneck or very large blobs)
- "Can a Publisher operate if only 50% of Storage Nodes are reachable?" (Answer: Depends on quorum requirements, but likely yes - needs 2/3)

**Transition to Next Section:**
"Now let's set up the download side with an Aggregator..."

---

### Section 4: Running an Aggregator (Time: 15 min)

**Student Material:** `04-running-aggregator.md`

⏱️ **Duration:** 15 minutes

🎯 **Key Points to Emphasize:**

- Aggregators are also optional infrastructure
- Aggregators handle sliver retrieval and decoding
- Less CPU-intensive than Publishers (decoding is easier than encoding)
- Can run both Publisher and Aggregator on same machine (different ports)

💡 **Teaching Tips:**

- Compare Aggregator to Publisher in a side-by-side table
- Show running both services simultaneously
- Explain the symmetry: Publisher writes, Aggregator reads

⚠️ **Common Misconceptions:**

- *Misconception*: "I need an Aggregator for every Publisher"
  - *Correction*: They're independent. You can have any ratio (1:1, 1:many, many:1)

💬 **Discussion Points:**

- When might you run more Aggregators than Publishers?
  - **Answer**: Read-heavy workloads (many downloads, few uploads)

✅ **Quick Check:**

- "What is the default port for Aggregators?" (Answer: 31416)
- "Is decoding or encoding more CPU-intensive?" (Answer: Encoding)

**Transition to Next Section:**
"Let's configure and validate the Aggregator..."

---

### Sections 5-6: Aggregator Configuration and Validation (Time: 20 min)

**Student Material:** `05-aggregator-configuration.md`, `06-validating-aggregator.md`

⏱️ **Duration:** 20 minutes (combined)

🎯 **Key Points to Emphasize:**

- Configuration is similar to Publisher but optimized for reads
- Caching can significantly improve performance (if supported)
- `max_concurrent_reads` controls parallelism when fetching slivers
- Download validation ensures reconstructed data is correct

💡 **Teaching Tips:**

- Show a download test end-to-end
- Compare original vs downloaded file with `diff`
- Explain how caching reduces load on Storage Nodes

✅ **Quick Check:**

- "How many slivers minimum are needed to reconstruct a blob?" (Answer: 334 for typical configuration with 1000 shards)
- "What happens if the Aggregator can't reach enough Storage Nodes?" (Answer: Download fails with insufficient slivers error)

**Transition to Next Section:**
"Now let's understand how epoch transitions affect your infrastructure..."

---

### Section 7: Observing Epoch Transitions (Time: 10 min)

**Student Material:** `07-epoch-transitions.md`

⏱️ **Duration:** 10 minutes

🎯 **Key Points to Emphasize:**

- Epochs change every ~2 weeks on Mainnet
- Committee changes during epoch transitions
- Publishers/Aggregators must refetch committee info
- Brief window of potential degradation during transition

💡 **Teaching Tips:**

- Show logs from an actual epoch transition (if available)
- Explain what "committee synchronized" means
- Discuss strategies for handling transitions (retries, fallbacks)

⚠️ **Common Misconceptions:**

- *Misconception*: "Services go down during epoch transitions"
  - *Correction*: Services remain up; there's just brief synchronization. Properly configured clients retry automatically.

✅ **Quick Check:**

- "What changes during an epoch transition?" (Answer: Committee members, system parameters like price)
- "Should an upload fail if submitted right at epoch boundary?" (Answer: No, should succeed with retry logic)

**Transition to Next Section:**
"Let's dive into monitoring and understanding log patterns..."

---

### Section 8: Monitoring and Log Patterns (Time: 10 min)

**Student Material:** `08-monitoring-logs.md`

⏱️ **Duration:** 10 minutes (note: content file not created yet - create stub or skip)

🎯 **Key Points to Emphasize:**

- Structured logging helps with automated monitoring
- Different log levels for different scenarios
- Metrics integration (Prometheus) enables alerting
- Pattern recognition helps identify issues quickly

💡 **Teaching Tips:**

- Show grep commands to filter logs for errors
- Demonstrate setting up log aggregation (ELK, Grafana Loki)
- Explain log rotation to prevent disk exhaustion

✅ **Quick Check:**

- "Why use structured (JSON) logging in production?" (Answer: Machine-parseable, easier to query and alert on)
- "What log level should you use in production?" (Answer: Info, escalate to Debug when troubleshooting)

**Transition to Next Section:**
"Finally, let's learn how to handle failures and recover gracefully..."

---

### Section 9: Failure Simulation and Recovery (Time: 10 min)

**Student Material:** `09-failure-recovery.md`

⏱️ **Duration:** 10 minutes (note: content file not created yet - create stub or skip)

🎯 **Key Points to Emphasize:**

- Failures are normal in distributed systems
- Graceful degradation is better than hard failures
- Automated recovery (systemd restart) reduces downtime
- Understanding failure modes helps with troubleshooting

💡 **Teaching Tips:**

- Live demo: Kill Publisher process, show systemd auto-restart
- Simulate network partition, observe retry behavior
- Discuss circuit breaker pattern for cascading failures

✅ **Quick Check:**

- "What should happen if a Publisher crashes?" (Answer: Systemd restarts it, clients retry)
- "What's the difference between a transient and permanent failure?" (Answer: Transient is temporary (network), permanent is config/code issue)

**Transition to Next Section:**
"Now let's put everything together in the hands-on lab..."

---

### Section 10: Hands-On Lab (Time: 45-60 min)

**Student Material:** `10-hands-on-lab.md`

⏱️ **Duration:** 45-60 minutes

🎯 **Key Points to Emphasize:**

- Hands-on practice reinforces concepts
- Real deployment experience is valuable
- Debugging skills are learned by doing
- Log analysis is a critical operator skill

💡 **Teaching Tips:**

- Have students work in pairs (peer learning)
- Circulate to help with issues
- Encourage students to experiment beyond the instructions
- Collect common issues for group discussion

⚠️ **Common Issues:**

1. **Docker not starting**:
   - Check Docker daemon is running
   - Check port conflicts (31415, 31416)
   - Check disk space

2. **Services unhealthy**:
   - Check configuration file is valid YAML
   - Check network connectivity to Sui RPC
   - Review logs for specific errors

3. **Uploads failing**:
   - Verify Walrus CLI is configured correctly
   - Check Publisher URL is correct
   - Ensure wallet has SUI/WAL tokens

💬 **Discussion Points:**

- What surprised you about the deployment?
- What would you do differently in production?
- What monitoring would you add?

✅ **Quick Check:**

- Can you explain the logs you saw during upload?
- How would you diagnose a slow upload?
- What's the recovery procedure if the Publisher crashes?

---

## Assessment Suggestions

- **Deployment Exercise**: Deploy Publisher and Aggregator, validate with test upload/download
- **Configuration Quiz**: Given a scenario (high-volume, low-latency, etc.), choose appropriate config settings
- **Log Analysis**: Provide log snippets, ask students to identify the issue
- **Troubleshooting Scenario**: Present a failure (e.g., "uploads are failing"), ask for diagnostic steps
- **Production Planning**: Design a production deployment with redundancy, monitoring, and disaster recovery

## Additional Resources

- **Walrus Source Code**:
  - [`crates/walrus-service/src/publisher/`](https://github.com/MystenLabs/walrus/tree/main/crates/walrus-service/src/publisher)
  - [`crates/walrus-service/src/aggregator/`](https://github.com/MystenLabs/walrus/tree/main/crates/walrus-service/src/aggregator)
- **Walrus Operator Guide**: [https://docs.wal.app/operator-guide/](https://docs.wal.app/operator-guide/)
- **Docker Documentation**: [https://docs.docker.com/](https://docs.docker.com/)
- **Systemd Documentation**: [https://systemd.io/](https://systemd.io/)

## Module Completion Checklist

- [ ] Student can deploy a Publisher using Docker or native installation
- [ ] Student can deploy an Aggregator
- [ ] Student can configure both for development and production scenarios
- [ ] Student can validate health using health checks and test operations
- [ ] Student can analyze logs to identify normal vs abnormal behavior
- [ ] Student understands epoch transitions and their effects
- [ ] Student can simulate and recover from common failures
- [ ] Student completed the hands-on lab successfully
- [ ] Student can explain when to run Publishers/Aggregators vs using public infrastructure

## Instructor Cheat Sheet

**Quick Command Reference**:

```bash
# Start Publisher
walrus publisher --bind-address 127.0.0.1:31415

# Start Aggregator
walrus aggregator --bind-address 127.0.0.1:31416

# Health check
curl http://localhost:31415/health
curl http://localhost:31416/health

# Upload test
walrus store test.txt --epochs 1

# Download test
walrus read <blob-id> --out downloaded.txt

# View logs (systemd)
sudo journalctl -u walrus-publisher -f
sudo journalctl -u walrus-aggregator -f

# View logs (Docker)
docker-compose logs -f publisher
docker-compose logs -f aggregator
```

**Common Port Numbers**:
- Publisher: 31415
- Aggregator: 31416
- Sui RPC: 443 (HTTPS)

**Key Config Parameters**:
- `max_concurrent_writes`: Publisher parallelism (default: 10)
- `max_concurrent_reads`: Aggregator parallelism (default: 20)
- `request_timeout_ms`: Timeout for Storage Node operations (default: 30000)

**Troubleshooting Decision Tree**:
1. Service won't start → Check logs for binding/config errors
2. Service unhealthy → Check network connectivity to Sui RPC
3. Uploads fail → Check Publisher connectivity, wallet balance
4. Downloads fail → Check Aggregator connectivity, blob exists
5. Slow performance → Check CPU usage, network bandwidth, concurrent connections
