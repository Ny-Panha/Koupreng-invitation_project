# Final QA/QC results

Results are per invocation; overlapping runs are not summed. [Machine command results](evidence/test-results.json), [MySQL outcomes](evidence/mysql-results.json) and browser evidence provide the detailed record.

| Gate | Commands actually run | Result |
|---|---|---|
| Each frontend lint/build | `npm --prefix apps/frontend-user run lint`; same for admin; `run build` in both | PASS |
| Customer units | `npm --prefix apps/frontend-user run test -- --maxWorkers=2` | 1324 passes / 186 files |
| Admin units | `npm --prefix apps/frontend-admin run test -- --maxWorkers=2` | 191 passes / 33 files |
| Each app usage checks | `run analyze:knip`; `run analyze:deps` with each app prefix | PASS |
| Full backend | `apps/backend/mvnw.cmd -f apps/backend/pom.xml -B verify` | 680 discovered, 598 passed, 82 opt-in skipped, zero failures/errors; JaCoCo/SpotBugs/PMD PASS |
| Backend usage | Same wrapper/POM with `-B dependency:analyze` | PASS with reflective/starter dependency warnings |
| Final browsers | `npx --prefix apps/frontend-user playwright test --config=apps/frontend-user/playwright.batch12.config.js` | 174 passes; zero skip/retry |
| Retained browser suites | `npm --prefix apps/frontend-user run test:e2e -- --workers=2` with critical-routes, guest-workspace, studio-tickets and the five selected Batch11 suites | 87 passes, one intentional mobile duplicate skip |
| Owned MySQL and real browser | `python scripts/qa/run-studio-access-mysql.py --tests <19 classes in machine evidence> --label batch12-final-integrity --browser` | 74 passes, five media setup errors, three provisioning skips |
| Media rerun | Same harness, `--tests Phase9MediaMySqlTests --label batch12-media-final` | Five passes; owned schema removed |
| RSVP load | Same owned harness with `RUN_RSVP_PERFORMANCE=true`, MySQLDialect override, performance class | One pass; separate historical/current experiment |
| Python | Venv `-m pytest`, Ruff, Bandit, compileall, pip check and pip-audit | 74 passes; zero lint/security findings; runtime/dev/installed audits clean |
| QA helpers | `node --test scripts/qa/*.test.mjs` | 18 passes |
| Tokens/routing | `node scripts/sync-design-tokens.cjs --check`; `python scripts/validate-agent-routing.py` | PASS |
| Compose | `docker compose config --quiet` | PASS; no daemon/image/runtime check |
| npm audits | `npm --prefix apps/frontend-user audit --json`; same for admin | Exit 1 each: four moderate dev findings; zero high/critical |
| Java audit | Configured dependency-security verify/direct goal; 13.0.0 and published 12.2.2 attempt | BLOCKED fresh report; policy unchanged |
| Secrets | `python .cache/batch12/run_final_secrets.py current`, `history`, `history-merge` | Current zero; history exit 1, strongest 58 records |
| Synthetic restore | `python .cache/batch12/backup_restore_drill.py` | PASS; Khmer/currency/hash parity; owned fixture dropped |
| Runtime samples | `node scripts/performance/batch12-browser.mjs before` and `after` | Raw samples retained; baseline Studio invalid for paired claims |
| Established public budget | `node scripts/performance/profile-public-invitation.mjs batch12-final --check-budget` | FAIL unchanged JS/CSS thresholds |

## Failures, reruns and limitations

Guest privacy, stale-profile/reset and logging regressions failed before their fixes. The first logging test invocation also needed a missing import corrected. Baseline backend verification passed 671 discovered/80 skipped; the final run passes 680/82. The additional two skips are opt-in regressions, not hidden successes.

The broad MySQL run discovered 82 cases: 74 passed, five media setup errors and three deliberately disabled demo-provisioning cases. The media tests previously accepted only historical isolated ports. Their guard now also accepts only the exact loopback/random-32-hex harness namespace. Five rerun passes give **79 unique exercised cases**, with three provisioning cases intentionally disabled. The real-browser opt-in inside Phase7 passed. Temporary credentials were removed and personalized traces/screenshots were disabled. Native RSVP performance is a separate one-test pass.

The Java security profile first failed on an invocation report-format collision, then PMD found two redundant qualified names; those were corrected and full verify passed. Vulnerability refresh remains blocked. No stale report is counted as passing. Node moderate findings and the asset budget failure remain explicit. Docker runtime checks were unavailable without a daemon.

Exploratory browser failures included selectors, sandboxed fixture storage and aborted external CSS, alongside real contrast/focus/name defects. Final engine tests pass without flaky retries. Unit suites retain happy-dom external-iframe warnings; Python retains one TestClient deprecation. A new lazy-fallback test initially used an exact text selector for a combined heading; its semantic heading assertion was corrected. An oversized documentation command hit Windows process-length limits; smaller file patches completed it.

The existing eleven CI jobs remain. Three-engine coverage is additive to the browser job, with immediate evidence upload before subsequent suites clear outputs. Local passing checks do not establish remote Actions success on the final commit.

The retained-suite first invocation ran from the repository root and could not resolve the QR decoder's app-local path (two failures); the correct app-directory invocation passes87with one intentional duplicate viewport skip. A separate14-case ticket rerun also passes. One exploratory concurrent browser run lost a trace when the other suite cleaned its parent output directory; final browser suites were executed sequentially. The expanded test helper's unused variable was removed after lint reported it. These setup failures are retained in local logs and are not treated as product passes.

The final template regression now asserts its authored heading inside the actual catalog-backed iframe. Verification builds set public `VITE_USER_APP_URL=http://127.0.0.1:4173`; no `.env` file was edited. The older static preview route could not render a catalog-only identity and was repaired. Production must supply its real public customer origin.

Exact worker command arguments and working directories are retained in [Python command evidence](evidence/python-command-results.json). CI YAML parses with the installed Node yaml package and retains eleven jobs; global Python PyYAML was unavailable.
