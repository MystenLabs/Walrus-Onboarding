# 6. Basic Upload Example

This guide now mirrors the runnable code that lives in
`hands-on-source-code/src/examples/basic-upload-example.ts`. Every snippet below is taken
directly from that project so you can run, debug, and extend the exact code you see in the curriculum.

## Use the verification harness

All upload samples can be executed without editing this page—just run the verification harness that
ships with the repo:

```bash
# Build & run inside Docker (recommended)
cd docker
make build
PASSPHRASE="your passphrase here" make test-upload

# …or run locally with Node.js 20+
cd hands-on-source-code
cp .env.example .env
echo 'PASSPHRASE="your passphrase here"' >> .env
npm install
npm run test:basic-upload
```

The `test-upload` target runs the direct and relay uploads back-to-back so you can inspect logs,
blob IDs, and any failures. See `hands-on-source-code/README.md` for more detail (shell
access, make targets, troubleshooting, etc.).

## Simple blob upload (direct path)

The direct example creates a Walrus client without an upload relay, grabs a funded keypair, and calls
`writeBlob`. The snippet below is exactly what the test harness runs:

```ts
const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
  network: "testnet",
}).$extend(walrus());

const keypair = await getFundedKeypair();

const data = new TextEncoder().encode("Hello, Walrus!" + Date.now());

const { blobId, blobObject } = await client.walrus.writeBlob({
  blob: data,
  deletable: true,
  epochs: 3,
  signer: keypair,
});
```

Running `npm run test:basic-upload` (or `make test-upload`) prints the blob ID and blob object
reference so you can reuse it in later steps—no additional scaffolding required.

## Upload with relay

To see the relay path, the same file constructs a client with `uploadRelay.host` pointing to the
public Testnet relay. The `writeBlob` API stays the same; the relay handles chunking, fan-out, and
certificate aggregation:

```ts
const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
  network: "testnet",
}).$extend(
  walrus({
    uploadRelay: {
      host: "https://upload-relay.testnet.walrus.space",
      sendTip: {
        max: 1_000,
      },
    },
  })
);

const data = new TextEncoder().encode("Hello, Walrus with Relay!" + Date.now());

const { blobId, blobObject } = await client.walrus.writeBlob({
  blob: data,
  deletable: true,
  epochs: 3,
  signer: keypair,
});
```

To run just this path, execute `npm run test:basic-upload -- relay`, or simply inspect
the `uploadWithRelay()` logs in the default test run.

## Running both paths together

The harness exports a `main()` wrapper that exercises both uploads and surfaces any network or quorum
failures. This is what `npm run test:basic-upload` invokes:

```ts
console.log("=== Testing Simple Blob Upload ===");
await uploadBlob();

console.log("\n=== Testing Upload with Relay ===");
await uploadWithRelay();

console.log("\n✅ All upload examples completed successfully!");
```

Because the scripts run against live Walrus Testnet nodes, intermittent
`RetryableWalrusClientError` exceptions are expected. When that happens, re-run the test or move to
the hands-on variation below, which already includes retry logic.

## Hands-on variation: retries + verification

For a fuller workflow—tip payment, retry loops, and post-upload verification—use the hands-on lab
example. It wraps `writeBlob` in a retry loop, reads the blob back, and compares the payload before
declaring success:

```ts
const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        max: 1_000,
      },
    },
  }),
);

while (attempt < maxRetries) {
  try {
    const result = await client.walrus.writeBlob({ ... });
    blobId = result.blobId;
    break;
  } catch (error) {
    if (error instanceof RetryableWalrusClientError && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      continue;
    }
    throw error;
  }
}

const downloadedBytes = await client.walrus.readBlob({ blobId });
const downloadedContent = new TextDecoder().decode(downloadedBytes);
```

Run it with `npm run test:hands-on` (or `make test-hands-on`). This script is ideal
for adapting into CI jobs or demos because it proves the entire round-trip.

## Key takeaways

- Every code sample in this page is runnable from `hands-on-source-code`.
- `make test-upload` (Docker) or `npm run test:basic-upload` (Node) exercise both the direct and relay
  paths.
- Reuse the generated blob IDs when testing downloads or integrity checks.
- Start from `hands-on-lab.ts` if you need retries, logging, or post-upload verification.

## Next lecture

Continue with [Basic Download Example](./07-basic-download-example.md) to see how the verification
system retrieves the blobs you just stored.
