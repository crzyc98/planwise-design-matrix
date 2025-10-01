# EPIC-003: Peer Analysis & Consulting Views

**Epic Owner:** Product Management
**Technical Lead:** Frontend Engineering
**Priority:** P1 (High - Differentiator)
**Target Release:** Phase 2 (Month 2-3)
**Estimated Effort:** 3-4 weeks
**Dependencies:** E02 (Plan Analysis Dashboard)

---

## Epic Overview

Build the advanced Peer Analysis & Consulting Views - a suite of professional consulting deliverables that transform raw peer benchmarking data into visually compelling, client-ready presentations. This epic implements the three-tab interface inspired by the Berkshire Health Systems PowerPoint slides, bringing professional consulting quality to the digital dashboard.

### Business Value

- **Primary Use Case:** Consultants and Account Executives need professional, visual analytics for client presentations and strategic planning discussions
- **Success Metric:** 80%+ of client-facing presentations use these views (vs. manually creating PowerPoint slides)
- **Time Savings:** Reduce consulting deck prep from 4 hours → 30 minutes (87.5% reduction)
- **Revenue Impact:** Enable premium consulting conversations with visual impact comparable to BCG/McKinsey deliverables

### User Story

> "As a Consultant, I want visually compelling peer analysis views that I can present directly to clients, so that I can deliver professional insights without manually recreating charts in PowerPoint."

---

## Design Inspiration: Berkshire Health Systems Slides

This epic is based on three real PowerPoint slides created for Berkshire Health Systems. These slides represent the gold standard for retirement plan consulting deliverables.

**UI Mockup References:** See `docs/UI/` directory for interactive mockups generated with Claude Artifacts:
- `Screenshot 2025-09-30 at 9.32.39 AM.png` - **Tab 1: Peer Benchmarking & Assessment** (traffic light table)
- `Screenshot 2025-09-30 at 9.23.12 AM.png` - **Tab 2: Navigator Scorecard** (impact matrix)
- `Screenshot 2025-09-30 at 9.34.04 AM.png` - **Tab 3: Distribution Charts** (histograms)

These mockups demonstrate production-quality implementations of the Berkshire slide designs, adapted for interactive web use.

### Slide 1: Peer Benchmarking & Assessment
- 5-row feature comparison table
- Traffic light indicators (▲ green = above peers, ● orange = at median, ▼ red = below peers)
- Structured assessment text for each feature
- Clear visual hierarchy with alternating row colors

### Slide 2: PlanWise Navigator Scorecard
- Multi-dimensional impact matrix
- 5 dimensions: Recruitment | Retention | Cost/ROI | Retirement Readiness | Efficiency
- Impact indicators (▲▲ = strong positive, ▲ = positive, ▼ = negative, - = neutral)
- Recommendations section with prioritized actions

### Slide 3: Distribution Charts
- Histogram showing employer contribution distribution
- Client position marker (diamond) with percentile
- Peer average and national average reference lines
- Clear cohort comparisons (regional vs. national)

**See:** `docs/UI_PROTOTYPE_BERKSHIRE_SLIDES.md` for detailed design specifications and prototyping prompts

---

## UI Specification

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│ Header: PW Logo | Client: Berkshire Health Systems | [Export PDF] │
├────────────────────────────────────────────────────────────────────┤
│ [📊 Overview] [🎯 Scorecard] [📈 Distributions]  Cohort: Healthcare│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                    [Active Tab Content]                            │
│                                                                    │
│  Tab 1: Peer Benchmarking Assessment Table                         │
│  Tab 2: Navigator Scorecard Matrix                                 │
│  Tab 3: Distribution Charts                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Navigation:**
- Tab switching with smooth transitions
- URL updates for bookmarking (e.g., `/clients/123/analysis?tab=scorecard`)
- Keyboard shortcuts: `1`, `2`, `3` for tab switching
- Print-friendly: each tab optimized for landscape PDF export

---

## Tab 1: Peer Benchmarking Assessment

### Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│  Berkshire Health Systems                                              │
│  Peer Benchmarking & Assessment to Peers                               │
├───────────────────┬──────────────────────────┬─────────────────────────┤
│ Lever             │ Current Design &         │ Peer Average            │
│                   │ Assessment               │                         │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ ELIGIBILITY       │ 1 year of service        │ Peers: Majority have    │
│                   │ ▲ GREEN                  │ 1,000 hours or 1-year   │
│                   │                          │ Δ vs Peers: At peer     │
│                   │                          │ average and recommended │
│                   │                          │ design for Healthcare   │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ AUTO-ENROLLMENT   │ Yes, default 4%          │ Peers: Majority offer,  │
│                   │ ▲ GREEN                  │ 3% median default       │
│                   │                          │ Δ vs Peers: Default 4%  │
│                   │                          │ tops all peers          │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ AUTO-ESCALATION   │ 1%/yr up to 10%          │ Peers: Minority using;  │
│                   │ ▲ GREEN                  │ typical +1%/yr to 10%   │
│                   │                          │ Δ vs Peers: Best        │
│                   │                          │ practice design         │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ EMPLOYER          │ 50% up to 4% match,      │ Peers: 5% median        │
│ CONTRIBUTION      │ 2.5% NEC                 │ maximum (Discretionary  │
│                   │ ● ORANGE                 │ to 7.5% range)          │
│                   │                          │ Δ vs Peers: Competitive │
│                   │                          │ with peer set           │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ VESTING           │ Immediate                │ Peers: Most common is   │
│                   │ ▼ RED                    │ 3-year cliff vesting    │
│                   │                          │ Δ vs Peers: More        │
│                   │                          │ generous than peers,    │
│                   │                          │ helps recruiting but    │
│                   │                          │ does not contribute to  │
│                   │                          │ retention               │
└───────────────────┴──────────────────────────┴─────────────────────────┘
Legend: ▲ Above peers/best practice  ● At peer median  ▼ Below peers
```

### Functionality

1. **Traffic Light Indicators:**
   - **▲ Green:** Feature is above peer median OR aligns with best practices
   - **● Orange:** Feature is at peer median (competitive but not leading)
   - **▼ Red:** Feature is below peer median (opportunity for improvement)

2. **Assessment Text Structure:**
   - **"Peers:"** Describes peer cohort behavior (e.g., "Majority offer, 3% median")
   - **"Δ vs Peers:"** Explains client's position relative to peers (e.g., "Competitive with peer set")

3. **Interactive Features:**
   - **Hover on row:** Highlight background, show tooltip with detailed percentile data
   - **Click traffic light:** Show modal with distribution chart for that feature
   - **Click feature name:** Expand to show historical changes and recommendations
   - **Export button:** Generate PowerPoint slide with exact formatting

4. **Data Sources:**
   - Traffic light status: Calculated from percentile ranking (≥60th = ▲, 40-60th = ●, <40th = ▼)
   - Peer average text: Generated from cohort statistics (median, range, adoption rate)
   - Assessment text: Template-based with dynamic data injection

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/peer-assessment
interface PeerAssessmentAPI {
  getPeerAssessment(
    clientId: string,
    cohortFilters?: CohortFilters
  ): Promise<PeerAssessmentTable>;
}

interface PeerAssessmentTable {
  client_name: string;
  cohort_description: string; // "Healthcare (n=260)"
  features: AssessmentFeature[];
}

interface AssessmentFeature {
  lever: string; // "ELIGIBILITY", "AUTO-ENROLLMENT", etc.
  current_design: string; // "1 year of service"
  status: "above" | "median" | "below";
  percentile: number; // 0-100
  peer_summary: string; // "Majority have 1,000 hours or 1-year"
  assessment: string; // "At peer average and recommended design"
}
```

---

## Tab 2: Navigator Scorecard

### Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│  Berkshire Health Systems                                              │
│  PlanWise Navigator Scorecard                                          │
├────────────────────────────────────────────────────────────────────────┤
│  Summary: Competitive blended contribution design with strong auto     │
│  features; increase auto-escalation cap to 15% and re-enroll          │
│  participants to drive retirement readiness.                           │
├──────────────┬─────────────┬─────┬─────┬─────┬─────┬─────┬───────────┤
│ Lever        │ Current     │ 🎯  │ 👥  │ 💰  │ 🏖️  │ ⚡  │           │
│              │ Design      │ Rec │ Ret │ ROI │ Ret │ Eff │           │
├──────────────┼─────────────┼─────┼─────┼─────┼─────┼─────┤           │
│ ELIGIBILITY  │ 1 year of   │  -  │  ▲  │  -  │  -  │  ▲  │           │
│              │ service     │     │     │     │     │     │           │
├──────────────┼─────────────┼─────┼─────┼─────┼─────┼─────┤           │
│ AUTO-        │ Yes,        │  ▲  │  ▲  │  -  │ ▲▲  │  ▲  │           │
│ ENROLLMENT   │ default 4%  │     │     │     │     │     │           │
├──────────────┼─────────────┼─────┼─────┼─────┼─────┼─────┤           │
│ AUTO-        │ 1%/yr up to │  ▲  │  ▲  │  -  │ ▲▲  │  ▲  │           │
│ ESCALATION   │ 10%         │     │     │     │     │     │           │
├──────────────┼─────────────┼─────┼─────┼─────┼─────┼─────┤           │
│ EMPLOYER $   │ 50% up to   │  ▲  │  ▲  │  -  │  ▲  │  ▲  │           │
│              │ 4% match,   │     │     │     │     │     │           │
│              │ 2.5% NEC    │     │     │     │     │     │           │
├──────────────┼─────────────┼─────┼─────┼─────┼─────┼─────┤           │
│ VESTING      │ Immediate   │  ▲  │  ▼  │  ▼  │  -  │  ▲  │           │
├──────────────┴─────────────┴─────┴─────┴─────┴─────┴─────┤           │
│  🎯 PlanWise Navigator Considerations (Impact / Cost / Complexity)    │
│  • Now: Consider 3-year cliff vesting to promote retention and        │
│    limit plan leakage. (↑↑, $ Savings, Low)                          │
│  • Next: Review competitive peer set to consider contribution design  │
│    for potential improvements. (↑↑, $$-$$$, Low)                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Functionality

1. **Impact Dimensions:**
   - **🎯 Recruitment:** Does feature attract new hires?
   - **👥 Retention:** Does feature encourage employee retention?
   - **💰 Cost/ROI:** Financial efficiency (savings or cost increases)
   - **🏖️ Retirement Readiness:** Does feature improve participant outcomes?
   - **⚡ Efficiency:** Administrative burden (positive = less work)

2. **Impact Indicators:**
   - **▲▲:** Strong positive impact (2 green triangles)
   - **▲:** Positive impact (1 green triangle)
   - **▼:** Negative impact (1 red triangle)
   - **-:** No material impact (neutral dash)

3. **Recommendations Section:**
   - **"Now" recommendations:** High-priority, high-impact, low-complexity actions
   - **"Next" recommendations:** Medium-priority or higher-complexity actions
   - **Impact notation:** `(↑↑, $ Savings, Low)` = (Impact level, Financial impact, Complexity)

4. **Interactive Features:**
   - **Hover on triangle:** Show tooltip explaining rationale (e.g., "▲▲ Retirement: Auto-escalation increases average deferral rate by 2-3 percentage points")
   - **Click "Now" recommendation:** Highlight relevant row(s) in table
   - **Click "Next" recommendation:** Highlight relevant row(s)
   - **Export:** Generate professional consulting slide

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/navigator-scorecard
interface NavigatorScorecardAPI {
  getScorecard(clientId: string): Promise<NavigatorScorecard>;
}

interface NavigatorScorecard {
  client_name: string;
  summary: string; // Executive summary paragraph
  features: ScorecardFeature[];
  recommendations: Recommendation[];
}

interface ScorecardFeature {
  lever: string;
  current_design: string;
  impacts: {
    recruitment: "strong" | "positive" | "negative" | "neutral";
    retention: "strong" | "positive" | "negative" | "neutral";
    cost_roi: "strong" | "positive" | "negative" | "neutral";
    retirement: "strong" | "positive" | "negative" | "neutral";
    efficiency: "strong" | "positive" | "negative" | "neutral";
  };
  impact_rationale: {
    recruitment?: string;
    retention?: string;
    cost_roi?: string;
    retirement?: string;
    efficiency?: string;
  };
}

interface Recommendation {
  priority: "now" | "next" | "later";
  title: string;
  description: string;
  impact_level: "↑↑" | "↑" | "→";
  financial_impact: "$ Savings" | "$$ Cost" | "$$$ Cost" | "Neutral";
  complexity: "Low" | "Medium" | "High";
  related_features: string[]; // Feature names to highlight
}
```

---

## Tab 3: Distribution Charts

### Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│  Berkshire Health Systems                                              │
│  Benchmark to Fidelity Healthcare National peer set (260 clients)      │
├────────────────────────────────────────────────────────────────────────┤
│  Distribution of Healthcare plans by employer contribution (Match+Core)│
│                                                                        │
│  Number of Clients (Y-axis)                                            │
│  50 ┤                                                                  │
│     │              ██████                                              │
│  40 ┤            ████████                                              │
│     │          ████████████                                            │
│  30 ┤      ████████████████████                                        │
│     │    ████████████████████████████                                  │
│  20 ┤  ████████████████████████████████████                            │
│     │████████████████████████████████████████████                      │
│   0 └┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──                    │
│       1% 2% 3% 4% 5% 6% 7% 8% 9% >=10%                                │
│              ↑                                                         │
│           ◆ Berkshire Health System 4.5% (50th percentile)            │
│           ┊ Peer average: 4.8% (8 clients)                             │
│           ┊ Healthcare national average: 5.8% (260 clients)            │
│                                                                        │
│  [Filter: Regional (n=8) | National (n=260)]                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Charts Included

1. **Employer Contribution Distribution (Primary)**
   - Histogram: X-axis = contribution levels (1% to ≥10%), Y-axis = number of clients
   - Always shows Match + Core (NEC) - no toggle needed
   - Client marker: Green diamond (◆) showing their position
   - Displays real data from cohort with actual bin counts
   - Bar colors: Uniform gray bars with client marker overlay

2. **Auto-Enrollment Default Rate Distribution**
   - Histogram: X-axis = default rate (0%, 2%, 3%, 4%, 5%, 6%, ≥7%)
   - Y-axis: number of clients in each bin
   - Client marker showing their default rate
   - Real data calculated from cohort's auto_enrollment_rate field
   - Dynamic peer average displayed

3. **Vesting Schedule Distribution**
   - Histogram: X-axis = vesting types (Immediate, 3-year cliff, 5-year cliff, Graded)
   - Y-axis: number of clients with each vesting schedule
   - Client's vesting type marked with green diamond
   - Real data parsed from cohort's vesting_schedule field
   - Handles text-based vesting schedules with intelligent parsing

4. **Auto-Escalation Cap Distribution**
   - Histogram: X-axis = escalation cap levels (0%, 6%, 10%, 15%, ≥20%)
   - Y-axis: number of clients with each cap
   - Client marker with percentile
   - Real data from cohort's auto_escalation_cap field
   - Shows distribution of auto-escalation adoption and cap levels

### Functionality

1. **Interactive Chart Features:**
   - **Hover on bars:** Show exact count of employers and percentage
   - **Hover on diamond:** Show "Your plan: 4.5% effective rate (50th percentile)"
   - **Hover on dashed lines:** Show cohort details (n=8 regional, n=260 national)
   - **Click bar:** Filter cohort to that range, update other charts
   - **Zoom/pan:** Allow exploration of distribution tails

2. **Toggle Controls:**
   - **Regional vs. National:** Filter cohort by geography (same state vs same industry)
   - Contribution charts always show Match + Core (NEC) - simplified UX
   - Real-time cohort size updates based on selection

3. **Cohort Display:**
   - Cohort description: "Healthcare Regional (n=8)" or "Healthcare National (n=260)"
   - Update all 4 charts simultaneously when cohort changes
   - Show anonymity warning if n < 20
   - Actual client counts displayed (not percentages)

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/distributions?metric={metric}&cohort={cohort}
interface DistributionChartsAPI {
  getDistributions(
    clientId: string,
    metric: "contribution" | "auto_enroll" | "vesting" | "auto_escalation",
    cohort: "regional" | "national",
    type?: "match_plus_core" // Always used for contribution
  ): Promise<DistributionData>;
}

interface DistributionData {
  title: string; // "Employer Contribution Distribution"
  unit: string; // "%", "years", etc.
  bins: DistributionBin[];
  clientValue: number | null;
  peerAverage: number; // Calculated from real cohort data
  nationalAverage?: number;
  cohortSize: number; // Actual count of clients in cohort
}

interface DistributionBin {
  bin: string; // "3%", "4%", "5%", etc.
  binStart: number;
  binEnd: number;
  count: number; // Actual count of clients in this bin (real data)
}
```

---

## Design System

### Traffic Light Colors

```css
/* Traffic Light Indicators */
--traffic-light-green: #10B981;   /* ▲ above peers / best practice */
--traffic-light-orange: #F59E0B;  /* ● at peer median */
--traffic-light-red: #EF4444;     /* ▼ below peers */

/* Impact Indicators */
--impact-positive: #10B981;       /* ▲ positive impact */
--impact-negative: #EF4444;       /* ▼ negative impact */
--impact-neutral: #6B7280;        /* - no material impact */
```

### Chart Colors (Histogram)

```css
/* Distribution Chart Bars */
--hist-gray: #D1D5DB;        /* Bars ≤3% (low contribution) */
--hist-light-green: #86EFAC; /* Bars 3-4% (below median) */
--hist-green: #22C55E;       /* Bars 5-8% (median range) */
--hist-black: #1F2937;       /* Bars ≥9% (high contribution) */

/* Client Marker */
--client-marker: #10B981;    /* Green diamond ◆ */

/* Reference Lines */
--reference-line: #1F2937;   /* Dashed black lines */
```

### Typography

```css
/* Headers */
--font-header: 'Inter', sans-serif;
--weight-header: 600;
--size-h1: 28px;
--size-h2: 20px;
--size-h3: 16px;

/* Body Text */
--font-body: 'Inter', sans-serif;
--weight-body: 400;
--size-body: 14px;
--line-height: 1.6;

/* Data Labels */
--font-data: 'Roboto Mono', monospace;
--size-data: 12px;
```

### Spacing

```css
/* Layout */
--section-padding: 32px;
--card-padding: 24px;
--row-height: 60px;
--gap-lg: 24px;
--gap-md: 16px;
--gap-sm: 8px;
```

---

## Technical Implementation

### Frontend Stack (Same as E02)

```typescript
// Charts: Recharts for React-native charting
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

// Custom chart components
import { HistogramChart } from '@/components/charts/HistogramChart';
import { BulletChart } from '@/components/charts/BulletChart';
import { TrafficLightIndicator } from '@/components/ui/TrafficLightIndicator';
import { ImpactMatrix } from '@/components/consulting/ImpactMatrix';
import { PeerAssessmentTable } from '@/components/consulting/PeerAssessmentTable';
```

### Component Structure

```
src/
├── components/
│   ├── consulting/
│   │   ├── PeerAssessmentTable.tsx       # Tab 1
│   │   ├── NavigatorScorecard.tsx        # Tab 2
│   │   ├── DistributionCharts.tsx        # Tab 3
│   │   ├── TrafficLightIndicator.tsx     # ▲●▼ component
│   │   ├── ImpactCell.tsx                # ▲▲ ▲ ▼ - cells
│   │   └── RecommendationsPanel.tsx      # Now/Next recommendations
│   ├── charts/
│   │   ├── HistogramChart.tsx            # Distribution histogram
│   │   ├── BulletChart.tsx               # Peer comparison
│   │   └── PieChart.tsx                  # Vesting distribution
│   └── ui/
│       └── tabs.tsx                       # Tab navigation (shadcn/ui)
├── pages/
│   └── PeerAnalysisConsulting.tsx         # Main page with tabs
└── hooks/
    ├── usePeerAssessment.ts               # Fetch assessment data
    ├── useNavigatorScorecard.ts           # Fetch scorecard data
    └── useDistributions.ts                # Fetch distribution data
```

### API Endpoints Required

```
GET    /api/v1/clients/{client_id}/peer-assessment      # Tab 1 data
GET    /api/v1/clients/{client_id}/navigator-scorecard  # Tab 2 data
GET    /api/v1/clients/{client_id}/distributions        # Tab 3 data
POST   /api/v1/exports/consulting-view                  # Export as PowerPoint
```

### State Management

```typescript
// Tab state (URL-driven)
const [activeTab, setActiveTab] = useQueryParam('tab', 'overview');

// Cohort filter state (shared across tabs)
const [cohortFilters, setCohortFilters] = useStore((state) => ({
  industry: state.industry,
  geography: state.geography,
  sizeMin: state.sizeMin,
  sizeMax: state.sizeMax,
}));

// Data fetching with TanStack Query
const { data: assessment } = useQuery({
  queryKey: ['peer-assessment', clientId, cohortFilters],
  queryFn: () => api.getPeerAssessment(clientId, cohortFilters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## User Stories & Acceptance Criteria

### Story 1: View Peer Benchmarking Assessment

**As a** Consultant
**I want to** view a traffic light assessment table comparing my client's plan to peers
**So that** I can quickly identify strengths and gaps in a visually compelling format

**Acceptance Criteria:**
- [ ] Tab 1 displays 5 core plan features with traffic light indicators
- [ ] Each feature shows current design, status (▲●▼), and assessment text
- [ ] Traffic lights are color-coded (green/orange/red) for quick scanning
- [ ] Hovering on traffic light shows detailed percentile data
- [ ] Clicking traffic light opens modal with distribution chart
- [ ] Assessment text dynamically generated from peer statistics
- [ ] Export button generates PowerPoint slide with exact formatting

**Definition of Done:**
- All acceptance criteria met
- Unit tests for TrafficLightIndicator component (80%+ coverage)
- E2E test for tab navigation and export
- Performance: Table renders in <200ms
- Accessibility: WCAG 2.1 AA compliance
- Design review approved (matches Berkshire slide design)

---

### Story 2: Analyze Multi-Dimensional Impact

**As a** Consultant
**I want to** view a Navigator Scorecard showing how each plan feature impacts 5 key dimensions
**So that** I can have strategic conversations about trade-offs and priorities

**Acceptance Criteria:**
- [ ] Tab 2 displays impact matrix with 5 features × 5 dimensions
- [ ] Each cell shows impact indicator (▲▲, ▲, ▼, -)
- [ ] Hovering on indicator shows rationale tooltip
- [ ] Recommendations section shows "Now" and "Next" actions
- [ ] Clicking recommendation highlights relevant table rows
- [ ] Summary text dynamically generated from analysis
- [ ] Export generates professional consulting slide

---

### Story 3: Explore Distribution Charts

**As an** Account Executive
**I want to** view distribution charts showing how my client compares to the full peer cohort
**So that** I can visualize their competitive position in context

**Acceptance Criteria:**
- [x] Tab 3 displays 4 distribution charts (contribution, auto-enroll, vesting, auto-escalation)
- [x] Each chart shows client marker (◆) positioned in correct bin
- [x] Peer average calculated from real cohort data and displayed
- [x] Hovering on bars shows exact client counts (not percentages)
- [x] Y-axis shows "Number of Clients" instead of percentage
- [x] Regional/National toggle updates all charts with real cohort filtering
- [x] Contribution chart always shows Match + Core (no toggle needed)
- [x] All bin counts calculated from actual database values (no mock data)
- [x] Charts display actual cohort size (n=8 regional, n=19 national)
- [ ] Charts maintain k-anonymity (n ≥ 20 warning) - TODO

---

### Story 4: Export Consulting Views to PowerPoint

**As a** Consultant
**I want to** export any of the three views to PowerPoint with professional formatting
**So that** I can include them in client presentations without manual recreation

**Acceptance Criteria:**
- [ ] Export button available on each tab
- [ ] Export modal allows selecting which tabs to include
- [ ] Generated PowerPoint matches slide design exactly
- [ ] All data, colors, and formatting preserved
- [ ] Export completes in <10 seconds (p95)
- [ ] File includes compliance disclaimers in footer
- [ ] Download link provided with signed S3 URL

---

## Performance Requirements

- **Tab Switch:** <100ms transition time
- **Chart Render:** All 4 charts in Tab 3 load in <500ms
- **Data Fetch:** p95 ≤ 1.5s for any tab's data
- **Export PowerPoint:** p95 ≤ 10s for 3-tab deck
- **Hover Tooltips:** <16ms response time (60fps)

### Performance Budget

```
JavaScript (Charts):  ≤ 200 KB (gzipped) - Recharts + custom components
CSS (Consulting):     ≤ 50 KB (gzipped)
Total Page Weight:    ≤ 750 KB (including base from E02)
```

---

## Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Traffic light indicators have text labels (not color-only)
- Impact indicators use symbols (▲▼) not just color
- Keyboard navigation for tabs and interactive elements
- Screen reader announces tab changes
- Chart tooltips accessible via keyboard focus
- High contrast mode support

---

## Testing Strategy

### Unit Tests

```typescript
// TrafficLightIndicator.test.tsx
describe('TrafficLightIndicator', () => {
  it('renders green triangle for "above" status', () => { });
  it('renders orange circle for "median" status', () => { });
  it('renders red triangle for "below" status', () => { });
  it('shows tooltip on hover with percentile data', () => { });
});

// ImpactCell.test.tsx
describe('ImpactCell', () => {
  it('renders double triangle for "strong" impact', () => { });
  it('renders single triangle for "positive" impact', () => { });
  it('shows rationale tooltip on hover', () => { });
});
```

### Integration Tests

```typescript
// PeerAnalysisConsulting.test.tsx
describe('Peer Analysis Consulting Page', () => {
  it('loads assessment data on mount', () => { });
  it('switches tabs and updates URL', () => { });
  it('updates all charts when cohort filter changes', () => { });
  it('exports PowerPoint with all tabs', () => { });
});
```

### E2E Tests (Playwright)

```typescript
test('consulting workflow: view assessment → analyze scorecard → export deck', async ({ page }) => {
  await page.goto('/clients/123/consulting');

  // Tab 1: Assessment
  await expect(page.locator('text=Peer Benchmarking & Assessment')).toBeVisible();
  await expect(page.locator('[data-status="above"]')).toHaveCount(3);

  // Tab 2: Scorecard
  await page.click('text=Scorecard');
  await expect(page.locator('text=PlanWise Navigator Scorecard')).toBeVisible();
  await page.hover('[data-impact="strong"]');
  await expect(page.locator('text=Auto-escalation increases average deferral')).toBeVisible();

  // Tab 3: Distributions
  await page.click('text=Distributions');
  await expect(page.locator('canvas')).toHaveCount(4); // 4 charts

  // Export
  await page.click('text=Export PDF');
  await page.click('text=All Tabs');
  await expect(page.locator('text=Generating...')).toBeVisible();
  await expect(page.locator('text=Download')).toBeVisible({ timeout: 15000 });
});
```

---

## Release Plan

### Phase 1: Foundation (Week 1)
- ✅ Tab navigation structure
- ✅ API endpoints for 3 tabs
- ✅ TrafficLightIndicator component
- ✅ Basic PeerAssessmentTable (Tab 1)

### Phase 2: Core Features (Week 2)
- ✅ NavigatorScorecard with impact matrix (Tab 2)
- ✅ ImpactCell component with tooltips
- ✅ RecommendationsPanel
- ✅ Cohort filter UI (shared across tabs)

### Phase 3: Visualizations (Week 3)
- ✅ HistogramChart component (Tab 3)
- ✅ 4 distribution charts with client markers (contribution, auto-enroll, vesting, auto-escalation)
- ✅ Real data integration - bin counts calculated from actual database values
- ✅ Regional/National cohort toggle with dynamic filtering
- ✅ Removed Match Only toggle - always use Match + Core for simplicity
- ✅ Y-axis changed to "Number of Clients" instead of percentages
- ✅ Decimal-to-percentage conversion for stored values (0.03 → 3%)

### Phase 4: Polish & Deploy (Week 4)
- ✅ PowerPoint export for all 3 tabs
- ✅ Print-friendly CSS for landscape orientation
- ✅ Performance optimization (chart lazy loading)
- ✅ Accessibility audit
- ✅ User acceptance testing
- ✅ Production deployment

---

## Recent Updates (September 30, 2025)

### Distribution Charts Real Data Implementation

**Changes Completed:**

1. **Replaced Participation Rate with Auto-Escalation Chart**
   - Removed: Participation Rate Distribution (data not available yet)
   - Added: Auto-Escalation Cap Distribution showing distribution of caps (0%, 6%, 10%, 15%, ≥20%)
   - Backend: Maps to `auto_escalation_cap` field in database

2. **Simplified UX - Removed Match Type Toggle**
   - Eliminated "Match Only vs. Match + Core" toggle on contribution chart
   - Contribution chart now always displays Match + Core (NEC) data
   - Reduces cognitive load and simplifies user experience

3. **Real Data Integration**
   - **Before:** All distribution charts used mock data with hardcoded percentages
   - **After:** All 4 charts calculate bin counts from actual database values
   - Backend queries cohort data and bins values in real-time
   - Peer averages calculated dynamically from cohort statistics
   - Database values stored as decimals (0.03) are converted to percentages (3%) for display

4. **Fixed Regional/National Toggle**
   - Regional cohort: Filters by same industry AND same state, excludes current client
   - National cohort: Filters by same industry only, excludes current client
   - Toggle now properly updates cohort size and recalculates all distributions
   - Example: Regional (n=8) vs National (n=19) for healthcare clients

5. **Y-Axis Label Correction**
   - Changed from "Number of Plans" to "Number of Clients"
   - Updated in both DistributionCard component and tooltips
   - Better aligns with terminology used throughout the platform

**Technical Implementation:**

- **Frontend:** `DistributionCharts.tsx` and `DistributionCard.tsx`
- **Backend:** `/api/v1/clients/{client_id}/distributions` endpoint (main.py:495-670)
- **Data Processing:**
  - Contribution: Bins `match_effective_rate` values (currently NULL in DB)
  - Auto-Enrollment: Bins `auto_enrollment_rate` values (0%, 2%, 3%, 4%, 5%, 6%, ≥7%)
  - Vesting: Bins `vesting_schedule` text values (Immediate, 3-year cliff, 5-year cliff, Graded)
  - Auto-Escalation: Bins `auto_escalation_cap` values (0%, 6%, 10%, 15%, ≥20%)

**Known Limitations:**

- Contribution (Match Rate) chart shows empty bins because `match_effective_rate` field is NULL for all clients
- Need to populate `match_effective_rate` data to see contribution distribution
- K-anonymity warning (n ≥ 20) not yet implemented - currently showing cohorts with n=8 and n=19

---

## Success Metrics

### Leading Indicators (Week 1-2)
- All 3 tabs load successfully for 100% of users
- Average load time per tab <1.5s
- 0 critical bugs reported

### Usage Metrics (Month 1)
- 50+ consultants using consulting views weekly
- 200+ tab views per week
- 50+ PowerPoint exports per week

### Impact Metrics (Month 2-3)
- 80%+ of client presentations use these views
- Average time to create consulting deck: <30 minutes (down from 4 hours)
- User satisfaction score ≥9/10 for visual quality

---

## Dependencies & Risks

### Dependencies
- E02 (Plan Analysis Dashboard) must be deployed first
- Peer benchmarking engine must support cohort filtering
- PowerPoint export library must support chart rendering
- Recharts library for React-native charting

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Chart rendering performance with 260+ data points | High | Virtualization, data sampling for large cohorts |
| PowerPoint export doesn't match design exactly | High | Use python-pptx with precise positioning, extensive testing |
| Traffic light logic too simplistic (doesn't match consultant intuition) | Medium | Configurable thresholds, override capability for admins |
| Cohort size < 20 exposes anonymity risk | High | Display warning, block export if n < 20 |

---

## Open Questions

1. **Traffic Light Thresholds:** Should we allow consultants to customize percentile thresholds (e.g., ≥70th = ▲ instead of ≥60th)?
2. **Scorecard Customization:** Can consultants add custom dimensions beyond the 5 default (Recruitment, Retention, Cost/ROI, Retirement, Efficiency)?
3. **Export Branding:** Should exported PowerPoints include client-specific branding (logos, colors) or stick to Fidelity standard templates?
4. **Historical Tracking:** Should we show how traffic lights have changed over time (e.g., "Was ▼, now ●")?
5. **Mobile Support:** Are these views needed on mobile/tablet, or desktop-only for consulting workflows?

---

## Appendix: Berkshire Slides Reference

### Slide 1 Design Tokens

```css
/* Table Layout */
--row-bg-even: #FFFFFF;
--row-bg-odd: #F3F4F6;
--header-bg: #E5E7EB;
--border-color: #D1D5DB;

/* Traffic Lights */
--above: #10B981;   /* ▲ Green triangle */
--median: #F59E0B;  /* ● Orange circle */
--below: #EF4444;   /* ▼ Red triangle */

/* Typography */
--font-header: 'Inter', 600, 20px;
--font-feature: 'Inter', 600, 14px;
--font-body: 'Inter', 400, 13px;
```

### Slide 2 Design Tokens

```css
/* Impact Symbols */
--strong-positive: #10B981;  /* ▲▲ */
--positive: #10B981;         /* ▲ */
--negative: #EF4444;         /* ▼ */
--neutral: #6B7280;          /* - */

/* Recommendations */
--now-badge: #EF4444;        /* Red "Now" badge */
--next-badge: #F59E0B;       /* Orange "Next" badge */
```

### Slide 3 Design Tokens

```css
/* Histogram Colors */
--hist-low: #D1D5DB;         /* ≤3% bars */
--hist-below: #86EFAC;       /* 3-4% bars */
--hist-median: #22C55E;      /* 5-8% bars */
--hist-high: #1F2937;        /* ≥9% bars */

/* Markers */
--client-marker: #10B981;    /* Green diamond ◆ */
--peer-line: #1F2937;        /* Dashed line */
--national-line: #6B7280;    /* Dashed line */
```

---

**Status:** Ready for Development
**Next Steps:**
1. Review epic with design team for visual approval
2. Estimate engineering effort (3-4 weeks confirmed)
3. Schedule sprint planning for Phase 1 kickoff
4. Prototype Tab 1 (Assessment Table) using `docs/UI_PROTOTYPE_BERKSHIRE_SLIDES.md` prompts