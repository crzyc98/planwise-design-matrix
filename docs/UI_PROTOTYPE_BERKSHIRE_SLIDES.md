# UI Prototype Prompts: Berkshire Health Systems Slides

**Purpose:** Recreate the three Berkshire Health Systems PowerPoint slides as interactive dashboard views.

---

## Prompt 1: Peer Benchmarking Assessment Table (Image 1)

```
Create an interactive HTML prototype of a peer benchmarking assessment table for retirement plans, based on a real PowerPoint slide design.

VISUAL DESIGN:
- Professional table with alternating row colors (light gray, white)
- Three columns: "Lever" | "Current Design & Assessment" | "Peer Average"
- Traffic light indicators: ▲ (green triangle) | ● (orange circle) | ▼ (red triangle)
- Header: "Berkshire Health Systems" title with "Peer Benchmarking & Assessment to Peers" subtitle

TABLE ROWS (5 features):

1. ELIGIBILITY
   Current: "1 year of service" [▲ GREEN]
   Peers: "Majority have 1,000 hours or 1-year of service requirement."
   Assessment: "At peer average and recommended design for Healthcare plans."

2. AUTO-ENROLLMENT
   Current: "Yes, default 4%" [▲ GREEN]
   Peers: "Majority offer, 3% median default (2-3% range)."
   Assessment: "Default 4% tops all peers and best practice."

3. AUTO-ESCALATION
   Current: "1%/yr up to 10%" [▲ GREEN]
   Peers: "Minority of peers using; typical +1%/yr to 4-10% cap"
   Assessment: "Best practice design, exceeds peer set."

4. EMPLOYER CONTRIBUTION
   Current: "50% up to 4% match, 2.5% NEC" [● ORANGE]
   Peers: "5% median maximum (Discretionary to 7.5% range)."
   Assessment: "Competitive with peer set."

5. VESTING
   Current: "Immediate" [▼ RED]
   Peers: "Most common is 3-year cliff vesting"
   Assessment: "More generous than peers, helps recruiting but does not contribute to retention and allows for plan leakage."

FOOTER LEGEND:
- Red down triangle: "below peers"
- Orange circle: "at peer median"
- Green up triangle: "above peers and/or best practice"

STYLING:
- Clean, corporate design (grays, subtle borders)
- Traffic light colors: Green #10B981, Orange #F59E0B, Red #EF4444
- Font: Professional sans-serif (Inter or Arial)
- Header background: light gray
- Assessment text in "Peer Average" column: bold "Peers:" and "Δ vs Peers:" labels

INTERACTIVITY:
- Hover on row: highlight background
- Click traffic light icon: show tooltip with percentile details
- Click feature name: expand to show more detail
- Print-friendly layout

Make it look exactly like the PowerPoint slide but interactive and responsive.
```

---

## Prompt 2: Navigator Scorecard Matrix (Image 2)

```
Create an interactive HTML prototype of a PlanWise Navigator Scorecard showing multi-dimensional impact analysis.

VISUAL DESIGN:
- Header: "Berkshire Health Systems" with "PlanWise Navigator Scorecard" subtitle
- Summary text: "Competitive blended contribution design with strong auto features; increase auto-escalation cap to 15% and re-enroll participants to drive retirement readiness."
- Impact matrix with 6 columns: Lever | Current Design | 🎯 Recruitment | 👥 Retention | 💰 Cost/ROI | 🏖️ Retirement | ⚡ Efficiency

TABLE ROWS (5 features with alternating gray/white backgrounds):

1. ELIGIBILITY
   Current: "1 year of service"
   Recruitment: -
   Retention: ▲
   Cost/ROI: -
   Retirement: -
   Efficiency: ▲

2. AUTO-ENROLLMENT
   Current: "Yes, default 4%"
   Recruitment: ▲
   Retention: ▲
   Cost/ROI: -
   Retirement: ▲▲
   Efficiency: ▲

3. AUTO-ESCALATION
   Current: "1%/yr up to 10%"
   Recruitment: ▲
   Retention: ▲
   Cost/ROI: -
   Retirement: ▲▲
   Efficiency: ▲

4. EMPLOYER $
   Current: "50% up to 4% match, 2.5% NEC"
   Recruitment: ▲
   Retention: ▲
   Cost/ROI: -
   Retirement: ▲
   Efficiency: ▲

5. VESTING
   Current: "Immediate"
   Recruitment: ▲
   Retention: ▼
   Cost/ROI: ▼
   Retirement: -
   Efficiency: ▲

ICON MEANINGS:
- ▲▲ = Strong positive impact (2 green triangles)
- ▲ = Positive impact (1 green triangle)
- ▼ = Negative impact (1 red triangle)
- - = No material impact (dash)

RECOMMENDATIONS SECTION (bottom):
"PlanWise Navigator Considerations (Impact / Cost / Complexity)"
• Now: Consider 3-year cliff vesting to promote retention and limit plan leakage. (↑↑, $ Savings, Low)
• Next: Review competitive peer set to consider contribute design for potential improvements. (↑↑, $$-$$$, Low)

STYLING:
- Professional corporate design
- Icons: emoji or colored triangles
- Alternating row backgrounds (light gray #F3F4F6, white)
- Bold column headers with icons
- Small footer text: "869523.3.0 Fidelity Confidential Information for Institutional Plan Sponsor use only"

INTERACTIVITY:
- Hover on triangle: show tooltip explaining impact
- Click "Now" recommendation: highlight vesting row
- Click "Next" recommendation: highlight employer $ row
- Responsive: stack columns on mobile

Make it look like a professional consulting deliverable (BCG/McKinsey style).
```

---

## Prompt 3: Employer Contribution Distribution Chart (Image 3)

```
Create an interactive HTML prototype showing a distribution histogram of healthcare employer contributions with peer benchmarking.

VISUAL DESIGN:
- Header: "Berkshire Health Systems" with subtitle "Benchmark to Fidelity Healthcare National peer set (260 employers)"
- Chart title: "Distribution of Healthcare plans by employer contribution (Match & Core)"

HISTOGRAM DATA:
- X-axis: Employer contribution levels (1%, 2%, 3%, 4%, 5%, 6%, 7%, 8%, 9%, >=10%)
- Y-axis: Percentage of plans (0-20%)
- Bars:
  - 1%: 1% (light gray)
  - 2%: 4% (light gray)
  - 3%: 12% (light green)
  - 4%: 13% (light green)
  - 5%: 20% (dark green) ← PEAK
  - 6%: 18% (dark green)
  - 7%: 9% (dark green)
  - 8%: 9% (dark green)
  - 9%: 6% (black)
  - >=10%: 8% (black)

KEY MARKERS:
- CLIENT POSITION (4.5%):
  - Green diamond marker (◆) on chart
  - Callout box: "Berkshire Health System 4.5% (50th percentile, nationally, ranked 5th regionally)"

- REFERENCE LINES:
  - Dashed vertical line at 4.8%: "Peer average: 4.8% (8 employers)"
  - Dashed vertical line at 5.8%: "Healthcare national average: 5.8% (260 employers)"

COLOR SCHEME:
- Bars ≤3%: Light gray (#D1D5DB)
- Bars 3-4%: Light green (#86EFAC)
- Bars 5-8%: Dark green (#22C55E)
- Bars ≥9%: Black (#1F2937)
- Client marker: Green diamond
- Reference lines: Black dashed

ANNOTATIONS:
- Position callout box at top-left with client name and percentile
- Show "Peer average" label above 4.8% line
- Show "Healthcare national average" label above 5.8% line
- X-axis label: percentage values with %
- Y-axis label: percentage values (implicit from bar heights)

INTERACTIVITY:
- Hover on bars: show exact count of employers
- Hover on diamond: show "Your plan: 4.5% effective rate (match + NEC)"
- Hover on dashed lines: show cohort details (n=8 regional, n=260 national)
- Click "Peer average" line: highlight regional peer set
- Click "National average" line: highlight national distribution
- Toggle button: Switch between "Match Only" and "Match + Core (NEC)"

FOOTER:
- Small text: "869523.3.0 Fidelity Confidential Information for Institutional Plan Sponsor use only"

STYLING:
- Clean, professional chart design
- Use Chart.js or D3.js for histogram
- Professional financial/consulting presentation quality
- Print-friendly layout (landscape orientation works best)
- Responsive: maintain aspect ratio on different screen sizes

Make it look like a Fidelity consulting report chart - professional, data-rich, clear visual hierarchy.
```

---

## Combined Prompt: All Three Views in One Dashboard

```
Create an interactive HTML prototype combining all three Berkshire Health Systems views into a tabbed dashboard interface.

LAYOUT:
- Top navigation tabs: "Overview" | "Scorecard" | "Distributions"
- Header bar: "Berkshire Health Systems 403(b) Plan" with client selector dropdown
- Action buttons: [Export PDF] [Generate Report]

TAB 1: OVERVIEW (Peer Benchmarking Assessment)
- Shows the 5-row comparison table from Image 1
- Traffic light indicators (▲●▼)
- Peer assessment text
- Interactive: click row to see detailed comparison

TAB 2: SCORECARD (Navigator Impact Analysis)
- Shows the multi-dimensional scorecard from Image 2
- Impact columns: Recruitment | Retention | Cost/ROI | Retirement | Efficiency
- Recommendations section at bottom
- Interactive: hover on triangles to see impact details

TAB 3: DISTRIBUTIONS (Peer Benchmark Charts)
- Shows the histogram from Image 3
- Additional charts:
  - Auto-enrollment default rate distribution
  - Vesting schedule distribution (pie chart)
  - Participation rate distribution
- Interactive: filter by peer cohort (regional vs. national)

SHARED FEATURES:
- Client selector: dropdown showing other clients
- Date range: "Data as of Q4 2024"
- Cohort filters: "Healthcare (n=260)" | "Regional (n=8)"
- Export button: download current view as PDF
- Print layout optimization

NAVIGATION:
- Tab switching with smooth transitions
- URL updates with each tab (for bookmarking)
- Back/forward browser navigation works
- Keyboard shortcuts: 1, 2, 3 for tab switching

STYLING:
- Modern, professional design
- Consistent with Fidelity branding (subtle blues, professional grays)
- Responsive: tablet and desktop layouts (not mobile-optimized)
- Print-friendly: each tab prints cleanly on separate pages

INTERACTIVITY:
- Smooth tab transitions (fade in/out)
- All charts and tables interactive
- Tooltips with detailed data
- Click to drill down into metrics
- Export options: PDF, PowerPoint, Excel

Make it look like a modern financial services dashboard (Fidelity, Vanguard, Charles Schwab quality).
```

---

## Key Design Elements to Capture

### Typography
- Headers: Bold, ~28-32pt
- Subheaders: Semi-bold, ~18-20pt
- Body text: Regular, ~14-16pt
- Table text: ~12-14pt
- Footer disclaimers: ~10pt

### Colors (From Slides)
```css
--green-success: #10B981;  /* ▲ above peers */
--orange-median: #F59E0B;  /* ● at median */
--red-below: #EF4444;      /* ▼ below peers */
--gray-bg: #F3F4F6;        /* alternating rows */
--dark-gray: #6B7280;      /* text */
--black: #1F2937;          /* headers */
```

### Spacing
- Section padding: 32px
- Row height: 60-80px
- Card margins: 24px
- Text line height: 1.5-1.6

---

## React Component Structure

Once you've prototyped in Claude Artifacts, here's how they map to React components:

```typescript
// Tab 1: Overview
<PeerBenchmarkTable>
  <TableHeader />
  <TableRow feature="Eligibility" status="above" />
  <TableRow feature="Auto-Enrollment" status="above" />
  <TableRow feature="Match" status="median" />
  <TableRow feature="Vesting" status="below" />
  <TableLegend />
</PeerBenchmarkTable>

// Tab 2: Scorecard
<NavigatorScorecard>
  <ScorecardSummary />
  <ImpactMatrix features={features} dimensions={dimensions} />
  <RecommendationsPanel recommendations={recs} />
</NavigatorScorecard>

// Tab 3: Distributions
<DistributionCharts>
  <HistogramChart
    data={employerContribution}
    yourValue={4.5}
    peerAvg={4.8}
    nationalAvg={5.8}
  />
  <ChartFilters />
  <AdditionalCharts />
</DistributionCharts>
```

---

## Next Steps

1. **Copy Prompt 1** → Paste into Claude.ai → Get interactive HTML prototype
2. **Review & Iterate:** "Make the table wider", "Add more hover effects"
3. **Repeat for Prompts 2 & 3**
4. **Test Combined View:** Use the "Combined Prompt" for full dashboard
5. **Share with Team:** Download HTML files and get feedback
6. **Build in React:** Port approved designs to Vite components

---

**These slides are production-quality designs.** They should absolutely become the template for your dashboard UI. The traffic light system (▲●▼) is perfect for quick visual scanning, and the multi-dimensional scorecard is exactly what consultants need.

Let me know when you're ready to prototype these - I can help refine the prompts further!