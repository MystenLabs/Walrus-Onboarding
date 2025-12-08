# Module 4: Epochs, Continuity, and Extension

This module explores how Walrus manages time through epochs, how storage continuity is maintained, and the mechanics of extending storage duration.

## Learning Objectives

By the end of this module, you will be able to:

1. **Understand the Epoch Lifecycle** - Explain how Walrus manages time through fixed periods and how system parameters update during transitions
2. **Analyze Storage Continuity** - Understand how `Storage` resources and `FutureAccountingRingBuffer` guarantee data availability across epoch boundaries
3. **Apply Extension Rules** - Correctly identify when and how to extend blob storage to prevent expiration and deletion
4. **Diagnose Timing Issues** - Recognize race conditions and explain why buffer periods are necessary

## Module Structure

This module contains the following materials:

### Core Content

- **[Index](./contents/index.md)** - Curriculum overview and navigation
- **[Epochs, Continuity, and Extension](./contents/01-epochs-continuity.md)** - Core concepts covering:
  - Epoch lifecycle and system parameters
  - Storage continuity mechanisms
  - Storage extension rules and mechanics
  - Real-world scenarios and examples

### Practical Exercises

- **[Hands-On Exercises](./contents/02-hands-on.md)** - Practice problems including:
  - Interpreting epoch timelines
  - Solving continuity puzzles
  - Analyzing extension race scenarios

### Teaching Resources

- **[Instructor Guide](./contents/instructor-guide.md)** - Teaching guidance with:
  - Section-by-section teaching tips
  - Quick check questions
  - Assessment suggestions
  - Discussion points

## Quick Start

1. **Read [Epochs, Continuity, and Extension](./contents/01-epochs-continuity.md)** to master the core concepts
2. **Complete the [Hands-On Exercises](./contents/02-hands-on.md)** to test your understanding