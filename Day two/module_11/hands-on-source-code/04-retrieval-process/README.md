# 04 - Retrieval Process Examples

This directory contains executable examples for retrieving data from quilts, corresponding to Module 11, Section 4 of the curriculum.

## Prerequisites

1. **Walrus CLI**: Ensure `walrus` is in your PATH and configured.
2. **Node.js**: Required for TypeScript examples.
3. **Quilt Info**: The scripts look for `../quilt-info.json` (created in previous labs) for the Quilt ID. If not found, they default to a placeholder.

## Directory Structure

- `cli/`: Bash scripts demonstrating CLI commands.
- `ts/`: TypeScript files demonstrating SDK usage.

## Running CLI Examples

```bash
cd cli
./01-retrieve-by-identifier.sh
./02-retrieve-by-tag.sh
./03-list-patches.sh
# ... and so on
```

## Running TypeScript Examples

Ensure dependencies are installed in the root `hands-on-source-code` directory:

```bash
cd ../..
npm install
```

Then run the examples using `npx tsx`:

```bash
cd 04-retrieval-process/ts
npx tsx 01-get-files-identifiers.ts
# ... and so on
```

