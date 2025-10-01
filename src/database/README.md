# PlanWise Design Matrix - Database Setup (Week 1 MVP)

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup database
python setup_database.py

# 3. Generate Excel template
python excel_template_generator.py

# 4. Fill in Excel template with 20 client plans
# (Open data/plan_data_template.xlsx and enter data starting in Row 4)

# 5. Import data to database
python excel_to_duckdb.py

# 6. Test everything works
python test_database.py
```

## Files Overview

### Setup Scripts
- **setup_database.py** - Creates DuckDB database with schema
- **excel_template_generator.py** - Creates Excel template for manual data entry
- **excel_to_duckdb.py** - Imports Excel data to DuckDB
- **test_database.py** - Validates database and runs sample queries

### Data Files (Generated)
- **data/planwise.db** - DuckDB database file
- **data/plan_data_template.xlsx** - Excel template for manual entry

## Database Schema

```sql
CREATE TABLE plan_designs (
    -- Identifiers
    plan_id VARCHAR PRIMARY KEY,
    client_name VARCHAR NOT NULL,
    plan_name VARCHAR,

    -- Demographics (for peer grouping)
    plan_type VARCHAR NOT NULL,      -- '401k', '403b', '457b'
    industry VARCHAR NOT NULL,        -- 'healthcare', 'higher_ed', 'manufacturing', 'other'
    employee_count INTEGER NOT NULL,
    state VARCHAR(2),

    -- Core Plan Provisions (for benchmarking)
    match_formula VARCHAR,            -- e.g., "100% up to 3%"
    match_effective_rate DECIMAL(5,2),-- e.g., 3.0 for 3%
    auto_enrollment_enabled BOOLEAN,
    auto_enrollment_rate DECIMAL(5,2),-- e.g., 3.0 for 3%
    vesting_schedule VARCHAR,         -- e.g., "Immediate", "3-year cliff"
    participation_rate DECIMAL(5,2),  -- % of eligible employees
    avg_deferral_rate DECIMAL(5,2),   -- Average deferral %

    -- Metadata
    data_source VARCHAR,
    last_updated TIMESTAMP,
    notes TEXT
);
```

## Excel Template Guide

The Excel template has 3 sheets:

1. **Plan Data** - Main data entry sheet
   - Row 1: Column headers
   - Row 2: Field descriptions
   - Row 3: Example row
   - Row 4+: Your data (20 clients)

2. **Instructions** - Step-by-step guide

3. **Field Reference** - Detailed field descriptions

### Required Fields
- plan_id (must be unique)
- client_name
- plan_type (401k, 403b, or 457b)
- industry (healthcare, higher_ed, manufacturing, or other)
- employee_count
- auto_enrollment_enabled (Yes or No)
- data_source (default: ManualEntry)

### Optional Fields
- plan_name
- state
- match_formula
- match_effective_rate
- auto_enrollment_rate (required if auto_enrollment_enabled = Yes)
- vesting_schedule
- participation_rate
- avg_deferral_rate
- notes

## Sample Data Entry

| plan_id | client_name | plan_type | industry | employee_count | match_formula | match_effective_rate | auto_enrollment_enabled | auto_enrollment_rate |
|---------|-------------|-----------|----------|----------------|---------------|---------------------|------------------------|---------------------|
| PLAN-001 | ABC University | 403b | higher_ed | 2500 | 100% up to 4% | 4.0 | Yes | 3.0 |
| PLAN-002 | XYZ Hospital | 401k | healthcare | 5000 | 50% up to 6% | 3.0 | Yes | 4.0 |
| PLAN-003 | Acme Manufacturing | 401k | manufacturing | 800 | 100% up to 3% | 3.0 | No | |

## Testing

After importing data, run:

```bash
python test_database.py
```

This validates:
- ✓ Database connection
- ✓ Record count
- ✓ Sample queries
- ✓ Peer cohort selection
- ✓ Percentile calculations

## Troubleshooting

### Database not found
```bash
# Run setup first
python setup_database.py
```

### Excel file not found
```bash
# Generate template first
python excel_template_generator.py
```

### Import validation errors
- Check required fields are filled
- Verify plan_type values (401k, 403b, 457b)
- Verify industry values (healthcare, higher_ed, manufacturing, other)
- Ensure auto_enrollment_rate is filled when auto_enrollment_enabled = Yes

## Next Steps

Once database is ready (20 clients loaded):
1. Build peer benchmarking engine (W1-2)
2. Create Streamlit dashboard (W1-3)
3. Generate PowerPoint decks (W1-4)
4. Demo to stakeholders (W1-5)

## Data Entry Tips

### Where to find data (Form 5500):
- **Plan Type**: Schedule R, Line 2
- **Employee Count**: Schedule R, Part II
- **Match Formula**: Schedule R, Part III
- **Auto-Enrollment**: Schedule R, Line 8a
- **Participation Rate**: Calculated from Schedule H/I

### Typical values:
- **Match formulas**: "100% up to 3%", "50% up to 6%", "100% up to 4%"
- **Match effective rates**: 3.0%, 4.0%, 3.5%
- **Auto-enrollment rates**: 3.0%, 4.0%, 5.0%, 6.0%
- **Vesting**: "Immediate", "3-year cliff", "2-6 graded"

### Pattern documentation:
As you extract data, note:
- Which fields are easy to find (consistent location)
- Which fields require interpretation
- Common patterns by recordkeeper
- Edge cases or non-standard provisions

This documentation will inform automation in Epic E01.

---

**Questions?** Check the epic document: `docs/epics/W1-1_Database_Manual_Data_Loading.md`