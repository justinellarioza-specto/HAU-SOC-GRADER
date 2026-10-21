# HAU-SOC-GRADER

Grade and GWA calculator for Holy Angel University School of Computing students (BSIT Web Development, 2022 curriculum).

## Stack
- `server.js`: Express + MongoDB (accounts with bcrypt, JWT cookie sessions, per-user data in the `users` collection).
- `public/index.html`: the whole front end (vanilla JS, no build step). Works offline from localStorage if the API is missing.
- `public/vendor/`: jsPDF + autotable (PDF reports) and tesseract.js + English data (screenshot OCR).
- Deployed on Render from `main` via `render.yaml`. Env vars: `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `NODE_ENV`.

## Run locally
1. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `JWT_SECRET`.
2. `npm install`
3. `npm run dev`, then open http://localhost:3000

## Grade computation (matches the HAU ERP)
- Class standing and major exam averages are pooled across periods: sum of scores ÷ sum of maximums, up to the current period.
- computed = CS% × CS weight + exam% × exam weight (weights come from the ERP class page, e.g. 65/35 or 70/30).
- transmuted = 75 + (computed − passing%) × 25 ÷ (100 − passing%), decimals dropped.
- Equivalents: 97+ 1.00, 94 1.25, 91 1.50, 88 1.75, 85 2.00, 82 2.25, 79 2.50, 76 2.75, 75 3.00, below 5.00.

## Work in progress (branch `import-scores-wip`)
- "Import scores" panel on the Grades page: paste Canvas text or upload screenshots (OCR), review in a preview table, then add. Not tested in a browser yet.
- Next planned: an ERP-style class record view for every subject (info table, raw score columns per period such as "Quiz – 60", CS/exam averages, computed, transmuted, current grade, summary of grades).

## Conventions
- Commits are authored by Justine Lee Larioza only. Do not add Claude or Anthropic as co-author.
- Do not commit anyone's personal grades or database credentials.
