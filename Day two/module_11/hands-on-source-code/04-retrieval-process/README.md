# 04 - Retrieval Process Examples

This directory contains executable examples for retrieving data from quilts,
corresponding to Module 11, Section 4 of the curriculum.

## Prerequisites

1. **Walrus CLI**: Ensure `walrus` is in your PATH and configured.
2. **Node.js**: Required for TypeScript examples.
3. **Quilt Info**: The scripts look for quilt info JSON files (created in previous
   labs) for the Quilt ID. If not found, they may create a new quilt or use a
   placeholder.

## Directory Structure

- `cli/`: Bash scripts demonstrating CLI commands for retrieving data from quilts.
- `ts/`: TypeScript files demonstrating SDK usage for retrieving data from quilts.
- `cli/*-examples/`: Sample files used by the CLI examples for testing retrieval.

## Running CLI Examples

All CLI scripts should be run from the `cli/` directory:

```bash
cd cli
chmod +x *.sh
./01-retrieve-by-identifier.sh
./02-retrieve-by-tag.sh
./03-list-patches.sh
./04-retrieve-by-patch-id.sh
./05-retrieve-all.sh
./06-common-patterns.sh
./07-http-api-examples.sh
```

### CLI Examples Overview

- **01-retrieve-by-identifier.sh**: Retrieve specific files by their identifier.
- **02-retrieve-by-tag.sh**: Query and retrieve files by tag filters.
- **03-list-patches.sh**: List all patches in a quilt.
- **04-retrieve-by-patch-id.sh**: Retrieve files using patch IDs.
- **05-retrieve-all.sh**: Retrieve all files from a quilt.
- **06-common-patterns.sh**: Common retrieval patterns and use cases.
- **07-http-api-examples.sh**: Examples using HTTP API endpoints for retrieval.

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
npx tsx 02-query-by-tag.ts
npx tsx 03-retrieve-by-patch-id.ts
npx tsx 04-get-all-patches.ts
npx tsx 05-patterns.ts
```

Alternatively, you can use npm scripts from the root `hands-on-source-code` directory:

```bash
# From the root hands-on-source-code directory
npm run retrieve-identifiers
npm run retrieve-tags
npm run retrieve-patch-ids
npm run retrieve-all
npm run retrieve-patterns
```

### TypeScript Examples Overview

- **01-get-files-identifiers.ts**: Get all file identifiers from a quilt.
- **02-query-by-tag.ts**: Query and filter files by tags.
- **03-retrieve-by-patch-id.ts**: Retrieve specific files using patch IDs.
- **04-get-all-patches.ts**: Get all patches from a quilt.
- **05-patterns.ts**: Common retrieval patterns and best practices.
- **retrieve-quilt.ts**: Comprehensive example of retrieving an entire quilt.

## Notes

- Most examples require a Quilt ID. You can provide it as a CLI argument or the
  scripts will look for quilt info JSON files in the directory.
- The CLI examples include sample files in numbered `*-examples/` directories
  for testing purposes.
- Some TypeScript examples may create a new quilt if one doesn't exist, for
  demonstration purposes.
