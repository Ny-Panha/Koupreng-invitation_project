# Measured performance

## Method and comparability

Chromium 156, production Vite previews,1440x900, reduced motion, fresh cache-disabled contexts,2x CPU slowdown,20 ms emulated network latency and10 MB/s throughput. Each journey has one warmup and three measured contexts. These are local shared-host laboratory observations, not field CWV/INP, Lighthouse or production capacity. Three samples cannot establish population p95; their maximum is only an observed tail. Raw samples include LCP, CLS, blocking excess, DOM/request/API counts, image/font bytes and a coarse heap point.

**Baseline Studio samples contain an external-CSS fixture preload error and are excluded from paired conclusions.** The after harness fulfills external stylesheets empty instead of aborting them and now fails on page errors/missing samples. All 30 final after samples are error-free. This fixture change and host contention limit timing attribution; no replacement before number is invented. Nine pairs remain usable for local resource-size comparison. Studio is current-only.

| Journey | Before median LCP ms | After median LCP ms | Before decoded JS B | After decoded JS B | Interpretation |
|---|---:|---:|---:|---:|---|
| home | 460 | 484 | 716,659 | 717,273 | +0.09% JS |
| marketplace | 772 | 808 | 716,963 | 717,577 | +0.09% JS |
| template-preview | 1,580 | 1,460 | 1,294,919 | 1,280,816 | -1.09% JS |
| invitation-studio | excluded | 1,692 | excluded | 1,655,347 | baseline CSS-fixture error |
| public-wedding | 1,456 | 1,520 | 1,303,516 | 1,270,838 | -2.51% JS |
| guest-rsvp | 1,288 | 1,296 | 1,271,950 | 1,239,174 | -2.58% JS |
| check-in | 1,172 | 1,132 | 1,073,630 | 1,074,244 | +0.06% JS |
| event-dashboard | 1,108 | 1,136 | 908,398 | 909,012 | +0.07% JS |
| admin-dashboard | 596 | 560 | 436,605 | 436,763 | +0.04% JS |
| admin-reports | 656 | 660 | 469,660 | 469,813 | +0.03% JS |

Optional CMS/fallback renderers load on demand inside Suspense. Registry identity, authored blocks and unknown-layout fallback have real rendering regressions. Byte changes above are measurements, not blanket speed improvements. Timing increases remain visible and are not attributed to code without isolated evidence. No threshold was raised.

| Full emitted asset inventory | Before raw B | After raw B | Before gzip B | After gzip B |
|---|---:|---:|---:|---:|
| frontend-user all .js | 2,720,016 | 2,725,823 | 862,803 | 870,037 |
| frontend-user all .css | 1,151,572 | 1,151,573 | 248,881 | 249,128 |
| frontend-admin all .js | 1,104,002 | 1,107,351 | 299,711 | 300,686 |
| frontend-admin all .css | 215,060 | 215,007 | 32,436 | 32,436 |

These sums cover every emitted chunk, not one initial download. Per-route encoded/decoded/transfer sizes and complete CLS/DOM/API/image/font/heap observations are in [before](evidence/browser-performance-before.json) and [after](evidence/browser-performance-after.json). Heap values are browser-quantized, often10MB; a point observation cannot prove absence of leaks. No HTTP guest-list latency before/after measurement was obtained; it is unavailable rather than inferred from SQL time.

## Established budget

`node scripts/performance/profile-public-invitation.mjs batch12-final --check-budget` still FAILS the unchanged public Silk Heritage cover limits:1,000,000 decoded JS and480,000 decoded CSS bytes. [Actual resources](evidence/public-budget-after.json) are retained. The old heading assertion expected generic text although the real contract displays invitation.title; only that stale assertion was aligned. Limits/loading behavior were not weakened. The cover sample is not complete field performance. This remains explicit P2 debt requiring resolution or owner-approved exception before release.

## Native MySQL load

MySQL 8.0.39/Java 25.0.1/MySQLDialect, owned synthetic database, concurrency1,10 warmups and three rounds of 30 alternating retained-historical/current service calls at0/100/1k/10k/100k guests. Query/parity checks pass. Median of three round-level p95 values:

| Guests | Historical ms | Current ms | Hibernate statements |
|---:|---:|---:|---|
|100|12.371|8.705|7 ->4|
|1,000|14.089|8.130|7 ->4|
|10,000|117.281|62.570|7 ->4|
|100,000|1,017.561|640.444|7 ->4|

This compares an existing historical algorithm with current code, **not Batch12 before/after**, HTTP, concurrent load or all SQL activity. An earlier inherited MariaDBDialect run is retained with its limitation; this run explicitly confirms MySQLDialect. All owned schemas were removed. JDBC dashboard queries are not all in Hibernate statistics; the monitor does not measure complete SQL wall time. Unbounded payment-history/delivery collections remain an explicit scalability limit. See [native experiment](evidence/rsvp-performance.json).

The final admin verification build supplies its public customer origin explicitly through VITE_USER_APP_URL; baseline used the default development origin. This configuration difference is recorded and further limits causal interpretation of admin timing/byte changes. Hardware/tool versions are in [environment evidence](evidence/environment.json).
