# PlanWise Design Matrix - Codex Context

## Project Overview
The PlanWise Design Matrix is an intelligence platform that transforms unstructured retirement plan documents into structured data for peer benchmarking, recommendation drafting, and deliverable production for 850+ tax-exempt DC clients.

## Key Technologies
- **Backend:** FastAPI, Python 3.9+
- **Database:** DuckDB for analytics workloads
- **ML/AI:** Transformers, PyTorch, spaCy, NLTK
- **Document Processing:** PyMuPDF, pytesseract, python-docx
- **Data Science:** pandas, numpy, scipy, scikit-learn
- **Deliverables:** python-pptx for slide generation
- **Task Queue:** Celery with Redis
- **Testing:** pytest, pytest-asyncio

## Repository Layout
```
/
├── docs/                 # Documentation and PRD assets
├── requirements.txt      # Python dependencies
├── venv/                 # Local virtual environment (ignored by git)
├── README.md             # High-level project orientation
└── CLAUDE.md             # Claude-specific agent context
```

## Agent Operating Guidelines
- Stay in ASCII unless the file already relies on non-ASCII characters.
- Prefer `rg`/`rg --files` for search; most shell commands should be invoked as `bash -lc "..."` with `workdir` set explicitly.
- Sandbox: workspace-write filesystem, restricted network access. Request escalations only when essential; include justification when doing so.
- Planning: skip for trivial work, otherwise maintain multi-step plans and update after completing each step.
- Code edits: add concise comments only when they clarify non-obvious logic; never remove existing user changes.
- If unexpected repo changes appear, stop and confirm user intent before proceeding.
- Testing: run when it adds value; summarize key results instead of pasting full command output.

## Helpful Commands
```bash
# Dependency install (if needed)
pip install -r requirements.txt

# Formatting
black .
isort .

# Linting
flake8 .

# Type checking
mypy .

# Tests
pytest
pytest --cov=. --cov-report=html

# Dev server
uvicorn main:app --reload
```

## Key Features
1. Document Intelligence Engine for extracting plan elements from 5500s, SPDs, and plan documents.
2. Annotation & Review Console to surface low-confidence fields for human validation.
3. Design Matrix Database that stores normalized plan designs for query and benchmarking.
4. Peer Benchmarking with k-anonymity (n ≥ 20) and statistical comparisons.
5. Recommendation Engine that drafts evidence-based plan design recommendations.
6. Deliverable Generation producing compliant PowerPoint decks.

## Integration Points
- PlanWise Navigator: exports baseline and recommendation YAML payloads.
- Aurora/FHI Framework: shared terminology and metrics mapping.

## Security & Compliance
- Data class: "Confidential – Client" (no PII); AES-256 at rest, TLS 1.3 in transit.
- RBAC enforcement, immutable audit trails, 7-year retention.
- Annual refresh cycle with staleness indicators on derived metrics.

## Performance Targets
- Peer query latency: p95 ≤ 1.5s, p99 ≤ 3.0s.
- Deck generation: ≤ 8 minutes p95.
- Extraction accuracy: ≥ 92% on Tier-1, ≥ 88% on Tier-2.
- Service availability: 99.5% during business hours.

## Development Notes
- Follow the detailed PRD in `docs/PRD v1.0.md` when implementing or updating functionality.
- Maintain confidence scores on extraction outputs and ensure k-anonymity for peer comparisons.
- Apply compliance-approved templates and disclaimers when generating deliverables.

## Virtual Environment
Activate the local environment before running commands:
```bash
source venv/bin/activate
# or on Windows
venv\Scripts\activate
```

## Git Workflow
- Primary branch: `main`.
- `.gitignore` covers virtual environments, logs, and secrets; never commit sensitive configuration or client data.
