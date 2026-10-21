# Verification results

21 October 2026 · branch `fix/template-studio-review-20261021`.

| Working directory | Actual command/scope | Result |
| --- | --- | --- |
| apps/frontend-user | `npm test -- --maxWorkers=2` | 554 passed, 102 files; 47.42s |
| apps/frontend-admin | `npm test` | 80 passed, 16 files; 33.78s |
| apps/backend | `cmd /d /c ".\mvnw.cmd test -Dstyle.color=never > ..\..\.cache\review-backend-clean.log 2>&1"` | 539 run; 508 passed, 31 skipped, zero failures/errors; BUILD SUCCESS |
| repository root | `python -m pytest apps/telegram-bot/tests -q` | 72 passed; 2 deprecation warnings; 2.05s |
| apps/frontend-user | `npx playwright test --config=../../.cache/template-review.config.mjs template-identity.spec.js studio-geometry.spec.js studio-tickets.spec.js premium-workspace.spec.js event-workspaces.spec.js --workers=2` | 58 passed; desktop and mobile Chromium |
| apps/frontend-user | `npm run test:e2e -- critical-routes.spec.js silk-heritage.spec.js khmer-celestial-scroll.spec.js khmer-celestial-guest-banner.spec.js --workers=2` | 52 passed, 2 opt-in checks skipped |
| apps/frontend-user | Focused `event-access-recovery.spec.js` | 2 passed; verified premium-denial recovery |
| apps/frontend-user | Final focused `template-identity.spec.js event-access-recovery.spec.js` | 18 passed; includes empty catalog and missing published-template recovery; overlaps the broad browser run |
| apps/frontend-user | `npm run lint`, `npm run build` | Passed; production build verified |
| repository root | `python scripts/validate-agent-routing.py` | Passed |
| repository root | `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed; zero checksum errors |
| repository root | `git diff --check` | Passed |

The browser commands were also executed through `cmd /d /c` with `2>&1` redirection to obtain reliable process exit codes. Initial PowerShell captures reported nonzero wrapper status for stderr warnings even when the runner summaries passed. Clean wrapper logs supersede those shell statuses. Initial harness failures were investigated: an old `**/api/**` fixture intercepted Vite source-module URLs, a mobile navigation test checked visibility before async loading, and a renderer assertion needed a bounded load allowance under concurrent capture. Fixtures now restrict interception to `/api/`; navigation waits for the intended control, and renderer checks still assert exact identity. No authentication or ownership check was weakened.

The temporary review config uses the repository desktop/mobile Chromium projects, a loopback Vite application on 5173, 60-second test timeout, no trace export and intercepted browser API fixtures. The additional template regression uses the normal project config and built preview applications. Reproduction in a normal checkout can use the committed test files with the existing `npm run test:e2e` runner after building.

Coverage includes cold catalog loading, actual numeric-ID collisions, refresh, stale customization, event isolation and denial, persisted template switching, premium denial, missing assets/registration, exact public/editor renderer agreement, save retry/history/leave warnings, ticket exports with independent QR decoding, preview scrolling, mobile editing, fullscreen, keyboard navigation and nine-width geometry. No guest credential or payment behavior was changed.

Focused runs overlap full suites and must not be added to the unit totals. The 31 backend skips and 2 browser skips are not passes. MySQL, actual providers and physical devices remain gated. Unit output contains Happy DOM external stylesheet/map loading warnings. Login/register route captures contain the separately reported Google localhost-origin rejection; this is not represented as working OAuth.

The archive's machine-readable `metadata/test-summary.json` is parsed from actual logs. Capture scripts and the ZIP packager are committed under `scripts/qa/`; no secret-bearing raw session, trace or environment file is packaged.

## Verified local implementation commits

- `78b54cb3` — exact catalog identities, registry/preview agreement and regression coverage.
- `3fb1961a` — reject unresolved database IDs during cold loading.
- `09ee2b0e` — focused studio toolbar, sections, preview geometry and navigation refinement.
- `dd2254fd` — compact featured cards, readable metadata and actual event-type filters.
- `6104cdb1` — catalog-gap/save guards, published recovery and explicit shared Garden presets.
- `f1047df3` — readable premium-access recovery.

The archive's `metadata/git-changes.md` also includes the final documentation/evidence commit and its exact source HEAD. All commits remain local.
