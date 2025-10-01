#!/usr/bin/env python3
"""
Test script for PowerPoint generator
Generates sample decks for verification
"""

from powerpoint_generator import generate_powerpoint
import duckdb
from pathlib import Path


def get_sample_clients(db_path: str = 'data/planwise.db', limit: int = 5):
    """Get sample client IDs from database"""
    conn = duckdb.connect(db_path, read_only=True)
    clients = conn.execute("""
        SELECT client_id, client_name
        FROM plan_designs
        ORDER BY client_id
        LIMIT ?
    """, [limit]).fetchall()
    conn.close()
    return clients


if __name__ == "__main__":
    print("PowerPoint Generator Test\n" + "="*50)

    # Get sample clients
    print("\nFetching sample clients from database...")
    try:
        sample_clients = get_sample_clients(limit=5)
        print(f"Found {len(sample_clients)} clients to test\n")
    except Exception as e:
        print(f"Error fetching clients: {e}")
        exit(1)

    # Generate decks
    successful = 0
    failed = 0

    for client_id, client_name in sample_clients:
        print(f"Generating PowerPoint for {client_name} ({client_id})...")
        try:
            filepath = generate_powerpoint(client_id)
            print(f"  ✓ Success: {filepath}")
            successful += 1
        except Exception as e:
            print(f"  ✗ Error: {e}")
            failed += 1

    # Summary
    print("\n" + "="*50)
    print(f"SUMMARY:")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print(f"\nAll decks saved to output/ directory")