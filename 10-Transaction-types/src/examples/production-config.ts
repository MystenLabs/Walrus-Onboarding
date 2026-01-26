// @ts-nocheck
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus';
import { Agent, setGlobalDispatcher } from 'undici';

// 1. Configure global HTTP agent for better performance/timeouts.
setGlobalDispatcher(
    new Agent({
        connectTimeout: 60_000,
        connect: { timeout: 60_000 },
    })
);

// 2. Configure Walrus client with specific timeouts.
const client = new SuiClient({
    url: getFullnodeUrl('mainnet'),
    network: 'mainnet',
}).$extend(
    walrus({
        storageNodeClientOptions: {
            timeout: 60_000, // Wait up to 60s for storage nodes.
        },
    })
);

void client;
