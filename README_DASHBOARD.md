# PlanWise Design Matrix - Dashboard Guide

## Quick Start

### Run the Dashboard

```bash
# From the project root directory
streamlit run app.py
```

The dashboard will automatically open in your browser at `http://localhost:8501`

## Features

### 📋 Plan Details
- Client name and industry classification
- Employee count
- Match and auto-enrollment status

### 👥 Peer Comparison
- **Employee Count Analysis** - See how your client compares to similar organizations
- **Match Effective Rate** - Compare employer match rates
- **Auto-Enrollment Rate** - Compare default enrollment rates
- **Feature Adoption** - See what % of peers have key features

### 📊 Interactive Charts
- Percentile ranking visualizations
- Peer distribution ranges (P25, Median, P75)
- Color-coded status indicators

## Navigation

1. **Select a Client** - Choose from the dropdown at the top
2. **Review Plan Details** - See key client information
3. **Analyze Peer Comparison** - View statistical comparisons with similar plans
4. **Generate Deliverables** - (Coming in W1-4)

## Data Quality Indicators

- ⚠️ **Limited Peer Data** - Fewer than 5 peers found
- 📊 **Percentile Rankings** - Shows where client stands vs. peers
- ✓ **Feature Present** - Green indicators for enabled features
- ✗ **Feature Absent** - Yellow indicators for missing features

## Troubleshooting

### Dashboard won't load
```bash
# Check database exists
ls data/planwise.db

# If missing, run:
python src/database/setup_database.py
python src/database/excel_to_duckdb.py
```

### No clients in dropdown
```bash
# Import your client data
python src/database/excel_to_duckdb.py
```

### Charts not displaying
- Ensure you have peers in the same industry
- Check that employee_count is within ±50% range

## Technical Details

### Dependencies
- **Streamlit** 1.29+ - Web app framework
- **Plotly** 5.18+ - Interactive charts
- **DuckDB** 0.9+ - Analytics database
- **NumPy** 1.25+ - Statistical calculations

### Performance
- Typical load time: < 2 seconds
- Peer comparison calculation: < 1 second
- Chart rendering: Instant

### Data Refresh
- Database: Read-only connection
- Caching: Client list cached for session
- Real-time: Peer comparisons generated on selection

## Next Steps

After exploring the dashboard:
1. ✅ Test with all your clients
2. ✅ Validate peer cohort quality
3. ✅ Collect user feedback
4. 🚧 Generate PowerPoint deliverables (W1-4)

## Support

For issues or questions:
- Check the main README.md
- Review CLAUDE.md for project context
- See docs/PRD v1.0.md for full specification