# Ministry of Education — Reporting Module (Next.js frontend)

Frontend-only build, no backend yet. Every page reads from mock data in
`src/lib/mock/*` so it runs standalone.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Folder structure

```
src/
  app/                     Routes (App Router) — one folder per page
    layout.tsx             Root layout: fonts + ThemeProvider
    page.tsx                → Ministry Overview  ("/")
    analytics/page.tsx      → Teacher Analytics
    cadre/page.tsx           → Cadre (tabbed reports)
    retirement/page.tsx     → Retirement
    transfers/page.tsx      → Transfer Applications (tabbed)
  components/
    layout/                Sidebar, Topbar, UserChip, AppShell
    theme/                 ThemeProvider + ThemeToggle (light/dark)
    ui/                    Reusable primitives: Button, Panel, FilterBar,
                            Select, StatusPill, KpiCard, Tabs, DataTable
    features/               One folder per page's page-specific logic
      analytics/             TeacherAnalytics.tsx + useCascadingGeo.ts
      transfers/              TransferApplications.tsx + TransferDrawer.tsx
      cadre/                  CadreTabs.tsx
      retirement/             RetirementReport.tsx
  lib/
    mock/                   Placeholder data — swap for API calls later
    exportHelpers.ts        Client-side Excel (SheetJS) + print-to-PDF
  types/index.ts            Shared TypeScript interfaces
```

## Adding the backend later

This is a Next.js **full-stack** framework, so the backend slots into the
same project — no separate server needed:

1. Add Route Handlers under `src/app/api/**/route.ts` (e.g.
   `src/app/api/teachers/route.ts`) for each resource.
2. Replace the imports from `src/lib/mock/*` with `fetch("/api/...")` calls
   (or React Server Components that query a database directly).
3. Keep the `types/index.ts` interfaces — they already describe the shape
   your API should return, so the UI won't need to change.
4. For auth, `src/components/layout/UserChip.tsx` is currently hardcoded —
   wire it to your session/auth provider (NextAuth, Lucia, etc.) when ready.

## Known issue to address before production

`xlsx` (SheetJS) has open advisories with no upstream npm fix (prototype
pollution / ReDoS). It's fine for this prototype's static exports, but
before going live either pull the patched build from SheetJS's own CDN
(`cdn.sheetjs.com`) per their docs, or move Excel generation server-side
once the backend exists.
