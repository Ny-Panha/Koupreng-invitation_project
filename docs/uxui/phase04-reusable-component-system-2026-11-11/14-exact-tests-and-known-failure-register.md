# 14 — exact tests and known failure register

All commands ran from `D:\Koupreng-invitation_project` on Windows PowerShell, Node/Vite local environment, starting HEAD `1dc4b24b9d3049c3fd147ee545cb3b6b39738cf9`; final code verification ran before the Phase 04 commit. No CI or production backend test is implied. `npm test` uses Vitest and the browser spec uses local Chromium 156.0.8078.4 with fictional fixtures.

| Check ID | Command | HEAD/stage | Environment | Counts | Evidence | Baseline vs new | Status | Follow-up |
|---|---|---|---|---|---|---|---|---|
| Q01 | `node scripts/sync-design-tokens.cjs --check` | before + final | Node | 2 app exports verified | console | existing gate | PASS | Keep canonical mirror |
| Q02 | `npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx src/shared/styles/semanticTokens.test.js src/shared/ui/sharedUi.test.jsx src/shared/ui/FormField.test.jsx src/shared/ui/Modal.test.jsx` | before | Vitest | 5 files, 19 tests PASS | console | baseline | PASS | Rechecked by full suite |
| Q03 | `npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx src/layouts/AdminLayout.test.jsx` | before | Vitest | 2 files, 8 tests PASS | console | baseline | PASS | Rechecked by full suite |
| Q04 | `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line` | before | 2 Chromium projects | 19 PASS, 13 FAIL, 0 SKIP | ignored Playwright traces | existing red baseline | FAIL | Extra failures included missing fixture controls/contrast; inspect timing before assigning product fault |
| Q05 | `npm --prefix apps/frontend-user test -- src/shared/ui/sharedUi.test.jsx` | first edit | Vitest | 7 PASS, 1 FAIL | console | new test selector targeted inner text, not badge | FAIL, then FIXED | Selector corrected to badge ancestor |
| Q06 | Same focused user command | after selector fix | Vitest | 8 PASS, 0 FAIL | console | new | PASS | — |
| Q07 | `npm --prefix apps/frontend-admin test -- src/shared/ui/AdminUI.test.jsx` | after edit | Vitest | 4 PASS, 0 FAIL after Khmer-label addition | console | new | PASS | — |
| Q08 | `npm --prefix apps/frontend-user test` | final code | Vitest/happy-dom | 215 files, 1,488 PASS | console | regression | PASS | happy-dom logged disabled external CSS/iframe warnings |
| Q09 | `npm --prefix apps/frontend-admin test` | final code | Vitest/happy-dom | 35 files, 199 PASS | console | regression | PASS | happy-dom logged loopback/iframe warnings |
| Q10 | `npm --prefix apps/frontend-user run lint`; `npm --prefix apps/frontend-admin run lint` | final code | ESLint | both exit 0 | console | regression | PASS | — |
| Q11 | `npm --prefix apps/frontend-user run build`; `npm --prefix apps/frontend-admin run build` | final code | Vite 8.3.5 | both exit 0 | console, ignored dist | regression | PASS | See payload ledger |
| Q12 | `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js --reporter=line` | final code | 2 Chromium projects | 10 PASS, 0 FAIL | spec + ignored traces | new real-route and contrast checks | PASS | Add physical touch/AT later |
| Q13 | `node .../evidence/capture-visual.mjs before`; `... after`; `python .../evidence/analyze-captures.py` | before/after | isolated builds, fixture Chrome | 52+52 screenshots, 0 page errors; 37/52 pairs identical | manifests + diff | visual | REVIEW REQUIRED | Four renderer families have changed pixels |
| Q14 | `node .../evidence/audit-responsive.mjs`; `... --axe-only` after contrast fixes | after | fixture Chrome | 95 widths, 0 document overflow; 8 axe scans, 0 rule violations; 16 drawer geometry flags | responsive JSON | new | REVIEW REQUIRED | Offscreen menu/tab-order probe |
| Q15 | `node .../evidence/measure-lab.mjs`; `node .../evidence/analyze-lab.mjs` | before/after | 390×844 loopback, unthrottled | 60 samples; home warm load 53.2→150.3 ms; incomplete FCP/LCP samples | lab JSON | local lab | REVIEW REQUIRED | Repeat controlled sampling; no field/INP claim |
| Q16 | `python .../evidence/generate-inventory.py` | final code | Python | 135 leaves, 62 groups, 38 mapped leaves, 46 component rows | JSON/Markdown ledgers | source inventory | PASS for ownership; PARTIAL for resolved imports | Complete import graph later |
| Q17 | `git diff --check` | final precommit | Git | exit 0 | console | hygiene | PASS | Repeat after staging |

The final rerun of Q04 after code changes was **26 PASS, 6 FAIL, 0 SKIP**. The six are the known three assertion types across desktop and mobile: create-event Khmer control/step, Khmer preview-link name, and short-landscape Studio iframe ratio. This run differs from the noisier starting result without editing that spec. QA-NEW-01/02/03 remain open; do not rewrite product copy to satisfy a stale locator or lower an iframe ratio without a stronger behavior test. Their exact route and fixture conditions should be isolated with the owning copy/QA decision.

The exploratory `rg` call with a Windows wildcard path and a second PowerShell brace-form path both failed due command syntax; corrected explicit paths were used. An initial migration `rg` glob returned zero because of path separators; `Get-ChildItem` confirmed 48. These command errors did not change files or affect the gate conclusions.
