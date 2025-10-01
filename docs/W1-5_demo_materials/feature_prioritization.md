# Feature Prioritization Matrix - PlanWise Design Matrix

**Based On:** Week 1 demo feedback
**Last Updated:** [Date]
**Review Frequency:** After each major demo cycle or sprint

---

## Prioritization Framework: Value vs. Effort

This document uses a 2x2 matrix to categorize features based on:
- **Value to Users:** How much impact will this have on adoption and satisfaction?
- **Effort to Build:** How much time and complexity is required to implement?

---

## 2x2 Prioritization Matrix

```
                    HIGH VALUE
                         |
                         |
    Q2: PLAN CAREFULLY   |   Q1: DO FIRST
    (High Value,         |   (High Value,
     High Effort)        |    Low Effort)
                         |
    ---------------------|---------------------
                         |
    Q3: DEFER            |   Q4: QUICK WINS
    (Low Value,          |   (Low Value,
     High Effort)        |    Low Effort)
                         |
                    LOW VALUE
```

---

## Quadrant 1: DO FIRST (High Value, Low Effort)

**Priority:** Implement immediately in Week 2-3

These features deliver maximum ROI with minimal investment. Focus here first.

### Feature List

| Feature | Value Score | Effort Score | User Requests | Notes |
|---------|-------------|--------------|---------------|-------|
| [Example: Add match cap comparison] | 8/10 | 2/10 | [N] users | Simple field addition |
| [Feature 2] | [Score] | [Score] | [N] users | [Notes] |
| [Feature 3] | [Score] | [Score] | [N] users | [Notes] |

**Example - Do First Features:**
- **Improve chart labels** (if feedback shows confusion)
  - Value: 7/10 - Better client-ready decks
  - Effort: 2/10 - Simple formatting changes
  - Requests: [N] users mentioned unclear labels

- **Add executive summary slide**
  - Value: 8/10 - Makes decks more professional
  - Effort: 3/10 - Template addition
  - Requests: [N] users requested this

- **Export to PDF option**
  - Value: 6/10 - Convenience for distribution
  - Effort: 2/10 - Simple library integration
  - Requests: [N] users mentioned wanting PDF

**Implementation Timeline:** Week 2 (Days 8-10)

---

## Quadrant 2: PLAN CAREFULLY (High Value, High Effort)

**Priority:** Plan and resource appropriately for Week 3-6

These features are critical but require significant investment. Break into phases, prototype first.

### Feature List

| Feature | Value Score | Effort Score | User Requests | Notes |
|---------|-------------|--------------|---------------|-------|
| [Example: Automate Form 5500 extraction] | 10/10 | 8/10 | [N] users | Requires NLP/OCR |
| [Feature 2] | [Score] | [Score] | [N] users | [Notes] |
| [Feature 3] | [Score] | [Score] | [N] users | [Notes] |

**Example - Plan Carefully Features:**
- **Automate data extraction from Form 5500**
  - Value: 10/10 - Eliminates most manual entry
  - Effort: 8/10 - OCR, NLP, validation logic
  - Requests: [N] users (top priority for scaling)
  - **Phased Approach:**
    - Phase 1: Extract basic fields (plan name, EIN, participant count)
    - Phase 2: Extract financial data
    - Phase 3: Extract plan provisions

- **Expand to 200+ clients**
  - Value: 9/10 - Necessary for real peer comparisons
  - Effort: 7/10 - Data acquisition, entry, quality assurance
  - Requests: [N] users mentioned need for larger cohorts
  - **Phased Approach:**
    - Phase 1: Expand to 50 clients (manual entry)
    - Phase 2: Expand to 100 clients (semi-automated)
    - Phase 3: Scale to 200+ (fully automated extraction)

- **Navigator integration**
  - Value: 9/10 - Critical for consultant workflow
  - Effort: 7/10 - API development, YAML export, testing
  - Requests: [N] consultants requested this
  - **Phased Approach:**
    - Phase 1: Define data schema and mapping
    - Phase 2: Build YAML export functionality
    - Phase 3: Build Navigator import integration

**Implementation Timeline:** Week 3-6 (staggered based on dependencies)

---

## Quadrant 3: DEFER (Low Value, High Effort)

**Priority:** Revisit only if value proposition changes

These features are expensive to build and deliver limited value based on current feedback. Avoid unless user needs change significantly.

### Feature List

| Feature | Value Score | Effort Score | User Requests | Notes |
|---------|-------------|--------------|---------------|-------|
| [Example: Mobile app] | 3/10 | 9/10 | [N] users | Low demand for mobile |
| [Feature 2] | [Score] | [Score] | [N] users | [Notes] |
| [Feature 3] | [Score] | [Score] | [N] users | [Notes] |

**Example - Defer Features:**
- **Native mobile app**
  - Value: 3/10 - Only [N]% said "critical"
  - Effort: 9/10 - Separate iOS/Android development
  - Requests: [N] users (low priority)
  - **Alternative:** Make web dashboard mobile-responsive (Q4 quick win)

- **Advanced statistical tests** (e.g., t-tests, ANOVA)
  - Value: 4/10 - Users want simple percentiles, not academic stats
  - Effort: 6/10 - Statistical library integration, interpretation logic
  - Requests: [N] users (mostly academics, not primary users)

- **Custom report branding per client**
  - Value: 3/10 - Not mentioned in feedback
  - Effort: 7/10 - Complex templating, user interface for customization
  - Requests: 0 users

**Implementation Timeline:** Not scheduled (revisit in 3-6 months)

---

## Quadrant 4: QUICK WINS (Low Value, Low Effort)

**Priority:** Implement when time permits (fill sprint capacity)

These features are easy to build but don't move the needle significantly. Good for morale and polish, but don't prioritize over Q1/Q2.

### Feature List

| Feature | Value Score | Effort Score | User Requests | Notes |
|---------|-------------|--------------|---------------|-------|
| [Example: Color scheme improvements] | 4/10 | 1/10 | [N] users | Aesthetic polish |
| [Feature 2] | [Score] | [Score] | [N] users | [Notes] |
| [Feature 3] | [Score] | [Score] | [N] users | [Notes] |

**Example - Quick Wins:**
- **Improve color scheme/aesthetics**
  - Value: 4/10 - Nice to have, but not blocking adoption
  - Effort: 2/10 - CSS/styling changes
  - Requests: [N] users mentioned "looks dated"

- **Add print-friendly dashboard view**
  - Value: 3/10 - Low request volume
  - Effort: 2/10 - Simple CSS media query
  - Requests: [N] users

- **Add tooltips to dashboard metrics**
  - Value: 5/10 - Helps with onboarding
  - Effort: 2/10 - Simple UI enhancement
  - Requests: [N] users asked "what does this mean?"

**Implementation Timeline:** Week 2-3 (as capacity allows)

---

## Scoring Methodology

### Value Score (1-10)
- **10:** Critical for adoption, mentioned by >75% of users
- **8-9:** High value, mentioned by 50-75% of users
- **6-7:** Moderate value, mentioned by 25-50% of users
- **4-5:** Nice to have, mentioned by 10-25% of users
- **1-3:** Low value, mentioned by <10% of users

### Effort Score (1-10)
- **10:** >6 weeks of development, major architectural changes
- **8-9:** 3-6 weeks, significant new functionality
- **6-7:** 1-3 weeks, moderate complexity
- **4-5:** 3-7 days, straightforward implementation
- **1-3:** 1-2 days, minor changes or configuration

### Weighting by User Role
When calculating value scores, weight by role:
- **Account Executives (Primary Users):** 2x weight
- **Consultants (Power Users):** 1.5x weight
- **Leadership (Approvers):** 1x weight

---

## Feedback-Based Prioritization

**Based on survey question: "Rank these priorities from 1 (highest) to 6 (lowest)"**

### Aggregate Rankings from Survey

| Feature | Average Rank | Quadrant Assignment | Week 2 Priority |
|---------|--------------|---------------------|-----------------|
| Expand client base (29→50→200→850) | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |
| Automate data extraction (Form 5500) | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |
| Add more comparison metrics | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |
| Improve PowerPoint templates | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |
| Build custom cohort filtering | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |
| Add recommendation sophistication | [X.XX] | [Q1/Q2/Q3/Q4] | [Yes/No/Maybe] |

**Note:** Fill in after survey responses collected

---

## Week 2 Roadmap Recommendation

Based on quadrant analysis, Week 2 should focus on:

### Must-Have (Quadrant 1 - Do First)
1. [Feature 1] - [Rationale]
2. [Feature 2] - [Rationale]
3. [Feature 3] - [Rationale]

### Should-Have (Quadrant 2 - Plan Carefully - Phase 1 only)
1. [Feature 1 - Phase 1] - [Rationale]
2. [Feature 2 - Phase 1] - [Rationale]

### Nice-to-Have (Quadrant 4 - Quick Wins if time permits)
1. [Feature 1] - [Rationale]
2. [Feature 2] - [Rationale]

### Explicitly NOT Doing (Quadrant 3 - Defer)
1. [Feature 1] - [Rationale]
2. [Feature 2] - [Rationale]

---

## Re-Prioritization Triggers

**When should we revisit this prioritization?**

1. **Major feedback shift** - If >50% of users request a deferred feature
2. **Blocker identified** - If a Q1 feature turns out to be Q2 effort
3. **New use case** - If new stakeholder group emerges with different needs
4. **Technical constraint** - If planned feature is technically infeasible
5. **Resource change** - If team size or timeline changes

**Review Schedule:**
- After Week 2 sprint
- After first real client tests
- Monthly thereafter

---

## Decision Log

Track major prioritization decisions and rationale.

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| [Date] | Moved [Feature] from Q2 to Q1 | [Reason - e.g., user feedback, blocker removed] | [Result] |
| [Date] | Deferred [Feature] from Q1 to Q3 | [Reason - e.g., higher effort than expected] | [Result] |
| [Date] | Added [Feature] to Q1 based on feedback | [Reason - e.g., 80% of users requested] | [Result] |

---

## Stakeholder Sign-Off

**Approved By:**
- [ ] Product Lead: __________________ Date: ______
- [ ] Engineering Lead: __________________ Date: ______
- [ ] Primary User Representative (AE): __________________ Date: ______
- [ ] Leadership Sponsor: __________________ Date: ______

**Comments/Adjustments:**


---

## Appendix: Feature Detail Sheets

### Feature: [Feature Name]

**Quadrant:** [Q1/Q2/Q3/Q4]
**Value Score:** [X/10]
**Effort Score:** [X/10]
**User Requests:** [N] users

**Description:**
[Detailed description of feature]

**User Stories:**
- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Dependencies:**
- [Dependency 1]
- [Dependency 2]

**Risks:**
- [Risk 1]
- [Risk 2]

**Estimated Timeline:**
- Phase 1: [Duration]
- Phase 2: [Duration]
- Total: [Duration]

---

**Document Owner:** Product Lead
**Last Updated:** [Date]
**Next Review:** [Date]