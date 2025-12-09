import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV2 } from '@mysten/sui/faucet';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI, parseStructTag } from '@mysten/sui/utils';
import { TESTNET_WALRUS_PACKAGE_CONFIG } from '@mysten/walrus';

// Default passphrase (fallback if environment variable not set)
const DEFAULT_PASSPHRASE = 'dress boy allow mammal heavy glow alter canal aunt broken eye secret';

/**
 * Gets the passphrase from environment variable or uses default.
 * Students should set PASSPHRASE environment variable in Docker.
 */
function getPassphrase(): string {
    const envPassphrase = process.env.PASSPHRASE;
    if (envPassphrase) {
        console.log('Using passphrase from environment variable');
        return envPassphrase.trim();
    }
    console.log('Using default passphrase (set PASSPHRASE environment variable to use your own)');
    return DEFAULT_PASSPHRASE;
}

export async function getFundedKeypair() {
    const suiClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    // Derive keypair from passphrase for consistent wallet across runs
    const passphrase = getPassphrase();
    const keypair = Ed25519Keypair.deriveKeypair(passphrase);
    const address = keypair.toSuiAddress();

    console.log(`Using wallet address: ${address}`);

    const balance = await suiClient.getBalance({
        owner: address,
    });

    if (BigInt(balance.totalBalance) < MIST_PER_SUI) {
        console.log('Requesting SUI from faucet...');
        try {
            await requestSuiFromFaucetV2({
                host: getFaucetHost('testnet'),
                recipient: address,
            });
            
            // Wait a bit for the coin to appear
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Faucet request completed.');
        } catch (error) {
            console.warn('Faucet request failed (possibly rate limited):', error);
            console.log('Continuing with existing balance...');
        }
    } else {
        console.log(`Wallet already has ${Number(balance.totalBalance) / 1e9} SUI`);
    }

    // Check WAL balance and exchange if needed
    const TESTNET_WAL_COIN_TYPE = '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL';
    const minWalBalance = BigInt(MIST_PER_SUI) / 2n; // 0.5 WAL minimum
    
    const walBalance = await suiClient.getBalance({
        owner: address,
        coinType: TESTNET_WAL_COIN_TYPE,
    });
    
    const currentWalBalance = BigInt(walBalance.totalBalance);
    console.log(`Current WAL balance: ${Number(currentWalBalance) / 1e9} WAL`);
    
    if (currentWalBalance < minWalBalance) {
        console.log('Insufficient WAL balance. Exchanging SUI for WAL...');
        try {
            const suiBalance = await suiClient.getBalance({
                owner: address,
                coinType: '0x2::sui::SUI',
            });
            
            const availableSui = BigInt(suiBalance.totalBalance);
            const exchangeAmount = availableSui > MIST_PER_SUI 
                ? MIST_PER_SUI / 2n  // Exchange 0.5 SUI
                : availableSui / 2n;
            
            if (exchangeAmount >= MIST_PER_SUI / 10n) {
                const tx = new Transaction();
                tx.setSender(address);
                
                const exchangeId = TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0];
                const exchange = await suiClient.getObject({
                    id: exchangeId,
                    options: { showType: true },
                });
                
                if (exchange.data?.type) {
                    const exchangePackageId = parseStructTag(exchange.data.type).address;
                    
                    const walCoin = tx.moveCall({
                        package: exchangePackageId,
                        module: 'wal_exchange',
                        function: 'exchange_all_for_wal',
                        arguments: [
                            tx.object(exchangeId),
                            coinWithBalance({ balance: exchangeAmount }),
                        ],
                    });
                    
                    tx.transferObjects([walCoin], address);
                    
                    const { digest } = await suiClient.signAndExecuteTransaction({
                        transaction: tx,
                        signer: keypair,
                    });
                    
                    console.log(`Exchange transaction: ${digest}`);
                    await suiClient.waitForTransaction({ digest });
                    console.log('✅ WAL exchange completed');
                }
            }
        } catch (error) {
            console.warn('Could not exchange SUI for WAL:', error);
        }
    } else {
        console.log('✅ Sufficient WAL balance available');
    }

    return keypair;
}

export function generateRandomBuffer(size: number): Uint8Array {
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
}




