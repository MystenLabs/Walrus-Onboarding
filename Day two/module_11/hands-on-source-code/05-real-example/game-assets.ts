// game-assets.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { getFundedKeypair } from '../src/get-keypair.js';
import { readFile } from 'fs/promises';

class GameAssetManager {
  constructor(
    private client: any,
    private quiltId: string
  ) {}
  
  /**
   * Load all assets for a specific level
   */
  async loadLevelAssets(levelNumber: number): Promise<Map<string, Uint8Array>> {
    const blob = await this.client.walrus.getBlob({ blobId: this.quiltId });
    const patches = await blob.files({
      tags: [{ level: levelNumber.toString() }],
    });
    
    const assets = new Map<string, Uint8Array>();
    
    for (const patch of patches) {
      const identifier = await patch.getIdentifier();
      const content = await patch.bytes();
      if (identifier) {
        assets.set(identifier, content);
      }
    }
    
    console.log(`Loaded ${assets.size} assets for level ${levelNumber}`);
    return assets;
  }
  
  /**
   * Load assets by type (texture, sound, config)
   */
  async loadAssetsByType(type: string): Promise<Map<string, Uint8Array>> {
    const blob = await this.client.walrus.getBlob({ blobId: this.quiltId });
    const patches = await blob.files({
      tags: [{ type }],
    });
    
    const assets = new Map<string, Uint8Array>();
    
    for (const patch of patches) {
      const identifier = await patch.getIdentifier();
      const content = await patch.bytes();
      if (identifier) {
        assets.set(identifier, content);
      }
    }
    
    return assets;
  }
  
  /**
   * Preload commonly used assets
   */
  async preloadCommonAssets(): Promise<void> {
    const blob = await this.client.walrus.getBlob({ blobId: this.quiltId });
    const commonPatches = await blob.files({
      tags: [{ common: 'true' }],
    });
    
    console.log(`Preloading ${commonPatches.length} common assets...`);
    
    // Load in parallel
    await Promise.all(
      commonPatches.map(async (patch: WalrusFile) => {
        const identifier = await patch.getIdentifier();
        const content = await patch.bytes();
        if (identifier) {
          this.cacheAsset(identifier, content);
        }
      })
    );
  }
  
  private cacheAsset(identifier: string, content: Uint8Array): void {
    // Cache implementation (e.g., IndexedDB, localStorage, memory)
    console.log(`Cached: ${identifier} (${content.length} bytes)`);
  }
}

// Upload game assets
async function uploadGameAssets() {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any
  }).$extend(walrus());

  const keypair = await getFundedKeypair();
  
  // Load real files from disk for our game assets
  const [
    level1Background,
    level1Music,
    level2Background,
    uiButton,
    gameConfig,
  ] = await Promise.all([
    // Level 1 background texture
    readFile(
      new URL(
        '../03-creation-process/examples-files/assets/banner.jpg',
        import.meta.url,
      ),
    ),
    // Level 1 music (using an existing binary asset)
    readFile(
      new URL(
        '../03-creation-process/examples-files/nft-collection/image001.png',
        import.meta.url,
      ),
    ),
    // Level 2 background texture
    readFile(
      new URL(
        '../03-creation-process/examples-files/assets/logo.png',
        import.meta.url,
      ),
    ),
    // Common UI asset
    readFile(
      new URL(
        '../03-creation-process/examples-files/docs/intro.html',
        import.meta.url,
      ),
    ),
    // Game configuration file
    readFile(
      new URL(
        '../03-creation-process/examples-files/config/app.json',
        import.meta.url,
      ),
    ),
  ]);

  const files = [
    // Level 1 assets
    WalrusFile.from({
      contents: level1Background,
      identifier: 'level1-background',
      tags: { level: '1', type: 'texture', common: 'false' },
    }),
    WalrusFile.from({
      contents: level1Music,
      identifier: 'level1-music',
      tags: { level: '1', type: 'sound', common: 'false' },
    }),

    // Level 2 assets
    WalrusFile.from({
      contents: level2Background,
      identifier: 'level2-background',
      tags: { level: '2', type: 'texture', common: 'false' },
    }),

    // Common assets (used across levels)
    WalrusFile.from({
      contents: uiButton,
      identifier: 'ui-button',
      tags: { type: 'texture', common: 'true' },
    }),
    WalrusFile.from({
      contents: gameConfig,
      identifier: 'game-config',
      tags: { type: 'config', common: 'true' },
    }),
  ];
  
  const quilt = await client.walrus.writeFiles({
    files,
    deletable: false,
    epochs: 10, // Long-term game hosting
    signer: keypair,
  });
  
  console.log('Game assets uploaded!');
  let quiltId = '';
  if (Array.isArray(quilt) && quilt.length > 0) {
      quiltId = (quilt[0] as any).blobId;
  } else if ((quilt as any).blobId) {
      quiltId = (quilt as any).blobId;
  } else if ((quilt as any).quiltId) {
      quiltId = (quilt as any).quiltId;
  }
  
  console.log('Quilt ID:', quiltId);
  
  return quiltId;
}

// Usage in game
async function playLevel(levelNumber: number) {
  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet' as any,
  }).$extend(walrus());
  
  const quiltId = await uploadGameAssets();
  
  const manager = new GameAssetManager(client, quiltId);
  
  // Preload common assets (once at game start)
  await manager.preloadCommonAssets();
  
  // Load level-specific assets
  const levelAssets = await manager.loadLevelAssets(levelNumber);
  
  // Use assets to render level
  console.log(`Level ${levelNumber} loaded with ${levelAssets.size} assets`);
}

// Run test
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    playLevel(1).catch(console.error);
}
