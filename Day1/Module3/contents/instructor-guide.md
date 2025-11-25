# Instructor's Guide: Module 3 - Operational Responsibilities and Failure Modes

## Quick Reference

**Total Time:** 60-75 minutes
**Difficulty:** Intermediate to Advanced
**Hands-on Components:** Log inspection exercise (20-30 min)
**Materials Needed:** Sample log files, access to Walrus CLI with debug logging

**Key Takeaways:**
- Publishers, Aggregators, and Clients have distinct operational responsibilities
- Failures occur at network, storage, encoding, transaction, and application layers
- System guarantees Byzantine tolerance and data integrity; clients must verify blob IDs
- CLI provides high-level workflows; SDK (Rust) provides fine-grained control
- Practical constraints include blob size limits (13.3 GiB), storage costs (WAL tokens), and memory requirements

## Prerequisites

### For Students
- Completed Module 1 (Introduction to Walrus)
- Completed Module 2 (Walrus Architecture)
- Understanding of upload and retrieval flows
- Familiarity with basic command-line operations
- Basic understanding of log analysis

### For Instructor
- Deep understanding of Walrus operational aspects
- Experience troubleshooting Walrus operations
- Sample log files prepared (successful and failed operations)
- Access to Walrus testnet for demonstrations
- Familiarity with common failure scenarios

## Classroom Setup

**Advance Prep (15 min before class):**
- [ ] Prepare sample log files (upload success, upload failure, retrieval success, retrieval with errors)
- [ ] Test Walrus CLI with `RUST_LOG=debug` to ensure students can generate logs
- [ ] Have sample blobs ready for demonstration
- [ ] Queue up failure scenarios to demonstrate (e.g., insufficient funds, blob too large)

**Materials:**
- Sample log files for hands-on exercise
- Whiteboard for drawing trust boundaries and failure taxonomy
- Access to Sui explorer for checking on-chain state

## Instructor Cheat Sheet

1. **Component Duties (15-20 min):** Publishers encode/distribute | Aggregators fetch/reconstruct | Clients verify
2. **Failure Modes (15-20 min):** Network | Storage nodes | Encoding | Transactions | Application | Use failure taxonomy
3. **System Guarantees (10-15 min):** What's guaranteed vs. what clients must check | Trust boundaries critical
4. **Control Boundaries (10-15 min):** CLI = high-level | SDK = low-level | When to use each
5. **Practical Constraints (10-15 min):** Blob size, costs, epochs, memory | Real-world design implications
6. **Hands-On Logs (20-30 min):** Walk through sample logs first | Then students analyze their own

---

## Section-by-Section Guidance

### Component Duties (15-20 min)
**Student Material:** component-duties.md

⏱️ **Duration:** 15-20 minutes

🎯 **Key Points to Emphasize:**
- **Publisher responsibilities**: Encoding, distribution, gas management, certificate aggregation
- **Aggregator responsibilities**: Metadata queries, sliver fetching, reconstruction, caching
- **Client responsibilities**: Verification (blob IDs), retry logic, error handling
- **Untrusted infrastructure**: Publishers and Aggregators are untrusted - clients must verify

💡 **Teaching Tips:**
- Use a table to show "What Can Fail" for each component's duties
- Emphasize the "trust but verify" model - Publishers/Aggregators are convenient but untrusted
- Connect to Module 2: Refresh the upload/retrieval flows, then map duties to each step
- Real-world example: "When you use a Publisher, you're trusting them to encode correctly. How do you verify? Re-encode and compare blob IDs."

⚠️ **Common Misconceptions:**
- Students may think Publishers/Aggregators are part of the "core" system - clarify they're optional infrastructure
- Some may assume Publishers are trusted - emphasize they're untrusted and must be verified
- Students might not realize clients have significant responsibilities beyond just calling APIs

💬 **Discussion Points:**
- "Why are Publishers considered untrusted? What could a malicious Publisher do?"
  - **Answer:** Could encode incorrectly, not distribute to enough nodes, not post certificate. Clients verify by checking blob ID, on-chain events, and performing reads.
- "When would you run your own Publisher instead of using a public one?"
  - **Answer:** Production applications, need reliability/SLA, don't want to trust third parties, need custom logic.

✅ **Quick Check:**
- Ask 2-3 students: "What are the three main responsibilities of a Publisher?"
- Quick quiz: "True or False: Aggregators perform on-chain transactions" (False - they only read)
- "What must clients verify after an upload?" (Blob ID, on-chain registration, point of availability)

**Transition to Next Section:**
"Now that you understand who's responsible for what, let's look at where things can go wrong in each of these responsibilities."

---

### Failure Modes (15-20 min)
**Student Material:** failure-modes.md

⏱️ **Duration:** 15-20 minutes (most content-heavy section)

🎯 **Key Points to Emphasize:**
- **Failure taxonomy**: Network | Storage Node | Encoding | Transaction | Application layers
- **Byzantine tolerance**: System handles up to 1/3 Byzantine nodes automatically
- **Retryable vs. non-retryable**: Some failures need retry, others need fixes (e.g., insufficient funds)
- **Check on-chain state**: Critical after timeouts to avoid duplicate operations

💡 **Teaching Tips:**
- Use the whiteboard to draw the 5-layer failure taxonomy as a stack
- Walk through one failure scenario in detail (e.g., network timeout during upload)
  - What happens? → System behavior → Client should do what?
- Use the "Failure Response Cheatsheet" table - very helpful reference
- Emphasize: "Everything fails eventually in distributed systems - design for it"
- Real demonstration: Show a timeout scenario and checking on-chain state with `sui client`

⚠️ **Common Misconceptions:**
- Students may think all failures are fatal - many are transient and retryable
- Some assume the system handles all failures automatically - clients must implement retry logic
- Students might think Byzantine tolerance means the system never fails - it means tolerates up to 1/3 Byzantine
- May assume transaction timeout = transaction failed - could have succeeded, must check on-chain

💬 **Discussion Points:**
- "What's the difference between a network timeout and insufficient funds error?"
  - **Answer:** Timeout is retryable (transient), insufficient funds is not (need to add funds first)
- "Why must you check on-chain state after a timeout?"
  - **Answer:** Transaction may have succeeded but client didn't see confirmation. Retrying blindly could duplicate operations or waste gas.
- "If 400 out of 1000 storage nodes are offline during upload, will it succeed?"
  - **Answer:** Possibly yes - need 2/3 quorum (667 signatures). If 600 respond, upload fails. If 700+ respond, upload succeeds.

✅ **Quick Check:**
- Scenario: "Upload times out. What do you do first?" (Check on-chain state)
- "Give me an example of a retryable failure" (Network timeout, storage node offline)
- "Give me an example of a non-retryable failure" (Blob too large, insufficient funds)

**If Time Permits:**
- Walk through a complex scenario: "Publisher distributes slivers, but only 650/1000 nodes respond. What happens?"
  - Answer: Quorum not reached (need 667). Upload fails. Client should retry - different nodes may respond.

**Transition to Next Section:**
"We've seen what can fail. Now let's be clear about what the system guarantees versus what you're responsible for checking."

---

### System Guarantees vs. Client Responsibilities (10-15 min)
**Student Material:** guarantees.md

⏱️ **Duration:** 10-15 minutes

🎯 **Key Points to Emphasize:**
- **System guarantees**: Data integrity (blob ID), Byzantine tolerance, availability (after PoA), deterministic encoding
- **NOT guaranteed**: Privacy (public by default!), publisher honesty without verification, free storage
- **Trust boundaries**: Sui blockchain and crypto = trusted | Publishers/Aggregators = untrusted | Client must verify
- **Verification checklist**: What to check after upload and before trusting retrieved data

💡 **Teaching Tips:**
- Draw the trust boundary diagram on whiteboard (from guarantees.md - three boxes: Trusted, Untrusted, Client Responsibility)
- Use a comparison table to show "System Guarantees" vs. "Client Must Handle"
- Emphasize the "public by default" warning from Module 1 - reinforces critical security point
- Real demonstration: Show how to verify a blob ID by re-encoding
- Connect to Module 1: "Remember we said Walrus is public by default? This is why clients must encrypt sensitive data themselves."

⚠️ **Common Misconceptions:**
- 🚨 **CRITICAL**: Students may think Walrus provides privacy - it's PUBLIC by default, must encrypt client-side
- Some may think blob IDs being hard to guess provides security - no, assume blob IDs can be discovered
- May assume Publishers encode correctly without verification - must verify via blob ID
- Students might think storage is free or permanent - costs WAL tokens, expires after N epochs

💬 **Discussion Points:**
- "If Walrus is public by default, how do you store sensitive financial records?"
  - **Answer:** Encrypt client-side before upload. Only those with decryption key can read.
- "How do you verify a Publisher encoded your blob correctly?"
  - **Answer:** Download the blob, re-encode it, compare blob IDs. If they match, encoding was correct (deterministic).
- "What's the difference between default and strict consistency checks?"
  - **Answer:** Default verifies first 334 sliver hashes (fast). Strict re-encodes entire blob and verifies blob ID (slower, maximum verification).

✅ **Quick Check:**
- True/False quiz:
  - "Walrus guarantees my data is private" (False)
  - "If blob ID matches, data is authentic" (True)
  - "Publishers are trusted components" (False)
- "Name three things the system guarantees" (Data integrity, Byzantine tolerance, availability after PoA)
- "Name three things clients must verify" (Blob ID, on-chain registration, consistency checks)

**Transition to Next Section:**
"Now that you know what to verify, let's talk about the tools you use to interact with Walrus - CLI versus SDK."

---

### Control Boundaries: CLI vs SDK (10-15 min)
**Student Material:** control-boundaries.md

⏱️ **Duration:** 10-15 minutes

🎯 **Key Points to Emphasize:**
- **CLI**: High-level, complete workflows, sensible defaults, easy to use
- **SDK (Rust crate)**: Low-level, fine-grained control, more responsibility
- **What CLI controls**: Entire upload/retrieval workflow automatically
- **What SDK exposes**: Building blocks - you implement retry logic, error handling, parallelism
- **When to use each**: CLI for scripts/testing, SDK for production applications with custom logic

💡 **Teaching Tips:**
- Use the comparison table (CLI vs SDK) - project on screen or draw on whiteboard
- Show the decision tree: "Do you need custom logic? → SDK. Are defaults sufficient? → CLI."
- Demonstrate CLI command with `RUST_LOG=debug` to show what it's doing automatically
- Emphasize: SDK is Rust only - no Python/JS SDK currently exists
- Real example: "If you need to upload 1000 blobs efficiently with custom retry logic, SDK. If you're backing up a few files, CLI."

⚠️ **Common Misconceptions:**
- Students may think there's a Python or JavaScript SDK - only Rust currently
- May assume CLI can do everything SDK can - CLI has limitations (no custom retry logic, parallelism, etc.)
- Might think SDK is always better - no, CLI is better for simple use cases (easier, less code)
- May not realize SDK requires implementing significant logic (wallet management, retries, error handling)

💬 **Discussion Points:**
- "When would you choose CLI over SDK even for a production application?"
  - **Answer:** If shell scripting is sufficient, defaults are fine, or you're not using Rust. Can wrap CLI in other languages.
- "What are the main disadvantages of using SDK?"
  - **Answer:** More code to write, more responsibility (wallet, gas, retries), Rust only, higher learning curve.
- "Can you use both CLI and SDK in the same application?"
  - **Answer:** Yes - CLI for simple operations, SDK for complex ones. Or CLI in scripts, SDK in main application.

✅ **Quick Check:**
- "I need to upload 10,000 blobs with custom retry logic and progress tracking. CLI or SDK?" (SDK)
- "I'm writing a bash backup script. CLI or SDK?" (CLI)
- "True or False: SDK gives you more control but more responsibility" (True)
- "What language is the Walrus SDK written in?" (Rust)

**Transition to Next Section:**
"Whether you use CLI or SDK, you'll hit practical constraints. Let's talk about blob size limits, costs, and other real-world limitations."

---

### Practical Constraints (10-15 min)
**Student Material:** practical-constraints.md

⏱️ **Duration:** 10-15 minutes

🎯 **Key Points to Emphasize:**
- **Blob size limit**: 13.3 GiB maximum - must split larger files
- **Storage costs**: WAL tokens per epoch per GiB, plus SUI for gas
- **Storage epochs**: Blobs expire after N epochs unless extended
- **Memory requirements**: ~2-3x blob size for encoding, ~1.5-2x for decoding
- **Byzantine tolerance assumption**: Requires > 2/3 honest nodes

💡 **Teaching Tips:**
- Start with the most important constraint: blob size limit (13.3 GiB)
- Show cost calculation example: "1 GiB for 10 epochs = 10X WAL + gas"
- Emphasize epochs are time-limited - blobs don't last forever (unless permanent)
- Memory demonstration: "Uploading a 5 GB file needs ~15 GB RAM"
- Use the comparison table (Walrus vs. Traditional Storage like S3) to set expectations

⚠️ **Common Misconceptions:**
- Students may think blobs last forever - they expire after N epochs
- May not realize memory requirements are significant for large blobs
- Might assume storage is free - costs WAL tokens and SUI gas
- Could think any size blob can be uploaded - 13.3 GiB hard limit
- May assume immediate availability - brief delay for certificate posting

💬 **Discussion Points:**
- "How would you store a 50 GB video file on Walrus?"
  - **Answer:** Split into chunks (e.g., 10 GB each), upload separately, create manifest file listing all blob IDs.
- "What happens if you forget to extend storage epochs before expiration?"
  - **Answer:** Blob may be deleted by storage nodes. No guarantee of retrieval. Must re-upload.
- "Why does encoding require so much memory?"
  - **Answer:** Erasure coding creates ~4.5x redundancy, needs to process entire blob, creates Merkle trees. Encoding is memory-intensive.

✅ **Quick Check:**
- "What's the maximum blob size?" (13.3 GiB)
- "If a blob is stored for 5 epochs, what happens after 5 epochs?" (It expires and may be deleted)
- "How much RAM do you need to encode a 4 GB blob?" (~8-12 GB)
- "Does storage cost money?" (Yes - WAL tokens for storage, SUI for gas)

**If Time Permits:**
- Advanced: "The system requires > 2/3 honest nodes. What if exactly 2/3 are honest?" (Edge case - system should still work but with no margin for error)
- Scenario: "You're building a video streaming app. What constraints are most relevant?" (Blob size for large videos, bandwidth for streaming, epochs for retention, costs for large amounts of data)

**Transition to Next Section:**
"Theory is good, but let's get hands-on. We're going to inspect actual logs to see these concepts in action."

---

### Hands-On: Log Inspection (20-30 min)
**Student Material:** hands-on.md

⏱️ **Duration:** 20-30 minutes

🎯 **Key Points to Emphasize:**
- **Enable verbose logging**: `RUST_LOG=debug` or `RUST_LOG=trace`
- **Key upload events**: Encoding → Registration → Distribution → Signatures → Certificate
- **Key retrieval events**: Metadata query → Sliver fetching → Reconstruction → Consistency check
- **Error diagnosis**: Look for ERROR/WARN levels, identify which phase failed
- **Timing analysis**: Use timestamps to measure phase durations

💡 **Teaching Tips:**
- **Demonstrate first**: Show students a complete upload with `RUST_LOG=debug` before they try
- Walk through sample logs step-by-step, highlighting key events
- Use the "Key Events to Look For" tables as reference
- Show both success and failure scenarios
- Have students work in pairs to analyze logs (peer learning)
- Provide sample log files if students don't have Walrus CLI access

**Sample Demonstration Flow:**
1. Show CLI upload with debug logging
2. Point out key events: encoding, blob ID, distribution, signatures, certificate
3. Show how to calculate time for each phase
4. Demonstrate a failure (e.g., blob too large)
5. Show how error appears in logs and how to diagnose

⚠️ **Common Misconceptions:**
- Students may not know how to enable Rust logging environment variable
- Might get overwhelmed by amount of log output - guide them to focus on INFO/WARN/ERROR first
- May not understand log timestamps - explain format and how to calculate durations
- Could miss the connection between log events and upload/retrieval flow phases

💬 **Discussion Points:**
- "In the sample upload log, how can you tell when quorum was reached?"
  - **Answer:** Look for "Collected X/Y signatures (quorum reached)" where X ≥ 2/3 of Y.
- "What would you look for in logs if retrieval is slow?"
  - **Answer:** Time between "Fetching slivers" and "Fetched X/X slivers" - shows if storage nodes are slow to respond.
- "If you see 'Blob too large' error, at what phase did it fail?"
  - **Answer:** Pre-encoding phase (file size check before encoding starts).

✅ **Quick Check:**
- Students should successfully identify in their own logs:
  - Blob ID
  - Number of signatures collected
  - Whether quorum was reached
  - Total upload/retrieval time
- Ask: "What log level indicates an error?" (ERROR)
- "What event indicates upload is complete?" ("Blob available at point of availability" or "Certificate posted")

**Hands-On Exercises:**
1. Exercise 2.1 & 2.2: Analyze sample upload logs (identify phases, key events)
2. Exercise 3.1 & 3.2: Diagnose failure scenarios (blob too large, network failures)
3. Exercise 4.1: Trace retrieval flow in sample logs
4. Exercise 5.1 & 5.2: Generate and analyze their own logs (real upload/retrieval)

**Troubleshooting During Hands-On:**
- **Issue**: `RUST_LOG` not working
  - **Fix**: Ensure environment variable is exported: `export RUST_LOG=debug`
- **Issue**: Too much log output
  - **Fix**: Pipe to file and filter: `walrus store file.txt 2>&1 | tee upload.log` then `grep "INFO\|WARN\|ERROR" upload.log`
- **Issue**: Students don't have Walrus CLI
  - **Fix**: Provide pre-generated sample log files for analysis

**Transition to Wrap-up:**
"Great work analyzing logs! Let's review what we've learned in this module."

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **Name two responsibilities of Publishers and two responsibilities of Clients.**
   - Expected: Publishers: encode, distribute | Clients: verify blob IDs, implement retries
2. **Give an example of a retryable failure and a non-retryable failure.**
   - Expected: Retryable: network timeout | Non-retryable: blob too large
3. **What does the system guarantee? What must clients verify?**
   - Expected: System: data integrity, Byzantine tolerance | Clients: blob IDs, on-chain state
4. **When would you use CLI vs. SDK?**
   - Expected: CLI: scripts, testing, defaults fine | SDK: production apps, custom logic, Rust

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Students can explain operational duties of Publishers, Aggregators, and Clients
- [ ] Students can identify failure types (network, storage node, encoding, transaction, application)
- [ ] Students understand what the system guarantees vs. what clients must verify
- [ ] Students know when to use CLI vs. SDK
- [ ] Students are aware of practical constraints (blob size, costs, epochs, memory)
- [ ] Students can inspect logs to identify key events and diagnose issues

### Quick Poll

- "Raise your hand if you can identify the blob ID in an upload log"
- "Thumbs up if you understand why Publishers are untrusted"
- "Show of hands: Who can explain the difference between CLI and SDK?"

---

## Additional Resources

### For Students

- [Walrus Developer Operations Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/dev-operations.md)
- [Properties and Guarantees Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/properties.md)
- [Walrus CLI Documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/client-cli.md)
- [Walrus SDK (Rust) Documentation](https://github.com/MystenLabs/walrus) - check crates/walrus-sdk

### For Instructors

- Sample log files (prepare successful and failed operations)
- Failure scenario scripts for demonstrations
- Additional troubleshooting guides for common issues

---

## Notes for Next Module

Students should now be ready for:
- Advanced Walrus topics (epochs, storage continuity, extensions)
- Building applications using Walrus SDK
- Integrating Walrus with existing applications
- Performance optimization and cost management

**Key Concepts to Reinforce in Future Modules:**
- Verification is critical (blob IDs, on-chain state)
- Failures are normal - design for resilience
- Understand what you control vs. what system handles
- Log analysis is essential for troubleshooting
