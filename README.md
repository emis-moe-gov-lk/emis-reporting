# Ministry of Education — Reporting Module (Next.js frontend)

Next.js reporting frontend with a GraphQL Yoga / MySQL backend connection.
Report pages still read from `src/lib/mock/*` until their fields are mapped to
the existing database tables.

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

## MySQL and GraphQL setup

The backend uses `mysql2` directly (no Prisma). Local connection settings are
in the ignored `.env.local` file. On a fresh checkout, copy `.env.example` to
`.env.local`. Defaults are host `127.0.0.1`, port `3306`, database `nemis`, user
`root`, and an empty password. Change `MYSQL_USER` if your local account differs.
MySQL must be running; the phpMyAdmin HTTP URL is not the database host.

Start the app with `npm run dev`, then open
http://localhost:3000/api/graphql to use GraphiQL. Run:

```graphql
query CheckDatabase {
  databaseConnected
}
```

A successful connection returns `{"data":{"databaseConnected":true}}`.
A failed query returns a masked GraphQL error; check the server terminal for
the underlying connection error. Restart the dev server after changing settings.

Backend files:

- `src/server/db.ts`: lazy, shared MySQL connection pool.
- `src/server/services/database.service.ts`: read-only connection check.
- `src/server/graphql/schema.ts`: GraphQL types and resolvers.
- `src/app/api/graphql/route.ts`: Node.js endpoint, with GraphiQL in development.

No database tables are created or changed. Add report services using parameterized
SQL after mapping the existing schema. Add authentication and record access rules
before exposing report data. Use a dedicated database account with a password in
production. Keep credentials server-only and out of version control.

Integration references: [Yoga with Next.js](https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-nextjs)
and [mysql2](https://github.com/sidorares/node-mysql2).

## Connecting the report pages

This is a Next.js **full-stack** framework, so the backend slots into the
same project — no separate server needed:

1. Add report queries and resolvers to the GraphQL schema, backed by services
   under `src/server/services` that query the existing MySQL tables.
2. Replace imports from `src/lib/mock/*` with GraphQL POST requests to
   `/api/graphql`, including filters and pagination variables.
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
