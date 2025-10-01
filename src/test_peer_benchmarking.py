#!/usr/bin/env python3
"""
Test script for Peer Benchmarking Engine
Tests cohort selection, percentile calculations, and comparison generation
"""

import sys
import json
from pathlib import Path
import duckdb

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from peer_benchmarking import generate_peer_comparison


def test_peer_benchmarking():
    """Test peer benchmarking with multiple clients"""

    print("="*60)
    print("PlanWise Peer Benchmarking Engine - Test Suite")
    print("="*60)

    # Get test clients from database
    conn = duckdb.connect('data/planwise.db')
    test_clients = conn.execute("""
        SELECT client_id, client_name, industry, employee_count
        FROM plan_designs
        ORDER BY employee_count DESC
        LIMIT 5
    """).fetchall()
    conn.close()

    if not test_clients:
        print("❌ No clients found in database")
        print("   Run: python src/database/setup_database.py")
        print("   Then: python src/database/excel_to_duckdb.py")
        return

    print(f"\n✓ Found {len(test_clients)} test clients")
    print("\nTest Clients:")
    for client_id, name, industry, emp_count in test_clients:
        print(f"  • {client_id}: {name} ({industry}, {emp_count:,} employees)")

    # Run peer comparison for each test client
    results = []
    for client_id, name, industry, emp_count in test_clients:
        print(f"\n{'='*60}")
        print(f"Peer Comparison for: {name}")
        print(f"{'='*60}")

        try:
            comparison = generate_peer_comparison(client_id)

            print(f"\n📊 Target Client:")
            print(f"   Client: {comparison['target_client']['client_name']}")
            print(f"   Industry: {comparison['target_client']['industry']}")
            print(f"   Employees: {comparison['target_client']['employee_count']:,}")
            print(f"   State: {comparison['target_client'].get('state', 'N/A')}")

            print(f"\n👥 Peer Cohort:")
            print(f"   Size: {comparison['peer_cohort']['size']} peers")

            if comparison['peer_cohort']['size'] > 0:
                print(f"   Peers:")
                for peer in comparison['peer_cohort']['clients'][:5]:  # Show first 5
                    print(f"     • {peer['client_name']} ({peer['employee_count']:,} employees)")
                if comparison['peer_cohort']['size'] > 5:
                    print(f"     ... and {comparison['peer_cohort']['size'] - 5} more")

            print(f"\n📈 Numeric Comparisons:")
            for field, stats in comparison['numeric_comparisons'].items():
                if stats['your_value'] is not None:
                    rank = stats['percentile_rank']
                    print(f"   {field}:")
                    print(f"     Your Value: {stats['your_value']}")
                    if stats['peer_median'] is not None:
                        print(f"     Peer Median: {stats['peer_median']:.1f}")
                        print(f"     Peer Range: {stats['peer_min']:.1f} - {stats['peer_max']:.1f}")
                        print(f"     Your Rank: {rank['label']} ({rank['percentile']}th percentile)")

            print(f"\n✅ Adoption Comparisons:")
            for field, stats in comparison['adoption_comparisons'].items():
                print(f"   {field}:")
                print(f"     Your Plan: {'Yes' if stats['your_value'] else 'No'}")
                print(f"     Peer Adoption: {stats['peer_adoption_rate']*100:.0f}% ({stats['peer_count_with_feature']}/{comparison['peer_cohort']['size']} peers)")
                print(f"     Status: {stats['gap_description']}")

            # Save to JSON
            output_file = Path(f'output/peer_comparison_{client_id}.json')
            output_file.parent.mkdir(exist_ok=True)
            with open(output_file, 'w') as f:
                json.dump(comparison, f, indent=2, default=str)
            print(f"\n💾 Saved to: {output_file}")

            results.append({
                'client_id': client_id,
                'client_name': name,
                'cohort_size': comparison['peer_cohort']['size'],
                'success': True
            })

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            results.append({
                'client_id': client_id,
                'client_name': name,
                'success': False,
                'error': str(e)
            })

    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")

    successful = sum(1 for r in results if r['success'])
    print(f"✓ Successful: {successful}/{len(results)}")

    if successful < len(results):
        print(f"❌ Failed: {len(results) - successful}/{len(results)}")
        for r in results:
            if not r['success']:
                print(f"   • {r['client_name']}: {r.get('error', 'Unknown error')}")

    print(f"\n{'='*60}")
    print("RECOMMENDATIONS:")
    print(f"{'='*60}")
    if successful > 0:
        print("✓ Peer benchmarking engine is working!")
        print("  Next steps:")
        print("    1. Review output JSON files in output/ directory")
        print("    2. Build Streamlit dashboard (W1-3)")
        print("    3. Build PowerPoint generator (W1-4)")
    else:
        print("❌ Peer benchmarking tests failed")
        print("  Check database setup and data quality")


if __name__ == "__main__":
    test_peer_benchmarking()