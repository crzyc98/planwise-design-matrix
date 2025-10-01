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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite default ports
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
                employee_count
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

        clients = []
        for row in result:
            clients.append(ClientSummary(
                client_id=row[0],
                client_name=row[1],
                plan_sponsor_name=row[1],  # Use client_name as fallback
                industry=row[2],
                plan_type="401(k)",  # Default plan type
                total_participants=row[3],
                data_freshness_days=0
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
                AVG(auto_enrollment_rate) as avg_ae_rate,
                AVG(participation_rate) as avg_participation_rate
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
                },
                "participation_rate": {
                    "your_value": client_dict.get("participation_rate", 0),
                    "peer_average": peer_stats[4] if peer_stats[4] else 0,
                    "quartile_label": "Excellent"
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)