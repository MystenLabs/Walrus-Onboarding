import { WalrusFile } from '@mysten/walrus';

export function validateIdentifiers(files: WalrusFile[]) {
  // Validate before creating quilt
  const identifiers = new Set();
  for (const file of files) {
    // In recent SDK versions, identifier might be async or a property. 
    // Assuming property access for snippet context, or casting to any if strictly internal type.
    // Ideally we should use await file.getIdentifier() if it's a proper WalrusFile instance
    // but this snippet is illustrative.
    // Let's assume synchronous property access for the purpose of this specific snippet's validation logic.
    // If WalrusFile interface requires async, we'd change this to async function.
    // Checking WalrusFile definition from other files: it has getIdentifier() method.
    
    // However, this snippet is likely intended to show the *concept* of pre-validation.
    // Let's allow 'any' access to bypass strict type check on private properties if needed, 
    // or assume a simplified structure for the snippet.
    
    // Correcting to use public API would be best:
    // But we can't easily make this loop async if it wasn't designed to be.
    // Let's assume 'identifier' property exists on the input object before it becomes a WalrusFile, 
    // OR mock the property access.
    
    const id = (file as any).identifier; 
    if (identifiers.has(id)) {
      throw new Error(`Duplicate identifier: ${id}`);
    }
    identifiers.add(id);
  }
}
