# Evidence index and limitations

| Evidence | Location | Meaning / limit |
|---|---|---|
| Current route factory tests | `apps/frontend-{user,admin}/src/app/batch11RouteInventory.test.jsx`; current command in [12](12-qa-regression-and-verification-matrix.md) | 111/24 source declarations match stored route contracts; no complete state/browser proof. |
| Route and renderer ledgers | [03](03-complete-route-feature-state-matrix.md), [04](04-all-template-registry-and-renderer-audit.md), generator in `evidence/generate-inventory.py` | All static leaves/aliases mapped; dynamic backend catalog requires live dataset. |
| Current AU/browser failures | `output/playwright/uxui-phase01-2026-11-11/au-browser-results/` | Synthetic mobile Chromium screenshots/traces, 13 pass/3 fail; local ignored evidence. |
| Current full leaf render sweep | `output/playwright/uxui-phase01-2026-11-11/route-browser-results/` and command in [12](12-qa-regression-and-verification-matrix.md) | 135/135 PASS at 390px in mobile Chromium with fictional DTOs; no persisted write/real device claim. |
| Representative visual gallery | `output/playwright/uxui-phase01-2026-11-11/visual-baseline/metadata.json` plus 28 PNGs | Seven route groups × 320/390/768/1440px; fictional Khmer-locale fixtures, reduced motion, Chromium, zero recorded page errors. Local ignored output, so GitHub readers need a separately shared evidence bundle. |
| Browser JSON | `output/playwright/phase02-foundations/results.json` | Current runner's report location; may be overwritten by a later run, so failure summaries and individual trace paths are copied into [11](11-confirmed-bugs-and-reproduction.md). |
| Lab observers | `evidence/performance-current.json`, script beside it | Three cold synthetic route samples; no field p75, INP, Lighthouse or repeated distribution. |
| Historical audit | `docs/audits/phase01-2026-11-10/` | Prior source/tests/screenshots, never silently counted as current PASS. |
| Historical AU repairs | `docs/phase02-foundations/` | Implementation account corroborated by current source and six targeted browser passes. |

**Untested or blocked:** real database fresh/upgrade and concurrent payment/entitlement (nine targeted Maven skips); real Google/Telegram/ABA provider flows; sending mail/messages; all ten renderer families with authored published data; every route × state × viewport combination; physical Android/iPhone and social in-app browsers; screen reader and hardware keyboard; controlled performance distributions/field CWV; deployed TLS/cache/origin/backup. The user/admin full unit suites and 74 worker tests are current PASS, but they use synthetic data. The browser sweep uses fictional API responses.

**Coverage accounting:** 135/135 static route patterns mapped to phase owners and 135/135 route-specific fixture renders PASS at one mobile Chromium viewport; 62/62 route feature groups mapped. Ten/ten dedicated source renderer families and 38/38 static registry keys inventoried, plus two named shared IDs and fallback. **No claim of complete visual or functional audit:** route-state/device/template integrations remain incomplete. The Phase 02 entry gate is to classify the three current browser failures, capture a reproducible cross-browser baseline and prove the priority owner/guest/admin journeys in isolated staging.
