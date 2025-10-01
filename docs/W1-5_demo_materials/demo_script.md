# Demo Script - PlanWise Design Matrix Week 1 Proof of Concept

**Duration:** 15 minutes
**Format:** Live demonstration + Q&A
**Audience:** AEs, Consultants, Leadership
**Materials:** 5 generated PowerPoint decks, Streamlit dashboard access

---

## Pre-Demo Checklist

- [ ] Streamlit dashboard running locally or on demo server
- [ ] All 5 PowerPoint decks opened and ready to present
- [ ] Demo database loaded with 20+ clients
- [ ] Screen sharing tested and working
- [ ] Feedback survey link ready to share
- [ ] Backup plan ready (recorded demo video if tech fails)

---

## Part 1: The Problem (2 minutes)

### Opening Script

> "Thank you for joining today. I want to show you something we built this week that could fundamentally change how we prepare for client meetings.
>
> But first, let's talk about the current state. When an Account Executive prepares for a client meeting today, here's what happens:
>
> **4 to 6 hours of manual work:**
> - Manually extracting plan data from Form 5500s, SPDs, and plan documents
> - Building Excel comparisons against 'similar' plans - but 'similar' is based on memory and intuition, not systematic data
> - Creating PowerPoint slides from scratch, reformatting charts, writing narratives
> - Writing recommendations based on experience and gut feel, not statistical analysis
>
> **The result?**
> - Inconsistent quality across the team
> - Delayed analysis when AEs have back-to-back meetings
> - Recommendations that lack the rigor our clients expect
> - No systematic way to identify consulting opportunities across our 850 clients
>
> **Question for the room:** Does this match your experience? Show of hands - who has spent 4+ hours preparing a peer comparison for a client meeting?"

### Key Points to Emphasize
- Time sink (4-6 hours per analysis)
- Inconsistency (depends on who does it)
- Lack of rigor (ad-hoc peer selection, no statistical basis)
- Missed opportunities (can't scale to 850 clients)

### Expected Reactions
- Nods of agreement (validates the problem)
- Stories about recent client prep struggles
- Questions about automation potential

---

## Part 2: The Solution (5 minutes)

### Transition Script

> "This week, we built a proof of concept with 20 real clients from our portfolio. Let me show you what's now possible with the PlanWise Design Matrix platform..."

### Live Demonstration Steps

**Step 1: Open Dashboard (30 seconds)**
```
Action: Open Streamlit dashboard
Script: "This is our interactive dashboard. It currently has 29 clients loaded -
a mix of healthcare systems and higher education institutions."
```

**Step 2: Select Demo Client (30 seconds)**
```
Action: Select "Lehigh University" from dropdown
Script: "Let's start with Lehigh - a typical higher education 401(k) plan.
Notice how the plan details populate automatically from our database."
```

**Step 3: Show Plan Details (30 seconds)**
```
Action: Point to displayed plan information
Script: "The platform shows key plan provisions - industry, size, match formula,
auto-enrollment status. All extracted from source documents."
```

**Step 4: Highlight Peer Cohort Selection (45 seconds)**
```
Action: Point to peer cohort information
Script: "Here's what's different: peer selection is systematic, not ad-hoc.
The platform identifies similar plans based on industry and employee count.
For Lehigh, we're comparing against other higher education institutions
of similar size. This is rigorous and defensible."
```

**Step 5: Show Percentile Comparisons (45 seconds)**
```
Action: Scroll through comparison metrics
Script: "The platform automatically calculates percentile rankings.
Lehigh's employee count is at the Xth percentile compared to peers.
Their match rate is at the Yth percentile.
These are statistical facts, not subjective assessments."
```

**Step 6: Generate PowerPoint (60 seconds)**
```
Action: Click "Generate PowerPoint" button
Script: "Now watch this. I'm clicking 'Generate PowerPoint'...
[wait 5-10 seconds]...
And done. 30 seconds. The deck is ready.

Let me repeat that: **30 seconds to generate a client-ready deck.**
The same analysis manually takes 4 to 6 hours."
```

**Step 7: Walk Through Generated Deck (60 seconds)**
```
Action: Open generated PowerPoint, flip through slides
Script: "Let's look at what the platform created:
- Title slide with client name and date
- Plan overview with peer comparison charts showing percentile rankings
- Key findings written in plain English - automatically generated from the data
- Recommendations based on peer benchmarks - not guesswork

This deck is ready to present to the client. The charts are clean.
The language is professional. The recommendations are data-driven.
And it took 30 seconds."
```

### Emphasis Points During Demo

**Systematic Peer Selection:**
> "Notice the platform selected peers based on objective criteria - industry and size. Not 'plans I remember from last quarter' but systematic, defensible cohorts."

**Statistical Rigor:**
> "These percentile rankings are real statistics. We can defend these numbers to clients. 'You're in the 65th percentile for match rate among peer plans' is a powerful, factual statement."

**Automation Speed:**
> "30 seconds for deck generation. This is the game-changer. Imagine doing this for 50 clients before year-end review season."

**Client-Ready Quality:**
> "This isn't a draft. This is a deck you can present to clients directly. The quality is there."

---

## Part 3: The Results (3 minutes)

### Transition Script

> "We've generated 5 sample decks this week to demonstrate the platform's versatility. Let me show you two contrasting examples..."

### Example 1: Typical Plan (Lehigh)

```
Action: Open Lehigh deck, walk through slides
Script: "Lehigh is a typical plan - has match, has auto-enrollment,
features are competitive with peers. The platform confirms what we'd expect:
'Your plan is well-positioned. Maintain current design.'

This is a **routine client meeting use case** - quick validation that
the client is on track. Takes 30 seconds instead of 4 hours."
```

### Example 2: Gap Plan (Mount Sinai Health)

```
Action: Open Mount Sinai deck, walk through slides
Script: "Now contrast that with Mount Sinai Health System.
48,000 employees - a major client. They have a competitive match formula.
But look at this finding:

'Your plan has not adopted auto-enrollment, though 80% of peers have.'

**This is a consulting opportunity.** The platform just identified a $500K+
auto-enrollment project for a 48,000-employee client. Automatically.
Based on peer data.

Imagine running this analysis across all 850 clients. How many opportunities
would we uncover?"
```

### Impact Summary Script

> "Here's what changes with this platform:
>
> **Time:**
> - Current state: 6 hours per client analysis
> - With platform: 1 hour for data entry (for now) + 30 seconds for deck generation
> - With future automation: 15 minutes to review low-confidence fields + 30 seconds for deck
>
> **Quality:**
> - Current: Inconsistent, depends on who does it
> - Platform: Consistent, data-driven, defensible
>
> **Scale:**
> - Current: Can't realistically benchmark all 850 clients
> - Platform: Can run analysis for 850 clients in under 8 hours of generation time
>
> **Opportunity Identification:**
> - Current: Depends on AE remembering to ask
> - Platform: Automatically surfaces gaps and opportunities
>
> **Question for the room:** Would you use these decks in client meetings?
> Show of hands - who would present this to a client directly?"

---

## Part 4: What's Next (5 minutes)

### Roadmap Preview Script

> "This is Week 1. A proof of concept. We built this in 5 days with 29 manually-entered clients.
> Now the question is: should we continue? And if so, what's most valuable?
>
> Here are the options we're considering for Week 2 and beyond:"

### Feature Roadmap (Read Through List)

**Week 2 Options:**
1. **Expand client base** - Go from 29 to 50 clients, then 200, then 850
2. **Automate data extraction** - Start with Form 5500 fields (plan name, EIN, participant count)
3. **Add more comparison metrics** - Vesting schedules, loan provisions, investment lineups
4. **Improve PowerPoint templates** - More sophisticated charts, custom branding
5. **Build custom cohort filtering** - Let users define peer groups (e.g., "union vs. non-union")
6. **Add Navigator integration** - Export baseline and recommendation YAMLs
7. **Enhance recommendation engine** - More sophisticated logic, confidence scoring

### Prioritization Question Script

> "We need your input to prioritize. Which of these would be most valuable to you?
>
> Think about your day-to-day work:
> - Would you rather have 850 clients with basic comparisons?
> - Or 50 clients with comprehensive analysis?
> - Would automation of data entry save you more time than better charts?
> - Which features would make you confident enough to use this in client meetings?
>
> We'll be collecting structured feedback after this demo, but I want to
> open it up now for initial reactions."

### Feedback Collection Transition

> "Before we wrap up, I'm going to share a feedback survey link.
> This is critical - we need your honest input to build the right thing.
>
> The survey has 5 sections:
> 1. **Value Assessment** - Would you actually use this?
> 2. **Missing Capabilities** - What's blocking adoption?
> 3. **Usability** - Is the interface intuitive?
> 4. **Prioritization** - Rank the features we just discussed
> 5. **Commitment** - Would you test this with a real client?
>
> It takes 5-10 minutes to complete. Your feedback directly determines
> what we build in Week 2."

### Closing Script

> "Let me summarize what we've shown you today:
>
> **The Problem:** Client prep takes 4-6 hours, is inconsistent, and doesn't scale
>
> **The Solution:** Automated peer benchmarking with 30-second deck generation
>
> **The Results:** 5 demo decks across different scenarios, all client-ready
>
> **The Question:** Is this valuable enough to continue building?
>
> We need your honest feedback. If this solves a real problem for you, tell us.
> If it's missing something critical, tell us. If you wouldn't use it, tell us why.
>
> This is Week 1. We can pivot. But we need to know if we're on the right track.
>
> Questions?"

---

## Q&A Talking Points

### Expected Questions and Responses

**Q: "How accurate is the data extraction?"**
> "Right now, we're manually entering data to ensure 100% accuracy for the proof of concept.
> Week 2+ will focus on automating extraction from Form 5500 and other sources.
> Our target is 92% accuracy on Tier-1 fields, with human review of low-confidence extractions."

**Q: "Can I customize the peer cohort?"**
> "Not yet. Right now it's automatic based on industry and size.
> But custom cohort filtering is on our Week 2+ roadmap.
> Is that important to you? What filters would you want?"

**Q: "What about compliance and disclaimers?"**
> "Great question. All deliverables will require pre-approved templates and disclaimers.
> We'll work with compliance to ensure all generated content meets standards.
> This deck is a demo - production versions will have proper disclaimers."

**Q: "Can this integrate with Navigator?"**
> "Yes, that's on the roadmap. We can export baseline and recommendation data
> in YAML format for Navigator ingestion. This becomes the data foundation
> for optimization modeling."

**Q: "How do I access this?"**
> "Right now it's a proof of concept running locally. If we get approval to proceed,
> Week 2 would include deployment to a shared environment where AEs and consultants
> can access it directly. Web-based, no installation required."

**Q: "What about data security?"**
> "Plan design data is classified as 'Confidential - Client' (no PII).
> We'll use AES-256 encryption at rest, TLS 1.3 in transit, and role-based access control.
> Full security architecture is in the PRD."

**Q: "How many clients can this handle?"**
> "Database can scale to 850+ clients easily. PowerPoint generation is fast -
> under 5 seconds per deck even with 850 peers in the database.
> Performance requirements are p95 ≤ 1.5s for peer queries, p95 ≤ 8 min for deck generation."

**Q: "What if peers don't exist for a small plan?"**
> "Good edge case. Right now, the platform shows a warning if peer count is low (< 5).
> We can expand peer matching logic to relax filters when needed
> (e.g., expand to adjacent industries or broader size buckets).
> Or flag 'insufficient peers' and recommend manual analysis."

---

## Demo Tips & Best Practices

### Before the Demo
1. Test everything the morning of the demo (database connection, dashboard, deck generation)
2. Have all 5 PowerPoint decks pre-opened in tabs for quick access
3. Close unnecessary applications to avoid distractions during screen share
4. Set notifications to Do Not Disturb
5. Have backup demo video ready in case of technical issues

### During the Demo
1. **Pace yourself** - 15 minutes goes fast, but don't rush through key points
2. **Pause for reactions** - Give people time to process and ask questions
3. **Show, don't just tell** - Live demo is more impactful than describing features
4. **Highlight wins** - "30 seconds" and "4-6 hours manually" should be repeated multiple times
5. **Acknowledge gaps** - Be honest about what's not built yet
6. **Read the room** - If people look confused, slow down; if engaged, go deeper

### After the Demo
1. Share feedback survey link immediately (in chat and via email)
2. Follow up within 24 hours with summary and survey reminder
3. Schedule office hours for individual questions
4. Collect feedback and analyze themes within 48 hours

### Emphasis Phrases (Use Repeatedly)
- "30 seconds instead of 4 hours"
- "Data-driven, not guesswork"
- "Systematic, defensible peer selection"
- "Client-ready quality"
- "Scales to 850 clients"
- "Automatically identifies consulting opportunities"

---

## Audience-Specific Adjustments

### For Account Executives (Primary Users)
**Emphasize:**
- Time savings for routine client meetings
- Quality and consistency of output
- Client-ready decks with no additional formatting
- Ability to quickly respond to client questions

**Questions to Ask:**
- "Would you present this deck to your client?"
- "What would make you confident using this in meetings?"
- "Which metrics matter most to your clients?"

### For Consultants (Power Users)
**Emphasize:**
- Opportunity identification (Mount Sinai example)
- Scalability to support multiple projects
- Statistical rigor of peer comparisons
- Foundation for Navigator integration

**Questions to Ask:**
- "Does this accelerate your project kickoff?"
- "What additional analysis would you want?"
- "How does this compare to your current manual process?"

### For Leadership (Budget Approvers)
**Emphasize:**
- Time savings = capacity unlocked ($50K+/year)
- Revenue opportunity (consulting leads identified automatically)
- Scalability to 850 clients
- Competitive differentiation (data-driven advisory)

**Questions to Ask:**
- "Does this justify continued investment?"
- "What ROI do you expect to see?"
- "What's the business case for scaling to 850 clients?"

---

**Script Owner:** Product/Engineering Lead
**Last Updated:** September 29, 2025
**Next Review:** After first stakeholder demo