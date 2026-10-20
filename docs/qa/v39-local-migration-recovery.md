# V39 local startup recovery

Verified on 2026-10-20 against local MySQL 8.0.39.

The backend could connect to MySQL but Flyway validation rejected the failed
`V39__cascade_invitation_ticket_design_cleanup.sql` history entry. Maven reported
`BUILD SUCCESS` even though the Spring application had exited; the development
runner correctly refused to start the frontends.

## Cause and correction

Executing the original V39 in a disposable MySQL schema reproduced:

```text
ERROR 1826 (HY000): Duplicate foreign key constraint name 'fk_ticket_designs_invitation'
```

The combined `ALTER TABLE` dropped and added a foreign key with the same name.
The corrected statement gives the replacement the distinct name
`fk_ticket_designs_invitation_cascade`. It retains one atomic MySQL DDL statement,
keeps foreign-key checks enabled, and preserves `ON DELETE CASCADE`.

V39 was an unreleased migration that had never successfully applied in this
development branch. Its failed entry was inspected before correction. V1 through
V38 were left unchanged. The corrected V39 has now successfully applied locally;
its checksum is `1935851697` and must remain immutable. If another environment
already has a successful original V39, stop: this recovery is not applicable,
and its applied migration must not be overwritten or checksum-repaired.

The development runner also now invokes `.\mvnw.cmd` explicitly so it works
when Windows sets `NoDefaultCurrentDirectoryInExePath=1`.

## Guarded local recovery

Inspection only:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/maintenance/dev/repair-ticket-migration.ps1
```

For the known failed original V39, with the local backend stopped:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/maintenance/dev/repair-ticket-migration.ps1 -Apply
.\run-local-stack.ps1 -NoNgrok
```

The helper only accepts `localhost:3306/koupreng_db` or its `127.0.0.1` equivalent.
It requires exactly one failed history entry with the original V39 checksum
`1721223858`, the intact V38 foreign key, no orphan designs, and the corrected
migration source. It refuses an active backend on port 8080. Before changing
history it writes a complete `mysqldump` backup and its SHA-256, then removes only
that failed entry. Every successful history row is compared before and after.
It does not run a blanket checksum repair or disable validation. A successful
V39 is an idempotent no-op for this helper.

The actual recovery backup is in the ignored local directory
`.cache/local-v39-recovery/446329386e0b479b8c7aa7693d6b00ac/`. It contains private
application data and must not be committed or shared. No business rows were
deleted by the recovery SQL. Normal startup applied the corrected V39.

Flyway documents that failed migration recovery requires inspecting leftover
schema changes; repair does not clean them up automatically. See
[Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
and [MySQL foreign-key DDL](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html).

## Verification evidence

The new `TicketMigrationMySqlTests` creates a random task-owned schema, migrates
to V38, inserts a ticket design, runs the original failing V39 through Flyway,
repairs that isolated history, and applies the corrected source. It verifies
unchanged successful migration checksums, preserved ticket JSON/version,
rejection of orphan designs, and cascade deletion without deleting the owner.
Its schema is removed in `finally`; configured application schemas are never
dropped by this test.

The test first failed with MySQL error 1826 against the original source, then
passed after the constraint-name correction.

From `apps/backend`, with `RUN_FLYWAY_INTEGRATION=true` and the existing
`FLYWAY_TEST_DB_*` variables pointing at local MySQL (credentials were loaded
without printing them):

```powershell
.\mvnw.cmd test '-Dtest=TicketMigrationMySqlTests,MigrationUpgradeMySqlTests,SilkHeritageMigrationMySqlTests,TicketIntegrationTests,ArchitectureRulesTests,FlywayMigrationVersionTests' '-Dstyle.color=never'
```

Result: **22 tests, zero failures/errors/skips; BUILD SUCCESS, 55.260 seconds**.
Log: `.cache/ticket-migration-green.log`.

`FreshDatabaseMigrationTests` was then run against another randomly named,
newly created MySQL schema, removed after Maven exited:

```powershell
.\mvnw.cmd test '-Dtest=FreshDatabaseMigrationTests' '-Dstyle.color=never'
```

Result: **1 test, zero failures/errors/skips; BUILD SUCCESS, 33.848 seconds**.
All migrations applied and Hibernate schema validation completed. Log:
`.cache/ticket-migration-fresh.log`.

The exact local runner `.\run-local-stack.ps1 -NoNgrok` started successfully.
HTTP probes returned:

| Endpoint | Result |
| --- | --- |
| `http://127.0.0.1:8080/actuator/health/readiness` | 200, `{"status":"UP"}` |
| `http://127.0.0.1:5173/` | 200 |
| `http://127.0.0.1:5174/` | 200 |
| `http://127.0.0.1:5173/api/v1/templates` | 200 through the frontend proxy |

Local schema inspection confirmed zero failed migrations and
`fk_ticket_designs_invitation_cascade` with delete rule `CASCADE`. All successful
preexisting history rows were preserved. The recovery helper's second invocation
made no changes because V39 was already successful.

`python scripts/validate-agent-routing.py`, skill integrity verification, and
`git diff --check` also passed. These checks establish local startup and the
targeted migration behavior; no production deployment or provider certification
was performed.
