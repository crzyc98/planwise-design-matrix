# Product Requirements Document
## PlanWise Design Matrix

**Version:** 1.1  
**Date:** January 2024  
**Owner:** PlanWise Navigator Team  
**Status:** Draft

---

## Executive Summary

The PlanWise Design Matrix is an internal intelligence platform that transforms unstructured retirement plan documents into structured data, enabling automated peer analysis, recommendation generation, and client deliverable creation for 850+ tax-exempt DC clients. The system leverages AI for extraction, provides sophisticated peer benchmarking, and generates personalized recommendations at scale.

---

## Problem Statement

### Current State Pain Points
- Plan design details trapped in PDFs, requiring 5+ hours per client to analyze
- No systematic way to compare clients against relevant peers
- Recommendations are ad-hoc and inconsistent across account teams
- Account executives lack real-time intelligence when meeting with clients
- Unable to identify cross-client trends or proactive opportunities
- Manual PowerPoint creation for each client review

### Opportunity Cost
- Missing ~$2M in plan optimization consulting fees annually
- Account executives spending 40% of time on manual analysis vs. relationship building
- Delayed response to RFPs requiring peer benchmarking
- Reactive vs. proactive client engagement model

---

## Goals & Success Metrics

### Primary Goals
1. **Extract** structured plan design data from 850 clients within 6 months
2. **Enable** peer benchmarking for any client in <5 minutes
3. **Generate** personalized recommendations based on quantitative gaps
4. **Produce** client-ready deliverables with one click

### Success Metrics

**Efficiency Metrics**
- Reduce plan analysis time from 5 hours to 15 minutes (95% reduction)
- Process 50+ clients per week vs. current 5
- Generate client deliverables in <10 minutes

**Quality Metrics**
- 90%+ extraction accuracy on core design features
- 100% coverage of active clients within 6 months
- 85%+ account executive satisfaction score

**Business Metrics**
- Increase plan design consulting engagements by 30%
- Improve client retention by 5% through proactive recommendations
- Generate $500K+ in additional consulting revenue Year 1

---

## User Personas

### Primary: Account Executive ("Sarah")
- **Role:** Manages 30-40 DC plan relationships
- **Need:** Quick access to peer comparisons during client calls
- **Pain:** Spending nights creating one-off analysis
- **Success:** "I can answer client questions immediately with data"

### Secondary: Relationship Manager ("Michael")
- **Role:** Oversees 100+ smaller clients
- **Need:** Identify at-risk clients and opportunities at scale
- **Pain:** No visibility into plan competitiveness
- **Success:** "I know which 10 clients to call this week"

### Tertiary: Consultant ("David")
- **Role:** Deep-dive plan optimization projects
- **Need:** Comprehensive peer data and modeling inputs
- **Pain:** Gathering baseline data takes weeks
- **Success:** "I start with perfect baseline data"

---

## Functional Requirements

### Core Capabilities

#### 1. Document Intelligence Engine
- **Extract** plan design elements from Form 5500, SPDs, plan documents
- **Validate** extractions against known patterns and rules
- **Flag** low-confidence extractions for human review
- **Track** extraction confidence and data lineage

#### 2. Design Matrix Database
- **Store** all plan designs in a single, queryable matrix structure
- **Version** historical changes with timestamps
- **Calculate** peer statistics and percentiles in real-time
- **Support** complex nested plan provisions while maintaining query performance
- **Export** to any format without data loss

#### 3. Peer Benchmarking System
- **Segment** clients dynamically by any combination of attributes
- **Calculate** percentile rankings across 15+ key metrics
- **Generate** "similar client" cohorts using multiple similarity dimensions
- **Surface** competitive gaps with statistical significance
- **Track** market movements and emerging trends

#### 4. Recommendation Engine
- **Identify** gaps vs. peers and best practices
- **Prioritize** based on impact, cost, and implementation complexity
- **Estimate** participant behavior changes and cost implications
- **Generate** evidence-based rationales with peer support
- **Track** which recommendations resonate with clients

#### 5. Deliverable Generation
- **Create** PowerPoint presentations from templates
- **Generate** executive summaries with key insights
- **Export** detailed analysis to Excel for consultants
- **Produce** one-page snapshots for quick reviews
- **Maintain** client-specific branding requirements

### User Workflows

#### Workflow 1: New Client Analysis
Input documents → Extract design → Find peers → Generate gaps → Create recommendations → Export deliverables

#### Workflow 2: Quarterly Business Review
Select client → Refresh data → Compare trends → Identify opportunities → Generate QBR deck

#### Workflow 3: Book-of-Business Analysis
Define segment → Query matrix → Identify patterns → Surface opportunities → Export action list

#### Workflow 4: Real-Time Client Call Support
Search client → View snapshot → Compare to peers → Answer questions → Log discussion points

---

## Technical Requirements

### Data Architecture

#### Storage Strategy
- **Primary Database:** DuckDB for analytical queries and peer calculations
- **Design Storage:** YAML files as source of truth for plan designs
- **Document Archive:** SharePoint/local folders for source PDFs
- **Transfer Method:** Encrypted database file for home-to-work transfer

#### Key Design Decisions
- **DuckDB Selection Rationale:**
  - No infrastructure requirements (single file database)
  - Exceptional analytical query performance
  - Native JSON/nested data support for complex plan provisions
  - Columnar storage optimized for peer comparisons
  - Full SQL support with advanced window functions
  - Portable between machines without installation

#### Data Model Principles
- Store complete plan designs as structured records
- Extract key fields for fast filtering and grouping
- Maintain full fidelity of complex provisions
- Enable point-in-time historical analysis
- Support both structured queries and document exports

### Technology Stack

#### Extraction Layer
- **Development Environment:** Home machine with AI API access
- **Production Environment:** Work machine with validated data
- **Validation Framework:** Rule-based with confidence scoring
- **Quality Assurance:** Human-in-loop for low confidence extractions

#### Processing Layer
- **Core Language:** Python 3.11+
- **Database Engine:** DuckDB for all analytical operations  
- **Analytics Libraries:** Pandas, NumPy for specialized calculations
- **Statistical Analysis:** SciPy for significance testing

#### Presentation Layer
- **Internal Interface:** Streamlit or Dash for web access
- **Reporting Integration:** Direct connection to Tableau/Power BI
- **Export Capabilities:** Native generation of PowerPoint, Excel, PDF
- **API Layer:** FastAPI for programmatic access

### Integration Requirements
- **CRM Integration:** Pull client metadata from Salesforce
- **Document Management:** Read from SharePoint/Box repositories
- **PlanWise Navigator:** Provide baseline/recommendation YAMLs
- **Email Systems:** Automated distribution of reports

---

## Information Architecture

### Data Taxonomy

#### Primary Segmentation
- **Industry:** Healthcare, Higher Education, Corporate, Government, Non-Profit
- **Size:** <500, 500-1000, 1000-5000, 5000+, 10000+
- **Geography:** Region, State, Metro vs Rural
- **Plan Type:** 401(k), 403(b), 401(a), 457(b), Multiple

#### Plan Design Dimensions
- **Eligibility & Entry:** Waiting periods, hours requirements, exclusions
- **Employee Contributions:** Auto-features, contribution types, limits
- **Employer Contributions:** Match formulas, non-elective, profit sharing
- **Vesting:** Schedules, counting methods, special provisions
- **Administrative:** Loans, withdrawals, distribution options
- **Investment:** Recordkeeper, fund lineup, brokerage options

#### Performance Metrics
- **Participation Metrics:** Rate, by demographics, trend
- **Savings Metrics:** Deferral rates, total savings, escalation adoption
- **Cost Metrics:** Per participant, as percent of payroll, by component
- **Outcome Metrics:** Retirement readiness, replacement ratios

---

## Minimum Viable Product (MVP)

### Phase 1 MVP (Month 1-2)
**Scope:** 50 clients, manual extraction with AI assist

- YAML schema definition for plan designs
- Manual extraction process with AI assistance
- DuckDB database with core tables
- Basic peer grouping (size and industry)
- Simple gap identification (above/below median)
- Excel export of peer comparisons

### Phase 2 MVP (Month 3-4)
**Scope:** 200 clients, semi-automated extraction

- Extraction confidence scoring system
- Complete segmentation taxonomy
- Top 3 recommendations per client
- PowerPoint template automation
- Web interface for data access
- Peer percentile calculations

### Phase 3 Production (Month 5-6)
**Scope:** All 850 clients, full automation

- Complete extraction pipeline
- Advanced peer matching algorithms
- Cost and impact modeling
- Multi-format deliverable generation
- Account executive dashboard
- Historical trending analysis

---

## Implementation Timeline

### Month 1: Foundation
- Design and validate YAML schema
- Set up DuckDB database structure
- Extract first 10 clients manually
- Build core peer grouping logic
- Create validation framework

### Month 2: Pilot
- Process 50 clients total
- Test with 3 power user account executives
- Refine extraction accuracy
- Build basic web interface
- Generate first client deliverables

### Month 3-4: Scale
- Process 200 clients with refined process
- Automate extraction workflow
- Build recommendation engine
- Create deliverable templates
- Train additional users

### Month 5-6: Production
- Complete all 850 client extractions
- Deploy production web interface
- Train all account teams
- Measure impact and ROI
- Plan expansion to prospects

---

## Risks & Mitigations

### Risk 1: Extraction Accuracy
- **Risk:** Incorrect plan provision extraction
- **Impact:** Flawed recommendations, damaged credibility
- **Mitigation:** Confidence scoring, validation rules, human review for exceptions, phased rollout with verification

### Risk 2: Data Governance
- **Risk:** Compliance concerns with client data handling
- **Impact:** Project shutdown or restrictions
- **Mitigation:** Use only plan design facts (no PII), local database storage, established data classification protocols

### Risk 3: User Adoption
- **Risk:** Account executives continue manual processes
- **Impact:** No ROI realization
- **Mitigation:** Start with enthusiastic early adopters, demonstrate 10x improvement, provide exceptional support

### Risk 4: Database Portability
- **Risk:** Issues transferring database between environments
- **Impact:** Workflow friction
- **Mitigation:** DuckDB's single-file design, encryption for transfer, clear sync protocols

### Risk 5: Maintenance Burden
- **Risk:** Plan designs become stale over time
- **Impact:** Decreasing reliability
- **Mitigation:** Annual refresh cycles, change detection alerts, clear data age indicators

---

## Success Criteria

### Launch Criteria
- 90% extraction accuracy on core fields
- 100 clients fully processed and validated
- 5 successful client deliverables generated
- 3 account executives actively using the system
- Peer comparison query response time <2 seconds

### Success Metrics (6 months)
- 850 clients in the Design Matrix
- 50+ deliverables generated monthly
- 30% reduction in analysis time documented
- 85% user satisfaction score
- 95% peer benchmark query accuracy

### Success Metrics (12 months)
- $500K+ additional revenue attributed to Design Matrix insights
- 100% of account team trained and using platform
- 1,000+ prospect plans added to matrix
- 5% improvement in client retention for analyzed accounts
- Platform recognized as essential tool by leadership

---

## Expansion Opportunities

### Future Enhancements
- Real-time plan document monitoring for changes
- Predictive modeling for plan design impact
- Automated compliance testing scenarios
- Integration with participant-level data
- Machine learning for recommendation optimization

### Potential New Use Cases
- RFP response automation
- Market intelligence reports
- Regulatory impact analysis
- M&A due diligence support
- Product development insights

---

## Approval & Sign-off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Product Owner | [Name] | | ☐ |
| Tech Lead | [Name] | | ☐ |
| Data Governance | [Name] | | ☐ |
| Sales Leader | [Name] | | ☐ |
| Compliance | [Name] | | ☐ |

---

## Appendices

### A. YAML Schema Specification
Detailed field definitions and validation rules for plan design storage

### B. Peer Segmentation Logic
Complete rules for creating comparable peer groups

### C. Extraction Confidence Framework
Scoring methodology for data quality assessment

### D. Recommendation Priority Matrix
Impact vs. effort framework for prioritizing plan changes

### E. DuckDB Performance Benchmarks
Expected query performance for common operations

---

*This PRD is a living document and will be updated based on implementation learnings and user feedback.*