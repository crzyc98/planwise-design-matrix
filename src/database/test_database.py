#!/usr/bin/env python3
"""
Database Testing Script
Validates database setup and runs sample queries for peer benchmarking
"""

import duckdb
from pathlib import Path


def test_database_connection(db_path: str = 'data/planwise.db'):
    """Test basic database connectivity."""
    print("\n" + "="*60)
    print("TEST 1: Database Connection")
    print("="*60)

    db_file = Path(db_path)

    if not db_file.exists():
        print(f"❌ Database not found at: {db_path}")
        print("   Run: python setup_database.py first")
        return False

    try:
        conn = duckdb.connect(str(db_path))
        print(f"✓ Connected to database: {db_path}")

        # Check tables
        tables = conn.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'main'
        """).fetchall()

        print(f"✓ Tables found: {[t[0] for t in tables]}")
        conn.close()
        return True

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


def test_record_count(db_path: str = 'data/planwise.db'):
    """Test record count."""
    print("\n" + "="*60)
    print("TEST 2: Record Count")
    print("="*60)

    conn = duckdb.connect(db_path)

    count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
    print(f"Total records: {count}")

    if count == 0:
        print("⚠️  No records in database")
        print("   Fill in Excel template and run: python excel_to_duckdb.py")
        conn.close()
        return False
    elif count < 20:
        print(f"⚠️  Only {count} records (target: 20 for Week 1)")
    else:
        print(f"✓ Database has {count} records (target: 20)")

    conn.close()
    return True


def test_sample_queries(db_path: str = 'data/planwise.db'):
    """Test sample queries."""
    print("\n" + "="*60)
    print("TEST 3: Sample Queries")
    print("="*60)

    conn = duckdb.connect(db_path)

    # Query 1: Basic SELECT
    print("\n>>> Sample Plans:")
    sample = conn.execute("""
        SELECT plan_id, client_name, plan_type, industry, employee_count
        FROM plan_designs
        LIMIT 5
    """).fetchdf()
    print(sample.to_string(index=False))

    # Query 2: Group by plan_type
    print("\n>>> Plans by Type:")
    by_type = conn.execute("""
        SELECT
            plan_type,
            COUNT(*) as count
        FROM plan_designs
        GROUP BY plan_type
        ORDER BY count DESC
    """).fetchdf()
    print(by_type.to_string(index=False))

    # Query 3: Group by industry
    print("\n>>> Plans by Industry:")
    by_industry = conn.execute("""
        SELECT
            industry,
            COUNT(*) as count,
            AVG(employee_count) as avg_employees
        FROM plan_designs
        GROUP BY industry
        ORDER BY count DESC
    """).fetchdf()
    print(by_industry.to_string(index=False))

    conn.close()
    return True


def test_peer_cohort_query(db_path: str = 'data/planwise.db'):
    """Test peer cohort selection query."""
    print("\n" + "="*60)
    print("TEST 4: Peer Cohort Selection")
    print("="*60)

    conn = duckdb.connect(db_path)

    # Get first plan as target
    target = conn.execute("""
        SELECT plan_id, client_name, plan_type, industry, employee_count
        FROM plan_designs
        LIMIT 1
    """).fetchone()

    if not target:
        print("⚠️  No data to test peer cohort")
        conn.close()
        return False

    plan_id, client_name, plan_type, industry, employee_count = target

    print(f"\n>>> Target Plan:")
    print(f"    Plan ID: {plan_id}")
    print(f"    Client: {client_name}")
    print(f"    Type: {plan_type}")
    print(f"    Industry: {industry}")
    print(f"    Employees: {employee_count:,}")

    # Calculate size range (±50%)
    min_employees = int(employee_count * 0.5)
    max_employees = int(employee_count * 1.5)

    print(f"\n>>> Peer Cohort Criteria:")
    print(f"    Plan Type: {plan_type}")
    print(f"    Industry: {industry}")
    print(f"    Employee Range: {min_employees:,} - {max_employees:,}")

    # Find peers
    peers = conn.execute("""
        SELECT
            plan_id,
            client_name,
            employee_count,
            CASE WHEN match_formula IS NOT NULL THEN '✓' ELSE '✗' END as has_match,
            CASE WHEN auto_enrollment_enabled THEN '✓' ELSE '✗' END as has_auto_enrollment
        FROM plan_designs
        WHERE plan_id != ?
          AND plan_type = ?
          AND industry = ?
          AND employee_count BETWEEN ? AND ?
        ORDER BY employee_count
    """, [plan_id, plan_type, industry, min_employees, max_employees]).fetchdf()

    print(f"\n>>> Peer Plans Found: {len(peers)}")
    if len(peers) > 0:
        print(peers.to_string(index=False))
        print(f"\n✓ Peer cohort query successful (n={len(peers)})")
    else:
        print("⚠️  No peers found with these criteria")
        print("    Try relaxing constraints (broader industry or size range)")

    conn.close()
    return True


def test_percentile_calculations(db_path: str = 'data/planwise.db'):
    """Test percentile calculations."""
    print("\n" + "="*60)
    print("TEST 5: Percentile Calculations")
    print("="*60)

    conn = duckdb.connect(db_path)

    # Calculate percentiles for employee_count
    print("\n>>> Employee Count Percentiles:")
    percentiles = conn.execute("""
        SELECT
            MIN(employee_count) as min_employees,
            percentile_cont(0.25) WITHIN GROUP (ORDER BY employee_count) as p25,
            percentile_cont(0.50) WITHIN GROUP (ORDER BY employee_count) as p50,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY employee_count) as p75,
            MAX(employee_count) as max_employees,
            AVG(employee_count) as avg_employees
        FROM plan_designs
    """).fetchdf()
    print(percentiles.to_string(index=False))

    # Feature adoption rates
    print("\n>>> Feature Adoption Rates:")
    adoption = conn.execute("""
        SELECT
            CAST(SUM(CASE WHEN match_formula IS NOT NULL THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as match_adoption_pct,
            CAST(SUM(CASE WHEN auto_enrollment_enabled THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as auto_enroll_adoption_pct,
            COUNT(*) as total_plans
        FROM plan_designs
    """).fetchdf()
    print(f"Match Adoption: {adoption['match_adoption_pct'][0]:.1f}%")
    print(f"Auto-Enrollment Adoption: {adoption['auto_enroll_adoption_pct'][0]:.1f}%")
    print(f"Total Plans: {int(adoption['total_plans'][0])}")

    print("\n✓ Percentile calculations successful")

    conn.close()
    return True


def run_all_tests(db_path: str = 'data/planwise.db'):
    """Run all database tests."""
    print("\nPlanWise Design Matrix - Database Testing")
    print("="*60)

    tests = [
        ("Database Connection", test_database_connection),
        ("Record Count", test_record_count),
        ("Sample Queries", test_sample_queries),
        ("Peer Cohort Selection", test_peer_cohort_query),
        ("Percentile Calculations", test_percentile_calculations)
    ]

    results = []

    for test_name, test_func in tests:
        try:
            result = test_func(db_path)
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test failed: {test_name}")
            print(f"   Error: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n✓ All tests passed! Database is ready for Week 1.")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review errors above.")
        return False


if __name__ == "__main__":
    success = run_all_tests()

    if success:
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("Your database is ready! You can now:")
        print("  1. Build peer benchmarking engine (W1-2)")
        print("  2. Create Streamlit dashboard (W1-3)")
        print("  3. Generate PowerPoint decks (W1-4)")
        exit(0)
    else:
        exit(1)