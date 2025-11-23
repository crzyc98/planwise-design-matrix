---
description: How to run the PlanWise Design Matrix application (Backend + Frontend)
---

To run the full application, you need to start both the backend API and the frontend UI.

### 1. Start the Backend Server

Open a terminal and run:

```bash
# From the project root
source venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Start the Frontend Application

Open a **new** terminal tab/window and run:

```bash
# From the project root
cd planwise-ui
npm run dev
```

The UI will be available at `http://localhost:5173` (or the port shown in the terminal).

### 3. Verification Steps

1.  **Open the App**: Go to `http://localhost:5173` in your browser.
2.  **View Audit Log**: Click the "📋 View Audit Log" button in the top right corner. You should see the history of changes.
3.  **Inline Editing**:
    *   Go back to the Dashboard.
    *   Scroll down to the "Plan Design Matrix" table.
    *   **Double-click** on any value cell (e.g., "Auto-Enrollment Rate").
    *   Change the value in the modal and click "Save".
    *   Verify the value updates in the table.
    *   Go to the Audit Log again to see your change recorded.
