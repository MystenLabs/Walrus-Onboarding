import 'dotenv/config';
export {}; // Make this an ES module to avoid global scope conflicts

// Real Walrus SDK scenario (intentionally minimal/broken: no retries)
// Students should add robust retry logic and error handling.

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { WalrusClient } from "@mysten/walrus";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Placeholder retry function — intentionally unimplemented for the lab
// TODO: Implement this with real retry logic. Suggested steps:
// 1) Detect retryable errors: network timeouts (ECONN, ETIMEDOUT), HTTP 429/5xx,
//    and Walrus-specific transient errors (e.g., RetryableWalrusClientError).
//    Fail fast on most other 4xx errors.
// 2) Use exponential backoff with jitter: baseDelay * 2^(attempt-1), capped with maxDelay.
// 3) Limit attempts (e.g., 3-5). On each retry, optionally log attempt and delay.
// 4) If the error is Walrus retryable, call `client.reset()` before retrying to refresh state.
// 5) Return the successful result; after last attempt, throw the last seen error.
//    See `ts/debug-scenario-solution.ts` for a reference implementation.
async function retryWithBackoff<T>(_fn: () => Promise<T>): Promise<T> {
    throw new Error(
        "Retry logic not implemented. Implement exponential backoff with jitter and retryable error checks."
    );
}

function getKeypairFromEnv(): Ed25519Keypair {
    const mnemonic = process.env.PASSPHRASE;
    const derivationPath = process.env.DERIVATION_PATH; // optional
    if (!mnemonic) {
        throw new Error("Missing PASSPHRASE (12/24-word mnemonic) in environment/.env.");
    }
    return derivationPath
        ? Ed25519Keypair.deriveKeypair(mnemonic, derivationPath)
        : Ed25519Keypair.deriveKeypair(mnemonic);
}

async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = process.env.FILE || path.resolve(__dirname, "../sample/hello.txt");
    const epochs = Number(process.env.EPOCHS || 1);
    const aggregatorUrl = process.env.AGGREGATOR_URL;

    console.log("Reading file:", filePath);
    const fileBytes = new Uint8Array(await readFile(filePath));

    const keypair = getKeypairFromEnv();
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    const client = new WalrusClient({
        network: "testnet",
        suiClient,
        ...(aggregatorUrl ? { aggregatorUrl } : {}),
    });

    console.log("Starting upload (no retries)...");
    console.log(
        "Note: This scenario intentionally omits retry logic; transient failures are expected."
    );

    // TODO: Implement retry logic (exponential backoff, jitter, and retryable error checks)
    try {
        const result = await retryWithBackoff(() =>
            client.writeBlob({ blob: fileBytes, epochs, signer: keypair, deletable: false })
        );
        // Without a proper retry function, code should not reach here.
        // Intentionally left to demonstrate success path once retries are implemented.
        const blobIdValue = typeof result === 'string' ? result : result.blobId;
        console.log(`Uploaded (unexpected without retries). Blob ID: ${blobIdValue}`);
        const data = await retryWithBackoff(() => client.readBlob({ blobId: blobIdValue }));
        const text = new TextDecoder().decode(data);
        console.log(`Read back data: ${text}`);
    } catch (e: any) {
        console.error("\n❌ Expected failure: this scenario has no retry logic.");
        console.error(
            "Without retries/backoff, network hiccups or Walrus epoch changes can cause operations to fail."
        );
        console.error(
            "Add retry logic to make this robust (try: `npm run solution`)."
        );
        console.error("Original error:", e?.message || e);
        process.exit(1);
    }
}

main();
