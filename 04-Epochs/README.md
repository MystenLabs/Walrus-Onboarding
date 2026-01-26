# Module 4: Epochs, Continuity, and Extension

This module explores how Walrus manages time through epochs, how storage continuity is maintained, and the mechanics of extending storage duration.

## Learning Objectives

By the end of this module, you will be able to:

1. **Understand the Epoch Lifecycle** - Explain how Walrus manages time through fixed periods (2 weeks on Mainnet, 1 day on Testnet) and how system parameters update during transitions
2. **Analyze Storage Continuity** - Understand how `Storage` resources and `FutureAccountingRingBuffer` guarantee data availability across epoch boundaries, and recognize that these are Sui Objects with on-chain identity
3. **Apply Extension Rules** - Correctly identify when and how to extend blob storage to prevent expiration and deletion, understanding the exclusive nature of `end_epoch`
4. **Diagnose Timing Issues** - Recognize race conditions at epoch boundaries and explain why buffer periods (2-3 epochs) are necessary to prevent data loss

## Module Structure

This module contains the following materials:

### Core Content

- **[Index](./contents/index.md)** - Curriculum overview and navigation
- **[Epochs, Continuity, and Extension](./contents/01-epochs-continuity.md)** - Comprehensive guide covering:
  - Sui ↔ Walrus connection (how `Blob` and `Storage` are Sui Objects)
  - Epoch lifecycle and system parameters (`EpochParams`, `advance_epoch`)
  - Storage continuity mechanisms (`Storage` struct, `FutureAccountingRingBuffer`)
  - Storage extension rules and mechanics (`extend_blob`, `assert_certified_not_expired`)
  - Epoch advancement and ring buffer rotation
  - Timeline diagrams and real-world scenarios
  - Extension race conditions and best practices

### Practical Exercises

- **[Hands-On Exercises](./contents/02-hands-on.md)** - Practice problems including:
  - Interpreting epoch timelines (calculating `start_epoch` and `end_epoch`)
  - Solving continuity puzzles
  - Analyzing extension race scenarios (safe vs. risky extension windows)
  - Extension planning calculations

### Teaching Resources

- **[Instructor Guide](./contents/instructor-guide.md)** - Comprehensive teaching guidance with:
  - Section-by-section teaching tips and timing recommendations
  - Quick check questions for each section
  - Assessment suggestions and exit tickets
  - Discussion points and common misconceptions
  - Sui ↔ Walrus connection emphasis points
  - Visual aids and whiteboard drawing scripts

### Visual Resources

The module includes several diagrams to illustrate key concepts:

- **`images/Walrus_Epoch_lifecycle_flow.png`** - Epoch lifecycle visualization
- **`images/Blob_Storage_timeline.png`** - Blob storage lifecycle across epochs
- **`images/Extension_race_condition.png`** - Race condition scenario diagram
- **`images/epoch-lifecycle-flow.svg`** - SVG version of epoch lifecycle
- **`assets/epoch-lifecycle-flow.excalidraw.json`** - Source Excalidraw file for customization

## Quick Start

1. **Start with the [Index](./contents/index.md)** for a curriculum overview
2. **Read [Epochs, Continuity, and Extension](./contents/01-epochs-continuity.md)** to master the core concepts, paying special attention to:
   - The Sui ↔ Walrus connection section
   - Exclusive `end_epoch` semantics
   - Extension race conditions
3. **Complete the [Hands-On Exercises](./contents/02-hands-on.md)** to test your understanding with real scenarios
4. **For instructors**: Review the [Instructor Guide](./contents/instructor-guide.md) for teaching strategies and classroom activities
