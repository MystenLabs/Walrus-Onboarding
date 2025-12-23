# 7. Basic Download Example

This lesson is now sourced from the runnable test harness in
`hands-on-source-code/src/examples/basic-download-example.ts`. The code blocks below are
the exact functions you can run locally, complete with error handling.

## Use the verification harness

The download tests expect a valid blob ID. Run the upload test first, copy the printed blob ID, and
pass it to the download command:

```bash
# Docker workflow
cd docker
make build
PASSPHRASE="your passphrase here" make test-upload # produces a blobId
PASSPHRASE="your passphrase here" make test-download BLOB_ID=<copied id>

# Local Node.js workflow
cd hands-on-source-code
# assuming you have already installed the node.js dependencies and included the passphrase in the .env file

npm run test:basic-upload
# IMPORTANT: <blob-id> must be the blobId printed by the upload step above.
# The download script does not mint a new blob; it only reads an existing one.
npm run test:basic-download -- <blob-id>

# For a quick one-off check, you can run without a blob ID.
# If you omit <blob-id>, the script will upload a test blob first
# and then download it to verify the round-trip.
npm run test:basic-download
```

When no blob ID is provided, the script uploads a test blob first and then downloads it to verify
the round-trip, including content verification.

## Simple blob download

The harness keeps a single Walrus client and exposes `downloadBlob(blobId)` as shown below. It reads
the slivers, reconstructs the blob, and writes the contents to the console:

```ts
const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
  network: "testnet",
}).$extend(walrus());

async function downloadBlob(blobId: string) {
  const blobBytes = await client.walrus.readBlob({ blobId });

  const text = new TextDecoder().decode(blobBytes);
  console.log("Blob content:", text);

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
    if (error instanceof BlobNotCertifiedError) {
      console.error('Blob is not certified or does not exist');
    } else if (error instanceof NotEnoughSliversReceivedError) {
      console.error('Could not retrieve enough slivers to reconstruct blob');
      // Retry logic here
    } else if (error instanceof BlobBlockedError) {
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

When you run `npm run test:basic-download -- <blob-id>`, the harness calls `downloadBlob()` and
prints a success banner. 

The `<blob-id>` argument is expected to be the **on-chain numeric blob ID**
in decimal form (the `blob_id` you see in the Sui object), or the short Walrus blob ID string.

If you omit `<blob-id>`, the script will **upload a test blob first** and then download it to verify
the round-trip. This makes it easy to test the download flow without needing an existing blob ID:

```ts
// Accept either an on-chain numeric blob ID (decimal string) or the short Walrus blob ID.
// If you pass a decimal string, we convert it to the Walrus blobId string using blobIdFromInt().
// If you omit the argument, we upload a test blob first and then download it.
const arg = process.argv[2];

let blobId: string;
let expectedContent: string | undefined;

if (arg) {
  // User provided a blob ID
  const isNumeric = /^\d+$/.test(arg);
  blobId = isNumeric ? blobIdFromInt(BigInt(arg)) : arg;

  console.log(
    `=== Downloading blob (input format: ${
      isNumeric ? 'on-chain numeric' : 'Walrus blobId'
    }, normalized: ${blobId}) ===`,
  );
} else {
  // No blob ID provided - upload first
  const uploadResult = await uploadTestBlob();
  blobId = uploadResult.blobId;
  expectedContent = uploadResult.content;

  console.log(`=== Downloading the uploaded blob: ${blobId} ===`);
}

const downloadedBytes = await downloadBlob(blobId);

// Verify content if we uploaded it ourselves
if (expectedContent) {
  const downloadedContent = new TextDecoder().decode(downloadedBytes);
  if (downloadedContent === expectedContent) {
    console.log('\n✅ Content verification successful! Downloaded content matches uploaded content.');
  } else {
    console.error('\n❌ Content mismatch!');
    console.error(`Expected: ${expectedContent}`);
    console.error(`Got: ${downloadedContent}`);
    throw new Error('Content verification failed');
  }
}

console.log('\n✅ Download example completed successfully!');
```

## Key takeaways

- The verification harness supplies ready-to-run download helpers in
  `hands-on-source-code/src/examples/basic-download-example.ts`.
- Always reuse the blob IDs produced by the upload tests so you know the data exists on Testnet.
- `downloadWithErrorHandling()` shows how to classify the SDK's read errors before retrying.
- The same client instance can power both upload and download tests; keep it around to amortize
  connection setup.

## Next lecture

Continue with [Integrity Checks](./08-integrity-checks.md) to validate that downloaded blobs still match
their registered root hashes.
