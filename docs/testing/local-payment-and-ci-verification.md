# Local payment and CI verification

Verified on 2026-10-13 (Asia/Bangkok), Windows/PowerShell. Branch: `fix/ci-local-payment-verification`.

## A. GitHub Actions

Investigated [failed run 38372445318](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/38372445318), commit `e145efe4`. GitHub CLI was unavailable; job summaries and decoded logs were retrieved through the connected GitHub integration.

| Job | Error | Root cause | Fix | Reproduced | Result |
|---|---|---|---|---|---|
| Dependency Vulnerability Audit | **Audit Java dependencies:** `Could not find artifact org.owasp:dependency-check-maven:jar:12.2.2 in central (https://repo.maven.apache.org/maven2)` | Plugin resolution failed before vulnerability analysis. The runner restored Maven caches and logged no download attempt. Cached negative resolution is an inference; the underlying repository/cache incident cannot be established from these logs alone. | Add `--update-snapshots` to recheck missing release artifacts. Keep the pinned scanner, NVD freshness check, suppressions and CVSS 8 gate. | Original command resolved the same version locally and passed; the missing-artifact failure did **not** reproduce. Maven Central returned HTTP 200 for both pinned POM and JAR. Audit with the added flag also passed. | Local scan passed; later remote main scan also passed. |
| Secret Scan | None | — | None | Remote evidence | Passed |
| Backend Build, Test, Coverage & Static Analysis | None | — | None required by CI | Local verification below | Passed |
| Backend Static & Dependency Usage Analysis | None | — | None required by CI | Local SpotBugs/PMD | Passed |
| User Frontend Lint, Test, Analysis & Build | None | — | None | Local lint/test/build | Passed |
| Admin Frontend Lint, Test, Analysis & Build | None | — | None | Local lint/test/build | Passed |
| Telegram Bot Lint, Test & Compile | None | — | None | Local Ruff/pytest/Bandit/compile | Passed |
| Fresh MySQL Flyway Migration | None | — | Preserve existing repair | Local fresh/upgrade tests | Passed |
| Browser E2E & Route Smoke | None | — | None | Local Playwright | Passed |
| Deployment Configuration & Docker Applicability | None | — | None | Remote evidence; local policy checks | Passed |

During this task, [main run 38408139986](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/38408139986) appeared for `7e9fa858`: **all ten jobs passed**. This task did not push or trigger that run. It predates the new entitlement fix and workflow hardening on this branch.

Maven documents that [`--update-snapshots` rechecks missing releases](https://maven.apache.org/ref/3.9.15/maven-embedder/cli.html). No plugin version or security threshold was changed. The local Java report still lists findings for MySQL Connector/J, Netty transport and bundled DOMPurify below the blocking threshold; passing this gate does not mean zero findings. OSS Index also reported missing optional service credentials. Report: `apps/backend/target/dependency-check-report.html` (ignored local artifact).

## B. Local stack

| Component | Observed result |
|---|---|
| MySQL | 8.0.39, reachable on 3306. Existing application database retained. |
| Backend | Existing `http://localhost:8080/actuator/health/readiness` returned HTTP 200. A malformed internal detection request with the configured shared secret returned validation HTTP 400, without creating evidence. |
| User frontend | Existing `http://localhost:5173/` returned HTTP 200. |
| Admin frontend | Existing `http://localhost:5174/` returned HTTP 200. |
| Bot | Started local worker on loopback 8000; `/health` returned HTTP 200. Telegram authentication remains blocked as described below. |
| Flyway | Existing V33 checksum `1422459132`, V34 checksum `-1875407034`, both successful; transaction-date column present. |

The V33/V34 repair was already committed in `7e9fa858`; it became visible on remote main during this task. No migration was edited here. Fresh schema startup validated/applied **31 migration files through V34**. Tests also verified original V33 → V34 and an already-present date column, preserving evidence and checksums. No Flyway repair, database reset or historical migration rewrite was performed. The existing launcher uses `*:missing` for local historical entries; checksum validation remains enabled. Disposable schemas did not use that exception.

Normal services appeared while diagnostics were in progress and were reused. Browser financial mutations used separate randomly named `koupreng_browserqa_*` / `koupreng_ciqa_*` schemas. Isolated servers used 8081/5183/5184/8001. Their auto-confirmation was explicitly false; synthetic Telegram IDs and transactions were confined to this environment. The real bot token was excluded from the isolated backend. The simulation ran the existing FastAPI bot with only Telegram API transport replaced; Spring Boot calls and database writes were real.

## C. Subscription checkout

- Logged in through the actual UI using the repository's development fixture account in the disposable schema. Tested Basic and Pro offers without changing prices or fixed links.
- Blank payer and two-digit suffix errors appeared; malformed API purchases returned HTTP 400.
- A double-click created exactly one Basic order, `SUB2610132350`, for the authenticated fixture owner: USD 0.01, synthetic payer, suffix `247`, `PENDING_PAYMENT` / `PENDING`, `is_active=0`, bank transaction ID NULL, creation and expiry timestamps populated.
- Both subscription payment URLs equaled their backend-configured fixed links. Payment pages were opened passively and closed; no bank confirmation was performed. Application expiry was presented as session expiry, not bank-link invalidation.
- A committed notification contained order, package, amount and masked suffix. A simulated send failure left it PENDING after one attempt; the next attempt marked it SENT. Delivery did not activate the subscription.
- Mobile Pro order `SUB2610131857` entered `REVIEW_REQUIRED` through actual polling after simulated merchant evidence. Admin UI confirmation made it ACTIVE/PAID. Refresh showed Pro as the active package; its premium subscription capability was verified through the API.
- Duplicate confirmations did not extend expiry. Exactly one subscription remained active; the previous Basic subscription became REPLACED.

Local screenshots: `output/playwright/subscription-pending-desktop.png`, `subscription-pending-mobile.png`, `subscription-review-mobile.png`, `subscription-confirmed-mobile.png`. Screenshots contain only local fixture data.

## D. Telegram/payment reconciliation

**Simulated, executed:** original-message webhook → existing Python parser → authenticated Spring Boot endpoint → durable evidence → default-off review → authenticated admin UI confirmation → entitlement. Evidence retained amount/currency, payer/suffix, explicitly simulated transaction ID/APV, numeric message/chat/sender identity and original date text. Replayed update stayed inactive before review. Cross-subscription transaction reuse for a template returned HTTP 409. Missing/invalid internal secrets and unauthenticated/non-admin confirmation were rejected.

Existing Java/Python suites exercised wrong amount/currency/suffix/name, missing transaction IDs, missing/conflicting references, ambiguous candidates, untrusted/forwarded/copied alerts, expired orders, transaction/message replays and competing product types. Missing reference is handled according to matching policy; it is not universally required for a unique subscription match. Automatic-mode safety cases were tested only in isolated fixtures. Manual-confirmation audit identity was the authenticated admin ID, replacing a spoofed client identity.

**Real Telegram/ABA, blocked:** `getMe` and `getWebhookInfo` both returned HTTP **401** with the configured token. Consequently webhook destination/reachability, Bot-to-Bot mode and merchant/group permissions could not be verified. Token/secret values were never printed. Merchant numeric IDs and authorized admin IDs were absent; they were not guessed or added to live configuration. No real bank alert or transaction was tested. Merchant Telegram evidence was never represented as ABA API verification.

Plugin discovery found no installed/supported computer-use or Telegram capability for the personal Windows session. No personal Chrome profile or Telegram Desktop session was attached. Dedicated Playwright browsers were used. The receiving worker's local health does not establish live Telegram delivery.

## E. Template payment

The existing Garden Royal static offer created `EVT261013156` for USD 0.01. Its link equaled the backend configuration and no bank KHQR/transaction reference was fabricated; the `PW...` identifier was labeled as an internal checkout ID.

QA initially failed: the entitlement service treated Garden Royal as free because its catalog premium flag was false, although the existing checkout policy requires the paid static offer. Added unit and MySQL regressions reproduced premature access, then fixed the shared entitlement check to also consult that policy. Catalog metadata, prices and payment links were preserved. Invitation creation is covered by the same gate.

After the fix, the buyer's **ផ្ទៀងផ្ទាត់ការទូទាត់** request persisted/reused one SENT review notification and remained `PAID_PENDING_REVIEW`, with access locked. Arbitrary amount and KHR substitution returned HTTP 400. Trusted simulated evidence stayed under review. Admin UI confirmation granted access; polling showed “Template unlocked.” Duplicate confirmation left exactly one entitlement. Local screenshots: `output/playwright/template-review-desktop.png`, `template-confirmed-desktop.png`.

## F. Tests

Commands below were executed. Maven ran from `apps/backend`; MySQL integration variables targeted only the disposable schema. Local tools: Java 25.0.1, Node 26.5.0, Python 3.14.5; CI uses Java 25 / Node 22 / Python 3.13.

| Command | Actual result |
|---|---|
| `.\mvnw.cmd --batch-mode -Pdependency-security -DskipTests verify` | Passed; 12m33s including first NVD download. Original resolution failure did not reproduce. |
| `.\mvnw.cmd --batch-mode --update-snapshots -Pdependency-security dependency-check:check` | Passed; 23.302s. Focused equivalent of the changed audit step. |
| `.\mvnw.cmd --batch-mode verify` with `RUN_FLYWAY_INTEGRATION=true` | Baseline full verification: **455 tests, 0 failures/errors/skips**, 1m47s; coverage, SpotBugs and PMD passed. Includes fresh migration, three upgrade cases and payment concurrency tests. |
| `.\mvnw.cmd --batch-mode test -Dtest=EntitlementServiceTests,EntitlementIntegrityMySqlTests` before fix | **14 tests, 2 failures**, reproducing premature access. |
| `.\mvnw.cmd --batch-mode verify '-Dtest=*Payment*,*Subscription*,*Auth*,ArchitectureRulesTests,EntitlementServiceTests,EntitlementIntegrityMySqlTests,InvitationServiceTests'` after fix | **201 tests, 0 failures/errors/skips**, 1m06s; SpotBugs/PMD passed. Includes both new regressions. |
| `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build` in each frontend | User: **82 files / 379 tests passed**. Admin: **10 files / 46 tests passed**. Lint/build passed. User build reported its existing large-chunk warning. |
| `npx.cmd playwright test tests/e2e/critical-routes.spec.js tests/e2e/route-smoke.spec.js` | **56 passed**, 36s, desktop/mobile. These existing smoke tests use controlled API fixtures; separate live local journeys are described above. |
| `python -m ruff check .`; `python -m pytest -q`; `python -m bandit -q -r main.py start.py`; `python -m compileall -q main.py start.py tests` in bot | All passed; **72 pytest tests**, 1.68s, two framework deprecation warnings. |
| `npm.cmd --prefix apps/frontend-user audit --audit-level=high`; admin equivalent | Both passed; zero reported vulnerabilities. |
| `python -m pip_audit -r requirements.txt` | Passed; no known vulnerabilities reported. |
| `node --test scripts/qa/*.test.mjs` | **13 passed, 0 failed**. |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | **10/10 pinned, 6/6 custom**, zero checksum/missing-file errors. |
| `python scripts/validate-agent-routing.py` | **Exit 1:** existing `koupreng-premium-ux/SKILL.md` frontmatter delimiter issue. Also warns about duplicate `vercel-react-best-practices` names. Left unchanged. |
| `git diff --check` | Passed. |

Dedicated browser actions used `npx.cmd --yes --package @playwright/cli playwright-cli -s=paymentqa ...` and `-s=adminqa ...`. Synthetic API assertions, SQL observations and raw local command logs are retained under ignored `.cache/`; they are not committed. API login checks invalidated older fixture browser sessions, which were reauthenticated before completing confirmation journeys.

## G. Outstanding items

1. Configure a valid Telegram token **locally**, verified merchant/admin numeric IDs, Bot-to-Bot mode and group permissions. Confirm HTTPS webhook state once authenticated. No webhook or tunnel was changed here.
2. The original ignored `.env` had auto-confirmation enabled. This task changed **only** `AUTO_CONFIRM_TELEGRAM_DETECTED=false` as requested. Isolated processes used false throughout. The pre-existing normal backend's effective loaded value is unverified; reload its configuration and verify it before any live alert test.
3. Real payment requires owner approval of exact amount, recipient and purpose, followed by owner-operated banking. No payment, PIN, password or OTP interaction occurred. Unattended settlement remains unauthorized.
4. Resolve the unrelated skill-routing frontmatter failure separately. Review nonblocking Java dependency findings and optional OSS Index credentials; no scan was disabled or finding suppressed here.
5. Existing UI wording: a buyer review request says “Payment detected” despite being only a claim; an empty current-subscription response also displayed an empty ACTIVE PLAN / Lifetime banner. Backend payment state remained pending/inactive. These unrelated copy/display issues were recorded without redesigning the UI.
6. The new branch changes await owner-authorized push and their own CI run. The successful remote run covers `7e9fa858`, not these additional changes.

## H. Git changes

Initial working tree was clean on local main `7e9fa858`; initial fetched remote main was `e145efe4`, subsequently updated externally to `7e9fa858`.

Reviewed task files: `.github/workflows/ci.yml`, `EntitlementService.java`, `EntitlementServiceTests.java`, `EntitlementIntegrityMySqlTests.java`, and this report. They are committed locally on `fix/ci-local-payment-verification`. No migration, frontend, bot, skill or fixed-link source was changed. No push, merge, production deployment or DNS change was performed.

Ignored local configuration change: the single auto-confirm flag in `.env`. Local screenshots remain under `output/playwright/` as uncommitted QA artifacts. Disposable test servers/browsers were stopped; their synthetic database schemas and ignored logs were retained for review. Normal local services were left running. No persistent application data was reset or given a simulated entitlement.
