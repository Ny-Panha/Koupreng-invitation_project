# Chapter 02 — Gemini Claims, Test Counts & Acceptance Discrepancies

## 1. Upstream Claims vs Independent Verification

| Upstream Claim | Reported Value | Verified Value | Codex Verdict |
|---|---|---|---|
| Phase 09 Playwright Cases | 42 cases | 42 passed (6 projects) | VERIFIED |
| Phase 09 Template Tests | 10 unit tests | 10 passed (+12 Codex = 22) | VERIFIED |
| Templates Directory Suite | 688 unit tests | 700 passed (60 files, with Codex suite) | VERIFIED |
| Marketing Directory Suite | 44 unit tests | 44 passed (9 files) | VERIFIED |
| Auth Directory Suite | 97 unit tests | 97 passed (10 files) | VERIFIED |
| Admin Test Suite | 202 unit tests | 202 passed (37 files) | VERIFIED |
| User Build Chunk Size | 477 kB | 477.66 kB (gzip: 142.10 kB) | VERIFIED |
| Admin Build Chunk Size | 285 kB | 285.33 kB (gzip: 90.66 kB) | VERIFIED |
| Axe Color-Contrast Rule | Active, 0 violations | 0 violations verified | VERIFIED |

## 2. Critical Inconsistency: 25/5 vs 26/4 Acceptance Gates

In Phase 09.1 Chapter 16 prose, Gemini reported:
> "Counts: 25 VERIFIED — LOCAL, 5 PARTIALLY COMPLETE"

However, the Markdown table in Chapter 16 and the machine-readable `acceptance-matrix.json` only contained **four** `PARTIALLY COMPLETE` entries:
- `F09.1-20` (Khmer typography & native review)
- `F09.1-21` (Dark theme & contrast)
- `F09.1-22` (Responsive widths & short landscape)
- `F09.1-24` (Axe WCAG 2.2 AA & physical AT)

The remaining 26 gates were marked `VERIFIED — LOCAL`. The missing 5th partial gate was an unresolved conflict between prose and data. Codex independently examined all 30 gates and established a strict, evidence-backed distribution:
- **24 VERIFIED — LOCAL**
- **6 PARTIALLY COMPLETE** (Gates requiring external physical hardware, live merchant provider sandboxes, or human native Khmer copy approval: F09.1-03, F09.1-17, F09.1-18, F09.1-20, F09.1-22, F09.1-24).
