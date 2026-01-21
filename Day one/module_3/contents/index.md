# Module 3: Operational Responsibilities and Failure Modes

Welcome to Module 3! This module shifts from understanding *how* Walrus works (Module 2) to understanding *how it operates in practice* - including what can go wrong and who's responsible for what.

## Learning Objectives

By the end of this module, you will be able to:

1. **Explain** the operational duties of Publishers, Aggregators, and Clients
2. **Identify** potential failure points in the system
3. **Distinguish** between what the system guarantees and what the client must verify
4. **Understand** the division of responsibilities between CLI, SDK, and application code
5. **Recognize** practical constraints when building on Walrus
6. **Inspect** logs to identify key operational events and troubleshoot issues

## Why This Module Matters

Module 2 taught you the architecture and data flows - the "happy path." But in production:

- Network connections fail
- Storage nodes go offline
- Transactions don't confirm
- Encoding can have edge cases
- Resources have limits

**This module prepares you for reality.** You'll learn:
- Where failures happen and how to handle them
- What guarantees you can rely on
- What you need to verify yourself
- How to troubleshoot using logs

## Curriculum Flow

Follow this recommended learning path (organized from beginner to advanced):

### 1. **[Component Duties](./01-component-duties.md)** 🟢 **Beginner** (15-20 min)
Learn what each component actually does in operation:
- Publisher responsibilities (encoding, distribution, gas, certificates)
- Aggregator responsibilities (queries, fetching, reconstruction, caching)
- Client responsibilities (verification, retries, error handling)

### 2. **[Failure Modes](./02-failure-modes.md)** 🟡 **Beginner/Intermediate** (15-20 min)
Understand where things can go wrong:
- Network failures
- Storage node failures
- Encoding failures
- Transaction failures
- Byzantine behavior

### 3. **[Control Boundaries](./04-control-boundaries.md)** 🟢🟡🔴 **Beginner to Advanced** (15-20 min)
Understand what the CLI vs. SDK controls:
- 🟢 **Beginner**: CLI - High-level operations with defaults
- 🟡 **Intermediate**: TypeScript SDK - Programmatic web/Node.js integration
- 🔴 **Advanced**: Rust SDK - Low-level control with maximum flexibility

### 4. **[System Guarantees vs. Client Responsibilities](./03-guarantees.md)** 🟡 **Intermediate** (10-15 min)
Know what's guaranteed and what you must check:
- What the system guarantees (Byzantine tolerance, data integrity)
- What the client must verify (blob ID matches, consistency checks)
- Trust boundaries and verification

### 5. **[Practical Constraints](./05-practical-constraints.md)** 🟡 **Intermediate** (10-15 min)
Learn real-world limitations:
- Blob size limits (13.3 GiB)
- Storage costs and epochs
- Network bandwidth considerations
- Gas and wallet management
- Rate limiting and quotas

### 6. **[Hands-On: Log Inspection](./06-hands-on.md)** 🟡 **Intermediate** (20-30 min)
Practice troubleshooting:
- Inspect publisher logs during upload
- Inspect aggregator logs during retrieval
- Identify key events (encoding, distribution, errors)
- Diagnose common failure scenarios

---

## Key Concepts

### Operational Duties
- **Publishers**: Manage encoding, distribution, gas, and certificates
- **Aggregators**: Handle queries, sliver fetching, reconstruction
- **Clients**: Verify results, implement retry logic, handle errors

### Failure Points
- **Network Layer**: Connectivity to storage nodes, Sui RPC
- **Storage Layer**: Node unavailability, sliver corruption
- **Encoding Layer**: Invalid encoding, hash mismatches
- **Transaction Layer**: Insufficient gas, transaction failures

### Guarantees
- **System Guarantees**: Data integrity, Byzantine tolerance, availability
- **Client Guarantees**: Must verify blob IDs, perform consistency checks

### Control
- **CLI Controls**: Complete workflows with sensible defaults
- **SDK Controls**: Fine-grained operations for custom logic

## Connection to Previous Modules

### From Module 1:
- You learned **why** Walrus exists (programmable decentralized storage)
- You learned about **durability** (erasure coding, Byzantine tolerance)
- You learned it's **public by default** (security implication)

### From Module 2:
- You learned **how** components work together (upload/retrieval flows)
- You learned **how** encoding works (Reed-Solomon, slivers, blob IDs)
- You learned the **architecture** (Storage Nodes, Publishers, Aggregators)

### In Module 3:
- You'll learn **what can go wrong** and how to handle it
- You'll learn **who's responsible for what** (system vs. client)
- You'll learn **practical constraints** for building applications
- You'll learn **how to troubleshoot** using logs

## Next Steps

Start with [Component Duties](./01-component-duties.md) to understand operational responsibilities, then proceed through each section in order. Complete the hands-on log inspection exercise to apply what you've learned.

## Key Points

- **Operations differ from architecture** - Things fail in production that work in diagrams
- **Responsibility boundaries matter** - Know what the system guarantees vs. what you must verify
- **Logs are essential** - Learn to read them for troubleshooting
- **Failures are normal** - Design your application to handle them gracefully
- **Trust but verify** - Publishers and Aggregators are untrusted; clients should verify results
