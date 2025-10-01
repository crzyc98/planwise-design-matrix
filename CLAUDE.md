# PlanWise Design Matrix - Claude Context

## Project Overview
The PlanWise Design Matrix is an internal intelligence platform that transforms unstructured retirement plan documents into structured data for automated peer analysis, recommendation generation, and client deliverable creation for 850+ tax-exempt DC clients.

## Key Technologies
- **Backend:** FastAPI, Python 3.9+
- **Database:** DuckDB for analytics
- **ML/AI:** Transformers, PyTorch, spaCy, NLTK
- **Document Processing:** PyMuPDF, pytesseract, python-docx
- **Data Science:** pandas, numpy, scipy, scikit-learn
- **Deliverables:** python-pptx for PowerPoint generation
- **Task Queue:** Celery with Redis
- **Testing:** pytest, pytest-asyncio

## Project Structure
```
/
├── docs/                 # Documentation and PRD
├── requirements.txt      # Python dependencies
├── venv/                # Virtual environment (excluded from git)
└── .claude/             # Claude Code settings
```

## Development Commands
When working on this project, use these commands for quality assurance:

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

## Key Features
1. **Document Intelligence Engine** - Extract plan design elements from Form 5500, SPDs, plan documents
2. **Annotation & Review Console** - Queue low-confidence fields for human review
3. **Design Matrix Database** - Store all plan designs in queryable structure
4. **Peer Benchmarking System** - Statistical analysis with k-anonymity (n ≥ 20)
5. **Recommendation Engine** - Generate evidence-based recommendations
6. **Deliverable Generation** - Create PowerPoint presentations with compliance controls

## Integration Points
- **PlanWise Navigator:** Export baseline and recommendation YAMLs
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

## Development Notes
- Follow the comprehensive PRD in `docs/PRD v1.0.md`
- All statistical comparisons must maintain k-anonymity (minimum 20 peers)
- Use confidence scoring for all extractions
- Implement immutable audit trails for compliance
- All deliverables require pre-approved templates and disclaimers

## Virtual Environment
The project uses a Python virtual environment in `venv/`. To activate:
```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows
```

## Git Workflow
- Main branch: `main`
- Use the comprehensive `.gitignore` that excludes venv/, logs/, secrets/, etc.
- Never commit sensitive configuration or data files