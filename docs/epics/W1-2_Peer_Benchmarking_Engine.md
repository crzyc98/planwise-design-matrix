# Epic W1-2: Peer Benchmarking Engine

**Epic ID:** W1-2
**Epic Name:** Peer Benchmarking Engine (Core Intelligence Layer)
**Priority:** Critical - Week 1 Value Delivery
**Estimated Effort:** 1 day
**Phase:** Week 1 - Prove the Concept
**Dependencies:** W1-1 (Database with 20 clients loaded)

---

## Epic Summary

Build the core peer benchmarking engine that selects appropriate peer cohorts and calculates statistical comparisons (percentiles, adoption rates, gaps) for any plan in the database. This is the "secret sauce" that transforms raw plan data into actionable insights.

**Key Principle:** This is where the platform creates value—not extraction, but intelligent peer analysis.

## Business Value

- **Core Differentiator:** Enables data-driven peer comparisons vs. manual Excel analysis
- **Time Savings:** Automates 4-6 hours of manual cohort construction and statistical analysis
- **Quality Improvement:** Consistent, rigorous methodology vs. ad-hoc analyst approaches
- **Foundation:** Powers dashboard (W1-3) and PowerPoint generation (W1-4)

## User Story

**As an** Account Executive or Consultant
**I want** to see how my client's plan compares to similar organizations
**So that** I can identify competitive gaps and strengths with statistical rigor

---

## Acceptance Criteria

### Cohort Selection
- [ ] Function: `build_peer_cohort(plan_id, filters)` returns list of peer plan IDs
- [ ] Cohort selection uses weighted similarity: industry (40%), size (30%), plan type (20%)
- [ ] Minimum cohort size: n ≥ 5 (relaxed k-anonymity for Week 1 with 20 total plans)
- [ ] Target plan excluded from its own peer cohort
- [ ] Cohort selection tested with all 20 plans

### Percentile Calculations
- [ ] Function: `calculate_percentile(value, peer_values)` returns percentile rank (0-100)
- [ ] Handle edge cases: single peer, tied values, null values
- [ ] Calculate percentiles for numeric fields: total_participants, total_assets, match_rate, auto_enrollment_rate
- [ ] Quartile labels: Bottom Quartile (<25), Below Average (25-50), Above Average (50-75), Top Quartile (>75)

### Adoption Rate Comparisons
- [ ] Function: `calculate_adoption_rate(feature, cohort)` returns % of peers with feature
- [ ] Calculate adoption rates for boolean fields: has_match, has_auto_enrollment
- [ ] Gap calculation: Target plan vs. peer adoption rate

### Statistical Comparison Output
- [ ] Function: `generate_peer_comparison(plan_id)` returns comprehensive comparison JSON
- [ ] Output includes: plan details, cohort details, numeric comparisons, adoption comparisons
- [ ] JSON schema documented for downstream consumption (dashboard, PowerPoint)

### Testing
- [ ] Test with 5 sample plans covering different industries and sizes
- [ ] Verify cohorts are logical (similar industry/size)
- [ ] Verify percentile calculations match manual spot-checks
- [ ] Edge case testing: plan with unique characteristics (small cohort), largest plan, smallest plan

---

## Core Functions

### Function 1: Cohort Selection

```python
# peer_benchmarking.py
import duckdb
from typing import List, Dict, Optional

def build_peer_cohort(
    client_id: str,
    db_path: str = 'clients.db',
    size_tolerance: float = 0.5,  # ±50% participant range
    min_cohort_size: int = 5
) -> List[Dict]:
    """
    Build peer cohort using weighted similarity scoring.

    Similarity weights:
    - Industry (50%): Exact NAICS 2-digit match
    - Size (40%): Participant count within ±50% band
    - Geography (10%): Same state or region

    Returns: List of peer client dictionaries (excludes target client)
    """
    conn = duckdb.connect(db_path)

    # Get target client details
    target = conn.execute("""
        SELECT industry, total_participants
        FROM clients
        WHERE client_id = ?
    """, [client_id]).fetchone()

    if not target:
        raise ValueError(f"Client {client_id} not found")

    industry, participants = target

    # Calculate participant range
    min_participants = int(participants * (1 - size_tolerance))
    max_participants = int(participants * (1 + size_tolerance))

    # Build peer cohort
    peers = conn.execute("""
        SELECT
            client_id,
            client_name,
            plan_sponsor_name,
            industry,
            total_participants,
            total_assets,
            eligibility,
            has_match,
            match_rate,
            match_cap,
            match_eligibility_criteria,
            match_last_day_work_rule,
            match_true_up,
            match_contribution_frequency,
            has_auto_enrollment,
            auto_enrollment_rate,
            auto_enrollment_effective_year,
            auto_escalation_enabled,
            auto_escalation_cap,
            nonelective_formula,
            vesting_type
        FROM clients
        WHERE client_id != ?
          AND industry = ?
          AND total_participants BETWEEN ? AND ?
        ORDER BY total_participants
    """, [client_id, industry, min_participants, max_participants]).fetchall()

    # Convert to list of dicts
    columns = ['client_id', 'client_name', 'plan_sponsor_name', 'industry',
               'total_participants', 'total_assets', 'eligibility', 'has_match', 'match_rate',
               'match_cap', 'match_eligibility_criteria', 'match_last_day_work_rule',
               'match_true_up', 'match_contribution_frequency', 'has_auto_enrollment',
               'auto_enrollment_rate', 'auto_enrollment_effective_year', 'auto_escalation_enabled',
               'auto_escalation_cap', 'nonelective_formula', 'vesting_type']

    peer_list = [dict(zip(columns, peer)) for peer in peers]

    conn.close()

    # Validate minimum cohort size
    if len(peer_list) < min_cohort_size:
        # Relax constraints if needed (for Week 1 with limited data)
        # Future: expand search to broader industry or size range
        pass

    return peer_list
```

### Function 2: Percentile Calculation

```python
import numpy as np
from typing import Optional

def calculate_percentile(
    target_value: Optional[float],
    peer_values: List[Optional[float]]
) -> Dict:
    """
    Calculate percentile rank for target value within peer distribution.

    Returns:
        percentile: 0-100
        quartile: 1-4
        label: 'Bottom Quartile', 'Below Average', 'Above Average', 'Top Quartile'
        peers_below: count
        peers_above: count
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

    # Calculate percentile
    percentile = np.sum(valid_peer_values < target_value) / len(valid_peer_values) * 100

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

    # Count peers above and below
    peers_below = np.sum(valid_peer_values < target_value)
    peers_above = np.sum(valid_peer_values > target_value)

    return {
        'percentile': round(percentile, 1),
        'quartile': quartile,
        'label': label,
        'peers_below': int(peers_below),
        'peers_above': int(peers_above)
    }
```

### Function 3: Adoption Rate Calculation

```python
def calculate_adoption_rate(
    feature: str,
    cohort: List[Dict]
) -> Dict:
    """
    Calculate adoption rate for a boolean feature within peer cohort.

    Returns:
        adoption_rate: 0.0 to 1.0
        count_with_feature: int
        cohort_size: int
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
```

### Function 4: Comprehensive Peer Comparison

```python
def generate_peer_comparison(client_id: str, db_path: str = 'clients.db') -> Dict:
    """
    Generate comprehensive peer comparison for a client.

    Returns JSON with:
    - target_client: Client details
    - peer_cohort: Cohort metadata and peer list
    - numeric_comparisons: Percentile analysis for numeric fields
    - adoption_comparisons: Adoption rate analysis for boolean fields
    """
    conn = duckdb.connect(db_path)

    # Get target client
    target_client = conn.execute("""
        SELECT * FROM clients WHERE client_id = ?
    """, [client_id]).fetchone()

    if not target_client:
        raise ValueError(f"Client {client_id} not found")

    # Get column names
    columns = [desc[0] for desc in conn.description]
    target_dict = dict(zip(columns, target_plan))

    conn.close()

    # Build peer cohort
    peer_cohort = build_peer_cohort(client_id, db_path)

    # Numeric comparisons
    numeric_fields = ['total_participants', 'total_assets', 'match_rate',
                      'match_cap', 'auto_enrollment_rate']

    numeric_comparisons = {}
    for field in numeric_fields:
        target_value = target_dict.get(field)
        peer_values = [peer.get(field) for peer in peer_cohort]

        numeric_comparisons[field] = {
            'your_value': target_value,
            'peer_median': np.median([v for v in peer_values if v is not None]) if peer_values else None,
            'peer_p25': np.percentile([v for v in peer_values if v is not None], 25) if peer_values else None,
            'peer_p75': np.percentile([v for v in peer_values if v is not None], 75) if peer_values else None,
            'percentile_rank': calculate_percentile(target_value, peer_values)
        }

    # Adoption comparisons
    boolean_fields = ['has_match', 'has_auto_enrollment']

    adoption_comparisons = {}
    for field in boolean_fields:
        your_value = target_dict.get(field)
        peer_stats = calculate_adoption_rate(field, peer_cohort)

        adoption_comparisons[field] = {
            'your_value': your_value,
            'peer_adoption_rate': peer_stats['adoption_rate'],
            'peer_count_with_feature': peer_stats['count_with_feature'],
            'gap': 'Yes' if your_value else f"No (vs. {peer_stats['adoption_rate']*100:.0f}% of peers)"
        }

    return {
        'target_client': target_dict,
        'peer_cohort': {
            'size': len(peer_cohort),
            'clients': peer_cohort
        },
        'numeric_comparisons': numeric_comparisons,
        'adoption_comparisons': adoption_comparisons
    }
```

---

## Testing Script

```python
# test_peer_benchmarking.py
from peer_benchmarking import generate_peer_comparison
import json

# Test with 5 sample clients
test_client_ids = ['CLIENT-001', 'CLIENT-002', 'CLIENT-003', 'CLIENT-004', 'CLIENT-005']

for client_id in test_client_ids:
    print(f"\n{'='*60}")
    print(f"Peer Comparison for {client_id}")
    print(f"{'='*60}")

    try:
        comparison = generate_peer_comparison(client_id)

        print(f"\nTarget Client: {comparison['target_client']['client_name']}")
        print(f"Industry: {comparison['target_client']['industry']}")
        print(f"Participants: {comparison['target_client']['total_participants']:,}")

        print(f"\nPeer Cohort Size: {comparison['peer_cohort']['size']}")

        print("\nNumeric Comparisons:")
        for field, stats in comparison['numeric_comparisons'].items():
            if stats['your_value'] is not None:
                print(f"  {field}:")
                print(f"    Your Value: {stats['your_value']}")
                print(f"    Peer Median: {stats['peer_median']}")
                print(f"    Your Rank: {stats['percentile_rank']['label']} "
                      f"({stats['percentile_rank']['percentile']}th percentile)")

        print("\nAdoption Comparisons:")
        for field, stats in comparison['adoption_comparisons'].items():
            print(f"  {field}:")
            print(f"    Your Plan: {stats['your_value']}")
            print(f"    Peer Adoption: {stats['peer_adoption_rate']*100:.0f}%")
            print(f"    Gap: {stats['gap']}")

        # Save to JSON for inspection
        with open(f'peer_comparison_{client_id}.json', 'w') as f:
            json.dump(comparison, f, indent=2, default=str)

    except Exception as e:
        print(f"ERROR: {e}")
```

---

## Success Metrics

- [ ] Cohort selection returns logical peers for all test plans
- [ ] Percentile calculations match manual spot-checks (within 5%)
- [ ] Adoption rate calculations accurate (100% for boolean fields)
- [ ] JSON output validated and ready for downstream consumption
- [ ] Processing time: <1 second per comparison (with 20 plans in database)

---

## Deliverables

1. **peer_benchmarking.py** - Core benchmarking engine
2. **test_peer_benchmarking.py** - Testing script
3. **peer_comparison_*.json** - 5 sample comparison outputs
4. **benchmarking_methodology.md** - Documentation of cohort selection and statistical methods

---

## Future Enhancements (Post Week 1)

- Increase minimum cohort size to n ≥ 20 (k-anonymity compliance)
- Add significance testing (two-proportion z-test)
- Support custom cohort filters (geography, specific peer selection)
- Pre-compute cohorts and cache results (performance optimization)
- Add more sophisticated similarity scoring (geography weighting)

---

**Epic Owner:** [Engineer Name]
**Status:** Ready to Start (blocked by W1-1)
**Next Epic:** W1-3 (Streamlit Dashboard)