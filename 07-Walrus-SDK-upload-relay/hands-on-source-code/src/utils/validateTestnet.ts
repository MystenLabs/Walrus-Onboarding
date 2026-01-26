/**
 * Environment Validation Utility
 * 
 * Ensures that all example code runs only on testnet, not mainnet.
 * This prevents accidental usage of real funds or production systems.
 */

import { SuiClient } from '@mysten/sui/client';

/**
 * Validates that a SuiClient is configured for testnet, not mainnet.
 * Throws an error if mainnet is detected.
 * 
 * @param client - The SuiClient instance to validate
 * @param network - The network string (should be 'testnet')
 * @param url - The RPC URL (should contain 'testnet')
 * @throws Error if mainnet is detected
 */
export function validateTestnetEnvironment(
  client: SuiClient,
  network: string,
  url: string
): void {
  // Check network string
  if (network !== 'testnet') {
    throw new Error(
      `❌ SAFETY CHECK FAILED: Network must be 'testnet', but got '${network}'. ` +
      `This code is designed for testing only and should not run on mainnet.`
    );
  }

  // Check URL contains testnet
  const urlLower = url.toLowerCase();
  if (urlLower.includes('mainnet') || (urlLower.includes('sui.io') && !urlLower.includes('testnet'))) {
    throw new Error(
      `❌ SAFETY CHECK FAILED: RPC URL appears to be mainnet: ${url}. ` +
      `This code is designed for testing only and should not run on mainnet.`
    );
  }

  // Additional check: verify chain ID if possible
  // This is a best-effort check that won't block if the client isn't connected
  client.getChainIdentifier()
    .then((chainId) => {
      // Testnet chain IDs typically contain 'testnet' or are known testnet values
      const chainIdLower = chainId.toLowerCase();
      if (chainIdLower.includes('mainnet') || chainIdLower === 'mainnet') {
        console.warn(
          `⚠️  WARNING: Chain ID suggests mainnet: ${chainId}. ` +
          `Please verify you are connected to testnet.`
        );
      }
    })
    .catch(() => {
      // Ignore errors - this is just a best-effort check
      // The client might not be connected yet
    });

  console.log('✅ Environment validation passed: Running on testnet');
}

/**
 * Validates testnet environment from network and URL strings.
 * Convenience function for use before creating clients.
 * 
 * @param network - The network string (should be 'testnet')
 * @param url - The RPC URL (should contain 'testnet')
 * @throws Error if mainnet is detected
 */
export function validateTestnetConfig(network: string, url: string): void {
  // Check network string
  if (network !== 'testnet') {
    throw new Error(
      `❌ SAFETY CHECK FAILED: Network must be 'testnet', but got '${network}'. ` +
      `This code is designed for testing only and should not run on mainnet.`
    );
  }

  // Check URL contains testnet
  const urlLower = url.toLowerCase();
  if (urlLower.includes('mainnet') || (urlLower.includes('sui.io') && !urlLower.includes('testnet'))) {
    throw new Error(
      `❌ SAFETY CHECK FAILED: RPC URL appears to be mainnet: ${url}. ` +
      `This code is designed for testing only and should not run on mainnet.`
    );
  }

  console.log('✅ Environment validation passed: Running on testnet');
}

