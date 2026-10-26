# Test results

Executed on 25–26 October 2026 in the isolated Phase 10 worktree. Counts below describe the selected completed runs; repeated attempts are not added together. Raw execution logs and fictional credentials stay in ignored `.cache/phase10`. `evidence/test-results.json` retains command/result excerpts and log hashes without credentials.

| Gate | Result | Retained local log |
|---|---|---|
| User Vitest | 926 passed; 134 files; 47.95s | user-release.log |
| Admin Vitest | 121 passed; 21 files; 11.22s | admin-tests-final.log |
| User/admin ESLint | Passed | lint-release.log / admin-lint-final.log |
| User/admin production builds | Passed | build-release.log / admin-build-final.log |
| Backend, Java 25 / Spring Boot 4.0.8 | 624 discovered, 620 passed, 4 skipped; zero failures/errors; 2m46s | backend-mysql-isolated.log |
| Python worker | 72 passed; two dependency deprecation warnings; 1.55s | worker-final.log |
| Phase 7 / existing tickets browser regression | 72 passed; Chromium, Firefox, WebKit; 7.5m | phase7-tickets-final.log |
| Phase 8 browser regression | 45 passed, 4 historical reference-capture skips; 3.6m | phase8-final.log |
| Phase 9 browser regression | 51 passed; all three engines; 5.0m | phase9-verified.log |
| Phase 10 browser matrix | 61 unique cases passed, 2 explicit engine skips, across resumed partitions | browser-integration.log / browser-final-webkit-visual.log |
| Final contract regeneration | 13 passed; single worker; 4.02s; targeted ESLint passed | contract-release.log / contract-lint-release.log |
| Real HTTP/API/MySQL browser journeys | 2 passed; 1.5m, including WAF pacing | live-release.log |
| npm audit, both apps including dev dependencies | Zero vulnerabilities | user-audit-final.json / admin-audit-final.json |
| Routing / skills / tokens | Zero routing errors; 59 bundled directories verified; 2 token exports verified | routing-final.log / skills-final.log / tokens-final.log |
| Compose syntax | Passed with process-only synthetic required configuration | compose-final.log |
| Staged secret scans and whitespace checks | Passed before source commits; repeated before final integration | source-secret-scan.log / final-diff-check.log |

Backend skips are the three explicitly gated Phase 6 demo provisioning methods and the opt-in RSVP benchmark. No historical migration was edited. MySQL integration used a task-owned MySQL 8.0.39 process bound to `127.0.0.1:3416`, not an existing application database. The worker used installed Python 3.14 because the default Python 3.15 environment lacked pytest.

## Reproduction

From the repository root, install each app with `npm --prefix apps/frontend-user ci` and `npm --prefix apps/frontend-admin ci`. Then:

```powershell
npm --prefix apps/frontend-user test
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin test
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin run build
mvn -f apps/backend/pom.xml test
C:/Python314/python.exe -m pytest apps/telegram-bot/tests -q
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9-regression.config.js
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase8.config.js
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9.config.js
npm --prefix apps/frontend-user run build -- --outDir ../../.cache/phase10/browser-dist
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase10.config.js
```

The backend integration run additionally enabled `RUN_FLYWAY_INTEGRATION=true` and `RUN_PHASE7_MYSQL=true`, with `FLYWAY_TEST_DB_URL`, `FLYWAY_TEST_DB_USERNAME` and `FLYWAY_TEST_DB_PASSWORD` pointing exclusively to the owned disposable instance. These tests create/drop disposable schemas; provision a separate instance before enabling them. Credentials are excluded from this report.

The native browser configuration requires an explicitly provisioned fictional account, event and guest via `PHASE10_BROWSER_FIXTURES`; its API is restricted to `http://127.0.0.1:8189`. Build `.cache/phase10/live-dist` with that local `VITE_API_URL` before running `--config=playwright.phase10-live.config.js`. A fixture Premium grant is non-revenue test provisioning, not payment approval. The two dense journeys share one loopback IP and deliberately allow a fresh 60-second WAF window between them; WAF limits remain unchanged.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
python scripts/validate-agent-routing.py
npm --prefix apps/frontend-user audit
npm --prefix apps/frontend-admin audit
git diff --check
git diff --cached | gitleaks stdin --redact --no-banner
```

## Findings during verification

The blocked-font-server case first reproduced a blank route caused by blocking external CSS imports. Local OFL font defaults repaired it. The final font cases exercise all 12 catalog/event renders with both Google font hosts blocked and actual long Khmer names.

The WebKit ticket axe check initially raced export cleanup after the browser's download event. It now awaits the PNG-ready status and restored action state before the unchanged scan. The Phase 9 rerun passed all 51 cases.

The native rerun exposed a WAF 429 when two dense journeys shared one minute; pacing preserves the rate limit and strict HTTP 200 film assertion. Inspection also found Studio's omitted canonical RSVP deadline. Two component cases reproduced the failure before its repair; the final native journey asserts the deadline survives a later Studio save.

A Phase 10 WebKit attempt exceeded the default 5-second workspace-readiness assertion while unit/lint/build checks ran concurrently. Its error snapshot showed the workspace loading state. Browser release verification is repeated without those competing checks; the original attempt is not counted as a clean run.

The final Phase 10 rerun completed 60 successful cases and the two explicit non-Chromium CDP-touch skips before the execution session ended ahead of its last WebKit visual result. That one remaining case was run separately with unchanged assertions. The combined 61 passes cover all 63 configured cases; this is not represented as one uninterrupted successful process. Chromium completed 21 passes, Firefox 20 plus one skip, and WebKit 20 plus one skip.

Scoped axe scans cover the separator controls, Settings, tickets and selected invitation sections with WCAG 2/2.1/2.2 A/AA tags. This is not a full WCAG conformance claim. Physical devices, manual assistive technology and real providers retain the limitations recorded in [13-known-limitations.md](13-known-limitations.md).
