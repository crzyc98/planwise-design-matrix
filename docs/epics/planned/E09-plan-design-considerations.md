# EPIC-009: Plan Design Considerations Tracking

**Epic Owner:** Product Management
**Technical Lead:** Full Stack Engineering
**Priority:** P1 (High - Enhanced Client Intelligence)
**Target Release:** Phase 3
**Estimated Effort:** 3-4 weeks
**Dependencies:** E04 (Plan Data Maintenance & Editing)

---

## Epic Overview

Build a system to capture and track plan design alternatives that plan sponsors have considered, discussed, or been presented during consulting engagements. This creates a historical record of design thinking that informs future recommendations and provides valuable context for client conversations.

### Business Value

- **Primary Use Case:** Account Executives and Consultants need to understand what design options a plan sponsor has previously considered to avoid re-pitching rejected ideas and to build on existing discussions
- **Success Metric:** 40% reduction in recommendation rejection rate by filtering out previously-declined options
- **Time Savings:** Eliminate redundant discovery conversations by referencing prior considerations
- **Revenue Impact:** Enable more targeted, contextual recommendations that resonate with plan sponsor preferences

### User Stories

> "As a Consultant, I want to record design alternatives we presented to a client so that future team members know what options were discussed and why certain designs were chosen or rejected."

> "As an Account Executive, I want to see what design changes a plan sponsor has previously considered so that I don't propose ideas they've already declined."

> "As a Plan Sponsor Relationship Manager, I want to track the evolution of a client's design thinking over time so that I can identify when market conditions might make previously-rejected options more attractive."

---

## Feature Specifications

### Feature 1: Design Consideration Capture

#### Functionality

1. **Add Consideration Entry:**
   - Link to specific plan design field(s) (e.g., match formula, vesting schedule)
   - Capture the alternative design option that was considered
   - Record the consideration status:
     - `Presented` - Shown to plan sponsor, awaiting feedback
     - `Under Review` - Plan sponsor is actively evaluating
     - `Declined` - Plan sponsor rejected this option
     - `Deferred` - Plan sponsor interested but timing not right
     - `Adopted` - Option was implemented (auto-link to actual design change)
   - Capture source/context (meeting, RFP, annual review, etc.)
   - Record date of consideration
   - Optional: Link to meeting notes or presentation materials

2. **Decline Reason Taxonomy:**
   ```
   ├── Cost/Budget
   │   ├── Implementation cost too high
   │   ├── Ongoing cost increase unacceptable
   │   └── Budget constraints this cycle
   ├── Complexity
   │   ├── Administrative burden
   │   ├── Communication challenges
   │   └── Recordkeeper limitations
   ├── Stakeholder
   │   ├── Committee not aligned
   │   ├── HR leadership concerns
   │   └── Union/collective bargaining constraints
   ├── Strategic
   │   ├── Not aligned with company direction
   │   ├── Competitive positioning concerns
   │   └── Industry practice concerns
   ├── Timing
   │   ├── Too soon after last change
   │   ├── Major company initiative in progress
   │   └── Waiting for regulatory clarity
   └── Other (free text)
   ```

3. **Notes & Context:**
   - Free-text notes field for additional context
   - Structured fields for key decision-makers involved
   - Sentiment indicator (positive, neutral, negative reaction)

#### UI Design

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 💭 Design Considerations for ABC Manufacturing 401(k)                    │
├──────────────────────────────────────────────────────────────────────────┤
│ + Add Consideration                                         [Filter ▼]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ Match Formula Enhancement                               DECLINED   │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Current: 50% up to 6%                                              │  │
│ │ Considered: 100% up to 4%                                          │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ 📅 Sep 2024  │  📋 Annual Review  │  💰 Cost/Budget               │  │
│ │ "CFO felt the immediate P&L impact was too significant given       │  │
│ │ current margin pressures. Revisit in 2025 planning cycle."         │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ Auto-Enrollment Rate Increase                           ADOPTED    │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Previous: 3%                                                       │  │
│ │ Considered: 6%  →  Implemented Jan 2024                           │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ 📅 Oct 2023  │  📋 Q4 Committee Meeting  │  ✅ Approved           │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ Roth Auto-Enrollment Option                             DEFERRED   │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Current: Traditional only                                          │  │
│ │ Considered: Roth as default for new hires under 35                │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ 📅 Mar 2024  │  📋 SECURE 2.0 Discussion  │  ⏳ Timing            │  │
│ │ "HR wants to wait for updated participant education materials.     │  │
│ │ Target: Q1 2025 implementation."                                   │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Data Model

```typescript
interface DesignConsideration {
  consideration_id: string;           // UUID
  client_id: string;                  // FK to plan

  // What was considered
  field_category: string;             // e.g., "employer_match", "vesting", "eligibility"
  field_key: string;                  // Specific field reference
  current_value: string;              // What the plan has now
  considered_value: string;           // What was proposed/discussed

  // Status tracking
  status: 'presented' | 'under_review' | 'declined' | 'deferred' | 'adopted';
  status_date: Date;

  // Context
  source_type: 'annual_review' | 'committee_meeting' | 'rfp_response' |
               'ad_hoc_consultation' | 'benchmarking_presentation' | 'other';
  source_description?: string;

  // Decline/defer details (if applicable)
  decline_reason_category?: string;
  decline_reason_detail?: string;

  // Additional context
  notes?: string;
  decision_makers?: string[];         // Names/roles involved
  sentiment?: 'positive' | 'neutral' | 'negative';

  // If adopted, link to the change
  adopted_change_id?: string;         // FK to audit log entry

  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
```

---

### Feature 2: Consideration History Timeline

#### Functionality

Display a chronological timeline of all design considerations for a plan, showing the evolution of design thinking over time.

#### UI Design

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📈 Design Evolution Timeline                                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 2024 ─────────────────────────────────────────────────────────────────── │
│   │                                                                      │
│   ├─● Sep: Match formula increase DECLINED (Cost/Budget)                │
│   │     50% to 6% → 100% to 4%                                          │
│   │                                                                      │
│   ├─● Mar: Roth auto-enroll DEFERRED (Timing)                           │
│   │     Traditional → Roth for <35                                       │
│   │                                                                      │
│   ├─◆ Jan: Auto-enrollment increase ADOPTED                             │
│   │     3% → 6% [View Change Record]                                    │
│   │                                                                      │
│ 2023 ─────────────────────────────────────────────────────────────────── │
│   │                                                                      │
│   ├─● Oct: Auto-enrollment increase PRESENTED → Under Review            │
│   │     3% → 6%                                                         │
│   │                                                                      │
│   ├─● Jun: Student loan match DECLINED (Complexity)                     │
│   │     None → SECURE 2.0 qualified                                      │
│   │                                                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Feature 3: Recommendation Integration

#### Functionality

Automatically filter and annotate recommendations based on consideration history:

1. **Exclude Recently Declined:** Options declined within configurable window (default: 18 months)
2. **Surface Deferred Options:** Highlight deferred items when trigger conditions are met
3. **Annotate Recommendations:** Show consideration history context on recommendations

#### UI Annotation Example

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 💡 Recommendation: Increase Match Formula                                │
├──────────────────────────────────────────────────────────────────────────┤
│ ⚠️ CONSIDERATION HISTORY                                                │
│ This option was declined in Sep 2024 due to budget constraints.         │
│ CFO indicated potential to revisit in 2025 planning cycle.              │
│ [View Full Context]                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Current: 50% up to 6% (Below median: 25th percentile)                   │
│ Recommendation: 75% up to 6% or 100% up to 4%                           │
│ ...                                                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Feature 4: Consideration Search & Reporting

#### Functionality

1. **Cross-Client Search:** Find all plans that have considered a specific design element
2. **Trend Analysis:** Report on common decline reasons across book of business
3. **Pipeline View:** Track all "Presented" and "Under Review" items across all clients

#### Use Cases

- "Show me all clients who have considered but not yet adopted auto-enrollment increases"
- "What are the top decline reasons for match formula enhancements?"
- "Which deferred items have been waiting more than 12 months?"

---

## API Specifications

### Endpoints

```typescript
// Create consideration
POST /api/v1/plans/{client_id}/considerations
Body: CreateConsiderationRequest

// List considerations for a plan
GET /api/v1/plans/{client_id}/considerations
Query: ?status=declined&field_category=employer_match&since=2023-01-01

// Update consideration status
PATCH /api/v1/plans/{client_id}/considerations/{consideration_id}
Body: UpdateConsiderationRequest

// Search across all plans
GET /api/v1/considerations/search
Query: ?considered_value=auto-enrollment&status=deferred

// Get recommendation annotations
GET /api/v1/plans/{client_id}/recommendations
Response includes: consideration_history for each recommendation
```

---

## Database Schema

```sql
CREATE TABLE design_considerations (
    consideration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(50) NOT NULL,

    -- What was considered
    field_category VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    current_value TEXT,
    considered_value TEXT NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('presented', 'under_review', 'declined', 'deferred', 'adopted')),
    status_date DATE NOT NULL,

    -- Context
    source_type VARCHAR(50),
    source_description TEXT,
    decline_reason_category VARCHAR(100),
    decline_reason_detail TEXT,
    notes TEXT,
    decision_makers TEXT[], -- Array of names/roles
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),

    -- Link to actual change if adopted
    adopted_change_id UUID REFERENCES audit_log(change_id),

    -- Metadata
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_field_category (field_category),
    INDEX idx_status_date (status_date)
);
```

---

## Acceptance Criteria

### Must Have (P0)
- [ ] Users can add design considerations linked to specific plan fields
- [ ] Users can set and update consideration status
- [ ] Decline reason taxonomy is implemented
- [ ] Consideration history is visible on plan detail view
- [ ] Basic notes/context capture

### Should Have (P1)
- [ ] Timeline visualization of consideration history
- [ ] Recommendations annotated with consideration context
- [ ] Recently declined options filtered from recommendations
- [ ] Search considerations across all plans

### Nice to Have (P2)
- [ ] Automatic "deferred item ready" notifications
- [ ] Trend analysis reporting
- [ ] Pipeline view for all pending considerations
- [ ] Integration with meeting notes/presentations

---

## Technical Implementation Notes

### Integration Points
- **Plan Design Matrix:** Considerations linked via `field_category` and `field_key`
- **Recommendation Engine:** Query consideration history before generating recommendations
- **Audit Log:** Auto-link considerations with status "adopted" to corresponding change records
- **Client Selector:** Show consideration count badge for active items

### Performance Considerations
- Index on `(client_id, status)` for efficient filtering
- Consider materialized view for cross-client trend analysis
- Cache recent considerations client-side for quick reference

### Data Migration
- No migration needed for new feature
- Optional: Backfill from existing meeting notes or CRM data if available

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Consideration capture rate | 80% of client meetings result in consideration entries | Usage tracking |
| Recommendation relevance | 40% reduction in "already discussed" feedback | User surveys |
| Time to context | <30 seconds to understand prior design discussions | UX testing |
| Data completeness | 90% of considerations have decline reason captured | Data audit |

---

## Open Questions

1. Should considerations be shared across team members by default, or have visibility controls?
2. How long should "declined" status suppress recommendations? (Proposed: 18 months, configurable)
3. Should we integrate with existing CRM/meeting notes systems for auto-capture?
4. Do we need approval workflows for changing consideration status from "declined" back to "under review"?
