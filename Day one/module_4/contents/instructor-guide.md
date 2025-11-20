# Instructor's Guide: Epochs and Storage Continuity

## Learning Objectives

By the end of this module, students should be able to:

- **Explain the Epoch Lifecycle**: Describe how Walrus manages time through fixed periods and how
  system parameters update during transitions.
- **Analyze Storage Continuity**: Understand how `Storage` resources and
  `FutureAccountingRingBuffer` guarantee data availability across epoch boundaries.
- **Apply Extension Rules**: Correctly identify when and how to extend blob storage to prevent
  expiration and deletion.
- **Diagnose Timing Issues**: Recognize race conditions (e.g., "Extension Race") and explain why
  buffer periods are necessary.

## Prerequisites

### For Students

- Basic understanding of blockchain concepts (epochs, transactions).
- Familiarity with the Walrus `Blob` structure (from previous modules).
- Ability to read basic Move code (structs and function signatures).

### For Instructor

- Familiarity with the `system_state_inner.move` contract logic.
- Understanding of the `advance_epoch` mechanics.
- Prepared examples of "off-by-one" errors in epoch calculations.

## Section-by-Section Guidance

### Section 1: Epoch Lifecycle

**Key Points to Emphasize:**

- Epochs are the fundamental unit of time in Walrus (2 weeks on Mainnet).
- System parameters (capacity, price) are fixed *per epoch*.
- The transition (`advance_epoch`) is a discrete event that updates the committee and accounting.

**Teaching Tips:**

- Use the analogy of a "rent contract" that renews every 2 weeks.
- Walk through the `EpochParams` struct code to show exactly what is frozen during an epoch.

**Quick Check:**

- "If I store a file today, will the storage price change tomorrow?" (Answer: No, not until the next
  epoch).

**Discussion Points:**

- Why do we need fixed epochs? Why not update prices every second? (Stability, predictability for
  users).

---

### Section 2: How Continuity Protects Availability

**Key Points to Emphasize:**

- **Reservation Model**: You pay upfront. The network guarantees capacity exists.
- **Ring Buffer**: Explain the `FutureAccountingRingBuffer` as a calendar where future slots are
  booked.
- **Exclusive End Epoch**: "End Epoch 13" means the blob expires *when Epoch 13 starts*. It is valid
  through Epoch 12.

**Teaching Tips:**

- Draw a timeline on the whiteboard. Mark "Start" and "End" clearly.
- Use the source code `reserve_space` to show the check `assert!(epochs_ahead <= max_epochs_ahead)`.

**Quick Check:**

- "If `start_epoch` is 10 and `end_epoch` is 12, how many epochs does the blob last?" (Answer: 2
  epochs: 10 and 11).

---

### Section 3: When Storage Extensions Matter

**Key Points to Emphasize:**

- **Extensions allow longevity**: You don't need to re-upload data to keep it.
- **The Golden Rule**: Extend *before* expiry. Once it's gone, it's gone.
- **Fusion**: Internally, an extension "fuses" a new reservation to the old one.

**Teaching Tips:**

- Highlight the `assert_certified_not_expired` function. This is the "gatekeeper" code.
- Discuss the cost implication: Is it cheaper to buy 100 epochs now or extend 1 epoch 100 times?
  (Upload cost is paid once, but gas fees add up for extensions).

**Quick Check:**

- "Can I extend a blob that expired yesterday?" (Answer: No, the transaction will abort).

**Discussion Points:**

- Why does the system delete expired blobs? (To reclaim space and maintain economic sustainability).

---

### Section 4: Extension Race (Advanced Scenario)

**Key Points to Emphasize:**

- **Blockchain Time is discrete**: State changes happen in blocks.
- **Race Condition**: A transaction submitted in Epoch 10 might execute in Epoch 11 if the network
  transitions in between.
- **Safety Margins**: Always extend well before the deadline.

**Teaching Tips:**

- Use the "Extension Race" detailed breakdown from the curriculum.
- Roleplay the race: Student A is the "User Transaction", Student B is the "Epoch Advance". Who
  gets to the validator first?

**Quick Check:**

- "If my blob expires at the start of Epoch 11, and the current epoch is 10, is it safe to wait
  until the last second?" (Answer: No, risky).

---

## Assessment Suggestions

- **Timeline Analysis**: Give students a start epoch and duration, ask for the expiry epoch.
- **Code Review**: Show a snippet of code trying to extend an expired blob and ask them to predict
  the error code (`EResourceBounds`).
- **Scenario Planning**: "You are building an NFT platform. How do you ensure metadata never
  disappears?" (Answer: Automated service to extend blobs N epochs before expiry).

## Additional Resources

- **Walrus Source Code**: `contracts/walrus/sources/system/`
- **Sui Explorer**: To view epoch changes on the testnet/mainnet.

## Module Completion Checklist

- [ ] Student can accurately calculate `end_epoch` given a duration.
- [ ] Student understands why `assert_certified_not_expired` is critical.
- [ ] Student can explain the "Extension Race" diagram.
