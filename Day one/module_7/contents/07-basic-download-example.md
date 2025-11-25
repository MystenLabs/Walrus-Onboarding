# 7. Basic Download Example

This lesson is now sourced from the runnable test harness in
`hands_on_code/src/examples/basic-download-example.ts`. The code blocks below are
the exact functions you can run locally, complete with error handling.

## Use the verification harness

The download tests expect a valid blob ID. Run the upload test first, copy the printed blob ID, and
pass it to the download command:

```bash
cd hands_on_code

# Docker workflow
make build
PASSPHRASE="your passphrase here" make test-upload   # produces a blobId
PASSPHRASE="your passphrase here" make test-download BLOB_ID=<copied id>

# Local Node.js workflow
npm install
PASSPHRASE="your passphrase here" npm run test:basic-upload
PASSPHRASE="your passphrase here" npm run test:basic-download <blob-id>
```

The download script does not mint new blobs—it simply reuses the identifier you provide so you can
verify round-trips across different machines.

## Simple blob download

The harness keeps a single Walrus client and exposes `downloadBlob(blobId)` as shown below. It reads
the slivers, reconstructs the blob, and writes the contents to the console:

```ts
const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(walrus());

async function downloadBlob(blobId: string) {
  const blobBytes = await client.walrus.readBlob({ blobId });

  const text = new TextDecoder().decode(blobBytes);
  console.log('Blob content:', text);

  const blob = new Blob([blobBytes]);
  return blobBytes;
}
```

Use this helper whenever you need to prove a blob is still retrievable or to inspect the payload from
tests that created temporary data.

## Download with error handling

Real networks fail, so the script also exports `downloadWithErrorHandling()` that distinguishes
between certification problems, missing slivers, and blocked blobs:

```ts
async function downloadWithErrorHandling(blobId: string) {
  try {
    const blobBytes = await client.walrus.readBlob({ blobId });
    return blobBytes;
  } catch (error: any) {
    if (error.name === 'BlobNotCertifiedError') {
      console.error('Blob is not certified or does not exist');
    } else if (error.name === 'NotEnoughSliversReceivedError') {
      console.error('Could not retrieve enough slivers to reconstruct blob');
    } else if (error.name === 'BlobBlockedError') {
      console.error('Blob is blocked by storage nodes');
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

Copy this function into production code when you want to classify read failures and decide whether to
retry, alert users, or fall back to a different blob.

## Running the script end-to-end

When you run `npm run test:basic-download <blob-id>`, the harness simply calls `downloadBlob()` and
prints a success banner. Errors are bubbled up so your shell exits non-zero:

```ts
const blobId = process.argv[2] || 'OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk';

console.log(`=== Downloading blob: ${blobId} ===`);
await downloadBlob(blobId);

console.log('\n✅ Download example completed successfully!');
```

Provide your own blob ID (recommended) or rely on the default constant if you simply want to make
sure the code path works.

## Key takeaways

- The verification harness supplies ready-to-run download helpers in
  `hands_on_code/src/examples/basic-download-example.ts`.
- Always reuse the blob IDs produced by the upload tests so you know the data exists on Testnet.
- `downloadWithErrorHandling()` shows how to classify the SDK's read errors before retrying.
- The same client instance can power both upload and download tests; keep it around to amortize
  connection setup.

## Next lecture

Continue with [Integrity Checks](./08-integrity-checks.md) to validate that downloaded blobs still match
their registered root hashes.
