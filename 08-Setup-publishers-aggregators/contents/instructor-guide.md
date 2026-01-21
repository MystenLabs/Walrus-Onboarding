# Instructor Guide: Module 8

## Module Overview

**Target Audience**: Infrastructure operators, DevOps engineers, developers

**Duration**: 2 hours (1h 15m lessons + 45m lab)

**Learning Objectives**:
1. Deploy and run publishers and aggregators
2. Diagnose common operational issues

---

## Lesson Structure

| Lesson | Topic | Duration | Format |
|--------|-------|----------|--------|
| 1 | Setup and Installation | 15 min | Hands-on |
| 2 | Publisher Operations | 25 min | Demo + Hands-on |
| 3 | Aggregator Operations | 20 min | Demo + Hands-on |
| 4 | Monitoring | 15 min | Lecture + Demo |
| 5 | Troubleshooting | 15 min | Discussion |
| 6 | Hands-On Lab | 30-45 min | Practical |

---

## Prerequisites

### Student Setup
- Computer with CLI access
- Sui wallet with Testnet SUI and WAL tokens
- Internet connectivity
- Terminal with multiple tabs

### Instructor Preparation
- Test all commands beforehand
- Have backup wallet with tokens
- Pre-download Walrus binary
- Prepare demo environment

---

## Teaching Tips by Lesson

### Lesson 1: Setup and Installation

**Key Points**:
- Multiple installation methods available
- Configuration file is critical
- Only publishers need wallets

**Common Issues**:
- PATH not updated → restart terminal
- Firewall blocking download → use pre-downloaded binary
- No wallet tokens → provide faucet links

---

### Lesson 2: Publisher Operations

**Key Concept - Sub-Wallets**:

Use analogy: "Multiple clerks at a post office, each serving one customer at a time"

**Live Demo**:
1. Start publisher
2. Upload test file
3. Show response JSON
4. Explain blob ID

**Discussion Questions**:
- Q: "Why multiple sub-wallets?"
- A: Sui processes transactions sequentially per wallet. Multiple sub-wallets = parallel processing

---

### Lesson 3: Aggregator Operations

**Key Point**: Much simpler than publisher (no wallets, no sub-wallets)

**Teaching Tip - Daemon Mode**:
If students ask about running both services together, explain that `walrus daemon` replaces `walrus publisher` or `walrus aggregator` and provides both upload and download functionality on the same port. For systemd, just replace `publisher` with `daemon` in the ExecStart line.

**Comparison Table** (show visually):

| Feature | Publisher | Aggregator |
|---------|-----------|------------|
| Direction | Upload | Download |
| Needs wallet | Yes | No |
| Complexity | Higher | Lower |

**Live Demo**:
1. Start aggregator
2. Retrieve previous upload
3. Verify data matches

---

### Lesson 4: Monitoring

**Focus On**:
- How to access metrics
- What healthy looks like
- When to worry

**Keep Simple**: Don't deep-dive into Prometheus unless students ask

**Key Metrics**:
- requests_total (should increase)
- errors_total (should be low)
- requests_active (should fluctuate, not stuck)

---

### Lesson 5: Troubleshooting

**Teach the Process**:
1. Check if running
2. Check logs
3. Test connectivity
4. Check metrics
5. Try restart

**Common Issues - Quick Reference**:
- Won't start → check port
- Gas errors → add tokens
- Slow → check saturation in metrics

---

### Lesson 6: Hands-On Lab

**Instructor Role**:
- Circulate and observe
- Ask guiding questions (don't give answers immediately)
- Help students who are stuck > 5 minutes

**Common Lab Issues**:
- "Can't start publisher" → Check process already running
- "Upload fails" → Check wallet balance
- "Can't retrieve" → Verify blob ID (no spaces)

---

## Discussion Question Answers

### Sub-Wallets
**Q**: Why do we need multiple wallets?
**A**: Sui processes transactions from one wallet sequentially. Multiple sub-wallets enable concurrent processing.

### WAL Tokens
**Q**: What happens to WAL when you upload?
**A**: Paid to storage nodes as compensation for storing data.

### Epoch Transitions
**Q**: Why do epoch transitions affect operations?
**A**: Committee (storage nodes) updates. Brief synchronization period causes temporary delays.

---

## Common Student Challenges

### Challenge 1: Sub-Wallet Confusion
**Solution**: Use post office analogy, show metrics during concurrent uploads

### Challenge 2: Metrics Interpretation
**Solution**: Start with simple metrics, explain with real examples from their uploads

### Challenge 3: Troubleshooting Paralysis
**Solution**: Teach systematic 5-step process, walk through example together

---

## Assessment

### Lab Completion Checklist
- ✅ Publisher running
- ✅ Aggregator running
- ✅ Successful uploads
- ✅ Successful downloads with data integrity
- ✅ Metrics checked
- ✅ Failure recovery completed

### Knowledge Check
1. What's the difference between publisher and aggregator?
2. Why does a publisher need sub-wallets?
3. Name three key metrics to monitor
4. How do you troubleshoot a failing upload?

---

## Time Management

**If Running Behind**:
- Simplify monitoring section (skip Prometheus deep-dive)
- Shorten troubleshooting discussion
- Reduce lab to essential steps only

**If Running Ahead**:
- Show Prometheus/Grafana setup
- Discuss production architecture patterns
- Advanced challenge: systemd deployment

---

## Required Materials

**Instructor**:
- Working publisher + aggregator for demos
- Test blobs of various sizes
- Backup wallet with tokens
- Troubleshooting cheat sheet

**Students**:
- Sui CLI installed
- Wallet with tokens
- Terminal emulator
- Text editor

---

## Module Success Criteria

Students can:
✅ Install and configure Walrus
✅ Start publisher and aggregator
✅ Perform uploads and downloads
✅ Read metrics and logs
✅ Diagnose basic issues
✅ Apply recovery procedures

---

## Post-Module

### Suggested Practice
1. Deploy with systemd
2. Set up Prometheus monitoring
3. Test with larger files
4. Try daemon mode

### Additional Resources
- Official Walrus Docs: https://mystenlabs.github.io/walrus/
- Operator Guide: https://mystenlabs.github.io/walrus/operator-guide/aggregator.html
- Prometheus Docs: https://prometheus.io/docs/

---

**Teaching Philosophy**: Focus on hands-on practice. Students learn operations by doing, not just listening.

**Success = Students can independently deploy and operate Walrus infrastructure**
