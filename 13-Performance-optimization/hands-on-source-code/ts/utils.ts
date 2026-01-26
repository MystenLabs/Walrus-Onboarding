import 'dotenv/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_DERIVATION_PREFIX = "m/44'/784'/0'/0'";
const SUI_TYPE = '0x2::sui::SUI';
const TESTNET_WAL_COIN_TYPE =
    '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL';
const SUI_PER_RECIPIENT = 2n * MIST_PER_SUI;
const WAL_PER_RECIPIENT = 2n * MIST_PER_SUI; // WAL uses 9 decimals like SUI

/**
 * Gets the passphrase from environment variable.
 * Students should set PASSPHRASE in .env or via the shell.
 */
function getPassphrase(): string {
    const envPassphrase = process.env.PASSPHRASE;
    if (envPassphrase) {
        console.log('Using passphrase from environment variable');
        return envPassphrase.trim();
    }
    throw new Error('PASSPHRASE not set. Add it to .env or export it in your shell.');
}

function deriveKeypairAtIndex(mnemonic: string, index: number): Ed25519Keypair {
    const path = `${DEFAULT_DERIVATION_PREFIX}/${index}'`;
    return Ed25519Keypair.deriveKeypair(mnemonic, path);
}

async function ensureBalance(
    suiClient: SuiClient,
    owner: string,
    coinType: string,
    minimum: bigint,
    label: string,
) {
    const balance = await suiClient.getBalance({
        owner,
        coinType,
    });
    if (BigInt(balance.totalBalance) < minimum) {
        throw new Error(
            `Insufficient ${label} balance on ${owner}. Need at least ${Number(minimum) / 1e9} ${label}.`,
        );
    }
}

async function getLargestCoinId(
    suiClient: SuiClient,
    owner: string,
    coinType: string,
): Promise<string> {
    const coins = await suiClient.getCoins({ owner, coinType, limit: 50 });
    if (!coins.data.length) {
        throw new Error(`No coins of type ${coinType} found for ${owner}`);
    }
    const largest = coins.data.reduce((a, b) =>
        BigInt(a.balance) > BigInt(b.balance) ? a : b,
    );
    return largest.coinObjectId;
}

async function fundRecipientsFromMaster(
    suiClient: SuiClient,
    master: Ed25519Keypair,
    recipients: Ed25519Keypair[],
) {
    if (!recipients.length) return;

    const masterAddress = master.toSuiAddress();

    // Ensure master has enough SUI and WAL
    const totalSuiNeeded = BigInt(recipients.length) * SUI_PER_RECIPIENT;
    const totalWalNeeded = BigInt(recipients.length) * WAL_PER_RECIPIENT;
    await ensureBalance(suiClient, masterAddress, SUI_TYPE, totalSuiNeeded + MIST_PER_SUI, 'SUI');
    await ensureBalance(suiClient, masterAddress, TESTNET_WAL_COIN_TYPE, totalWalNeeded, 'WAL');

    const walCoinId = await getLargestCoinId(suiClient, masterAddress, TESTNET_WAL_COIN_TYPE);

    const tx = new Transaction();
    tx.setSender(masterAddress);

    // Split SUI from gas and transfer to recipients
    const suiSplits = tx.splitCoins(
        tx.gas,
        recipients.map(() => tx.pure.u64(SUI_PER_RECIPIENT)),
    );
    recipients.forEach((kp, i) => {
        tx.transferObjects([suiSplits[i]], kp.toSuiAddress());
    });

    // Split WAL from a WAL coin and transfer to recipients
    const walSplits = tx.splitCoins(
        tx.object(walCoinId),
        recipients.map(() => tx.pure.u64(WAL_PER_RECIPIENT)),
    );
    recipients.forEach((kp, i) => {
        tx.transferObjects([walSplits[i]], kp.toSuiAddress());
    });

    const { digest } = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: master,
    });
    console.log(`Funding transaction: ${digest}`);
    await suiClient.waitForTransaction({ digest });
    console.log('✅ Distributed funds to derived wallets');
}

export async function getFundedKeypair() {
    const [first] = await getFundedKeypairs(1);
    return first;
}

export async function getFundedKeypairs(count = 1) {
    const fromFile = loadGeneratedWallets();
    if (fromFile && fromFile.length >= count) {
        console.log(`Loaded ${count} wallet(s) from .generated_wallets.env`);
        return fromFile.slice(0, count);
    }

    const suiClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    const mnemonic = getPassphrase();
    const master = deriveKeypairAtIndex(mnemonic, 0);

    const keypairs: Ed25519Keypair[] = [master];

    if (count > 1) {
        const derived = Array.from({ length: count - 1 }, (_, i) =>
            deriveKeypairAtIndex(mnemonic, i + 1),
        );
        await fundRecipientsFromMaster(suiClient, master, derived);
        keypairs.push(...derived);
    }

    const finalKeypairs = keypairs.slice(0, count);
    writeGeneratedWallets(finalKeypairs);
    return finalKeypairs;
}

export function generateRandomBuffer(size: number): Uint8Array {
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
}

function writeGeneratedWallets(keypairs: Ed25519Keypair[]) {
    const lines = keypairs.map((kp, idx) => {
        const address = kp.toSuiAddress();
        const pub = kp.getPublicKey().toBase64();
        const priv = kp.getSecretKey();
        return [
            `WALLET_${idx}_ADDRESS=${address}`,
            `WALLET_${idx}_PUBLIC_KEY=${pub}`,
            `WALLET_${idx}_SECRET_KEY=${priv}`,
        ].join('\n');
    });

    const outPath = path.join(process.cwd(), '.generated_wallets.env');
    fs.writeFileSync(outPath, lines.join('\n') + '\n', { encoding: 'utf8' });
    console.log(`✅ Wrote derived wallet info to ${outPath}`);
}

function loadGeneratedWallets(): Ed25519Keypair[] | null {
    const envPath = path.join(process.cwd(), '.generated_wallets.env');
    if (!fs.existsSync(envPath)) {
        return null;
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const wallets: Ed25519Keypair[] = [];
    const regex = /WALLET_\d+_SECRET_KEY=([^\n]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        const secret = match[1].trim();
        try {
            const { secretKey } = decodeSuiPrivateKey(secret);
            wallets.push(Ed25519Keypair.fromSecretKey(secretKey));
        } catch (e) {
            console.warn('Skipping invalid secret in .generated_wallets.env');
        }
    }
    return wallets.length ? wallets : null;
}
