# Module 8: Setup and Operation of Publishers and Aggregators

Welcome to Module 8! Learn how to deploy and operate **Walrus Publishers and Aggregators** - the HTTP infrastructure that enables easy client access to Walrus storage.

---

## 🎯 Learning Objectives

1. **Deploy and run publishers and aggregators correctly**
2. **Diagnose common operational issues**

---

## 📚 Module Content

### Lessons (6 lessons + lab, ~2 hours total)

1. **[Setup and Installation](./contents/01-setup-installation.md)** - 15 min
2. **[Publisher Operations](./contents/02-publisher-operations.md)** - 25 min
3. **[Aggregator Operations](./contents/03-aggregator-operations.md)** - 20 min
4. **[Monitoring](./contents/04-monitoring.md)** - 15 min
5. **[Troubleshooting](./contents/05-troubleshooting.md)** - 15 min
6. **[Hands-On Lab](./contents/06-hands-on-lab.md)** - 30-45 min

---

## 📋 What You'll Learn

### Publisher Operations
- Install Walrus
- Start and configure publishers
- Test uploads
- Monitor health
- Understand sub-wallets

### Aggregator Operations
- Start and configure aggregators
- Test downloads
- Validate data integrity
- Monitor operations

### Operational Skills
- Read metrics
- Diagnose issues
- Apply recovery procedures
- Deploy with systemd

---

## ✅ Prerequisites

- Command-line proficiency
- Sui wallet with Testnet tokens (for publisher)
- Basic understanding of HTTP APIs
- Internet connectivity

---

## 🚀 Quick Start

1. Start with [Overview](./contents/00-overview.md)
2. Follow lessons 1-6 in order
3. Complete the hands-on lab

---

## 🎓 For Instructors

See [Instructor Guide](./contents/instructor-guide.md) for:
- Teaching tips
- Discussion questions
- Common student issues
- Lab guidance

---

## 📝 Key Concepts

**Publisher**: HTTP server for uploading blobs
- Requires SUI + WAL tokens
- Uses sub-wallets for concurrency
- Endpoint: `PUT /v1/blobs`

**Aggregator**: HTTP server for downloading blobs
- No tokens needed (read-only)
- Endpoint: `GET /v1/blobs/<blob_id>`

**Daemon**: Combined publisher + aggregator

---

## ⏱️ Time Estimate

- **Lessons**: 1h 15m
- **Lab**: 30-45m
- **Total**: ~2 hours

---

## 🔗 Resources

- **Official Docs**: [mystenlabs.github.io/walrus](https://mystenlabs.github.io/walrus/)
- **Operator Guide**: [Aggregator/Publisher Docs](https://mystenlabs.github.io/walrus/operator-guide/aggregator.html)
- **Walrus GitHub**: [github.com/MystenLabs/walrus](https://github.com/MystenLabs/walrus)

---

**Ready to begin?** → [Start with Overview](./contents/00-overview.md)
