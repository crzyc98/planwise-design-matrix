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

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Virtual environment (venv)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planwise-design-matrix
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv ../venv
   source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd planwise-ui
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   source ../venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **Start the Frontend Dev Server**
   ```bash
   cd planwise-ui
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3004
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

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
cd planwise-ui
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
├── planwise-ui/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── utils/              # Utilities and configs
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── planwise.db            # DuckDB database
└── README.md
```

## License

[Add your license information here]

## Support

For questions or issues, please contact [your contact information].
