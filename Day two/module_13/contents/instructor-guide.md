# Instructor's Guide: Module 13 - Performance Optimization

## Quick Reference

**Total Time:** 60-75 minutes
**Difficulty:** Intermediate to Advanced
**Hands-on Components:** Lab - Tune Upload Parameters (20-30 min)
**Materials Needed:** Walrus SDK, Node.js environment, network access

**Key Takeaways:**
- Parallel chunking enables **2-4x throughput improvement** for large uploads
- Chunk sizes of **10MB to 100MB** provide optimal balance between overhead and parallelism
- Publisher selection strategy (remote vs. private vs. direct SDK) affects latency and trust model
- **Immutable blob IDs** make caching trivially easy (no invalidation needed)
- Storage duration should be estimated upfront to avoid extension transaction overhead
- **Caching caveats**: Large blobs need special handling (timeouts, buffering, size limits)

## Prerequisites

### For Students

- Completed CLI or SDK/Upload Relay curriculum modules
- Working knowledge of Walrus SDK basics (`writeBlob`)
- Basic understanding of async/await patterns in TypeScript/JavaScript
- A funded Testnet wallet with SUI + WAL tokens
- Node.js 18+ installed

### For Instructor

- Understanding of erasure encoding overhead and sliver distribution
- Familiarity with publisher architecture and sub-wallet management
- Experience with production metrics and alerting
- Comfort explaining network latency vs. throughput tradeoffs
- Prepared demo environment with performance comparison results

## Classroom Setup

**Advance Prep (15 min before class):**
- [ ] Verify Node.js environment works
- [ ] Test the throughput tuner script on testnet
- [ ] Ensure students have funded wallets (SUI + WAL)
- [ ] Prepare whiteboard for throughput diagrams
- [ ] Pre-run the lab to get expected results for comparison
- [ ] Queue up cost comparison examples

**Optional Materials:**
- Pre-recorded demo video (if testnet is slow)
- Sample metrics dashboard screenshots
- Network diagrams showing parallel upload flow

## Instructor Cheat Sheet

1. **Parallel Chunking (8-10 min):** Why chunking matters | Memory/CPU/failure benefits | 10-100MB optimal range | Manifest pattern (Quilts are for batching small files, NOT chunking large ones)
2. **Parallel Uploads (10-12 min):** Inter-blob vs intra-blob parallelism | Sub-wallet limits (default 8) | Rate limiting (HTTP 429) | ~1000 shards, ~334 for quorum
3. **Publisher Selection (10-12 min):** Remote vs private vs **direct SDK writes** | Latency/load/geographic selection | Trust implications
4. **Storage Extensions (8-10 min):** Duration estimation | Zombie data avoidance | Expiration vs deletion | PTB batch operations
5. **Local Caching (8-10 min):** Aggregator/Application/CDN levels | Immutable = no invalidation | **Caveats for each layer** (timeouts, size limits, costs)
6. **Production Metrics (8-10 min):** Key metrics | Alert thresholds | Debugging correlations
7. **Hands-On Lab (20-30 min):** Sequential vs parallel comparison | Throughput measurement | Two parallelism levels | Challenge: concurrency limits

---

## Section-by-Section Guidance

### Section 1: Parallel Chunking (8-10 min)
**Student Material:** `01-parallel-chunking.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Memory Efficiency**: Large blobs require entire content in memory for encoding
- **CPU Utilization**: Single blob = single thread encoding (underutilizes multi-core)
- **Failure Granularity**: 10GB upload fails at 99% = restart everything vs. retry one chunk
- **Optimal Range**: 10MB-100MB chunks balance overhead vs parallelism
- **Important Distinction**: Quilts batch *small files* (< 1MB); chunking splits *large files*. Don't confuse them!

💡 **Teaching Tips:**
- Use real numbers: "A 1GB file as one blob vs 10x 100MB chunks"
- Draw timeline diagram showing sequential encoding vs parallel encoding
- Explain the pipeline: "While chunk 1 uploads, chunk 2 encodes"
- Clarify: "Quilts are for batching small files, not chunking large ones. Use a manifest blob for chunked large files."

⚠️ **Common Misconceptions:**
- Students may think smaller chunks are always better (overhead increases)
- May not realize transaction fees add up for very small chunks
- Could assume the SDK auto-chunks (it doesn't for regular blobs)

💬 **Discussion Points:**
- "What happens if you make chunks too small (1KB)?" 
  - Answer: Transaction overhead dominates, worse throughput
- "What happens if chunks are too large (5GB)?"
  - Answer: Memory issues, single thread bottleneck, costly retries

✅ **Quick Check:**
- "What's the recommended chunk size range?" (10MB-100MB)
- "Name two benefits of chunking large files" (Parallel encoding, granular retries)

**Transition to Next Section:**
"Now that we understand chunking, let's look at how to upload those chunks efficiently."

---

### Section 2: Parallel Uploads (10-12 min)
**Student Material:** `02-parallel-uploads.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**
- **Two Levels of Parallelism**:
  1. Inter-blob: Multiple blobs uploaded concurrently (your code controls this)
  2. Intra-blob: Single blob → slivers sent to ~1000 shards (SDK handles this)
- **Shard vs Sliver Clarification**: 1000 shards on mainnet; each blob produces one sliver pair per shard; only ~334 needed for quorum
- **Sub-wallet Limitation**: Publisher can only handle N parallel registrations where N = number of sub-wallets (default: 8)
- **Rate Limiting**: HTTP 429 = back off; too aggressive = worse throughput
- **Batching**: For tiny files (<100KB), use Quilts instead

💡 **Teaching Tips:**
- Draw the two-level parallelism diagram:
  ```
  Blob1 → [Sliver1, Sliver2, ...] → [Node1, Node2, ...]
  Blob2 → [Sliver1, Sliver2, ...] → [Node1, Node2, ...]
  (concurrent)
  ```
- Explain the SDK's `DistributedUploader` and `WeightedFutures`
- Demonstrate impact: "8 sub-wallets = max 8 concurrent registrations"
- Clarify: "1000 shards ≠ 1000 uploads; one sliver pair per shard, only 334 confirmations needed"

⚠️ **Common Misconceptions:**
- Students think more parallelism is always better (HTTP 429 rate limits exist)
- May not realize sub-wallet count limits concurrent operations
- Could assume network bandwidth is the only bottleneck (CPU matters too)
- May confuse shard count with number of slivers needed for success

💬 **Discussion Points:**
- "Why can't you have unlimited parallel uploads?"
  - Answer: Sub-wallet locks, rate limits, publisher CPU capacity
- "When would batching be better than parallelism?"
  - Answer: Many tiny files where transaction overhead dominates

✅ **Quick Check:**
- "What limits the number of concurrent blob registrations?" (Sub-wallet count)
- "Name the two levels of parallelism in Walrus uploads" (Inter-blob, intra-blob)

**Transition to Next Section:**
"Let's discuss how to choose the right publisher for optimal performance."

---

### Section 3: Publisher Selection Strategy (10-12 min)
**Student Material:** `03-publisher-selection.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**
- **Three Publisher Options**:
  1. Public/Remote: Simplest, but shared resources and extra network hop
  2. Private/Dedicated: Your resources, control sub-wallets, but maintenance overhead
  3. **Direct SDK Writes** (not "embedded"): Lowest latency, no HTTP hop, but requires key management
- **Selection Criteria**: Latency, load, geography, trust model
- **Dynamic Strategy**: Failover when publisher returns **HTTP 429** (overloaded) or shows high latency

💡 **Teaching Tips:**
- Walk through the mermaid diagram showing selection flow
- Compare latency: Remote (+1 network hop) vs Direct SDK (0 hops)
- Discuss trust implications: "Remote publisher sees your data before encoding"
- Real scenario: "Your app is in US-West, publisher in US-East vs EU-West"
- Emphasize: Direct SDK = your app does encoding (CPU-intensive)

⚠️ **Common Misconceptions:**
- Students may think public publishers are "free" (they share your resources)
- Could assume direct SDK writes are always best (complexity and CPU cost is real)
- May not consider geographic latency for remote publishers
- Might confuse HTTP 503 with 429 (429 is for rate limiting/overload)

💬 **Discussion Points:**
- "When would you choose a remote publisher despite latency?"
  - Answer: Quick prototyping, low volume, don't want infrastructure
- "What's the tradeoff with direct SDK writes?"
  - Answer: Your app manages keys, coins, and does CPU-intensive encoding

✅ **Quick Check:**
- "Which publisher type has the lowest latency?" (Direct SDK writes - no HTTP hop)
- "What HTTP status indicates publisher overload?" (HTTP 429 Too Many Requests)

**Transition to Next Section:**
"Let's discuss how to avoid wasting money on storage extensions."

---

### Section 4: Avoiding Unnecessary Storage Extensions (8-10 min)
**Student Material:** `04-storage-extensions.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Cost Formula**: Size × Duration × BaseRate
- **Extension Cost**: Gas fee + storage fee (the gas adds up!)
- **Estimate Upfront**: 1 year upfront vs 12 monthly extensions = 11 fewer transactions
- **Zombie Data**: Don't extend data nobody accesses anymore
- **Expiration > Deletion**: Let temporary data expire naturally

💡 **Teaching Tips:**
- Calculate: "12 extensions × gas fee = X SUI wasted"
- Real scenario: "User deleted file in app but blob ID still mapped → paying for garbage"
- Emphasize: "The cheapest transaction is the one you don't make"

⚠️ **Common Misconceptions:**
- Students may set minimum duration "to save money" (extension overhead defeats this)
- Could build auto-extend without checking access (zombie data)
- May not realize gas fees add up over many extensions

💬 **Discussion Points:**
- "You're building a file sharing app. Should you set 1 epoch or 1 year storage?"
  - Answer: Depends on use case! Temporary shares = 1 epoch. Permanent storage = estimate duration.
- "How do you identify zombie data before extending?"
  - Answer: Access logs, user deletion flags, application-level tracking

✅ **Quick Check:**
- "What's cheaper: 12 monthly extensions or 1 year upfront?" (1 year upfront)
- "What's the most efficient way to delete temporary data?" (Let it expire)

**Transition to Next Section:**
"Now let's talk about speeding up reads with caching."

---

### Section 5: Local Caching (8-10 min)
**Student Material:** `05-local-caching.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Key Insight**: Blob IDs are immutable → cache invalidation is trivial
- **Three Cache Levels** (each with caveats):
  1. Aggregator: HTTP cache (Nginx/Varnish) - watch for large blob timeouts, buffering
  2. Application: Redis/Memcached - size limits (Redis 512MB, Memcached 1MB default)
  3. CDN: Edge caching - egress costs, size limits, cold cache latency
- **Cache Headers**: `Cache-Control: public, max-age=31536000, immutable`
- **Only LRU Eviction**: Never need to invalidate specific blob IDs

💡 **Teaching Tips:**
- Emphasize the "one of the hardest problems in CS is easy here" point
- Show header example: "This tells browsers to cache forever"
- Explain aggregator flow: Client → Cache → Aggregator (if miss) → Storage Nodes
- **Highlight caveats**: Large blobs (~13.6 GiB max) need special handling at each layer
- Discuss cost implications: CDN makes sense for frequently accessed, moderate-size content

⚠️ **Common Misconceptions:**
- Students may implement cache invalidation logic (unnecessary!)
- Could forget that blob IDs are content-addressed (different content = different ID)
- May not set proper cache headers (missing "immutable" directive)
- **May assume default Nginx/Redis configs work for large blobs** (they don't!)
- Could think CDN is always better (costs can exceed direct aggregator for rare/large content)

💬 **Discussion Points:**
- "Why don't we need cache invalidation for Walrus content?"
  - Answer: Content changes → Blob ID changes. Old ID always returns same content.
- "What cache eviction strategy should you use?"
  - Answer: LRU (Least Recently Used) - only evict to save space, never for freshness
- "When might CDN caching be a bad idea?"
  - Answer: Rarely accessed content, very large blobs, cost-sensitive applications

✅ **Quick Check:**
- "Why is cache invalidation easy with Walrus?" (Immutable blob IDs)
- "What Cache-Control header should you use?" (`public, max-age=31536000, immutable`)
- "What's the max blob size you need to handle in your cache config?" (~13.6 GiB)

**Transition to Next Section:**
"Let's talk about measuring performance in production."

---

### Section 6: Metrics that Matter in Production (8-10 min)
**Student Material:** `06-production-metrics.md`

⏱️ **Duration:** 8-10 minutes

🎯 **Key Points to Emphasize:**
- **Key Metrics**:
  - End-to-end latency, TTFB
  - Encoding duration (CPU bottleneck indicator)
  - Storage node availability, retry rate
  - Memory usage, network I/O
- **Alert Thresholds**: Success rate <99% warning, <95% critical

💡 **Teaching Tips:**
- Walk through the alerting threshold table
- Explain: "High retry rate kills latency even if eventual success"
- Discuss correlation: "Encoding spike + high latency = CPU bottleneck"

⚠️ **Common Misconceptions:**
- Students may only monitor success/failure (latency matters too!)
- Could ignore resource metrics until OOM kills happen
- May not correlate metrics (e.g., retry rate + latency)

💬 **Discussion Points:**
- "What does high retry rate indicate?"
  - Answer: Network issues, storage node problems, or rate limiting (HTTP 429)
- "What's the difference between latency and throughput?"
  - Answer: Latency = time per request; Throughput = data per second

✅ **Quick Check:**
- "What success rate triggers a warning alert?" (<99%)
- "Name one latency metric to monitor" (End-to-end latency, TTFB)
- "Name two resource metrics you should monitor" (Memory usage, network I/O)

**Transition to Hands-On:**
"Now let's measure performance improvement ourselves!"

---

### Section 7: Hands-On Lab (20-30 min)
**Student Material:** `07-hands-on.md`

⏱️ **Duration:** 20-30 minutes

🎯 **Key Points to Emphasize:**
- **Experiment Design**: Same data, sequential vs parallel uploads
- **Measurement**: Total time, throughput (MB/s)
- **Expected Result**: 2-4x throughput improvement with parallel uploads
- **Two Parallelism Levels**: Inter-blob (student code) and intra-blob (SDK handles)
- **Analysis**: Latency stays similar, but overlap increases throughput

💡 **Teaching Tips:**
- Walk through the local setup first (5 min)
- Run the experiment together as a class first
- Let students run independently and compare results
- Discuss variance: "Network conditions affect results"
- Explain why not 5x: intra-blob parallelism already saturates resources

**Available npm scripts for demonstrations:**
```bash
npm start          # Default: concurrency=1, wallets=1 (no improvement expected)
npm run start:c2   # concurrency=2, wallets=2 (~40-50% improvement)
npm run start:c3   # concurrency=3, wallets=3 (~60-80% improvement)
npm run start:c5   # concurrency=5, wallets=5 (~150-200% improvement)
npm run start:w4c5 # concurrency=5, wallets=4 (may fail - demonstrates rate limiting!)
```

**Common Issues During Lab:**

| Issue | Solution |
|-------|----------|
| "PASSPHRASE not set" | Export environment variable: `export PASSPHRASE='...'` |
| Faucet rate limited | Wait 1-2 minutes, or use existing balance |
| Insufficient WAL | Script auto-exchanges SUI for WAL |
| Results vary wildly | Network conditions; run multiple times |
| HTTP 429 errors | Rate limited; reduce concurrency |
| CPU maxed during test | Encoding is intensive; expected behavior |
| "Too many failures" errors | Concurrency exceeds wallets; use matching numbers |

**Expected Results (from actual test runs):**

| Script | Concurrency | Wallets | Improvement |
|--------|-------------|---------|-------------|
| `npm start` | 1 | 1 | ⚠️ No improvement (same as sequential) |
| `npm run start:c2` | 2 | 2 | ✅ ~42% |
| `npm run start:c3` | 3 | 3 | ✅ ~70% |
| `npm run start:c5` | 5 | 5 | ✅ ~184% (best!) |
| `npm run start:w4c5` | 5 | 4 | ❌ Failures (rate limiting) |

> **Key insight:** Matching wallets to concurrency provides best results. Too much concurrency with too few wallets causes failures.

⚠️ **Common Misconceptions During Lab:**
- Students may think exact numbers matter more than relative improvement
- Could assume their machine is slow (it's network latency + encoding CPU)
- May not understand why parallel doesn't give 5x improvement for 5 blobs
- Might not realize each blob already uses intra-blob parallelism to ~1000 shards

💬 **Discussion Points (during wrap-up):**
- "Why isn't parallel exactly 5x faster for 5 blobs?"
  - Answer: Network bandwidth limit, publisher capacity, rate limiting (429), intra-blob parallelism already saturates
- "What would happen with 100 blobs?"
  - Answer: Need concurrency limits (p-limit) to avoid overwhelming the system

✅ **Quick Check (at end of lab):**
- "What was your parallel vs sequential throughput improvement?"
- "What limits prevented exactly 5x improvement?"

**Challenge Discussion:**
For students who complete early, discuss the challenges:
- Try `npm run start:w4c5` to observe rate limiting failures
- Why matching wallets to concurrency matters
- The built-in concurrency limiter in `throughput-tuner.ts`
- Why 5 concurrent uploads with 5 wallets gives best results (~184% improvement)

---

## Wrap-up and Assessment (5-10 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **What's the recommended chunk size range for parallel processing?**
   - Expected: 10MB-100MB

2. **Why is cache invalidation trivial for Walrus content?**
   - Expected: Blob IDs are immutable/content-addressed

3. **Name two factors that limit parallel upload performance.**
   - Expected: Sub-wallet count, rate limits (HTTP 429), network bandwidth, CPU (encoding), intra-blob parallelism

4. **When should you NOT extend blob storage?**
   - Expected: Zombie data (no longer accessed), temporary content that should expire

5. **What HTTP status code indicates publisher overload?**
   - Expected: HTTP 429 (Too Many Requests)

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Student can explain benefits of chunking large files (vs. Quilts for small files)
- [ ] Student understands the two levels of parallelism (inter-blob, intra-blob with ~1000 shards)
- [ ] Student can describe three publisher options (remote, private, direct SDK writes)
- [ ] Student understands storage extension cost implications (gas fees add up)
- [ ] Student can explain why caching is easy with immutable blob IDs
- [ ] Student knows caveats for each cache layer (Nginx timeouts, Redis size limits, CDN costs)
- [ ] Student knows key production metrics to monitor
- [ ] Student understands HTTP 429 indicates rate limiting/overload
- [ ] Student completed hands-on lab and measured throughput improvement

### Quick Poll

- "Raise your hand if you saw at least 2x improvement in parallel uploads"
- "Thumbs up if you understand why cache invalidation isn't needed"
- "Show of hands: Who can name three metrics to monitor in production?"

---

## Additional Resources

### For Students

- [Walrus SDK Documentation](../../../usage/sdks.md) - SDK usage and examples
- [Publisher/Aggregator Guide](../../../operator-guide/aggregator.md) - Running your own publisher
- [Storage Costs](../../../dev-guide/costs.md) - Understanding cost model
- [Quilt Documentation](../../../usage/quilt.md) - Batching small files
- `hands-on-source-code/` - Lab source code

### For Instructors

- `crates/walrus-sdk/src/client/` - SDK implementation details
- `crates/walrus-sdk/src/uploader.rs` - DistributedUploader implementation
- `crates/walrus-sdk/src/utils.rs` - WeightedFutures implementation
- `crates/walrus-service/src/client/` - Publisher/Aggregator source

---

## Notes for Next Module

Students should now be ready for:

- Advanced SDK patterns (custom encoding, streaming)
- Production deployment and monitoring
- Cost optimization for large-scale applications
- Integration with CDNs and edge caching

**Key Concepts to Reinforce in Future Modules:**
- Always measure before optimizing (metrics first)
- Chunk large files (10-100MB); use Quilts for small files (<1MB)
- Cache aggressively with proper headers (`immutable` directive)
- Configure caches for large blobs (timeouts, size limits, buffering)
- Estimate storage duration upfront to avoid extension overhead
- Watch for HTTP 429 when pushing parallelism; use concurrency limits
