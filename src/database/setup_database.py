#!/usr/bin/env python3
"""
Database Setup Script for PlanWise Design Matrix
Creates DuckDB database with minimal schema for Week 1 MVP
"""

import duckdb
from pathlib import Path
from datetime import datetime


def setup_database(db_path: str = 'data/planwise.db'):
    """
    Initialize DuckDB database with plan_designs table.

    Args:
        db_path: Path to database file (will be created if doesn't exist)
    """

    # Ensure data directory exists
    db_file = Path(db_path)
    db_file.parent.mkdir(parents=True, exist_ok=True)

    print(f"Initializing database at: {db_path}")

    # Connect to DuckDB (creates file if doesn't exist)
    conn = duckdb.connect(db_path)

    # Drop table if exists (for clean slate during development)
    conn.execute("DROP TABLE IF EXISTS plan_designs")

    # Create main table
    conn.execute("""
        CREATE TABLE plan_designs (
            -- Identifiers
            client_id VARCHAR PRIMARY KEY,
            client_name VARCHAR NOT NULL,

            -- Demographics (for peer grouping)
            industry VARCHAR NOT NULL,    -- 'healthcare', 'higher_ed', 'manufacturing', 'other'
            employee_count INTEGER NOT NULL,
            state VARCHAR(2),             -- Two-letter state code (e.g., 'CA', 'NY')

            -- Eligibility
            eligibility VARCHAR,          -- e.g., "Immediate", "1 year", "1000 hours"

            -- Core Plan Provisions (for benchmarking)
            match_formula VARCHAR,        -- Human-readable (e.g., "100% up to 3%", "50% up to 6%")
            match_effective_rate DECIMAL(5,2),  -- Effective match rate as % (e.g., 3.0 for 3%)
            match_eligibility_criteria VARCHAR,  -- Eligibility criteria for match
            match_last_day_work_rule BOOLEAN DEFAULT FALSE,  -- Last day work rule for match
            match_true_up BOOLEAN DEFAULT FALSE,  -- Match true-up enabled
            match_contribution_frequency VARCHAR,  -- e.g., "per pay period", "monthly", "annually"

            -- Non-Elective Contribution
            nonelective_formula VARCHAR,  -- Non-elective contribution formula
            nonelective_eligibility_criteria VARCHAR,  -- Eligibility criteria for non-elective
            nonelective_last_day_work_rule BOOLEAN DEFAULT FALSE,  -- Last day work rule for non-elective
            nonelective_contribution_frequency VARCHAR,  -- e.g., "per pay period", "monthly", "annually"

            -- Auto-Enrollment
            auto_enrollment_enabled BOOLEAN DEFAULT FALSE,
            auto_enrollment_rate DECIMAL(5,2),  -- Default rate as % (e.g., 3.0 for 3%)
            auto_enrollment_effective_year INTEGER,  -- Year auto-enrollment became effective (e.g., 1900 for all employees, 2024 for new hires after 2024)
            auto_escalation_enabled BOOLEAN DEFAULT FALSE,
            auto_escalation_cap DECIMAL(5,2),  -- Auto-escalation cap as % (e.g., 10.0 for 10%)

            -- Vesting
            vesting_schedule VARCHAR,     -- e.g., "Immediate", "3-year cliff", "2-6 graded"

            -- Metadata
            data_source VARCHAR DEFAULT 'ManualEntry',  -- 'ManualEntry', 'Form5500', 'ExcelImport'
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT  -- Any additional context or data quality notes
        )
    """)

    print("✓ Created table: plan_designs")

    # Create indexes for common query patterns
    conn.execute("CREATE INDEX idx_industry ON plan_designs(industry)")
    conn.execute("CREATE INDEX idx_employee_count ON plan_designs(employee_count)")

    print("✓ Created indexes for peer grouping")

    # Verify table creation
    result = conn.execute("""
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'plan_designs'
        ORDER BY ordinal_position
    """).fetchall()

    print(f"\n✓ Table schema verified ({len(result)} columns)")
    print("\nColumn Details:")
    for table, column, dtype in result:
        print(f"  - {column}: {dtype}")

    # Insert sample data for testing
    print("\nInserting sample data for testing...")
    conn.execute("""
        INSERT INTO plan_designs VALUES
        (
            'CLIENT-SAMPLE-001',
            'Sample University',
            'higher_ed',
            2500,
            'CA',
            'Immediate',
            '100% up to 4%',
            4.0,
            'All eligible employees',
            FALSE,
            TRUE,
            'per pay period',
            '3% of compensation',
            'All eligible employees',
            FALSE,
            'annually',
            TRUE,
            3.0,
            1900,
            TRUE,
            10.0,
            'Immediate',
            'ManualEntry',
            CURRENT_TIMESTAMP,
            'Sample data for testing'
        )
    """)

    # Verify insertion
    count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
    print(f"✓ Sample record inserted (total records: {count})")

    # Display sample record
    sample = conn.execute("SELECT * FROM plan_designs LIMIT 1").fetchdf()
    print("\nSample Record:")
    print(sample.to_string())

    conn.close()

    print(f"\n{'='*60}")
    print("✓ Database setup complete!")
    print(f"{'='*60}")
    print(f"Database location: {db_file.absolute()}")
    print(f"Next steps:")
    print(f"  1. Run: python excel_template_generator.py")
    print(f"  2. Fill in Excel template with 20 client plans")
    print(f"  3. Run: python excel_to_duckdb.py")

    return db_path


def verify_database(db_path: str = 'data/planwise.db'):
    """
    Verify database exists and is accessible.

    Args:
        db_path: Path to database file
    """
    db_file = Path(db_path)

    if not db_file.exists():
        print(f"❌ Database not found at: {db_path}")
        return False

    try:
        conn = duckdb.connect(str(db_file))

        # Check table exists
        tables = conn.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'main'
        """).fetchall()

        print(f"✓ Database accessible at: {db_path}")
        print(f"✓ Tables found: {[t[0] for t in tables]}")

        # Get record count
        count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
        print(f"✓ Records in plan_designs: {count}")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False


if __name__ == "__main__":
    print("PlanWise Design Matrix - Database Setup")
    print("=" * 60)

    # Setup database
    db_path = setup_database()

    # Verify it worked
    print("\nVerifying database...")
    verify_database(db_path)