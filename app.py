#!/usr/bin/env python3
"""
PlanWise Design Matrix - Streamlit Dashboard
Interactive peer benchmarking dashboard for retirement plan analysis
"""

import streamlit as st
import sys
from pathlib import Path
import plotly.graph_objects as go

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from peer_benchmarking import generate_peer_comparison
from powerpoint_generator import generate_powerpoint
import duckdb

# Page configuration
st.set_page_config(
    page_title="PlanWise Design Matrix",
    page_icon="📊",
    layout="wide"
)

# Title
st.title("📊 PlanWise Design Matrix")
st.markdown("### Peer Benchmarking Dashboard")
st.markdown("---")

# Connect to database
@st.cache_resource
def get_database_connection():
    return duckdb.connect('data/planwise.db', read_only=True)

try:
    conn = get_database_connection()
except Exception as e:
    st.error(f"❌ Database connection failed: {e}")
    st.info("Please run: python src/database/setup_database.py")
    st.stop()

# Load client list
@st.cache_data
def load_clients():
    try:
        clients = conn.execute("""
            SELECT client_id, client_name
            FROM plan_designs
            ORDER BY client_name
        """).fetchall()
        return [(c[0], c[1]) for c in clients]
    except Exception as e:
        st.error(f"Error loading clients: {e}")
        return []

clients = load_clients()

if not clients:
    st.warning("⚠️ No clients found in database")
    st.info("Please run: python src/database/excel_to_duckdb.py")
    st.stop()

client_options = {f"{name} ({client_id})": client_id for client_id, name in clients}

# Client selection
st.subheader("Select Client")
selected_display = st.selectbox(
    "Choose a client to analyze:",
    options=list(client_options.keys()),
    index=0
)
selected_client_id = client_options[selected_display]

st.markdown("---")

# Generate peer comparison
try:
    with st.spinner("Generating peer comparison..."):
        comparison = generate_peer_comparison(selected_client_id, conn=conn)
        target = comparison['target_client']
        cohort_size = comparison['peer_cohort']['size']

    # Plan Details Section
    st.header("📋 Plan Details")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Client", target['client_name'])
    with col2:
        st.metric("Industry", target['industry'].replace('_', ' ').title())
    with col3:
        st.metric("Employees", f"{target['employee_count']:,}")

    # Match and Auto-Enrollment Details
    st.markdown("")
    col1, col2 = st.columns(2)

    with col1:
        has_match = target.get('match_formula') is not None and target.get('match_formula') != ''
        if has_match:
            match_rate = target.get('match_effective_rate')
            if match_rate is not None:
                st.success(f"✓ **Employer Match:** {match_rate:.1f}% effective rate")
            else:
                st.success(f"✓ **Employer Match:** {target.get('match_formula')}")
        else:
            st.warning("✗ No Employer Match")

    with col2:
        if target.get('auto_enrollment_enabled'):
            ae_rate = target.get('auto_enrollment_rate')
            if ae_rate is not None and ae_rate > 0:
                st.success(f"✓ **Auto-Enrollment:** {ae_rate*100:.0f}% default rate")
            else:
                st.success(f"✓ **Auto-Enrollment:** Enabled")
        else:
            st.warning("✗ No Auto-Enrollment")

    st.markdown("---")

    # Peer Comparison Section
    st.header(f"👥 Peer Comparison (n={cohort_size} peers)")

    if cohort_size == 0:
        st.warning("⚠️ No peer clients found with similar characteristics.")
        st.info("This may be due to unique industry, size, or geographic factors. Consider expanding the peer criteria.")
    elif cohort_size < 5:
        st.warning(f"⚠️ Limited peer data (n={cohort_size}). Results may not be representative.")

    if cohort_size > 0:
        # Employee Count Comparison
        st.subheader("📈 Employee Count")
        employee_comparison = comparison['numeric_comparisons']['employee_count']

        if employee_comparison['your_value'] is not None:
            # Create bullet chart
            fig = go.Figure()

            # Add percentile range bar
            peer_p25 = employee_comparison.get('peer_p25')
            peer_p75 = employee_comparison.get('peer_p75')
            peer_median = employee_comparison.get('peer_median')
            your_value = employee_comparison['your_value']

            if peer_p25 and peer_p75:
                fig.add_trace(go.Bar(
                    x=[peer_p75 - peer_p25],
                    y=[''],
                    orientation='h',
                    marker=dict(color='lightgray'),
                    name='P25-P75 Range',
                    base=peer_p25,
                    showlegend=False
                ))

            # Add your value marker
            fig.add_trace(go.Scatter(
                x=[your_value],
                y=[''],
                mode='markers',
                marker=dict(size=20, color='#1f77b4', symbol='diamond'),
                name='Your Client',
                showlegend=False
            ))

            # Add peer median line
            if peer_median:
                fig.add_shape(
                    type="line",
                    x0=peer_median, x1=peer_median,
                    y0=-0.3, y1=0.3,
                    line=dict(color="red", width=2, dash="dash")
                )
                fig.add_annotation(
                    x=peer_median,
                    y=0.4,
                    text="Peer Median",
                    showarrow=False,
                    font=dict(color="red", size=10)
                )

            fig.update_layout(
                height=200,
                xaxis_title="Number of Employees",
                yaxis_visible=False,
                showlegend=False,
                margin=dict(l=20, r=20, t=40, b=40)
            )

            st.plotly_chart(fig, use_container_width=True)

            rank = employee_comparison['percentile_rank']
            if rank['percentile'] is not None:
                st.info(f"📊 Your Client: **{your_value:,.0f} employees** ({rank['percentile']}th percentile) - **{rank['label']}**")

            # Show peer range
            if peer_p25 and peer_p75:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("25th Percentile", f"{peer_p25:,.0f}")
                with col2:
                    st.metric("Median", f"{peer_median:,.0f}")
                with col3:
                    st.metric("75th Percentile", f"{peer_p75:,.0f}")

        st.markdown("---")

        # Match Effective Rate Comparison
        has_match = target.get('match_formula') is not None and target.get('match_formula') != ''
        if has_match:
            st.subheader("💰 Match Effective Rate")
            match_comparison = comparison['numeric_comparisons'].get('match_effective_rate', {})

            if match_comparison.get('your_value') is not None:
                your_rate = match_comparison['your_value']
                peer_median_rate = match_comparison.get('peer_median', 0)

                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Your Match Rate", f"{your_rate:.1f}%")
                with col2:
                    st.metric("Peer Median", f"{peer_median_rate:.1f}%" if peer_median_rate else "N/A")
                with col3:
                    rank = match_comparison.get('percentile_rank', {})
                    if rank.get('percentile') is not None:
                        st.metric("Your Rank", f"{rank['percentile']:.0f}th %ile")

                rank = match_comparison.get('percentile_rank', {})
                if rank.get('label'):
                    st.info(f"📊 Your Rank: **{rank['label']}**")

            st.markdown("---")

        # Auto-Enrollment Rate Comparison
        if target.get('auto_enrollment_enabled'):
            st.subheader("🎯 Auto-Enrollment Default Rate")
            ae_comparison = comparison['numeric_comparisons'].get('auto_enrollment_rate', {})

            if ae_comparison.get('your_value') is not None:
                your_pct = ae_comparison['your_value'] * 100
                peer_median_pct = ae_comparison.get('peer_median', 0)
                if peer_median_pct:
                    peer_median_pct = peer_median_pct * 100

                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Your Default Rate", f"{your_pct:.1f}%")
                with col2:
                    st.metric("Peer Median", f"{peer_median_pct:.1f}%" if peer_median_pct else "N/A")
                with col3:
                    rank = ae_comparison.get('percentile_rank', {})
                    if rank.get('percentile') is not None:
                        st.metric("Your Rank", f"{rank['percentile']:.0f}th %ile")

                rank = ae_comparison.get('percentile_rank', {})
                if rank.get('label'):
                    st.info(f"📊 Your Rank: **{rank['label']}**")

            st.markdown("---")

        # Feature Adoption
        st.subheader("✅ Feature Adoption Rates")

        adoption = comparison['adoption_comparisons']

        col1, col2 = st.columns(2)

        with col1:
            ae_adoption = adoption.get('auto_enrollment_enabled', {})
            your_ae = "Yes" if ae_adoption.get('your_value') else "No"
            peer_ae_rate = ae_adoption.get('peer_adoption_rate', 0) * 100
            st.metric(
                "Auto-Enrollment",
                your_ae,
                f"{peer_ae_rate:.0f}% of peers have this",
                delta_color="normal" if ae_adoption.get('your_value') else "inverse"
            )

        with col2:
            aesc_adoption = adoption.get('auto_escalation_enabled', {})
            your_aesc = "Yes" if aesc_adoption.get('your_value') else "No"
            peer_aesc_rate = aesc_adoption.get('peer_adoption_rate', 0) * 100
            st.metric(
                "Auto-Escalation",
                your_aesc,
                f"{peer_aesc_rate:.0f}% of peers have this",
                delta_color="normal" if aesc_adoption.get('your_value') else "inverse"
            )

        col1, col2 = st.columns(2)

        with col1:
            trueup_adoption = adoption.get('match_true_up', {})
            your_trueup = "Yes" if trueup_adoption.get('your_value') else "No"
            peer_trueup_rate = trueup_adoption.get('peer_adoption_rate', 0) * 100
            st.metric(
                "Match True-Up",
                your_trueup,
                f"{peer_trueup_rate:.0f}% of peers have this",
                delta_color="normal" if trueup_adoption.get('your_value') else "inverse"
            )

        with col2:
            ldw_adoption = adoption.get('match_last_day_work_rule', {})
            your_ldw = "Yes" if ldw_adoption.get('your_value') else "No"
            peer_ldw_rate = ldw_adoption.get('peer_adoption_rate', 0) * 100
            st.metric(
                "Match Last Day Work Rule",
                your_ldw,
                f"{peer_ldw_rate:.0f}% of peers have this",
                delta_color="inverse" if ldw_adoption.get('your_value') else "normal"
            )

    st.markdown("---")

    # PowerPoint Generation Section
    st.header("📄 Generate Deliverable")

    col1, col2 = st.columns([2, 1])

    with col1:
        if st.button("🎯 Generate PowerPoint Deck", type="primary", use_container_width=True):
            try:
                with st.spinner("Generating PowerPoint deck..."):
                    filepath = generate_powerpoint(selected_client_id)

                # Read the file for download
                with open(filepath, "rb") as file:
                    st.download_button(
                        label="📥 Download PowerPoint",
                        data=file,
                        file_name=Path(filepath).name,
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        type="primary",
                        use_container_width=True
                    )
                st.success(f"✅ PowerPoint generated successfully!")
            except Exception as e:
                st.error(f"❌ Error generating PowerPoint: {e}")

    with col2:
        if st.button("📥 Export Data to Excel", use_container_width=True):
            st.info("🚧 Excel export will be available in future release")

except Exception as e:
    st.error(f"❌ Error loading peer comparison: {e}")
    import traceback
    with st.expander("Show error details"):
        st.code(traceback.format_exc())

# Footer
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col1:
    st.caption(f"📊 Total Clients: {len(clients)}")
with col2:
    st.caption(f"🔄 Last Updated: {target.get('last_updated', 'N/A')}" if 'target' in locals() else "")
with col3:
    st.caption("🏢 PlanWise Design Matrix v1.0")