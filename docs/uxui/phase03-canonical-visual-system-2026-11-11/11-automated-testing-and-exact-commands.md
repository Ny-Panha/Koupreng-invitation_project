# Automated testing and exact commands

Executed from `D:\Koupreng-invitation_project` on `main`; Node/Vite/Chromium local. The first baseline focused tests and sync check passed before edits. After edits:

| Command | Result |
|---|---|
| `node scripts/sync-design-tokens.cjs` | PASS, generated two exports |
| `node scripts/sync-design-tokens.cjs --check` | PASS, two verified exports |
| `node -e "const r=require('./docs/qa/batch12/route-matrix.json').routes; const c={}; for(const x of r)c[x.application]=(c[x.application]||0)+1; console.log(JSON.stringify({routes:r.length,groups:new Set(r.map(x=>x.group)).size,applications:c}))"` | PASS, 135 routes / 62 groups / 111 user / 24 admin |
| `npm --prefix apps/frontend-user test -- src/shared/styles/semanticTokens.test.js src/app/batch11RouteInventory.test.jsx` | PASS, 4 tests |
| `npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx src/layouts/AdminLayout.test.jsx` | PASS, 8 tests |
| `npm --prefix apps/frontend-user run lint` | PASS |
| `npm --prefix apps/frontend-admin run lint` | PASS |
| `npm --prefix apps/frontend-user test` | PASS, 215 files / 1,487 tests; Happy DOM printed blocked remote iframe/font messages |
| `npm --prefix apps/frontend-admin test` | PASS, 34 files / 195 tests; Happy DOM printed local connection/iframe messages |
| `npm --prefix apps/frontend-user run build` | PASS, 3,092 modules |
| `npm --prefix apps/frontend-admin run build` | PASS, 2,122 modules |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/capture-visual.mjs before` | PASS after fixture/wait selector corrections, 52 captures; baseline SHA |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/capture-visual.mjs after` | PASS, 52 captures, zero page exceptions |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/audit-responsive.mjs` | PASS, 95 route-width probes, zero document overflow; first axe pass found 2 dark auth contrast nodes |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/audit-responsive.mjs --axe-only` | PASS, five selected scans, zero violations after fix |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/audit-responsive.mjs --landscape-only` | PASS, 3 short landscapes with scroll and Edit/Preview reachability |
| `node docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/measure-lab.mjs` | PASS, 60 navigation samples and bundle ledger |
| `python docs/uxui/phase03-canonical-visual-system-2026-11-11/evidence/analyze-captures.py` | PASS, 52 image comparisons |
| `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line` | **KNOWN BASELINE FAIL**, 26 pass / 6 fail across two projects: 3 pre-existing assertion types repeated per project |

The three old assertion types are: Khmer wizard button expected `បន្ទាប់` but current control uses a shorter label; Studio preview link test expects an old Khmer string; short-landscape Studio test demands 95% iframe visibility when its scrollable preview is taller than the viewport. Phase 02 triaged these as assertion drift/reachability contract problems. This phase did not alter those tests to make them green. The independent Phase 03 short-landscape probe uses scroll and pane switching rather than a permissive viewport ratio. E2E traces remain in ignored Playwright `test-results/` locally.

Initial capture harness attempts failed on a mismatched admin-login fixture group and an English Studio heading wait in Khmer locale; both harness selectors were corrected before the 52/52 baseline. One `rg` command used a Windows-invalid glob, and an inline Python contrast command had a syntax error; corrected reads and JavaScript contrast math supplied the evidence. `git diff --check` passed with a CRLF normalization warning on `app-experience.css`. No product test failed from the token change.
