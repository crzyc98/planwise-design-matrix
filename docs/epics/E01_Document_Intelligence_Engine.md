# Epic E01: Document Intelligence Engine

**Epic ID:** E01
**Epic Name:** Document Intelligence Engine (Hybrid Extraction Strategy)
**Priority:** Critical
**Estimated Effort:** 24 weeks (6 months) across 4 phases
**Phase:** Foundation - starts with Phase 0 (Manual Baseline)
**Version:** 2.0 - Updated to reflect hybrid approach with manual baseline

---

## Epic Summary

Build the foundational Document Intelligence Engine using a **three-tier hybrid extraction strategy** that combines rules-based pattern matching, Azure Form Recognizer (if available), and human validation to extract retirement plan design data from unstructured documents (Form 5500, SPDs, plan documents). This engine serves as the data foundation for all PlanWise Design Matrix capabilities.

**Key Principle:** The platform's core value is statistical peer benchmarking and recommendation intelligence, not just extraction automation. Data can flow from automated extraction, manual entry, or Excel import—the intelligence layer transforms this into actionable insights.

## Business Value

- **Primary Value:** Enable data-driven advisory services for 850+ client plans through validated, structured plan design data
- **Time Savings:** Reduce plan analysis setup from 15-20 hours to 2 hours (consulting engagement kickoff)
- **Accuracy:** Target 75-80% automated extraction; achieve 95%+ final accuracy after human validation
- **Scale:** Process entire client portfolio systematically vs. ad-hoc manual analysis
- **Foundation:** Enable all downstream capabilities (peer benchmarking, recommendations, deliverables)
- **Flexibility:** Support multiple data entry paths (automated extraction, manual YAML entry, Excel bulk import)

## User Personas & Pain Points

### Primary: Account Executive (Sarah)
- **Current Pain:** Spending hours manually extracting plan details for client meetings
- **Epic Value:** "I have accurate plan data ready before every client call"

### Secondary: Consultant (David)
- **Current Pain:** Weeks gathering baseline data before analysis begins
- **Epic Value:** "I start every project with perfect baseline data already validated"

### Tertiary: Compliance Reviewer (Jennifer)
- **Current Pain:** No visibility into data accuracy or extraction source
- **Epic Value:** "I can see exactly where every data point came from and its confidence level"

---

## User Stories

### Core Extraction Stories

**US-E01-001: Rules-Based Extraction from Form 5500**
- **As an** Account Executive
- **I want** the system to automatically extract key plan provisions from Form 5500 filings using regex patterns
- **So that** I have baseline plan data without manual document review
- **AC:**
  - Extract 30+ high-confidence fields (plan ID, EIN, participant count, total assets, yes/no provisions)
  - Target 70%+ automation rate on Tier-1 fields from Form 5500 Schedule H/I
  - Provide confidence scores based on pattern match strength

**US-E01-002: Azure Form Recognizer Extraction from SPDs**
- **As a** Consultant
- **I want** detailed plan provisions extracted from SPD documents using Azure Form Recognizer
- **So that** I have comprehensive plan design data including complex provisions
- **AC:**
  - Process SPDs from major recordkeepers (Fidelity, Vanguard, TIAA, Empower)
  - Extract 20+ moderate complexity fields (match formulas, vesting schedules, eligibility rules)
  - Graceful fallback to manual review if Azure Form Recognizer unavailable
  - Custom trained models per recordkeeper template

**US-E01-003: Manual Data Entry Interface**
- **As a** Consultant
- **I want** to manually enter plan design data when documents are complex or unavailable
- **So that** I can still populate the Design Matrix and benefit from peer benchmarking
- **AC:**
  - Form-based YAML editor with inline validation
  - Smart defaults for common values (age 21 eligibility, immediate deferral vesting)
  - Contextual help with regulatory definitions for each field
  - Progress tracking showing completion percentage
  - Template library for recordkeeper-specific patterns

**US-E01-004: Excel Bulk Import**
- **As a** system administrator
- **I want** to bulk import plan data from standardized Excel templates
- **So that** we can migrate legacy data and handle batch data entry efficiently
- **AC:**
  - Standardized Excel template mapping columns to schema fields
  - Column validation and error reporting
  - Batch processing with row-level success/failure status
  - Audit trail linking to source Excel file

**US-E01-005: Document Format Support**
- **As a** system
- **I want** to process multiple document formats (PDF, DOCX, scanned images)
- **So that** users can upload documents in their native format
- **AC:**
  - PDF text extraction via PDFPlumber
  - Table extraction from PDFs via Camelot
  - DOCX processing via python-docx
  - OCR for scanned documents via pytesseract
  - Document type detection and routing to appropriate extraction tier

### Validation & Quality Stories

**US-E01-006: Confidence Scoring**
- **As a** Compliance Reviewer
- **I want** confidence scores for every extracted field
- **So that** I can prioritize review of uncertain extractions
- **AC:**
  - Confidence scores 0-100% based on pattern match strength, supporting mentions, cross-document consistency
  - Tier-1 fields (critical): Require 80%+ confidence for auto-accept
  - Tier-2 fields (standard): Require 70%+ confidence for auto-accept
  - Below threshold: Automatically queue for human review
  - Manual entry fields marked with confidence=100% and extraction_method=ManualEntry

**US-E01-007: Field Validation Rules**
- **As a** system
- **I want** to validate extracted data against business rules
- **So that** obviously incorrect extractions are caught before review
- **AC:**
  - Type validation (integers, decimals, enums, date ranges)
  - Range validation (age 18-21, service 0-24 months, match rates 0-200%)
  - Cross-field consistency (can't have vesting without match, auto-escalation requires auto-enrollment)
  - Cross-validation with Form 5500 structured data
  - 95%+ of logically inconsistent extractions caught

**US-E01-008: Data Provenance Tracking**
- **As a** Compliance Reviewer
- **I want** complete provenance for every extracted data point
- **So that** I can audit extraction accuracy and trace data lineage
- **AC:**
  - Link every value to source document, page number, extraction method
  - Track: extraction_method (RegexPattern/AzureFormRecognizer/ManualEntry/ExcelImport)
  - Immutable audit trail: timestamp, confidence score, reviewer actions
  - Before/after values for all edits with reason codes
  - All fields validated by human before client-facing export (95%+ final accuracy target)

### Review & Correction Stories

**US-E01-009: Human Review Queue**
- **As a** Compliance Reviewer
- **I want** a prioritized queue of low-confidence extractions requiring review
- **So that** I can efficiently validate uncertain data before use
- **AC:**
  - Queue sorted by business criticality and confidence score
  - Side-by-side view: PDF viewer (left), extracted value with confidence (center), action panel (right)
  - Supports accept/edit/reject/flag for escalation
  - Bulk actions for high-confidence fields
  - SLA tracking with days in queue and overdue indicators
  - Banner reminding users they can leverage Microsoft Copilot 365 for document interpretation

**US-E01-010: Extraction Corrections**
- **As a** Compliance Reviewer
- **I want** to correct extraction errors and provide feedback
- **So that** data quality improves and patterns are documented for future automation
- **AC:**
  - Edit extracted values with reason code selection
  - Add comments and context for future reference
  - Track correction patterns to improve extraction logic
  - Immutable audit log with user ID, action, timestamp, before/after values
  - Reviewer performance metrics (accuracy, throughput, consensus)

---

## Technical Requirements

### Architecture Requirements - Three-Tier Hybrid Approach

**Tier 1: Rules-Based Pattern Matching (Primary - 70% target automation)**
- **Libraries:** PDFPlumber, PyPDF2, Camelot (table extraction), python-docx, pytesseract (OCR)
- **Pattern Library:** Regex patterns for structured Form 5500 fields (Schedule H/I)
- **Target Fields:** 30+ high-confidence extractions
  - Client identification (EIN, client name)
  - Basic demographics (participant count, total assets)
  - Yes/no provisions (match offered, loans available, auto-enrollment present)
  - Eligibility requirements
  - Match and non-elective contribution details
  - Auto-enrollment and escalation settings
  - Standard numerical fields from checkboxes
- **Confidence Scoring:** Based on pattern match strength (exact=95%, fuzzy=70-85%)

**Tier 2: Azure Form Recognizer (Secondary - If available in corporate tenant)**
- **Deployment:** Azure Cognitive Services within corporate Azure tenant
- **Custom Trained Models:** Train on 50-100 sample documents per recordkeeper
- **Target Documents:** SPD layouts from Fidelity, Vanguard, TIAA, Empower
- **Target Fields:** 20+ moderate complexity
  - Match formulas in narrative format
  - Vesting schedules in table format
  - Eligibility rules with multiple conditions
- **Fallback:** Route to manual review if Azure Form Recognizer unavailable

**Tier 3: Manual Review Queue with Copilot 365 Assistance**
- **Use Cases:** Complex extractions, non-standard provisions, low-confidence automated results
- **Review Interface:** Side-by-side document viewer + structured form entry
- **Copilot Integration:** Users leverage Microsoft Copilot 365 manually for interpretation assistance
- **Quality Assurance:** All automated extractions below confidence threshold require validation
- **Target:** All fields achieve 95%+ accuracy after human validation before client-facing export

**Alternative Data Entry Methods:**
- **Direct YAML Entry:** Form-based UI following PlanDesign schema
- **Excel Bulk Import:** Template-based import for multiple plans
- **API Integration:** Future state for recordkeeper data feeds

### Performance Requirements
- **Processing Time:** p95 ≤ 5 minutes per document for standard plan documents
- **Accuracy Targets:**
  - Automated extraction: 75-80% on target fields (before human review)
  - Final accuracy: 95%+ after human validation (required for all client-facing exports)
  - Tier-1 field confidence threshold: 80%+ for auto-accept
  - Tier-2 field confidence threshold: 70%+ for auto-accept
- **Throughput:** Support 50+ concurrent document uploads
- **Storage:** Handle documents up to 50MB; support PDF, DOCX, scanned images (with OCR)
- **Review Queue SLA:** 95% of low-confidence fields resolved within 3 business days

### Data Schema Requirements
- **Structured Output:** Standardized YAML schema for all extracted plan data (PlanDesign model)
- **Field Classification:** Tier-1/Tier-2 field categorization with confidence thresholds
- **Version Control:** Track schema evolution with data_version field; support migration
- **Validation Rules:** Pydantic models for type safety and business rule enforcement
- **Provenance Tracking:** Every field links to: source document, page, extraction_method (RegexPattern/AzureFormRecognizer/ManualEntry/ExcelImport), confidence score, reviewer actions

---

## Acceptance Criteria

### Phase 0: Manual Baseline (Foundation)
- [ ] Manual data entry interface operational with form-based YAML editor
- [ ] Excel bulk import working with column validation and error reporting
- [ ] 50 high-priority clients manually extracted into Design Matrix
- [ ] Peer benchmarking functional with manually-entered data
- [ ] First 3 PowerPoint deliverables generated and approved by Compliance
- [ ] Pattern library initialized with 20+ common regex patterns documented from manual analysis
- [ ] Proof of value: 5 peer comparison decks demonstrating 8x time savings

### Phase 1: Rules-Based Automation
- [ ] Regex pattern library covers 30+ Form 5500 fields (Schedule H/I)
- [ ] Achieve 60-70% extraction automation on structured Form 5500 fields
- [ ] Confidence scoring functional based on pattern match strength
- [ ] Review queue interface operational with side-by-side PDF viewer
- [ ] 100 clients processed (50 manual + 50 automated with review)

### Phase 2: Azure Form Recognizer (If Available)
- [ ] Azure Form Recognizer models trained for top 3 recordkeepers (if tenant access available)
- [ ] Semi-structured document processing (SPDs) with 75-80% automation
- [ ] Graceful fallback to manual review when Azure unavailable
- [ ] 250 clients processed with hybrid approach

### Extraction Accuracy (All Phases)
- [ ] Automated extraction: 75-80% accuracy on target fields (before human review)
- [ ] Final accuracy: 95%+ after human validation (measured on 100+ test plans)
- [ ] Process Form 5500, SPD, and plan document formats successfully
- [ ] Handle multi-page documents, extract data from tables/forms, process scanned images (OCR)

### Quality & Validation
- [ ] Confidence scores correlate with actual accuracy (validate on held-out test set)
- [ ] Tier-1 fields: 80%+ confidence for auto-accept; Tier-2 fields: 70%+ confidence
- [ ] Business rule validation catches 95%+ of logically inconsistent extractions
- [ ] Cross-field validation (vesting requires match, auto-escalation requires auto-enrollment) working
- [ ] All extracted fields linked to source document location, page, extraction method, confidence

### Review Workflow
- [ ] Low-confidence fields automatically queued for human review with business priority sorting
- [ ] Review interface shows document snippet, extracted value, confidence score, and action panel
- [ ] Bulk actions supported for high-confidence fields
- [ ] SLA tracking: 95% of review queue cleared within 3 business days
- [ ] Corrections tracked with user ID, timestamp, reason code in immutable audit log
- [ ] Reviewer performance metrics tracked (accuracy, throughput, consensus)
- [ ] Banner reminding users of Microsoft Copilot 365 availability for interpretation

### Alternative Entry Methods
- [ ] Form-based YAML editor with inline validation and smart defaults
- [ ] Contextual help with regulatory definitions for each field
- [ ] Progress tracking showing completion percentage (required vs. optional fields)
- [ ] Template library for recordkeeper-specific patterns
- [ ] Excel import supporting standardized template with row-level success/failure reporting

### Data Provenance & Audit
- [ ] Every field tracks: extraction_method (RegexPattern/AzureFormRecognizer/ManualEntry/ExcelImport)
- [ ] Immutable audit trail: extraction timestamp, confidence score, reviewer actions
- [ ] Before/after values logged for all edits with reason codes
- [ ] Source document linked for every extraction (automated or manual)

### Integration & Output
- [ ] Extracted data stored in DuckDB following PlanDesign Pydantic schema
- [ ] Data lineage preserved through entire pipeline (document → extraction → validation → database)
- [ ] Support for incremental updates when new documents received for existing clients
- [ ] Integration hooks prepared for downstream peer benchmarking system
- [ ] All manual entry and automated extraction flow into same unified data model

---

## Dependencies

### Internal Dependencies
- **None** - This is the foundational epic that other epics depend on
- **Note:** Peer benchmarking, recommendation engine, and deliverable generation can proceed with manually-entered data

### External Dependencies
- **Document Storage:** S3 bucket for uploaded plan documents (s3://planwise-docs/)
- **Azure Form Recognizer:** Conditional - only if available in corporate tenant (graceful fallback to manual review)
- **Database Schema:** DuckDB with PlanDesign Pydantic schema supporting all extraction methods

### Technical Dependencies
- **Authentication:** OAuth 2.0 + JWT for user access controls
- **File Upload:** Secure document upload with virus scanning (ClamAV)
- **Python Libraries:** PDFPlumber, PyPDF2, Camelot, python-docx, pytesseract (all available)
- **Excel Processing:** openpyxl or pandas for bulk import functionality
- **Celery + Redis:** Task queue for async document processing

### Corporate Environment Constraints
- **Not Available:** External LLM APIs (OpenAI, Anthropic), SageMaker with transformer models
- **Available:** Python open-source libraries, Azure services in corporate tenant, GitHub Copilot for development
- **Manual Assistance:** Microsoft Copilot 365 available to users for ad-hoc document interpretation

---

## Success Metrics

### Phase 0 Success Indicators (Weeks 1-2)
- 50 high-priority clients manually extracted into Design Matrix
- 5 peer comparison decks generated demonstrating 8x time savings vs. manual Excel analysis
- 5 AEs using platform in client meetings
- Pattern library documented with 20+ regex expressions for future automation
- Team consensus: "This is valuable even without extraction automation"

### Leading Indicators (Weekly)
- Number of plans added to Design Matrix (manual + automated)
- Extraction automation rate (target: 0% Week 1, 60% Month 2, 70% Month 3, 80% Month 5)
- Average confidence score of automated extractions
- Review queue throughput (items resolved per day)
- Extraction processing time (automated path)
- Manual entry time per plan (tracking improvement with templates)

### Lagging Indicators (Monthly)
- Final accuracy after human validation: Target 95%+ for all client-facing exports
- Automated extraction accuracy: Target 75-80% before review (measured on test set)
- Time savings vs. pre-platform manual process: Target 15 hours → 2 hours per client (consulting kickoff)
- User satisfaction scores from Account Executives and Consultants
- Data quality scores from downstream peer benchmarking system
- Pattern library coverage: 30+ fields by Month 2, 50+ fields by Month 5

### Key Performance Indicators
- **Accuracy Target (Final):** 95%+ after human validation (required for all client exports)
- **Accuracy Target (Automated):** 75-80% before review (automation efficiency)
- **Processing Speed (Automated Path):** p95 ≤ 5 min per document
- **Processing Speed (Manual Path):** 30-60 min per plan with form-based entry
- **Review Efficiency:** 95% of review queue cleared within 3 business days
- **Data Coverage:** 100% of clients in Design Matrix (via any entry method)
- **Extraction Automation Rate:** 80%+ by Month 5 (with 20% manual for complex edge cases)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Limited Extraction Automation** | High | High | **Phase 0 proves value with manual data; position as "human-validated quality advantage"; incrementally improve automation** |
| Manual Data Entry Bottleneck | Medium | High | Excel bulk import, form-based templates with smart defaults, hire temp extraction team for Phase 0/1, parallel automation development |
| Automated extraction accuracy below targets | Medium | Medium | Confidence scoring mandatory human review for <80% fields, phased rollout, 95%+ post-review accuracy requirement |
| Document format variations break pipeline | Medium | High | Robust preprocessing, format detection, graceful fallback to manual review, OCR for scanned docs |
| Azure Form Recognizer unavailable | Medium | Medium | **Platform value independent of Azure; graceful degradation to manual review + regex patterns** |
| Performance bottlenecks at scale | Medium | Medium | Load testing, Celery async processing, horizontal scaling, caching with Redis |
| Pattern library incomplete | Medium | Medium | **Continuous refinement based on manual extraction learnings; document edge cases for future automation** |
| Data quality degrades over time | High | Low | Mandatory annual refresh cycle, staleness indicators, continuous validation |
| Complex plan provisions missed by automation | Medium | High | **Human review for all low-confidence fields; domain expert escalation path; comprehensive test suite** |
| User adoption challenges | High | Medium | **Phase 0 proves value before requesting behavior change; start with power users; demonstrate 8x efficiency gains** |
| Team capacity for manual extraction | High | Medium | Prioritize high-value clients, Excel bulk import for migration, consider outsourced extraction team for Phase 0 |

---

## Implementation Phases

### Phase 0: Manual Baseline (Weeks 1-2) - CRITICAL FOUNDATION
**Purpose:** Demonstrate immediate value with manually-validated data while building automation incrementally

**Key Activities:**
- Deploy core platform infrastructure (DuckDB, FastAPI, React UI)
- Build manual data entry forms with schema validation and inline help
- Implement Excel bulk import for legacy data
- Deploy peer benchmarking engine (works with any data source)
- Create PowerPoint generation with approved templates
- Manual extraction team documents patterns for automation roadmap
- Seed pattern library from high-value Form 5500 fields

**Deliverables:**
- 50 high-priority clients in Design Matrix
- 5 peer comparison decks demonstrating value
- Pattern library with 20+ documented regex expressions
- Proof of concept: Platform valuable even without automation

---

### Phase 1: Rules-Based Automation (Weeks 3-8)
**Purpose:** Automate high-confidence Form 5500 extractions using regex patterns

**Phase 1A: Core Pipeline (Weeks 3-5)**
- Document upload and preprocessing (PDF, DOCX, scanned images)
- Regex-based text extraction for Form 5500 Schedule H/I
- Document type detection and routing logic
- Initial confidence scoring based on pattern match strength
- Review queue infrastructure with prioritized sorting

**Phase 1B: Enhanced Extraction & Validation (Weeks 6-8)**
- Expand pattern library to 30+ Form 5500 fields
- Business rule validation engine (type, range, cross-field consistency)
- Provenance tracking system (immutable audit trail)
- Review queue interface with side-by-side PDF viewer
- Integration with manual entry workflow (unified data model)
- Performance optimization for 60-70% automation rate

**Deliverables:**
- 100 clients processed (50 manual baseline + 50 automated with review)
- Regex pattern library covering 30+ fields
- Review queue operational with <3 day SLA
- 60-70% automation on Form 5500 structured fields

---

### Phase 2: Azure Form Recognizer + Scale (Weeks 9-16)
**Purpose:** Extend automation to semi-structured documents (SPDs) and scale to broader client base

**Key Activities:**
- Evaluate Azure Form Recognizer availability in corporate tenant
- Train custom models for top 3 recordkeepers (Fidelity, Vanguard, Empower)
- Implement graceful fallback when Azure unavailable
- Build recordkeeper-specific pattern libraries
- Optimize review queue workflows based on Phase 1 learnings
- Scale manual extraction team for complex edge cases
- Complete Excel bulk import for legacy data migration

**Deliverables:**
- 250 clients processed (mix of automated and manual)
- Azure Form Recognizer models operational (if available) or documented fallback
- 75-80% extraction automation across all document types
- Pattern library expanded to 50+ fields

---

### Phase 3: Production Scale (Weeks 17-24)
**Purpose:** Achieve full client coverage and operational maturity

**Key Activities:**
- Complete backfill of remaining clients (mix of automated + manual)
- Optimize extraction patterns based on 6 months of data
- Refine confidence scoring thresholds based on accuracy analysis
- Deploy mobile app for AE field access (future enhancement)
- Integrate with PlanWise Navigator (YAML export)
- Establish annual refresh cycle and data governance procedures
- Document lessons learned for continuous improvement

**Deliverables:**
- 850 clients in Design Matrix (full client book)
- 80-85% overall extraction automation (95%+ accuracy after human validation)
- Review queue consistently <20 items with 2-day resolution
- ROI metrics showing 8x efficiency gains

---

## Epic Owner

**Product Owner:** PlanWise Navigator Team
**Tech Lead:** [To be assigned]
**Key Stakeholders:** Account Executives, Consultants, Compliance Team, Data Governance
**Sprint Team:** [To be assigned]
  - **Phase 0 Team:** 1 full-stack engineer + 2-3 manual extraction specialists (temp)
  - **Phase 1-2 Team:** 2 backend engineers + 1 frontend engineer
  - **Phase 3 Team:** 1 engineer for optimization + manual extraction team (ongoing for edge cases)

---

## Key Decisions & Trade-offs

**Decision 1: Manual Baseline Before Automation**
- **Rationale:** Prove platform value immediately while building automation incrementally; addresses risk of limited AI capabilities in corporate environment
- **Trade-off:** Requires manual extraction team for Phase 0/1, but enables faster time-to-value and reduces technical risk

**Decision 2: Hybrid Three-Tier Extraction Strategy**
- **Rationale:** Realistic given corporate constraints (no external LLM APIs); combines rules-based patterns, Azure services (if available), and human validation
- **Trade-off:** Lower automation rates (80% vs. 95%+), but achieves higher final accuracy (95%+ after human review)

**Decision 3: 95%+ Accuracy Requirement After Human Validation**
- **Rationale:** All client-facing exports must meet highest accuracy standards for compliance and fiduciary duty
- **Trade-off:** Requires human review queue and SLA management, but positions as "human-validated quality advantage"

**Decision 4: Multiple Data Entry Paths**
- **Rationale:** Platform value comes from peer benchmarking and recommendations, not just extraction; support manual entry, Excel import, and automated extraction
- **Trade-off:** More development complexity, but reduces dependency on any single extraction method

---

**Epic Status:** Ready to Start
**Next Action:**
1. Finalize Phase 0 team assignments (1 engineer + 2-3 extraction specialists)
2. Prioritize 50 high-value clients for manual baseline
3. Technical design review for manual entry interface and Excel import
4. Begin pattern library documentation during Phase 0 manual extraction