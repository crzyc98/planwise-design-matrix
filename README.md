# PlanWise Design Matrix

An internal intelligence platform that transforms unstructured retirement plan documents into structured data for automated peer analysis, recommendation generation, and client deliverable creation for 850+ tax-exempt DC clients.

## Overview

The PlanWise Design Matrix is the data foundation and analytical engine for retirement plan consulting. It extracts plan design features from documents, maintains a queryable database of plan provisions, and generates peer benchmarking insights to drive advisory conversations.

**Key Value Proposition:** Enable data-driven retirement plan consulting at scale by automating plan data extraction, peer comparisons, and recommendation generation.

## UI Previews

### Main Dashboard
The primary interface for viewing and analyzing individual retirement plan designs with extracted data, peer benchmarking, and automated recommendations.

![Main Dashboard](docs/UI/Screenshot%202025-09-29%20at%202.46.28%E2%80%AFPM.png)

**Features shown:**
- Document upload panel with AI extraction status
- Plan Design Matrix table with confidence scores
- Peer benchmark cards showing industry comparisons
- AI insights and automated recommendations
- Data validation workflow

### Peer Analysis - Overview Tab
Consulting-grade peer benchmarking assessment with traffic light indicators showing how the client compares to their peer cohort.

![Peer Benchmarking Assessment](docs/UI/Screenshot%202025-09-30%20at%209.32.39%E2%80%AFAM.png)

**Features shown:**
- Five-lever comparison framework (Eligibility, Auto-Enrollment, Auto-Escalation, Employer Contribution, Vesting)
- Traffic light indicators (▲ green = above peers, ● orange = at median, ▼ red = below peers)
- Structured assessment text for each feature
- Peer cohort statistics with n-size

### Peer Analysis - Alternative View
Simplified peer benchmarking layout optimized for presentation and export.

![Peer Benchmarking - Alternative](docs/UI/Screenshot%202025-09-30%20at%201.12.35%E2%80%AFPM.png)

**Features shown:**
- Clean three-column layout (Lever | Current Design | Peer Average | Assessment)
- Visual indicators with highlighted status boxes
- Healthcare cohort comparison (n=19)

## Key Features

### 1. Document Intelligence Engine
- Extract plan design features from Form 5500, SPDs, and plan documents
- Hybrid approach: Rules-based patterns + Azure Form Recognizer + Human validation
- Confidence scoring and quality assurance workflows
- Target: 95%+ accuracy after human validation

### 2. Plan Data Maintenance
- Direct editing of plan data with validation rules
- Complete audit trail (who, what, when, why)
- Field-level change history
- Excel import/export functionality

### 3. Peer Benchmarking System
- Statistical analysis with k-anonymity (n ≥ 20)
- Cohort construction by industry, size, and plan characteristics
- Percentile rankings and gap analysis
- Traffic light indicators for client positioning

### 4. Deliverable Generation
- PowerPoint presentations with approved templates
- Peer comparison reports
- Recommendation summaries
- Compliance-ready disclaimers and data citations

## Technology Stack

- **Backend:** FastAPI, Python 3.9+
- **Database:** DuckDB for analytics
- **ML/AI:** Transformers, PyTorch, spaCy, NLTK
- **Document Processing:** PyMuPDF, pytesseract, python-docx
- **Data Science:** pandas, numpy, scipy, scikit-learn
- **Deliverables:** python-pptx for PowerPoint generation
- **Task Queue:** Celery with Redis
- **Frontend:** React, TypeScript, TanStack Query, Tailwind CSS
- **Testing:** pytest, pytest-asyncio

## Project Structure

```
/
├── backend/                 # FastAPI backend services
├── planwise-ui/            # React frontend application
├── docs/                   # Documentation and PRD
│   ├── epics/             # Feature epics and specifications
│   │   ├── completed/     # Finished epics
│   │   ├── active/        # In-progress epics
│   │   └── planned/       # Future epics
│   └── UI/                # UI mockups and screenshots
├── requirements.txt        # Python dependencies
├── venv/                  # Virtual environment (excluded from git)
└── .claude/               # Claude Code settings
```

## Development Setup

### Python Virtual Environment

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### Development Commands

```bash
# Code formatting
black .
isort .

# Linting
flake8 .

# Type checking
mypy .

# Testing
pytest
pytest --cov=. --cov-report=html

# Development server
uvicorn main:app --reload
```

## Key Epics

### ✅ Completed
- **E01: Document Intelligence Engine** - Core extraction pipeline with hybrid approach
- **E04: Plan Data Maintenance & Editing** - Data quality and editing capabilities

### 🔄 Planned
- **E02: Plan Analysis Dashboard** - Interactive plan viewing and analysis
- **E03: Peer Analysis & Consulting Views** - Professional deliverable generation
- **E05: Inline Editing Core** - Enhanced data editing UX
- **E06: Keyboard Navigation** - Power user keyboard shortcuts
- **E07: Command Palette & Bulk Operations** - Advanced productivity features
- **E08: UX Polish & Validation** - Refinement and quality improvements

## Integration Points

- **PlanWise Navigator:** Export baseline and recommendation YAMLs for modeling
- **Aurora/FHI Framework:** Consistent terminology and metrics mapping

## Security & Compliance

- Plan design data classified as "Confidential – Client" (no PII)
- AES-256 encryption at rest, TLS 1.3 in transit
- Role-based access control (RBAC)
- 7-year audit trail retention
- Annual data refresh cycle with staleness indicators

## Performance Requirements

- Peer query latency: p95 ≤ 1.5s; p99 ≤ 3.0s
- Deck generation: ≤ 8 min p95
- Extraction accuracy: ≥ 92% on Tier-1 fields; ≥ 88% on Tier-2
- System availability: 99.5% during business hours

## Documentation

- **PRD:** See `docs/PRD v1.0.md` for comprehensive product requirements
- **Epics:** See `docs/epics/` for detailed feature specifications
- **Claude Context:** See `CLAUDE.md` for AI assistant instructions

## License

Internal Fidelity Investments project. Not for external distribution.
