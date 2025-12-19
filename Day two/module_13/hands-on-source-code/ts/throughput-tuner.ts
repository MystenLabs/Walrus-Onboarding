import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { getFundedKeypair, getFundedKeypairs, generateRandomBuffer } from './utils.js';

const TOTAL_BLOBS = 5;
const BLOB_SIZE = 128 * 1024; // 128KB
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Simple retry wrapper for handling transient errors
// Handles: coin contention, HTTP 429 (rate limiting), network issues
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    delayMs: number = RETRY_DELAY_MS
): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            const errorMsg = lastError.message || '';
            
            // Retriable conditions:
            // - Coin contention (Version, not available for consumption)
            // - Equivocation errors
            // - HTTP 429 (Too Many Requests / rate limiting)
            // - Network timeouts
            const isRetriable = 
                errorMsg.includes('Version') ||
                errorMsg.includes('not available for consumption') ||
                errorMsg.includes('equivocation') ||
                errorMsg.includes('429') ||
                errorMsg.includes('Too Many Requests') ||
                errorMsg.includes('timeout');
            
            if (!isRetriable || attempt === maxRetries) {
                throw lastError;
            }
            
            // Exponential backoff with jitter
            const backoff = delayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
            console.log(`  Retry ${attempt}/${maxRetries} in ${Math.round(backoff)}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
        }
    }
    throw lastError;
}

// Simple concurrency limiter
function createLimiter(concurrency: number) {
    let active = 0;
    const queue: (() => void)[] = [];

    return async function<T>(fn: () => Promise<T>): Promise<T> {
        while (active >= concurrency) {
            await new Promise<void>(resolve => queue.push(resolve));
        }
        active++;
        try {
            return await fn();
        } finally {
            active--;
            const next = queue.shift();
            if (next) next();
        }
    };
}

async function run() {
    console.log("=== Walrus Performance Tuning Lab ===");
    console.log("Comparing sequential vs concurrent upload patterns\n");

    // 1. Setup Client + wallets
    const NUM_WALLETS = Number(process.env.NUM_WALLETS || '1');
    const signers =
        NUM_WALLETS > 1 ? await getFundedKeypairs(NUM_WALLETS) : [await getFundedKeypair()];
    const primarySigner = signers[0];
    if (signers.length > 1) {
        console.log(`Using ${signers.length} wallets (round-robin) to reduce coin contention`);
    } else {
        console.log('Using a single wallet (expect some coin contention at higher concurrency)');
    }
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
        network: 'testnet',
    }).$extend(walrus());

    // Prepare data - use the same blobs for both scenarios
    console.log(`Generating ${TOTAL_BLOBS} blobs of ${BLOB_SIZE / 1024} KB each...`);
    const blobs = Array.from({ length: TOTAL_BLOBS }, () => generateRandomBuffer(BLOB_SIZE));

    // Scenario A: Sequential Uploads (baseline)
    console.log("\n--- Scenario A: Sequential Uploads ---");
    console.log("Uploading one blob at a time, waiting for each to complete...\n");
    
    const startA = performance.now();
    let successA = 0;
    
    for (let i = 0; i < blobs.length; i++) {
        process.stdout.write(`Uploading blob ${i + 1}/${TOTAL_BLOBS}... `);
        try {
            await withRetry(() => client.walrus.writeBlob({
                blob: blobs[i],
                epochs: 1,
                signer: primarySigner,
                deletable: true,
            }));
            successA++;
            console.log("Done.");
        } catch (error) {
            console.log(`Failed: ${(error as Error).message}`);
        }
    }
    
    const durationA = (performance.now() - startA) / 1000;
    const throughputA = (successA * BLOB_SIZE / 1024 / 1024) / durationA;
    
    console.log(`\nSequential Results:`);
    console.log(`  Successful uploads: ${successA}/${TOTAL_BLOBS}`);
    console.log(`  Total Time: ${durationA.toFixed(2)}s`);
    console.log(`  Throughput: ${throughputA.toFixed(2)} MB/s`);

    // Scenario B: Concurrent Uploads
    // Note: With a single wallet, we rely on retry logic to handle coin contention
    const CONCURRENCY = Number(process.env.CONCURRENCY) || 5;
    const limit = createLimiter(CONCURRENCY);
    console.log("\n--- Scenario B: Concurrent Uploads ---");
    if (CONCURRENCY < blobs.length) {
        console.log(`Using concurrency limit of ${CONCURRENCY} with retry logic...`);
    } else {
        console.log("Uploading all blobs concurrently with retry logic...");
    }
    console.log("(Single wallet causes coin contention - production uses sub-wallets)\n");
    
    const startB = performance.now();
    let successB = 0;
    
    const uploadPromises = blobs.map(async (blob, index) => {
        try {
            const signer = signers[index % signers.length];
            await limit(() => withRetry(() => client.walrus.writeBlob({
                blob: blob,
                epochs: 1,
                signer,
                deletable: true,
            })));
            successB++;
            console.log(`[Concurrent] Blob ${index + 1} Done.`);
        } catch (error) {
            console.log(`[Concurrent] Blob ${index + 1} Failed: ${(error as Error).message}`);
        }
    });

    await Promise.all(uploadPromises);
    
    const durationB = (performance.now() - startB) / 1000;
    const throughputB = (successB * BLOB_SIZE / 1024 / 1024) / durationB;
    
    console.log(`\nConcurrent Results:`);
    console.log(`  Successful uploads: ${successB}/${TOTAL_BLOBS}`);
    console.log(`  Total Time: ${durationB.toFixed(2)}s`);
    console.log(`  Throughput: ${throughputB.toFixed(2)} MB/s`);

    // Comparison
    console.log("\n=== Performance Comparison ===");
    console.log(`Sequential:  ${throughputA.toFixed(2)} MB/s (${successA} blobs in ${durationA.toFixed(1)}s)`);
    console.log(`Concurrent:  ${throughputB.toFixed(2)} MB/s (${successB} blobs in ${durationB.toFixed(1)}s)`);
    
    if (throughputB > throughputA) {
        const improvement = ((throughputB - throughputA) / throughputA) * 100;
        console.log(`\n✅ Performance Improvement: ${improvement.toFixed(1)}%`);
    } else {
        console.log(`\n⚠️ No improvement (likely due to coin contention or network conditions)`);
        console.log(`   In production, use Publisher with multiple sub-wallets for true parallelism.`);
    }
    
    console.log("\n--- Key Insights ---");
    console.log("• Two parallelism levels: inter-blob (your code) + intra-blob (SDK distributes to ~1000 shards)");
    console.log("• Single wallet = coin contention in parallel transactions");
    console.log("• Production systems use sub-wallets (--n-clients 8+ in Publisher)");
    console.log("• HTTP 429 = rate limiting; back off and retry");
    console.log("• Retry logic essential for handling transient failures");
    console.log("• Concurrency limits prevent overwhelming the network");
}

run().catch(console.error);
