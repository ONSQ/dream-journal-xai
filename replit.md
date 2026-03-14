# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── vigilant-spirit/    # Vigilant Spirit Dream Journal (React + Vite)
│   └── xai-explorer/       # XAI Explorer (React + Vite, served at /xai-explorer/)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Vigilant Spirit Dream Journal

**App:** `artifacts/vigilant-spirit` (React + Vite, served at `/`)

**Description:** A spiritual dream journaling app based on *The Vigilant Spirit Dream Journal* and *The Restored Night Workbook* by Owen Eskew (ONSQ Press).

**Two Modes:**
1. **Dream Mode (Vigilant Spirit):** 4-phase journal flow (Pre-Sleep → Capture → Response → Analysis)
2. **Healing Mode (Restored Night):** 5-phase nightmare healing flow (Evening → Witness → Restoration → Release → Analysis)

**Features:**
- Dream narrative capture with multi-field journaling
- T-TAQ analysis (Theme, Affect, Question)
- Source discernment test (Biological / Psychological / Spiritual)
- 4-4-6 breathing exercise with animated circle
- Image Rehearsal Therapy (IRT) for nightmare healing
- Scripture integration with daily rotation (getDailyScripture)
- XAI classification (Spiritual / Trauma / Maintenance dimensions)
- SHAP + LIME explainability per dimension with "Re-analyze" reclassify button
- API status bar showing model health
- 3 AM Protocol emergency grounding modal (5-4-3-2-1 grounding + breathing + prayer)
- Word count hints on narrative fields (target: 30 words)
- Trends page (TrendsView) with weekly bar chart + XAI dimension averages
- Entry export (clipboard copy) on each entry card and during journaling
- Database persistence via PostgreSQL (useListEntries / useUpsertEntry / useDeleteEntry)
- Polished empty state with mode-specific messaging and CTA
- Mobile-optimized layout (min-h-[44/52/56px] touch targets, responsive header)

**Backend:** `artifacts/api-server` provides:
- `POST /api/classify` — keyword-based XAI classifier
- `GET /api/health` — model health/status endpoint
- `GET /api/healthz` — server health check
- `GET /api/entries` — list all journal entries
- `POST /api/entries` — upsert entry by clientId
- `DELETE /api/entries/:clientId` — delete an entry

**Data storage:** PostgreSQL via `journal_entries` table (Drizzle ORM). Falls back to localStorage while API is loading. localStorage also acts as a local cache for offline resilience.

## XAI Explorer

**App:** `artifacts/xai-explorer` (React + Vite, served at `/xai-explorer/`)

**Description:** A standalone XAI model inspection tool for deep-diving into dream classification outputs. Complements the main Vigilant Spirit Dream Journal.

**Three Tabs:**
1. **Entries** — Browse all journal entries from the database in a sidebar. Click to see full XAI breakdown (probability bars with 95% CI overlays, SHAP feature attribution tables, LIME local explanations, counterfactual "what if" cards, metadata panel with source type, guidance, and full interpretation).
2. **Classify** — Single-text live classifier. Paste any dream narrative, get instant XAI output with all 10 explainability features.
3. **Bulk** — Paste multiple texts separated by `---` (or CSV rows). Concurrent classification (3 parallel requests), progress counter, card grid of results with expandable detail.

**Report Export:** CSV, JSON, or PDF (via html2canvas + jsPDF). Export classified entries or single results.

**Dependencies:** recharts, html2canvas, jspdf (no api-client-react — uses direct fetch to `/api` via Vite proxy)

**API Proxy:** Vite dev server proxies `/api` → `http://localhost:8080` (the shared api-server).

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/vigilant-spirit` (`@workspace/vigilant-spirit`)

React + Vite frontend for the Vigilant Spirit Dream Journal.

- Entry: `src/main.tsx`
- App: `src/App.tsx` — QueryClient, Wouter router
- Pages: `src/pages/Home.tsx` — All UI components (HomeView, VigilantEntry, RestoredEntry, ClearboxAnalysis)
- Hooks: `src/hooks/use-journal.ts` — journal management with API persistence + localStorage fallback
- Depends on: `@workspace/api-client-react`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/classify.ts` — `POST /api/classify`, `GET /api/health`
  - `src/routes/entries.ts` — `GET/POST /api/entries`, `DELETE /api/entries/:clientId`
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Tables:
- `journal_entries` — clientId (unique), mode, phase, entryDate, data (jsonb), createdAt, updatedAt

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec with: healthz, model health, and dream classification endpoints.
Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas: `HealthCheckResponse`, `ModelHealthResponse`, `ClassifyDreamBody`, `ClassifyDreamResponse`.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks: `useHealthCheck`, `useModelHealth`, `useClassifyDream`, `useListEntries`, `useUpsertEntry`, `useDeleteEntry`.
Note: `@tanstack/react-query` is a peerDependency (not dependency) to prevent duplicate instances.
