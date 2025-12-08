import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
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

/**
 * Gets or creates a funded keypair for testing.
 * Derives the keypair from a passphrase (from environment variable or default).
 */
export async function getFundedKeypair(): Promise<Ed25519Keypair> {
  // Get passphrase from environment or use default
  const passphrase = getPassphrase();
  
  // Derive keypair from passphrase
  const keypair = Ed25519Keypair.deriveKeypair(passphrase);
  const address = keypair.toSuiAddress();
  
  console.log(`Derived keypair from passphrase with address: ${address}`);
  
  // Try to request from faucet and ensure WAL balance (only works on testnet/devnet)
  try {
    const client = new SuiClient({
      url: getFullnodeUrl('testnet'),
      network: 'testnet',
    });
    
    // Check if we already have SUI coins
    const suiCoins = await client.getCoins({
      owner: address,
      coinType: '0x2::sui::SUI',
    });
    
    if (suiCoins.data.length === 0) {
      console.log('Requesting SUI from faucet...');
      await requestSuiFromFaucetV0({
        host: 'https://faucet.testnet.sui.io',
        recipient: address,
      });
      console.log('Faucet request sent. Please wait a moment for coins to arrive.');
      // Wait a bit for coins to arrive
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`Keypair already has ${suiCoins.data.length} SUI coins.`);
    }
    
    // Check WAL balance
    const TESTNET_WAL_COIN_TYPE = '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL';
    const minWalBalance = BigInt(MIST_PER_SUI) / 2n; // 0.5 WAL minimum
    
    const walBalance = await client.getBalance({
      owner: address,
      coinType: TESTNET_WAL_COIN_TYPE,
    });
    
    const currentWalBalance = BigInt(walBalance.totalBalance);
    console.log(`Current WAL balance: ${currentWalBalance.toString()} (minimum needed: ${minWalBalance.toString()})`);
    
    // Exchange SUI for WAL if balance is insufficient
    if (currentWalBalance < minWalBalance) {
      console.log('Insufficient WAL balance. Exchanging SUI for WAL...');
      
      try {
        // Get SUI balance to ensure we have enough
        const suiBalance = await client.getBalance({
          owner: address,
          coinType: '0x2::sui::SUI',
        });
        
        const availableSui = BigInt(suiBalance.totalBalance);
        // Reserve some SUI for gas, exchange half of what we have (or at least 0.5 SUI)
        const exchangeAmount = availableSui > MIST_PER_SUI 
          ? MIST_PER_SUI / 2n  // Exchange 0.5 SUI
          : availableSui / 2n;  // Or half of what we have
        
        if (exchangeAmount < MIST_PER_SUI / 10n) {
          console.warn(`Insufficient SUI balance (${availableSui.toString()}) to exchange for WAL. Need at least 0.1 SUI.`);
          console.warn('Please ensure you have SUI in your test keypair for this address:', address);
          return keypair;
        }
        
        // Create transaction to exchange SUI for WAL
        const tx = new Transaction();
        tx.setSender(address);
        
        // Get exchange object
        const exchangeId = TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0];
        const exchange = await client.getObject({
          id: exchangeId,
          options: {
            showType: true,
          },
        });
        
        if (!exchange.data?.type) {
          throw new Error('Could not fetch exchange object type');
        }
        
        const exchangePackageId = parseStructTag(exchange.data.type).address;
        
        // Exchange SUI for WAL
        const walCoin = tx.moveCall({
          package: exchangePackageId,
          module: 'wal_exchange',
          function: 'exchange_all_for_wal',
          arguments: [
            tx.object(exchangeId),
            coinWithBalance({
              balance: exchangeAmount,
            }),
          ],
        });
        
        tx.transferObjects([walCoin], address);
        
        // Sign and execute transaction
        const { digest } = await client.signAndExecuteTransaction({
          transaction: tx,
          signer: keypair,
        });
        
        console.log(`Exchange transaction submitted: ${digest}`);
        console.log(`Exchanging ${Number(exchangeAmount) / 1e9} SUI for WAL...`);
        
        // Wait for transaction to complete
        await client.waitForTransaction({
          digest,
        });
        
        // Verify new WAL balance
        const newWalBalance = await client.getBalance({
          owner: address,
          coinType: TESTNET_WAL_COIN_TYPE,
        });
        
        console.log(`✅ WAL balance updated: ${newWalBalance.totalBalance} (was: ${currentWalBalance.toString()})`);
      } catch (error) {
        console.warn('Could not exchange SUI for WAL:', error);
        console.warn('You may need to manually exchange SUI for WAL or fund your wallet with WAL tokens.');
      }
    } else {
      console.log('✅ Sufficient WAL balance already available.');
    }
  } catch (error) {
    console.warn('Could not check/fund wallet:', error);
    console.warn('Please ensure you have SUI in your test keypair for this address:', address);
  }
  
  return keypair;
}
