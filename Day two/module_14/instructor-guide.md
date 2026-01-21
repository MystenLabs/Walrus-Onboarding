# Module 14: Instructor Guide

Guidance for teaching the Use Cases and Design Patterns capstone module.

---

## Module Overview

**Module type**: Capstone/synthesis module

**Duration**: Full day (6-8 hours) or 2 half-days

**Format**: Case studies + discussions + capstone lab

**Prerequisites**: Students must have completed Modules 1-13

**Learning objective**: Map Walrus capabilities to real solutions

---

## Teaching Philosophy

### This Module is Different

**Previous modules**: Taught individual concepts (architecture, costs, quilts, etc.)

**This module**: Synthesizes everything into practical application

**Your role as instructor**:
- Facilitate discussions (not lecture)
- Guide analysis and design thinking
- Share real-world insights
- Review student work
- Provide feedback on trade-offs

### Key Principles

1. **Discussion-driven**: Students learn from each other's approaches
2. **Hands-on**: Capstone lab is the centerpiece
3. **No "right answer"**: Multiple valid designs exist, focus on trade-offs
4. **Real-world focus**: Use actual constraints, not toy examples

---

## Module Structure and Timing

### Recommended Schedule (Full Day)

**Morning Session** (3-4 hours):
- 09:00-09:50: Lesson 1 - NFT Metadata (25 min lesson + 25 min discussion)
- 09:50-10:40: Lesson 2 - Walrus Sites (25 min lesson + 25 min discussion)
- 10:40-10:55: Break
- 10:55-11:45: Lesson 3 - Multi-Part Datasets (25 min lesson + 25 min discussion)
- 11:45-12:35: Lesson 4 - Proof of Concepts (25 min lesson + 25 min discussion)
- 12:35-13:30: Lunch

**Afternoon Session** (3-4 hours):
- 13:30-14:00: Lesson 5 - Design Choices (30 min)
- 14:00-15:30: Capstone Lab (Phase 1-4)
- 15:30-15:45: Break
- 15:45-16:45: Capstone Lab (Phase 5)
- 16:45-17:30: Presentations
- 17:30-18:00: Wrap-up and reflection

### Alternative: Two Half-Days

**Day 1** (4 hours):
- Lessons 1-4 (case studies)
- Lesson 5 (design framework)
- Start capstone lab (Phases 1-2)

**Day 2** (4 hours):
- Continue capstone lab (Phases 3-5)
- Presentations
- Wrap-up

---

## Lesson 1: NFT Metadata Storage

### Learning Goals

Students should understand:
- Why NFT metadata needs decentralized storage
- How quilts provide massive cost savings for collections
- Best practices for NFT storage architecture

### Teaching Tips

**Start with the problem** (5 min):
- Ask: "Who has seen NFTs with broken images?"
- Discuss: Why does this happen? (Centralized servers)
- Lead to: What would solve this?

**Cost analysis is the hook** (10 min):
- Walk through quilt savings calculation (99.98% reduction)
- Have students calculate on their own
- Use whiteboard for visibility
- This "wow moment" cements quilt understanding

**SuiFrens example** (5 min):
- Real production system
- Show that decisions differ per use case
- Individual blobs for composable accessories

**Checkpoints**:
- ✅ Benefits mapping: Have 3-4 students answer aloud
- ✅ Cost calculation: Walk through together on whiteboard
- ✅ Flow tracing: Draw on whiteboard as class calls out steps

### Common Student Mistakes

**Mistake**: Thinking all NFT data must go on Sui
- **Correction**: Clarify Sui = metadata, Walrus = large data

**Mistake**: Not understanding why quilts save money
- **Correction**: Emphasize 64MB metadata overhead for small blobs

**Mistake**: Forgetting epoch extensions
- **Correction**: Ask "what happens in 1 year?" to prompt thinking

### Discussion Prompts

**"Which Walrus feature addresses each problem?"**
- Expected answers:
  1. Disappeared image → High availability (2/3 quorum)
  2. Can't verify original → Content-addressed blob IDs
  3. Service shutdown → Decentralization

**"Which pattern for 10K NFT collection?"**
- Guide discussion to quilts for metadata, individual blobs for images
- Highlight cost difference

### Timing

- Presentation: 15 min
- Checkpoint activities: 5 min
- Discussions: 5 min
- Total: 25 min

---

## Lesson 2: Walrus Sites

### Learning Goals

Students should understand:
- How Walrus Sites work (architecture)
- Deployment workflow with site builder
- Cost comparison to traditional hosting
- Appropriate use cases and limitations

### Teaching Tips

**Architecture walkthrough** (5 min):
- Draw diagram on whiteboard:
  ```
  Browser → Portal → Sui (routes) → Walrus (assets)
  ```
- Have students trace "visit about.html" workflow
- This reinforces how pieces connect

**Live demo** (if possible):
- Show actual Walrus Site
- View source, find blob IDs
- Fetch blob directly from aggregator
- Demonstrates verifiability

**Cost comparison** (5 min):
- $0.02/year vs $60-120/year traditional hosting
- This drives home cost-effectiveness
- Discuss trade-off: cheaper but slower

**Checkpoints**:
- ✅ Trace the flow: Call on students to explain each step
- ✅ Choose pattern: Poll class, discuss reasoning
- ✅ Deploy a site: Show 2-3 student sites as examples

### Common Student Mistakes

**Mistake**: Expecting real-time performance from Walrus Sites
- **Correction**: Clarify latency trade-off, compare to CDN

**Mistake**: Trying to deploy server-side code
- **Correction**: Emphasize "static sites only"

**Mistake**: Not optimizing bundle sizes
- **Correction**: Show impact of large JS bundles on cost

### Discussion Prompts

**"What types of websites work well?"**
- Expected: Documentation, portfolios, blogs, DAO interfaces
- Not: E-commerce, real-time apps, anything needing server-side

**"How would you handle staging vs production?"**
- Multiple answers valid:
  - Different site objects
  - Different epochs
  - Testnet vs mainnet

### Timing

- Presentation: 15 min
- Try It Yourself: 5 min
- Checkpoints: 3 min
- Discussions: 2 min
- Total: 25 min

---

## Lesson 3: Multi-Part Datasets

### Learning Goals

Students should understand:
- When and why to chunk large files
- Parallel upload/download strategies
- Index management for multi-part data
- Recovery patterns for failed operations

### Teaching Tips

**Start with parallelization benefits** (3 min):
- Sequential: 50 chunks × 10s = 8 min
- Parallel (8 workers): 50 ÷ 8 × 10s = 63s
- This motivates the complexity

**Index is critical** (5 min):
- Show what happens without index (chaos)
- Show index structure
- Emphasize: Index on Sui, Walrus, or both

**Use cases ground the concepts** (10 min):
- ML models: Logical boundaries (layers)
- Scientific data: Natural splits (chromosomes, time periods)
- Media: Thumbnails vs full res
- Each shows different strategy

**Checkpoints**:
- ✅ Index design: Review 2-3 on whiteboard
- ✅ Test recovery: Have groups share retry strategies
- ✅ Design scientific storage: Walk through one together

### Common Student Mistakes

**Mistake**: Making chunks too small (overhead dominates)
- **Correction**: Guideline: 100 MB - 5 GB chunks

**Mistake**: Not including verification (hashes)
- **Correction**: Emphasize SHA256 in index

**Mistake**: Forgetting to handle partial failures
- **Correction**: Ask "what if chunk 47 fails?"

### Discussion Prompts

**"Why split a 10 GB ML model into parts?"**
- Expected: Parallelization, fault tolerance, partial updates
- Some may say "no need to split" - valid for some cases

**"At what dataset size does chunking become essential?"**
- Debate this - no single right answer
- Factors: Network reliability, upload time, update patterns

### Timing

- Presentation: 15 min
- Exercise: 5 min
- Checkpoints: 3 min
- Discussions: 2 min
- Total: 25 min

---

## Lesson 4: Proof of Concept Patterns

### Learning Goals

Students should understand:
- What works in production (immutable content, quilts, hybrid architectures)
- What doesn't work (real-time, frequent updates, fine-grained access)
- Common patterns (index on Sui, data on Walrus)
- Anti-patterns to avoid

### Teaching Tips

**Learn from failures** (10 min):
- Each POC has "What Worked" and "What Didn't Work"
- Emphasize the "didn't work" sections equally
- Real learning comes from understanding trade-offs

**Social media POC is relatable** (5 min):
- Most students understand Twitter/X
- Performance expectations clash with Walrus reality
- Good example of wrong fit

**Anti-patterns are powerful** (5 min):
- Show the "DON'T" examples
- Ask: "Why is this bad?"
- Then show "DO" alternative
- This prevents future mistakes

**Checkpoints**:
- ✅ Apply lessons: Have pairs share approaches
- ✅ Design game storage: Review one design
- ✅ Privacy design: Compare approaches
- ✅ Spot anti-patterns: Group discussion

### Common Student Mistakes

**Mistake**: Trying to use Walrus for everything
- **Correction**: Emphasize hybrid architectures, play to strengths

**Mistake**: Ignoring performance constraints
- **Correction**: Walrus is archival-first, not real-time

**Mistake**: Not considering total cost (gas, infrastructure)
- **Correction**: TCO includes more than storage units

### Discussion Prompts

**"What other use cases would benefit from censorship-resistant frontends?"**
- Expected: Journalism, activism, controversial speech
- Discuss ethical implications

**"How would you handle staging vs production deployments?"**
- Multiple valid approaches
- Testnet, separate objects, different epochs

### Timing

- Presentation: 20 min
- Checkpoints: 3 min
- Discussions: 2 min
- Total: 25 min

---

## Lesson 5: Design Choices

### Learning Goals

Students should understand:
- Decision frameworks for each choice
- How to evaluate trade-offs
- Common decision mistakes
- How to apply checklist systematically

### Teaching Tips

**This is a reference lesson** (5 min):
- Students will refer back during capstone
- Walk through frameworks quickly
- Don't dwell on every detail

**Decision trees are useful** (3 min):
- Visual decision trees help
- Draw blob vs quilt tree on board
- Students can replicate

**Templates accelerate learning** (5 min):
- Show NFT Collection template
- Show Document Archive template
- Students can adapt to their use case

**Design checklist is key** (10 min):
- This is what they'll use in capstone
- Walk through each section
- Example: Apply to photo gallery together

**Checkpoints**:
- ✅ Apply framework: Call on students for each scenario
- ✅ Plan epochs: Pair discussion, share reasoning
- ✅ Choose deployment: Poll class
- ✅ Design hybrid storage: Draw on whiteboard
- ✅ Privacy design: Compare approaches
- ✅ Optimize: Discuss trade-offs
- ✅ Choose update pattern: Justify choices
- ✅ Apply checklist: Review 2-3 designs

### Common Student Mistakes

**Mistake**: Premature optimization
- **Correction**: "Start simple, optimize when you have data"

**Mistake**: Ignoring operational reality
- **Correction**: "Who extends epochs? How do you monitor?"

**Mistake**: Only optimizing for cost, ignoring performance
- **Correction**: "What's the user experience?"

### Discussion Prompts

**"Which pattern is closest to your use case?"**
- Helps students start thinking about capstone
- Identify which template to adapt

### Timing

- Presentation: 25 min
- Checkpoints: 5 min
- Total: 30 min

---

## Lesson 6: Hands-On Capstone Lab

### Learning Goals

Students demonstrate ability to:
- Analyze storage requirements
- Design complete Walrus architecture
- Calculate costs accurately
- Create implementation plans
- Communicate technical designs

### Teaching Strategy

**This is student-driven** (90-120 min):
- Your role: Circulate, guide, answer questions
- Not: Lecture or provide answers

**Phases are structured** (see timing below):
- Each phase has clear deliverable
- Checkpoints keep students on track
- Time boxes prevent perfectionism

**Encourage collaboration**:
- Pairs work together
- Pairs can consult with neighboring pairs
- Share learnings across class

### Phase-by-Phase Guidance

#### Phase 1: Use Case Selection (10 min)

**Your role**:
- Ensure even distribution (if possible)
- Approve custom use cases quickly
- Redirect if use case too simple or too complex

**Watch for**:
- Students overthinking choice
- Choosing use case they can't relate to
- Custom use cases that are too vague

**Intervention**: "This one looks good, proceed!"

#### Phase 2: Requirements Analysis (20 min)

**Your role**:
- Circulate and review analyses
- Ask probing questions:
  - "How many users?"
  - "What happens in 5 years?"
  - "What's the budget?"
- Provide feedback early (don't let them build on wrong foundation)

**Watch for**:
- Missing data volume estimates
- No access patterns specified
- Ignoring constraints
- Unrealistic assumptions

**Intervention**: "What's the annual growth rate? Calculate that."

**Checkpoint 2.1**:
- Have pairs swap and review
- Circulate, correct major errors

#### Phase 3: Architecture Design (30 min)

**Your role**:
- Review designs as they develop
- Challenge decisions: "Why quilt here?"
- Suggest alternatives: "Did you consider...?"
- Ensure completeness (all components addressed)

**Watch for**:
- Skipping privacy considerations
- No publisher/aggregator strategy
- Unrealistic epoch planning
- Missing operational aspects

**Intervention**: "How do you handle access control?"

**Checkpoint 3.1**:
- Review 2-3 designs publicly
- Discuss alternatives
- Highlight good decisions

#### Phase 4: Cost Analysis (20 min)

**Your role**:
- Verify calculations (common source of errors)
- Ensure comparisons are fair
- Check optimization reasoning

**Watch for**:
- Forgetting 5x erasure coding expansion
- Wrong storage unit calculation
- No comparison to alternatives
- Missing optimizations

**Intervention**: "Recalculate with 5x expansion."

**Checkpoint 4.1**:
- Show cost comparison on whiteboard
- Discuss why costs vary across use cases

#### Phase 5: Implementation Plan (20 min)

**Your role**:
- Ensure plans are executable
- Check for monitoring/operations
- Verify error handling

**Watch for**:
- Too vague (no actual commands)
- Too detailed (unnecessary depth)
- No verification steps
- Missing monitoring plan

**Intervention**: "Show me the actual command you'd run."

#### Phase 6: Presentations (30-60 min)

**Your role**:
- Timekeeper (strict 10 min max per team)
- Facilitate Q&A
- Provide feedback
- Highlight learning moments

**Watch for**:
- Students reading code instead of explaining
- Skipping cost analysis
- Not defending decisions
- Running over time

**Intervention**: "30 seconds left, wrap up."

**After presentations**:
- Facilitate voting (most cost-effective, innovative, etc.)
- Discuss what made winning designs good
- Identify common themes

### Common Challenges

**Challenge**: Students stuck on use case selection
- **Solution**: Give them 2 minutes to decide, then assign if needed

**Challenge**: Cost calculations taking too long
- **Solution**: Provide calculator, round to nearest storage unit

**Challenge**: Implementation plans too detailed
- **Solution**: "High-level steps only, you have 20 minutes"

**Challenge**: Presentations running long
- **Solution**: Hard stop at 10 min, interrupt if needed

### Assessment Guidance

**Use the rubric** (100 points total):
- Requirement Analysis: 20 points
- Architecture Design: 30 points
- Cost Analysis: 20 points
- Implementation Plan: 20 points
- Presentation: 10 points

**Grading tips**:
- Focus on reasoning, not "right answer"
- Reward thoughtful trade-offs
- Penalize missing components (e.g., no monitoring)
- Bonus for creative solutions

**Feedback format**:
- 2-3 strengths ("Great use of quilts for...")
- 2-3 improvements ("Consider adding...")
- 1 overall comment ("Solid architecture, watch costs")

### Timing

- Phase 1: 10 min
- Phase 2: 20 min
- Phase 3: 30 min
- Phase 4: 20 min
- Phase 5: 20 min
- Phase 6: 30-60 min (depends on class size)
- Total: 130-160 min

---

## Facilitating Discussions

### Best Practices

**Ask, don't tell**:
- "What do you think?" before giving answer
- "Why did you choose that?" to probe reasoning
- "What's the trade-off?" to deepen understanding

**Encourage debate**:
- "Who disagrees? Why?"
- "Is there another approach?"
- "What's the downside of this choice?"

**Make it safe to be wrong**:
- "Good attempt, but consider..."
- "That's a common mistake, here's why..."
- "Let's work through this together"

**Build on student answers**:
- "Yes, and also..."
- "That's right. Who can add to that?"
- "Good point. How does that connect to...?"

### Discussion Prompts (from lessons)

**For each prompt**:
1. Give students 30-60 seconds to think (or discuss with partner)
2. Call on 2-3 students for answers
3. Synthesize responses
4. Add instructor insight
5. Move on (don't belabor)

**Example facilitation**:

**Prompt**: "Which pattern for 10K NFT collection?"

- **Pause**: "Think for 30 seconds..."
- **Call on students**: "Alice, what do you think?"
  - Alice: "Quilt for metadata"
  - You: "Why?"
  - Alice: "Cost savings"
  - You: "Good. Bob, what about images?"
  - Bob: "Individual blobs, they're too big for quilts"
  - You: "Exactly. And individual access makes sense for marketplaces."
- **Synthesize**: "So we use quilts for small metadata, individual blobs for images. This is a common hybrid pattern."
- **Add insight**: "In production, SuiFrens does individual blobs even for small accessories because they're composable. Design depends on use case."
- **Move on**: "Next checkpoint..."

---

## Common Questions and Answers

### Student Questions You'll Get

**Q: "Can I use Walrus for my database?"**
- **A**: "Not for frequently-changing data. Walrus is for immutable or infrequently-updated data. Use Sui for mutable state."

**Q: "How do I delete data from Walrus?"**
- **A**: "You can't delete blobs. You can use deletable storage (stored under your wallet), or let epochs expire. Design for immutability."

**Q: "What if I run out of WAL tokens?"**
- **A**: "Your data remains available until epoch expiration, but you can't extend. Always monitor wallet balance."

**Q: "Is Walrus faster than AWS S3?"**
- **A**: "No. Walrus optimizes for decentralization and cost, not performance. Use CDN if you need speed."

**Q: "Can I store private data on Walrus?"**
- **A**: "Only if you encrypt it. Blob IDs are public, so anyone with the ID can fetch. Encrypt sensitive data, manage keys on Sui."

**Q: "Why are quilts so much cheaper?"**
- **A**: "Small blobs have 64MB metadata overhead. Quilts batch files together, amortizing overhead. Massive savings for small files."

**Q: "Do I need to run my own aggregator?"**
- **A**: "Only if you need guaranteed availability or custom logic. For most use cases, shared aggregators work fine."

**Q: "What happens if an aggregator goes down?"**
- **A**: "Use multiple aggregators with fallback. Or fetch directly from storage nodes (requires more complex client)."

**Q: "How do I know my data is safe?"**
- **A**: "Erasure coding ensures 2/3 of storage nodes can fail and data remains recoverable. Byzantine fault tolerance protects against malicious nodes."

**Q: "Can I update a blob?"**
- **A**: "No. Create a new blob and update the pointer on Sui. Old blob remains (versioning)."

---

## Troubleshooting

### Technical Issues

**Issue**: Walrus CLI not working
- **Fix**: Check version, redownload if needed
- **Workaround**: Use web publisher for demos

**Issue**: Aggregator unavailable
- **Fix**: Use backup aggregator URL
- **Prevention**: Test all URLs before class

**Issue**: Wallet out of tokens
- **Fix**: Have backup wallet with tokens ready
- **Prevention**: Check balances before class

### Timing Issues

**Issue**: Lessons running long
- **Fix**: Skip "Try It Yourself" exercises, focus on checkpoints
- **Prevention**: Time each section, adjust on the fly

**Issue**: Capstone lab taking too long
- **Fix**: Reduce presentation time, skip Phase 5 (implementation)
- **Prevention**: Set hard time limits, use timer

**Issue**: Presentations eating all time
- **Fix**: Limit to 5 min each, cut Q&A
- **Prevention**: Announce time limits upfront

### Student Issues

**Issue**: Student completely stuck
- **Fix**: Pair them with stronger student, provide template
- **Prevention**: Check progress at each checkpoint

**Issue**: Student dominating discussions
- **Fix**: "Thanks Alice. Who hasn't shared yet?"
- **Prevention**: Cold call to distribute participation

**Issue**: Student checked out
- **Fix**: Direct question to re-engage
- **Prevention**: Pair/group work keeps everyone involved

---

## Materials Checklist

### Before Class

**Instructor prep**:
- [ ] Review all lesson content
- [ ] Test Walrus CLI and aggregators
- [ ] Prepare example calculations on slides/whiteboard
- [ ] Create backup wallet with tokens
- [ ] Test presentation equipment

**Student materials**:
- [ ] Ensure all have completed Modules 1-13
- [ ] Walrus CLI installed (or access to publisher)
- [ ] Sui CLI installed
- [ ] Wallets with tokens (for labs)
- [ ] Calculator or spreadsheet for cost calculations
- [ ] Presentation tools (slides optional)

**Room setup**:
- [ ] Whiteboard and markers
- [ ] Projector for presentations
- [ ] Seating for pairs/small groups
- [ ] Timer visible to class

### During Class

**Keep handy**:
- [ ] Cost calculation formula cheat sheet
- [ ] Aggregator URLs
- [ ] Example blob IDs for demos
- [ ] Rubric for assessments

---

## Extension Activities

### For Advanced Students

If students finish capstone early:

**Activity 1**: Optimize further
- "Reduce costs by 20% without sacrificing requirements"

**Activity 2**: Add feature
- "Add user analytics while maintaining privacy"

**Activity 3**: Disaster recovery
- "Design backup and recovery plan"

**Activity 4**: Scale analysis
- "How does your design handle 100x growth?"

### For Struggling Students

If students are stuck:

**Simplification 1**: Reduce scope
- Focus on core use case, skip optional features

**Simplification 2**: Provide template
- Give them partially completed design to fill in

**Simplification 3**: Pair with stronger student
- Learning from peers is effective

---

## Post-Module Follow-Up

### Collect Feedback

**From students**:
- What was most valuable?
- What was most challenging?
- What would you change?
- Do you feel prepared to design Walrus solutions?

**From yourself**:
- What timing worked/didn't work?
- What questions came up repeatedly?
- What examples resonated?
- What would you adjust?

### Provide Resources

**Share with students**:
- Example solutions from class (with permission)
- Additional reading on design patterns
- Links to Walrus community
- Office hours for follow-up questions

### Assessment and Grading

**Within 1 week**:
- Grade capstone projects using rubric
- Provide written feedback (2-3 sentences)
- Return assessments

**Track outcomes**:
- How many students successfully designed solutions?
- What concepts are still unclear?
- What needs more emphasis in future?

---

## Success Metrics

### Student Success Indicators

**Students should be able to**:
- ✅ Analyze storage requirements independently
- ✅ Choose appropriate Walrus features (blobs, quilts, epochs)
- ✅ Calculate storage costs accurately
- ✅ Design hybrid architectures (Sui + Walrus)
- ✅ Create executable implementation plans
- ✅ Defend design decisions with reasoning
- ✅ Identify trade-offs and alternatives

### Teaching Success Indicators

**You've succeeded if**:
- ✅ Discussions are lively and thoughtful
- ✅ Students debate approaches (not just accept yours)
- ✅ Capstone presentations show diverse solutions
- ✅ Students reference previous lessons naturally
- ✅ Timing stays roughly on track
- ✅ Students express confidence in their designs

---

## Key Takeaways for Instructors

**Remember**:
- This is synthesis, not new content
- Facilitate, don't lecture
- Multiple valid designs exist
- Focus on reasoning, not "right answers"
- Real-world constraints make it interesting
- Students learn from each other's designs

**Celebrate**:
- Thoughtful trade-off analysis
- Creative solutions
- Operational thinking (monitoring, extensions)
- Cost optimizations
- Clear communication

**This module proves they've learned Walrus. Your job is to guide them to that proof.**

---

## Resources for Instructors

**Walrus Documentation**:
- https://docs.walrus.site

**Example Projects**:
- SuiFrens (NFT collection)
- Walrus Sites documentation (meta!)
- Community showcase projects

**Community**:
- Walrus Discord for instructor support
- Instructor office hours (schedule TBD)

**Questions?** Contact: [Instructor support email/channel]

---

**Good luck teaching Module 14! This is the culmination of the entire program—make it memorable!** 🎓
