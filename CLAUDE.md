# PlanWise Design Matrix - Claude Context

## Project Overview
The PlanWise Design Matrix is an internal intelligence platform that transforms unstructured retirement plan documents into structured data for automated peer analysis, recommendation generation, and client deliverable creation for 850+ tax-exempt DC clients.

## Key Technologies

### Frontend (PlanAlign Studio)
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** TanStack Query + Zustand
- **Styling:** Tailwind CSS
- **Charts:** Recharts

### Backend
- **API:** FastAPI, Python 3.9+
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
├── backend/              # FastAPI Python application
│   ├── main.py           # API entry point
│   └── requirements.txt  # Backend dependencies
├── planalign-ui/         # PlanAlign Studio (primary React frontend)
│   ├── src/api/          # API client
│   ├── src/components/   # React components
│   └── package.json      # Frontend dependencies
├── planwise-ui/          # Legacy UI (deprecated)
├── data/                 # DuckDB database files
├── docs/                 # Documentation
│   ├── PRD v1.0.md       # Product Requirements Document
│   ├── PlanAlign_Studio_UI_Specification.md  # UI/UX Spec
│   └── epics/            # Feature specifications
├── venv/                 # Virtual environment (excluded from git)
└── .claude/              # Claude Code settings
```

## Development Commands

### Launching the Application

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
cd backend
uvicorn main:app --reload --port 8002
```

**Terminal 2 - Frontend:**
```bash
cd planalign-ui
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8002
- API Docs: http://localhost:8002/docs

### Quality Assurance

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

## Key Documentation
- **PRD:** `docs/PRD v1.0.md` - Product requirements and feature specifications
- **UI/UX Spec:** `docs/PlanAlign_Studio_UI_Specification.md` - Complete UI specification with mockups, user flows, and technical implementation details
- **Epics:** `docs/epics/` - Feature-level specifications

## Development Notes
- Follow the comprehensive PRD in `docs/PRD v1.0.md`
- UI implementation should follow `docs/PlanAlign_Studio_UI_Specification.md`
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