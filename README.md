# HAU-SOC-GRADER

A grade and GWA calculator for Holy Angel University School of Computing students, BSIT Web Development track (2022 curriculum).

Students sign up with their name, student number and password. Their subjects and grades are saved to MongoDB, so they can log in from any device.

## Run it

You need Node.js 18 or newer and a MongoDB database (MongoDB Atlas free tier works).

1. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `JWT_SECRET` (any long random string).
2. `npm install`
3. `npm run dev`, then open http://localhost:3000

## Deploy on Render

1. In Render, choose **New → Blueprint** and pick this repo. `render.yaml` creates a Node web service.
2. When Render asks for `MONGODB_URI`, paste your MongoDB connection string. `JWT_SECRET` is generated for you.
3. In MongoDB Atlas, go to **Network Access** and allow `0.0.0.0/0`, since Render's free plan has no fixed IP.

## Accounts and data

- Passwords are hashed with bcrypt and never stored as plain text.
- Logins use an HTTP-only session cookie that lasts 30 days.
- Each account's data is stored in the `users` collection of the `hau_soc_grader` database.
- **Export backup / Import backup** on the Account page saves or loads all your data as a JSON file.
- **Download PDF** on the Grades and GWA pages creates a grade report (uses jsPDF, bundled in `public/vendor`).
- Opening `public/index.html` directly, without the server, still works in offline mode and saves to the browser only.

## Features

**Course grade**
- Enter scores per term (Prelim, Midterm, Finals), either as the ERP's class standing and major exam points, or as itemized quizzes, labs and activities.
- Choose how lecture and laboratory exams are merged: added raw scores, an average of the two percentages, or a custom lecture weight.
- Computes the term average, the cumulative average, the transmuted grade and the grade equivalent, the same way the HAU ERP does.
- Shows the Finals exam score you need to reach each grade from 1.00 to 3.00.
- Keeps several subjects and sends a final grade to the GWA tab.

**GWA**
- Lists every course in the BSIT Web Development 2022 curriculum by semester, with a choice of IT electives.
- Shows semestral and cumulative GWA, units earned out of 165, President's List and Dean's List standing, and Latin honors eligibility.

**Grading rules**
- The table of grade equivalents, honors requirements, and attendance and retention rules from the College Student Handbook 2025–2026.

## ERP class record

Every subject has an **ERP class record** view that mirrors the HAU ERP "View scores on all performance items" page: class info, raw score columns per period (for example Quiz – 60, Activity – 50), major exams, and a summary of grades. Columns can be renamed, added or removed with **Edit columns**, and the class standing / major exam shares can differ per subject (65/35, 70/30, and so on).

The ERP pools scores: class standing average = all class standing scores so far ÷ all their maximums, and the same for major exams. The calculator does the same.

## How grades are computed

```
term       = class standing points + major exam points
cumulative = average of the terms so far
transmuted = 75 + (cumulative − passing %) × 25 ÷ (100 − passing %)
grade      = equivalent of the transmuted value (decimals dropped, as in the ERP)
```

| Grade | Percentage |
|------|------------|
| 1.00 | 97 and above |
| 1.25 | 94–96 |
| 1.50 | 91–93 |
| 1.75 | 88–90 |
| 2.00 | 85–87 |
| 2.25 | 82–84 |
| 2.50 | 79–81 |
| 2.75 | 76–78 |
| 3.00 | 75 |
| 5.00 | below 75 |

## Assumptions

- CWTS (NSTP) is left out of the GWA by default. A toggle includes it.
- FA (6.0) and UW (8.0) count as 5.0 in the GWA. DRP (9.0), INC and ungraded courses are left out.
- How lecture and lab exams are combined varies by instructor, so check your syllabus.

These are estimates. Your official grades are the ones posted by the Registrar.
