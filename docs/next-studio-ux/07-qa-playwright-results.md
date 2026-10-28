# Verification results

Commands ran in the existing working directory on `main`. Logs are local under `.cache/next-studio-ux`; reviewed, sanitized policy/catalog and visual evidence are committed separately. Browser fixtures are not represented as proof of database enforcement.
Each application's lint/test/build command runs in its own app directory; repository scripts run from the root.

## Automated gates

| Scope | Actual command / result |
| --- | --- |
| User frontend lint | `npm run lint` in `apps/frontend-user`: exit 0 |
| User unit/component suite | `npx vitest run --maxWorkers=2 --pool=forks --reporter=dot`: 156 files, 1,144 tests passed |
| User production build | `npm run build`: exit 0, Vite build completed |
| Admin lint, unit suite, build | `npm run lint`, `npx vitest run`, `npm run build`: exit 0; 21 files, 121 tests passed |
| Worker | Existing `apps/telegram-bot/.venv/Scripts/python.exe -m pytest`: 74 passed, one Starlette dependency deprecation warning |
| Backend ordinary suite | `apps/backend/mvnw.cmd test`: 649 reported, 0 failures, 0 errors, 71 skipped; 578 executed successfully |
| Skill integrity | `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly`: 59 bundled directories verified |
| Routing | `python scripts/validate-agent-routing.py`: 0 errors/failures |
| Diff hygiene | `git diff --check`: clean |

The ordinary Java suite includes architecture and OpenAPI checks. It uses its normal unit/H2/mocked configurations and is distinct from the actual MySQL runs below. The prior OpenAPI drift was regenerated into the established test contract and passed the normal check; the check was not disabled.

## Real disposable MySQL / HTTP / JWT

`python scripts/qa/run-studio-access-mysql.py` creates a new guarded schema on the existing loopback MySQL 8 server, runs selected actual Spring HTTP/JWT tests with Flyway, and drops only the schema it created. Credentials remain in the existing local environment, outside committed evidence.

- `--label real-mysql-security`: `Phase7CollaborationMySqlTests`, 18 passed. Includes actual four-package policy snapshots, pending/expiry/role boundaries, owner-scoped template purchases, collaborator permissions/IDOR and exact event guest quota metadata/privacy.
- `--label real-mysql-integrity --tests EntitlementIntegrityMySqlTests,SubscriptionIntegrityMySqlTests,PaymentEvidenceIntegrityMySqlTests,AuthIntegrityMySqlTests,MediaIntegrityMySqlTests,GuestMutationIntegrityMySqlTests,GuestBatchMySqlTests,SeatingLayoutMySqlTests,RoyalGardenCatalogMySqlTests,MigrationUpgradeMySqlTests,TicketMigrationMySqlTests,SilkHeritageMigrationMySqlTests`: 41 passed, 0 failures/errors/skips. The harness JSON records the actual selected class names and counts; no stale Surefire report is accepted after a failed compilation.

The runs cover entitlement/subscription/payment reconciliation, authentication lifecycle, media, guest mutations/imports, seating concurrency, Royal Garden catalog state and migration upgrade integrity. Disposable schemas were removed. No application catalog/package record, live payment, production schema or production container was changed.

## Chromium and pixel comparison

From `apps/frontend-user`:

```powershell
npx playwright test project-wide-ui.spec.js template-identity.spec.js next-studio-ux.spec.js phase7-accessibility.spec.js phase11-features.spec.js phase12-studio.spec.js royal-garden-catalog.spec.js royal-garden-v32.spec.js event-overview-design.spec.js --workers 2 --output test-results-polish
```

Final result: **111 passed, 29 skipped, 0 failed**, 4.2 minutes. This is the selected current regression gate, not the entire historical browser inventory. Skips are duplicate screenshot matrices in the mobile project and the separately opt-in real-catalog scenario.

- All 19 requested management routes: light 1440px, dark 390/768/1440px, no document overflow. Landing also covers 320px and full-page dark rendering.
- All 19 dark management content regions plus the dark marketing shell: zero Axe WCAG A/AA violations in the tested state. Existing light/Khmer/English accessibility journeys run in both Chromium projects.
- Four pixel baselines are generated and visually reviewed with `--update-snapshots`, then compared by the command above without updating them. All four comparisons pass. They cover English My Events desktop and Khmer overview mobile, both modes.
- Theme/language persistence, controlled Studio edits and the existing iframe identity are asserted. Reduced motion is used for the complete landing capture.
- Save failure/retry/success, cancellation focus, revoked-role draft recovery, template identity/status/authorization, exact renderer, authored-data preservation, touch/keyboard map manipulation, calendar/program localization, exports and Royal Garden V3.2 functionality pass.

Initial iteration failures were investigated: disclosure selectors were updated, touch-map tests explicitly enter drag mode, actual default-renderer substitution for unknown stable codes was fixed, and low-contrast theme labels/surfaces were corrected. The final gate above includes those cases.

## Real local catalog

With `$env:RUN_REAL_CATALOG='1'`, `npx playwright test royal-garden-catalog.spec.js --grep 'real local' --project desktop-chromium --workers 1 --output test-results-live-studio`: **1 passed**, 9.8 seconds in the latest run. Catalog responses come from the actual local Spring/MySQL service; authentication and event writes remain isolated browser fixtures. It verifies featured landing, full browsing and Studio chooser at desktop/tablet/mobile widths.

A final independent GET is recorded in [final-real-catalog.json](evidence/final-real-catalog.json): 5 public records, including ACTIVE Premium Royal Garden ID 14, exact stable code, wedding and KH/EN/BOTH. Its standalone checkout is correctly blocked for product-policy review; it is never advertised as free. Production catalog state is unverified.

## Firefox and WebKit

`npx playwright test --config playwright.studio.config.js`: **8 passed, 0 failed/skipped**, 29.5 seconds. Both engines cover contextual upgrades, focus/cancellation, revoked-role draft retention, failed/successful saving and navbar preferences without changing the Studio draft/iframe. Pixel goldens deliberately use one installed Windows Chromium environment; these two engines verify interaction behavior independently.

## Operational regression

`npx playwright test premium-operations.spec.js phase2-operations.spec.js phase9-tickets.spec.js phase7-teams.spec.js --workers 2 --output test-results-operations-final`: **24 passed, 0 failed/skipped**, 25.9 seconds. Both Chromium projects cover RSVP filtering and failed edits, KHR expense failure/retry, printable financial preview with separate currencies, 320px gift entry, inline guest actions, reviewed team linking, restricted check-in staff tools and real ticket-image transforms/PNG export. The mobile ticket test explicitly enters its existing Preview & export pane after reload before choosing a recipient.

Across the selected final Chromium, cross-engine, operations and real-catalog runs: **144 passed, 29 intentional skips, 0 failures**. This count excludes baseline-generation runs and does not imply the historical 930-case inventory is green.

## Historical full-suite audit

An earlier 930-case exploratory Chromium run was interrupted when the user expanded the UI request: 286 passed, 101 failed, 19 skipped, highest reported index 407; the remaining inventory did not run. [Its summary](evidence/exploratory-browser-summary.json) is preserved. It is not a green gate, and unrerun historical failures are not automatically called pre-existing.

Several historical specifications depend on retired V50 designs, obsolete section navigation, native confirmations, earlier catalog DTOs or unavailable baseline servers on ports 4286/4289. Relevant current fixtures and assertions were repaired, and the selected current gate was rerun. A complete historical-suite cleanup and physical-device/manual screen-reader acceptance remain limitations; this report does not claim all 930 cases passed.
