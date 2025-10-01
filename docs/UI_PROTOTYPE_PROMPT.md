# UI Prototype Prompt for Claude with Artifacts

**Purpose:** Generate interactive HTML/CSS/JavaScript prototypes of the PlanWise Design Matrix dashboard using Claude's Artifacts feature.

---

## How to Use This Prompt

1. Open a new conversation with Claude (claude.ai)
2. Copy and paste the relevant prompt below
3. Claude will generate an interactive prototype in an Artifact
4. You can iterate: "Make the search bar bigger", "Add more sample data", etc.
5. Download the HTML file when satisfied (click download icon in Artifact)

---

## Prompt 1: Client Selector Dropdown

```
I need you to create an interactive HTML prototype of a client selector dropdown for an enterprise retirement plan dashboard. Use modern CSS and vanilla JavaScript.

Requirements:

VISUAL DESIGN:
- Clean, professional design with subtle shadows and borders
- Primary color: #3B82F6 (blue)
- Gray scale: #F9FAFB → #111827
- Font: Inter or system fonts

FUNCTIONALITY:
- Searchable dropdown that filters as you type
- Shows 850+ clients (use sample data with ~20 clients for demo)
- Each client shows:
  - Company icon (emoji or colored circle with initials)
  - Plan name
  - Plan type badge (401k/403b) with colored background
  - Participant count (right-aligned, gray)
- "Recent Clients" section at top (max 5)
- Search input with magnifying glass icon
- Keyboard navigation (arrow keys, enter to select)
- Smooth animations on open/close

SAMPLE DATA FORMAT:
Include diverse clients like:
- "Lehigh University" - 401k - 2,000 participants
- "Baystate Health" - 403b - 13,000 participants
- "ABC Manufacturing" - 401k - 450 participants
- "State Teachers System" - 403b - 8,200 participants

BEHAVIOR:
- Click trigger to open dropdown
- Type in search to filter (fuzzy matching on name)
- Click a client to select it (updates trigger text)
- Click outside or ESC to close
- Arrow keys to navigate, Enter to select

Make it production-quality with smooth transitions and hover states. Use Tailwind-style utility classes if easier, or plain CSS. Include realistic sample data.
```

---

## Prompt 2: Plan Design Matrix Table

```
Create an interactive HTML prototype of a plan design matrix table showing extracted retirement plan features with confidence scores.

Requirements:

TABLE STRUCTURE:
- 4 columns: Feature | Value | Confidence | Status
- 10-12 rows showing different plan features
- Sortable columns (click header to sort)
- Filter dropdown: "All" / "Verified" / "Review"
- Search box above table to filter rows

SAMPLE FEATURES TO SHOW:
1. Eligibility Age: "21 years" - 98% confidence - Verified
2. Service Requirement: "1 year (1000 hrs)" - 95% confidence - Verified
3. Employer Match: "100% up to 3%" - 78% confidence - Review (low confidence)
4. Vesting Schedule: "3-year cliff" - 92% confidence - Verified
5. Auto-Enrollment: "Yes - 3% default" - 96% confidence - Verified
6. Auto-Escalation: "Yes - up to 10%" - 88% confidence - Verified
7. Catch-up Contributions: "Yes - $7,500" - 99% confidence - Verified
8. Roth Option: "Available" - 94% confidence - Verified
9. Loan Provision: "Yes - 50% of vested balance" - 82% confidence - Verified
10. Hardship Withdrawals: "Available - safe harbor" - 91% confidence - Verified

CONFIDENCE VISUALIZATION:
- Horizontal progress bar (0-100%)
- Color coding:
  - Green (≥92%): #10B981
  - Yellow (70-88%): #F59E0B
  - Red (<70%): #EF4444
- Show percentage number next to bar

STATUS BADGES:
- "Verified" - green pill badge
- "Review" - yellow/orange pill badge with "Review" button next to it
- Clicking "Review" button shows alert: "Review modal would open here"

STYLING:
- Alternating row colors for readability
- Hover state on rows (subtle background change)
- Fixed header when scrolling (sticky)
- Professional table design with borders
- Responsive (works on smaller screens)

FOOTER:
- Summary: "✅ 7 features verified  ⚠️ 1 requires review  [Export Data] button"

Make it look like a modern SaaS application table.
```

---

## Prompt 3: Peer Benchmark Cards

```
Create an interactive HTML prototype showing peer benchmark comparison cards for retirement plan features.

Requirements:

CARD LAYOUT:
- 3 cards displayed in a row (responsive: stack on mobile)
- Each card has white background, subtle shadow, rounded corners
- Card dimensions: ~320px wide, ~400px tall
- Padding: 24px

CARD 1: EMPLOYER MATCH COMPARISON
- Title: "Employer Match" with "vs Industry" subtitle
- Bullet chart showing:
  - Your value: 3.0% (blue diamond marker)
  - Industry average: 3.8% (vertical dashed line)
  - Top quartile: 6.0% (end of range)
  - Show scale: 0% → 6%
  - Peer range (P25-P75) as gray bar
- Label below: "⚠️ Below Average" in yellow/orange
- Footer: "Based on 287 similar plans"

CARD 2: AUTO-ENROLLMENT RATE
- Title: "Auto-Enrollment Rate" with "✅ Above Average" badge in green
- Big number: "3%" (your plan) in large font
- Text: "Industry average: 2.5%"
- Horizontal bar showing your position above peer median
- Footer: "73% of peers have auto-enrollment"

CARD 3: PARTICIPATION RATE
- Title: "Participation Rate" with "✅ Excellent" badge in green
- Big number: "84%" in large font
- Text: "Top quartile performance"
- Percentile indicator showing position in 75-90th range
- Small chart showing distribution curve with your position marked
- Footer: "Based on 312 similar plans"

INTERACTIVITY:
- Hover on card: slight lift effect (box-shadow increase)
- Hover on metrics: show tooltip with exact peer statistics
  - Example: "n=287, median=3.8%, p25=3.0%, p75=5.0%, p-value<0.05"
- Click card: console.log("Expand to detailed view")

COLOR SCHEME:
- Primary blue: #3B82F6
- Success green: #10B981
- Warning yellow: #F59E0B
- Danger red: #EF4444
- Gray backgrounds: #F9FAFB

Make the visualizations clean and modern, inspired by Linear, Stripe, or Vercel dashboards.
```

---

## Prompt 4: Full Dashboard Layout

```
Create an interactive HTML prototype of the complete PlanWise Design Matrix dashboard layout with all components.

Requirements:

LAYOUT STRUCTURE (3-column grid):
```
┌────────────────────────────────────────────────────────┐
│ HEADER: Logo | [Client Selector ▼] | Settings | Report│
├──────────────┬────────────────────────┬────────────────┤
│              │                        │                │
│  LEFT PANEL  │    CENTER PANEL        │  RIGHT PANEL   │
│  (25%)       │    (50%)               │  (25%)         │
│              │                        │                │
│  Document    │    Plan Design Matrix  │  Peer          │
│  Upload      │    (Table)             │  Benchmark     │
│              │                        │  Cards         │
│  AI Insights │                        │                │
│              │                        │  Recommend-    │
│              │                        │  ations        │
└──────────────┴────────────────────────┴────────────────┘
```

HEADER:
- PlanWise logo (left) - use "PW" in a circle or just text
- Client selector dropdown (center-left, prominent)
- Settings icon button (right)
- "Generate Report" primary button (right, dark blue)

LEFT PANEL:
1. Document Upload Card:
   - Drag & drop area with dashed border
   - "Drop files here or click to browse"
   - Show 2 uploaded files:
     - "Form 5500 - 2024.pdf" with progress bar (67%)
     - "Plan Document.pdf" with green checkmark

2. AI Insights Card:
   - Title: "🤖 AI Insights"
   - "✅ 12 plan features extracted"
   - "✅ Vesting schedule validated"
   - "⚠️ Review match formula" (clickable, yellow)

CENTER PANEL:
- Plan Design Matrix table (simplified version from Prompt 2)
- Show 6-7 rows with sample data
- Include search/filter controls at top

RIGHT PANEL:
1. Peer Benchmark Card (simplified from Prompt 3)
   - Show just 1 metric card (employer match)
   - "View All Benchmarks →" link at bottom

2. Recommendations Card:
   - Title: "🎯 Recommendations"
   - 2 recommendation cards:
     - "Consider increasing match" (yellow/orange border)
     - "Strong vesting policy ✅" (green border)
   - "View All Recommendations →" link

STYLING:
- Modern, clean design
- Subtle shadows for depth
- Consistent spacing (16px, 24px, 32px)
- Responsive (collapse to single column on mobile)
- Professional color scheme (blues, greens, grays)

INTERACTIVITY:
- Client selector opens dropdown on click
- Upload area highlights on file drag-over
- Clickable AI insights jump to relevant table row (scroll + highlight)
- All buttons show hover states
- "Generate Report" button shows console message

Make it look like a modern enterprise SaaS application (think Stripe, Linear, Vercel design quality).
```

---

## Prompt 5: Review Modal (Annotation Interface)

```
Create an interactive HTML prototype of a review modal for validating low-confidence extractions.

Requirements:

MODAL STRUCTURE (side-by-side layout):
- Full-screen modal with dark overlay
- Modal width: 90vw, max-width: 1400px
- Close button (X) in top-right corner

LEFT PANEL (50%):
- Title: "📄 Source Document"
- Simulated PDF viewer showing page 12
- Show sample text with highlighted extraction:
  ```
  Page 12

  EMPLOYER CONTRIBUTIONS

  The Company will match one hundred percent (100%)
  of employee deferrals up to three percent (3%) of
  compensation.

  Vesting for employer matching contributions follows
  a three-year cliff schedule.
  ```
- The match formula text highlighted in yellow
- Confidence score badge below: "78% confidence"

RIGHT PANEL (50%):
- Title: "✏️ Extracted Value"
- Field label: "Employer Match Formula"
- Category badge: "Contributions"
- Extracted value in editable input box:
  "100% up to 3%"
- Confidence bar: 78% (yellow/orange)
- Warning message: "⚠️ Below Tier-1 threshold (80%)"
- Reason: "Pattern match confidence low"

ACTION BUTTONS (large, at bottom of right panel):
- [✅ Accept] - green button
- [✏️ Edit Value] - blue button
- [❌ Reject] - red outline button
- [🚩 Flag for Expert] - yellow button

COMMENTS SECTION:
- Text area labeled "Comments (optional)"
- Placeholder: "Add notes about this extraction..."
- Character count: "0/500"

BEHAVIOR:
- Click "Accept": Show success toast "Extraction verified ✅"
- Click "Edit": Input becomes editable, "Save" button appears
- Click "Reject": Show confirmation "Mark as 'cannot determine'?"
- Click "Flag": Show dropdown for escalation reason
- ESC key or overlay click closes modal

STYLING:
- Professional modal design
- Left panel: light gray background (#F9FAFB)
- Right panel: white background
- Smooth animations on open/close
- Button hover states
- Input focus states with blue border

Make it look like a high-quality annotation tool (think Prodigy, Label Studio quality).
```

---

## Prompt 6: Client Selector with Virtualized List

```
Create an interactive HTML prototype of the client selector dropdown that efficiently handles 850+ clients using virtual scrolling.

Requirements:

DROPDOWN FEATURES:
- Search input at top with magnifying glass icon
- "Recent Clients" section (5 items max)
- Divider line
- "All Clients (850)" section with virtual scrolling
- Only render 20 visible items at a time
- Smooth scrolling with scroll position tracking
- Shows item number while scrolling (e.g., "Items 45-65 of 850")

CLIENT ITEM FORMAT:
- 60px height per item
- Icon: colored circle with company initials (2 letters)
- Company name (bold)
- Plan type badge (401k/403b)
- Participant count (gray, right-aligned)
- Hover: light blue background

SAMPLE DATA (generate 100+ items with realistic names):
- Universities: "Harvard University", "Stanford University", "MIT", etc.
- Hospitals: "Mayo Clinic", "Cleveland Clinic", "Johns Hopkins", etc.
- Manufacturers: "Boeing", "3M", "Caterpillar", etc.
- Tech companies: "Salesforce", "Adobe", "Cisco", etc.
- Variety of participant counts: 100 - 50,000

SEARCH BEHAVIOR:
- Filter as you type (fuzzy matching on company name)
- Show result count: "Showing 23 of 850 clients"
- Highlight matching text in results
- Clear button (X) appears when typing

KEYBOARD NAVIGATION:
- Arrow up/down: navigate items
- Enter: select current item
- ESC: close dropdown
- Tab: close dropdown
- Type to search (auto-focus)

VIRTUAL SCROLLING:
- Dropdown max-height: 400px
- Show scroll indicator on right side
- "Loading..." indicator if scrolling fast
- Maintain scroll position when reopening

PERFORMANCE NOTES:
- Comment in code explaining virtual scroll technique
- Only render visible items + buffer (10 above, 10 below)
- Use transform for positioning items
- Reuse DOM nodes for better performance

Make it smooth and performant, like VS Code's command palette or Linear's project selector.
```

---

## Prompt 7: Mobile-Responsive Dashboard

```
Create an interactive HTML prototype showing how the PlanWise dashboard adapts to mobile screens (375px width).

Requirements:

MOBILE LAYOUT CHANGES:
1. Header:
   - Hamburger menu icon (left)
   - "PW" logo (center)
   - Profile icon (right)
   - Client selector moves into slide-out menu

2. Main Content:
   - Single column stack (no 3-column grid)
   - Order: Plan Design Matrix → Peer Benchmarks → Recommendations → Upload

3. Plan Design Matrix:
   - Horizontal scroll for table
   - Simplified: hide confidence column on mobile
   - Show only: Feature | Value | Status

4. Peer Benchmark Cards:
   - Full width cards, stacked vertically
   - Condensed height (~250px each)
   - Simplified charts (remove detailed labels)

5. Recommendations:
   - Card-based layout, stacked
   - Tap to expand (accordion style)

MOBILE-SPECIFIC FEATURES:
- Swipe left on table rows to reveal "Review" action
- Pull to refresh (show loading spinner)
- Bottom tab bar:
  - Dashboard (active)
  - Clients
  - Reports
  - Profile
- Sticky "Generate Report" button at bottom
- Touch-optimized: 44px minimum tap targets

INTERACTIONS:
- Hamburger menu slides in from left
- Client selector: full-screen overlay on mobile
- Table: horizontal pan, pinch to zoom
- Cards: tap to expand/collapse
- Bottom sheet for "Generate Report" options

BREAKPOINTS TO SHOW:
- Create 3 views in the artifact:
  1. Desktop (1200px) - full 3-column layout
  2. Tablet (768px) - 2-column layout
  3. Mobile (375px) - single column stack

Use CSS media queries and include viewport meta tag for proper mobile rendering. Show responsive design in action with a toggle button to switch between views.
```

---

## Prompt 8: Data Visualization Dashboard

```
Create an interactive HTML prototype showing advanced peer benchmark visualizations using Chart.js or D3.js.

Requirements:

CHART TYPES TO INCLUDE:

1. BULLET CHART (Employer Match):
   - Shows your value vs. peer ranges
   - Gray bar: peer range (P25-P75)
   - Red dashed line: peer median
   - Blue diamond: your plan
   - Scale: 0% to 8%
   - Labels: "Poor", "Below Avg", "Good", "Excellent" zones

2. PERCENTILE DISTRIBUTION (Participation Rate):
   - Bell curve showing distribution of peer plans
   - Your position marked with vertical line
   - Shaded area showing your percentile
   - X-axis: 40% to 95% participation
   - Y-axis: number of plans
   - Annotation: "You're in 84th percentile"

3. MULTI-METRIC RADAR CHART:
   - 6 dimensions: Match, Vesting, Auto-Enroll, Participation, Contributions, Features
   - Your plan (blue line)
   - Peer median (orange line)
   - Scale: 0-100 for each dimension
   - Interactive: hover shows exact values

4. TREND OVER TIME (if historical data):
   - Line chart: your plan vs. peer median over 5 years
   - X-axis: 2019-2024
   - Y-axis: participation rate (%)
   - Two lines with legend
   - Hover tooltip shows exact values

5. FEATURE ADOPTION HEAT MAP:
   - Grid showing adoption rates across peer cohort
   - Rows: features (match, auto-enroll, Roth, loans, etc.)
   - Columns: plan size buckets (<500, 500-2K, 2K-5K, 5K+)
   - Color intensity: adoption rate (0-100%)
   - Your plan highlighted

INTERACTIVITY:
- Hover: tooltips with exact numbers
- Click legend items: toggle series visibility
- Zoom: click-and-drag to zoom on chart
- Export: button to download chart as PNG
- Filter: dropdown to change peer cohort (industry, size)

STYLING:
- Professional chart design (no default Chart.js colors)
- Custom color palette: blues, greens, oranges
- Smooth animations on load (1 second)
- Responsive: charts resize with container
- Accessibility: proper labels and contrast

Include at least 3 different chart types with realistic sample data. Make it look like a professional analytics dashboard (think Tableau, Looker, or Amplitude quality).
```

---

## Bonus: Combined Prompt for Quick Prototype

```
Create a single-page interactive HTML prototype of the PlanWise Design Matrix dashboard with these features:

1. TOP: Client selector dropdown (searchable, ~10 sample clients)
2. LEFT: Document upload panel + AI insights card
3. CENTER: Plan design matrix table (6 rows)
4. RIGHT: Peer benchmark card + recommendations card

Include:
- Modern, professional design (blues, greens, grays)
- Sample data for Lehigh University 401(k) plan
- Interactive elements (clickable buttons, hoverable cards)
- Smooth animations
- Mobile-responsive layout

Make it look like a high-quality SaaS dashboard (Stripe/Linear style). Use Tailwind-style CSS classes or plain CSS—whichever renders best. Include realistic sample data and make all interactions console.log() their actions.
```

---

## Tips for Best Results

1. **Be Specific:** The more detail you provide, the better the prototype
2. **Iterate:** Start with one component, then ask to refine it
3. **Request Changes:** "Make the cards larger", "Use a darker blue", "Add more hover effects"
4. **Combine Components:** Once happy with individual pieces, ask Claude to combine them
5. **Download & Share:** Use the download button in the Artifact to save the HTML file
6. **Test Responsiveness:** Ask Claude to "make it responsive" or "show mobile view"

---

## Next Steps After Prototyping

1. **Share with Stakeholders:** Send HTML files for feedback
2. **Extract Design Tokens:** Copy colors, spacing, fonts to design system
3. **Use as Vite Component Reference:** Port successful patterns to React components
4. **Document Interactions:** Note which interactions users liked best
5. **Iterate Based on Feedback:** Bring feedback back to Claude for refinements

---

**Created:** September 30, 2025
**For Use With:** Claude.ai (Artifacts feature)
**Estimated Time:** 15-30 minutes per prototype
**Output:** Interactive HTML/CSS/JS files ready for demo