#!/usr/bin/env python3
"""
Excel to DuckDB Import Script
Loads manually-entered plan data from Excel template into DuckDB database
"""

import duckdb
import pandas as pd
from pathlib import Path
from datetime import datetime


def validate_data(df: pd.DataFrame) -> tuple[bool, list[str]]:
    """
    Validate data before importing to database.

    Returns:
        (is_valid, list_of_errors)
    """
    errors = []

    # Required fields
    required_fields = [
        'client_id',
        'client_name',
        'industry',
        'employee_count',
        'auto_enrollment_enabled',
        'data_source'
    ]

    # Check required fields are present
    for field in required_fields:
        if field not in df.columns:
            errors.append(f"Missing required column: {field}")
            return False, errors

    # Check for missing values in required fields
    for field in required_fields:
        missing_count = df[field].isnull().sum()
        if missing_count > 0:
            missing_rows = df[df[field].isnull()].index.tolist()
            errors.append(f"Field '{field}' has {missing_count} missing values in rows: {missing_rows}")

    # Validate client_id uniqueness
    if df['client_id'].duplicated().any():
        duplicates = df[df['client_id'].duplicated()]['client_id'].tolist()
        errors.append(f"Duplicate client_ids found: {duplicates}")

    # Validate industry values
    valid_industries = ['healthcare', 'higher_ed', 'manufacturing', 'other']
    invalid_industries = df[~df['industry'].isin(valid_industries)]['industry'].unique()
    if len(invalid_industries) > 0:
        errors.append(f"Invalid industry values: {invalid_industries}. Must be one of: {valid_industries}")

    # Validate auto_enrollment_enabled
    valid_ae_values = ['Yes', 'No', True, False]
    invalid_ae = df[~df['auto_enrollment_enabled'].isin(valid_ae_values)]['auto_enrollment_enabled'].unique()
    if len(invalid_ae) > 0:
        errors.append(f"Invalid auto_enrollment_enabled values: {invalid_ae}. Must be 'Yes' or 'No'")

    # Validate auto_enrollment_rate is present when auto_enrollment_enabled = Yes
    ae_enabled = df[df['auto_enrollment_enabled'].isin(['Yes', True])]
    ae_missing_rate = ae_enabled[ae_enabled['auto_enrollment_rate'].isnull()]
    if not ae_missing_rate.empty:
        missing_rows = ae_missing_rate.index.tolist()
        errors.append(f"auto_enrollment_rate is required when auto_enrollment_enabled = Yes. Missing in rows: {missing_rows}")

    # Validate auto_enrollment_effective_year is present when auto_enrollment_enabled = Yes
    ae_missing_year = ae_enabled[ae_enabled['auto_enrollment_effective_year'].isnull()]
    if not ae_missing_year.empty:
        missing_rows = ae_missing_year.index.tolist()
        errors.append(f"auto_enrollment_effective_year is required when auto_enrollment_enabled = Yes. Missing in rows: {missing_rows}")

    # Validate auto_escalation_cap is present when auto_escalation_enabled = Yes
    if 'auto_escalation_enabled' in df.columns:
        aesc_enabled = df[df['auto_escalation_enabled'].isin(['Yes', True])]
        if 'auto_escalation_cap' in df.columns:
            aesc_missing_cap = aesc_enabled[aesc_enabled['auto_escalation_cap'].isnull()]
            if not aesc_missing_cap.empty:
                missing_rows = aesc_missing_cap.index.tolist()
                errors.append(f"auto_escalation_cap is required when auto_escalation_enabled = Yes. Missing in rows: {missing_rows}")

    # Validate numeric fields are numeric
    numeric_fields = [
        'employee_count',
        'match_effective_rate',
        'auto_enrollment_rate',
        'auto_enrollment_effective_year',
        'auto_escalation_cap'
    ]

    for field in numeric_fields:
        if field in df.columns:
            # Try to convert to numeric, see if any fail
            try:
                pd.to_numeric(df[field], errors='coerce')
                invalid_count = df[field].notna() & pd.to_numeric(df[field], errors='coerce').isna()
                if invalid_count.any():
                    invalid_rows = df[invalid_count].index.tolist()
                    errors.append(f"Field '{field}' contains non-numeric values in rows: {invalid_rows}")
            except Exception as e:
                errors.append(f"Error validating numeric field '{field}': {e}")

    # Check for negative values in numeric fields (should be positive)
    positive_fields = ['employee_count', 'match_effective_rate', 'auto_enrollment_rate',
                      'auto_escalation_cap']

    for field in positive_fields:
        if field in df.columns:
            # Convert to numeric first, then check for negatives (ignoring NaN)
            numeric_values = pd.to_numeric(df[field], errors='coerce')
            negative_mask = (numeric_values < 0) & (numeric_values.notna())
            if negative_mask.any():
                negative_rows = df[negative_mask].index.tolist()
                errors.append(f"Field '{field}' contains negative values in rows: {negative_rows}")

    is_valid = len(errors) == 0
    return is_valid, errors


def import_excel_to_duckdb(
    excel_path: str = 'data/plan_data_template.xlsx',
    db_path: str = 'data/planwise.db',
    sheet_name: str = 'Plan Data',
    skip_rows: list = [1, 2]  # Skip description row (row 2) and example row (row 3), but keep header (row 1)
):
    """
    Import plan data from Excel template to DuckDB.

    Args:
        excel_path: Path to Excel file with plan data
        db_path: Path to DuckDB database
        sheet_name: Name of sheet containing data
        skip_rows: Rows to skip (list of row indices: [1, 2] = skip rows 2 and 3, keep row 1 as header)
    """

    excel_file = Path(excel_path)
    db_file = Path(db_path)

    print("PlanWise Design Matrix - Excel to DuckDB Import")
    print("=" * 60)

    # Check files exist
    if not excel_file.exists():
        print(f"❌ Excel file not found: {excel_path}")
        print(f"   Run: python excel_template_generator.py first")
        return False

    if not db_file.exists():
        print(f"❌ Database not found: {db_path}")
        print(f"   Run: python setup_database.py first")
        return False

    # Read Excel file
    print(f"\nReading Excel file: {excel_file.name}")
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet_name, skiprows=skip_rows)
        print(f"✓ Read {len(df)} rows from Excel")
    except Exception as e:
        print(f"❌ Error reading Excel file: {e}")
        return False

    # Remove completely empty rows
    df = df.dropna(how='all')
    print(f"✓ After removing empty rows: {len(df)} records")

    if len(df) == 0:
        print("❌ No data found in Excel file (all rows are empty)")
        return False

    # Show column names
    print(f"\nColumns found: {df.columns.tolist()}")

    # Validate data
    print("\nValidating data...")
    is_valid, errors = validate_data(df)

    if not is_valid:
        print("❌ Data validation failed:")
        for error in errors:
            print(f"   • {error}")
        return False

    print("✓ Data validation passed")

    # Data transformations
    print("\nTransforming data...")

    # Convert boolean fields from Yes/No to True/False
    boolean_fields = [
        'auto_enrollment_enabled',
        'auto_escalation_enabled',
        'match_last_day_work_rule',
        'match_true_up',
        'nonelective_last_day_work_rule'
    ]

    for field in boolean_fields:
        if field in df.columns:
            df[field] = df[field].map({
                'Yes': True,
                'No': False,
                True: True,
                False: False
            })

    # Set auto_enrollment_rate and auto_enrollment_effective_year to NULL where auto_enrollment_enabled = False
    df.loc[df['auto_enrollment_enabled'] == False, 'auto_enrollment_rate'] = None
    df.loc[df['auto_enrollment_enabled'] == False, 'auto_enrollment_effective_year'] = None

    # Set auto_escalation_cap to NULL where auto_escalation_enabled = False
    if 'auto_escalation_enabled' in df.columns and 'auto_escalation_cap' in df.columns:
        df.loc[df['auto_escalation_enabled'] == False, 'auto_escalation_cap'] = None

    # Ensure employee_count is integer
    df['employee_count'] = df['employee_count'].astype(int)

    # Ensure auto_enrollment_effective_year is integer where present
    if 'auto_enrollment_effective_year' in df.columns:
        df['auto_enrollment_effective_year'] = pd.to_numeric(df['auto_enrollment_effective_year'], errors='coerce')
        df['auto_enrollment_effective_year'] = df['auto_enrollment_effective_year'].astype('Int64')

    # Set data_source default if missing
    if 'data_source' not in df.columns or df['data_source'].isnull().all():
        df['data_source'] = 'ManualEntry'

    # Add last_updated timestamp
    df['last_updated'] = datetime.now()

    print("✓ Data transformations complete")

    # Connect to database
    print(f"\nConnecting to database: {db_path}")
    try:
        conn = duckdb.connect(str(db_path))
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

    # Check current record count
    current_count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
    print(f"✓ Current records in database: {current_count}")

    # Option to clear existing data
    if current_count > 0:
        print(f"\n⚠️  Database contains {current_count} existing records")
        print("   Options:")
        print("   1. Replace all (DELETE existing + INSERT new)")
        print("   2. Append new (INSERT new records, skip duplicates)")
        print("   3. Cancel import")

        choice = input("\nEnter choice (1/2/3): ").strip()

        if choice == '1':
            print("Deleting existing records...")
            conn.execute("DELETE FROM plan_designs")
            print("✓ Existing records deleted")
        elif choice == '2':
            print("Will append new records (skip duplicates)")
            # Filter out duplicate client_ids
            existing_ids = conn.execute("SELECT client_id FROM plan_designs").fetchdf()['client_id'].tolist()
            df_original_count = len(df)
            df = df[~df['client_id'].isin(existing_ids)]
            skipped = df_original_count - len(df)
            if skipped > 0:
                print(f"✓ Skipping {skipped} duplicate client_ids")
            if len(df) == 0:
                print("❌ No new records to import (all client_ids already exist)")
                conn.close()
                return False
        elif choice == '3':
            print("Import cancelled")
            conn.close()
            return False
        else:
            print("Invalid choice. Import cancelled.")
            conn.close()
            return False

    # Insert data
    print(f"\nInserting {len(df)} records...")
    try:
        # Register DataFrame as temporary view
        conn.register('df_import', df)

        # Insert from DataFrame with explicit column mapping
        conn.execute("""
            INSERT INTO plan_designs (
                client_id, client_name, industry, employee_count, state,
                eligibility, match_formula, match_effective_rate, match_eligibility_criteria,
                match_last_day_work_rule, match_true_up, match_contribution_frequency,
                nonelective_formula, nonelective_eligibility_criteria,
                nonelective_last_day_work_rule, nonelective_contribution_frequency,
                auto_enrollment_enabled, auto_enrollment_rate, auto_enrollment_effective_year,
                auto_escalation_enabled, auto_escalation_cap, vesting_schedule,
                data_source, last_updated, notes
            )
            SELECT
                client_id, client_name, industry, employee_count, state,
                eligibility, match_formula, match_effective_rate, match_eligibility_criteria,
                match_last_day_work_rule, match_true_up, match_contribution_frequency,
                nonelective_formula, nonelective_eligibility_criteria,
                nonelective_last_day_work_rule, nonelective_contribution_frequency,
                auto_enrollment_enabled, auto_enrollment_rate, auto_enrollment_effective_year,
                auto_escalation_enabled, auto_escalation_cap, vesting_schedule,
                data_source, last_updated, notes
            FROM df_import
        """)

        # Verify insertion
        new_count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
        inserted = new_count - current_count

        print(f"✓ Successfully inserted {inserted} records")
        print(f"✓ Total records in database: {new_count}")

    except Exception as e:
        print(f"❌ Insert failed: {e}")
        conn.close()
        return False

    # Display sample of imported data
    print("\nSample of imported data:")
    sample = conn.execute("""
        SELECT client_id, client_name, industry, employee_count, has_match, has_auto_enrollment
        FROM (
            SELECT
                client_id,
                client_name,
                industry,
                employee_count,
                CASE WHEN match_formula IS NOT NULL THEN TRUE ELSE FALSE END as has_match,
                auto_enrollment_enabled as has_auto_enrollment
            FROM plan_designs
            ORDER BY last_updated DESC
            LIMIT 5
        )
    """).fetchdf()
    print(sample.to_string(index=False))

    # Generate summary statistics
    print("\n" + "="*60)
    print("IMPORT SUMMARY")
    print("="*60)

    stats = conn.execute("""
        SELECT
            COUNT(*) as total_plans,
            COUNT(DISTINCT industry) as unique_industries,
            AVG(employee_count) as avg_employees,
            SUM(CASE WHEN match_formula IS NOT NULL THEN 1 ELSE 0 END) as plans_with_match,
            SUM(CASE WHEN nonelective_formula IS NOT NULL THEN 1 ELSE 0 END) as plans_with_nonelective,
            SUM(CASE WHEN auto_enrollment_enabled THEN 1 ELSE 0 END) as plans_with_auto_enrollment,
            SUM(CASE WHEN auto_escalation_enabled THEN 1 ELSE 0 END) as plans_with_auto_escalation,
            SUM(CASE WHEN match_true_up THEN 1 ELSE 0 END) as plans_with_match_trueup
        FROM plan_designs
    """).fetchdf()

    print(f"Total Plans: {stats['total_plans'][0]}")
    print(f"Industries: {stats['unique_industries'][0]}")
    print(f"Avg Employees: {stats['avg_employees'][0]:.0f}")
    print(f"Plans with Match: {stats['plans_with_match'][0]} ({stats['plans_with_match'][0]/stats['total_plans'][0]*100:.0f}%)")
    print(f"Plans with Non-Elective: {stats['plans_with_nonelective'][0]} ({stats['plans_with_nonelective'][0]/stats['total_plans'][0]*100:.0f}%)")
    print(f"Plans with Auto-Enrollment: {stats['plans_with_auto_enrollment'][0]} ({stats['plans_with_auto_enrollment'][0]/stats['total_plans'][0]*100:.0f}%)")
    print(f"Plans with Auto-Escalation: {stats['plans_with_auto_escalation'][0]} ({stats['plans_with_auto_escalation'][0]/stats['total_plans'][0]*100:.0f}%)")
    print(f"Plans with Match True-Up: {stats['plans_with_match_trueup'][0]} ({stats['plans_with_match_trueup'][0]/stats['total_plans'][0]*100:.0f}%)")

    conn.close()

    print("\n" + "="*60)
    print("✓ Import complete!")
    print("="*60)
    print("\nNext steps:")
    print("  • Run peer benchmarking analysis")
    print("  • Generate PowerPoint decks")
    print("  • Launch Streamlit dashboard")

    return True


if __name__ == "__main__":
    success = import_excel_to_duckdb()

    if not success:
        print("\n❌ Import failed. Please fix errors and try again.")
        exit(1)
    else:
        print("\n✓ All systems ready for Week 1 demo!")
        exit(0)