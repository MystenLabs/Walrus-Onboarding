# Module 3: Operational Responsibilities and Failure Modes

This module provides a practical understanding of how Walrus components operate in production, where failures can occur, and what each component is responsible for managing.

## Overview

Understanding the operational aspects of Walrus is critical for building reliable applications. This module covers:

- **Component Duties**: What Publishers, Aggregators, and Clients actually do in operation
- **Failure Modes**: Where things can go wrong and how the system handles failures
- **Responsibilities**: What's guaranteed by the system vs. what the client must verify
- **Control Boundaries**: What the CLI controls vs. what the SDK controls
- **Practical Constraints**: Real-world limitations and considerations
- **Hands-On Practice**: Inspecting logs to identify key operational events

## Module Structure

```text
Module3/
├── README.md (this file)
└── contents/
    ├── index.md                # Module overview and curriculum flow
    ├── component-duties.md     # Operational responsibilities of each component
    ├── failure-modes.md        # Where failures occur and how to handle them
    ├── guarantees.md           # System guarantees vs. client responsibilities
    ├── control-boundaries.md   # CLI vs SDK, what controls what
    ├── practical-constraints.md # Real-world limitations and considerations
    ├── hands-on.md            # Log inspection exercises
    └── instructor-guide.md    # Teaching guide for instructors
```

## Getting Started

1. **Start with the [Module Index](./contents/index.md)** - Overview and learning path
2. **Read [Component Duties](./contents/component-duties.md)** - Understand operational responsibilities
3. **Study [Failure Modes](./contents/failure-modes.md)** - Learn where things can go wrong
4. **Review [System Guarantees](./contents/guarantees.md)** - Know what's guaranteed vs. what to verify
5. **Understand [Control Boundaries](./contents/control-boundaries.md)** - CLI vs SDK responsibilities
6. **Learn [Practical Constraints](./contents/practical-constraints.md)** - Real-world limitations
7. **Complete [Hands-On Exercise](./contents/hands-on.md)** - Inspect logs and identify events

## Learning Objectives

By the end of this module, you will be able to:

1. **Explain** what Publishers, Aggregators, and Clients do in real operation
2. **Identify** where failures can occur in the system
3. **Distinguish** between system guarantees and client responsibilities
4. **Understand** what the CLI controls vs. what the SDK controls
5. **Recognize** practical constraints and limitations
6. **Inspect** logs to identify key operational events and troubleshoot issues

## Key Concepts

- **Publisher Duties**: Encoding, distribution, certificate aggregation, gas management
- **Aggregator Duties**: Metadata queries, sliver fetching, reconstruction, caching
- **Client Responsibilities**: Verification, retry logic, error handling
- **System Guarantees**: Byzantine tolerance, data integrity, availability
- **Client Verification**: What the client must check independently
- **Failure Points**: Network issues, node failures, encoding errors, transaction failures
- **Control Boundaries**: What the CLI automates vs. what the SDK exposes

## Prerequisites

Before starting this module, you should have:

- Completed Module 1 (Introduction to Walrus)
- Completed Module 2 (Walrus Architecture)
- Understanding of upload and retrieval flows
- Familiarity with Walrus CLI and basic commands
- Access to Walrus logs or sample logs (for hands-on exercises)

## Resources

### For Students

- [Walrus Developer Operations Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/dev-guide/dev-operations.md)
- [Properties and Guarantees](https://github.com/MystenLabs/walrus/blob/main/docs/book/design/properties.md)
- [Publisher Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/operator-guide/auth-publisher.md)
- [Aggregator Operator Guide](https://github.com/MystenLabs/walrus/blob/main/docs/book/operator-guide/aggregator.md)

### For Instructors

- **[Instructor Guide](./contents/instructor-guide.md)** - Comprehensive teaching guide with lesson plans, discussion questions, and assessment strategies

## Next Steps

After completing this module, you should:

- Understand operational responsibilities of each component
- Know where failures can occur and how to handle them
- Be able to distinguish system guarantees from client responsibilities
- Understand practical constraints when building applications
- Be able to troubleshoot issues by inspecting logs

Proceed to Module 4 to continue your Walrus training journey.

---

## Instructor Resources

If you're teaching this module, be sure to review the **[Instructor Guide](./contents/instructor-guide.md)** which includes:

- Detailed lesson plans for each section (60-75 minutes total)
- Teaching tips and real-world examples
- Common student questions with answers
- Assessment strategies
- Sample logs for hands-on exercises
- Troubleshooting scenarios
