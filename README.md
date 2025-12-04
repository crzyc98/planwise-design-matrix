# Fidelity PlanAlign Studio

A streamlined web application for managing and editing 401(k) retirement plan design data with an intuitive, professional interface.

## Overview

Fidelity PlanAlign Studio is a data management tool designed for retirement plan administrators and consultants to efficiently view and update plan design parameters across multiple clients. The application provides a clean, modern interface focused on rapid data entry and editing with smart field dependencies and auto-save functionality.

## Key Features

### 🚀 Inline Editing
- Click any field value to edit in place
- Auto-save on change - no modal dialogs for quick updates
- Keyboard shortcuts (Enter to save, Esc to cancel)
- Instant visual feedback during saves

### 🔗 Smart Field Dependencies
- Auto-Enrollment Rate automatically disabled when Auto-Enrollment is "No"
- Auto-Escalation Rate and Cap automatically disabled when Auto-Escalation is "No"
- Fields show "N/A" when dependencies aren't met
- Contextual tooltips guide users

### 📊 Organized Data Display
- Fields grouped by category (Eligibility, Contributions, Vesting, Auto Features)
- Clean card-based layout
- Professional visual hierarchy
- Responsive design

### 🎯 User-Friendly Inputs
- Percentage fields display as human-readable values (e.g., "3%" instead of "0.03")
- Dropdowns for enums and boolean fields
- Input validation with clear error messages
- Smart conversion between display and storage formats

### 📝 Optional Audit Trail
- "Reason for Change" field is optional for faster workflows
- Full edit history tracked in the backend
- Audit logs maintain compliance

## Planned Features

### 📊 Regional Benchmarking
- Select a client to view how their plan design compares to regional peers
- Statistical analysis by geographic region.  This should be based on clients in the same industry that are in the same immediate region where they would compete with each other for talent. 
- Side-by-side comparison of key metrics:
  - Auto-Enrollment rates
  - Auto-Escalation parameters
  - Employer match formulas
  - Vesting schedules
- Visual indicators showing client positioning vs. regional medians
- Cohort size and statistical significance displayed for transparency

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and builds
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** for styling

### Backend
- **FastAPI** (Python) for REST API
- **DuckDB** for embedded database
- **Pydantic** for data validation

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### One-Time Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd planwise-design-matrix

# 2. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Install dependencies
npm install                      # Root (includes concurrently)
npm install --prefix planalign-ui # Frontend
```

---

## Launching the Application

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Start both backend and frontend
npm run dev
```

You'll see color-coded output from both services:
```
[api] INFO:     Uvicorn running on http://127.0.0.1:8002
[ui]  VITE v5.x.x  ready in XXX ms
[ui]  ➜  Local:   http://localhost:3000/
```

### Run Services Individually

```bash
npm run backend   # Just the API
npm run frontend  # Just the UI
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | PlanAlign Studio UI |
| **Backend API** | http://localhost:8002 | FastAPI REST API |
| **API Docs** | http://localhost:8002/docs | Interactive Swagger docs |
| **API Docs (Alt)** | http://localhost:8002/redoc | ReDoc documentation |

---

## Stopping the Application

Press `Ctrl+C` to stop both servers.

## Usage

1. **Select a Client** from the dropdown in the header
2. **View Plan Data** organized by category in the Plan Design Matrix
3. **Edit Fields** by clicking directly on any value
4. **Use Dropdowns** for boolean and enum fields (auto-saves on selection)
5. **Type and Save** for text/number fields (Enter to save, Esc to cancel)
6. **Access Full Editor** via the "⋯" button on hover for detailed edits with notes

## Field Configuration

### Auto-Enrollment
- **Auto-Enrollment**: Yes/No
- **Auto-Enrollment Rate**: 1%-10% (disabled if Auto-Enrollment is No)

### Auto-Escalation
- **Auto-Escalation**: Yes/No
- **Auto-Escalation Rate**: 0.5%, 1%, 1.5%, 2%, 2.5%, 3%, 3.5%, 4% (disabled if Auto-Escalation is No)
- **Auto-Escalation Cap**: 4%-15% (disabled if Auto-Escalation is No)

### Other Fields
- Eligibility
- Employer Match
- Match Effective Rate
- Non-Elective Contribution
- Vesting Schedule

## Development

### Build Frontend
```bash
cd planalign-ui
npm run build
```

### Run Tests
```bash
cd backend
pytest
```

### Database Migrations
Database schema changes are managed through migration scripts in the `backend/` directory.

## Project Structure

```
planwise-design-matrix/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── migrations/             # Database migration scripts
├── planalign-ui/               # PlanAlign Studio (primary UI)
│   ├── src/
│   │   ├── api/                # API client and hooks
│   │   ├── components/         # React components
│   │   └── utils/              # Utilities and configs
│   ├── package.json
│   └── vite.config.ts
├── planwise-ui/                # Legacy UI (deprecated)
├── data/
│   └── planwise.db             # DuckDB database
├── docs/
│   ├── PRD v1.0.md             # Product Requirements Document
│   ├── PlanAlign_Studio_UI_Specification.md  # UI/UX Specification
│   └── epics/                  # Feature epic specifications
├── venv/                       # Python virtual environment (git-ignored)
└── README.md
```

## License

[Add your license information here]

## Support

For questions or issues, please contact [your contact information].
