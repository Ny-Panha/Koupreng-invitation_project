# Security, performance and executed QA

## Security conclusions

No confirmed P0 authorization, payment verification or data-integrity bypass was found in the reviewed paths. This is not a penetration-test or absence-of-vulnerability claim. Backend tests and source provide evidence for strict owner/permission guards, distinct admin roles, validation/error translation, cookie-mode CSRF, upload allowlists/signature checks, rate limits and payment evidence deduplication.

| Area | Observed implementation | Remaining verification |
|---|---|---|
| Authentication | Verified social identity services, bearer JWT, optional cookie storage, expiry handling, separate admin storage/guard | Real Google/Telegram cancellation/redirect/in-app login; production cookie origins/SameSite/HTTPS |
| Authorization | `EventAccessPolicy`, permission-aware event service, entitlements; invalid-role/admin-boundary tests pass | MySQL-backed organization invitations/role revocation and concurrent changes were skipped |
| Payment | Pending/review does not grant entitlement in UI tests; server verification before paid transition; order locks and evidence uniqueness | Sandbox callbacks, duplicate/reordered evidence and atomic entitlement grants on actual MySQL |
| Public invitation/RSVP | Published/private/token/deadline policies and rate-limit code; service tests execute | Full guest submission/token/confirmation on isolated real backend and actual in-app clients |
| Upload/media | MIME/extension/size/signature restrictions, local/Cloudinary adapters, ownership/private access checks | Real EXIF/HEIC/large-photo/video, cleanup on failure and deployed storage access policy |
| Deployment | Prod profile enables HTTPS/HSTS requirements, restrictive origins, rate-limit Redis/fail-closed defaults; docs off by default | No Docker/Nginx stack, TLS proxy chain, Cloudflare rules, backup restore or production headers tested |
| Dependencies | Both production-only npm audits report zero known advisories at retrieval | No backend dependency-check/NVD scan or independent SAST run in this audit |

Full npm dependency audits return **four moderate entries per frontend**: minimatch and affected ESLint dependency chains. This is a development-tooling exposure, not a demonstrated browser exploit. Audit suggests a major-version downgrade path for ESLint; do not run `npm audit fix --force` blindly. Evaluate the [actual minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) against lockfiles, reachability and compatible patched versions. Logs are `evidence/*npm-audit.json` and `*production-audit.json`.

The root Compose file explicitly describes a **development** stack and selects the dev profile. Do not report that as a production misconfiguration without deployment evidence. Production uses `ddl-auto=none` while the base configuration defaults to `validate`; require the existing fresh/upgrade migration + Hibernate validation gates before release. Never modify applied migrations to satisfy a UI plan.

## Performance measurements

Production bundle build reports:

| Artifact | Raw / reported gzip |
|---|---|
| User entry `index-Dhk9nL08.js` | 461.97 / 138.97 kB |
| User invitation editor chunk | 229.07 / 60.17 kB |
| User check-in chunk | 180.17 / 61.73 kB |
| Admin entry | 282.40 / 90.06 kB |
| Admin template editor chunk | 233.78 / 54.83 kB |

These are build output sizes, not per-route total downloads. Lazy routes/template registry already prevent every template/editor loading up front; keep that boundary. Home is eager and shares an entry with app infrastructure, so profile the public critical path before adding another animation/primitive framework.

Single diagnostic sample per route: cold browser context, Chromium, 390×844 DPR2, 4× CPU throttling, 150ms network latency, 200,000 bytes/s down and 93,750 bytes/s up, reduced motion, fictional APIs, blocked external resources, other audit work running concurrently. Sampled three seconds after load; LCP/CLS are observer values for that window, not finalized field percentiles.

| Route sample | FCP | LCP sample | CLS sample | Resource entries / long tasks |
|---|---:|---:|---:|---:|
| Home | 4.004s | 4.004s | 0.00411 | 29 / 5 |
| Create event | 3.168s | 4.592s | 0 | 51 / 7 |
| Public Event Essential invitation | 2.788s | 4.988s | 0 | 82 / 4 |

See `evidence/performance-lab.json` for raw resource timing and observer records; use its actual long-task counts if interpreting any table row. No field INP, CrUX, device CPU score, Lighthouse score, real API p95 or production memory measurement was produced. Current CWV targets generally use LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the field 75th percentile. The lab samples warrant profiling and cannot establish field pass/fail. [Google Web Vitals guidance](https://web.dev/articles/vitals)

The home sample requests a 278,322-byte `phone-preview-880.webp`. Its public entry resource encoded size is about 138KB in the preview server response. The asset inventory contains 454 media/font files totaling ~122.1MB across inspected asset directories; **that is stored inventory, not an initial page payload**. Large source/4K assets and the 6.46MB demo film require route-specific request proof before resizing/removing. `VenuesFeature.jsx` imports a 2.52MB background image, but this audit did not measure its end-user route transfer. Preserve originals and mappings.

Recommended profiling order: repeat on an idle machine with the deployed compression/cache/origin setup, inspect home entry/font/image priority, public invitation request fan-out, then editor interaction long tasks and decode/crop memory. Keep full-motion performance checks separate from reduced-motion diagnostics. Do not add WebGL, shader backgrounds, continuous blur or another scrolling/animation engine to hide latency.

## Executed commands and results

All commands ran from `D:\Koupreng-invitation_project`. Output was redirected to the linked evidence directory. PowerShell redirection originally wrote UTF-16; completed evidence text was normalized to UTF-8 for reading. No application file was edited.

| Command actually run (base command; log redirection omitted here) | Result |
|---|---|
| `git status --short`; `git branch --show-current` | Clean starting tree; `main` |
| `node --version`; `npm --version`; `java --version`; `python --version` | Node 26.12.1, npm 11.20.0, Java 25.0.1, Python 3.15.1 |
| `Get-Command node,npm,npx,java,mvn,python,docker -ErrorAction SilentlyContinue` | Node/npm/npx/Java/Python/Docker present; no global Maven. Wrapper used. |
| `docker version --format '{{.Server.Version}}'` | Failed: Docker Desktop Linux engine named pipe absent; daemon not running |
| `npm --prefix apps/frontend-user test` | **1,391 pass**, 195 files, 97.33s; `user-vitest.log` |
| `npm --prefix apps/frontend-admin test` | **191 pass**, 33 files, 23.61s; `admin-vitest.log`; nonfatal localhost:3000 network/DOM stderr retained |
| `npm --prefix apps/frontend-user run lint` | Exit 0; `user-lint.log` |
| `npm --prefix apps/frontend-admin run lint` | Exit 0; `admin-lint.log` |
| `npm --prefix apps/frontend-user run build -- --outDir D:/Koupreng-invitation_project/output/playwright/phase01-audit-20261110/user-build` | Exit 0, 34.81s; existing dist untouched |
| `npm --prefix apps/frontend-admin run build -- --outDir D:/Koupreng-invitation_project/output/playwright/phase01-audit-20261110/admin-build` | Exit 0, 28.53s; existing dist untouched |
| `& apps/backend/mvnw.cmd -f apps/backend/pom.xml -o test '-Dtest=ArchitectureRulesTests,*Payment*Test*,*Auth*Test*,CookieCsrfSecurityTests'` | **154 discovered, 145 pass, 9 skip**, zero failures/errors, ~1m26s |
| `& apps/backend/mvnw.cmd -f apps/backend/pom.xml -o test` | **680 discovered, 598 pass, 82 skip**, zero failures/errors, ~2m24s; 122 suite XML files summarized in `backend-suites.json` |
| `python -m pytest apps/telegram-bot/tests -q -p no:cacheprovider` | BLOCKED, exit 1: `No module named pytest`; no dependency installed |
| `npm --prefix apps/frontend-user audit --json`; same admin command | Exit 1, four moderate development entries each |
| `npm --prefix apps/frontend-user audit --omit=dev --json`; same admin command | Exit 0, zero reported production advisories each |
| `node docs/audits/phase01-2026-11-10/evidence/browser-audit.mjs routes` | 270 probes: 261 PASS, 9 assertion FAIL; process exit 0 means harness completed, not that every probe passed |
| Same harness `widths` | 158 probes: 143 PASS, 15 assertion FAIL |
| Same harness `engines` | 56 probes: 54 PASS, 2 assertion FAIL; Firefox and WebKit launch successfully |
| `node docs/audits/phase01-2026-11-10/evidence/interaction-probe.mjs` | 12 detailed screenshots/control snapshots |
| `node docs/audits/phase01-2026-11-10/evidence/responsive-followup.mjs` | Nine control-switch/tap checks pass; admin layout/resize failure reproduced in all three engines |
| `node docs/audits/phase01-2026-11-10/evidence/performance-lab.mjs` | Three measured diagnostic route samples; not Lighthouse |

Browser commands actually run:

```powershell
node apps/frontend-user/node_modules/vite/bin/vite.js preview apps/frontend-user --host 127.0.0.1 --port 4173 --strictPort --outDir D:/Koupreng-invitation_project/output/playwright/phase01-audit-20261110/user-build
node apps/frontend-admin/node_modules/vite/bin/vite.js preview apps/frontend-admin --host 127.0.0.1 --port 4174 --strictPort --outDir D:/Koupreng-invitation_project/output/playwright/phase01-audit-20261110/admin-build

node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.config.js phase2-intent.spec.js phase2-studio.spec.js phase2-operations.spec.js phase2-payment.spec.js --project desktop-chromium --project mobile-chromium --workers 2 --output output/playwright/phase01-audit-20261110/journeys

node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.config.js batch12-core-hardening.spec.js batch12-security-journeys.spec.js phase7-auth-accessibility.spec.js phase8-functional.spec.js --project desktop-chromium --project mobile-chromium --workers 2 --output output/playwright/phase01-audit-20261110/regression

# Resolve the actual default preview origin; no build/env/source edit.
node apps/frontend-user/node_modules/vite/bin/vite.js preview apps/frontend-user --host localhost --port 5173 --strictPort --outDir D:/Koupreng-invitation_project/output/playwright/phase01-audit-20261110/user-build
node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.config.js batch12-core-hardening.spec.js --grep 'template save roundtrip' --project desktop-chromium --project mobile-chromium --workers 1 --output output/playwright/phase01-audit-20261110/preview-origin-retest
```

The first journey run: **12/12 pass, 55.3s**. Additional regression: **48 pass, four fail, 4.1m**. Preview-origin retest: **2/2 pass, 10.1s**. The remaining two failures are automation stability waits on the moving opening CTA. An additional `node --input-type=module` probe used `phase8Fixtures`, a physical coordinate tap, `/i/review-celestial`, 390×844, and both motion preferences: **six passes across Chromium/Firefox/WebKit**, recorded in `public-tap.json`. These follow-ups explain the failed run; they do not rewrite its result as a clean run. Full config-harmonized regression remains backlog work.

Inspection also used `rg --files`, focused `rg -n` queries, `Get-Content`, `Get-NetTCPConnection`, Python metadata/checksum extraction and public GitHub metadata HTTP reads. The full source inventory is not an exhaustive semantic review. Exploratory `Get-Content` calls to nonexistent `src/App.jsx` paths and several guessed feature names failed; actual app entrypoints were then found with `rg`. Several PowerShell path-glob searches failed with Windows error 123 and were replaced with directory searches/`-g` filters. The first custom harness import failed with `ERR_UNSUPPORTED_ESM_URL_SCHEME`; it was corrected with `pathToFileURL` before results were collected. These discovery failures were not product defects.

On stopping the preview servers, Vite retained one failed read-only `/api/v1/public/packages` proxy request to absent `127.0.0.1:8080` from the earlier browser work. This confirms that fixture isolation is not universally complete across all legacy tests; it is an environment/test-harness limit, not proof of a broken production packages endpoint. No real backend was listening. All three audit-owned preview servers were stopped with Ctrl+C after evidence collection.

Backend tests regenerated ten tracked `output/admin-reporting/*` samples. Since the starting tree was clean, only those audit-generated modifications were restored using `git restore -- $generatedReportPaths`, constrained to that directory. Source, migrations, lockfiles and teammates' work remain unchanged. New artifacts are audit documents/evidence plus the separate audit build/screenshot/trace directory.

## Release limits

The 82 backend skips are recorded by class/reason in `backend-suites.json`: missing `RUN_FLYWAY_INTEGRATION`, `RUN_PHASE7_MYSQL`, `PHASE6_DEMO_PROVISION` or `RUN_RSVP_PERFORMANCE` disposable-environment flags. H2 and mocked tests passing do not validate MySQL migrations, row locks or collation. Docker was not started and no existing database was used. Run controlled schema/upgrade/concurrency gates in an isolated provisioned environment before production approval.
