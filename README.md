# Ministry of Education — Reporting Module

Frontend-only reporting application built with Next.js. Report screens use local
sample data from `src/lib/mock/`; no API or database service is included.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Folder structure

```
src/
  app/                     Frontend routes and shared styles
  components/
    features/               Report-specific UI and behavior
    layout/                 Navigation and application shell
    theme/                  Theme provider and toggle
    ui/                     Reusable UI components
  lib/
    mock/                   Local sample report data
    exportHelpers.ts        Client-side Excel and print exports
    utils.ts                Shared frontend utilities
  types/index.ts            Shared TypeScript interfaces
```

The teacher analytics, cadre, retirement, and transfer reports are intended to
run against local sample data. Replace the fixtures with a separately hosted API
if live data is needed later.
