# Instructor's Guide: Walrus SDK with Upload Relay

## Quick Reference

**Total Time:** 120-150 minutes

**Difficulty:** Intermediate

**Hands-on Components:** Yes - Verification harness with runnable TypeScript examples

**Materials Needed:**

- Access to Walrus Testnet
- Node.js 20+ or Docker installed
- Funded Sui Testnet wallet (SUI + WAL tokens)
- Whiteboard for drawing upload/relay flow diagrams

**Key Takeaways:**

- Direct uploads use WASM encoding locally; relay uploads compute metadata only and stream raw bytes
- Upload relay simplifies browser/mobile workloads by handling fan-out, retries, and certificate aggregation
- Clients must verify blob IDs and on-chain state regardless of upload path
- Error hierarchy distinguishes retryable vs. permanent failures
- Quorum math: need 2/3+ confirmations for certification; can reconstruct with 50%+ slivers

## Prerequisites

### For Students

- Working knowledge of TypeScript/JavaScript and async/await patterns
- Familiarity with the Sui client SDK and having a funded Testnet wallet (SUI + WAL)
- Prior exposure to the CLI or SDK upload flow is helpful but not required
- Ability to read Mermaid diagrams and basic TypeScript/Rust snippets

### For Instructor

- Deep understanding of the Walrus storage model, erasure coding (RS2), and quorum rules
- Familiarity with the TypeScript SDK internals:
  - [client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts) - upload/download flows
  - [wasm.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/wasm.ts) - encoding bindings
  - [utils/retry.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/utils/retry.ts) - retry helper
- Awareness of relay internals ([controller.rs](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-upload-relay/src/controller.rs))
- Comfort running the verification harness (Docker or local Node.js)
- Prepared checkpoints (blob IDs, relay endpoints) for demos to reduce live-dependency risk

## Classroom Setup & Preparation

**Advance Prep (15 min before class):**

- [ ] Test that Mermaid diagrams render properly in student materials
- [ ] Verify verification harness runs (`make test` or `npm test`)
- [ ] Prepare a funded keypair with SUI + WAL tokens
- [ ] Have known-good blob IDs ready for download demonstrations
- [ ] Queue up key terms: "relay fan-out," "quorum," "certificate aggregation," "proof of availability"

**Optional Materials:**

- Physical puzzle pieces to demonstrate erasure coding
- Flowchart printouts of direct vs. relay upload paths

## Instructor Cheat Sheet

| #   | Section                  | Time      | Key Focus                                       |
| --- | ------------------------ | --------- | ----------------------------------------------- |
| 1   | Chunk Creation           | 12-15 min | WASM encoding, metadata, slivers                |
| 2   | Publisher/Aggregator     | 15-18 min | Node communication, confirmation flow, quorum   |
| 3   | Relay Batching           | 12-15 min | Fan-out, certificate generation, tips           |
| 4   | When to Use Relay        | 10-12 min | Browser/mobile vs. backend trade-offs           |
| 5   | Upload/Download Examples | 15-18 min | Live coding, verification harness               |
| 6   | Integrity Checks         | 10-12 min | Root hash, blob ID, certificate verification    |
| 7   | Retry & Partial Failures | 15-18 min | Error classification, backoff, quorum failures  |
| 8   | Error Handling           | 10-12 min | Error hierarchy, user-friendly messages         |
| 9   | Hands-On Lab             | 25-30 min | Build upload script with retries + verification |

---

## Section-by-Section Guidance

### Section 1: Chunk Creation and Encoding (12-15 min)

**Student Material:** `01-chunk-creation.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**

- Direct uploads call `encodeBlob()` locally via WASM bindings
- Relay uploads only compute metadata (`computeBlobMetadata`) before streaming raw bytes
- Metadata includes `blobId`, `rootHash`, and per-sliver-pair hashes
- Quilt encoding batches multiple files into one blob with an index

💡 **Teaching Tips:**

- Walk through the Mermaid diagram twice: first without the relay, then point out which steps disappear when `uploadRelay` is configured
- Highlight the WASM boundary - students often assume TypeScript performs encoding directly
- Show the `EncodedBlob` interface from `wasm.ts`:
  ```typescript
  interface EncodedBlob {
    sliverPairs: SliverPair[];
    blobId: string;
    metadata: BlobMetadata;
    rootHash: Uint8Array;
  }
  ```
- Use the table comparing standard vs. quilt encoding to anchor the concept

⚠️ **Common Misconceptions:**

- Students may think encoding happens server-side - clarify it's client-side via WASM
- Some confuse "slivers" with "shards" - slivers are the encoded data pieces, shards are the node assignments
- May assume relay does encoding - relay only encodes, client only computes metadata when using relay

💬 **Discussion Points:**

- "Why does the relay path skip local encoding? What's the trade-off?"
  - **Answer:** Saves CPU/memory on constrained devices; relay does heavy lifting server-side
- "When would you use quilt encoding instead of individual uploads?"
  - **Answer:** When you want one blob ID/certificate for many logical files, batch uploads, reduced on-chain costs

✅ **Quick Check:**

- "When does the SDK call `BlobEncoder.encode_with_metadata` on the client machine?"
  - **Answer:** Only for direct uploads (no relay configured)
- "What minimum metadata must be computed locally before calling the relay?"
  - **Answer:** `blobId`, `rootHash`, `nonce`, `blobDigest`

**Transition to Next Section:**

"Now that we understand how chunks are created, let's see how the SDK distributes them to storage nodes."

---

### Section 2: Publisher and Aggregator Interaction (15-18 min)

**Student Material:** `02-publisher-aggregator-interaction.md`

⏱️ **Duration:** 15-18 minutes

🎯 **Key Points to Emphasize:**

- Upload flow: Encode → Register on-chain → Distribute slivers → Collect confirmations → Certify
- Each confirmation is a BLS signature proving the node stored its shard
- Quorum math: need confirmations covering > 2/3 of shards for certification
- Read flow: Fetch metadata → Request slivers in parallel → Reconstruct with `ceil(n/2) + 1` slivers

💡 **Teaching Tips:**

- Annotate the sequence diagram with live callouts (Step 4 = Proof of Availability)
- Trace a single sliver through the flow: metadata post → sliver post → confirmation fetch
- Show the actual code from `writeEncodedBlobToNodes()`:
  ```typescript
  if (isAboveValidity(failures, systemState.committee.n_shards)) {
    const error = new NotEnoughBlobConfirmationsError(...);
    controller.abort(error);
  }
  ```
- Demonstrate a download and pause when quorum is met to connect code to diagram

⚠️ **Common Misconceptions:**

- Students may think all nodes must respond - clarify that some failures are tolerated
- May confuse `NotFoundError` (sliver not found) with `BlobNotCertifiedError` (blob never certified)
- Might assume sequential uploads - emphasize parallel distribution with `Promise.all`

💬 **Discussion Points:**

- "Why does `writeEncodedBlobToNodes` abort once `isAboveValidity` returns true?"
  - **Answer:** Once too many shards have failed, quorum is impossible - abort early to save time/resources
- "What's the difference between `NotFoundError` and `BlobNotCertifiedError` during reads?"
  - **Answer:** `NotFoundError` = single node doesn't have it; `BlobNotCertifiedError` = quorum says blob doesn't exist

✅ **Quick Check:**

- "How many confirmations do you need for a 1000-shard committee?"
  - **Answer:** More than 667 (> 2/3)
- "What SDK error is thrown when too many nodes fail during upload?"
  - **Answer:** `NotEnoughBlobConfirmationsError`

**Transition to Next Section:**

"Direct uploads require managing all these node communications. Let's see how the relay simplifies this."

---

### Section 3: Relay Batching and Reliability (12-15 min)

**Student Material:** `03-relay-batching-reliability.md`

⏱️ **Duration:** 12-15 minutes

🎯 **Key Points to Emphasize:**

- Relay accepts single client request, fans out to all nodes, returns aggregated certificate
- Client flow with relay: compute metadata → register + send tip → stream blob to relay → certify with relay's certificate
- Relay uses same `send_blob_data_and_get_certificate()` as direct uploads
- Tips fund relay resources; `sendUploadRelayTip` injects payment into transaction

💡 **Teaching Tips:**

- Rehearse the dialogue: "What breaks if the client drops offline mid-upload?" vs. "What if the relay handles it?"
- Show the relay code snippet with inline comments showing certificate handoff:
  ```typescript
  const result = await this.writeBlobToUploadRelay({ ... });
  const certificate = result.certificate;
  await this.executeCertifyBlobTransaction({ certificate, ... });
  ```
- Draw the comparison: Direct = many connections; Relay = one connection + server-side fan-out

⚠️ **Common Misconceptions:**

- Students may think relay provides more guarantees - clarify it's still the same quorum rules
- Some assume tips are optional - paid relays require tips; free relays accept `no_tip`
- May not realize relay performs encoding server-side - that's part of its value

💬 **Discussion Points:**

- "Which component generates the certificate in a relay upload?"
  - **Answer:** The relay aggregates confirmations and returns the certificate
- "Why does the relay keep persistent connections to storage nodes?"
  - **Answer:** Connection pooling, reduced latency, geographic optimization

✅ **Quick Check:**

- "What's sent to the relay: encoded slivers or raw blob bytes?"
  - **Answer:** Raw blob bytes - relay does encoding
- "What does `tipConfig()` return?"
  - **Answer:** Tip configuration (`const` or `linear`) with address and amounts

**Transition to Next Section:**

"Now that we understand both paths, let's decide when to use each."

---

### Section 4: When to Use / Not Use Relay (10-12 min)

**Student Material:** `04-when-to-use-relay.md`, `05-when-not-to-use-relay.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**

- **Use relay for:** Browser apps, mobile apps, simplified error handling, limited bandwidth/connections
- **Avoid relay for:** Backend services, custom retry logic, detailed monitoring, cost optimization
- Trade-off table: Relay = simpler code, less control; Direct = more code, full control
- Configuration difference is just `uploadRelay: { host, sendTip }` presence

💡 **Teaching Tips:**

- Have students map their own project requirements onto the trade-off table
- Reference the operator guide to show continuity with product positioning
- Emphasize that "when not to use relay" still reuses most SDK calls - only configuration differs
- Real-world example: "Mobile photo backup app → relay. High-volume backend archiver → direct."

⚠️ **Common Misconceptions:**

- Students may think relay is always better - direct offers advantages for backends
- Some assume relay is free - tips may be required
- Might think relay adds trust assumptions - verification still required client-side

💬 **Discussion Points:**

- "Name two situations where you would deliberately avoid the relay."
  - **Answer:** Custom retry logic needed; cost optimization; detailed per-node monitoring
- "What extra information does the relay return that a direct upload must compute itself?"
  - **Answer:** The aggregated `ProtocolMessageCertificate`

✅ **Quick Check:**

- "True or False: Using relay means you don't need to verify blob IDs"
  - **Answer:** False - always verify regardless of upload path
- "What fields configure the relay in the SDK?"
  - **Answer:** `host` and `sendTip` (with `max` or `type`/`value`)

**Transition to Next Section:**

"Let's see both paths in action with runnable code examples."

---

### Section 5: Basic Upload and Download Examples (15-18 min)

**Student Material:** `06-basic-upload-example.md`, `07-basic-download-example.md`

⏱️ **Duration:** 15-18 minutes

🎯 **Key Points to Emphasize:**

- Every snippet is runnable from the verification harness
- Upload path differences boil down to client configuration
- Download examples include error handling for `BlobNotCertifiedError`, `NotEnoughSliversReceivedError`
- Same `writeBlob` API works for both direct and relay paths

💡 **Teaching Tips:**

- Start live coding from `basic-upload-example.ts` using environment variable for passphrase
- Run `npm run test:basic-upload` to show both direct and relay paths executing
- Keep a known-good `blobId` handy for download demos to sidestep upload dependency
- Highlight the simplicity: same API, different config

**Live Demo Flow:**

1. Show client config without relay
2. Run upload, note blob ID
3. Show client config with relay
4. Run upload, compare output
5. Run download with saved blob ID

⚠️ **Common Misconceptions:**

- Students may think different APIs for direct vs. relay - same `writeBlob`, different config
- Some assume downloads require the relay - downloads always go direct to nodes
- May not realize `readBlob` automatically handles sliver fetching and reconstruction

💬 **Discussion Points:**

- "What two additional fields must be provided when configuring `uploadRelay`?"
  - **Answer:** `host` and `sendTip`
- "Which helper decodes returned bytes into friendly text?"
  - **Answer:** `TextDecoder().decode(blobBytes)`

✅ **Quick Check:**

- "What command runs the upload tests in Docker?"
  - **Answer:** `make test-upload`
- "How do you pass a blob ID to the download test?"
  - **Answer:** `npm run test:basic-download -- <blob-id>`

**Transition to Next Section:**

"We've uploaded and downloaded. Now let's verify the data is actually correct."

---

### Section 6: Integrity Checks (10-12 min)

**Student Material:** `08-integrity-checks.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**

- Root hash = Merkle root of encoded data; computed during encoding, stored on-chain
- Blob ID is deterministic - same data always produces same blob ID
- Certificate proves quorum of nodes stored the data
- SDK automatically verifies during `readBlob`; manual verification also possible

💡 **Teaching Tips:**

- Trace each validation step on diagram: hash comparison → certificate validation → byte comparison
- Show `computeBlobMetadata` returning `rootHash` and `blobDigest`
- Mention real-world uses (compliance, audit logs) to motivate the extra work
- Encourage students to intentionally tamper with data locally to watch verification fail

⚠️ **Common Misconceptions:**

- Students may think verification is optional - SDK does it automatically on reads
- Some think certificate verification happens at download - it's checked during certification
- May assume root hash is over raw bytes - it's over encoded slivers

💬 **Discussion Points:**

- "What three values does the SDK compare before declaring a blob verified?"
  - **Answer:** Blob ID, root hash, and sliver hashes (via metadata)
- "Why is the root hash computed over encoded bytes instead of raw?"
  - **Answer:** Allows verification without downloading all slivers; Merkle proofs work on encoded structure

✅ **Quick Check:**

- "How do you verify a Publisher encoded your blob correctly?"
  - **Answer:** Download and re-encode; compare blob IDs. If they match, encoding was correct.
- "What error is thrown if blob integrity check fails?"
  - **Answer:** `InconsistentBlobError`

**Transition to Next Section:**

"Now let's handle the cases when things go wrong - retries and partial failures."

---

### Section 7: Retry Patterns and Partial Failures (15-18 min)

**Student Material:** `09-retry-patterns.md`, `10-partial-failures.md`

⏱️ **Duration:** 15-18 minutes

🎯 **Key Points to Emphasize:**

- SDK includes `retry()` helper with `count`, `delay`, `jitter`, `condition` options
- Retryable errors extend `RetryableWalrusClientError`
- Partial failure handling is built into `writeEncodedBlobToNodes()` and `getSlivers()`
- Shard weight determines abort decisions - not just node count

💡 **Teaching Tips:**

- Live-run retry examples so students see each strategy's console output
- Annotate the code snippets and ask students to predict behavior before running
- Compare retry counts between relay and direct uploads to highlight operational savings
- Show the flowchart of exponential backoff decision logic

**Code to highlight:**

```typescript
return retry(
  () => client.walrus.writeBlob({ ... }),
  {
    count: 5,
    delay: 1000,
    condition: (error) => error instanceof RetryableWalrusClientError,
  },
);
```

⚠️ **Common Misconceptions:**

- Students may think all errors should be retried - some are permanent (`BlobBlockedError`)
- Some assume retry count = guaranteed success - network may stay down
- May not realize shard weight matters more than node count for quorum

💬 **Discussion Points:**

- "What condition function would you pass to `retry()` to avoid retrying `BlobBlockedError`?"
  - **Answer:** `(error) => error instanceof RetryableWalrusClientError`
- "How does the SDK decide it's impossible to reach quorum during downloads?"
  - **Answer:** Tracks `NotFound`/`LegallyUnavailable` weight; if exceeds quorum threshold, aborts

✅ **Quick Check:**

- "Name two retryable errors and two non-retryable errors"
  - **Retryable:** `NotEnoughBlobConfirmationsError`, `NotEnoughSliversReceivedError`
  - **Non-retryable:** `InconsistentBlobError`, `BlobBlockedError`
- "What's the exponential backoff formula shown in the docs?"
  - **Answer:** `Math.pow(2, attempt) * 1000` milliseconds

**Transition to Next Section:**

"We know how to retry. Now let's learn how to surface meaningful errors to users."

---

### Section 8: Error Handling (10-12 min)

**Student Material:** `11-error-handling.md`

⏱️ **Duration:** 10-12 minutes

🎯 **Key Points to Emphasize:**

- Error hierarchy: `WalrusClientError` → `RetryableWalrusClientError` → specific errors
- `getUserFriendlyError()` pattern transforms technical errors to user messages
- Preserve error context when wrapping (`originalError`, `attempt`, `blobId`)
- Log appropriately: don't report retryable errors to error tracking services

💡 **Teaching Tips:**

- Role-play: present raw SDK error objects and have students translate using `getUserFriendlyError`
- Point out where to surface actionable advice ("wait a few minutes", "check tip configuration")
- Encourage linking telemetry (e.g., Sentry) to these helper functions for better ops visibility
- Show the complete error handling example at the end of the section

⚠️ **Common Misconceptions:**

- Students may swallow errors silently - emphasize always handle or rethrow
- Some log all errors equally - distinguish retryable from permanent for alerts
- May not preserve original error - loses debugging information

💬 **Discussion Points:**

- "Which error indicates the client is behind the current epoch?"
  - **Answer:** `BehindCurrentEpochError`
- "Why might you still show the original error in development builds?"
  - **Answer:** Debugging - need full stack trace and context during development

✅ **Quick Check:**

- "What's the parent class for all retryable Walrus errors?"
  - **Answer:** `RetryableWalrusClientError`
- "Give an example user-friendly message for `NotEnoughBlobConfirmationsError`"
  - **Answer:** "Upload failed: Not enough storage nodes confirmed. Please try again."

**Transition to Next Section:**

"Time to put everything together in the hands-on lab!"

---

### Section 9: Hands-On Lab (25-30 min)

**Student Material:** `12-hands-on.md`

⏱️ **Duration:** 25-30 minutes

🎯 **Key Points to Emphasize:**

- Students build a complete upload script with relay, retries, and verification
- Lab mirrors earlier sections to consolidate concepts
- Canonical solution is in `hands-on-source-code/src/examples/hands-on-lab.ts`

💡 **Teaching Tips:**

- Let students pair-program; the lab is a natural checkpoint for peer teaching
- Provide staged milestones: encode → upload → retry → verify
- Remind students to recycle blob IDs or delete blobs if quotas are limited
- Walk through the flowchart first to set expectations

**Lab Flow:**

1. Configure client with relay
2. Implement retry loop for `RetryableWalrusClientError`
3. Upload content
4. Download and verify integrity
5. Declare success or diagnose failure

⚠️ **Common Misconceptions:**

- Students may forget to increment attempt counter - causes infinite loops
- Some check `instanceof Error` instead of specific error classes
- May not wait between retries - needs exponential or linear backoff

💬 **Discussion Points:**

- "Where does the lab pull relay configuration from?"
  - **Answer:** Hardcoded in script: `https://upload-relay.testnet.walrus.space`

✅ **Quick Check:**

- Students should successfully:
  - Upload a blob with retry logic
  - Download and verify content matches
  - See "SUCCESS: Integrity verified!" message

**Troubleshooting During Hands-On:**

- **Issue:** Invalid mnemonic error
  - **Fix:** Use valid BIP-39 mnemonic or default passphrase
- **Issue:** Insufficient WAL balance
  - **Fix:** Exchange SUI for WAL using the `getFundedKeypair` helper
- **Issue:** Network timeout
  - **Fix:** Retry - transient Testnet issues are normal

---

## Wrap-up and Assessment (5 min)

### Exit Ticket (Written or Verbal)

Ask students to answer briefly:

1. **What's the main difference between direct uploads and relay uploads?**

   - Expected: Direct = client encodes and distributes; Relay = client streams bytes, relay handles rest

2. **Name three retryable errors and when you'd encounter them.**

   - Expected: `NotEnoughBlobConfirmationsError` (upload), `NotEnoughSliversReceivedError` (download), `BlobNotCertifiedError` (timing)

3. **How do you verify an uploaded blob is correct?**

   - Expected: Compare blob IDs (deterministic), check on-chain registration, download and compare content

4. **When would you use relay vs. direct uploads?**
   - Expected: Relay for browser/mobile/simplified code; Direct for backend/custom logic/cost control

### Assessment Checklist

Use this to gauge if the module was successful:

- [ ] Student can articulate every step of the direct upload flow, including proof of availability
- [ ] Student can explain how the relay offloads encoding, retries, and certificate generation
- [ ] Student has run the basic upload and download examples (locally or via Docker)
- [ ] Student can implement at least one retry strategy with error classification
- [ ] Student can classify SDK errors into retryable vs. permanent categories
- [ ] Student can perform integrity verification (blob ID, content comparison)
- [ ] Student completed the hands-on lab and can adapt it to their own project

### Quick Poll

- "Raise your hand if you can explain the difference between relay and direct uploads"
- "Thumbs up if you understand why `RetryableWalrusClientError` matters"
- "Show of hands: Who successfully ran the hands-on lab?"

---

## Additional Resources

### SDK and API References

- [Walrus TypeScript SDK - client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts) – Upload/download flows, retry hooks, relay integration
- [Walrus TypeScript SDK - retry.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/utils/retry.ts) – Canonical retry helper
- [Walrus TypeScript SDK - error.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/error.ts) – Error hierarchy
- [Walrus TypeScript SDK on NPM](https://www.npmjs.com/package/@mysten/walrus) – Official package

### Relay and Operator References

- [Walrus Upload Relay - controller.rs](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-upload-relay/src/controller.rs) – Relay batching and certificate logic
- [Walrus Operator Guide - Upload Relay](https://docs.wal.app/operator-guide/upload-relay.html) – Deployment, tips, production considerations

## Official Documentation

- [Walrus Documentation](https://docs.wal.app/) – Official docs
- [Walrus GitHub Repository](https://github.com/MystenLabs/walrus) – Core protocol
- [Walrus TypeScript SDK Repository](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus) – SDK source

---

## Notes for Next Module

Students should now be ready for:

- Advanced Walrus topics (epochs, storage continuity, extensions)
- Building production applications using Walrus SDK
- Integrating Walrus with existing applications
- Performance optimization and cost management

**Key Concepts to Reinforce in Future Modules:**

- Verification is critical (blob IDs, on-chain state) regardless of upload path
- Error handling and retry patterns are essential for production reliability
- Relay vs. direct is a deployment decision, not a functionality difference
- Quorum math applies universally - understanding it helps debug failures

## Module Completion Checklist

- [ ] Student can articulate every step of the direct upload flow, including proof of availability
- [ ] Student can explain how the relay offloads encoding, retries, and certificate generation, and knows when to enable it
- [ ] Student has run the basic upload and download examples (either locally or via Docker) and understands required configuration
- [ ] Student can implement at least one retry strategy and explain when to abandon retries
- [ ] Student can classify SDK errors into user-friendly categories and suggest recovery actions
- [ ] Student can perform integrity verification (hash, metadata, certificate) on a stored blob
- [ ] Student completed the hands-on lab and can adapt it to their own project requirements
- [ ] Student can cite official docs/resources for relay operation, storage node behavior, and SDK configuration
