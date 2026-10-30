# Backend and MySQL coverage

`git show --stat cf586813` confirms that the cleanup removed **157 compiled `.class` files**, not Java source tests; it also added a historic review ZIP. Current `git ls-files '*.class'` returns zero. No generated class was restored.

Final `mvnw.cmd --batch-mode verify dependency:analyze`: **658 discovered, 582 passed, 76 skipped, zero failures/errors**, exit 0, 641.59 seconds, including static analysis and coverage. JaCoCo reports 9,305 covered / 3,141 missed lines and 3,985 covered / 2,816 missed branches; these are aggregate coverage metrics, not proof of complete behavior coverage.

Clean baseline `mvnw.cmd --batch-mode clean verify`: **657 discovered, 582 passed, 75 skipped, zero failures/errors**, including ArchUnit, JaCoCo generation, SpotBugs and PMD. Skips are environment-gated and are not counted as passes.

A new, task-owned MySQL **8.0.39** data directory was initialized under ignored `.cache/release-hardening/mysql-data`, bound to **127.0.0.1:3416**, with separate `koupreng_flyway_ci` and `phase7_disposable` schemas. Existing MySQL services, local environment files and production databases were not used or changed. No database dump or account credential is tracked.

`mvnw.cmd --batch-mode "-Dtest=*MySqlTests,FreshDatabaseMigrationTests" test`, with `RUN_FLYWAY_INTEGRATION=true`: **78 discovered, 51 passed, 27 skipped, zero failures/errors** (2:22 Maven time; final dependency/configuration state, 30 October). This broadens the former CI list to include ticket/template migrations, catalog compatibility, guest batches, seating and gift persistence. Fresh and representative upgrade migrations are included. The skipped group includes independently gated HTTP, performance and demo provisioning tests.

`mvnw.cmd --batch-mode "-Dtest=Phase7CollaborationMySqlTests,Phase9MediaMySqlTests" test`, with `RUN_PHASE7_MYSQL=true`: **23 discovered, 22 passed, one skipped**, zero failures/errors (1:27 Maven time; final state, 30 October). These use a real random-port HTTP server, JWT, JPA and MySQL. They cover owner quotas under races, collaboration consent/revocation, staff roster privacy/check-in, locale/design persistence, one-time template ownership, media IDOR and Premium video restrictions. The skipped test requires an external reviewed `STUDIO_PACKAGE_CONFIG`; no historic local catalog was silently imported.

Added a read-only real-HTTP package-policy test comparing the public API to the current disposable database catalog and asserting that a regular user remains denied the admin catalog. It writes only sanitized public package data for the CI report. It passed in the final 23-case HTTP run. Final commands and timings are recorded in 08.

CI now has a mandatory independent **Real HTTP MySQL Ownership, RBAC & Entitlements** job and uploads MySQL/Surefire evidence. No previously applied migration was edited, and no migration was added. Financial/security tests remain enabled under their explicit disposable-database gates.
