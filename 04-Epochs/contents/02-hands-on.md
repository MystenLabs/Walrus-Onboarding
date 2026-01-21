# Hands-On Exercises

## Interpret an Epoch Timeline

Consider a blob stored with the following properties:

- **Creation Epoch**: 100
- **Duration**: 5 epochs

**Questions:**

1. What is the `start_epoch` and `end_epoch` of the storage resource?
1. During which epochs is the data guaranteed to be available?
1. At the beginning of which epoch does the data become eligible for deletion?
1. If the current epoch is 103, is the blob safe? Can you extend it?

### Answers

1. **Start**: 100, **End**: 105 (100 + 5).
1. **Available**: Epochs 100, 101, 102, 103, 104.
1. **Deletion**: The blob expires at the transition to **Epoch 105**.
1. **Status**: Yes, in Epoch 103 the blob is safe. You can extend it because it has not yet reached
   Epoch 105.

---

## Extension Race Scenarios

Analyze the following scenarios and predict whether each extension transaction will **succeed** or **fail**. Explain your reasoning.

### Scenario A: Safe Extension Window

**Setup:**
- Current epoch: 50
- Blob `end_epoch`: 52
- User submits `extend_blob` transaction with `extended_epochs: 3`

**Question:** Will this transaction succeed or fail? Why?

<details>
<summary>Answer</summary>

**Result: Succeed**

**Reasoning:**
- The blob's `end_epoch` is 52, meaning it expires at the start of Epoch 52.
- Current epoch is 50, so the blob is still valid (50 < 52).
- The `assert_certified_not_expired(50)` check will pass.
- The extension will add 3 epochs, creating a new `end_epoch` of 55 (52 + 3).
- This is a safe window with 2 epochs of buffer before expiry.
</details>

---

### Scenario B: Last-Minute Extension

**Setup:**
- Current epoch: 60
- Blob `end_epoch`: 61
- User submits `extend_blob` transaction with `extended_epochs: 5`
- **Critical detail**: The transaction is submitted in the final block of Epoch 60, but there's a chance the network will process `advance_epoch` before this transaction executes.

**Question:** Will this transaction succeed or fail? What are the risks?

<details>
<summary>Answer</summary>

**Result: Risky - May Succeed or Fail (Race Condition)**

**Reasoning:**
- **If executed in Epoch 60**: The transaction will succeed because `60 < 61`, so `assert_certified_not_expired(60)` passes.
- **If executed in Epoch 61**: The transaction will fail because `61 < 61` is false, causing `assert_certified_not_expired(61)` to abort with `EResourceBounds`.
- **The Risk**: This is a race condition. The outcome depends on whether `advance_epoch` is processed before the extension transaction in the same block or in a subsequent block.
- **Best Practice**: Always extend with multiple epochs of buffer (e.g., extend when you have 2-3 epochs remaining, not 1).
</details>

---

### Scenario C: Already Expired

**Setup:**
- Current epoch: 75
- Blob `end_epoch`: 75
- User submits `extend_blob` transaction with `extended_epochs: 10`

**Question:** Will this transaction succeed or fail? Why?

<details>
<summary>Answer</summary>

**Result: Fail**

**Reasoning:**
- The blob's `end_epoch` is 75, meaning it expired at the start of Epoch 75.
- Current epoch is 75, so `assert_certified_not_expired(75)` will check: `75 < 75`.
- This assertion is **false**, causing the transaction to abort with error code `EResourceBounds`.
- **Key Lesson**: Once a blob expires, it cannot be extended. The data is eligible for garbage collection and may already be deleted by storage nodes.
</details>

---

### Scenario D: Extension Planning

**Setup:**
- Current epoch: 100
- Blob `end_epoch`: 105
- User wants to extend the blob to last until Epoch 120

**Question:** 
1. How many epochs should the user request in `extended_epochs`?
2. What is the safest epoch to submit this extension?

<details>
<summary>Answer</summary>

1. **Epochs to extend**: 15 epochs
   - Current `end_epoch`: 105
   - Target epoch: 120
   - Calculation: `120 - 105 = 15`
   - The user should call `extend_blob` with `extended_epochs: 15`.

2. **Safest epoch to submit**: Epoch 100, 101, 102, or 103
   - The blob expires at the start of Epoch 105.
   - Submitting in Epoch 100-103 provides a 2-5 epoch safety buffer.
   - **Avoid**: Waiting until Epoch 104 (the last active epoch) risks a race condition if the network transitions to Epoch 105 before the transaction executes.
   - **Best Practice**: Extend when you have at least 2-3 epochs remaining before expiry.
</details>

---

## Key Takeaways

- **Epoch math is straightforward**: `end_epoch = start_epoch + duration`
- **Exclusive end epoch**: A blob with `end_epoch: 105` is valid during epochs 100-104 (5 epochs total)
- **Extension calculation**: `extended_epochs = target_epoch - current_end_epoch`
- **Race conditions are real**: Last-minute extensions (1 epoch buffer) are risky and may fail
- **Safe buffer**: Always extend with at least 2-3 epochs remaining before expiry
- **No recovery**: Once `current_epoch >= end_epoch`, the blob cannot be extended

## Next Steps

Congratulations on completing the Epochs and Storage Continuity curriculum! You now understand:

- ✅ How Walrus manages time through epochs
- ✅ The exclusive nature of `end_epoch` in storage resources
- ✅ Why extensions must happen before expiry
- ✅ How to identify and avoid extension race conditions
- ✅ Best practices for planning storage duration and extensions

### Further Exploration

- **CLI Practice**: Try storing blobs with different `--epochs` values on Testnet (1-day epochs)
- **Extension Workflow**: Practice extending blobs using `walrus extend`
- **Monitoring**: Use `walrus blob-status` to check blob expiration times
- **Automation**: Consider building automated extension services for production applications
