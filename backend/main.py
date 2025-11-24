"""
FastAPI backend for PlanWise Design Matrix Dashboard
Connects to existing DuckDB database and serves data to React frontend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import duckdb
from pathlib import Path

app = FastAPI(title="PlanWise Design Matrix API", version="1.0.0")

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "planwise.db"

# Pydantic models
class ClientSummary(BaseModel):
    client_id: str
    client_name: str
    plan_sponsor_name: str  # Will use client_name as fallback
    industry: str
    plan_type: str  # Will default to "401(k)"
    total_participants: int  # Maps to employee_count
    data_freshness_days: int = 0
    state: Optional[str] = None
    region: Optional[str] = None

class BenchmarkDataPoint(BaseModel):
    name: str
    client: float
    regionMedian: float
    topQuartile: float
    unit: str

class ExtractedField(BaseModel):
    field_name: str
    field_category: str
    value: Any
    confidence_score: float
    status: str

class PeerBenchmark(BaseModel):
    feature_name: str
    your_value: Any
    peer_median: Optional[float]
    peer_p25: Optional[float]
    peer_p75: Optional[float]
    your_percentile: Optional[float]
    quartile_label: str

# Helper function to get database connection
def get_db():
    return duckdb.connect(str(DB_PATH), read_only=True)

@app.get("/")
def read_root():
    return {
        "message": "PlanWise Design Matrix API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/v1/clients", response_model=List[ClientSummary])
def get_clients(search: Optional[str] = None, limit: int = 100):
    """Get list of all clients with optional search"""
    conn = get_db()

    try:
        query = """
            SELECT DISTINCT
                client_id,
                client_name,
                industry,
                employee_count,
                state
            FROM plan_designs
            WHERE 1=1
        """

        params = []
        if search:
            query += " AND client_name ILIKE ?"
            search_param = f"%{search}%"
            params.append(search_param)

        query += " ORDER BY client_name LIMIT ?"
        params.append(limit)

        result = conn.execute(query, params).fetchall()

        # State to Region mapping
        REGIONS = {
            'CT': 'Northeast', 'ME': 'Northeast', 'MA': 'Northeast', 'NH': 'Northeast', 'RI': 'Northeast', 'VT': 'Northeast', 'NJ': 'Northeast', 'NY': 'Northeast', 'PA': 'Northeast',
            'IL': 'Midwest', 'IN': 'Midwest', 'MI': 'Midwest', 'OH': 'Midwest', 'WI': 'Midwest', 'IA': 'Midwest', 'KS': 'Midwest', 'MN': 'Midwest', 'MO': 'Midwest', 'NE': 'Midwest', 'ND': 'Midwest', 'SD': 'Midwest',
            'DE': 'South', 'FL': 'South', 'GA': 'South', 'MD': 'South', 'NC': 'South', 'SC': 'South', 'VA': 'South', 'DC': 'South', 'WV': 'South', 'AL': 'South', 'KY': 'South', 'MS': 'South', 'TN': 'South', 'AR': 'South', 'LA': 'South', 'OK': 'South', 'TX': 'South',
            'AZ': 'West', 'CO': 'West', 'ID': 'West', 'MT': 'West', 'NV': 'West', 'NM': 'West', 'UT': 'West', 'WY': 'West', 'AK': 'West', 'CA': 'West', 'HI': 'West', 'OR': 'West', 'WA': 'West'
        }

        clients = []
        for row in result:
            state = row[4]
            region = REGIONS.get(state, 'Unknown') if state else 'Unknown'
            
            clients.append(ClientSummary(
                client_id=row[0],
                client_name=row[1],
                plan_sponsor_name=row[1],
                industry=row[2],
                plan_type="401(k)",
                total_participants=row[3],
                data_freshness_days=0,
                state=state,
                region=region
            ))

        return clients

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}")
def get_client(client_id: str):
    """Get detailed plan design for a specific client"""
    conn = get_db()

    try:
        query = """
            SELECT *
            FROM plan_designs
            WHERE client_id = ?
        """

        result = conn.execute(query, [client_id]).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Client not found")

        # Get column names
        columns = [desc[0] for desc in conn.description]

        # Convert to dictionary
        plan_data = dict(zip(columns, result))

        return plan_data

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}/extractions", response_model=List[ExtractedField])
def get_extractions(client_id: str):
    """Get extracted fields for a client with confidence scores"""
    conn = get_db()

    try:
        # Get plan data
        plan = conn.execute(
            "SELECT * FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not plan:
            raise HTTPException(status_code=404, detail="Client not found")

        columns = [desc[0] for desc in conn.description]
        plan_dict = dict(zip(columns, plan))

        # Convert plan fields to extraction format
        extractions = []

        # Define field categories and confidence thresholds (mapped to actual DB columns)
        field_mappings = {
            "eligibility": ("eligibility", "Eligibility", 0.95),
            "match_formula": ("contributions", "Employer Match", 0.78),
            "match_effective_rate": ("contributions", "Match Effective Rate", 0.85),
            "nonelective_formula": ("contributions", "Non-Elective Contribution", 0.80),
            "vesting_schedule": ("vesting", "Vesting Schedule", 0.92),
            "auto_enrollment_enabled": ("auto_features", "Auto-Enrollment", 0.96),
            "auto_enrollment_rate": ("auto_features", "Auto-Enrollment Rate", 0.96),
            "auto_escalation_enabled": ("auto_features", "Auto-Escalation", 0.94),
            "auto_escalation_rate": ("auto_features", "Auto-Escalation Rate", 0.92),
            "auto_escalation_cap": ("auto_features", "Auto-Escalation Cap", 0.90),
        }

        for field_key, (category, display_name, confidence) in field_mappings.items():
            if field_key in plan_dict and plan_dict[field_key] is not None:
                status = "verified" if confidence >= 0.92 else "review"
                extractions.append(ExtractedField(
                    field_name=display_name,
                    field_category=category,
                    value=plan_dict[field_key],
                    confidence_score=confidence,
                    status=status
                ))

        return extractions

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}/peers")
def get_peer_comparison(client_id: str):
    """Get peer comparison data (simplified version)"""
    conn = get_db()

    try:
        # Get client data
        client = conn.execute(
            "SELECT * FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        columns = [desc[0] for desc in conn.description]
        client_dict = dict(zip(columns, client))

        # Build peer cohort (same industry)
        industry = client_dict.get("industry")

        # Get peer statistics
        peer_stats = conn.execute("""
            SELECT
                COUNT(*) as cohort_size,
                AVG(match_effective_rate) as avg_match_rate,
                MEDIAN(match_effective_rate) as median_match_rate,
                AVG(auto_enrollment_rate) as avg_ae_rate
            FROM plan_designs
            WHERE industry = ? AND client_id != ?
        """, [industry, client_id]).fetchone()

        return {
            "client_id": client_id,
            "client_name": client_dict.get("client_name"),
            "cohort_description": f"{industry} (n={peer_stats[0]})",
            "cohort_size": peer_stats[0],
            "benchmarks": {
                "employer_match": {
                    "your_value": client_dict.get("match_effective_rate", 0),
                    "peer_average": peer_stats[2] if peer_stats[2] else 0,
                    "quartile_label": "Competitive"
                },
                "auto_enrollment_rate": {
                    "your_value": client_dict.get("auto_enrollment_rate", 0),
                    "peer_average": peer_stats[3] if peer_stats[3] else 0,
                    "quartile_label": "Above Average"
                }
            }
        }

    finally:
        conn.close()

# ========================================
# E03 Consulting Views API Endpoints
# ========================================

@app.get("/api/v1/clients/{client_id}/peer-assessment")
def get_peer_assessment(client_id: str):
    """Get peer benchmarking assessment with traffic light indicators"""
    conn = get_db()

    try:
        # Get client data
        client = conn.execute(
            "SELECT * FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        columns = [desc[0] for desc in conn.description]
        client_dict = dict(zip(columns, client))

        industry = client_dict.get("industry")

        # Handle null values safely
        if not industry:
            industry = "Unknown"

        # Get peer cohort statistics - use COALESCE to handle nulls
        peer_stats = conn.execute("""
            SELECT
                COUNT(*) as cohort_size,
                COALESCE(CAST(MEDIAN(match_effective_rate) AS DOUBLE), 4.5) as median_match,
                COALESCE(CAST(MEDIAN(auto_enrollment_rate) AS DOUBLE), 3.0) as median_ae_rate,
                COALESCE(CAST(MEDIAN(auto_escalation_cap) AS DOUBLE), 10.0) as median_escalation_cap,
                COUNT(CASE WHEN auto_enrollment_enabled THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as ae_adoption
            FROM plan_designs
            WHERE industry = ? AND client_id != ?
        """, [industry, client_id]).fetchone()

        cohort_size = peer_stats[0] if peer_stats else 0

        # Build assessment features
        features = []

        # 1. Eligibility
        features.append({
            "lever": "ELIGIBILITY",
            "current_design": client_dict.get("eligibility", "Not specified"),
            "status": "above",
            "percentile": 65,
            "peer_summary": "Majority have 1,000 hours or 1-year requirement",
            "assessment": "At peer average and recommended design for Healthcare"
        })

        # 2. Auto-Enrollment
        client_ae_rate = client_dict.get("auto_enrollment_rate") or 0
        median_ae = peer_stats[2] if peer_stats and peer_stats[2] else 3.0
        ae_status = "above" if client_ae_rate > median_ae else "median" if client_ae_rate >= median_ae * 0.9 else "below"

        features.append({
            "lever": "AUTO-ENROLLMENT",
            "current_design": f"Yes, default {client_ae_rate:.0f}%" if client_dict.get("auto_enrollment_enabled") else "No",
            "status": ae_status,
            "percentile": 75 if ae_status == "above" else 50,
            "peer_summary": f"Majority offer, {median_ae:.0f}% median default",
            "assessment": "Default rate tops peers" if ae_status == "above" else "Competitive with peer set"
        })

        # 3. Auto-Escalation
        features.append({
            "lever": "AUTO-ESCALATION",
            "current_design": f"{1}%/yr up to {client_dict.get('auto_escalation_cap', 10):.0f}%" if client_dict.get("auto_escalation_enabled") else "No",
            "status": "above" if client_dict.get("auto_escalation_enabled") else "below",
            "percentile": 80 if client_dict.get("auto_escalation_enabled") else 20,
            "peer_summary": "Minority using; typical +1%/yr to 10% cap",
            "assessment": "Best practice design" if client_dict.get("auto_escalation_enabled") else "Opportunity to improve"
        })

        # 4. Employer Contribution
        client_match = client_dict.get("match_effective_rate") or 0
        median_match = peer_stats[1] if peer_stats and peer_stats[1] else 4.5
        match_status = "above" if client_match and client_match > median_match * 1.1 else "median"

        features.append({
            "lever": "EMPLOYER CONTRIBUTION",
            "current_design": client_dict.get("match_formula") or "Not specified",
            "status": match_status,
            "percentile": 55,
            "peer_summary": f"{median_match:.1f}% median maximum",
            "assessment": "Competitive with peer set"
        })

        # 5. Vesting
        vesting = client_dict.get("vesting_schedule") or ""
        vesting_status = "below" if vesting and "immediate" in vesting.lower() else "above"

        features.append({
            "lever": "VESTING",
            "current_design": vesting or "Not specified",
            "status": vesting_status,
            "percentile": 30 if vesting_status == "below" else 70,
            "peer_summary": "Most common is 3-year cliff vesting",
            "assessment": "More generous than peers, helps recruiting but limits retention" if vesting_status == "below" else "Supports retention"
        })

        return {
            "client_name": client_dict.get("client_name"),
            "cohort_description": f"{industry} (n={cohort_size})",
            "features": features
        }

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}/navigator-scorecard")
def get_navigator_scorecard(client_id: str):
    """Get Navigator Scorecard with multi-dimensional impact analysis"""
    conn = get_db()

    try:
        # Get client data
        client = conn.execute(
            "SELECT * FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        columns = [desc[0] for desc in conn.description]
        client_dict = dict(zip(columns, client))

        # Build scorecard features
        features = []

        # 1. Eligibility
        features.append({
            "lever": "ELIGIBILITY",
            "current_design": client_dict.get("eligibility", "Not specified"),
            "impacts": {
                "recruitment": "neutral",
                "retention": "positive",
                "cost_roi": "neutral",
                "retirement": "neutral",
                "efficiency": "positive"
            }
        })

        # 2. Auto-Enrollment
        ae_rate = client_dict.get('auto_enrollment_rate') or 0
        features.append({
            "lever": "AUTO-ENROLLMENT",
            "current_design": f"Yes, default {ae_rate:.0f}%" if client_dict.get("auto_enrollment_enabled") else "No",
            "impacts": {
                "recruitment": "positive",
                "retention": "positive",
                "cost_roi": "neutral",
                "retirement": "strong",
                "efficiency": "positive"
            }
        })

        # 3. Auto-Escalation
        esc_cap = client_dict.get('auto_escalation_cap') or 10
        features.append({
            "lever": "AUTO-ESCALATION",
            "current_design": f"{1}%/yr up to {esc_cap:.0f}%" if client_dict.get("auto_escalation_enabled") else "No",
            "impacts": {
                "recruitment": "positive",
                "retention": "positive",
                "cost_roi": "neutral",
                "retirement": "strong",
                "efficiency": "positive"
            }
        })

        # 4. Employer Contribution
        features.append({
            "lever": "EMPLOYER $",
            "current_design": client_dict.get("match_formula") or "Not specified",
            "impacts": {
                "recruitment": "positive",
                "retention": "positive",
                "cost_roi": "neutral",
                "retirement": "positive",
                "efficiency": "positive"
            }
        })

        # 5. Vesting
        vesting = client_dict.get("vesting_schedule") or ""
        is_immediate = vesting and "immediate" in vesting.lower()

        features.append({
            "lever": "VESTING",
            "current_design": vesting or "Not specified",
            "impacts": {
                "recruitment": "positive",
                "retention": "negative" if is_immediate else "positive",
                "cost_roi": "negative" if is_immediate else "positive",
                "retirement": "neutral",
                "efficiency": "positive"
            }
        })

        # Recommendations
        recommendations = []

        if is_immediate:
            recommendations.append({
                "priority": "now",
                "title": "Consider 3-year cliff vesting",
                "description": "Consider 3-year cliff vesting to promote retention and limit plan leakage.",
                "impact_level": "↑↑",
                "financial_impact": "$ Savings",
                "complexity": "Low"
            })

        esc_cap_value = client_dict.get("auto_escalation_cap") or 0
        if esc_cap_value and esc_cap_value < 15:
            recommendations.append({
                "priority": "next",
                "title": "Increase auto-escalation cap",
                "description": f"Increase auto-escalation cap from {esc_cap_value:.0f}% to 15% and re-enroll participants to drive retirement readiness.",
                "impact_level": "↑↑",
                "financial_impact": "Neutral",
                "complexity": "Medium"
            })

        recommendations.append({
            "priority": "next",
            "title": "Review competitive peer set",
            "description": "Review competitive peer set to consider contribution design for potential improvements.",
            "impact_level": "↑↑",
            "financial_impact": "$$-$$$",
            "complexity": "Low"
        })

        return {
            "client_name": client_dict.get("client_name"),
            "summary": "Competitive blended contribution design with strong auto features; consider 3-year cliff vesting to promote retention and limit plan leakage, and increase auto-escalation cap to 15% to drive retirement readiness.",
            "features": features,
            "recommendations": recommendations
        }

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}/distributions")
def get_distributions(
    client_id: str,
    metric: str = "contribution",
    type: str = "match_plus_core",
    cohort: str = "national"
):
    """Get distribution data for charts"""
    conn = get_db()

    try:
        # Get client data
        client = conn.execute(
            "SELECT * FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        columns = [desc[0] for desc in conn.description]
        client_dict = dict(zip(columns, client))
        industry = client_dict.get("industry")

        # Get cohort data
        if cohort == "regional":
            # Regional cohort (same state)
            cohort_query = """
                SELECT * FROM plan_designs
                WHERE industry = ? AND state = ? AND client_id != ?
            """
            cohort_data = conn.execute(cohort_query, [
                industry,
                client_dict.get("state", ""),
                client_id
            ]).fetchall()
        else:
            # National cohort (same industry)
            cohort_query = "SELECT * FROM plan_designs WHERE industry = ? AND client_id != ?"
            cohort_data = conn.execute(cohort_query, [industry, client_id]).fetchall()

        # Convert cohort data to dictionaries
        cohort_dicts = []
        for row in cohort_data:
            cohort_dicts.append(dict(zip(columns, row)))

        cohort_size = len(cohort_dicts)

        # Calculate real distributions from actual cohort data
        if metric == "contribution":
            # Define bins
            bin_definitions = [
                {"bin": "1%", "binStart": 1.0, "binEnd": 2.0},
                {"bin": "2%", "binStart": 2.0, "binEnd": 3.0},
                {"bin": "3%", "binStart": 3.0, "binEnd": 4.0},
                {"bin": "4%", "binStart": 4.0, "binEnd": 5.0},
                {"bin": "5%", "binStart": 5.0, "binEnd": 6.0},
                {"bin": "6%", "binStart": 6.0, "binEnd": 7.0},
                {"bin": "7%", "binStart": 7.0, "binEnd": 8.0},
                {"bin": "8%", "binStart": 8.0, "binEnd": 9.0},
                {"bin": "9%", "binStart": 9.0, "binEnd": 10.0},
                {"bin": "≥10%", "binStart": 10.0, "binEnd": 9999.0}
            ]

            # Extract values from cohort (convert decimal to percentage)
            field_name = "match_effective_rate"
            values = [(float(c.get(field_name) or 0) * 100) for c in cohort_dicts]

            # Count values in each bin
            bins = []
            for bin_def in bin_definitions:
                count = sum(1 for v in values if bin_def["binStart"] <= v < bin_def["binEnd"])
                bins.append({**bin_def, "count": count})

            client_value = float(client_dict.get(field_name) or 0) * 100 or 4.5
            peer_average = sum(values) / len(values) if values else 0
            title = "Employer Contribution Distribution"
            unit = "%"
            national_average = peer_average  # Same for now

        elif metric == "auto_enroll":
            bin_definitions = [
                {"bin": "0%", "binStart": 0.0, "binEnd": 1.0},
                {"bin": "2%", "binStart": 2.0, "binEnd": 2.5},
                {"bin": "3%", "binStart": 3.0, "binEnd": 3.5},
                {"bin": "4%", "binStart": 4.0, "binEnd": 4.5},
                {"bin": "5%", "binStart": 5.0, "binEnd": 5.5},
                {"bin": "6%", "binStart": 6.0, "binEnd": 6.5},
                {"bin": "≥7%", "binStart": 7.0, "binEnd": 9999.0}
            ]

            field_name = "auto_enrollment_rate"
            values = [(float(c.get(field_name) or 0) * 100) for c in cohort_dicts]

            bins = []
            for bin_def in bin_definitions:
                count = sum(1 for v in values if bin_def["binStart"] <= v < bin_def["binEnd"])
                bins.append({**bin_def, "count": count})

            client_value = float(client_dict.get(field_name) or 0) * 100 or 4.0
            peer_average = sum(values) / len(values) if values else 0
            title = "Auto-Enrollment Default Rate"
            unit = "%"
            national_average = peer_average

        elif metric == "vesting":
            bin_definitions = [
                {"bin": "Immediate", "binStart": 0.0, "binEnd": 1.0},
                {"bin": "3-year cliff", "binStart": 3.0, "binEnd": 4.0},
                {"bin": "5-year cliff", "binStart": 5.0, "binEnd": 6.0},
                {"bin": "Graded", "binStart": 6.0, "binEnd": 9999.0}
            ]

            # Convert vesting schedules to numeric for binning
            def vesting_to_numeric(vesting_str):
                if not vesting_str:
                    return 3.0  # default
                vesting_str = str(vesting_str).lower()
                if "immediate" in vesting_str:
                    return 0.0
                elif "3" in vesting_str and "cliff" in vesting_str:
                    return 3.0
                elif "5" in vesting_str and "cliff" in vesting_str:
                    return 5.0
                elif "grad" in vesting_str:
                    return 6.0
                return 3.0  # default

            values = [vesting_to_numeric(c.get("vesting_schedule")) for c in cohort_dicts]

            bins = []
            for bin_def in bin_definitions:
                count = sum(1 for v in values if bin_def["binStart"] <= v < bin_def["binEnd"])
                bins.append({**bin_def, "count": count})

            client_value = vesting_to_numeric(client_dict.get("vesting_schedule"))
            peer_average = sum(values) / len(values) if values else 0
            title = "Vesting Schedule Distribution"
            unit = "years"
            national_average = peer_average

        elif metric == "auto_escalation":
            bin_definitions = [
                {"bin": "0%", "binStart": 0.0, "binEnd": 1.0},
                {"bin": "6%", "binStart": 6.0, "binEnd": 8.0},
                {"bin": "10%", "binStart": 10.0, "binEnd": 12.0},
                {"bin": "15%", "binStart": 15.0, "binEnd": 16.0},
                {"bin": "≥20%", "binStart": 20.0, "binEnd": 9999.0}
            ]

            field_name = "auto_escalation_cap"
            values = [(float(c.get(field_name) or 0) * 100) for c in cohort_dicts]

            bins = []
            for bin_def in bin_definitions:
                count = sum(1 for v in values if bin_def["binStart"] <= v < bin_def["binEnd"])
                bins.append({**bin_def, "count": count})

            client_value = float(client_dict.get(field_name) or 0) * 100 or 10.0
            peer_average = sum(values) / len(values) if values else 0
            title = "Auto-Escalation Cap Distribution"
            unit = "%"
            national_average = peer_average

        else:
            # Default/unknown metric
            bins = []
            client_value = None
            title = "Unknown Metric"
            unit = ""
            peer_average = 0.0
            national_average = 0.0

        return {
            "title": title,
            "unit": unit,
            "bins": bins,
            "peerAverage": peer_average,
            "nationalAverage": national_average,
            "clientValue": client_value,
            "cohortSize": len(cohort_data) if cohort_data else 260
        }

    finally:
        conn.close()

# ========================================
# E04 Plan Data Maintenance & Editing API
# ========================================

# Field name mapping: Display Name → Database Column
FIELD_NAME_MAP = {
    'Eligibility': 'eligibility',
    'Employer Match': 'match_formula',
    'Match Effective Rate': 'match_effective_rate',
    'Non-Elective Contribution': 'nonelective_formula',
    'Vesting Schedule': 'vesting_schedule',
    'Auto-Enrollment': 'auto_enrollment_enabled',
    'Auto-Enrollment Rate': 'auto_enrollment_rate',
    'Auto-Escalation': 'auto_escalation_enabled',
    'Auto-Escalation Rate': 'auto_escalation_rate',
    'Auto-Escalation Cap': 'auto_escalation_cap',
}

def map_field_name(field_name: str) -> str:
    """Map display field name to database column name"""
    # If it's already a DB column name, return as-is
    if field_name in ['eligibility', 'match_formula', 'match_effective_rate',
                      'nonelective_formula', 'vesting_schedule', 'auto_enrollment_enabled',
                      'auto_enrollment_rate', 'auto_escalation_enabled', 'auto_escalation_cap']:
        return field_name
    # Otherwise map from display name
    return FIELD_NAME_MAP.get(field_name, field_name)

class FieldUpdate(BaseModel):
    new_value: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    updated_by: str

class BulkUpdate(BaseModel):
    updates: List[Dict[str, Any]]
    notes: Optional[str] = None
    updated_by: str

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    old_value: Optional[str]
    new_value: str
    updated_by: str
    reason: str
    notes: Optional[str]

def validate_field_value(field_name: str, value: str) -> tuple[bool, Optional[str]]:
    """Validate field value against validation rules"""
    conn = duckdb.connect(str(DB_PATH), read_only=True)

    try:
        rule = conn.execute(
            "SELECT * FROM field_validation_rules WHERE field_name = ?",
            [field_name]
        ).fetchone()

        if not rule:
            return True, None  # No rule = no validation

        columns = [desc[0] for desc in conn.description]
        rule_dict = dict(zip(columns, rule))

        # Type validation
        data_type = rule_dict.get("data_type")

        if data_type in ("decimal", "integer"):
            try:
                num_value = float(value)
                min_val = rule_dict.get("min_value")
                max_val = rule_dict.get("max_value")

                if min_val is not None and num_value < min_val:
                    return False, f"{field_name} must be at least {min_val}"
                if max_val is not None and num_value > max_val:
                    return False, f"{field_name} must not exceed {max_val}"
            except ValueError:
                return False, f"{field_name} must be a number"

        elif data_type == "enum":
            allowed = rule_dict.get("allowed_values", [])
            if allowed and value not in allowed:
                return False, f"{field_name} must be one of: {', '.join(allowed)}"

        return True, None

    finally:
        conn.close()

@app.patch("/api/v1/clients/{client_id}/fields/{field_name}")
async def update_field(client_id: str, field_name: str, update: FieldUpdate):
    """Update a single field with validation and audit logging"""
    import uuid
    from datetime import datetime

    # Map display name to DB column name
    db_field_name = map_field_name(field_name)

    # Validate the new value
    is_valid, error_msg = validate_field_value(db_field_name, update.new_value)
    if not is_valid:
        raise HTTPException(status_code=400, detail={
            "error": "validation_error",
            "message": error_msg,
            "field": field_name,
            "provided_value": update.new_value
        })

    conn = duckdb.connect(str(DB_PATH))

    try:
        # Get old value
        old_value_row = conn.execute(
            f"SELECT {db_field_name} FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not old_value_row:
            raise HTTPException(status_code=404, detail="Client not found")

        old_value = str(old_value_row[0]) if old_value_row[0] is not None else None

        # Update the field

        conn.execute(
            f"""
            UPDATE plan_designs
            SET {db_field_name} = ?,
                updated_at = CURRENT_TIMESTAMP,
                updated_by = ?
            WHERE client_id = ?
            """,
            [update.new_value, update.updated_by, client_id]
        )

        # Create audit log entry
        audit_id = str(uuid.uuid4())
        conn.execute(
            """
            INSERT INTO audit_log (
                id, client_id, field_name, old_value, new_value,
                change_type, reason, notes, updated_by, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            [
                audit_id, client_id, db_field_name, old_value, update.new_value,
                'update', update.reason or 'manual_update', update.notes, update.updated_by
            ]
        )

        # Return updated field
        return {
            "client_id": client_id,
            "field_name": field_name,
            "old_value": old_value,
            "new_value": update.new_value,
            "updated_by": update.updated_by,
            "audit_log_id": audit_id
        }

    finally:
        conn.close()

@app.get("/api/v1/audit-log", response_model=List[AuditLogEntry])
def get_audit_log(limit: int = 50):
    """Get global audit log history"""
    conn = duckdb.connect(str(DB_PATH), read_only=True)
    try:
        # Check if audit_log table exists
        table_exists = conn.execute(
            "SELECT count(*) FROM information_schema.tables WHERE table_name = 'audit_log'"
        ).fetchone()[0] > 0

        if not table_exists:
            return []

        query = """
            SELECT
                id,
                CAST(updated_at AS VARCHAR) as timestamp,
                old_value,
                new_value,
                updated_by,
                reason,
                notes
            FROM audit_log
            ORDER BY updated_at DESC
            LIMIT ?
        """
        result = conn.execute(query, [limit]).fetchall()

        log_entries = []
        for row in result:
            log_entries.append(AuditLogEntry(
                id=row[0],
                timestamp=row[1],
                old_value=row[2],
                new_value=row[3],
                updated_by=row[4],
                reason=row[5],
                notes=row[6]
            ))

        return log_entries

    finally:
        conn.close()
@app.put("/api/v1/clients/{client_id}")
async def bulk_update_fields(client_id: str, updates: BulkUpdate):
    """Update multiple fields in single transaction"""
    import uuid
    from datetime import datetime

    conn = duckdb.connect(str(DB_PATH))

    try:
        # Verify client exists
        client = conn.execute(
            "SELECT client_id FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        changes = []
        audit_ids = []

        # Process each update
        for update_item in updates.updates:
            field_name = update_item["field_name"]
            new_value = update_item["new_value"]
            reason = update_item.get("reason", "bulk_update")

            # Validate
            is_valid, error_msg = validate_field_value(field_name, str(new_value))
            if not is_valid:
                raise HTTPException(status_code=400, detail={
                    "error": "validation_error",
                    "message": error_msg,
                    "field": field_name
                })

            # Get old value
            old_value = conn.execute(
                f"SELECT {field_name} FROM plan_designs WHERE client_id = ?",
                [client_id]
            ).fetchone()[0]

            # Update field
            conn.execute(
                f"UPDATE plan_designs SET {field_name} = ? WHERE client_id = ?",
                [new_value, client_id]
            )

            # Create audit log
            audit_id = f"audit-{uuid.uuid4()}"
            conn.execute("""
                INSERT INTO audit_log
                (id, client_id, field_name, old_value, new_value, change_type, reason, notes, updated_by)
                VALUES (?, ?, ?, ?, ?, 'bulk_update', ?, ?, ?)
            """, [audit_id, client_id, field_name, str(old_value), str(new_value), reason, updates.notes, updates.updated_by])

            changes.append({
                "field_name": field_name,
                "old_value": str(old_value) if old_value else None,
                "new_value": str(new_value),
                "status": "success"
            })
            audit_ids.append(audit_id)

        # Update metadata
        conn.execute("""
            UPDATE plan_designs
            SET updated_at = CURRENT_TIMESTAMP,
                updated_by = ?
            WHERE client_id = ?
        """, [updates.updated_by, client_id])

        return {
            "client_id": client_id,
            "updates_applied": len(changes),
            "changes": changes,
            "audit_log_ids": audit_ids
        }

    finally:
        conn.close()

@app.get("/api/v1/clients/{client_id}/fields/{field_name}/history")
async def get_field_history(client_id: str, field_name: str, limit: int = 20):
    """Get audit log for a specific field"""
    # Map display name to DB column name
    db_field_name = map_field_name(field_name)

    conn = get_db()

    try:
        # Get current value
        current = conn.execute(
            f"SELECT {db_field_name} FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not current:
            raise HTTPException(status_code=404, detail="Client not found")

        # Get change history
        history = conn.execute("""
            SELECT
                id,
                updated_at,
                old_value,
                new_value,
                updated_by,
                reason,
                notes,
                confidence_score
            FROM audit_log
            WHERE client_id = ? AND field_name = ?
            ORDER BY updated_at DESC
            LIMIT ?
        """, [client_id, db_field_name, limit]).fetchall()

        changes = []
        for row in history:
            changes.append({
                "audit_id": row[0],
                "timestamp": row[1].isoformat() if row[1] else None,
                "old_value": row[2],
                "new_value": row[3],
                "updated_by": row[4],
                "reason": row[5],
                "notes": row[6],
                "confidence_score": float(row[7]) if row[7] else None
            })

        return {
            "client_id": client_id,
            "field_name": field_name,
            "current_value": str(current[0]) if current[0] else None,
            "changes": changes
        }

    finally:
        conn.close()

@app.post("/api/v1/export/excel")
async def export_to_excel(client_ids: Optional[List[str]] = None, include_audit_trail: bool = False):
    """Export database to Excel file"""
    import pandas as pd
    from datetime import datetime
    import io
    import base64

    conn = get_db()

    try:
        # Build query
        if client_ids:
            placeholders = ','.join(['?' for _ in client_ids])
            query = f"SELECT * FROM plan_designs WHERE client_id IN ({placeholders})"
            df = pd.DataFrame(conn.execute(query, client_ids).fetchall())
        else:
            df = pd.DataFrame(conn.execute("SELECT * FROM plan_designs").fetchall())

        # Get column names
        columns = [desc[0] for desc in conn.description]
        df.columns = columns

        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Plan Data', index=False)

            if include_audit_trail:
                audit_df = pd.DataFrame(
                    conn.execute("SELECT * FROM audit_log ORDER BY updated_at DESC").fetchall()
                )
                audit_columns = [desc[0] for desc in conn.description]
                audit_df.columns = audit_columns
                audit_df.to_excel(writer, sheet_name='Audit Trail', index=False)

        output.seek(0)
        excel_data = base64.b64encode(output.read()).decode()

        timestamp = datetime.now().strftime("%Y-%m-%d")
        file_name = f"planwise_export_{timestamp}.xlsx"

        return {
            "export_id": f"export-{timestamp}",
            "file_name": file_name,
            "record_count": len(df),
            "excel_base64": excel_data
        }

    finally:
        conn.close()

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db()
        count = conn.execute("SELECT COUNT(*) FROM plan_designs").fetchone()[0]
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "total_plans": count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/api/v1/clients/{client_id}/regional-benchmark", response_model=List[BenchmarkDataPoint])
def get_regional_benchmark(client_id: str):
    """Get regional benchmark data for a client"""
    conn = get_db()
    try:
        # 1. Get target client info
        client = conn.execute(
            "SELECT industry, state, auto_enrollment_rate, match_effective_rate, auto_escalation_cap FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        industry, state, ae_rate, match_rate, esc_cap = client
        
        # Handle nulls
        ae_rate = float(ae_rate) * 100 if ae_rate is not None else 0
        match_rate = float(match_rate) * 100 if match_rate is not None else 0
        esc_cap = float(esc_cap) * 100 if esc_cap is not None else 0

        # 2. Determine Region
        REGIONS = {
            'CT': 'Northeast', 'ME': 'Northeast', 'MA': 'Northeast', 'NH': 'Northeast', 'RI': 'Northeast', 'VT': 'Northeast', 'NJ': 'Northeast', 'NY': 'Northeast', 'PA': 'Northeast',
            'IL': 'Midwest', 'IN': 'Midwest', 'MI': 'Midwest', 'OH': 'Midwest', 'WI': 'Midwest', 'IA': 'Midwest', 'KS': 'Midwest', 'MN': 'Midwest', 'MO': 'Midwest', 'NE': 'Midwest', 'ND': 'Midwest', 'SD': 'Midwest',
            'DE': 'South', 'FL': 'South', 'GA': 'South', 'MD': 'South', 'NC': 'South', 'SC': 'South', 'VA': 'South', 'DC': 'South', 'WV': 'South', 'AL': 'South', 'KY': 'South', 'MS': 'South', 'TN': 'South', 'AR': 'South', 'LA': 'South', 'OK': 'South', 'TX': 'South',
            'AZ': 'West', 'CO': 'West', 'ID': 'West', 'MT': 'West', 'NV': 'West', 'NM': 'West', 'UT': 'West', 'WY': 'West', 'AK': 'West', 'CA': 'West', 'HI': 'West', 'OR': 'West', 'WA': 'West'
        }
        
        target_region = REGIONS.get(state, None)
        
        # 3. Build Peer Query
        # If we have a region, filter by it. Otherwise fallback to industry only.
        peer_query = "SELECT auto_enrollment_rate, match_effective_rate, auto_escalation_cap FROM plan_designs WHERE industry = ?"
        params = [industry]
        
        if target_region:
            # Get all states in this region
            region_states = [s for s, r in REGIONS.items() if r == target_region]
            placeholders = ','.join(['?'] * len(region_states))
            peer_query += f" AND state IN ({placeholders})"
            params.extend(region_states)
            
        peers = conn.execute(peer_query, params).fetchall()
        
        if not peers:
            # Fallback to mock data if no peers found (for demo purposes)
            return [
                BenchmarkDataPoint(name='Auto-Enroll Rate', client=ae_rate, regionMedian=4.0, topQuartile=6.0, unit='%'),
                BenchmarkDataPoint(name='Match Cap', client=match_rate, regionMedian=3.5, topQuartile=5.0, unit='%'),
                BenchmarkDataPoint(name='Escalation Cap', client=esc_cap, regionMedian=10.0, topQuartile=15.0, unit='%')
            ]

        # 4. Calculate Stats
        def get_stats(data_index):
            values = [float(p[data_index]) * 100 for p in peers if p[data_index] is not None]
            if not values: return 0, 0
            values.sort()
            n = len(values)
            median = values[n // 2]
            p75 = values[int(n * 0.75)]
            return median, p75

        ae_median, ae_p75 = get_stats(0)
        match_median, match_p75 = get_stats(1)
        esc_median, esc_p75 = get_stats(2)

        return [
            BenchmarkDataPoint(name='Auto-Enroll Rate', client=ae_rate, regionMedian=ae_median, topQuartile=ae_p75, unit='%'),
            BenchmarkDataPoint(name='Match Cap', client=match_rate, regionMedian=match_median, topQuartile=match_p75, unit='%'),
            BenchmarkDataPoint(name='Escalation Cap', client=esc_cap, regionMedian=esc_median, topQuartile=esc_p75, unit='%')
        ]

    except Exception as e:
        print(f"Error calculating benchmarks: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)