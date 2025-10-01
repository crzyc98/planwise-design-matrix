# Frontend Stack Decision - Updated

**Date:** September 30, 2025
**Decision:** React + TypeScript + Vite
**Status:** ✅ Documented in PRD v1.0 and E02 Epic

---

## Executive Summary

The PlanWise Design Matrix will use **React 18+ with TypeScript and Vite** as the production frontend stack. The current Streamlit prototype successfully validated Week 1 functionality and will remain for internal data science tools, while the React application will serve as the enterprise-grade dashboard for 850+ users.

---

## Stack Components

### Core Framework
- **Build Tool:** Vite (modern, fast HMR, optimized bundling)
- **Framework:** React 18+ with TypeScript
- **Package Manager:** npm

### State Management
- **Client State:** Zustand (lightweight, minimal boilerplate)
- **Server State:** TanStack Query (React Query) with automatic caching
- **Routing:** React Router v6

### UI & Styling
- **Component Library:** shadcn/ui (copy-paste, not npm dependency)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React or Heroicons
- **Charts:** Recharts

### Forms & Validation
- **Forms:** React Hook Form
- **Validation:** Zod schemas
- **Type Safety:** Full TypeScript integration

### Performance
- **Virtualization:** @tanstack/react-virtual (for 850+ client lists)
- **Code Splitting:** React.lazy() and dynamic imports
- **Debouncing:** Custom hooks for search inputs

---

## Why This Stack?

### ✅ Meets All Requirements

**Performance Requirements:**
- ✅ p95 load time ≤ 1.5s (Vite optimizations + TanStack Query caching)
- ✅ Handle 850+ clients (virtualized lists prevent DOM overload)
- ✅ Real-time updates (WebSocket support built-in)
- ✅ Bundle size <500KB gzipped (tree-shaking + code splitting)

**Development Requirements:**
- ✅ TypeScript for type safety (enterprise code quality)
- ✅ Fast HMR <50ms (Vite instant feedback loop)
- ✅ Corporate-friendly (standard npm packages, no exotic dependencies)
- ✅ Maintainable (well-documented ecosystem, large talent pool)

**User Requirements:**
- ✅ Complex data tables with sorting/filtering
- ✅ Interactive charts (Recharts is React-native)
- ✅ Rich UI components (shadcn/ui provides 50+ components)
- ✅ Mobile-responsive (Tailwind CSS utilities)

### ✅ Enterprise-Grade

**Security:**
- OAuth 2.0 + JWT authentication
- RBAC with Casbin policy engine
- CORS configuration for API access
- XSS protection via React's built-in escaping

**Scalability:**
- Component-based architecture (easy to add features)
- Code splitting by route (lazy load heavy pages)
- Caching strategy with TanStack Query
- WebSocket reconnection handling

**Maintainability:**
- TypeScript prevents runtime errors
- Zod schemas ensure data validation
- Jest + Testing Library for unit tests
- Playwright for E2E tests

---

## Comparison: Vite vs. Alternatives

| Feature | Vite | Create React App | Next.js | Streamlit |
|---------|------|-----------------|---------|-----------|
| **HMR Speed** | <50ms | 2-3s | 1-2s | N/A |
| **Build Speed** | ⚡ Fast | Slow | Medium | N/A |
| **Bundle Size** | Small | Large | Medium | N/A |
| **Configuration** | Minimal | None (ejected) | Opinionated | N/A |
| **SSR Support** | Optional | No | Yes (overkill) | No |
| **TypeScript** | Native | Plugin | Native | No |
| **Dev Proxy** | Built-in | Manual | Built-in | N/A |
| **Production Ready** | ✅ Yes | ⚠️ Deprecated | ✅ Yes | ❌ No |
| **Enterprise Scale** | ✅ Yes | ⚠️ Limited | ✅ Yes | ❌ No |

**Verdict:** Vite wins on speed, simplicity, and modern defaults. Next.js is overkill (SSR not needed for internal tool). CRA is deprecated by React team.

---

## Streamlit vs. React: Use Cases

### Streamlit Prototype (Week 1) ✅
**Purpose:** Rapid prototyping and validation
**Achievements:**
- ✅ Built peer benchmarking dashboard in <1 day
- ✅ Validated PowerPoint generation workflow
- ✅ Proved DuckDB performance
- ✅ Demonstrated core value proposition

**Continue Using For:**
- Internal data science exploration
- Ad-hoc analysis tools
- Admin utilities (pattern library management)
- Proof-of-concept features before production build

**Limitations for Production:**
- ❌ Not designed for 850+ concurrent users
- ❌ Limited UI customization (can't match design spec)
- ❌ No enterprise authentication/RBAC
- ❌ Slower than React (Python rendering)
- ❌ Can't build mobile app

### React + Vite (Production) 🚀
**Purpose:** Enterprise dashboard for E02 epic
**Timeline:** Month 1-2 development

**User-Facing Features:**
- Client selector with 850+ plans
- Plan design matrix table
- Peer benchmarking visualizations
- Recommendation engine
- PowerPoint export
- Real-time extraction status

**Enterprise Features:**
- OAuth 2.0 authentication
- RBAC (Viewer, Analyst, Consultant, Admin)
- Audit logging
- Compliance controls
- Mobile-responsive design
- Accessibility (WCAG 2.1 AA)

---

## Project Setup

```bash
# Initialize Vite project with React + TypeScript
npm create vite@latest planwise-ui -- --template react-ts
cd planwise-ui

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-virtual zustand
npm install react-router-dom recharts axios
npm install react-hook-form @hookform/resolvers zod

# Install Tailwind CSS + shadcn/ui
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
npx shadcn-ui@latest init

# Add UI components (copied to src/components/ui/)
npx shadcn-ui@latest add button table badge progress command
npx shadcn-ui@latest add dialog dropdown-menu input label select
npx shadcn-ui@latest add card tabs toast popover

# Development & testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint prettier
npm install -D @playwright/test # E2E tests
```

---

## Vite Configuration

```typescript
// vite.config.ts
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
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI backend
        changeOrigin: true,
      },
    },
  },
})
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     PRODUCTION                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │   React + Vite Dashboard (Port 3000)             │  │
│  │   - Client selector (850+ plans)                 │  │
│  │   - Plan analysis views                          │  │
│  │   - Peer benchmarking charts                     │  │
│  │   - PowerPoint export                            │  │
│  │   - User: Account Executives, Consultants       │  │
│  └──────────┬───────────────────────────────────────┘  │
└─────────────┼───────────────────────────────────────────┘
              │
              │ HTTP/WebSocket
              ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                 │
│  - Authentication (OAuth 2.0 + JWT)                     │
│  - RBAC (Casbin policy engine)                          │
│  - Peer benchmarking engine                             │
│  - PowerPoint generation                                │
│  - Extraction pipeline (Celery tasks)                   │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              DuckDB + S3 Storage                         │
│  - 850+ plan designs                                    │
│  - Extraction audit trail                               │
│  - Generated exports                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  INTERNAL TOOLS                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Streamlit Apps (Port 8501)                     │  │
│  │   - Pattern library management                   │  │
│  │   - Data quality dashboard                       │  │
│  │   - Ad-hoc analysis tools                        │  │
│  │   - User: Data scientists, Admins               │  │
│  └──────────┬───────────────────────────────────────┘  │
└─────────────┼───────────────────────────────────────────┘
              │
              └──► Same FastAPI backend & database
```

---

## Migration Plan

### Phase 0: Week 1-2 (COMPLETE) ✅
- ✅ Streamlit prototype validates core functionality
- ✅ PowerPoint generation working
- ✅ Peer benchmarking proven
- ✅ Week 1 success metrics met

### Phase 1: Week 3-4 (Parallel Development)
- Initialize Vite + React project
- Port backend logic to FastAPI REST endpoints
- Build authentication layer (OAuth 2.0 + JWT)
- Implement RBAC policies (Casbin)
- Set up CI/CD pipeline (GitHub Actions)

### Phase 2: Week 5-6 (Core Features)
- Build E02 dashboard components
- Client selector with virtualized list
- Plan design matrix table
- Peer benchmark charts
- Document upload + real-time status
- Review modal for low-confidence extractions

### Phase 3: Week 7-8 (Polish & Deploy)
- Recommendations engine integration
- PowerPoint export with template selection
- Performance optimization (code splitting, lazy loading)
- Accessibility audit (WCAG 2.1 AA)
- User acceptance testing
- Production deployment to AWS ECS

### Phase 4: Week 9+ (Transition)
- AEs transition from Streamlit to React dashboard
- Monitor usage analytics and performance
- Deprecate Streamlit for AE-facing features
- Keep Streamlit for admin/data science use cases

---

## Performance Targets

### Load Times
- **Initial load (cold cache):** p95 ≤ 1.5s
- **Client switch:** p95 ≤ 1.0s
- **Search results:** <200ms latency
- **Chart rendering:** 60fps, no jank

### Bundle Sizes
- **JavaScript (gzipped):** ≤ 500 KB
- **CSS (gzipped):** ≤ 100 KB
- **Total initial payload:** ≤ 600 KB

### Optimizations
- Code splitting by route (lazy load heavy pages)
- TanStack Query caching (5-minute stale time)
- Virtualized lists (@tanstack/react-virtual)
- Debounced search (300ms delay)
- WebP images with lazy loading

---

## Success Metrics

### Week 1-2 (Streamlit Prototype) ✅
- ✅ 5 demo PowerPoint decks generated
- ✅ Peer benchmarking functional
- ✅ Stakeholder demos scheduled

### Week 3-4 (Vite Project Setup)
- Project initialized with all dependencies
- CI/CD pipeline operational
- First component built (Client Selector)
- FastAPI endpoints deployed to staging

### Week 5-6 (Alpha Release)
- E02 dashboard MVP complete
- 10 beta users testing
- Performance targets met
- 0 critical bugs

### Week 7-8 (Production Launch)
- 50+ active users weekly
- 60%+ of AEs using in client meetings
- p95 load time <1.5s maintained
- User satisfaction score ≥8/10

---

## Decision Rationale

### Why Not Alternatives?

**Next.js:** Overkill for internal tool
- SSR not needed (authenticated users only)
- More complexity than required
- Backend is FastAPI, not Node.js
- Adds unnecessary learning curve

**Angular:** Too heavy
- Slower development velocity than React
- Larger bundle size
- Overkill dependency injection for dashboard
- Smaller talent pool than React

**Vue/Svelte:** Ecosystem concerns
- Team likely more familiar with React
- Smaller enterprise component library ecosystem
- PRD already specifies React
- Migration path less clear

**Plain JavaScript (no TypeScript):** Risk
- No type safety = more runtime bugs
- Harder to refactor at scale
- Not suitable for enterprise codebase
- TypeScript is industry standard for React

**Streamlit Production:** Not suitable
- Not designed for 850+ concurrent users
- Limited UI customization
- No real-time features (WebSocket)
- Can't build mobile app
- Authentication limited

---

## Updated Documentation

The following files have been updated to reflect this decision:

1. **docs/PRD v1.0.md**
   - Section: "Web Application (React + TypeScript + Vite)"
   - Added Vite build tool specification
   - Added performance optimization notes
   - Added virtualization library

2. **docs/epics/E02-plan-analysis-dashboard.md**
   - Section: "Frontend Stack"
   - Added project setup commands
   - Added Vite configuration
   - Added "Architecture Decision: Vite vs. Streamlit" section
   - Updated release plan with Vite-specific milestones

3. **docs/FRONTEND_STACK_DECISION.md** (this file)
   - Comprehensive rationale documentation
   - Migration plan
   - Performance targets
   - Success metrics

---

**Approved By:** Product Management, Engineering Lead
**Implementation Start:** Week 3 (following Week 1-2 demos)
**Status:** ✅ Documented and Ready for Development