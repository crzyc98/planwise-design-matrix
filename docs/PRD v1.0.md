# Product Requirements Document
## PlanWise Design Matrix

**Version:** 4.0 (Hybrid Extraction Architecture)
**Date:** September 2025
**Document Owner:** Product Management, PlanWise Platform
**Technical Lead:** Engineering, Data Platform
**Stakeholders:** Sales, Consulting, Compliance, Data Governance
**Status:** Production Specification

**Revision Notes (v4.0):**
- Replaced external LLM API dependencies with hybrid extraction approach (rules-based + Azure + manual)
- Added Phase 0 (manual baseline) to demonstrate value immediately
- Repositioned extraction as input rather than core value proposition
- Updated technical architecture to reflect corporate environment constraints
- Maintained all peer benchmarking, recommendation engine, and deliverable generation capabilities

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement & Market Context](#problem-statement--market-context)
3. [Product Vision & Strategy](#product-vision--strategy)
4. [User Personas & Workflows](#user-personas--workflows)
5. [Functional Requirements](#functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Data Models & Schemas](#data-models--schemas)
8. [API Specifications](#api-specifications)
9. [Document Processing Pipeline](#document-processing-pipeline)
10. [Integration Architecture](#integration-architecture)
11. [Security, Compliance & Governance](#security-compliance--governance)
12. [Performance & Scalability](#performance--scalability)
13. [Monitoring & Observability](#monitoring--observability)
14. [Implementation Roadmap](#implementation-roadmap)
15. [Risk Management](#risk-management)
16. [Success Metrics & KPIs](#success-metrics--kpis)
17. [Appendices](#appendices)

---

## Executive Summary

### Overview

The PlanWise Design Matrix is an enterprise intelligence platform that transforms unstructured retirement plan documents into a queryable knowledge graph, enabling data-driven advisory services for 850+ tax-exempt defined contribution (DC) plans representing $45B+ in assets under advisement.

### Business Impact

**Current State Pain Points:**
- Account Executives spend 6-12 hours creating manual peer comparisons per client
- No systematic way to identify at-risk plans or expansion opportunities
- Peer analysis quality varies significantly across team members
- Recommendations lack statistical rigor and evidence citations
- Navigator scenario modeling requires manual data gathering (2-3 weeks per engagement)

**Target State Outcomes:**
- **10x efficiency:** Peer analysis from 8 hours → 45 minutes
- **Revenue impact:** Enable $5M+ in incremental consulting revenue through data-driven opportunity identification
- **Quality improvement:** Standardized, statistically rigorous comparisons across all 850 clients
- **Strategic positioning:** Differentiated advisory capability vs. competitors

### Core Capabilities

1. **Human-Validated Document Intelligence:** Extract 60+ plan design features from Form 5500s, SPDs, and plan documents with 95%+ accuracy after review (hybrid rules-based + Azure + human validation)
2. **Statistical Peer Benchmarking:** Generate cohort comparisons with k-anonymity guarantees and significance testing
3. **Recommendation Engine:** Produce evidence-based optimization suggestions with impact modeling
4. **Compliance-Controlled Deliverables:** Auto-generate client presentations with pre-approved language and watermarking
5. **PlanWise Navigator Integration:** One-click export of baseline designs and recommendations for scenario modeling

### Platform Architecture

- **Backend:** FastAPI (Python 3.11+), async/await for I/O operations
- **Database:** DuckDB for OLAP workloads with Parquet backing
- **Document Processing:** PDFPlumber + regex patterns + Azure Form Recognizer + manual review queue
- **Task Queue:** Celery with Redis for document processing
- **Deployment:** Docker containers on AWS ECS with Application Load Balancer
- **Monitoring:** Prometheus metrics, Grafana dashboards, CloudWatch logs

---

## Problem Statement & Market Context

### Current Advisory Workflow Limitations

**Manual Data Gathering:**
- Consultants spend 15-20 hours per client gathering baseline plan design data
- Form 5500 analysis is manual and error-prone
- No centralized repository of plan designs across 850-client book

**Inconsistent Peer Analysis:**
- Peer group construction varies by individual analyst
- No statistical rigor in comparisons (sample size, significance testing)
- Manual Excel-based analysis doesn't scale
- Senior consultants produce better insights than junior staff (quality variance)

**Slow Recommendation Development:**
- Recommendations based on intuition rather than data
- No systematic way to measure impact or prioritize initiatives
- Missing cost/benefit analysis and implementation complexity scoring

**Navigator Integration Gap:**
- 2-3 weeks to prepare baseline data for scenario modeling
- Manual YAML file creation prone to errors
- No feedback loop from modeled outcomes back to Design Matrix

### Market Opportunity

**Internal Efficiency:**
- 850 clients × 2 reviews/year × 8 hours saved = 13,600 hours/year saved
- At $200/hour blended rate = $2.7M in internal capacity unlocked

**Revenue Expansion:**
- Data-driven opportunity identification enables proactive consulting outreach
- Estimated 50 additional consulting engagements/year at $100K average = $5M incremental revenue
- Differentiated capability vs. competitors (none have comparable benchmarking infrastructure)

**Client Retention:**
- Proactive insights increase stickiness and reduce churn risk
- Data-driven reviews demonstrate value beyond transactional services

### Strategic Alignment

This platform is foundational to PlanWise's evolution from transactional recordkeeping advisor to strategic partner with proprietary data insights. It positions us uniquely in the market and creates defensible competitive moats.

---

## Product Vision & Strategy

### Vision Statement

"Enable every client conversation to be informed by comprehensive, statistically rigorous peer insights delivered instantly, transforming PlanWise from reactive advisor to proactive strategic partner."

### Product Principles

1. **Data Quality Over Speed:** Never sacrifice accuracy for automation
2. **Statistical Rigor:** All comparisons must be defensible with proper methodology
3. **Compliance First:** No export without review; locked language templates
4. **Seamless Integration:** Design Matrix feeds Navigator; Navigator outcomes feed back
5. **Progressive Disclosure:** Simple for AEs, powerful for consultants

### 3-Year Product Roadmap

**Year 1 (Current):** Core platform with extraction, benchmarking, and PowerPoint generation
**Year 2:** Predictive analytics (churn risk, opportunity scoring), mobile app for AEs
**Year 3:** Participant-level analysis integration, real-time plan health monitoring, API for external partners

---

## User Personas & Workflows

### Persona 1: Account Executive "Sarah"

**Profile:**
- Manages 30-40 DC plan relationships
- Client-facing role with limited technical depth
- Needs quick answers during client calls
- Success = "I look knowledgeable and data-driven in every meeting"

**Primary Workflows:**

**Workflow A: Pre-Meeting Prep (15 minutes)**
1. Log into Design Matrix
2. Select client from dropdown
3. View auto-generated peer comparison dashboard
4. Note 2-3 talking points (gaps, strengths)
5. Export 1-page peer snapshot PDF for meeting notes

**Workflow B: Client Question Response (Real-time)**
1. Client asks: "Are we competitive on auto-enrollment?"
2. Sarah pulls up Design Matrix on phone/tablet
3. Views peer benchmark: "You're at 3% default, peers average 4.2%, top quartile is 6%"
4. Offers to have consultant do deep-dive if client interested

**Success Metrics:**
- Uses Design Matrix in 60%+ of client meetings
- Client satisfaction scores improve
- Identifies 2+ consulting opportunities per quarter

---

### Persona 2: Consultant "David"

**Profile:**
- Deep retirement plan expertise
- Runs 10-15 optimization projects per year
- Needs comprehensive data and modeling inputs
- Success = "I start projects with perfect baseline and deliver faster"

**Primary Workflows:**

**Workflow C: Consulting Engagement Kickoff (2 hours)**
1. Client assigned for plan optimization project
2. David opens Design Matrix, selects client
3. Reviews extraction quality; flags any low-confidence fields for review
4. Builds custom peer cohort with specific filters (industry, size, geography)
5. Generates statistical comparison report showing all significant gaps
6. Exports baseline YAML to Navigator for scenario modeling
7. Runs 3-5 scenarios in Navigator testing different design changes
8. Imports modeled outcomes (participation lift, deferral rate impact) back to Design Matrix
9. Generates prioritized recommendation list with impact bands
10. Exports to PowerPoint for client presentation

**Workflow D: Annual Plan Review (1 hour)**
1. Batch process all 100 assigned clients for annual reviews
2. Design Matrix flags clients with new competitive gaps vs. last year
3. David reviews top 10 priority clients identified by system
4. Generates refresh decks for each showing year-over-year changes

**Success Metrics:**
- Consulting projects start 2 weeks faster
- Recommendation quality scores improve (peer review)
- Client acceptance rate of recommendations increases

---

### Persona 3: Compliance Reviewer "Jennifer"

**Profile:**
- Legal/compliance background
- Reviews all client-facing materials
- Concerned about regulatory risk and reputational damage
- Success = "Nothing goes out that could create liability"

**Primary Workflows:**

**Workflow E: Export Review Queue (30 minutes daily)**
1. Jennifer receives notification of pending exports
2. Opens Review Console showing all exports awaiting approval
3. For each export:
   - Reviews cohort size (flags if n < 20)
   - Checks data freshness (flags if >12 months old)
   - Verifies disclaimer language is present
   - Confirms no low-confidence fields in export
   - Reviews any custom language added by consultant
4. Approves or rejects with comments
5. System logs all decisions with timestamp and reason code

**Success Metrics:**
- Zero regulatory incidents related to peer comparisons
- Average review time < 5 minutes per export
- Rejection rate < 5%

---

## Non-Functional Requirements & SLOs

### Performance SLOs
- **Peer query latency:** p95 ≤ 1.5s; p99 ≤ 3.0s
- **Deck generation:** ≤ 8 min p95
- **Extraction accuracy:** ≥ 75-80% automated extraction; ≥ 95% after human validation
- **Cohort k-anonymity floor:** n ≥ 20; minimum 3 independent comparators
- **Deck QA defect rate:** ≤ 2% per 100 exports
- **Review queue SLA:** 95% of low-confidence fields resolved within 3 business days

### Availability & Reliability
- **System availability:** 99.5% during business hours (7am-7pm ET)
- **Data freshness:** Annual refresh required; stale data banner after 12 months
- **Backup RPO:** 24 hours
- **Backup RTO:** 4 hours

---

### Persona 4: Relationship Manager "Michael"

**Profile:**
- Oversees 100+ smaller clients (<$50M in assets)
- Proactive relationship management at scale
- Needs to identify at-risk clients and expansion opportunities
- Success = "I know which 10 clients need attention this month"

**Primary Workflows:**

**Workflow F: Portfolio Health Review (2 hours weekly)**
1. Opens Portfolio Dashboard view showing all 100 assigned clients
2. Sorts by risk indicators:
   - Plans with growing gaps vs. peers (competitiveness declining)
   - Plans with participation <60% (regulatory/fiduciary risk)
   - Plans unchanged in 3+ years (staleness risk)
3. Selects top 10 priority clients
4. Generates batch export of 1-page summaries for each
5. Schedules proactive outreach calls with talking points

**Success Metrics:**
- Identifies 5+ expansion opportunities per quarter
- Reduces churn by spotting at-risk plans early
- Portfolio health scores improve year-over-year

---

## Functional Requirements

### Core Capabilities

#### 1. Document Intelligence Engine - Hybrid Approach

**The Platform's Core Value Proposition:**
The PlanWise Design Matrix delivers value through **statistical peer benchmarking, recommendation intelligence, and automated deliverable generation**—not just extraction automation. Data can flow from any source: automated extraction, manual entry, or Excel import. The platform's intelligence layer transforms this data into actionable insights.

**Three-Tier Extraction Strategy:**

**Tier 1: Rules-Based Pattern Matching (Primary - 70% target automation)**
- **Input Formats:** PDF (Form 5500, SPD, plan documents), DOCX, scanned images (OCR via pytesseract)
- **Python Libraries:** PDFPlumber, PyPDF2, Camelot (table extraction), python-docx
- **Pattern Library:** Regex patterns for structured fields in Form 5500 Schedule H/I
- **Target Fields (30+ high-confidence extractions):**
  - Plan identification (EIN, plan number, plan name)
  - Basic demographics (participant count, total assets)
  - Yes/no provisions (match offered, loans available, auto-enrollment present)
  - Standard numerical fields from Form 5500 checkboxes

**Tier 2: Azure Form Recognizer (Secondary - If available in corporate tenant)**
- **Custom Trained Models:** Train on 50-100 sample documents per recordkeeper
- **Semi-Structured Document Handling:** SPD layouts from Fidelity, Vanguard, TIAA, Empower
- **Target Fields (20+ moderate complexity):**
  - Match formulas in narrative format
  - Vesting schedules in table format
  - Eligibility rules with multiple conditions
- **Deployment:** Azure Cognitive Services within corporate Azure tenant
- **Fallback:** If Azure Form Recognizer unavailable, route to manual review

**Tier 3: Manual Review Queue with Copilot 365 Assistance**
- **Complex Extractions:** Non-standard match formulas, complex vesting, plan-specific provisions
- **Review Interface:** Side-by-side document viewer + structured form entry
- **Copilot Integration:** Users leverage Microsoft Copilot 365 manually to assist interpretation
- **Quality Assurance:** All automated extractions below confidence threshold require manual validation

**Validation & Confidence Scoring:**
- **Rule-Based Validation:** Cross-field consistency checks (e.g., can't have match without vesting)
- **Confidence Score:** 0-100% per field based on:
  - Pattern match strength (exact match = 95%, fuzzy match = 70-85%)
  - Number of supporting mentions in document
  - Consistency across multiple documents for same plan
  - Cross-validation with Form 5500 structured data
- **Tier Classification:**
  - Tier-1 fields (critical): Require 80%+ confidence for auto-accept
  - Tier-2 fields (standard): Require 70%+ confidence for auto-accept
  - Below threshold: Queue for human review
  - **All fields validated by human before client-facing export (95%+ final accuracy)**

**Data Lineage & Provenance:**
- Every extracted value links to source document, page number, extraction method
- Audit trail: extraction timestamp, extraction method (regex/Azure/manual), confidence score, reviewer actions
- Immutable log of all edits with before/after values

**Alternative Data Entry Methods:**
- **Direct YAML Entry:** Form-based UI for manual entry following plan schema
- **Excel Bulk Import:** Template-based import for multiple plans (migration from legacy systems)
- **API Integration:** Ingest from recordkeeper data feeds (future state)

---

#### 2. Annotation & Review Console + Manual Data Entry Interface

**Review Queue Interface:**
- **Prioritized Queue:** Low-confidence fields sorted by business criticality
- **Side-by-Side View:**
  - Left: PDF viewer with extraction highlighted (if automated extraction attempted)
  - Center: Extracted value with confidence score and schema definition
  - Right: Reviewer action panel (accept/edit/reject/flag for escalation)
- **Bulk Actions:** Approve all high-confidence, batch assign to reviewers
- **SLA Tracking:** Days in queue, target resolution time, overdue indicators
- **Copilot Assistance Indicator:** Banner reminding users they can leverage Copilot 365 for document interpretation

**Reviewer Actions:**
- **Accept:** Validate extraction as correct
- **Edit:** Correct value and provide reason code
- **Reject:** Mark as "cannot determine from document" with explanation
- **Flag:** Escalate to subject matter expert with specific question
- **Comment:** Add context or notes for future reference

**Manual Data Entry Interface (New Plan Creation):**
- **Form-Based YAML Editor:** Guided form following PlanDesign schema with inline validation
- **Smart Defaults:** Pre-populate common values (e.g., age 21 eligibility, immediate vesting for deferrals)
- **Contextual Help:** Inline definitions for each field with regulatory context
- **Progress Tracking:** Show completion percentage (required vs. optional fields)
- **Document Attachments:** Link source documents for audit trail even for manual entry
- **Excel Import:** Bulk upload via standardized Excel template (map columns to schema fields)
- **Template Library:** Save and reuse plan templates for recordkeeper-specific patterns

**Provenance Tracking:**
- Immutable audit log: user ID, action, timestamp, before/after values, reason code, entry method
- Reviewer performance metrics: accuracy, throughput, consensus with peers
- Manual entry audit: Track which fields entered manually vs. extracted

---

#### 3. Design Matrix Database

**Schema Design:**
```python
# Core entity: PlanDesign
PlanDesign:
  client_id: str  # Unique identifier
  plan_sponsor_name: str
  client_name: str
  industry: str  # NAICS 2-digit code
  total_participants: int
  total_assets: Decimal
  geography: str  # State or multi-state

  # Nested plan provisions (60+ fields)
  eligibility: str  # e.g., "Immediate", "1 year", "1000 hours"
  contributions: ContributionProvisions
  vesting: VestingSchedule
  investments: InvestmentOptions
  loans: LoanProvisions
  distributions: DistributionRules

  # Metadata
  data_source: Enum[Form5500, SPD, PlanDoc, ManualEntry, ExcelImport]
  extraction_date: DateTime
  extraction_method: Enum[RegexPattern, AzureFormRecognizer, ManualEntry, ExcelImport]
  confidence_scores: Dict[str, float]  # Per-field confidence
  reviewed_by: Optional[str]
  review_date: Optional[DateTime]
  last_updated: DateTime
  data_version: int
```

**Storage Implementation:**
- **DuckDB:** In-process analytical database for OLAP queries
- **Parquet Files:** Columnar storage for efficient scans and compression
- **Partitioning:** By plan_type and industry for query optimization
- **Indexing:** B-tree indexes on plan_id, industry, total_participants

**Query Performance:**
- Materialized views for common cohort queries
- Pre-computed percentiles refreshed nightly
- Query result caching with 1-hour TTL

---

#### 4. Peer Benchmarking System with Statistical Rigor

**Cohort Construction Algorithm:**
```python
def build_peer_cohort(target_client: PlanDesign, filters: Dict) -> List[PlanDesign]:
    """
    Construct peer cohort using weighted similarity scoring.

    Similarity weights:
    - Industry (50%): Exact NAICS 2-digit match
    - Size (40%): Participant count within ±50% band
    - Geography (10%): Same state or region

    Returns: List of peer plans with n ≥ 20 (k-anonymity floor)
    """
    pass
```

**Statistical Methods:**
```python
# Two-proportion z-test for adoption gaps
def compare_adoption_rates(target: float, peer_mean: float, peer_n: int) -> Dict:
    """
    Returns: {
        'z_score': float,
        'p_value': float,
        'significant': bool,  # True if p < 0.05
        'effect_size': float,  # Cohen's h
        'confidence_interval': (float, float)  # 95% CI
    }
    """
    pass

# Percentile calculations with interpolation
def calculate_percentile(target_value: float, peer_values: List[float]) -> Dict:
    """
    Returns: {
        'percentile': int,  # 0-100
        'quartile': int,  # 1-4
        'label': str,  # 'Below Average', 'Average', 'Above Average', 'Top Quartile'
        'peers_below': int,
        'peers_above': int
    }
    """
    pass
```

**K-Anonymity Enforcement:**
- Suppress any metric where cohort size n < 20
- Display warning: "Insufficient peer data (n < 20) for this comparison"
- For sensitive slices (e.g., specific employer), require n ≥ 50

**Significance Testing:**
- All comparisons include p-value and effect size
- Flag as "Not statistically significant" if p ≥ 0.05
- Display confidence intervals for all percentages

---

#### 5. Recommendation Engine with Explainability

**Gap Identification:**
```python
def identify_gaps(client: PlanDesign, peer_cohort: List[PlanDesign]) -> List[Gap]:
    """
    Returns gaps where:
    1. Target client differs from peer median by >10 percentile points
    2. Difference is statistically significant (p < 0.05)
    3. Effect size is meaningful (Cohen's h > 0.2)
    """
    pass
```

**Impact Modeling:**
- **Participation Impact:** Based on academic research (Madrian & Shea 2001, Beshears et al. 2013)
  - Auto-enrollment: +15-30 ppt participation
  - Auto-escalation: +0.5-1.5 ppt deferral rate
  - Increased match: +8-15 ppt participation (per 1% of pay)

- **Cost Impact:** Calculated from plan-specific data
  - Match cost: (new match rate - old match rate) × eligible pay × participation rate
  - Administrative cost: Estimated based on complexity tier

**Recommendation Template:**
```
RECOMMENDATION: Implement Auto-Enrollment at 4% Default

GAP ANALYSIS:
- Current state: No auto-enrollment
- Peer benchmark: 73% of peers have auto-enrollment (n=287, p<0.001)
- Median default rate: 4% of pay
- Your gap: -73 percentile points (bottom quartile)

EXPECTED IMPACT:
- Participation: +20-25 ppt (modeled: 58% → 78-83%)
- Deferral rate: +0.3-0.6 ppt (modeled: 5.2% → 5.5-5.8%)
- Confidence: High (based on 12 similar plans with implementation data)

COST ANALYSIS:
- Match cost increase: +$85-110K annually (assuming 3% match)
- Implementation: $15-25K (vendor fees, communication)
- Ongoing: Minimal (automated process)

IMPLEMENTATION:
- Complexity: Low
- Timeline: 1-2 quarters (requires plan amendment, legal review)
- Prerequisites: None
- Risks: None material (standard provision)

EVIDENCE BASE:
- Cohort: Higher Education, 1,000-3,000 participants (n=287)
- Statistical significance: p < 0.001 (highly significant)
- Academic research: Madrian & Shea (2001) QJE - 48 ppt participation increase
```

**Prioritization Algorithm:**
```python
def prioritize_recommendations(recs: List[Recommendation]) -> List[Recommendation]:
    """
    Score = (Impact / 10) × (1 / Cost_Band) × (1 / Complexity_Factor)

    Impact: 1-10 (participation points, deferral rate improvement)
    Cost_Band: 1 (< $25K), 2 ($25-100K), 3 ($100-250K), 4 ($250K+)
    Complexity: 1 (Low), 2 (Medium), 3 (High)

    Sort by score descending
    """
    pass
```

---

#### 6. Deliverable Generation with Compliance Controls

**PowerPoint Generation:**
- **Template Library:** 5 pre-approved templates (Executive Summary, Full Report, 1-Pager, Board Deck, RFP Response)
- **Dynamic Content:** Auto-populated from Design Matrix data
- **Chart Types:** Bar charts, bullet charts, percentile markers, trend lines
- **Branding:** PlanWise colors, logos, fonts (locked, non-editable by users)

**Compliance Controls:**
```python
def validate_export(deck: Presentation, plan: PlanDesign) -> ValidationResult:
    """
    Pre-export validation checklist:
    1. All low-confidence fields resolved (no <88% confidence in export)
    2. Cohort size n ≥ 20 for all comparisons
    3. Required disclaimers present on every slide with peer data
    4. Data freshness ≤ 12 months (or staleness warning displayed)
    5. No custom language unless approved by compliance role
    6. Watermark present: "For internal review only - not for distribution"
    """
    pass
```

**Disclaimer Templates:**
- Standard disclaimer (every deck): "Peer benchmarks are directional and should not be the sole basis for plan design decisions. Consult with legal and tax advisors."
- Narrow cohort disclaimer (if n < 50): "This comparison uses a limited peer set (n=[X]). Interpret with caution."
- Stale data disclaimer (if >12 months old): "Data as of [DATE]. Market conditions may have changed since then."

**Export Tracking:**
```python
ExportLog:
  export_id: UUID
  user_id: str
  client_id: str
  template_name: str
  export_timestamp: DateTime
  approved_by: Optional[str]  # Compliance reviewer
  destination: Enum[Download, Email, Navigator, CRM]
  contains_sensitive: bool
  cohort_sizes: Dict[str, int]  # Per comparison
```

**Navigator Integration:**
- Export button: "Send Baseline to Navigator"
- Generates YAML file in Navigator schema format
- Pushes to Navigator API with client_id as foreign key
- Enables one-click scenario modeling

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web App      │  │ Mobile App   │  │ PowerPoint   │      │
│  │ (React)      │  │ (React       │  │ Add-in       │      │
│  │              │  │  Native)     │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                      ┌──────▼──────┐
                      │ AWS ALB     │
                      │ (TLS 1.3)   │
                      └──────┬──────┘
┌─────────────────────────────┴─────────────────────────────────┐
│                     APPLICATION TIER                           │
│  ┌────────────────────────────────────────────────────────┐   │
│  │           FastAPI Application (Python 3.11)            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ Auth         │  │ Plan Query   │  │ Benchmark   │  │   │
│  │  │ Service      │  │ Service      │  │ Service     │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ Extraction   │  │ Recommend    │  │ Export      │  │   │
│  │  │ Service      │  │ Service      │  │ Service     │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────┬────────────────────────────┬──────────────────────┘
            │                            │
    ┌───────▼───────┐          ┌────────▼────────┐
    │ Redis         │          │ Celery Workers  │
    │ (Cache +      │          │ (Async Tasks)   │
    │  Queue)       │          └────────┬────────┘
    └───────────────┘                   │
┌───────────────────────────────────────┼──────────────────────┐
│                     DATA TIER          │                      │
│  ┌────────────────────────────────────▼────────────────┐     │
│  │              DuckDB (Analytical DB)                  │     │
│  │  ┌────────────────┐  ┌───────────────────────────┐  │     │
│  │  │ plan_designs   │  │ peer_cohorts (matview)    │  │     │
│  │  │ (850 records)  │  │                           │  │     │
│  │  └────────────────┘  └───────────────────────────┘  │     │
│  │  ┌────────────────┐  ┌───────────────────────────┐  │     │
│  │  │ extractions    │  │ recommendations           │  │     │
│  │  │ (provenance)   │  │                           │  │     │
│  │  └────────────────┘  └───────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           S3 (Document Storage + Backups)             │     │
│  │  - Raw PDFs (Form 5500, SPDs, Plan Docs)             │     │
│  │  - Parquet files (DuckDB backing store)              │     │
│  │  - Exported PowerPoints                               │     │
│  └──────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│                DOCUMENT PROCESSING TIER                        │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Python Document Processing Libraries                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  PDFPlumber + PyPDF2 (PDF text extraction)      │  │   │
│  │  │  Camelot (Table extraction from PDFs)            │  │   │
│  │  │  pytesseract (OCR for scanned documents)         │  │   │
│  │  │  python-docx (DOCX processing)                   │  │   │
│  │  │  Regex Pattern Library (Form 5500 extraction)    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Azure Form Recognizer (Optional - if available)      │   │
│  │  - Custom models trained on SPD templates             │   │
│  │  - Runs in corporate Azure tenant                     │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│                   INTEGRATION TIER                             │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ PlanWise         │  │ Internal CRM     │                   │
│  │ Navigator API    │  │ (Salesforce)     │                   │
│  └──────────────────┘  └──────────────────┘                   │
└───────────────────────────────────────────────────────────────┘

Note: Users have access to Microsoft Copilot 365 for manual document
interpretation assistance (not API-integrated, used ad-hoc by reviewers)
```

### Component Specifications

#### Web Application (React + TypeScript + Vite)
```typescript
// Build Tool: Vite (fast HMR, optimal bundling, modern defaults)
// Framework: React 18+ with TypeScript
// State Management: Zustand for client-side state
// Routing: React Router v6
// UI Framework: Tailwind CSS + shadcn/ui components (copy-paste, not dependency)
// Data Fetching: TanStack Query (React Query) with automatic retries & caching
// Forms: React Hook Form + Zod validation
// Charts: Recharts for data visualization
// Real-time: WebSocket client for extraction status updates

// Key routes:
/dashboard                    // Portfolio overview
/plans/:planId                // Individual plan detail
/plans/:planId/peers          // Peer comparison
/plans/:planId/recommendations // Recommendation list
/review-queue                 // Annotation console
/exports                      // Export history
/admin                        // System configuration

// Performance optimizations:
// - Virtualized lists for 850+ clients (@tanstack/react-virtual)
// - Code splitting & lazy loading for heavy components
// - Optimistic updates with TanStack Query
// - Service Worker for offline capability (future)
```

#### FastAPI Application
```python
# API Framework: FastAPI 0.104+ with async/await
# Authentication: OAuth 2.0 + JWT tokens
# Authorization: Casbin for RBAC policy enforcement
# Validation: Pydantic v2 models with strict type checking
# Database: SQLAlchemy 2.0 async + DuckDB dialect
# Caching: Redis with automatic key expiration
# Rate Limiting: SlowAPI (per-user request limits)
# Logging: Structlog with JSON formatting

# Key endpoints:
GET  /api/v1/clients                         # List all clients
GET  /api/v1/clients/{client_id}            # Get client details
POST /api/v1/clients                         # Create new client (manual entry)
POST /api/v1/clients/bulk-import             # Bulk import from Excel
POST /api/v1/clients/{client_id}/extract    # Trigger automated extraction
GET  /api/v1/clients/{client_id}/peers      # Get peer cohort
POST /api/v1/clients/{client_id}/cohorts    # Build custom cohort
GET  /api/v1/clients/{client_id}/recommendations # Get recommendations
POST /api/v1/exports                         # Create export
GET  /api/v1/review-queue                    # Get pending reviews
PATCH /api/v1/extractions/{extraction_id}    # Update extraction
POST /api/v1/navigator/export                # Export to Navigator
GET  /api/v1/patterns                        # Get extraction pattern library
POST /api/v1/patterns                        # Add new extraction pattern
```

#### Celery Task Queue
```python
# Broker: Redis
# Result Backend: Redis
# Serializer: JSON (never pickle for security)
# Task routing: Separate queues by priority

# Task queues:
extraction_queue:         # Document processing (high priority)
  - extract_pdf_regex_task          # Rules-based extraction
  - extract_pdf_azure_task          # Azure Form Recognizer (if available)
  - run_ocr_task                    # pytesseract for scanned docs
  - validate_extractions_task       # Cross-field consistency checks
  - import_excel_task               # Bulk import from Excel templates

benchmarking_queue:       # Statistical calculations (medium priority)
  - build_cohort_task
  - calculate_percentiles_task
  - run_significance_tests_task

export_queue:             # Deliverable generation (low priority)
  - generate_powerpoint_task
  - send_to_navigator_task
  - notify_user_task

# Retry configuration:
max_retries: 3
retry_backoff: True
retry_backoff_max: 600  # 10 minutes
```

#### DuckDB Database
```python
# In-process analytical database
# Storage: Parquet files on S3 with local cache
# Query engine: Optimized for OLAP workloads

# Key tables:
plan_designs:          # 850 records, ~60 columns per plan
  Partitions: industry
  Indexes: client_id (primary key), industry, total_participants

extraction_audit:      # Provenance tracking
  Append-only log, never updated
  Partitions: by extraction_date (monthly)

peer_cohorts:          # Materialized view (refreshed nightly)
  Pre-computed cohorts for common queries
  Reduces p95 latency from 2.5s → 0.8s

recommendations:       # Generated recommendations with impact modeling
  Foreign key: client_id
  Indexes: client_id, priority_score

# Performance tuning:
memory_limit: 4GB
threads: 4
temp_directory: /tmp/duckdb
```

### Data Flow Diagrams

#### Document Extraction Flow (Hybrid Approach)
```
1. User uploads PDF or selects "Manual Entry" or "Import from Excel"
   ↓
   ┌──────────────────┴──────────────────┐
   │                                      │
   ▼ AUTOMATED PATH                       ▼ MANUAL PATH
2a. API validates file                   2b. User presented with form-based
    (size, type, virus scan)                 YAML editor or Excel template
   ↓                                      ↓
3a. Store raw PDF in S3 bucket          3b. User fills in plan provisions
    (s3://planwise-docs/uploads/)            manually with inline validation
   ↓                                      ↓
4a. Queue Celery task:                  4b. Attach source documents for
    extract_pdf_regex_task.delay()           audit trail (optional)
   ↓                                      ↓
5a. Celery worker downloads PDF         5b. System validates schema compliance
    from S3                                  and cross-field consistency
   ↓                                      ↓
6a. Document type detection:            6b. Store in DuckDB with
    - Form 5500 → regex patterns             extraction_method=ManualEntry
    - SPD → Azure Form Recognizer        ↓
      (if available) or manual queue     7b. Route to approval workflow
    - Plan Doc → manual queue                if required by RBAC rules
   ↓                                      │
7a. Extract fields with confidence       │
    scores (pattern match strength)      │
   ↓                                      │
8a. Run validation rules                 │
    (cross-field consistency)            │
   ↓                                      │
9a. Store extractions in DuckDB with     │
    provenance metadata:                 │
    - extraction_method: RegexPattern    │
      or AzureFormRecognizer             │
    - confidence_scores per field        │
   ↓                                      │
10a. Route based on confidence:          │
     - High confidence (>80%): Mark as   │
       validated, notify user             │
     - Low confidence (<80%): Queue      │
       for manual review                 │
   ↓                                      │
   └──────────────────┬──────────────────┘
                      ↓
11. Notify user via WebSocket
    - Automated: "Extraction complete - X fields require review"
    - Manual: "Plan created - ready for use"
```

#### Peer Benchmarking Flow
```
1. User requests peer comparison for plan_id
   ↓
2. API checks cache (Redis) for existing cohort
   ↓  (cache miss)
3. Query DuckDB for matching plans using similarity algorithm
   ↓
4. Apply k-anonymity filter (n ≥ 20)
   ↓
5. Calculate statistics:
   - Mean, median, p25, p75 for each metric
   - Two-proportion z-tests for categorical features
   - Cohen's h for effect sizes
   ↓
6. Store results in cache (TTL: 1 hour)
   ↓
7. Return JSON response with peer metrics + statistical metadata
   ↓
8. Frontend renders charts and percentile indicators
```

#### Recommendation Generation Flow
```
1. User clicks "Generate Recommendations"
   ↓
2. API retrieves plan design + peer cohort
   ↓
3. For each plan feature:
   - Calculate gap vs. peer median
   - Run significance test (p-value)
   - Calculate effect size (Cohen's h)
   ↓
4. Filter to meaningful gaps (p < 0.05, |effect| > 0.2, percentile gap > 10)
   ↓
5. For each gap:
   - Lookup impact model (participation lift, cost)
   - Assign complexity tier (Low/Med/High)
   - Generate explainability text
   ↓
6. Prioritize using scoring algorithm
   ↓
7. Store recommendations in DuckDB
   ↓
8. Return ranked list with impact bands
```

#### PowerPoint Export Flow
```
1. User selects template and clicks "Export"
   ↓
2. API validates export (compliance checks)
   ↓
3. Queue Celery task: generate_powerpoint_task.delay(plan_id, template_id)
   ↓
4. Celery worker:
   - Loads template from S3 (s3://planwise-assets/templates/)
   - Queries DuckDB for plan data + peer metrics
   - Populates slides using python-pptx
   - Applies branding (logos, colors, fonts)
   - Adds disclaimers and watermarks
   - Renders charts as embedded images
   ↓
5. Save .pptx to S3 (s3://planwise-exports/{export_id}.pptx)
   ↓
6. Log export in audit trail (DuckDB)
   ↓
7. Generate signed URL (expires in 1 hour)
   ↓
8. Return download link to user
```

### Deployment Architecture

#### AWS Infrastructure
```yaml
# ECS Fargate Cluster
Service: planwise-design-matrix-api
  Tasks: 3 (for high availability)
  CPU: 2 vCPU
  Memory: 4 GB
  Auto-scaling: Target 70% CPU utilization
  Health checks: /health endpoint (15s interval)

Service: planwise-celery-workers
  Tasks: 5
  CPU: 4 vCPU
  Memory: 8 GB
  Auto-scaling: Based on queue depth (SQS messages)

# Load Balancer
Application Load Balancer:
  Listeners: HTTPS:443 (TLS 1.3)
  SSL Certificate: ACM (auto-renewal)
  Target Group: ECS tasks
  Health checks: HTTP /health
  Sticky sessions: Enabled (cookie-based)

# Networking
VPC: 10.0.0.0/16
  Public subnets: 10.0.1.0/24, 10.0.2.0/24
  Private subnets: 10.0.10.0/24, 10.0.20.0/24
  NAT Gateway: 2 (multi-AZ)

# Security Groups
ALB Security Group: Allow 443 from 0.0.0.0/0
ECS Security Group: Allow ALB → ECS:8000
Redis Security Group: Allow ECS → Redis:6379

# Storage
S3 Buckets:
  planwise-docs: Document uploads (versioned, encrypted)
  planwise-exports: Generated PowerPoints (7-day lifecycle)
  planwise-data: Parquet files (DuckDB backing)

ElastiCache Redis:
  Node type: cache.r6g.large
  Engine version: 7.0
  Replication: Multi-AZ with automatic failover
```

#### CI/CD Pipeline
```yaml
# GitHub Actions workflow
on: [push to main branch]

steps:
  1. Run unit tests (pytest)
  2. Run integration tests
  3. Build Docker image
  4. Push to ECR (Elastic Container Registry)
  5. Update ECS task definition
  6. Deploy to staging environment
  7. Run smoke tests
  8. Approval gate (manual)
  9. Deploy to production (blue/green)
  10. Monitor error rates for 15 minutes
  11. Auto-rollback if error rate > 1%
```

---

## Data Models & Schemas

### Core Pydantic Models

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from enum import Enum
from datetime import datetime
from decimal import Decimal

class IndustryCode(str, Enum):
    HIGHER_ED = "611"
    HEALTHCARE = "622"
    MANUFACTURING = "31-33"
    # ... 20+ more industry codes

class MatchFormula(BaseModel):
    """Employer match contribution formula"""
    tier1_rate: Decimal = Field(description="Match rate for first tier (e.g., 1.00 for 100%)")
    tier1_cap: Decimal = Field(description="Cap for first tier (e.g., 0.03 for 3% of pay)")
    tier2_rate: Optional[Decimal] = None
    tier2_cap: Optional[Decimal] = None
    match_eligibility_criteria: Optional[str] = Field(None, description="Eligibility criteria for employer match")
    match_last_day_work_rule: bool = Field(default=False, description="Last day work rule on match")
    match_true_up: bool = Field(default=False, description="True-up match at year-end")
    match_contribution_frequency: Optional[str] = Field(None, description="Frequency of match contributions (per pay period, monthly, annually, etc.)")

    @validator('tier1_rate', 'tier1_cap')
    def validate_positive(cls, v):
        if v < 0:
            raise ValueError("Match rates and caps must be positive")
        return v

class VestingSchedule(BaseModel):
    """Vesting schedule for employer contributions"""
    schedule_type: Literal["immediate", "cliff", "graded"]
    cliff_years: Optional[int] = Field(None, ge=1, le=10)
    graded_schedule: Optional[Dict[int, Decimal]] = None  # {year: vested_pct}

    @validator('graded_schedule')
    def validate_graded(cls, v, values):
        if values['schedule_type'] == 'graded' and not v:
            raise ValueError("Graded schedule requires vesting percentages")
        return v

class AutoEnrollment(BaseModel):
    """Automatic enrollment provisions"""
    enabled: bool
    default_rate: Optional[Decimal] = Field(None, ge=0, le=1, description="Default deferral rate (0-1)")
    auto_enrollment_effective_year: Optional[int] = Field(None, description="Year auto-enrollment became effective (1900 = all employees)")
    auto_escalation_enabled: bool = Field(default=False, description="Auto-escalation feature enabled")
    auto_escalation_cap: Optional[Decimal] = Field(None, description="Auto-escalation cap as percentage")

class NonElectiveContribution(BaseModel):
    """Non-elective contribution provisions"""
    nonelective_formula: Optional[str] = Field(None, description="Non-elective contribution formula")
    nonelective_eligibility_criteria: Optional[str] = Field(None, description="Eligibility criteria for non-elective")
    nonelective_last_day_work_rule: bool = Field(default=False, description="Last day work rule on non-elective")
    nonelective_contribution_frequency: Optional[str] = Field(None, description="Frequency of non-elective contributions")

class InvestmentOptions(BaseModel):
    """Investment menu details"""
    number_of_funds: int = Field(ge=3, le=100)
    tdf_available: bool = True
    tdf_as_qdia: bool = False
    brokerage_window: bool = False
    company_stock: bool = False

class PlanDesign(BaseModel):
    """Complete plan design specification"""
    # Identifiers
    client_id: str = Field(description="Unique client identifier")
    plan_sponsor_name: str
    client_name: str

    # Demographics
    industry: IndustryCode
    total_participants: int = Field(ge=0)
    total_assets: Decimal = Field(ge=0)
    geography: str = Field(description="Two-letter state code or 'Multi-State'")

    # Plan provisions
    eligibility: str = Field(description="Plan eligibility (e.g., 'Immediate', '1 year', '1000 hours')")
    match_formula: Optional[MatchFormula] = None
    nonelective_contribution: Optional[NonElectiveContribution] = None
    vesting: Optional[VestingSchedule] = None
    auto_enrollment: AutoEnrollment
    investments: InvestmentOptions

    # Metadata
    data_source: Literal["Form5500", "SPD", "PlanDocument", "ManualEntry", "ExcelImport"]
    extraction_date: datetime
    extraction_method: Literal["RegexPattern", "AzureFormRecognizer", "ManualEntry", "ExcelImport"]
    confidence_scores: Dict[str, float] = Field(description="Per-field confidence (0-1)")
    reviewed_by: Optional[str] = None
    review_date: Optional[datetime] = None
    data_version: int = Field(default=1, ge=1)

    class Config:
        json_schema_extra = {
            "example": {
                "client_id": "CLIENT-12345",
                "plan_sponsor_name": "University of Example",
                "client_name": "University of Example",
                "industry": "611",
                "total_participants": 2400,
                "total_assets": 125000000,
                "geography": "CA",
                "eligibility": "Immediate"
            }
        }

class PeerCohort(BaseModel):
    """Peer comparison cohort definition and statistics"""
    cohort_id: str
    target_client_id: str
    peer_client_ids: List[str] = Field(min_items=20, description="Must meet k-anonymity threshold")
    filters: Dict[str, any]

    # Cohort statistics
    cohort_size: int = Field(ge=20)
    mean_participants: float
    median_participants: float

    # Feature statistics
    auto_enrollment_adoption_rate: float
    auto_enrollment_median_rate: Optional[Decimal]
    match_adoption_rate: float
    match_median_formula: Optional[Dict]

    created_at: datetime
    expires_at: datetime

class Recommendation(BaseModel):
    """Plan optimization recommendation with impact modeling"""
    recommendation_id: str
    client_id: str
    feature_name: str
    recommendation_type: Literal["add", "enhance", "remove"]

    # Gap analysis
    current_state: str
    peer_benchmark: str
    gap_magnitude: float = Field(description="Percentile gap or absolute difference")
    statistical_significance: float = Field(ge=0, le=1, description="p-value")

    # Impact modeling
    participation_impact_min: Optional[float]
    participation_impact_max: Optional[float]
    deferral_rate_impact_min: Optional[float]
    deferral_rate_impact_max: Optional[float]

    # Cost analysis
    annual_cost_min: Optional[Decimal]
    annual_cost_max: Optional[Decimal]
    implementation_cost: Optional[Decimal]

    # Implementation
    complexity: Literal["Low", "Medium", "High"]
    estimated_quarters: int = Field(ge=1, le=8)
    prerequisites: List[str]

    # Evidence
    cohort_size: int
    evidence_strength: Literal["Strong", "Moderate", "Limited"]

    # Prioritization
    priority_score: float = Field(ge=0, le=100)

    created_at: datetime
```

### API Response Models

```python
class PeerComparisonResponse(BaseModel):
    """Response for peer benchmark queries"""
    plan: PlanDesign
    cohort: PeerCohort
    comparisons: List[FeatureComparison]
    statistical_tests: List[SignificanceTest]

class FeatureComparison(BaseModel):
    feature_name: str
    your_value: any
    peer_median: any
    your_percentile: int  # 0-100
    quartile: int  # 1-4
    label: Literal["Bottom Quartile", "Below Average", "Above Average", "Top Quartile"]
    peers_above: int
    peers_below: int

class SignificanceTest(BaseModel):
    feature_name: str
    test_type: Literal["two_proportion_z_test", "t_test"]
    z_score: Optional[float]
    p_value: float
    significant: bool  # True if p < 0.05
    effect_size: float  # Cohen's h or d
    confidence_interval_lower: float
    confidence_interval_upper: float
```

---

## API Specifications

### Data Classification & Handling
- **Classification:** Plan design facts = Confidential – Client (no PII)
- **Storage:** Encrypted at rest (AES-256) for DuckDB file and backups
- **Transfer:** TLS 1.3 for all data in transit
- **Access:** Role-based access control (RBAC) with least privilege

### RBAC Roles
- **Viewer (AE):** Read-only access, export to approved templates
- **Analyst (RM):** Query, filter, create cohorts, generate recommendations
- **Consultant:** Full query access, scenario modeling, Navigator integration
- **Reviewer:** Approve exports, resolve low-confidence fields, audit access
- **Admin:** Manage schemas, templates, user permissions

### Audit & Compliance
- **Logging:** Immutable append-only log for all actions
- **Tracked Events:** Exports, approvals, cohort definitions, data changes
- **Retention:** 7-year audit trail retention per regulatory requirements
- **Compliance Checks:** Pre-export validation against approved language library
- **Watermarking:** All exports marked with generation metadata

### Data Governance
- **Refresh Cycle:** Annual mandatory refresh for all clients
- **Staleness Indicators:** Visual warnings for data >12 months old
- **Quality Checks:** Field-level expectations (type, range, regex)
- **Cross-Field Rules:** Logical consistency (e.g., vesting requires match)
- **Cohort Coverage:** Minimum thresholds for statistical validity

---

## Integration with PlanWise Ecosystem

### PlanWise Navigator Integration
- **Export Format:** Baseline and recommendation YAMLs in Navigator schema
- **Scenario Modeling:** One-click transfer of recommendations to Navigator
- **Outcome Alignment:** Map all metrics to Navigator's framework
- **Bi-directional Sync:** Pull modeled outcomes back to Design Matrix

### Aurora/FHI Alignment
- **Terminology:** Consistent use of FHI lexicon:
  - Retirement Readiness
  - Preparedness Gap
  - Plan Health Score
  - Participant Journey
  - Financial Wellness Continuum
- **Metrics Mapping:** Design Matrix metrics feed FHI calculations
- **Reporting Alignment:** Unified story across all client touchpoints

---

## Implementation Timeline with Phase Gates

### Phase 0: Manual Baseline (Weeks 1-2) - CRITICAL FOUNDATION
**Purpose:** Demonstrate immediate value with manually-validated data while building automation incrementally

**Exit Criteria (Gate 0):**
- ≥ 50 high-priority clients manually extracted into Design Matrix
- Manual data entry interface operational (form-based + Excel import)
- Peer benchmarking engine functional with manual data
- First 3 PowerPoint deliverables generated and approved by Compliance
- Pattern library initiated: Document 20+ common regex patterns from manual analysis
- Proof of value: Generate 5 peer comparison decks that would have taken 40 hours manually

**Key Activities:**
- Deploy core platform infrastructure (DuckDB, FastAPI, React UI)
- Build manual data entry forms with schema validation
- Implement statistical peer benchmarking (works with any data source)
- Create PowerPoint generation engine with approved templates
- Manual extraction team documents patterns for automation roadmap
- Seed pattern library from high-value Form 5500 fields

**Success Metrics:**
- Team consensus: "This is valuable even with manual data entry"
- 5 AEs using peer snapshots in client meetings
- Consultants report 50% time savings on peer analysis

---

### Phase 1: Rules-Based Automation (Month 1-2)
**Purpose:** Automate high-confidence Form 5500 extractions using regex patterns

**Exit Criteria (Gate A):**
- ≥ 100 clients in matrix (50 manual + 50 automated)
- Regex pattern library covers 30+ Form 5500 fields
- 60-70% extraction automation on structured fields (Form 5500 Schedule H/I)
- p95 query latency ≤ 2.0s confirmed
- Annotation & Review Console operational with prioritized queue
- Core team trained on hybrid workflow (automated + manual review)
- 10 deliverables generated monthly

**Key Activities:**
- Deploy regex-based extraction for Form 5500 standard fields
- Build review queue interface with side-by-side PDF viewer
- Implement confidence scoring based on pattern match strength
- Train team on reviewing low-confidence extractions
- Continue manual entry for complex SPD provisions

---

### Phase 2: Azure Form Recognizer + Scale (Month 3-4)
**Purpose:** Extend automation to semi-structured documents (SPDs) and scale to broader client base

**Exit Criteria (Gate B):**
- ≥ 250 clients processed (mix of automated and manual)
- Azure Form Recognizer trained models for top 3 recordkeepers (Fidelity, Vanguard, Empower)
- 75-80% extraction automation across all document types
- 50 weekly active users
- ≥ 25 validated cohort templates
- Statistical framework fully operational with significance testing
- 30 deliverables generated monthly

**Key Activities:**
- Train Azure Form Recognizer models on SPD templates (if available in tenant)
- Build recordkeeper-specific pattern libraries
- Optimize review queue workflows based on Phase 1 learnings
- Scale manual extraction team for complex edge cases
- Deploy Excel bulk import for legacy data migration

---

### Phase 3: Production Scale (Month 5-6)
**Purpose:** Achieve full client coverage and operational maturity

**Exit Criteria (Gate C):**
- ≥ 850 clients in Design Matrix (full client book)
- 80-85% overall extraction automation (with 95%+ accuracy after human validation)
- ≥ 50 deliverables generated monthly
- ≥ 70% of client decks via tool (vs fully manual)
- All account teams trained on platform
- ROI metrics tracking implemented and showing 8x efficiency gains
- Review queue consistently <20 items with 2-day average resolution

**Key Activities:**
- Complete backfill of remaining clients (mix of automated + manual)
- Optimize extraction patterns based on 6 months of data
- Deploy mobile app for AE field access
- Integrate with PlanWise Navigator (YAML export)
- Establish annual refresh cycle and data governance procedures

---

### Future Phases (Month 7+)
**Phase 4: Continuous Improvement**
- Refine extraction patterns based on error analysis
- Explore emerging document AI tools as they become available in corporate environment
- Build recordkeeper API integrations for direct data feeds
- Implement predictive analytics (churn risk, opportunity scoring)

---

## Success Metrics

### Leading Indicators (Weekly)
- Active users (target: 5 by Week 2, 20 by Month 2, 50+ by Month 4)
- Exports per AE (target: 2+ weekly by Month 3)
- Percentage of client meetings using peer snapshots (target: 10% by Month 1, 40% by Month 4)
- Review queue backlog (target: <20 items by Month 3)
- Extraction automation rate (target: 60% Month 2, 70% Month 3, 80% Month 5)

### Lagging Indicators (Monthly/Quarterly)
- Revenue attribution to Design Matrix insights (target: 5 consulting engagements by Month 4)
- Client retention improvement (track at Month 6+)
- Time savings documented (target: 8 hours → 1 hour per peer analysis by Month 3)
- User satisfaction scores (target: 8/10 by Month 3)
- Data quality: 95%+ accuracy after human validation (measured continuously)

---

## Risks & Mitigations

### Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Limited Extraction Automation** | High | High | **Start with manual data entry to prove value immediately; incrementally improve automation; position as "human-validated" quality advantage** |
| Extraction Accuracy | High | Medium | Confidence scoring, mandatory human review, phased rollout, 95%+ post-review accuracy |
| Data Governance | High | Low | No PII, encrypted storage, audit trails |
| User Adoption | High | Medium | **Phase 0 proves value before requesting behavior change; start with power users, demonstrate 8x efficiency improvement** |
| Statistical Validity | Medium | Low | k-anonymity floors, significance testing |
| Pattern Library Completeness | Medium | Medium | **Continuous refinement based on manual extraction learnings; document edge cases for future automation** |
| Azure Form Recognizer Unavailable | Medium | Medium | **Graceful degradation to manual review; platform value independent of automation rate** |
| Recommendation Misuse | High | Low | Locked templates, compliance review, watermarking |
| Shadow Exports | Medium | Medium | Audit all exports, disable copy/paste for sensitive data |
| Manual Data Entry Bottleneck | Medium | High | **Excel bulk import, form-based templates, parallel automation development, hire temp extraction team for Phase 0/1** |

---

## RACI Matrix

| Activity | Product | Engineering | Data Gov | Compliance | Sales |
|----------|---------|-------------|----------|------------|-------|
| Schema Design | R/A | C | C | I | I |
| Extraction Pipeline | A | R | C | I | I |
| Statistical Framework | C | R | A | C | I |
| Template Governance | C | I | C | R/A | C |
| User Training | R | I | I | C | A |
| Production Support | C | R | C | I | A |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## Appendices

### A. YAML Schema Specification with Pydantic Models
Field definitions, validation rules, and data contracts

### B. Statistical Framework
Cohort similarity calculations, significance tests, effect size thresholds

### C. Extraction Confidence Scoring
- **Automated Extraction Targets:**
  - **Tier-1 Fields** (must achieve 80%+ confidence for auto-accept): Match formula, auto-enrollment rate, vesting schedule type
  - **Tier-2 Fields** (must achieve 70%+ confidence for auto-accept): True-up provisions, loan availability, eligibility requirements
- **Final Accuracy Target:** 95%+ after mandatory human validation for all client-facing exports

### D. Extraction Pattern Library (New)
**Form 5500 Regex Patterns (30+ fields):**
- Plan identification: `EIN: (\d{2}-\d{7})`, `Plan Number: (\d{3})`
- Participant counts: `Total participants.*?(\d{1,7})`
- Boolean provisions: `Employer match.*?(Yes|No)`, `Loans available.*?(Yes|No)`

**SPD Common Patterns by Recordkeeper:**
- Fidelity match formula: `match (\d+)% of your contributions up to (\d+)%`
- Vanguard vesting: `(immediate|cliff|graded) vesting`
- TIAA auto-enrollment: `automatically enrolled at (\d+)%`

**Cross-Field Validation Rules:**
- If `match_formula` exists → `vesting` must be defined
- If `auto_enrollment.enabled = true` → `auto_enrollment.default_rate` required
- `total_participants` must align with Form 5500 Schedule H participant count

**Pattern Evolution Strategy:**
- Phase 0: Document patterns during manual extraction
- Phase 1: Implement 20+ highest-confidence patterns
- Phase 2: Add 10+ recordkeeper-specific patterns per quarter
- Ongoing: Refine based on false positive/negative analysis

### E. Extraction Automation Roadmap (New)
**Current State (Pre-Platform):** 100% manual extraction, 15-20 hours per client

**Month 0-1 (Phase 0):** Manual baseline with pattern documentation
- 0% automation, 100% manual entry via forms/Excel
- **Value delivered:** Peer benchmarking, recommendations, PowerPoint generation
- Pattern library seeded with 20+ regex expressions

**Month 1-2 (Phase 1):** Rules-based Form 5500 automation
- 60-70% automation on Form 5500 structured fields
- 30-40% manual for SPDs and complex provisions
- **Time per client:** 15 hours → 6-8 hours (includes review queue)

**Month 3-4 (Phase 2):** Azure Form Recognizer for SPDs
- 75-80% automation across all document types (if Azure available)
- 20-25% manual for edge cases
- **Time per client:** 6-8 hours → 3-4 hours

**Month 5-6 (Phase 3):** Optimized hybrid workflow
- 80-85% automation with mature pattern library
- 15-20% manual review (complex plans, non-standard provisions)
- **Time per client:** 3-4 hours → 1-2 hours
- **All extractions validated by human before client delivery (95%+ accuracy)**

**Future State (Month 7+):**
- Recordkeeper API integrations for direct data feeds
- Emerging AI tools as they become available in corporate environment
- Target: 90% automation with human oversight for quality assurance
- Value proposition remains: **Human-validated insights at scale**

### F. Operations Runbook
Backup/restore procedures, key rotation, monitoring alerts, staleness banners

### G. Compliance Language Library
Pre-approved phrases, required disclaimers, watermark templates

### H. Phase Gate Checklists
Detailed entry/exit criteria for each implementation phase

---

## Technical Constraints & Available Tools

**Corporate Environment Limitations:**
- ❌ **Not Available:** External LLM APIs (OpenAI, Anthropic, Google), SageMaker with transformer models
- ✅ **Available:** Python libraries (PDFPlumber, PyPDF2, Camelot, pytesseract, spaCy), Azure services in corporate tenant, GitHub Copilot for code generation
- ⚠️ **Conditionally Available:** Azure Form Recognizer (subject to tenant approval and security review)
- 👤 **Manual Assistance:** Microsoft Copilot 365 (used ad-hoc by reviewers, not API-integrated)

**Platform Value Independence:**
The Design Matrix delivers transformational value through:
1. **Statistical peer benchmarking** (independent of extraction method)
2. **Evidence-based recommendation engine** (works with any data source)
3. **Automated PowerPoint generation** (saves 90% of deliverable creation time)
4. **Centralized plan design repository** (single source of truth)
5. **PlanWise Navigator integration** (seamless scenario modeling)

**Extraction is an input, not the core value.** The intelligence layer—peer analysis, recommendations, compliance-controlled deliverables—transforms PlanWise's advisory capabilities regardless of how data enters the system.

---

**This PRD reflects realistic technical constraints while maintaining enterprise-grade requirements for compliance, security, and operational excellence. The phased approach ensures immediate value delivery (Phase 0) while incrementally improving automation capabilities.**