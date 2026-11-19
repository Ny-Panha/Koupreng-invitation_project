# Exact commands, failures and limitations

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

[test-command-results.json](evidence/test-command-results.json) is the complete recorded run ledger with source fingerprints, timestamps, environment overrides and local logs. Parallel runner entries also have individual runs/*.json files. Commands below actually executed; later passes never erase earlier failures.


| ID | Exact child command | Environment | Actual result |
| --- | --- | --- | --- |
| baseline-auth | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/` | {} | exit 0; Test Files  9 passed (9); Tests  63 passed (63); 4.22s |
| baseline-build-user | `npm.cmd --prefix apps/frontend-user run build` | {} | exit 0;     240.38 kB │ gzip:  62.87 kB dist/assets/index-7DrRKlSW.js                                            474.52 kB │ gzip: 141.26 kB  ✓ built in 1.33s; 3.92s |
| baseline-e2e | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line` | {} | exit 0; 18 passed (16.6s); 19.19s |
| negative-first | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/Phase08Regression.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  14 failed / 2 passed (16); 9.15s |
| baseline-capture | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/capture.mjs before` | {} | exit 0; {"stage":"before","captures":24,"samples":18,"geometry":0,"overflows":0,"axeScans":0,"axeViolations":0}; 32.93s |
| repaired-auth | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/` | {} | exit 1; Test Files  3 failed / 7 passed (10); Tests  4 failed / 75 passed (79); 4.98s |
| repaired-auth-2 | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/` | {} | exit 0; Test Files  10 passed (10); Tests  79 passed (79); 4.5s |
| negative-provider | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/components/SocialAuthButtons.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  1 failed / 5 passed (6); 3.58s |
| final-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | {} | exit 0; TemplateEditPage-Dz5C8UnR.js   238.29 kB │ gzip: 56.41 kB dist/assets/index-BXKZt7ze.js                   285.33 kB │ gzip: 90.66 kB  ✓ built in 5.04s; 8.97s |
| final-user-build | `npm.cmd --prefix apps/frontend-user run build` | {} | exit 0;    240.41 kB │ gzip:  62.89 kB dist/assets/index-uSDpF5y1.js                                            472.35 kB │ gzip: 140.51 kB  ✓ built in 11.74s; 15.39s |
| final-admin-unit | `npm.cmd --prefix apps/frontend-admin test` | {} | exit 0; Test Files  37 passed (37); Tests  202 passed (202); 15.61s |
| final-user-unit | `npm.cmd --prefix apps/frontend-user test` | {} | exit 1; Test Files  1 failed / 224 passed (225); Tests  1 failed / 1541 passed (1542); 41.78s |
| codex-browser-initial | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-codex-regression.spec.js --workers=2 --reporter=line` | {} | exit 1; 15 failed; 21 passed (27.2s); 30.95s |
| final-auth | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/ src/stores/useAuthStore.test.js src/shared/storage/authStorage.test.js src/app/providers/AuthProvider.test.jsx src/app/guards/RequireAuth.test.jsx` | {} | exit 0; Test Files  13 passed (13); Tests  94 passed (94); 4.28s |
| token-parity | `node scripts/sync-design-tokens.cjs --check` | {} | exit 0; Verified 2 application token exports.; 2.39s |
| admin-lint | `npm.cmd --prefix apps/frontend-admin run lint` | {} | exit 0; > frontend-admin@0.0.0 lint > eslint .; 9.92s |
| inventory-admin | `npm.cmd --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx` | {} | exit 0; Test Files  1 passed (1); Tests  2 passed (2); 4.02s |
| inventory-user | `npm.cmd --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx` | {} | exit 0; Test Files  1 passed (1); Tests  2 passed (2); 4.48s |
| user-lint | `npm.cmd --prefix apps/frontend-user run lint` | {} | exit 1; ct\apps\frontend-user\tests\e2e\phase08-codex-regression.spec.js   79:107  error  'Buffer' is not defined  no-undef  ✖ 1 problem (1 error, 0 warnings); 34.13s |
| user-build-2 | `npm.cmd --prefix apps/frontend-user run build` | {} | exit 0;     240.41 kB │ gzip:  62.89 kB dist/assets/index-DdhSe4wB.js                                            472.35 kB │ gzip: 140.51 kB  ✓ built in 7.90s; 11.4s |
| user-unit-2 | `npm.cmd --prefix apps/frontend-user test` | {} | exit 0; Test Files  225 passed (225); Tests  1542 passed (1542); 42.31s |
| backend-auth-wrapper | `D:\Koupreng-invitation_project\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=AccountServiceTests,AuthServiceTests,ArchitectureRulesTests` | {} | exit 0; Tests run: 22, Failures: 0, Errors: 0, Skipped: 0; Tests run: 5, Failures: 0, Errors: 0, Skipped: 0; Tests run: 29, Failures: 0, Errors: 0, Skipped: 0; 48.89s |
| user-lint-2 | `npm.cmd --prefix apps/frontend-user run lint` | {} | exit 0; > frontend-user@0.0.0 lint > eslint .; 40.0s |
| phase08-final | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js tests/e2e/phase08-codex-regression.spec.js --workers=2 --reporter=line` | {} | exit 0; 54 passed (30.0s); 33.07s |
| auth-expanded | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/` | {} | exit 0; Test Files  10 passed (10); Tests  92 passed (92); 5.76s |
| historical-auth | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase7-auth-accessibility.spec.js tests/e2e/batch11-auth-boundaries.spec.js --workers=2 --reporter=line` | {} | exit 0; 20 passed (14.5s); 17.33s |
| user-unit-final | `npm.cmd --prefix apps/frontend-user test` | {} | exit 0; Test Files  225 passed (225); Tests  1554 passed (1554); 52.02s |
| phase04-06-controlled | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line` | {} | exit 1; 2 failed; 66 passed (1.7m); 104.31s |
| final-store-and-auth | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/ src/stores/useAuthStore.test.js src/shared/storage/authStorage.test.js src/app/providers/AuthProvider.test.jsx` | {} | exit 0; Test Files  12 passed (12); Tests  104 passed (104); 7.76s |
| phase02-known-red | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line` | {} | exit 1; 6 failed; 26 passed (56.6s); 59.5s |
| controlled-user-build | `npm.cmd --prefix apps/frontend-user run build` | {'VITE_PUBLIC_APP_URL': 'http://127.0.0.1:4173'} | exit 0;    240.41 kB │ gzip:  62.89 kB dist/assets/index-xLY6UC3h.js                                            472.35 kB │ gzip: 140.51 kB  ✓ built in 31.46s; 36.79s |
| controlled-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | {'VITE_PUBLIC_APP_URL': 'http://127.0.0.1:4173'} | exit 0; emplateEditPage-Dz5C8UnR.js   238.29 kB │ gzip: 56.41 kB dist/assets/index-BXKZt7ze.js                   285.33 kB │ gzip: 90.66 kB  ✓ built in 29.07s; 43.59s |
| final-user-all | `npm.cmd --prefix apps/frontend-user test` | {} | exit 0; Test Files  225 passed (225); Tests  1555 passed (1555); 53.41s |
| final-lint | `npm.cmd --prefix apps/frontend-user run lint` | {} | exit 0; > frontend-user@0.0.0 lint > eslint .; 77.51s |
| final-browser-capture | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/capture.mjs after` | {} | exit 1;     - element is not enabled',      '     - retrying click action',      '       - waiting 500ms'    ],    name: 'TimeoutError'  }    Node.js v26.12.1; 59.91s |
| final-browser-capture-2 | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/capture.mjs after after-final` | {} | exit 0; {"stage":"after","captures":48,"samples":18,"geometry":312,"overflows":0,"axeScans":49,"axeViolations":16}; 54.81s |
| collect-inventory | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/inventory.mjs` | {} | exit 0; s":135,"groups":62,"pairs":63,"builds":{"user":{"raw":4217115,"gzip":1200005,"brotli":1017091},"admin":{"raw":1354713,"gzip":343923,"brotli":289677}}}; 7.87s |
| contrast-user-build | `npm.cmd --prefix apps/frontend-user run build` | {'VITE_PUBLIC_APP_URL': 'http://127.0.0.1:4173'} | exit 0;     240.41 kB │ gzip:  62.89 kB dist/assets/index--n0FYn-8.js                                            472.35 kB │ gzip: 140.52 kB  ✓ built in 1.35s; 4.04s |
| contrast-final-capture | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/capture.mjs after after-contrast-final` | {} | exit 0; {"stage":"after","captures":48,"samples":18,"geometry":312,"overflows":0,"axeScans":49,"axeViolations":1}; 54.99s |
| negative-registration-dto | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/RegisterFeature.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  1 failed / 16 passed (17); 4.79s |
| final-controlled-regressions | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js tests/e2e/phase08-codex-regression.spec.js tests/e2e/phase7-auth-accessibility.spec.js tests/e2e/batch11-auth-boundaries.spec.js tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line` | {} | exit 1; 2 failed; 142 passed (2.0m); 122.36s |
| phase06-six-project | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase06.config.js --workers=2 --reporter=line` | {} | exit 1; 6 failed; 126 passed (3.9m); 234.64s |
| negative-profile-account-switch | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/Phase08Regression.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  1 failed / 28 passed (29); 5.74s |
| phase07-six-project | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase07.config.js --workers=2 --reporter=line` | {} | exit 0; 252 passed (4.3m); 263.72s |
| negative-reset-replacement | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/ResetPasswordFeature.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  1 failed / 6 passed (7); 5.97s |
| phase08-six-project | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase08.config.js --workers=2 --reporter=line` | {} | exit 0; 168 passed (2.5m); 155.08s |
| correct-admin-preview-origin | `npm.cmd --prefix apps/frontend-admin run build` | {'VITE_USER_APP_URL': 'http://127.0.0.1:4173'} | exit 0;   - plugin @tailwindcss/vite:generate:build transform (7 calls) See https://rolldown.rs/reference/InputOptions.checks#bundlertimings for more details.; 19.9s |
| route-content-sweep | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/batch12-route-content.spec.js --workers=2 --reporter=line` | {} | exit 0; 270 passed (2.4m); 149.22s |
| phase04-06-default-workers | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --reporter=line` | {} | exit 0; 68 passed (58.4s); 62.44s |
| negative-sensitive-account-races | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/Phase08Regression.test.jsx` | {} | exit 1; Test Files  1 failed (1); Tests  3 failed / 28 passed (31); 27.26s |
| final-sensitive-regressions | `npm.cmd --prefix apps/frontend-user test -- src/features/auth/ src/stores/useAuthStore.test.js src/app/guards/RequireAuth.test.jsx src/app/providers/AuthProvider.test.jsx src/shared/storage/authStorage.test.js` | {} | exit 0; Test Files  13 passed (13); Tests  114 passed (114); 6.19s |
| delivery-user-build | `npm.cmd --prefix apps/frontend-user run build` | {'VITE_PUBLIC_APP_URL': 'http://127.0.0.1:4173'} | exit 0; :asset load (3 calls)   - plugin vite:css transform (108 calls) See https://rolldown.rs/reference/InputOptions.checks#bundlertimings for more details.; 50.8s |
| final-user-delivery | `npm.cmd --prefix apps/frontend-user test` | {} | exit 0; Test Files  225 passed (225); Tests  1562 passed (1562); 65.32s |
| delivery-admin-unit | `npm.cmd --prefix apps/frontend-admin test` | {} | exit 0; Test Files  37 passed (37); Tests  202 passed (202); 78.75s |
| delivery-tokens | `node scripts/sync-design-tokens.cjs --check` | {} | exit 0; Verified 2 application token exports.; 3.33s |
| delivery-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | {} | exit 0; > frontend-user@0.0.0 lint > eslint .; 106.75s |
| delivery-capture | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/capture.mjs after after-delivery` | {} | exit 0; {"stage":"after","captures":50,"samples":18,"geometry":312,"overflows":0,"axeScans":49,"axeViolations":1}; 56.81s |
| delivery-controlled | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js tests/e2e/phase08-codex-regression.spec.js tests/e2e/phase7-auth-accessibility.spec.js tests/e2e/batch11-auth-boundaries.spec.js tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line` | {} | exit 0; 144 passed (1.8m); 108.06s |
| delivery-inventory | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/inventory.mjs` | {} | exit 0; s":135,"groups":62,"pairs":63,"builds":{"user":{"raw":4218304,"gzip":1200235,"brotli":1016723},"admin":{"raw":1354713,"gzip":343885,"brotli":289666}}}; 16.77s |
| delivery-diff-check | `git diff --check` | {} | exit 0; ning: in the working copy of 'apps/frontend-user/src/layouts/components/MarketingChrome.css', CRLF will be replaced by LF the next time Git touches it; 6.39s |
| delivery-phase06-six | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase06.config.js --workers=2 --reporter=line` | {} | exit 0; 132 passed (3.3m); 201.16s |
| delivery-phase07-six | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase07.config.js --workers=2 --reporter=line` | {} | exit 0; 252 passed (6.0m); 363.84s |
| delivery-phase08-six | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase08.config.js --workers=2 --reporter=line` | {} | exit 0; 168 passed (3.2m); 196.28s |
| delivery-routes | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/batch12-route-content.spec.js --workers=2 --reporter=line` | {} | exit 0; 270 passed (2.5m); 155.38s |
| delivery-registry-inventory | `node docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/inventory.mjs` | {} | exit 0; s":135,"groups":62,"pairs":63,"builds":{"user":{"raw":4218304,"gzip":1200235,"brotli":1016723},"admin":{"raw":1354713,"gzip":343885,"brotli":289666}}}; 21.65s |
| delivery-phase02 | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line` | {} | exit 1; 6 failed; 26 passed (1.0m); 64.87s |
| delivery-default | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --reporter=line` | {} | exit 0; 68 passed (59.1s); 62.93s |
| password-encoder-probe | `python docs/uxui/phase08-codex-identity-account-audit-2026-11-18/evidence/probe_encoder.py` | {} | exit 0; sword cannot be more than 72 bytes"], "stderr": "", "source": "apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java:312"}; 37.27s |


Failure classification: negative-first and negative-provider are intentional pre-repair contracts; repaired-auth failures identified obsolete Gemini privacy/delivery expectations plus a multi-status selector; final-user-unit had a new happy-dom script-node timing assumption, corrected using captured appended nodes; codex-browser-initial had ambiguous alert locators plus the real alias loss; user-lint flagged the missing node:buffer import. First final capture used an English-only token label in Khmer, corrected by a locale-independent control selector without changing product behavior. Initial Phase04–06 had exactly two preview URL-origin mismatches. Phase02 retains original six known red assertions; no assertion or copy was weakened.

Additional attempted tooling: Maven was absent from PATH; initial wrapper invocation had a PowerShell comma parse error and relative executable resolution error. Absolute repository mvnw.cmd succeeded29 tests. Python Brotli import was unavailable; Node built-in zlib generated the exact inventory instead. No package was installed to bypass these limits. Read-only guessed-path/PowerShell-brace searches were corrected. Full backend/payment suites, live DB/provider tests and physical/native/field tests were not run. Unit harness logs include expected disabled external-resource warnings/localhost connection refusals; exit/count evidence distinguishes these from failing assertions.

Additional reconciliation: VITE_PUBLIC_APP_URL is the social/public app origin, whereas admin Studio preview links use VITE_USER_APP_URL. The first purported controlled builds set only the former, so their 142/144 and 126/132 failures remain failed, attributable to the traced localhost:5173 target. correct-admin-preview-origin rebuilt only ignored admin assets with VITE_USER_APP_URL=http://127.0.0.1:4173; no runtime source/preview trust policy was altered. Subsequent run IDs are separate evidence.

Negative-registration-dto reproduced the Uppercase-versus-Lu mismatch. Negative-profile-account-switch and negative-sensitive-account-races reproduced a stale update/new-account logout; negative-reset-replacement reproduced a malformed-link dead end. These contracts pass in final-sensitive-regressions (114 tests), then the full final suite.

The first package validation failed because Python wrote the generated reverse patch with Windows CRLF. The generator now explicitly emits LF; the review-only reverse check passes after regeneration. No reverse patch was applied. One initial default-worker process sample was taken 1.5 seconds after completion and is labeled post-run; delivery-default-resources.json provides actual in-run process aggregate samples when available. Cumulative process CPU and working set are diagnostics, not application performance metrics.


| Final command ID | Actual outcome |
| --- | --- |
| final-user-delivery | exit 0; Test Files  225 passed (225); Tests  1562 passed (1562); 65.32s |
| delivery-admin-unit | exit 0; Test Files  37 passed (37); Tests  202 passed (202); 78.75s |
| delivery-user-lint | exit 0; > frontend-user@0.0.0 lint > eslint .; 106.75s |
| admin-lint | exit 0; > frontend-admin@0.0.0 lint > eslint .; 9.92s |
| delivery-tokens | exit 0; Verified 2 application token exports.; 3.33s |
| delivery-user-build | exit 0; :asset load (3 calls)   - plugin vite:css transform (108 calls) See https://rolldown.rs/reference/InputOptions.checks#bundlertimings for more details.; 50.8s |
| correct-admin-preview-origin | exit 0;   - plugin @tailwindcss/vite:generate:build transform (7 calls) See https://rolldown.rs/reference/InputOptions.checks#bundlertimings for more details.; 19.9s |
| backend-auth-wrapper | exit 0; Tests run: 22, Failures: 0, Errors: 0, Skipped: 0; Tests run: 5, Failures: 0, Errors: 0, Skipped: 0; Tests run: 29, Failures: 0, Errors: 0, Skipped: 0; 48.89s |
| delivery-controlled | exit 0; 144 passed (1.8m); 108.06s |
| delivery-phase06-six | exit 0; 132 passed (3.3m); 201.16s |
| delivery-phase07-six | exit 0; 252 passed (6.0m); 363.84s |
| delivery-phase08-six | exit 0; 168 passed (3.2m); 196.28s |
| delivery-routes | exit 0; 270 passed (2.5m); 155.38s |
| delivery-phase02 | exit 1; 6 failed; 26 passed (1.0m); 64.87s |
| delivery-default | exit 0; 68 passed (59.1s); 62.93s |

Early trace limitation: the initial baseline browser run and codex-browser-initial preceded the wrapper artifact-archiving enhancement. Their command output, before source hashes and visual baseline survive, but those original transient test-results traces were not archived before later runs replaced that directory. Their logged trace paths are historical output, not current artifact links. All subsequent browser run IDs archive artifacts separately. No missing trace was recreated or represented as preserved.

The final default-worker run passed68/68 with six in-run process samples. The standalone encoder probe overlapped part of that run; this is not an isolated host capacity benchmark and does not close the historical reliability gate.
