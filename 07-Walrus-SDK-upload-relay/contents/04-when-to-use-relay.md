# 4. When to Use Relay

The upload relay was created specifically to help browser and mobile clients avoid opening dozens of
parallel connections to every storage node, as described in the
[operator guide](https://docs.wal.app/operator-guide/upload-relay.html#overview). The
[CLI usage guide](https://docs.wal.app/usage/client-cli.html#using-a-walrus-upload-relay) reinforces that relays assist
clients with limited bandwidth or networking capabilities (including browsers). The sections below
call out common scenarios and tie them back to those references.

## Client-Side Applications

### Browser-based applications

web apps running in unprivileged browsers benefit the most because the relay removes the need to
maintain dozens of outbound connections:

- **Single fan-out call**: Instead of orchestrating per-node uploads in the browser, the relay exposes
  a single POST to `/v1/blob-upload-relay` that handles encoding, sliver uploads, and certificate
  collection on your behalf
  ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#design)).
- **Ready-made tooling**: The same document notes the full flow is already implemented in the Walrus
  CLI, Rust SDK, and TS SDK, so a web client can reuse those libraries without reimplementing the
  networking stack ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#design)).

Example use case: A browser app that allows users to upload images or documents without custom multi-node
HTTP logic.

### Mobile applications

The same constraints apply—and are even more pronounced—on low-powered devices:

- **Designed for low-spec devices**: The operator guide explicitly calls out mobile devices and
  low-powered laptops as the primary motivation for the relay
  ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#overview)).
- **Bandwidth-friendly**: The CLI guide reiterates that relays help clients with limited bandwidth or
  networking capability (such as mobile apps or browsers)
  ([usage guide](https://docs.wal.app/usage/client-cli.html#using-a-walrus-upload-relay)).

Example use case: A mobile app that syncs photos or documents to Walrus while keeping device resource
usage low.

## High-Volume Uploads

Backend services that need to upload many files in sequence can centralize the work through a relay:

- **Centralized encoding & certificate collection**: After a single POST, the relay performs encoding,
  sliver uploads, and confirmation aggregation before returning a certificate
  ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#design)).
- **Runs on server infrastructure**: Because the relay is a standalone program that operators or dApp
  teams can deploy on internet-facing hosts
  ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html)), a
  backend job can push many blobs through the same relay instance while the client focuses on on-chain
  registration and certification ([usage guide](https://docs.wal.app/usage/client-cli.html#using-a-walrus-upload-relay)).

Example use case: A backup service that uploads hundreds of files daily.

## Simplified Error Handling

Direct uploads keep the entire retry + quorum loop inside your process. After calling
`encodeBlob()`, the SDK runs `writeEncodedBlobToNodes()` and `getStorageConfirmationFromNode()` for
each storage node (`ts-sdks/packages/walrus/src/client.ts`). Your code must juggle concurrent errors,
track quorum, surface `NotEnoughBlobConfirmationsError`, and fall back when a single node or network
path fails (see `02-publisher-aggregator-interaction.md`).

Using the relay collapses that into one HTTPS request:

- **Client without relay**: Handles per-node retries, quorum math, BLS signature aggregation, and
  multi-error reporting (directly mapping to the StorageNodeClient APIs).
- **Client with relay**: Sends one request to `/v1/blob-upload-relay`; the relay runs the exact same
  uploader (`send_blob_data_and_get_certificate`) server-side and returns a single
  `ProtocolMessageCertificate`.

| Concern | Direct upload | Relay upload |
| --- | --- | --- |
| Retry logic | Client loops through `writeEncodedBlobToNodes()` in `ts-sdks/packages/walrus/src/client.ts`, aborting on quorum failures (see `02-publisher-aggregator-interaction.md`) | Relay loops internally; client only retries the single HTTP request |
| Error surface | Many possible `StorageNodeAPIError` /`NotFoundError` /`NotEnoughBlobConfirmationsError` | One response: success with certificate or a single relay error |
| Confirmation handling | Client collects per-node BLS signatures and aggregates them | Relay returns the aggregated certificate |

Because failures collapse into one response, app code can treat uploads like any other POST and log a
single error message instead of stitching together node-level incidents. That makes the relay the
right choice whenever reducing error-handling code is a priority.

## Configuration

To use the relay, configure it when creating the Walrus client:

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus/client';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        max: 1_000, // Maximum tip in MIST
      },
    },
  }),
);
```

## Tip Configuration

Public or community relays often charge a tip to offset bandwidth, compute, and hosting costs. The
[operator guide](https://docs.wal.app/operator-guide/upload-relay.html#upload-relay-operation) describes two modes:

- **Free service**: `tip_config` is `no_tip`; clients only pay on-chain storage fees.
- **Paid service**: `tip_config` advertises how much the relay expects before it forwards your blob.

When a tip is required, the relay exposes `/v1/tip-config` so the SDK or CLI can discover the amount,
and your client must provide the `nonce` and `tx_id` from the payment transaction
([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#paying-the-tip)). Without this payment the relay
will reject the upload request.

### Why tipping helps

- **Guaranteed service**: Paid-mode relays only accept uploads that include the advertised tip, so
  your request is prioritized and not throttled once the payment is verified
  ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#upload-relay-operation)).
- **Provisioned capacity**: Tips cover bandwidth, compute, and hosting, letting the relay keep
  persistent connections to storage nodes and run the same retry/quorum logic that a direct client
  would implement locally.
- **Authenticated uploads**: The payment transaction encodes `blob_digest`, `nonce`, and
  `unencoded_length`, and the relay checks the provided `tx_id`/`nonce` pair before streaming data,
  preventing freeloading or replay attempts ([operator guide](https://docs.wal.app/operator-guide/upload-relay.html#paying-the-tip)).

You can configure automatic tip calculation so the SDK queries the relay, verifies the amount is at or
below your cap, and includes the payment in the registration transaction:

```typescript
uploadRelay: {
  host: 'https://upload-relay.testnet.walrus.space',
  sendTip: {
    max: 1_000, // Maximum tip in MIST
  },
}
```

Or manually configure the tip:

```typescript
uploadRelay: {
  host: 'https://upload-relay.testnet.walrus.space',
  sendTip: {
    type: 'const',
    value: 500, // Fixed tip amount
  },
}
```

With the manual configuration you opt into a specific tip schedule that mirrors what the relay reports:

- `type: 'const'` covers relays that charge a flat SUI amount per blob.
- `type: 'linear'` models relays that scale the price with unencoded blob size (base + per-byte).

If the relay advertises `no_tip`, omit the `sendTip` block entirely—the SDK will skip payment and still
stream the blob to the relay.

## Key Indicators for Using Relay

Use the relay when:

- ✅ Your application runs in a browser or mobile environment
- ✅ You want to minimize client-side code complexity
- ✅ You're uploading from user devices (not servers)
- ✅ You need reliable uploads without custom retry logic
- ✅ You're building a consumer-facing application
- ✅ Network efficiency and battery usage are concerns

## Example: browser upload

```typescript
// Web app example with relay
async function uploadUserFile(file: File) {
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  
  const { blobId, blobObject } = await client.walrus.writeBlob({
    blob: fileBytes,
    deletable: true,
    epochs: 3,
    signer: keypair,
  });
  
  return { blobId, blobObject };
}
```

This simple code works because the relay handles all the complexity of:

- Encoding the blob
- Distributing slivers to nodes
- Collecting confirmations
- Generating the certificate

## Key Takeaways

- Use the relay for client-side applications (web, mobile)
- Ideal when you want simplified code and error handling
- Best for high-volume uploads from user devices
- Requires minimal configuration
- Automatically handles tips and retries

## Next Lecture

Continue with [When Not to Use Relay](./05-when-not-to-use-relay.md) to learn the scenarios where direct
node interaction is preferable and how to configure the SDK for that path.
