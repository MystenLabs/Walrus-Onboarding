# Walrus Architecture Developer Curriculum

Welcome to the Walrus Architecture Developer Curriculum! This curriculum is designed to help developers understand the core components and data flows of the Walrus decentralized storage system.

For information about Walrus use cases and objectives, see the [Objectives and Use Cases](https://github.com/MystenLabs/walrus/blob/main/docs/design/objectives_use_cases.md) documentation.

## Learning Objectives

By the end of this curriculum, you will be able to:

1. **Understand each system component** - Know the role and responsibilities of Publishers, Aggregators, and Storage Nodes
2. **Understand end-to-end data flow** - Trace how data moves from client upload to permanent storage and back through retrieval

## Curriculum Structure

This curriculum is organized into the following sections:

1. **[System Components](./components.md)** - Deep dive into each component of the Walrus system
   - Storage nodes (core)
   - Publisher role (optional)
   - Aggregator role (optional)

2. **[Chunk Creation and Encoding](./chunk-creation.md)** - Understanding how blobs are encoded into slivers
   - Encoding process
   - Sliver creation
   - Blob ID computation
   - Consistency checks

3. **[Data Flow](./data-flow.md)** - Understanding how data moves through the system
   - How data moves from the client to permanent storage
   - How retrieval works
   - Diagram of the flow

4. **[Hands-On Walkthrough](./hands-on.md)** - Practical exercise
   - Walk through an upload flow with a visual sequence

## Curriculum Flow

Follow this recommended learning path:

1. **[System Components](./components.md)** - Start here to understand the building blocks of Walrus
   - Core component: Storage Nodes
   - Optional components: Publishers and Aggregators

2. **[Chunk Creation and Encoding](./chunk-creation.md)** - Learn how data is transformed
   - Encoding process and erasure coding
   - Sliver creation and blob ID computation

3. **[Data Flow](./data-flow.md)** - See how everything works together
   - Upload flow: Client → Publisher → Storage Nodes → Point of Availability
   - Retrieval flow: Client → Aggregator → Storage Nodes → Client

4. **[Hands-On Walkthrough](./hands-on.md)** - Practice what you've learned
   - Upload a blob and trace its journey
   - Retrieve a blob and see reconstruction in action

## Next Steps

Start with [System Components](./components.md) to understand the building blocks of Walrus, then learn about [Chunk Creation and Encoding](./chunk-creation.md) to understand how data is transformed, and finally proceed to [Data Flow](./data-flow.md) to see how everything works together.

