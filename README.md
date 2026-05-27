# BGI Skills-First Profile Review

Interactive meeting tool for reviewing the 10 new occupation skill profiles and the curation changelog from the BGI Skills-First Workforce Initiative.

Built to support a stakeholder review meeting on the 2026.05.21 version of the Skills-First Skills Profiles dataset.

## What it does

Two tabs:

1. **New occupation profiles** — drop-down through the 10 new occupations in the dataset. Each profile shows:
   - Total skill count and breakdown by the four BGI taxonomy categories
   - Per-category and per-label skill distribution charts
   - All skills grouped by category, with sortable metrics: Frequency in Role, Specificity, 5-Year Demand Growth, Wage Premium, and the skill Label (Durable / High Value / High Growth / Declining)
   - Click any skill to expand: full definition, how it's used in this role, and Level 1/2/3 proficiency examples
   - Filters by category and label, plus expand-all/collapse-all bulk controls
   - Hover tooltips on every metric label

2. **Curation changelog** — every decision applied to the source file between the 2026.05.06 base vintage and the current review version. Organized into six categories: Stockers refinement, source-file additions, taxonomy & ontology fixes, skill consolidation, per-occupation curation, and outlier handling. Plus a per-occupation final-counts table for all 40 occupations.

## Data source

`src/data/data.json` — extracted from `2026.05.13 Skills-First Skills Profiles v2.xlsx` after the 2026.05.21 Stockers fix (Freight Handling, Order Fulfillment, Cycle Counting, Order Picking restored from `dropped` to `overlap`).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (typically `http://localhost:5179`).

## Build for production

```bash
npm run build
npm run preview
```

## Deploy

Push to GitHub, then on [vercel.com/new](https://vercel.com/new) import the repo and click Deploy. Vercel auto-detects Vite — no configuration needed. Every future `git push` triggers a redeploy.

## Tech

- React 19 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Recharts for charts
- lucide-react for icons

---

© Burning Glass Institute · [burningglassinstitute.org](https://burningglassinstitute.org)
