# QA/QC execution ledger

All commands run from repository root on 2026-10-20. Generated rows and upgrade
schemas are isolated from existing data. No production operation is performed.

## Baseline and failed attempts

- `apps/backend/mvnw.cmd -f apps/backend/pom.xml test -Dtest=RsvpServiceTests,ArchitectureRulesTests -q`:
  15 tests passed before application edits (10 service, 5 architecture).
- `npm --prefix apps/frontend-user test` before frontend edits: 460 passed,
  7 failed across 3 files, 99.32 seconds, with unrestricted worker concurrency.
  Failures were timeouts/assertions in InvitationForm, TemplateExperience and
  KhmerCelestialLayout. A one-worker rerun of all three files passed all 52 tests
  in 16.77 seconds. The full after run uses two workers.
- Initial full MySQL-enabled Maven run: 518 tests, 0 assertion failures,
  17 errors, 1 skipped. Multiple cached Spring contexts exhausted the disposable
  MySQL instance's 40-connection limit. The new H2 repository tests also inherited
  the base MariaDB dialect; those two errors were corrected by explicitly setting
  `spring.jpa.properties.hibernate.dialect` to H2 in that test only. Full rerun
  bounds test pool sizes/context cache; production configuration is unchanged.
- Browser harness development initially selected the wrong cover class and blocked
  imported external stylesheets in a way that rejected CSS preload. The corrected
  harness uses `.sh-cover`, deterministic empty external stylesheet responses and
  DOM-ready navigation. Those failed harness runs are not performance samples.

## Verified frontend/worker checks

| Command | Result |
| --- | --- |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | 467 passed, 88 files, 54.21 seconds |
| `npm --prefix apps/frontend-admin test -- --maxWorkers=2` | 79 passed, 16 files, 22.62 seconds |
| `python -m pytest apps/telegram-bot/tests -q` | 72 passed, 2 dependency deprecation warnings, 2.02 seconds |
| `npm --prefix apps/frontend-user run build` | Passed; existing missing golden cover SVG build warning remains |
| `npm --prefix apps/frontend-admin run build` | Passed |
| `npm --prefix apps/frontend-user run lint` | Passed |
| `node scripts/performance/profile-public-invitation.mjs before` and `after` | 6 successful samples per build, no page errors; cover screenshots identical at both widths |
| `python scripts/validate-agent-routing.py` | Passed, 0 failures; existing duplicate React skill-name warning |
| `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly` | Passed |

## Final checks

| Check | Result |
| --- | --- |
| Full backend suite, isolated copy, MySQL enabled, bounded test pools/context cache | 518 tests: 517 passed, 1 opt-in performance test skipped, 0 failures/errors; summed JUnit time 151.068 seconds |
| Final quiet paired MySQL performance test | 1 passed, 0 failures/errors, 249.889 seconds; all five guest cardinalities, equal outputs and 7→4 statement assertions; Maven exit 0 |
| `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/route-smoke.spec.js tests/e2e/silk-heritage.spec.js --workers=2` | 74 passed, desktop/mobile Chromium, 2.0 minutes |
| `npm --prefix apps/frontend-admin run lint` | Passed |
| `node scripts/performance/profile-public-invitation.mjs budget --check-budget` | All 6 samples passed byte budgets, heading and opening checks |
| HTTP loader on both builds | 900 measured responses plus 20 warm-ups per build; identical summary values, 0 errors |
| `node --check` on both performance `.mjs` tools; `git diff --check` | Passed |

The first isolated copy omitted `packages/api-contracts/openapi.yaml`: 516 tests
passed, 1 resource error, 1 skipped. Including that existing resource produced the
passing full result above. Isolating build output removed workspace `Bad magic
number` and synthetic-method `NoSuchMethodError` failures; a Java language server
was active, so shared-output interference was suspected. No media/payment/check-in
business code was changed to make tests pass.

One PowerShell performance wrapper treated a native Maven `sun.misc.Unsafe`
deprecation warning as a terminating shell error although JUnit completed with
the performance test passing. Repeats use normal native-command warning handling.
Initial paired runs retained SQL debug logging; a final repeat moves logging
configuration to startup properties. Initial non-development HTTP startup was
correctly rejected by production validation; measured local runs use `test`.
Only successful runs contribute timing samples.

JFR GC/CPU events and ending heap/process snapshots were collected; they do not
establish a memory improvement or replace soak tests. No Firefox/WebKit or full
production browser matrix was run. A passing fixture is not a production readiness
certification.

The exact latest performance JUnit result is retained in
`evidence/rsvp-performance-test.json`. Earlier instrumented runs and a successful
normal-warning-handling repeat remain separate evidence. Profiling helpers are
shut down after execution; disposable data/build copies remain local for inspection.

Concurrent edits to template data/layout/image files appeared after the tested
frontend build. They were preserved and are outside this pass's five production
file changes; frontend results refer to the recorded build snapshot.

## Reproduction of database-enabled checks

Use a disposable MySQL instance; migration-upgrade tests create/drop their own new
randomly named schemas. Set these variables to **that test instance only**:

```powershell
$env:RUN_FLYWAY_INTEGRATION='true'
$env:FLYWAY_TEST_DB_URL='jdbc:mysql://127.0.0.1:33316/koupreng_perf?useSSL=false&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true'
$env:FLYWAY_TEST_DB_USERNAME='root'
# Set FLYWAY_TEST_DB_PASSWORD privately for the disposable instance.
$env:SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE='4'
$env:SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE='0'
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test '-Dspring.test.context.cache.maxSize=4' -q
```

The pool limits above are test-process controls for multiple cached contexts,
not an application deployment tuning recommendation. Existing admin reporting
tests regenerate tracked report artifacts; those generated changes are restored
after verification, preserving the user's pre-existing sample-data work.
