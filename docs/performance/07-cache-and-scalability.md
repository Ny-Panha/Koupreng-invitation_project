# Cache, network and low-budget scalability

No new cache, service, dependency, pool tuning or deployment is introduced.

## Existing cache boundaries

| Cache | Key / owner | Lifetime and invalidation | Bounds / evidence |
| --- | --- | --- | --- |
| Public template client cache | Stored language (`en`/`km`), public metadata | 30-second TTL; force bypasses fresh entries when no request is in flight; errors evict; concurrent calls share the current promise | At most two language entries under current helper; no hit/miss metrics observed |
| Hashed frontend assets | Content-hashed URL; static frontend server | Nginx one-year expiry/immutable; new build produces new names | Browser/CDN-managed storage, not an app heap cache |
| Auth cache infrastructure | `auth:user:<id>`; backend Redis adapter | 60-second snapshot TTL; after-commit eviction | JWT converter still uses fresh DB authorization; do not substitute a stale cached role |
| Rate limiting | Backend rate-limit key prefix and subject; Redis in Compose | Existing expiry/limit policy | Already provisioned; no reason to add another Redis instance |

No private invitation, guest token, password gate, permission, balance or payment
state is placed in a public response cache. Catalog metadata is not authority to
set a purchase price. HTML cache policy and public sharing previews deserve a
separate edge/server review; hashed-asset caching must not be applied to HTML or
private API routes. Instrument existing cache hit/miss/eviction/memory before
making further cache claims.

## Operations review

Compose currently describes a **development** stack (backend uses the dev profile),
with MySQL 8, Redis 7.4, backend, worker, frontend servers, gateway and health checks.
It must not be called a fully validated production resource envelope. Production
properties disable development sample data/monitoring and enforce separate security
requirements. Nginx gateway/static configuration and Prometheus wiring exist.

The laptop benchmark does not establish VPS CPU, heap, MySQL buffer pool, connection
pool or thread utilization, sustainable RPS, or a safe concurrent-user limit.
Do not derive these from single-threaded summary timings, short loopback bursts at
concurrency 1/4/8, or the size of a guest list. JFR/ending process observations in
the comparison document describe those local runs, not a VPS resource envelope.

Next isolated VPS exercise: set an explicit total RAM budget across containers,
measure JVM committed/live heap, GC pauses, CPU and Hikari active/pending/timeouts,
MySQL buffer hit rate/slow queries and Redis memory while ramping requests. Then
choose container/JVM/database budgets with headroom for the OS and backups. Verify
graceful shutdown, timeouts, compression, static caching and recovery under that
same workload. Do not restart production containers, change DNS or deploy this
work without explicit authorization.
