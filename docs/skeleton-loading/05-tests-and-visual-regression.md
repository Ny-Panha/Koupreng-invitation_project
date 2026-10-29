# Verification — final source

| Check | Actual command | Result / log |
|---|---|---|
| User unit/component | `npm --prefix apps/frontend-user test -- --maxWorkers=2` | 158 files, **1163 passed**, 89.89s — [log](../../output/skeleton-loading/user-tests.log) |
| Admin unit/component | `npm --prefix apps/frontend-admin test -- --maxWorkers=2` | 22 files, **128 passed**, 8.99s — [log](../../output/skeleton-loading/admin-tests.log) |
| Backend | `apps/backend/mvnw.cmd -f apps/backend/pom.xml test` | 649 run, **578 passed / 71 skipped**, zero failures/errors, 2:22 — [summary](../../output/skeleton-loading/backend-summary.log) |
| Worker | `apps/telegram-bot/.venv/Scripts/python.exe -m pytest apps/telegram-bot/tests` | **74 passed**, 0.91s; existing dependency deprecation warning — [log](../../output/skeleton-loading/worker.log) |
| Builds | `npm --prefix apps/frontend-user run build`; same for `frontend-admin` | Both exit 0 — [user](../../output/skeleton-loading/user-build.log), [admin](../../output/skeleton-loading/admin-build.log) |
| Lint | `npm --prefix apps/frontend-user run lint`; same for `frontend-admin` | Both exit 0, no warnings — [user](../../output/skeleton-loading/user-lint.log), [admin](../../output/skeleton-loading/admin-lint.log) |
| Focused browser | `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/guest-ticket-polish.spec.js tests/e2e/skeleton-loading.spec.js tests/e2e/phase9-tickets.spec.js tests/e2e/phase11-bilingual.spec.js tests/e2e/phase7-guests.spec.js --workers 2 --timeout 60000` | **52 passed / 4 duplicate captures skipped**, zero failures, 1.2m — [log](../../output/skeleton-loading/final-focused-playwright.log) |
| Browser regression | `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/critical-routes.spec.js tests/e2e/next-studio-ux.spec.js tests/e2e/project-wide-ui.spec.js tests/e2e/guest-workspace.spec.js tests/e2e/event-access-recovery.spec.js tests/e2e/phase8-functional.spec.js tests/e2e/phase9-studio.spec.js tests/e2e/phase9-video.spec.js tests/e2e/phase10-studio.spec.js tests/e2e/phase12-studio.spec.js --workers 2 --timeout 60000` | **130 passed / 26 duplicate or conditional captures skipped**, zero failures, 5.3m — [log](../../output/skeleton-loading/final-regression-playwright.log) |
| Skill integrity | `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly` | Exit 0, 59 bundled skill directories verified — [log](../../output/skeleton-loading/skills-integrity.log) |
| Routing | `python scripts/validate-agent-routing.py` | Exit 0, zero failures — [log](../../output/skeleton-loading/routing.log) |

Browser gates include axe, reduced motion, responsive geometry, eight pixel goldens, initial/success/empty/error/retry/access/refresh states, trusted payment transitions, real ticket PNG export and QR decoding. Snapshot generation was separate from the final comparison runs. No existing baseline was changed to conceal a functional regression. See [04](04-accessibility-and-performance.md) for the intentional language-control update and measurements, and [06](06-known-limitations.md) for unverified environments.

The first broad run's 205 passes, 15 failures and 26 skips remain in [the historical log](../../output/skeleton-loading/regression-playwright.log). Those failures drove test-harness and UI fixes; the final independent gates above supersede that run. The unrestricted baseline's two lazy-template timing failures are preserved in [its log](../../output/skeleton-loading/baseline-user-tests.log).

## Screenshots and exports

| Evidence | Before | Final |
|---|---|---|
| Studio loading, English desktop | [before](../../output/skeleton-loading/before/studio-loading-en-1440.png) | [after](../../output/skeleton-loading/after/studio-loading-en-1440.png) |
| Studio loading, Khmer 320px | [before](../../output/skeleton-loading/before/studio-loading-kh-320.png) | [after](../../output/skeleton-loading/after/studio-loading-kh-320.png) |
| Guest workspace | [before](../../output/skeleton-loading/polish-before/guests-light-1440.jpg) | [desktop](../../output/skeleton-loading/polish-after/guests-en-1440.png), [Khmer mobile](../../output/skeleton-loading/polish-after/guests-kh-390.png) |
| Ticket designer | [before](../../output/skeleton-loading/polish-before/tickets-light-1440.jpg) | [desktop](../../output/skeleton-loading/polish-after/tickets-design-en-1440.png), [Khmer dark mobile](../../output/skeleton-loading/polish-after/tickets-design-kh-dark-390.png) |
| Actual ticket export | — | [1200 × 1800 PNG](../../output/skeleton-loading/polish-after/premium-ticket-desktop-chromium.png) |
| Admin independent report loading | — | [dark desktop](../../output/skeleton-loading/after/admin-dark-partial-desktop-chromium.png) |
| Empty / error / refresh / restriction | — | [empty events](../../output/skeleton-loading/after/events-empty-desktop-chromium.png), [catalog retry](../../output/skeleton-loading/after/catalog-error-desktop-chromium.png), [guest refresh](../../output/skeleton-loading/after/guests-refresh-desktop-chromium.png), [QR denied](../../output/skeleton-loading/after/qr-access-denied-desktop-chromium.png) |
| Payment contract fixtures | — | [pending](../../output/skeleton-loading/after/payment-pending-desktop-chromium.png), [server-verified fixture](../../output/skeleton-loading/after/payment-verified-fixture-desktop-chromium.png) |

Both languages have full Studio and guest/ticket captures at 320, 375, 390, 430, 768, 1024, 1366 and 1440px in the adjacent evidence directories. Ticket/guest before references use the existing project-wide fixture, while the final filter matrix uses six synthetic guest records; those reference comparisons are not pixel-equality assertions. Names, records, orders, amounts and QR credentials are test fixtures; imagery uses existing demo assets.
