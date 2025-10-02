# Epic W1-1: Database & Manual Data Loading

**Epic ID:** W1-1
**Epic Name:** Database & Manual Data Loading (Manual MVP Foundation)
**Priority:** Critical - Week 1 Foundation
**Estimated Effort:** 1 day
**Phase:** Week 1 - Prove the Concept
**Dependencies:** None - this is the starting point

---

## Epic Summary

Set up DuckDB with a minimal schema and create an Excel-based manual data entry workflow to load 20 real client plans into the database. This establishes the data foundation for all Week 1 deliverables without waiting for extraction automation.

**Key Principle:** Prove value with manual data TODAY, automate LATER.

## Business Value

- **Immediate:** Get real client data into queryable database within hours
- **Foundation:** Enable peer benchmarking, dashboard, and PowerPoint generation this week
- **Learning:** Document patterns during manual extraction to inform future automation
- **Risk Reduction:** Validate schema and data model with real data before building complex systems

## User Story

**As a** Platform Engineer
**I want** to manually load 20 client plans into DuckDB from Excel templates
**So that** we can demonstrate peer benchmarking value this week without waiting for extraction automation

---

## Acceptance Criteria

### Database Setup
- [ ] DuckDB installed and initialized with plans.db file
- [ ] Schema created with 15 core fields (minimal viable schema)
- [ ] Connection tested from Python script
- [ ] Data types validated (integers, decimals, text, booleans)

### Excel Template
- [ ] Excel template created with 15 columns matching schema
- [ ] Column headers clearly labeled with descriptions
- [ ] Data validation rules in Excel (dropdowns for enums, number ranges)
- [ ] Example row filled in as reference
- [ ] Template documented with instructions

### Manual Data Entry
- [ ] 20 high-priority clients identified for manual extraction
- [ ] Form 5500 documents gathered for 20 clients
- [ ] Manual extraction completed (15 fields × 20 clients = 300 data points)
- [ ] Data entered into Excel template with quality checks

### Import Script
- [ ] Python script: excel_to_duckdb.py reads Excel file
- [ ] Data validation before import (type checks, required fields)
- [ ] Error handling with clear messages
- [ ] Script successfully imports all 20 clients
- [ ] Verification query confirms 20 records in database

### Testing & Validation
- [ ] Test queries run successfully (SELECT, WHERE, GROUP BY)
- [ ] Sample peer cohort query returns expected results
- [ ] Data quality spot-checks (no nulls in required fields, values in expected ranges)
- [ ] Documentation: Which fields were easy vs. hard to extract manually

---

## Minimal Schema (15 Core Fields)

```sql
CREATE TABLE clients (
    -- Identifiers
    client_id VARCHAR PRIMARY KEY,
    client_name VARCHAR NOT NULL,
    plan_sponsor_name VARCHAR NOT NULL,

    -- Demographics (for peer grouping)
    industry VARCHAR NOT NULL,    -- NAICS 2-digit code
    total_participants INTEGER NOT NULL,
    total_assets DECIMAL(15,2) NOT NULL,

    -- Core Plan Features (for benchmarking)
    eligibility VARCHAR,          -- e.g., "Immediate", "1 year", "1000 hours"
    has_match BOOLEAN,
    match_rate DECIMAL(5,4),      -- e.g., 0.50 for 50%
    match_cap DECIMAL(5,4),       -- e.g., 0.06 for 6%
    match_eligibility_criteria VARCHAR,
    match_last_day_work_rule BOOLEAN,
    match_true_up BOOLEAN,
    match_contribution_frequency VARCHAR,
    has_auto_enrollment BOOLEAN,
    auto_enrollment_rate DECIMAL(5,4),  -- e.g., 0.03 for 3%
    auto_enrollment_effective_year INTEGER,  -- 1900 = all employees
    auto_escalation_enabled BOOLEAN,
    auto_escalation_cap DECIMAL(5,4),
    nonelective_formula VARCHAR,
    nonelective_eligibility_criteria VARCHAR,
    nonelective_last_day_work_rule BOOLEAN,
    nonelective_contribution_frequency VARCHAR,
    vesting_type VARCHAR,         -- 'immediate', 'cliff', 'graded'

    -- Metadata
    data_source VARCHAR DEFAULT 'ManualEntry',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Excel Template Structure

| Column | Field Name | Data Type | Example | Required | Notes |
|--------|-----------|-----------|---------|----------|-------|
| A | client_id | Text | CLIENT-001 | Yes | Unique identifier |
| B | client_name | Text | ABC Corporation | Yes | Client name |
| C | plan_sponsor_name | Text | ABC Corporation | Yes | Company name |
| D | industry | Text | 611 | Yes | NAICS 2-digit code |
| E | total_participants | Number | 2400 | Yes | Total participant count |
| F | total_assets | Number | 125000000 | Yes | Total plan assets ($) |
| G | eligibility | Text | Immediate | No | e.g., "Immediate", "1 year", "1000 hours" |
| H | has_match | Dropdown | Yes | Yes | Options: Yes, No |
| I | match_rate | Number | 0.50 | No | 50% = 0.50 |
| J | match_cap | Number | 0.06 | No | 6% of pay = 0.06 |
| K | match_eligibility_criteria | Text | Immediate | No | Eligibility for match |
| L | match_last_day_work_rule | Dropdown | No | No | Options: Yes, No |
| M | match_true_up | Dropdown | Yes | No | Options: Yes, No |
| N | match_contribution_frequency | Text | Per pay period | No | Frequency of match |
| O | has_auto_enrollment | Dropdown | Yes | Yes | Options: Yes, No |
| P | auto_enrollment_rate | Number | 0.03 | No | 3% = 0.03 |
| Q | auto_enrollment_effective_year | Number | 1900 | No | 1900 = all employees |
| R | auto_escalation_enabled | Dropdown | Yes | No | Options: Yes, No |
| S | auto_escalation_cap | Number | 0.15 | No | 15% = 0.15 |
| T | nonelective_formula | Text | 3% of compensation | No | Non-elective formula |
| U | nonelective_eligibility_criteria | Text | 1 year | No | Eligibility for non-elective |
| V | nonelective_last_day_work_rule | Dropdown | No | No | Options: Yes, No |
| W | nonelective_contribution_frequency | Text | Annually | No | Frequency |
| X | vesting_type | Dropdown | immediate | No | Options: immediate, cliff, graded |
| Y | data_source | Text | ManualEntry | Yes | Always "ManualEntry" for now |
| Z | notes | Text | From 2023 Form 5500 | No | Any extraction notes |

---

## Implementation Tasks

### Task 1: Database Setup (30 minutes)
```bash
# Install DuckDB
pip install duckdb

# Create database and schema
python setup_database.py
```

```python
# setup_database.py
import duckdb

conn = duckdb.connect('plans.db')
conn.execute('''
    CREATE TABLE plans (
        plan_id VARCHAR PRIMARY KEY,
        plan_name VARCHAR NOT NULL,
        plan_sponsor_name VARCHAR NOT NULL,
        plan_type VARCHAR NOT NULL,
        industry VARCHAR NOT NULL,
        total_participants INTEGER NOT NULL,
        total_assets DECIMAL(15,2) NOT NULL,
        has_match BOOLEAN,
        match_rate DECIMAL(5,4),
        match_cap DECIMAL(5,4),
        has_auto_enrollment BOOLEAN,
        auto_enrollment_rate DECIMAL(5,4),
        vesting_type VARCHAR,
        data_source VARCHAR DEFAULT 'ManualEntry',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')
print("Database initialized successfully")
conn.close()
```

### Task 2: Create Excel Template (30 minutes)
- Open Excel/Google Sheets
- Create headers with descriptions in row 1
- Add data validation dropdowns for plan_type, has_match, has_auto_enrollment, vesting_type
- Fill example row with realistic data
- Save as `plan_data_template.xlsx`
- Document extraction instructions

### Task 3: Manual Extraction (4-5 hours)
- Gather Form 5500s for 20 high-priority clients
- Extract 15 fields per client into Excel template
- Quality check: Required fields filled, values in valid ranges
- Document any patterns noticed (for future automation)
- Note which fields were easy vs. difficult to extract

### Task 4: Import Script (1 hour)
```python
# excel_to_duckdb.py
import duckdb
import pandas as pd
from pathlib import Path

def import_excel_to_duckdb(excel_path: str, db_path: str = 'plans.db'):
    """Import plan data from Excel template to DuckDB"""

    # Read Excel file
    df = pd.read_excel(excel_path)

    # Data validation
    required_fields = ['plan_id', 'plan_name', 'plan_sponsor_name',
                       'plan_type', 'industry', 'total_participants',
                       'total_assets']

    for field in required_fields:
        if df[field].isnull().any():
            raise ValueError(f"Required field '{field}' has missing values")

    # Type conversions
    df['has_match'] = df['has_match'].map({'Yes': True, 'No': False})
    df['has_auto_enrollment'] = df['has_auto_enrollment'].map({'Yes': True, 'No': False})

    # Connect to DuckDB
    conn = duckdb.connect(db_path)

    # Insert data
    conn.execute("DELETE FROM plans")  # Clear existing data
    conn.register('df_plans', df)
    conn.execute("INSERT INTO plans SELECT * FROM df_plans")

    # Verify
    count = conn.execute("SELECT COUNT(*) FROM plans").fetchone()[0]
    print(f"Successfully imported {count} plans")

    conn.close()

if __name__ == "__main__":
    import_excel_to_duckdb('plan_data_template.xlsx')
```

### Task 5: Testing & Validation (30 minutes)
```python
# test_database.py
import duckdb

conn = duckdb.connect('plans.db')

# Test 1: Count records
print("Total plans:", conn.execute("SELECT COUNT(*) FROM plans").fetchone()[0])

# Test 2: Sample query
print("\nSample plans:")
print(conn.execute("SELECT plan_name, plan_type, total_participants FROM plans LIMIT 5").df())

# Test 3: Peer cohort simulation (401k plans with 1000-3000 participants)
print("\nSample peer cohort:")
print(conn.execute("""
    SELECT plan_name, total_participants, has_match, has_auto_enrollment
    FROM plans
    WHERE plan_type = '401k'
      AND total_participants BETWEEN 1000 AND 3000
""").df())

# Test 4: Calculate percentiles
print("\nParticipant count percentiles:")
print(conn.execute("""
    SELECT
        percentile_cont(0.25) WITHIN GROUP (ORDER BY total_participants) as p25,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY total_participants) as p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY total_participants) as p75
    FROM plans
""").df())

conn.close()
```

---

## Success Metrics

- [ ] 20 clients loaded into database within 6 hours
- [ ] All test queries execute successfully
- [ ] Zero data quality issues (no nulls in required fields)
- [ ] Pattern documentation completed (easy vs. hard fields identified)
- [ ] Ready for W1-2 peer benchmarking development

---

## Deliverables

1. **plans.db** - DuckDB database file with 20 client records
2. **plan_data_template.xlsx** - Reusable Excel template for future manual entry
3. **setup_database.py** - Database initialization script
4. **excel_to_duckdb.py** - Import script
5. **test_database.py** - Validation script
6. **extraction_notes.md** - Documentation of manual extraction patterns

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Manual extraction takes longer than expected | High | Start with 10 clients if time-constrained; add 10 more later |
| Data quality issues in manual entry | Medium | Excel data validation; Python validation script |
| Schema changes needed after testing | Low | Keep schema minimal (15 fields); easier to modify |
| Form 5500s not readily available | Medium | Prioritize clients with easily accessible documents |

---

## Notes for Future Automation

During manual extraction, document:
- Which fields are always in the same location (easy automation)
- Which fields require interpretation (need human review)
- Common patterns by recordkeeper (Fidelity, Vanguard, etc.)
- Edge cases and non-standard provisions

This becomes your pattern library for Epic E01 (Document Intelligence Engine).

---

**Epic Owner:** [Engineer Name]
**Status:** Ready to Start
**Next Epic:** W1-2 (Peer Benchmarking Engine)