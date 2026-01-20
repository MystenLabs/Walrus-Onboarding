/**
 * Utility to check if the current module is the main entry point.
 * 
 * This properly detects whether a file is being run directly (e.g., `tsx file.ts`)
 * or imported as a module by another file.
 */

import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Check if the current module is the main entry point.
 * 
 * @param importMetaUrl - Pass `import.meta.url` from the calling module
 * @returns true if the module is being run directly, false if imported
 * 
 * @example
 * ```typescript
 * import { isMainModule } from '../utils/isMainModule.js';
 * 
 * if (isMainModule(import.meta.url)) {
 *   main().catch(console.error);
 * }
 * ```
 */
export function isMainModule(importMetaUrl: string): boolean {
  if (!process.argv[1]) {
    return false;
  }
  
  const currentFile = fileURLToPath(importMetaUrl);
  const entryFile = path.resolve(process.argv[1]);
  
  return currentFile === entryFile;
}

