# Epic W1-3: Streamlit Dashboard

**Epic ID:** W1-3
**Epic Name:** Streamlit Dashboard (Minimal UI for Demo)
**Priority:** Critical - Week 1 Demo Interface
**Estimated Effort:** 1 day
**Phase:** Week 1 - Prove the Concept
**Dependencies:** W1-1 (Database), W1-2 (Peer Benchmarking Engine)

---

## Epic Summary

Build a minimal Streamlit dashboard that allows users to select a client, view plan details, see peer comparison charts, and generate PowerPoint deliverables. This provides an interactive demonstration interface to validate the platform's value proposition.

**Key Principle:** Simple interface to show the magic—prove value, not polish.

## Business Value

- **Demo Tool:** Enable stakeholder demonstrations and user feedback sessions
- **Validation:** Test user workflows and data presentation before investing in production UI
- **Immediate Usability:** Give AEs and consultants a working tool THIS WEEK
- **Learning:** Identify which features resonate most with users

## User Story

**As an** Account Executive
**I want** a simple dashboard to explore peer comparisons for my clients
**So that** I can quickly identify competitive gaps and prepare for client meetings

---

## Acceptance Criteria

### Basic UI Components
- [ ] Client dropdown with all 20 plans
- [ ] Plan details card showing key information
- [ ] Peer comparison section with charts
- [ ] "Generate PowerPoint" button
- [ ] Success/error messages for user actions

### Plan Details Display
- [ ] Show client name, sponsor, industry
- [ ] Display employee count (formatted with commas)
- [ ] Show match details (if applicable)
- [ ] Show auto-enrollment details (if applicable)
- [ ] Color-coded status indicators (has match, has auto-enrollment)

### Peer Comparison Charts
- [ ] Employee count percentile chart (bar or bullet chart)
- [ ] Match effective rate comparison (if applicable)
- [ ] Auto-enrollment default rate comparison (if applicable)
- [ ] Adoption rate comparison (% of peers with match, auto-enrollment)
- [ ] All charts clearly labeled with your value vs. peer median/percentiles

### PowerPoint Generation
- [ ] Button triggers generation (calls W1-4 function when available)
- [ ] Loading spinner while generating
- [ ] Download link displayed on success
- [ ] Error handling with clear messages

### User Experience
- [ ] Page loads in <3 seconds
- [ ] Responsive layout (readable on laptop screens)
- [ ] Clear visual hierarchy (important info prominent)
- [ ] Professional color scheme (PlanWise branding if available)

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PlanWise Design Matrix - Peer Benchmarking Demo           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Select Client: [Dropdown: ABC Corp 401(k) Plan       ▼]   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PLAN DETAILS                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ABC Corporation 401(k) Plan                           │ │
│  │ Industry: Higher Education (611)                      │ │
│  │ Employees: 2,400                                      │ │
│  │                                                       │ │
│  │ ✓ Employer Match: 3.0% effective rate                │ │
│  │ ✓ Auto-Enrollment: 3% default rate                   │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  PEER COMPARISON (n=12 peers)                               │
│                                                             │
│  Employee Count                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Your Plan: 2,400 (58th percentile)                   │ │
│  │ [============================◆====]                   │ │
│  │  P25: 1,800    P50: 2,200    P75: 2,800             │ │
│  │ Label: Above Average                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Match Effective Rate                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Your Plan: 3.0% (42nd percentile)                    │ │
│  │ [===================◆=================]                │ │
│  │  P25: 2.5%    P50: 3.0%    P75: 4.0%                 │ │
│  │ Label: Average                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Feature Adoption                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Employer Match:        ✓ You | 92% of peers          │ │
│  │ Auto-Enrollment:       ✓ You | 75% of peers          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Generate PowerPoint Deck]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

```python
# app.py - Streamlit Dashboard
import streamlit as st
import duckdb
import plotly.graph_objects as go
from peer_benchmarking import generate_peer_comparison

# Page configuration
st.set_page_config(
    page_title="PlanWise Design Matrix",
    page_icon="📊",
    layout="wide"
)

# Title
st.title("PlanWise Design Matrix - Peer Benchmarking Demo")
st.markdown("---")

# Connect to database
@st.cache_resource
def get_database_connection():
    return duckdb.connect('plans.db', read_only=True)

conn = get_database_connection()

# Load plan list
@st.cache_data
def load_clients():
    clients = conn.execute("""
        SELECT client_id, client_name, plan_sponsor_name
        FROM plan_designs
        ORDER BY client_name
    """).fetchall()
    return [(c[0], f"{c[2]} - {c[1]}") for c in clients]

clients = load_clients()
client_options = {display: client_id for client_id, display in clients}

# Client selection
selected_display = st.selectbox(
    "Select Client:",
    options=list(client_options.keys()),
    index=0
)
selected_client_id = client_options[selected_display]

# Generate peer comparison
try:
    comparison = generate_peer_comparison(selected_client_id)
    target = comparison['target_client']
    cohort_size = comparison['peer_cohort']['size']

    # Plan Details Section
    st.header("Plan Details")

    col1, col2 = st.columns(2)

    with col1:
        st.metric("Industry", target['industry'])
    with col2:
        st.metric("Employees", f"{target['employee_count']:,}")

    # Match and Auto-Enrollment Details
    col1, col2 = st.columns(2)

    with col1:
        has_match = target.get('match_formula') is not None
        if has_match:
            st.success(f"✓ Employer Match: {target['match_effective_rate']:.1f}% effective rate")
        else:
            st.warning("✗ No Employer Match")

    with col2:
        if target['auto_enrollment_enabled']:
            st.success(f"✓ Auto-Enrollment: {target['auto_enrollment_default_rate']*100:.0f}% default rate")
        else:
            st.warning("✗ No Auto-Enrollment")

    st.markdown("---")

    # Peer Comparison Section
    st.header(f"Peer Comparison (n={cohort_size} peers)")

    if cohort_size < 5:
        st.warning(f"⚠️ Limited peer data (n={cohort_size}). Results may not be representative.")

    # Employee Count Comparison
    st.subheader("Employee Count")
    employee_comparison = comparison['numeric_comparisons']['employee_count']

    if employee_comparison['your_value'] is not None:
        fig = go.Figure()

        # Add percentile range
        fig.add_trace(go.Bar(
            x=[employee_comparison['peer_p25']],
            y=['Peers'],
            orientation='h',
            marker=dict(color='lightgray'),
            name='P25-P75 Range',
            width=0.5
        ))

        # Add your value marker
        fig.add_trace(go.Scatter(
            x=[employee_comparison['your_value']],
            y=['Peers'],
            mode='markers',
            marker=dict(size=15, color='blue', symbol='diamond'),
            name='Your Plan'
        ))

        # Add peer median line
        fig.add_vline(
            x=employee_comparison['peer_median'],
            line_dash="dash",
            line_color="red",
            annotation_text="Peer Median"
        )

        fig.update_layout(
            height=150,
            showlegend=False,
            xaxis_title="Employees",
            yaxis_title=""
        )

        st.plotly_chart(fig, use_container_width=True)

        rank = employee_comparison['percentile_rank']
        st.info(f"Your Plan: **{employee_comparison['your_value']:,}** ({rank['percentile']}th percentile) - {rank['label']}")

    # Match Effective Rate Comparison
    has_match = target.get('match_formula') is not None
    if has_match:
        st.subheader("Match Effective Rate")
        match_comparison = comparison['numeric_comparisons']['match_effective_rate']

        if match_comparison['your_value'] is not None:
            your_rate = match_comparison['your_value']
            peer_median_rate = match_comparison['peer_median'] if match_comparison['peer_median'] else 0

            col1, col2 = st.columns(2)
            with col1:
                st.metric("Your Match Effective Rate", f"{your_rate:.1f}%")
            with col2:
                st.metric("Peer Median", f"{peer_median_rate:.1f}%")

            rank = match_comparison['percentile_rank']
            st.info(f"Your Rank: {rank['label']} ({rank['percentile']}th percentile)")

    # Auto-Enrollment Rate Comparison
    if target['auto_enrollment_enabled']:
        st.subheader("Auto-Enrollment Default Rate")
        ae_comparison = comparison['numeric_comparisons']['auto_enrollment_default_rate']

        if ae_comparison['your_value'] is not None:
            your_pct = ae_comparison['your_value'] * 100
            peer_median_pct = ae_comparison['peer_median'] * 100 if ae_comparison['peer_median'] else 0

            col1, col2 = st.columns(2)
            with col1:
                st.metric("Your Default Rate", f"{your_pct:.0f}%")
            with col2:
                st.metric("Peer Median", f"{peer_median_pct:.0f}%")

            rank = ae_comparison['percentile_rank']
            st.info(f"Your Rank: {rank['label']} ({rank['percentile']}th percentile)")

    # Feature Adoption
    st.subheader("Feature Adoption")

    adoption = comparison['adoption_comparisons']

    col1, col2 = st.columns(2)

    with col1:
        match_adoption = adoption['match_formula']
        st.metric(
            "Employer Match",
            "Yes" if match_adoption['your_value'] else "No",
            f"{match_adoption['peer_adoption_rate']*100:.0f}% of peers have match"
        )

    with col2:
        ae_adoption = adoption['auto_enrollment_enabled']
        st.metric(
            "Auto-Enrollment",
            "Yes" if ae_adoption['your_value'] else "No",
            f"{ae_adoption['peer_adoption_rate']*100:.0f}% of peers have auto-enrollment"
        )

    st.markdown("---")

    # PowerPoint Generation Section
    st.header("Generate Deliverable")

    if st.button("Generate PowerPoint Deck", type="primary"):
        st.info("🚧 PowerPoint generation will be available in W1-4")
        # TODO: Call generate_powerpoint(selected_client_id) when W1-4 is ready

except Exception as e:
    st.error(f"Error loading peer comparison: {e}")

# Footer
st.markdown("---")
st.caption("PlanWise Design Matrix - Week 1 Demo | Data as of: Manual Entry")
```

---

## Running the Dashboard

```bash
# Install Streamlit
pip install streamlit plotly

# Run the dashboard
streamlit run app.py

# Dashboard will open in browser at http://localhost:8501
```

---

## Testing Checklist

- [ ] All 20 clients appear in dropdown
- [ ] Plan details display correctly for each client
- [ ] Peer cohort size reasonable (typically 5-15 peers with 20 total plans)
- [ ] Charts render correctly (no errors)
- [ ] Percentile labels match expectations (manual spot-check)
- [ ] Dashboard responsive on laptop screen (1920x1080, 1440x900)
- [ ] No errors in console logs
- [ ] Page loads in <3 seconds

---

## Success Metrics

- [ ] Dashboard successfully displays all 20 clients
- [ ] 5 stakeholder demos completed using dashboard
- [ ] User feedback collected on most valuable features
- [ ] No critical bugs encountered during demos

---

## Deliverables

1. **app.py** - Streamlit dashboard application
2. **requirements.txt** - Python dependencies (streamlit, plotly, duckdb)
3. **README_dashboard.md** - Instructions for running dashboard
4. **screenshots/** - Screenshots of dashboard for documentation

---

## User Feedback Questions

During demos, ask:
1. Which comparisons are most useful? (employee count, match effective rate, adoption rates)
2. Is the peer cohort size appropriate?
3. What additional comparisons would you want to see?
4. How would you use this in a client meeting?
5. What would make the PowerPoint output most valuable?

---

## Future Enhancements (Post Week 1)

- Add filters for custom peer cohort selection
- Export peer comparison data to Excel
- Add trend analysis (if historical data available)
- Side-by-side comparison of multiple clients
- Mobile-responsive design
- User authentication and role-based access

---

**Epic Owner:** [Engineer Name]
**Status:** Ready to Start (blocked by W1-2)
**Next Epic:** W1-4 (PowerPoint Generator)