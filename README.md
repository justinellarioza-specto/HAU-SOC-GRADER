# HAU-SOC-GRADER

A grade and GWA calculator for Holy Angel University School of Computing students, BSIT Web Development track (2022 curriculum).

Open `index.html` in a browser. It runs entirely offline, and your entries are saved in your browser only.

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
