# Baseline benchmark protocol

Initial environment: Windows, Java 25.0.1, Node 26.5.0, Python 3.14.5;
MySQL 8.0.39 installed locally. Docker executable exists but its Linux engine pipe
is unavailable. Maven is available through `apps/backend/mvnw.cmd`, not PATH.

Baseline application source is captured before optimization. Tests and profiling
helpers are added before changing the measured application methods. Synthetic
fixtures contain no customer data. MySQL is a new loopback-only instance on port
33316 under ignored `.cache/performance/mysql-20261020`, with a 128 MiB buffer pool
and 40 connection limit. No existing database, container or production service is used.

Executed comparable experiments:

- Run public RSVP summary through its real service, transaction and JPA queries on
  migrated MySQL at 100, 1,000, 10,000 and 100,000 guests. Record warm-up, repetitions,
  query count and latency quantiles. These are guest counts, **not concurrent users**.
- Compare production frontend JS/CSS resources before/after direct template imports.
  Preserve a baseline build and use the same fixture/viewport/browser for visual checks.
- Run relevant unit, architecture and database integrity tests before/after changes.

Results and limitations are in `09-before-after-comparison.md`, with raw JSON in
`evidence/`. Base commit: `751eabdc98555c57a58ae6c5051ce4b59dda597c`.
This shared laptop has 20 logical CPUs and 16,869,548,032 bytes physical RAM.
Installed frontend versions are React/DOM 19.3.0, Vite 8.3.0, Router 7.18.4,
Tailwind 4.3.3 and Zustand 5.0.15; manifest ranges are not exact installed versions.

## MySQL service protocol

`RsvpSummaryPerformanceMySqlTests` creates 0, 100, 1,000, 10,000 and 100,000 guests
on separate invitations owned by one synthetic user. Approximately 75% have RSVP
records; two anonymous/null legacy records per invitation exercise count semantics.
JDBC batches contain at most 1,000 guest rows. All rows roll back after the test.

The independent before/after runs remain as preliminary evidence. The final paired
experiment alternates the original algorithm and optimized service in the same
JVM/transaction/fixture. Each variant has 10 warm-ups and three rounds of 30 calls,
concurrency 1. Every output is checked for equality. Hibernate statistics assert
7 versus 4 statements per call, including the real public access lookup. The old
helper shares the outer test transaction; this is not transaction-start/HTTP timing.
Reported p50/p95/p99 are medians of round-level nearest-rank quantiles (indices
14/28/29 for 30 samples), not pooled population percentiles.

Development monitoring is disabled. Initial paired runs retained debug/SQL logging:
dynamic test properties are too late for early logging initialization. The final
quiet run supplies logging properties before startup. Instrumented `EXPLAIN ANALYZE`
plans capture actual index use but are not per-request totals. Use the QA document's
disposable DB variables and:

```powershell
$env:RUN_RSVP_PERFORMANCE='true'
$env:RSVP_PERFORMANCE_OUTPUT='<absolute evidence JSON path>'
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test '-Dtest=RsvpSummaryPerformanceMySqlTests' '-Ddebug=false' '-Dtrace=false' '-Dlogging.level.root=WARN' '-Dlogging.level.org.hibernate.SQL=OFF' '-Dlogging.level.org.springframework=WARN' '-Dlogging.level.org.springframework.jdbc=OFF' -q
```

## HTTP protocol

An isolated backend copy was built first with the original `RsvpService` from the
base commit, then with the optimized service. Both use identical dependencies,
`-Xms128m -Xmx512m`, the `test` profile, MySQL dialect/validation, and a second new
schema, `koupreng_perf_http`. Server binds only to `127.0.0.1:18080`. Benchmark-only
CLI overrides disable development/sample data, request/debug logging and WAF rate
limiting. Production validation/configuration is unchanged. This does not emulate
production TLS, Cloudflare, Redis rate limiting or network distance.

After Flyway migration, `scripts/performance/seed-http-fixture.sql` creates one owner,
one public invitation, 10,000 guests and 7,500 responses in that explicit test schema.
It fails on duplicate fixture data and never clears existing data. Expected summary:
10,000 guests, 2,500 per response status, 2,500 pending, 5,000 attending seats.

`http-load.mjs` is GET-only and loopback-only, validates every response, warms 20
calls, then runs three rounds of 100 requests at each concurrency 1, 4 and 8.
Timeout is 10 seconds. Each build has 900 measured requests plus warm-up, with
identical fetch connection reuse. Round quantile indices are 49/94/98. Tables
report median round values; these short closed-loop bursts are not capacity tests.

```powershell
node scripts/performance/http-load.mjs http://127.0.0.1:18080/api/v1/public/invitations/performance-http-fixture/rsvp-summary-public docs/performance/evidence/http-after.json
```

JFR `profile` recordings span the load scripts. Process CPU deltas, elapsed time
and ending working-set snapshots are recorded. Filtered GC/CPU summaries are in
`evidence/comparison.json`; full recordings remain in ignored `.cache/performance`
because they can contain environment details. Ending heap is not peak/retained
heap, and these samples cannot establish leak, GC or production p99 guarantees.

## Browser protocol and limitations

Chromium 153.0.8010.12, fresh context per sample, three runs at 390×844 and three
at 1440×900, reduced motion, mocked API, local assets, no network/CPU throttling.
External requests are blocked, with empty responses for external stylesheets.
The fixture is a Silk Heritage public invitation. The script records resources,
gzip inventories, synthetic LCP/CLS/long tasks and page errors; it verifies the
heading/opening interaction. Cover pixels match at both widths. These are not
field Core Web Vitals or INP. Reproduce after a production build and local preview:

```powershell
node scripts/performance/profile-public-invitation.mjs after --check-budget
```

100/1,000/10,000/100,000-user populations, sustained concurrent RSVP/purchase writes,
spikes/soaks, real mobile networks, production hardware and field INP were not
benchmarked. Existing MySQL tests exercise specific write races/idempotency, not
load. Hikari/thread saturation remains unprofiled. Use authorized Actuator/Prometheus
access, JFR and safe fixtures on an isolated hardware clone before tuning pools or
promising capacity. Background activity on this laptop is not fully controlled.
