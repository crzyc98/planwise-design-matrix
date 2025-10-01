# EPIC-001: Plan Analysis Dashboard

**Epic Owner:** Product Management
**Technical Lead:** Frontend Engineering
**Priority:** P0 (Critical - Foundation)
**Target Release:** Phase 1 (Month 1-2)
**Estimated Effort:** 4-6 weeks
**Dependencies:** None (foundational feature)

---

## Epic Overview

Build the core Plan Analysis Dashboard - the primary interface for viewing and analyzing individual retirement plan designs with AI-extracted data, peer benchmarking, and automated recommendations. This is the flagship feature that users interact with daily.

### Business Value

- **Primary Use Case:** Account Executives preparing for client meetings need instant access to plan design data, peer comparisons, and talking points
- **Success Metric:** 60%+ of client meetings use Design Matrix data (tracked via usage analytics)
- **Time Savings:** Reduce meeting prep from 2 hours → 15 minutes (87.5% reduction)
- **Revenue Impact:** Enable data-driven conversations that identify consulting opportunities

### User Story

> "As an Account Executive, I want to quickly view any client's plan design with peer comparisons so that I can have informed, data-driven conversations in every client interaction."

---

## UI Specification

**UI Mockup Reference:** See `docs/UI/Screenshot 2025-09-29 at 2.46.28 PM.png` for the complete dashboard design generated with Claude Artifacts. This mockup shows the production-quality layout with all components integrated.

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│ Header: PW Logo | [Client Selector Dropdown ▼] | Settings | Report│
├──────────────┬────────────────────────────────────┬────────────────┤
│              │                                    │                │
│  Document    │    Plan Design Matrix             │  Peer          │
│  Upload      │    (Extracted Features Table)     │  Benchmark     │
│  Panel       │                                    │  Cards         │
│              ├────────────────────────────────────┤                │
│  AI          │                                    │  Recommend-    │
│  Insights    │                                    │  ations        │
│              │                                    │                │
└──────────────┴────────────────────────────────────┴────────────────┘
```

### Component Specifications

---

## Component 1: Client Selector Dropdown

### Visual Design

```
┌─────────────────────────────────────────────────┐
│ 🏢 ABC Manufacturing 401(k) Plan            ▼  │
└─────────────────────────────────────────────────┘
```

**Location:** Top header, center-left (prominent placement)
**Component Type:** Searchable dropdown with rich metadata

### Functionality

1. **Dropdown Trigger:**
   - Current client name with company icon
   - Plan type badge (401k/403b/457b)
   - Dropdown caret indicating interactivity
   - Hover state: Subtle background color change

2. **Dropdown Menu (Expanded):**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ 🔍 Search clients...                                    │
   ├─────────────────────────────────────────────────────────┤
   │ 📌 RECENT                                               │
   │  🏢 ABC Manufacturing 401(k)        2,400 participants │
   │  🏥 City Hospital 403(b)            1,850 participants │
   │  🎓 State University 403(b)         8,200 participants │
   ├─────────────────────────────────────────────────────────┤
   │ 📁 ALL CLIENTS (850)                                    │
   │  🏢 Acme Corp 401(k)                  450 participants │
   │  🏢 Beta Industries 401(k)            780 participants │
   │  🏥 Care Center 403(b)                320 participants │
   │  ... (virtualized list for performance)                │
   └─────────────────────────────────────────────────────────┘
   ```

3. **Search Behavior:**
   - Real-time fuzzy search (client name, industry, plan type)
   - Keyboard navigation (arrow keys, enter to select)
   - Recently viewed clients at top (max 5)
   - Sort options: Name (A-Z), Participants (high→low), Last viewed

4. **Client Metadata Shown:**
   - Company name
   - Plan type (401k/403b/457b) with colored badge
   - Participant count
   - Industry icon
   - Data freshness indicator (if >12 months old: ⚠️ warning)

### API Integration

```typescript
// GET /api/v1/plans?search={query}
interface ClientSelectorAPI {
  getRecentClients(userId: string): Promise<ClientSummary[]>;
  searchClients(query: string, limit: number): Promise<ClientSummary[]>;
  getAllClients(filters?: FilterOptions): Promise<ClientSummary[]>;
}

interface ClientSummary {
  client_id: string;
  plan_sponsor_name: string;
  client_name: string;
  industry: string;
  total_participants: number;
  last_viewed_at?: Date;
  data_freshness_days: number; // Days since last update
}
```

### Performance Requirements

- Dropdown opens in <50ms
- Search results update in <200ms
- Handle 850+ clients without lag (virtualized list)
- Cache recent clients client-side (localStorage)

---

## Component 2: Document Upload Panel

### Visual Design

```
┌────────────────────────────────┐
│  📄 Document Upload            │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │         📤              │  │
│  │   Drop files here       │  │
│  │  or click to browse     │  │
│  └──────────────────────────┘  │
│                                │
│  📑 Form 5500 - 2024.pdf       │
│     ✅ Auto-Extract Processing │
│     ████████░░░░░░░░ 67%      │
│                                │
│  📑 Plan Document.pdf          │
│     ✅ Auto-Extract Complete   │
│                                │
└────────────────────────────────┘
```

### Functionality

1. **Upload Area:**
   - Drag & drop zone with visual feedback
   - Click to browse file system
   - Accept: .pdf, .docx (max 50MB per file)
   - Multiple file upload support

2. **File Status Indicators:**
   - **Processing:** Blue progress bar with percentage
   - **Complete:** Green checkmark with "Complete" badge
   - **Error:** Red X with error message (hover for details)

3. **Progress Tracking:**
   - Upload progress (0-100%)
   - Extraction status (queued → processing → complete)
   - Estimated time remaining

### API Integration

```typescript
// POST /api/v1/clients/{client_id}/documents
interface DocumentUploadAPI {
  uploadDocument(
    clientId: string,
    file: File,
    documentType: "Form5500" | "SPD" | "PlanDoc"
  ): Promise<UploadResponse>;

  getExtractionStatus(extractionId: string): Promise<ExtractionStatus>;
}

interface ExtractionStatus {
  extraction_id: string;
  status: "queued" | "processing" | "complete" | "failed";
  progress_pct: number;
  fields_extracted: number;
  total_fields: number;
  estimated_completion_sec?: number;
}
```

### Error Handling

- File too large: "File exceeds 50MB limit. Please compress or split."
- Invalid format: "Only PDF and DOCX files are supported."
- Extraction failed: "Extraction failed. Queue for manual review?"

---

## Component 3: AI Insights Card

### Visual Design

```
┌────────────────────────────────┐
│  🤖 AI Insights                │
├────────────────────────────────┤
│  ✅ 12 plan features extracted │
│  ✅ Vesting schedule validated │
│  ⚠️  Review match formula      │
└────────────────────────────────┘
```

### Functionality

1. **Insight Types:**
   - ✅ Green checkmark: Successfully validated
   - ⚠️ Yellow warning: Needs review (low confidence)
   - ❌ Red X: Validation failed

2. **Click Behavior:**
   - Click on warning → jump to that row in Plan Design Matrix table
   - Highlight the row requiring attention

3. **Real-Time Updates:**
   - Updates as extraction completes
   - WebSocket connection for live status

---

## Component 4: Plan Design Matrix Table

### Visual Design

```
┌────────────────────────────────────────────────────────────────────┐
│  📊 Plan Design Matrix                            [⚙️ Configure]   │
├────────────┬───────────────┬──────────────┬────────────────────────┤
│ Feature    │ Value         │ Confidence   │ Status                 │
├────────────┼───────────────┼──────────────┼────────────────────────┤
│ Eligibility│ 21 years      │ ████████ 98% │ ✅ Verified           │
│ Age        │               │              │                        │
├────────────┼───────────────┼──────────────┼────────────────────────┤
│ Service    │ 1 year        │ ████████ 95% │ ✅ Verified           │
│ Requirement│ (1000 hrs)    │              │                        │
├────────────┼───────────────┼──────────────┼────────────────────────┤
│ Employer   │ 100% up to 3% │ ███████░ 78% │ ⚠️ Review             │
│ Match      │               │              │ [Review Button]        │
├────────────┼───────────────┼──────────────┼────────────────────────┤
│ Vesting    │ 3-year cliff  │ █████████ 92%│ ✅ Verified           │
│ Schedule   │               │              │                        │
├────────────┼───────────────┼──────────────┼────────────────────────┤
│ Auto-      │ Yes - 3%      │ █████████ 96%│ ✅ Verified           │
│ Enrollment │ default       │              │                        │
└────────────┴───────────────┴──────────────┴────────────────────────┘
│ ✅ 7 features validated    ⚠️ 1 requires review  [Export Data]     │
└────────────────────────────────────────────────────────────────────┘
```

### Functionality

1. **Table Features:**
   - Sortable columns
   - Filter by status (All/Verified/Review)
   - Collapsible sections (group by category)

2. **Confidence Visualization:**
   - Horizontal bar chart (0-100%)
   - Color coding:
     - Green: ≥92% (Tier-1) or ≥88% (Tier-2)
     - Yellow: 70-88%
     - Red: <70%

3. **Status Badges:**
   - **Verified:** Green pill badge
   - **Review:** Red pill badge with "Review" button
   - **Pending:** Gray pill badge

4. **Review Button:**
   - Clicking opens Review Modal (see Component 8)

5. **Configure Button:**
   - Admin feature to show/hide fields
   - Reorder columns
   - Set default filters

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/extractions
interface PlanDesignMatrixAPI {
  getExtractions(clientId: string): Promise<ExtractedField[]>;
  updateExtraction(extractionId: string, newValue: any): Promise<void>;
}

interface ExtractedField {
  field_name: string;
  field_category: string; // "eligibility", "contributions", etc.
  value: any;
  confidence_score: number; // 0-1
  status: "verified" | "review" | "pending";
  source_document: string;
  source_page: number;
  extraction_timestamp: Date;
}
```

---

## Component 5: Peer Benchmark Cards

### Visual Design

```
┌────────────────────────────────┐
│  📈 Peer Benchmark             │
├────────────────────────────────┤
│  Employer Match    vs Industry │
│                                │
│  ┌─────────────────────────┐  │
│  │                          │  │
│  │ You  Avg       Top       │  │
│  │ 3.0% ▪ Industry: 3.8%   │  │
│  │ ┣━━━━━╋━━━━━━━━━━━━┫   │  │
│  │ 0    3.0    3.8    6.0  │  │
│  └─────────────────────────┘  │
│                                │
│  Auto-Enrollment Rate ✅ Above │
│  Avg                           │
│     3%                         │
│  Industry: 2.5%                │
│  ████████████                  │
│                                │
│  Participation Rate ✅ Excellent│
│     84%                        │
│  Top quartile performance      │
│                                │
└────────────────────────────────┘
```

### Functionality

1. **Benchmark Types:**
   - **Bullet Chart:** Shows your value vs. peer median and top quartile
   - **Bar Chart:** Simple comparison with industry average
   - **Big Number:** Highlight key metrics with quartile label

2. **Comparison Metrics:**
   - Employer match rate
   - Auto-enrollment adoption & default rate
   - Participation rate
   - Average deferral rate
   - Vesting schedule (immediate/cliff/graded %)

3. **Visual Indicators:**
   - ✅ Green checkmark: Above average or top quartile
   - ⚠️ Yellow warning: Below average
   - 📉 Red arrow: Bottom quartile

4. **Interactive Behavior:**
   - Hover: Show exact peer statistics (n=287, median=3.8%, p25=3.0%, p75=5.0%)
   - Click: Expand to detailed peer comparison view

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/peers
interface PeerBenchmarkAPI {
  getPeerComparison(clientId: string, filters?: CohortFilters): Promise<PeerComparison>;
}

interface PeerComparison {
  cohort_id: string;
  cohort_size: number;
  features: FeatureComparison[];
}

interface FeatureComparison {
  feature_name: string;
  your_value: number;
  peer_median: number;
  peer_p25: number;
  peer_p75: number;
  your_percentile: number; // 0-100
  quartile_label: "Bottom Quartile" | "Below Average" | "Above Average" | "Top Quartile";
  statistical_significance: number; // p-value
}
```

---

## Component 6: Recommendations Cards

### Visual Design

```
┌────────────────────────────────┐
│  🎯 Recommendations            │
├────────────────────────────────┤
│  ┌────────────────────────┐   │
│  │ Consider increasing    │   │
│  │ match                  │   │
│  │                        │   │
│  │ 50% of peers offer     │   │
│  │ 4%+ match              │   │
│  └────────────────────────┘   │
│                                │
│  ┌────────────────────────┐   │
│  │ Strong vesting policy  │   │
│  │                        │   │
│  │ Aligned with best      │   │
│  │ practices              │   │
│  └────────────────────────┘   │
│                                │
│  [View All Recommendations →]  │
└────────────────────────────────┘
```

### Functionality

1. **Recommendation Types:**
   - **Gaps:** Red/yellow cards for areas below peers
   - **Strengths:** Green cards for areas above peers
   - **Opportunities:** Blue cards for new features to consider

2. **Card Content:**
   - Title: Short recommendation (e.g., "Consider increasing match")
   - Supporting data: Peer statistic (e.g., "50% of peers offer 4%+")
   - Priority indicator: High/Medium/Low

3. **Interaction:**
   - Click card → Navigate to detailed recommendation view with full impact analysis
   - "View All Recommendations" → Full recommendation list page

### API Integration

```typescript
// GET /api/v1/clients/{client_id}/recommendations
interface RecommendationsAPI {
  getTopRecommendations(clientId: string, limit: number): Promise<Recommendation[]>;
}

interface Recommendation {
  recommendation_id: string;
  title: string;
  summary: string;
  priority: "High" | "Medium" | "Low";
  category: "gap" | "strength" | "opportunity";
  impact_summary: string; // e.g., "+20-25 ppt participation"
}
```

---

## Component 7: Header Actions

### Visual Design

```
┌────────────────────────────────────────────────┐
│  [⚙️ Settings]  [📊 Generate Report]          │
└────────────────────────────────────────────────┘
```

### Functionality

1. **Settings Button:**
   - Opens settings modal
   - User preferences (default filters, notification settings)
   - Admin: System configuration

2. **Generate Report Button:**
   - Primary action button (prominent, dark background)
   - Opens report generation modal:
     - Select template (Executive Summary, Full Report, 1-Pager, etc.)
     - Choose sections to include
     - Export format (PowerPoint, PDF)
   - Shows generation progress
   - Downloads file when complete

### API Integration

```typescript
// POST /api/v1/exports
interface ExportAPI {
  generateReport(request: ExportRequest): Promise<ExportJob>;
  getExportStatus(jobId: string): Promise<ExportStatus>;
}

interface ExportRequest {
  client_id: string;
  template_id: string;
  sections: string[]; // ["overview", "peers", "recommendations"]
  format: "pptx" | "pdf";
}
```

---

## Component 8: Review Modal (Annotation Interface)

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│  Review Extraction: Employer Match                    [✕ Close]  │
├─────────────────────────────────┬────────────────────────────────┤
│                                 │                                │
│  📄 Source Document             │  ✏️ Extracted Value           │
│                                 │                                │
│  [PDF Viewer showing page 12    │  Field: Employer Match        │
│   with highlighted text:        │  Category: Contributions      │
│                                 │                                │
│   "The Company will match       │  Extracted Value:             │
│    100% of employee deferrals   │  ┌─────────────────────────┐ │
│    up to 3% of compensation"]   │  │ 100% up to 3%           │ │
│                                 │  └─────────────────────────┘ │
│                                 │                                │
│   Confidence: 78%               │  Confidence: 78% (Low)        │
│                                 │                                │
│                                 │  Reason for Review:           │
│                                 │  ⚠️ Below Tier-1 threshold    │
│                                 │                                │
│                                 │  Actions:                     │
│                                 │  [✅ Accept]                  │
│                                 │  [✏️ Edit Value]              │
│                                 │  [❌ Reject]                  │
│                                 │  [🚩 Flag for Expert]         │
│                                 │                                │
│                                 │  Comments:                    │
│                                 │  ┌─────────────────────────┐ │
│                                 │  │                         │ │
│                                 │  └─────────────────────────┘ │
└─────────────────────────────────┴────────────────────────────────┘
```

### Functionality

1. **Left Panel: Source Evidence**
   - Embedded PDF viewer
   - Auto-scrolls to extraction location
   - Highlights extracted text in yellow
   - Shows confidence score

2. **Right Panel: Review Actions**
   - Display extracted value (editable)
   - Confidence score with threshold indicator
   - Action buttons:
     - **Accept:** Mark as verified, close modal
     - **Edit:** Modify value, show reason code dropdown
     - **Reject:** Mark as "cannot determine", add comment
     - **Flag:** Escalate to subject matter expert

3. **Audit Trail:**
   - All actions logged with user, timestamp, reason
   - Immutable audit log for compliance

---

## Technical Implementation

### Frontend Stack

```typescript
// Build Tool: Vite (fast HMR, modern bundling, optimized for React)
// Framework: React 18+ with TypeScript
// State Management: Zustand (lightweight, no boilerplate)
// UI Components: shadcn/ui + Tailwind CSS (copy-paste components, not npm dependency)
// Data Fetching: TanStack Query (React Query) with automatic caching
// Forms: React Hook Form + Zod validation
// Charts: Recharts (React-native charting library)
// Virtual Lists: @tanstack/react-virtual (handle 850+ clients efficiently)
// Routing: React Router v6

// Key libraries:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual'; // For large lists
import { create } from 'zustand'; // State management
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce'; // Search debouncing

// Performance features:
// - Code splitting with React.lazy() for heavy components
// - TanStack Query cache for 5-minute stale time
// - Virtualized lists prevent DOM overload with 850+ clients
// - Debounced search (300ms) for smooth UX
```

### Project Setup & Build Configuration

```bash
# Initial project setup
npm create vite@latest planwise-ui -- --template react-ts
cd planwise-ui

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-virtual zustand
npm install react-router-dom recharts
npm install react-hook-form @hookform/resolvers zod
npm install axios # API client

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui (CLI for copying components)
npm install -D @types/node
npx shadcn-ui@latest init

# Add shadcn/ui components as needed (copies to src/components/ui/)
npx shadcn-ui@latest add button table badge progress command popover
npx shadcn-ui@latest add dialog dropdown-menu input label select
npx shadcn-ui@latest add card tabs toast

# Development dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-plugin-prettier
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// vite.config.ts - Optimized for performance
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'charts': ['recharts'],
        },
      },
    },
    // Performance optimization
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production for smaller bundle
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to FastAPI backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

```json
// tsconfig.json - Strict TypeScript configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Key React Components

```
src/
├── components/
│   ├── dashboard/
│   │   ├── ClientSelector.tsx          # Searchable dropdown
│   │   ├── DocumentUploadPanel.tsx     # File upload + progress
│   │   ├── AIInsightsCard.tsx          # Extraction status
│   │   ├── PlanDesignMatrix.tsx        # Main data table
│   │   ├── PeerBenchmarkCard.tsx       # Peer comparison charts
│   │   ├── RecommendationsCard.tsx     # Top recommendations
│   │   ├── ReviewModal.tsx             # Annotation interface
│   │   └── ExportReportModal.tsx       # Report generation
│   ├── ui/                              # shadcn/ui primitives
│   └── charts/                          # Recharts wrappers
├── hooks/
│   ├── usePlanData.ts                   # Plan query hook
│   ├── usePeerComparison.ts             # Peer benchmark hook
│   ├── useDocumentUpload.ts             # Upload mutation
│   └── useExtractionStatus.ts           # WebSocket subscription
├── lib/
│   ├── api.ts                           # API client
│   └── types.ts                         # TypeScript interfaces
└── pages/
    └── PlanAnalysisDashboard.tsx        # Main page component
```

### API Endpoints Required

```
GET    /api/v1/clients                          # List all clients
GET    /api/v1/clients/{client_id}              # Get client details
GET    /api/v1/clients/{client_id}/extractions  # Get extracted fields
GET    /api/v1/clients/{client_id}/peers        # Get peer comparison
GET    /api/v1/clients/{client_id}/recommendations # Get recommendations
POST   /api/v1/clients/{client_id}/documents    # Upload document
GET    /api/v1/extractions/{id}/status          # Extraction status
PATCH  /api/v1/extractions/{id}                 # Update extraction
POST   /api/v1/exports                           # Generate report
GET    /api/v1/exports/{id}/status              # Export status
```

### State Management

```typescript
// Zustand store for dashboard state
interface DashboardStore {
  selectedClientId: string | null;
  setSelectedClient: (clientId: string) => void;

  recentClients: ClientSummary[];
  addRecentClient: (client: ClientSummary) => void;

  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
}

// React Query for server state
const { data: clientData, isLoading } = useQuery({
  queryKey: ['client', clientId],
  queryFn: () => api.getClient(clientId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### WebSocket for Real-Time Updates

```typescript
// Extraction status updates via WebSocket
const ws = new WebSocket(`wss://api.planwise.com/ws/extractions/${extractionId}`);

ws.onmessage = (event) => {
  const status: ExtractionStatus = JSON.parse(event.data);
  // Update UI with new progress
  setExtractionProgress(status.progress_pct);
};
```

---

## User Stories & Acceptance Criteria

### Story 1: View Plan Analysis Dashboard

**As an** Account Executive
**I want to** select any client and view their plan design with peer comparisons
**So that** I can quickly prepare for client meetings

**Acceptance Criteria:**
- [ ] Client selector dropdown lists all 850 clients with search
- [ ] Selecting a client loads their plan data in <1.5s (p95)
- [ ] Plan Design Matrix table shows all extracted fields
- [ ] Peer Benchmark cards display comparison to similar plans
- [ ] Recommendations section shows top 2-3 opportunities

**Definition of Done:**
- All acceptance criteria met
- Unit tests written (80%+ coverage)
- E2E tests for critical paths
- Performance budget met (<1.5s load time)
- Accessibility audit passed (WCAG 2.1 AA)
- Code review approved
- Deployed to staging and validated

---

### Story 2: Upload Documents for Extraction

**As an** Account Executive
**I want to** upload Form 5500 and SPD documents
**So that** the system can automatically extract plan design features

**Acceptance Criteria:**
- [ ] Drag & drop file upload works (PDF, DOCX)
- [ ] Upload progress shows percentage complete
- [ ] Extraction status updates in real-time
- [ ] AI Insights card shows extraction results
- [ ] Low-confidence fields are flagged for review

---

### Story 3: Review Low-Confidence Extractions

**As a** Consultant
**I want to** review and correct low-confidence extractions
**So that** all data is accurate before generating client deliverables

**Acceptance Criteria:**
- [ ] "Review" button opens modal with source document
- [ ] PDF viewer highlights extracted text
- [ ] Can accept, edit, reject, or flag extractions
- [ ] All actions are logged in audit trail
- [ ] Reviewed fields update status to "Verified"

---

### Story 4: Compare Plan to Peers

**As an** Account Executive
**I want to** see how my client's plan compares to similar organizations
**So that** I can identify competitive gaps and strengths

**Acceptance Criteria:**
- [ ] Peer Benchmark cards show 3-5 key metrics
- [ ] Each metric includes your value, peer median, and quartile
- [ ] Visual indicators (color, icons) show above/below average
- [ ] Hover shows detailed peer statistics (n, p25, p75, p-value)
- [ ] Click expands to full peer comparison page

---

### Story 5: Generate Client Report

**As an** Account Executive
**I want to** generate a PowerPoint presentation with peer comparisons
**So that** I can share data-driven insights with clients

**Acceptance Criteria:**
- [ ] "Generate Report" button opens template selection modal
- [ ] Can choose from 5 pre-approved templates
- [ ] Report generation shows progress (estimated time)
- [ ] Download link provided when complete (signed URL)
- [ ] All exports logged in audit trail

---

## Design Assets

### Color Palette

```
Primary Blue:     #3B82F6
Success Green:    #10B981
Warning Yellow:   #F59E0B
Danger Red:       #EF4444
Gray Scale:       #F9FAFB → #111827

Confidence Score Colors:
High (≥92%):      #10B981 (green)
Medium (70-88%):  #F59E0B (yellow)
Low (<70%):       #EF4444 (red)
```

### Typography

```
Font Family:  Inter (sans-serif)
Headings:     600 weight, 1.5em line height
Body:         400 weight, 1.6em line height
Code/Data:    'Roboto Mono' (monospace)
```

### Spacing

```
Card Padding:     24px
Section Gap:      32px
Component Gap:    16px
Element Gap:      8px
```

---

## Performance Requirements

- **Initial Load:** p95 ≤ 1.5s; p99 ≤ 3.0s
- **Client Switch:** p95 ≤ 1.0s
- **Document Upload:** Support 50MB files with progress
- **Chart Rendering:** 60fps animations, no jank
- **Search Results:** <200ms latency

### Performance Budget

```
JavaScript Bundle:  ≤ 500 KB (gzipped)
CSS Bundle:         ≤ 100 KB (gzipped)
Images:             WebP format, lazy loaded
Fonts:              Subset to used glyphs
```

---

## Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactions
- Screen reader support (ARIA labels)
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- Skip navigation links

---

## Testing Strategy

### Unit Tests

```typescript
// ClientSelector.test.tsx
describe('ClientSelector', () => {
  it('renders with current client name', () => { });
  it('opens dropdown on click', () => { });
  it('filters clients on search input', () => { });
  it('selects client and updates URL', () => { });
});

// Target: 80%+ code coverage
```

### Integration Tests

```typescript
// PlanAnalysisDashboard.test.tsx
describe('Plan Analysis Dashboard', () => {
  it('loads plan data on mount', () => { });
  it('switches plans when selector changes', () => { });
  it('updates peer comparisons when plan changes', () => { });
});
```

### E2E Tests (Playwright)

```typescript
test('full workflow: select client → view data → generate report', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="client-selector"]');
  await page.fill('[placeholder="Search clients"]', 'ABC Manufacturing');
  await page.click('text=ABC Manufacturing');
  await expect(page.locator('h1')).toContainText('ABC Manufacturing');
  await page.click('text=Generate Report');
  await page.click('text=Executive Summary');
  await expect(page.locator('text=Generating...')).toBeVisible();
});
```

---

## Architecture Decision: Vite vs. Streamlit

### Current Streamlit Prototype
**Purpose:** Week 1 proof-of-concept and internal demo tool
**Status:** Successfully validated core functionality (peer benchmarking, PowerPoint generation)
**Strengths:**
- ✅ Rapid prototyping (built Week 1 dashboard in <1 day)
- ✅ Python-native (integrates directly with backend logic)
- ✅ Great for data science exploration and internal tools

**Limitations for Production:**
- ❌ Not suitable for 850+ user enterprise application
- ❌ Limited UI customization (can't match design spec exactly)
- ❌ Python-based rendering = slower than React
- ❌ No real-time WebSocket updates out-of-box
- ❌ Authentication/RBAC not enterprise-grade
- ❌ Can't build mobile app from Streamlit

### Production React + Vite Application
**Purpose:** Enterprise-grade dashboard for E02 epic requirements
**Timeline:** Phase 1 development (Month 1-2)

**Why Vite Specifically:**
1. **Instant HMR:** Changes reflect in <50ms vs. 2-3s with Webpack
2. **Modern Defaults:** ESM, optimized builds, no configuration needed
3. **Fast Builds:** 10-20x faster production builds than CRA
4. **Tree-Shaking:** Automatically removes unused code
5. **Dev Server Proxy:** Easy backend integration during development
6. **TypeScript Native:** First-class TS support without ejecting

**Migration Strategy:**
```
Week 1-2 (Current):
  Streamlit prototype validates core logic ✅
  PowerPoint generation working ✅
  Peer benchmarking proven ✅

Week 3-4 (Parallel Track):
  Initialize Vite React project
  Port backend API logic to FastAPI endpoints
  Build authentication layer

Week 5-6 (Production Build):
  Implement E02 dashboard components
  Integrate with FastAPI backend
  Deploy to staging

Week 7-8 (Transition):
  User acceptance testing
  Deploy to production
  Deprecate Streamlit for AE-facing features
  Keep Streamlit for internal data science work
```

**Long-Term Architecture:**
- **Production Dashboard:** React + Vite (user-facing, 850+ users)
- **Admin/Analytics Tools:** Streamlit (internal data science, ad-hoc analysis)
- **Backend:** FastAPI (shared by both frontends)
- **Database:** DuckDB (shared data layer)

---

## Release Plan

### Phase 1: MVP (Week 1-2) - Vite Project Setup
- ✅ Initialize Vite + React + TypeScript project
- ✅ Configure Tailwind CSS + shadcn/ui
- ✅ Set up TanStack Query for API integration
- ✅ Client selector with search (virtualized list)
- ✅ Plan Design Matrix table (connect to FastAPI)
- ✅ Basic peer benchmark cards
- ✅ Document upload UI (integrate with backend)

### Phase 2: Core Features (Week 3-4)
- ✅ Document extraction integration
- ✅ Real-time status updates (WebSocket)
- ✅ Review modal for low-confidence fields
- ✅ AI Insights card
- ✅ Authentication & authorization (OAuth 2.0)
- ✅ RBAC implementation (Viewer, Analyst, Consultant, Admin)

### Phase 3: Polish & Deploy (Week 5-6)
- ✅ Recommendations cards
- ✅ Report generation with template selection
- ✅ Performance optimization (lazy loading, code splitting)
- ✅ Accessibility audit (WCAG 2.1 AA)
- ✅ User testing and refinements
- ✅ Production deployment to AWS ECS

---

## Success Metrics

### Leading Indicators (Week 1-2)
- Dashboard loads successfully for 100% of users
- Average load time <1.5s
- 0 critical bugs reported

### Usage Metrics (Week 3-4)
- 50+ active users weekly
- 200+ client views per week
- 50+ document uploads per week

### Impact Metrics (Month 2-3)
- 60%+ of AEs using in client meetings
- Average session duration 8-12 minutes (indicates engagement)
- 20+ reports generated per week

---

## Dependencies & Risks

### Dependencies
- Backend API must be deployed first (extraction, peer comparison endpoints)
- Design system (shadcn/ui) components must be available
- Authentication/authorization system in place

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API performance <1.5s | High | Implement caching, materialized views, query optimization |
| PDF rendering in browser is slow | Medium | Use lightweight PDF.js, lazy load pages |
| 850-client dropdown lags | Medium | Virtualized list, search debouncing |
| Extraction accuracy below 92% | High | Human review workflow, confidence scoring |

---

## Open Questions

1. **Client Selector:** Should we show plan health scores in the dropdown for quick triage?
2. **Peer Comparison:** Default cohort filters (industry + size) or let users customize?
3. **Recommendations:** Auto-generate on plan load or require user to click "Generate Recommendations"?
4. **Export:** Should we email the report or only provide download link?
5. **Mobile:** Is mobile support required in Phase 1 or can we defer to Phase 2?

---

## Appendix: Wireframe Evolution

### Initial Concept (Pre-Client Selector)
- Missing prominent client selection
- Users had to navigate through multiple pages

### Current Design (With Client Selector)
- ✅ Client selector in header (always visible)
- ✅ Single-page dashboard with all key info
- ✅ Clear visual hierarchy (left→center→right)
- ✅ Action buttons prominent (Settings, Generate Report)

### Future Enhancements
- Client health score in selector
- Portfolio view (multiple clients at once)
- Mobile-optimized layout
- Keyboard shortcuts (J/K to navigate, / to search)