# Practical Constraints

When building applications on Walrus, you'll encounter real-world limitations. Understanding these constraints helps you design better systems and avoid surprises in production.

## Blob Size Limits

### Maximum Blob Size: 13.3 GiB

**Constraint:** Walrus currently supports blobs up to 13.3 GiB.

**Check current limit:**
```bash
walrus info
# Look for "Maximum blob size" in output
```

**Why this limit exists:**
- Encoding memory requirements (~2-3x blob size)
- Network transmission time
- Storage node capacity planning

**Workarounds:**
1. **Split large files into chunks:**
   ```bash
   # Split a 50GB file into 10GB chunks
   split -b 10G large-file.dat chunk_

   # Upload each chunk
   for chunk in chunk_*; do
     walrus store "$chunk"
   done
   ```

2. **Store manifest:**
   - Upload chunks individually
   - Create a manifest file listing blob IDs of all chunks
   - Upload manifest as a small blob
   - Client reconstructs by fetching all chunks

**Application design:**
- For video streaming: Store segments, not entire video
- For backups: Split archives into manageable chunks
- For datasets: Partition data logically

---

## Storage Costs

### WAL Tokens Required

**Constraint:** Storage requires WAL tokens (payment for storage epochs).

**Cost structure:**
- Pay per storage epoch (e.g., 2 weeks on mainnet)
- Cost scales with blob size
- One-time payment for specified number of epochs

**Check storage costs:**
```bash
walrus info
# Shows cost per GiB per epoch
```

**Example calculation:**
```
Blob size: 1 GiB
Storage epochs: 10 (20 weeks)
Cost per GiB per epoch: X WAL
Total cost: 1 × 10 × X = 10X WAL tokens
```

**Budget considerations:**
- Estimate total storage needs
- Plan for epoch extensions (blobs don't last forever unless permanent)
- Account for expansion factor (actual storage ~4.5x due to erasure coding, but you only pay for original size)

**Gas costs (SUI):**
- Transaction fees for registering blobs
- Transaction fees for posting certificates
- Transaction fees for epoch extensions
- Varies with network congestion

**Application design:**
- Cache frequently accessed data to avoid repeated storage costs
- Delete or let expire unused blobs
- Use shorter epoch durations for temporary data

### Quilts for Cost Optimization (Small Blobs)

**Constraint:** Storing many small blobs individually can be expensive (each blob incurs per-epoch storage cost and transaction gas cost).

**Solution: Quilts**
- Quilts batch multiple small blobs together into a single larger blob
- Significantly reduces cost per individual item (amortized gas and storage costs)
- Reduces transaction overhead (one transaction for many blobs vs. many individual transactions)

**When to use Quilts:**
- Storing many small files (e.g., JSON metadata, thumbnails, configuration files)
- Cost optimization is critical for your use case
- Small blobs are logically related or frequently accessed together
- Individual blob sizes are much smaller than 13.3 GiB limit

**Example cost comparison:**
```
Without Quilts:
- 1000 small JSON files (1 KB each = ~1 MB total)
- 1000 separate store operations
- Cost: 1000 × gas cost + 1000 × (storage cost for 1 KB)

With Quilts:
- 1000 small JSON files batched into 1 Quilt (~1 MB total)
- 1 store operation
- Cost: 1 × gas cost + storage cost for 1 MB blob
- Savings: ~999 transaction fees + simplified management
```

**Trade-offs:**
- Must retrieve entire Quilt to access individual blobs (unless using indexing/manifest)
- More complex to manage than individual blobs
- Need to implement batching logic in your application
- May require custom tooling to create, manage, and extract from Quilts

**Application design:**
- Use Quilts for collections of small, related files
- Use individual blobs for large files or frequently updated items
- Consider access patterns (if you need random individual access frequently, Quilts may add overhead)
- Implement manifest/index for efficient Quilt management

---

## Storage Epochs and Expiration

### Epochs Are Time-Limited

**Constraint:** Blobs stored for N epochs will expire after that period (unless extended or marked permanent).

**Epoch duration:**
- Mainnet: ~2 weeks per epoch
- Testnet: May be shorter (check docs)

**What happens at expiration:**
- Blob may be deleted by storage nodes
- No guarantee of retrieval after expiration
- Permanent blobs don't expire

**Tracking expiration:**
```bash
# Check blob's storage epochs
sui client object <blob-object-id> | grep -i epoch
```

**Mitigation:**
1. **Track expiration dates** in your application
2. **Extend epochs before expiration:**
   ```bash
   # CLI command to extend (check actual command)
   walrus extend <blob-id> --epochs 10
   ```
3. **Use permanent storage** for data that must last indefinitely (if available and budget allows)
4. **Set up monitoring/alerts** for upcoming expirations

**Application design:**
- Don't assume blobs last forever
- Implement expiration tracking
- Automate epoch extensions for critical data

---

## Network Bandwidth

### Upload Bandwidth: Client to Publisher/Storage Nodes

**Constraint:** Uploading large blobs takes time proportional to size and network speed.

**Calculation:**
```
Upload time ≈ (Blob size × Expansion factor) / Network speed
Example: 1 GB blob, 4.5x expansion, 100 Mbps upload
Time ≈ (1 GB × 4.5) / (100 Mbps) ≈ 360 seconds = 6 minutes
```

**Mitigation:**
- Use publishers to offload encoding (client only uploads raw blob once)
- Upload during off-peak hours
- Consider network speed when designing UX (show progress indicators)
- Compress data before upload if possible (but note: compression doesn't reduce storage cost, as cost is based on stored size)

### Download Bandwidth: Storage Nodes to Client/Aggregator

**Constraint:** Retrieving blobs takes time, especially large ones.

**Calculation:**
```
Download time ≈ (334 slivers × sliver size) / Network speed
```

**Mitigation:**
- Use aggregators to cache frequently accessed blobs
- Consider CDN-like aggregator setups
- For large blobs, implement streaming rather than loading entirely

---

## Concurrency and Rate Limiting

### Storage Node Limits

**Constraint:** Storage nodes may rate-limit requests to prevent abuse.

**Symptoms:**
```
Error: Too many requests
HTTP 429: Rate limit exceeded
```

**Mitigation:**
- Implement exponential backoff on retries
- Spread requests across multiple storage nodes
- Use publishers/aggregators which already handle this
- Don't hammer nodes with rapid requests

### Sui RPC Limits

**Constraint:** Public Sui RPC endpoints may have rate limits or request quotas.

**Symptoms:**
```
Error: RPC rate limit exceeded
Error: Too many requests
```

**Mitigation:**
- Use paid RPC services for production
- Configure multiple RPC endpoints (failover)
- Cache blockchain queries when possible
- Implement request throttling in your application

---

## Memory Requirements

### Encoding Memory

**Constraint:** Encoding large blobs requires significant memory.

**Rule of thumb:** Need ~2-3x blob size in RAM for encoding.

**Example:**
- 5 GiB blob → Need ~10-15 GiB available RAM

**Symptoms of insufficient memory:**
```
Error: Out of memory
Error: Failed to allocate buffer
Process killed (OOM killer)
```

**Mitigation:**
- Run CLI/publisher on machines with sufficient RAM
- Split large blobs into smaller chunks
- Monitor memory usage during operations
- Use streaming encoding if SDK supports it (advanced)

### Decoding Memory

**Constraint:** Reconstructing blobs also requires memory.

**Rule of thumb:** Need ~1.5-2x blob size in RAM for reconstruction.

**Mitigation:**
- Similar to encoding: sufficient RAM, chunk blobs, monitor usage
- Aggregators should have sufficient memory for largest expected blobs

---

## Transaction Limits

### Gas Limits

**Constraint:** Sui transactions have maximum gas limits.

**Symptoms:**
```
Error: Transaction exceeds gas limit
Error: Insufficient gas budget
```

**Mitigation:**
- For very large blobs, transaction costs may be high
- Ensure wallet has sufficient SUI
- Estimate gas before operations
- If hitting limits, this is unusual - check for issues

### Transaction Throughput

**Constraint:** Blockchain has maximum transaction throughput (TPS - transactions per second).

**Impact:**
- During high network congestion, transactions may be delayed
- Gas prices may spike during congestion

**Mitigation:**
- For bulk uploads, spread transactions over time
- Monitor Sui network status
- Implement retry logic with backoff for transaction failures

---

## Byzantine Tolerance Assumptions

### Requires > 2/3 Honest Nodes

**Constraint:** System guarantees hold only if > 2/3 of storage nodes are honest (by stake weight).

**What this means:**
- If > 1/3 of stake is Byzantine, system guarantees may break
- Blobs may become unavailable
- Data integrity may be compromised

**Monitoring:**
- This is governed by Sui staking mechanism
- Assumed to hold under normal operation
- If concerns arise, check Sui governance and validator status

**Mitigation:**
- Trust that Sui's economic incentives keep majority honest
- For extremely critical data, consider additional off-Walrus backups
- Monitor on-chain governance and validator health

---

## Epoch Transitions

### Shard Reassignment Every Epoch

**Constraint:** Storage node shard assignments change every storage epoch.

**What happens:**
- Nodes must migrate data to new shard owners
- Brief period where some slivers may be unavailable
- Generally handled automatically

**Impact on applications:**
- Retrieval may be slower during transition
- Rare failures possible if migration incomplete

**Mitigation:**
- Implement retry logic (handles transient failures)
- Avoid assuming instant retrieval at all times
- Monitor blob availability if critical

---

## Network Considerations

### Geographic Distribution

**Constraint:** Storage nodes may be geographically distributed.

**Impact:**
- Latency varies depending on client location
- Some nodes may be slow to reach from certain regions

**Mitigation:**
- Use aggregators with caching closer to users
- Design for latency variability
- Implement timeouts and fallbacks

### Network Partitions

**Constraint:** Network partitions can temporarily isolate nodes.

**Impact:**
- Some nodes unreachable during partition
- May need to fetch from alternative nodes
- System tolerates up to 1/3 of nodes being unreachable

**Mitigation:**
- System handles automatically (Byzantine tolerance)
- Implement retry logic with backoff
- Monitor for persistent failures

---

## Publisher/Aggregator Availability

### No SLA for Public Infrastructure

**Constraint:** Public publishers/aggregators may not have availability guarantees.

**Impact:**
- May go offline without notice
- May have performance issues
- May have rate limits

**Mitigation:**
- Don't rely on single publisher/aggregator
- Run your own for production applications
- Implement failover to multiple endpoints
- Have fallback to direct CLI/SDK usage

---

## Comparison to Traditional Storage

| Aspect | Walrus | Traditional (S3, etc.) |
|--------|--------|------------------------|
| **Max blob size** | 13.3 GiB | 5 TB (S3) |
| **Storage cost** | WAL tokens per epoch | $ per GB per month |
| **Retrieval cost** | Free (after upload) | $ per GB transferred |
| **Latency** | Higher (decentralized) | Lower (centralized) |
| **Availability** | > 2/3 honest assumption | 99.9%+ SLA |
| **Privacy** | Public by default | Private by default |
| **Censorship resistance** | High | Low |
| **Programmability** | High (Sui smart contracts) | Limited |

---

## Key Points

### Size and Memory
- **Max blob size**: 13.3 GiB (split larger files into chunks)
- **Memory needed**: ~2-3x blob size for encoding, ~1.5-2x for decoding
- **Bandwidth**: Upload time proportional to size and speed

### Costs
- **Storage costs**: WAL tokens per epoch per GiB
- **Gas costs**: SUI for transactions
- **No retrieval fees**: After upload, retrieval is free
- **Quilts**: Batch small blobs together for significant cost reduction (saves gas and simplifies management)

### Time Limits
- **Storage epochs**: Blobs expire after N epochs (extend before expiration)
- **Epoch transitions**: Brief period where availability may be impacted

### Network
- **Rate limiting**: Storage nodes and RPC endpoints may rate-limit
- **Geographic distribution**: Latency varies by location
- **Network partitions**: System tolerates up to 1/3 of nodes unreachable

### Assumptions
- **Byzantine tolerance**: Requires > 2/3 of nodes honest (by stake)
- **No SLA**: Public publishers/aggregators don't have availability guarantees

### Design Implications
- **Chunk large files**: Don't exceed 13.3 GiB limit
- **Track expiration**: Monitor and extend epochs before blobs expire
- **Budget costs**: Plan for WAL and SUI costs
- **Use Quilts for small blobs**: Batch many small files together to reduce costs
- **Implement retries**: Handle transient failures gracefully
- **Sufficient resources**: Ensure adequate RAM and bandwidth

## Next Steps

Now that you understand practical constraints, proceed to the [Hands-On Exercise](./06-hands-on.md) to practice inspecting logs and identifying operational events.
