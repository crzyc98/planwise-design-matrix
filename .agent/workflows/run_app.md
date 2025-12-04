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
cd new-ui
npm run dev
```

The UI will be available at `http://localhost:3000` (or the port shown in the terminal).

### 3. Verification Steps

1.  **Open the App**: Go to `http://localhost:3000` in your browser.
2.  **Check Tabs**: Verify you see "Plan Design", "Strategic Assessment", and "Client Roster" tabs.
3.  **Plan Design**: Ensure the Plan Matrix loads with data.
4.  **Strategic Assessment**: Click the tab and verify the assessment component loads.
5.  **Client Roster**: Click the tab and verify the client list loads.
