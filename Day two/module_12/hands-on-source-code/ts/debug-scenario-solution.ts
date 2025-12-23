/**
 * Solution: Debugging Failure Scenarios (Real SDK)
 * 
 * Proper retry logic and error handling for Walrus operations
 * using the real TypeScript SDK on testnet.
 */

import 'dotenv/config';
export {};

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { WalrusClient, RetryableWalrusClientError } from "@mysten/walrus";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

function getKeypairFromEnv(): Ed25519Keypair {
    const mnemonic = process.env.PASSPHRASE;
    const derivationPath = process.env.DERIVATION_PATH; // optional
    if (!mnemonic) throw new Error("Missing PASSPHRASE (12/24-word mnemonic) in environment/.env.");
    return derivationPath
        ? Ed25519Keypair.deriveKeypair(mnemonic, derivationPath)
        : Ed25519Keypair.deriveKeypair(mnemonic);
}

function isRetryableError(error: any): boolean {
    if (!error) return true;

    // Walrus-specific retryable errors (epoch changes, transient conditions)
    if (error instanceof RetryableWalrusClientError) return true;

    const msg = String(error.message || "");
    if (msg.match(/ECONN|ENET|ETIMEDOUT|timeout|Network Error/i)) return true;

    const status = error?.status ?? error?.response?.status;
    if (typeof status === "number") {
        if (status === 429) return true; // Too Many Requests
        if (status >= 500 && status < 600) return true; // Server errors
        if (status >= 400 && status < 500) return false; // Other client errors
    }

    // Conservative default: retry unknowns
    return true;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, client?: WalrusClient): Promise<T> {
    const maxAttempts = 4;
    const baseDelay = 200;
    const maxDelay = 2_000;

    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (!isRetryableError(error)) throw error;
            if (error instanceof RetryableWalrusClientError && client) client.reset();
            if (attempt === maxAttempts) break;

            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * baseDelay, maxDelay);
            console.log(`Attempt ${attempt} failed: ${error?.message || error}. Retrying in ${Math.round(delay)}ms...`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw lastError ?? new Error("Retry failed");
}

async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = process.env.FILE || path.resolve(__dirname, "../sample/hello.txt");
    const epochs = Number(process.env.EPOCHS || 1);
    const aggregatorUrl = process.env.AGGREGATOR_URL;

    console.log("Reading file:", filePath);
    const originalContent = await readFile(filePath);
    const runningTime = new Date().toISOString();
    const contentWithTime = Buffer.concat([
        originalContent,
        Buffer.from(`\nRunning time: ${runningTime}\n`)
    ]);
    const fileBytes = new Uint8Array(contentWithTime);
    console.log("Content to upload:\n" + new TextDecoder().decode(fileBytes));
    console.log("-------upload content end-------\n");
    const keypair = getKeypairFromEnv();
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    const client = new WalrusClient({
        network: "testnet",
        suiClient,
        ...(aggregatorUrl ? { aggregatorUrl } : {}),
    });

    console.log("Starting upload with retry logic...");

    try {
        const result = await retryWithBackoff(
            () => client.writeBlob({ blob: fileBytes, epochs, signer: keypair, deletable: false }),
            client
        );
        const blobIdValue = typeof result === 'string' ? result : result.blobId;
        console.log(`\n✅ Uploaded. Blob ID: ${blobIdValue}`);

        const data = await retryWithBackoff(
            () => client.readBlob({ blobId: blobIdValue }),
            client
        );
        const text = new TextDecoder().decode(data);
        console.log("📖 Read back text:", text);

        const same = Buffer.from(data).equals(Buffer.from(fileBytes));
        console.log(`Match with source: ${same ? "✅ Yes" : "❌ No"}`);
    } catch (error: any) {
        console.error(`\n❌ Operation failed after retries:`, error?.message || error);
        process.exit(1);
    }
}

main();
