# 22 — exact test commands all runs known failures

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Each row below is an actual recorded command, with immutable raw log hash/path and timestamps in the [machine command ledger](evidence/exact-test-command-results.json). Expected pre-fix red tests, inherited failures and harness corrections remain visible. No missing command is represented as exit 0.

| Run | Actual command | Exit | Observed result | Seconds |
| --- | --- | --- | --- | --- |
| pre-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 4.347 |
| pre-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 0 | Test Files  10 passed (10) / Tests  56 passed (56) | 5.489 |
| red-codex | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/Phase11CodexRegression.test.jsx` | 1 | Test Files  1 failed (1) / Tests  6 failed / 7 passed (13) | 4.349 |
| pre-wizard-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-1.config.js tests/e2e/phase11-1-wizard.spec.js --workers=2` | 0 | 30 passed (39.7s) | 40.595 |
| green-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 1 | Test Files  1 failed / 10 passed (11) / Tests  1 failed / 68 passed (69) | 3.864 |
| repaired-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 0 | Test Files  11 passed (11) / Tests  69 passed (69) | 3.892 |
| before-focus-browser | `$env:PHASE11_STAGE=before; npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --grep validation` | 1 | 1 failed | 9.231 |
| before-focus-corrected | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --grep validation` | 1 | 1 failed | 8.858 |
| working-lint | `npm.cmd --prefix apps/frontend-user run lint` | 1 | exit 1 | 29.554 |
| ux-focus | `python .agents/skills/ui-ux-pro-max/scripts/search.py focus-not-obscured --domain ux` | 0 | exit 0 | 0.31 |
| ux-errors | `python .agents/skills/ui-ux-pro-max/scripts/search.py error-summary-validation --domain ux` | 0 | exit 0 | 0.242 |
| ux-disclosure | `python .agents/skills/ui-ux-pro-max/scripts/search.py progressive-disclosure --domain ux` | 0 | exit 0 | 0.241 |
| ux-khmer | `python .agents/skills/ui-ux-pro-max/scripts/search.py Khmer-diacritics --domain typography` | 0 | exit 0 | 0.253 |
| working-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.131 |
| ux-disclosure-retry | `python .agents/skills/ui-ux-pro-max/scripts/search.py 'form complexity' --domain ux` | 0 | exit 0 | 0.244 |
| after-browser-pilot | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --workers=2` | 1 | 2 failed / 2 passed (13.0s) | 13.866 |
| ux-khmer-retry | `python .agents/skills/ui-ux-pro-max/scripts/search.py 'Khmer' --domain typography` | 0 | exit 0 | 0.238 |
| safe-backend-contracts | `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml -Dtest=EventDraftPersistenceTests test` | 0 | [INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 | 25.525 |
| expanded-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 1 | Test Files  1 failed / 10 passed (11) / Tests  2 failed / 96 passed (98) | 6.406 |
| expanded-repaired | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 0 | Test Files  11 passed (11) / Tests  98 passed (98) | 4.676 |
| pilot-build2 | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.065 |
| after-browser-pilot2 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --workers=2` | 1 | 1 failed / 3 passed (15.2s) | 16.008 |
| red-maps-contract | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/Phase11CodexRegression.test.jsx` | 1 | Test Files  1 failed (1) / Tests  3 failed / 42 passed (45) | 3.116 |
| pilot-build3 | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.075 |
| after-browser-pilot3 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --workers=2` | 1 | 1 failed / 3 passed (15.7s) | 16.628 |
| revised-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 0 | Test Files  11 passed (11) / Tests  101 passed (101) | 4.729 |
| admin-build-working | `npm.cmd --prefix apps/frontend-admin run build` | 0 | exit 0 | 6.781 |
| pilot-build4 | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.355 |
| after-browser-pilot4 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --workers=2` | 0 | 4 passed (17.5s) | 18.279 |
| head-build | `npm.cmd --prefix output/playwright/phase11-codex-2026-11-19/reconstructed-head/apps/frontend-user run build` | 0 | exit 0 | 2.667 |
| gemini-reconstructed-build | `npm.cmd --prefix output/playwright/phase11-codex-2026-11-19/reconstructed-gemini/apps/frontend-user run build` | 0 | exit 0 | 2.572 |
| guest-ci-reproduction | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/guest-workspace.spec.js --grep intersect --workers=2` | 1 | 2 failed | 9.33 |
| forensic-final-base | `git status --porcelain=v1 -uall` | 0 | exit 0 | 0.196 |
| remote-main | `git ls-remote origin refs/heads/main` | 0 | exit 0 | 1.838 |
| node-version | `node --version` | 0 | exit 0 | 0.34 |
| npm-version | `npm.cmd --version` | 0 | exit 0 | 0.599 |
| final-user-tests | `npm.cmd --prefix apps/frontend-user test` | 0 | Test Files  236 passed (236) / Tests  1746 passed (1746) | 38.162 |
| final-admin-tests | `npm.cmd --prefix apps/frontend-admin test` | 0 | Test Files  37 passed (37) / Tests  202 passed (202) | 21.736 |
| final-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | exit 0 | 30.325 |
| final-admin-lint | `npm.cmd --prefix apps/frontend-admin run lint` | 0 | exit 0 | 16.111 |
| final-tokens | `node scripts/sync-design-tokens.cjs --check` | 0 | exit 0 | 0.184 |
| final-user-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.345 |
| final-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | 0 | exit 0 | 1.155 |
| expanded-browser-pilot | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --workers=2` | 1 | 1 failed / 5 passed (28.0s) | 28.745 |
| denied-browser-corrected | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-393 --grep denied --workers=2` | 0 | 1 passed (4.2s) | 5.079 |
| controlled-all-engines | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --workers=2` | 1 | 4 failed / 50 passed (3.6m) | 216.009 |
| historical-phase11 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-history-codex.config.js --workers=2` | 0 | 14 skipped / 88 passed (3.8m) | 229.11 |
| cross-phase10 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase10-codex.config.js --workers=2` | 0 | 65 skipped / 115 passed (5.8m) | 351.681 |
| red-deferred-credentials | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/Phase11RequestAuthority.test.jsx` | 1 | Test Files  1 failed (1) / Tests  1 failed (1) | 26.307 |
| cross-phase09 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js --workers=2` | 0 | 42 passed (36.6s) | 37.49 |
| authority-repaired-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 1 | Test Files  1 failed / 11 passed (12) / Tests  1 failed / 101 passed (102) | 8.154 |
| cross-phase08 | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2` | 0 | 18 passed (16.9s) | 17.795 |
| fixed-authority-onboarding | `npm.cmd --prefix apps/frontend-user test -- src/features/events/onboarding/` | 0 | Test Files  12 passed (12) / Tests  102 passed (102) | 6.325 |
| authority-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 11.163 |
| cross-phase02 | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2` | 1 | 7 failed / 25 passed (1.0m) | 61.744 |
| final-all-engines | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --workers=2` | 1 | 4 failed / 50 passed (2.9m) | 174.754 |
| frozen-user-tests | `npm.cmd --prefix apps/frontend-user test` | 0 | Test Files  237 passed (237) / Tests  1748 passed (1748) | 47.173 |
| frozen-admin-tests | `npm.cmd --prefix apps/frontend-admin test` | 0 | Test Files  37 passed (37) / Tests  202 passed (202) | 21.749 |
| frozen-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | exit 0 | 39.862 |
| frozen-admin-lint | `npm.cmd --prefix apps/frontend-admin run lint` | 0 | exit 0 | 6.795 |
| frozen-token-check | `node scripts/sync-design-tokens.cjs --check` | 0 | exit 0 | 0.209 |
| final-css-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.813 |
| frozen-user-build | `npm.cmd --prefix apps/frontend-user run build` | 1 | exit 1 | 2.064 |
| frozen-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | 0 | exit 0 | 1.869 |
| final54-controlled | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --workers=2` | 0 | 54 passed (2.1m) | 128.32 |
| default54 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js` | 0 | 54 passed (2.7m) | 165.307 |
| delivery-user-tests | `npm.cmd --prefix apps/frontend-user test` | 0 | Test Files  237 passed (237) / Tests  1748 passed (1748) | 49.81 |
| delivery-admin-tests | `npm.cmd --prefix apps/frontend-admin test` | 0 | Test Files  37 passed (37) / Tests  202 passed (202) | 7.633 |
| delivery-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | exit 0 | 46.943 |
| delivery-admin-lint | `npm.cmd --prefix apps/frontend-admin run lint` | 0 | exit 0 | 10.871 |
| delivery-tokens | `node scripts/sync-design-tokens.cjs --check` | 0 | exit 0 | 0.312 |
| reliability-repeat2 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-320 --grep 'loaded bilingual' --repeat-each=2 --workers=2` | 0 | 2 passed (10.5s) | 11.361 |
| upstream-controlled-final | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-1.config.js tests/e2e/phase11-1-wizard.spec.js --workers=2` | 0 | 30 passed (37.2s) | 38.079 |
| upstream-default-final | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-1.config.js tests/e2e/phase11-1-wizard.spec.js` | 0 | 30 passed (1.0m) | 62.823 |
| performance-runtime | `node ../../output/playwright/phase11-codex-2026-11-19/historical/performance.mjs` | 0 | exit 0 | 15.54 |
| rollback-dry-run | `git apply --reverse --check output/playwright/phase11-codex-2026-11-19/codex-only.patch` | 0 | exit 0 | 0.214 |
| final-assets-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | exit 0 | 2.263 |
| complete-build54-controlled | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --workers=2` | 0 | 54 passed (2.1m) | 125.882 |
| complete-build54-default | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js` | 0 | 54 passed (2.1m) | 127.333 |
| remote-main-resumed | `git ls-remote origin refs/heads/main` | 0 | exit 0 | 1.521 |
| performance-runtime-complete | `node ../../output/playwright/phase11-codex-2026-11-19/historical/performance.mjs` | 0 | exit 0 | 20.259 |
| asset-response-final | `node output/playwright/phase11-codex-2026-11-19/historical/branding.mjs` | 0 | exit 0 | 10.289 |
| complete-repeat-a | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-320 --grep 'loaded bilingual' --workers=2` | 0 | 1 passed (11.3s) | 14.538 |
| complete-repeat-b | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config playwright.phase11-codex.config.js --project=chromium-320 --grep 'loaded bilingual' --workers=2` | 0 | 1 passed (11.0s) | 11.915 |
| delivery-diff-check | `git diff --check` | 0 | exit 0 | 0.225 |
| evidence-integrity-final | `python scripts/validate_phase11_codex_evidence.py` | 0 | exit 0 | 2.948 |
| rollback-dry-run-final | `git apply --reverse --check output/playwright/phase11-codex-2026-11-19/codex-only.patch` | 0 | exit 0 | 0.231 |
| java-version | `java --version` | 0 | exit 0 | 0.289 |
| final-integrity-delivery | `$env:PYTHONIOENCODING='utf-8'; @' from pathlib import Path import json,hashlib,subprocess root=Path.cwd();out=root/'output/playwright/phase11-codex-2026-11-19' f=json.loads((out/'frozen-source.json').read_text(encoding='utf-8')) errors=[] for group,base in [('source',root),('build',root/'apps/frontend-user/dist')]:  for row in f[group]:   p=base/row['path']   if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append(row['path']) print(json.dumps({'sourceSHA':f['sourceSHA'],'buildSHA':f['buildSHA'],'checkedSourceFiles':len(f['source']),'checkedBuildFiles':len(f['build']),'drift':errors},ensure_ascii=False)) assert not errors status=subprocess.check_output(['git','status','--porcelain=v1','-uall'],text=True,encoding='utf-8').splitlines() print('Tracked modified:',sum(not r.startswith('??') for r in status),'Untracked files:',sum(r.startswith('??') for r in status)) print('Staged paths:',subprocess.check_output(['git','diff','--cached','--name-only'],text=True).strip() or '(none)') for label,args in [('Branch',['branch','--show-current']),('HEAD',['rev-parse','HEAD']),('origin/main',['rev-parse','origin/main']),('remote main',['ls-remote','origin','refs/heads/main'])]:  print(label+':',subprocess.check_output(['git',*args],text=True).strip()) r=root/'docs/uxui/phase11-codex-event-creation-audit-2026-11-19/evidence' a=json.loads((r/'attributed-changes-rollback.json').read_text(encoding='utf-8')) print('Attributed source/test/config/tool paths:',len(a['records']),'Inherited byte-identical:',a['inheritedUnchangedCount'],'Protected changed:',a['protectedChanged']) print('Final gate counts:',json.loads((r/'f11-independent-40-gates.json').read_text(encoding='utf-8'))['counts']) print('Integrity diagnostic correction: build manifest paths are relative to apps/frontend-user/dist, not repository root. Prior ad hoc check used the wrong base; no file drift was established by that diagnostic.') '@ / python -` | 0 | exit 0 | 2.256 |
| delivery-final-diff-check | `git diff --check` | 0 | exit 0 | 0.217 |
| delivery-final-rollback-dryrun | `git apply --reverse --check output/playwright/phase11-codex-2026-11-19/codex-only.patch` | 0 | exit 0 | 0.205 |
| delivery-final-evidence-validation | `python scripts/validate_phase11_codex_evidence.py` | 0 | exit 0 | 0.61 |

The full user/admin suites are distinguished from onboarding subsets. Unit output includes blocked iframe-loading diagnostics and admin localhost:3000 ECONNREFUSED warnings even when tests pass; “zero warnings” is not claimed. H2 emitted Redis-fallback warnings; it was not a live MySQL/provider probe. Early Windows wildcard rg errors were inspection failures, not test successes. Final report inspection also hit a `gates` versus `records` KeyError, an ad hoc integrity check initially used the wrong base for dist-relative build paths, and a nested PowerShell here-string wrapper failed to parse. Those assembly diagnostics do not establish source/build drift or a product-test regression; corrected `final-integrity-delivery` verifies all 825 source and 664 build hashes with no drift. No exit-0 result is assigned to the failed inspection snippets. Commands run from repository root unless the ledger states another workingDirectory; the runtime lab ran from apps/frontend-user.

Full backend release suite, true physical devices/native AT, live bank/Telegram/provider flows and disposable MySQL concurrency remain unrun. Source SHA links distinguish earlier trials from final runtime checks. Some old historical tests predate the final CSS/cancellation repair; source protection and final full unit/focused browser runs support preservation without relabeling those old runs as frozen-final.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
