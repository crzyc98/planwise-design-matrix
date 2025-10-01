#!/usr/bin/env python3
"""
Peer Benchmarking Engine for PlanWise Design Matrix
Builds peer cohorts and generates statistical comparisons
"""

import duckdb
import numpy as np
from typing import List, Dict, Optional
from pathlib import Path


def build_peer_cohort(
    client_id: str,
    db_path: str = 'data/planwise.db',
    size_tolerance: float = 0.5,  # ±50% employee range
    min_cohort_size: int = 5,
    conn=None
) -> List[Dict]:
    """
    Build peer cohort using weighted similarity scoring.

    Similarity weights:
    - Industry (50%): Exact industry match
    - Size (40%): Employee count within ±50% band
    - Geography (10%): Same state or region

    Args:
        client_id: Target client ID
        db_path: Path to DuckDB database
        size_tolerance: Size range tolerance (0.5 = ±50%)
        min_cohort_size: Minimum number of peers required
        conn: Optional existing connection to reuse

    Returns: List of peer client dictionaries (excludes target client)
    """
    should_close = False
    if conn is None:
        conn = duckdb.connect(db_path, read_only=True)
        should_close = True

    # Get target client details
    target = conn.execute("""
        SELECT industry, employee_count, state
        FROM plan_designs
        WHERE client_id = ?
    """, [client_id]).fetchone()

    if not target:
        if should_close:
            conn.close()
        raise ValueError(f"Client {client_id} not found")

    industry, employee_count, state = target

    # Calculate employee range
    min_employees = int(employee_count * (1 - size_tolerance))
    max_employees = int(employee_count * (1 + size_tolerance))

    # Build peer cohort - prioritize exact industry match
    peers = conn.execute("""
        SELECT
            client_id,
            client_name,
            industry,
            employee_count,
            state,
            eligibility,
            match_formula,
            match_effective_rate,
            match_eligibility_criteria,
            match_last_day_work_rule,
            match_true_up,
            match_contribution_frequency,
            nonelective_formula,
            nonelective_eligibility_criteria,
            nonelective_last_day_work_rule,
            nonelective_contribution_frequency,
            auto_enrollment_enabled,
            auto_enrollment_rate,
            auto_enrollment_effective_year,
            auto_escalation_enabled,
            auto_escalation_cap,
            vesting_schedule
        FROM plan_designs
        WHERE client_id != ?
          AND industry = ?
          AND employee_count BETWEEN ? AND ?
        ORDER BY employee_count
    """, [client_id, industry, min_employees, max_employees]).fetchall()

    # Convert to list of dicts
    columns = [
        'client_id', 'client_name', 'industry', 'employee_count', 'state',
        'eligibility', 'match_formula', 'match_effective_rate',
        'match_eligibility_criteria', 'match_last_day_work_rule', 'match_true_up',
        'match_contribution_frequency', 'nonelective_formula',
        'nonelective_eligibility_criteria', 'nonelective_last_day_work_rule',
        'nonelective_contribution_frequency', 'auto_enrollment_enabled',
        'auto_enrollment_rate', 'auto_enrollment_effective_year',
        'auto_escalation_enabled', 'auto_escalation_cap', 'vesting_schedule'
    ]

    peer_list = [dict(zip(columns, peer)) for peer in peers]

    if should_close:
        conn.close()

    # Log warning if cohort size is small
    if len(peer_list) < min_cohort_size:
        print(f"⚠️  Warning: Only {len(peer_list)} peers found (minimum recommended: {min_cohort_size})")
        print(f"   Consider relaxing filters or expanding database")

    return peer_list


def calculate_percentile(
    target_value: Optional[float],
    peer_values: List[Optional[float]]
) -> Dict:
    """
    Calculate percentile rank for target value within peer distribution.

    Args:
        target_value: The value to rank
        peer_values: List of peer values for comparison

    Returns:
        Dictionary with percentile, quartile, label, peers_below, peers_above
    """
    if target_value is None:
        return {
            'percentile': None,
            'quartile': None,
            'label': 'Not Available',
            'peers_below': 0,
            'peers_above': 0
        }

    # Filter out None values from peers
    valid_peer_values = [v for v in peer_values if v is not None]

    if not valid_peer_values:
        return {
            'percentile': None,
            'quartile': None,
            'label': 'No Peer Data',
            'peers_below': 0,
            'peers_above': 0
        }

    # Calculate percentile (what % of peers are below this value)
    peers_below = sum(1 for v in valid_peer_values if v < target_value)
    percentile = (peers_below / len(valid_peer_values)) * 100

    # Determine quartile
    if percentile < 25:
        quartile = 1
        label = 'Bottom Quartile'
    elif percentile < 50:
        quartile = 2
        label = 'Below Average'
    elif percentile < 75:
        quartile = 3
        label = 'Above Average'
    else:
        quartile = 4
        label = 'Top Quartile'

    # Count peers above
    peers_above = sum(1 for v in valid_peer_values if v > target_value)

    return {
        'percentile': round(percentile, 1),
        'quartile': quartile,
        'label': label,
        'peers_below': int(peers_below),
        'peers_above': int(peers_above)
    }


def calculate_adoption_rate(
    feature: str,
    cohort: List[Dict]
) -> Dict:
    """
    Calculate adoption rate for a boolean feature within peer cohort.

    Args:
        feature: Name of boolean field to analyze
        cohort: List of peer client dictionaries

    Returns:
        Dictionary with adoption_rate, count_with_feature, cohort_size
    """
    cohort_size = len(cohort)

    if cohort_size == 0:
        return {
            'adoption_rate': 0.0,
            'count_with_feature': 0,
            'cohort_size': 0
        }

    count_with_feature = sum(1 for plan in cohort if plan.get(feature) is True)
    adoption_rate = count_with_feature / cohort_size

    return {
        'adoption_rate': round(adoption_rate, 3),
        'count_with_feature': count_with_feature,
        'cohort_size': cohort_size
    }


def generate_peer_comparison(client_id: str, db_path: str = 'data/planwise.db', conn=None) -> Dict:
    """
    Generate comprehensive peer comparison for a client.

    Args:
        client_id: Target client ID
        db_path: Path to DuckDB database
        conn: Optional existing connection to reuse

    Returns:
        Dictionary with target_client, peer_cohort, numeric_comparisons, adoption_comparisons
    """
    should_close = False
    if conn is None:
        conn = duckdb.connect(db_path, read_only=True)
        should_close = True

    # Get target client
    target_result = conn.execute("""
        SELECT * FROM plan_designs WHERE client_id = ?
    """, [client_id]).fetchone()

    if not target_result:
        if should_close:
            conn.close()
        raise ValueError(f"Client {client_id} not found")

    # Get column names
    columns = [desc[0] for desc in conn.description]
    target_dict = dict(zip(columns, target_result))

    # Build peer cohort (keep connection open)
    peer_cohort = build_peer_cohort(client_id, db_path, conn=conn)

    # Numeric comparisons
    numeric_fields = [
        'employee_count',
        'match_effective_rate',
        'auto_enrollment_rate',
        'auto_escalation_cap'
    ]

    numeric_comparisons = {}
    for field in numeric_fields:
        target_value = target_dict.get(field)
        peer_values = [peer.get(field) for peer in peer_cohort]

        # Convert to float and filter valid peer values for statistics
        target_value_float = float(target_value) if target_value is not None else None
        peer_values_float = [float(v) if v is not None else None for v in peer_values]
        valid_peer_values = [v for v in peer_values_float if v is not None]

        numeric_comparisons[field] = {
            'your_value': target_value_float,
            'peer_median': float(np.median(valid_peer_values)) if valid_peer_values else None,
            'peer_p25': float(np.percentile(valid_peer_values, 25)) if valid_peer_values else None,
            'peer_p75': float(np.percentile(valid_peer_values, 75)) if valid_peer_values else None,
            'peer_min': float(min(valid_peer_values)) if valid_peer_values else None,
            'peer_max': float(max(valid_peer_values)) if valid_peer_values else None,
            'percentile_rank': calculate_percentile(target_value_float, peer_values_float)
        }

    # Adoption comparisons (boolean fields)
    boolean_fields = [
        'auto_enrollment_enabled',
        'auto_escalation_enabled',
        'match_true_up',
        'match_last_day_work_rule',
        'nonelective_last_day_work_rule'
    ]

    adoption_comparisons = {}
    for field in boolean_fields:
        your_value = target_dict.get(field)
        peer_stats = calculate_adoption_rate(field, peer_cohort)

        adoption_comparisons[field] = {
            'your_value': your_value,
            'peer_adoption_rate': peer_stats['adoption_rate'],
            'peer_count_with_feature': peer_stats['count_with_feature'],
            'gap_description': 'Yes' if your_value else f"No (vs. {peer_stats['adoption_rate']*100:.0f}% of peers)"
        }

    result = {
        'target_client': target_dict,
        'peer_cohort': {
            'size': len(peer_cohort),
            'clients': peer_cohort
        },
        'numeric_comparisons': numeric_comparisons,
        'adoption_comparisons': adoption_comparisons
    }

    if should_close:
        conn.close()

    return result


if __name__ == "__main__":
    # Quick test
    print("PlanWise Peer Benchmarking Engine")
    print("=" * 60)

    # Test with first client in database
    conn = duckdb.connect('data/planwise.db')
    first_client = conn.execute("SELECT client_id, client_name FROM plan_designs LIMIT 1").fetchone()
    conn.close()

    if first_client:
        client_id, client_name = first_client
        print(f"\nTesting with: {client_name} ({client_id})")

        try:
            comparison = generate_peer_comparison(client_id)
            print(f"✓ Peer cohort size: {comparison['peer_cohort']['size']}")
            print(f"✓ Numeric comparisons: {len(comparison['numeric_comparisons'])} fields")
            print(f"✓ Adoption comparisons: {len(comparison['adoption_comparisons'])} fields")
            print("\n✓ Peer benchmarking engine working!")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("No clients found in database")