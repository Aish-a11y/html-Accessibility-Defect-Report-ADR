# Accessibility Defect Report (ADR)

A browser-based tool for logging accessibility defects found during testing and exporting them as a
formatted Excel defect report. No build step, no server, no install — open `index.html` and start
logging. Everything runs client-side and issues persist in `localStorage`.

---

## The web tool

Open [`index.html`](index.html) in a browser.

### Log a single issue

Describe the bug in plain language, then use **Suggest WCAG SC, priority & fix**. A built-in rules
engine matches your wording against a keyword library and fills in the WCAG success criterion, user
impact, change type and a recommended fix. Everything stays editable — check the suggestion before
adding the issue.

There is also a contrast checker: enter a foreground and background hex value and the ratio is
calculated live (WCAG relative luminance), with the measured value folded into the recommendation.

### Bulk import from a spreadsheet

1. **Download template (.xlsx)** — a two-sheet workbook: `Instructions` and `Issues`.
2. Fill in one row per issue. Only **Page / Screen** and **Finding** are required; leave WCAG SC,
   Change Type, User Impact and Recommendation blank and the rules engine fills them in on import.
   Change Type, User Impact, Status and Business Sign-off have dropdowns.
3. **Upload filled template** — the issues are added to the log and a formatted Excel report
   downloads automatically.

### The report

Both the template and the exported report use the same 13 columns, with a navy header row, frozen
top row and autofilter:

| # | Column | # | Column |
|---|---|---|---|
| 1 | Sr. No. | 9 | Screenshot |
| 2 | Page / Screen | 10 | Recommendation |
| 3 | Steps to Reproduce | 11 | Change Type |
| 4 | Link and Tools Used | 12 | User Impact |
| 5 | WCAG SC | 13 | Status |
| 6 | Level | 14 | Test Comments |
| 7 | Occurrence | 15 | Business Sign-off |
| 8 | Finding | | |

**Level** and **Occurrence** fill themselves in: Level is derived from the chosen WCAG criterion
(A or AA) and Occurrence is always `Desktop - Chrome/Edge`, so both can be left blank in the
template.

**Screenshot** holds the real picture. An image attached through the form is embedded in the report
as an actual picture, scaled to fit and with the row grown to match; a row imported with a URL
instead keeps that URL as a clickable link.

The exported report opens with an **About** sheet carrying the generation date, the standard, totals
by user impact and status, and reference links. Every recognised **WCAG SC** cell is a live
hyperlink to the relevant W3C *Understanding* page.

---

## Rules engine

25 keyword rules map a plain-language finding to a WCAG 2.2 A/AA success criterion, a change type, a
user impact and a recommendation. Recommendations follow a fixed house style:

> Ensure that *&lt;desired end state&gt;* so that *&lt;affected AT user group&gt;* *&lt;specific benefit&gt;*.
> Make sure to *&lt;native / semantic HTML fix, naming exact tags&gt;* or Provide *&lt;ARIA fallback,
> naming exact roles and attributes&gt;*. Also ensure that *&lt;supporting requirement, with exact
> values&gt;*.

The native HTML solution always leads; the ARIA route is offered second. Where no ARIA equivalent
exists (colour, layout, timing, sizing) the recommendation says so rather than implying one. If a
finding is too vague to name a real fix, the tool asks for the missing detail — the DOM snippet, the
colour values, or what the screen reader announced — instead of emitting a generic recommendation.

---

## Accessibility of the tool itself

The tool is built to the standard it reports against: **WCAG 2.2, Level AA**.

- Zero axe-core violations across light and dark themes, the default, error and dialog states, and a
  320 px viewport.
- Full keyboard operation, verified end to end: every tab stop shows a focus indicator, the
  screenshot dialog traps focus and restores it on Esc, and the scrollable table is reachable.
- Colour tokens verified numerically — body text ≥ 4.5:1, control boundaries and focus rings ≥ 3:1,
  in both themes.
- Targets ≥ 24×24 CSS px, text scales with the browser font-size setting, and content reflows to
  320 px with no horizontal page scroll.
- Errors are identified in text with `aria-invalid`, a focusable error summary, and status messages
  announced through live regions.

---

## Analytics and privacy

The hosted page counts visits with Google Analytics 4. The Measurement ID sits in a single constant
at the top of [`index.html`](index.html); when it is unset, no analytics script loads and nothing is
sent. Visits over `file://` and from `localhost` are ignored.

**Defect data never leaves the browser.** Issues you log, uploaded spreadsheets and attached
screenshots are held in `localStorage` and processed client-side; nothing is uploaded to any server,
and analytics records page visits only — not the contents of your defect log.

Note that Google processes the visit data, and GA4 sets cookies, so a consent banner may be required
depending on where your visitors are located.

---

## Markdown ADR workflow

The repository also holds a lightweight written-report workflow for cases where a narrative ADR is
more useful than a spreadsheet row:

- [`ADR-Template.md`](ADR-Template.md) — the report template.
- [`Severity-Rubric.md`](Severity-Rubric.md) — how severity is assigned.

Describe an issue (component, page, behaviour, or a code snippet) and how you found it — manual
keyboard or screen reader test, automated scan, or code review. Reports are numbered sequentially as
`ADR-0001-short-title.md`.

**Standard:** WCAG 2.2, Level AA, unless stated otherwise for a specific report.

---

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Page structure and form markup |
| `app.js` | Rules engine, contrast maths, state, Excel import/export |
| `styles.css` | Design tokens and layout, light and dark themes |
| `ADR-Template.md` | Markdown ADR report template |
| `Severity-Rubric.md` | Severity definitions |

Two libraries load from a CDN: **SheetJS** reads uploaded `.xlsx` / `.xls` files, and **ExcelJS**
writes the styled output (the SheetJS community build cannot write cell fills, fonts or data
validation).
