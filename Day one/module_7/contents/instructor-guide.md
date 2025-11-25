# Instructor's Guide: Walrus SDK with Upload Relay

## Learning Objectives

By the end of this curriculum, students should be able to:

- **Explain the end-to-end upload pipeline** from local encoding through storage-node confirmations and certification.
- **Differentiate direct uploads from relay-assisted uploads**, including quorum math, failure handling, and certificate generation.
- **Implement resilient upload/download clients** that use the Walrus TypeScript SDK with retries, error handling, and integrity checks.
- **Select the right deployment pattern** (relay vs. direct) for browser, mobile, and backend workloads, and defend the trade-offs.
- **Operate the provided verification harness** to validate code samples and hands-on exercises.

## Prerequisites

### For Students

- Working knowledge of TypeScript/JavaScript and async/await patterns.
- Familiarity with the Sui client SDK and having a funded Testnet wallet (SUI + WAL).
- Prior exposure to the CLI or SDK upload flow is helpful but not required.
- Ability to read high-level architecture diagrams (Mermaid) and basic Rust/TypeScript snippets.

### For Instructor

- Deep understanding of the Walrus storage model, erasure coding (RS2), and quorum rules.
- Familiarity with the TypeScript SDK internals (see [client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts), [wasm.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/wasm.ts), [utils/retry.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/utils/retry.ts)).
- Awareness of relay internals ([controller.rs](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-upload-relay/src/controller.rs)) and operator guidance ([upload-relay docs](https://docs.wal.app/operator-guide/upload-relay.html)).
- Comfort running the verification harness (note: this may be in a separate repository - check with your training provider).
- Prepared checkpoints (blob IDs, relay endpoints) for demos to reduce live-dependency risk.

## Section-by-Section Guidance

### Section 1: Chunk Creation and Encoding (`01-chunk-creation.md`)

**Key Points to Emphasize:**

- Direct uploads call `encodeBlob()` locally (see [wasm.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/wasm.ts)) while relay uploads only compute metadata before streaming raw bytes.
- Metadata (`blobId`, `rootHash`, `MerkleNode` digests) mirrors the `BlobMetadataWithId` structure defined in [utils/bcs.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/utils/bcs.ts).
- Sliver grouping and quilt encoding are orchestrated by `WalrusClient.writeEncodedBlobToNodes()` and `writeFilesFlow()` in [client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts).

**Teaching Tips:**

- Walk through the Mermaid diagram twice: first without the relay, then point out which steps disappear when `uploadRelay` is configured.
- Bring up a short file in the verification repo and show how quilt encoding packs several files—this makes the table comparing standard vs. quilt encoding concrete.
- Highlight the WASM boundary; students often assume TypeScript performs encoding directly.

**Quick Check:**

- “When does the SDK call `BlobEncoder.encode_with_metadata` on the client machine?”
- “What minimum metadata values must be persisted locally before calling `writeBlob` through the relay?”

**Discussion Points:**

- Trade-offs of running heavy encoding on constrained devices.
- How quilt encoding changes operational workflows (indexing, deletion, selective download).

---

### Section 2: Publisher and Aggregator Interaction (`02-publisher-aggregator-interaction.md`)

**Key Points to Emphasize:**

- The SDK sequences `writeMetadataToNode`, `writeSliversToNode`, and `getStorageConfirmationFromNode` helpers inside `writeEncodedBlobToNodes()` (see [client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts)).
- Quorum math uses `Math.ceil(numShards / 2) + 1` for RS2 validity and `isQuorum()` to short-circuit when too many nodes return `NotFound`/`LegallyUnavailable`.
- Proof of Availability = collected BLS signatures returned in Step 4 of the upload flow diagram.
- Read flow error classes live under [storage-node/error.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/storage-node/error.ts); students should understand when `UserAbortError` fires.

**Teaching Tips:**

- Annotate the Mermaid diagrams with live callouts (Step 4 = Proof of Availability); students retain it better when they see the explicit label.
- Run the basic download example and pause after the quorum is met to tie code to the diagram.
- Encourage students to trace a single sliver through the flow—metadata post, sliver post, confirmation fetch.

**Quick Check:**

- “Why does `writeEncodedBlobToNodes` abort once `isAboveValidity` returns true?”
- “What’s the difference between `NotFoundError` and `BlobNotCertifiedError` during reads?”

**Discussion Points:**

- Handling regional storage-node outages.
- Pros/cons of relying on SDK abstractions vs. calling storage nodes manually.

---

### Section 3: Relay Batching and Reliability (`03-relay-batching-reliability.md`)

**Key Points to Emphasize:**

- The relay accepts a single client request, fans out writes, aggregates confirmations, and returns a `ProtocolMessageCertificate`.
- Direct uploads require the client to "receive confirmations" and "aggregate confirmations" themselves; the updated sequence diagram shows this contrast clearly.
- Relay retry behavior references both `WalrusClient.writeEncodedBlobToNodes()` and the Rust controller (`send_blob_data_and_get_certificate` in [controller.rs](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-upload-relay/src/controller.rs)).
- Tips fund relay resources; `sendUploadRelayTip` injects PTB entries before streaming begins.

**Teaching Tips:**

- Rehearse the dialogue: “What breaks if the client drops offline mid-upload?” vs. “What if the relay handles it?” to anchor reliability gains.
- Use the code snippet with inline comments to show where certificate handoff occurs (`writeBlobToUploadRelay`).
- Clarify the meaning of “collect confirmations” -> “Receive BLS signatures, aggregate them locally or at the relay”.

**Quick Check:**

- “Which component generates the certificate in a relay upload?”
- “Why does the relay keep persistent connections to storage nodes?”

**Discussion Points:**

- Operating relays in-house vs. using Walrus-operated relay endpoints.
- Security considerations when delegating uploads to a relay (tip authentication, nonce usage).

---

### Section 4: Choosing When to Use the Relay (`04-when-to-use-relay.md`, `05-when-not-to-use-relay.md`)

**Key Points to Emphasize:**

- Relay simplifies browser/mobile workloads: fewer outbound connections, smaller bundle (no WASM encoding), centralized retries.
- Direct uploads offer full control for backends that need custom batching, error instrumentation, or cost micro-optimization.
- Tip guidance (“Why tipping helps”) explains economic incentives and expected service guarantees.
- Trade-off tables highlight retry logic, failure visibility, and operational complexity.

**Teaching Tips:**

- Have students map their own project requirements onto the table (hands-on classification exercise).
- Reference upstream docs (`@blog`, `@operator-guide`) to show continuity with product positioning.
- Reinforce that “when not to use relay” still reuses most of the same SDK calls—only configuration differs.

**Quick Check:**

- “Name two situations where you would deliberately avoid the relay.”
- “What extra information does the relay return that a direct upload must compute itself?”

**Discussion Points:**

- Cost vs. complexity trade-offs for small teams.
- How tip policies could influence community-run relays.

---

### Section 5: Basic Upload and Download Examples (`06-basic-upload-example.md`, `07-basic-download-example.md`)

**Key Points to Emphasize:**

- Every snippet in the docs may have a runnable counterpart (check with your training provider for the verification harness repository).
- Upload path differences boil down to client configuration (`walrus()` vs. `walrus({ uploadRelay })`).
- Download examples include error handling hooks for `BlobNotCertifiedError`, `NotEnoughSliversReceivedError`, etc.

**Teaching Tips:**

- Start live coding from a simple example; use environment variables (e.g., `PASSPHRASE`) to avoid hardcoding secrets.
- Encourage use of environment variables (e.g., `PASSPHRASE`) to avoid hardcoding secrets in demos.
- When showing downloads, keep a known-good blobId handy to sidestep dependency on preceding uploads.

**Quick Check:**

- “What two additional fields must be provided when configuring `uploadRelay`?”
- “Which helper decodes returned bytes into friendly text in the download example?”

**Discussion Points:**

- Persisting blob IDs between sessions (DB vs. config).
- Incorporating uploads into CI pipelines.

---

### Section 6: Integrity Checks (`08-integrity-checks.md`)

**Key Points to Emphasize:**

- Students recompute `rootHash` and compare against on-chain metadata via `getBlobMetadata`.
- Certificate verification ensures the blob was certified by the committee; highlight where `ProtocolMessageCertificate` comes from in the SDK.
- Examples may include `uploadAndVerify` to demonstrate end-to-end integrity workflows.

**Teaching Tips:**

- Trace each validation step on the diagram: hash comparison, certificate validation, optional byte-for-byte comparison.
- Mention real-world uses (compliance, audit logs) to motivate the extra work.
- Encourage students to intentionally tamper with data locally to watch verification fail.

**Quick Check:**

- “What three values does the SDK compare before declaring a blob verified?”
- “Why is the root hash computed over encoded bytes instead of raw?”

**Discussion Points:**

- Integrity verification for archival use cases.
- When to trust relay-provided certificates vs. recomputing yourself.

---

### Section 7: Retry Patterns and Partial Failures (`09-retry-patterns.md`, `10-partial-failures.md`)

**Key Points to Emphasize:**

- Partial failure handling is encapsulated in `writeEncodedBlobToNodes()` and `getSlivers()`; note how shard weights influence abort decisions.
- Students should understand when to escalate from "retry" to "give up and inform user".

**Teaching Tips:**

- Live-run retry examples so students see each strategy's console output.
- Annotate the code snippets with comments (already in docs) and ask students to predict behavior before running them.
- Compare retry counts between relay and direct uploads to highlight operational savings.

**Quick Check:**

- “What condition function would you pass to `retry()` to avoid retrying `BlobBlockedError`?”
- “How does the SDK decide it’s impossible to reach quorum during downloads?”

**Discussion Points:**

- Backoff tuning for high-volume publishers.
- Coordinating client retries with relay-side retries.

---

### Section 8: Error Handling (`11-error-handling.md`)

**Key Points to Emphasize:**

- Error hierarchy lives in the SDK's [error.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/error.ts); distinguish retryable vs. terminal cases.
- Docs include concise helpers for user-friendly messages, context preservation, logging, and recovery hints.
- Even without a runnable example file, students can reuse the snippets inside their applications.

**Teaching Tips:**

- Role-play: present raw SDK error objects and have students translate them into UI messages using `getUserFriendlyError`.
- Point out where to surface actionable advice (“wait a few minutes”, “check tip configuration”).
- Encourage linking telemetry (e.g., Sentry) to these helper functions for better ops visibility.

**Quick Check:**

- “Which error indicates the client is behind the current epoch?”
- “Why might you still show the original error in development builds?”

**Discussion Points:**

- Escalation paths when blobs are legally blocked.
- Mapping errors to HTTP status codes in REST backends.

---

### Section 9: Hands-On Lab (`12-hands-on.md`)

**Key Points to Emphasize:**

- Students build a short upload script, layer retries, and verify integrity.
- The lab intentionally mirrors earlier sections so students consolidate concepts.
- Encourage experimentation and building upon the examples provided.

**Teaching Tips:**

- Let students pair-program; the lab is a natural checkpoint for peer teaching.
- Provide staged milestones (encode → upload → retry → verify) so you can troubleshoot incrementally.
- Remind students to recycle blob IDs or delete blobs if quotas are limited.

**Quick Check:**

- “Which command runs only the hands-on lab in Docker?”
- “Where does the lab pull relay configuration from?”

**Discussion Points:**

- Extending the lab to include download verification or tip adjustments.
- Adapting the lab into CI smoke tests.

---

## Assessment Suggestions

- **Flow Trace Assignment**: Give students a failure scenario (e.g., node outage mid-upload) and ask them to map each SDK call and resulting error class.
- **Relay vs. Direct Debate**: Split the class into two teams to argue for/against relay usage for a hypothetical product, referencing the comparison tables.
- **Retry Strategy Coding Quiz**: Provide partially complete retry helper code and ask students to fill in the condition/backoff logic.
- **Integrity Drill**: Supply mismatched blob data/certificates and have students diagnose which validation step fails.
- **Operational Runbook Review**: Students draft a mini runbook for “upload fails due to insufficient confirmations” referencing SDK helpers.

## Additional Resources

- [Walrus TypeScript SDK - client.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/client.ts) – Source of upload/download flows, retry hooks, and relay integration
- [Walrus TypeScript SDK - retry.ts](https://github.com/MystenLabs/ts-sdks/blob/main/packages/walrus/src/utils/retry.ts) – Canonical retry helper referenced in docs
- [Walrus TypeScript SDK on NPM](https://www.npmjs.com/package/@mysten/walrus) – Official TypeScript/JavaScript SDK package
- [Walrus Upload Relay - controller.rs](https://github.com/MystenLabs/walrus/blob/main/crates/walrus-upload-relay/src/controller.rs) – Relay batching and certificate aggregation logic
- [Walrus Operator Guide - Upload Relay](https://docs.wal.app/operator-guide/upload-relay.html) – Operational details, tip guidance, production considerations

## Official Documentation for Reference

- [Walrus Documentation](https://docs.wal.app/) – Official Walrus documentation
- [Walrus Operator Guide - Upload Relay](https://docs.wal.app/operator-guide/upload-relay.html) – Relay deployment and configuration
- [Walrus GitHub Repository](https://github.com/MystenLabs/walrus) – Core Walrus protocol and Rust implementation
- [Walrus TypeScript SDK Repository](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus) – TypeScript/JavaScript SDK source code

## Module Completion Checklist

- [ ] Student can articulate every step of the direct upload flow, including proof of availability.
- [ ] Student can explain how the relay offloads encoding, retries, and certificate generation, and knows when to enable it.
- [ ] Student has run the basic upload and download examples (either locally or via Docker) and understands required configuration.
- [ ] Student can implement at least one retry strategy and explain when to abandon retries.
- [ ] Student can classify SDK errors into user-friendly categories and suggest recovery actions.
- [ ] Student can perform integrity verification (hash, metadata, certificate) on a stored blob.
- [ ] Student completed the hands-on lab and can adapt it to their own project requirements.
- [ ] Student can cite official docs/resources for relay operation, storage node behavior, and SDK configuration.

