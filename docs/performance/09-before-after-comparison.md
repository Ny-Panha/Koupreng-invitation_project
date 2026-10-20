# Before/after comparison

Two bounded improvements are retained: combined RSVP aggregates and narrower public
template imports. No claim is made that every module is optimized or the system
is certified production-ready. Raw data and protocols live beside this document.

Initial independent MySQL runs demonstrate fewer SQL statements and lower large-list
service times; the final comparison uses alternating original/current algorithms
in one JVM to reduce run-to-run bias. Timing sets are kept separate in `evidence/`.

| Metric | Before | After | Interpretation |
| --- | --- | --- | --- |
| Invitation page LCP, local synthetic mobile median | 800 ms | 788 ms | Within noise; no LCP gain claimed |
| Invitation page LCP, local synthetic desktop median | 424 ms | 488 ms | Slower observation; no field/regression conclusion from these unthrottled samples |
| HTTP API p95, 10,000 guests, concurrency 8 | 117.37 ms | 111.69 ms | Observed 4.84% lower; short burst, not a general API claim |
| Database query time | See isolated query plans | See isolated query plans | Not a production workload measurement |
| SQL statements per public RSVP summary service call | 7 | 4 | 42.86% fewer; same access lookup |
| Public invitation JavaScript loaded | 1,101,616 bytes | 927,782 bytes | 15.78% smaller decoded resource total |
| Public invitation CSS loaded | 488,739 bytes | 457,613 bytes | 6.37% smaller decoded resource total |
| Requested JS files, sum of individual gzip sizes | 335,124 bytes | 284,011 bytes | 15.25% smaller; not measured on-wire transfer |
| Ending process working set | 589.13 MiB | 572.46 MiB | Snapshot only; no retained-memory improvement claimed |
| HTTP throughput, concurrency 8 | 78.71 req/s | 81.82 req/s | Observed 3.95% higher; not sustainable capacity |
| HTTP load error rate | 0/900 measured requests | 0/900 measured requests | No errors in either read-only fixture |

All public resource totals repeat across three runs on each of two viewports.
Mobile/desktop cover screenshots are pixel-identical. Unit/integration/browser
results and failed attempts are documented in `08-qa-qc-results.md`.

## Final service comparison with debug logging disabled

Median of three round-level p95s, 30 calls per algorithm per round, 10 warm-ups,
same JVM/transaction/MySQL fixtures, concurrency 1:

| Guests | Original p95 | Optimized p95 | Reduction |
| ---: | ---: | ---: | ---: |
| 0 (two legacy responses) | 14.69 ms | 10.80 ms | 26.50% |
| 100 | 11.15 ms | 7.85 ms | 29.59% |
| 1,000 | 18.89 ms | 11.62 ms | 38.47% |
| 10,000 | 117.85 ms | 72.55 ms | 38.44% |
| 100,000 | 1,274.80 ms | 724.32 ms | 43.18% |

At 100,000 guests, median round-level p50 is 1,024.65→631.56 ms and p99 is
1,281.98→764.12 ms. All outputs match and SQL statement assertions pass.
`evidence/comparison.json` selects `rsvp-paired-quiet.json` as the primary service
timing source. Earlier logged runs are retained separately, with no pooled results.
Absolute times changed substantially across runs on this shared laptop and small
buffer pool. The within-run comparisons and deterministic SQL/byte reductions
support the changes; these observations are not a production latency guarantee.

## Experiment ledger

| Experiment | Decision | Reason |
| --- | --- | --- |
| Combine RSVP counts | Keep | Verified equal outputs and 7→4 statements; lower paired large-list service latency |
| Public template direct imports | Keep | Deterministic JS/CSS reduction and identical cover pixels; passing component regressions |
| Nonblocking public media/catalog | Deferred | Would need custom-template/cover consistency tests; no change attempted |
| Additional indexes/cache/pool tuning | Deferred | No measured need; avoid write cost, stale authorization and unnecessary infrastructure |

## HTTP and resource detail

Median of three rounds of 100 requests, after 20 warm-up calls:

| Concurrent requests | Original p50 / p95 / p99 ms | Optimized p50 / p95 / p99 ms | Original→optimized req/s |
| ---: | ---: | ---: | ---: |
| 1 | 51.50 / 74.92 / 86.15 | 57.83 / 71.28 / 81.36 | 18.10→17.47 |
| 4 | 66.23 / 84.35 / 95.20 | 61.85 / 71.54 / 74.28 | 57.59→63.71 |
| 8 | 99.06 / 117.37 / 120.52 | 94.95 / 111.69 / 115.83 | 78.71→81.82 |

Concurrency-1 throughput was lower after the change; several tail ranges overlap.
There is no blanket HTTP speed claim. Both JVMs have 128 MiB initial / 512 MiB
maximum heap. CPU time over the load script including warm-up was 13.22→12.45 s.
JFR observed 3→2 collections and 72.22→12.36 ms total GC duration, with median
sampled JVM CPU fraction of the 20-logical-CPU host 2.20%→1.87%. These short
samples do not establish sustained GC/CPU efficiency. Ending used heap was
approximately 106.27→128.51 MiB (higher after), so collection timing prevents a
retained-memory improvement claim.

The 100,000-guest plan shows an indexed 75,002-row lookup for each old RSVP
aggregate and once for the combined aggregate. The pending anti-join still probes
the unique guest index 100,000 times. That unchanged work remains a profiling
target. Individual plan timings (53.8 ms old attending count, 57.9 ms old sum,
91.2 ms combined four-output query in the initial instrumented run) compare unequal
work and cannot be summed into a measured per-request database-time improvement.
The quiet run's separately instrumented plans are also retained; their later
timings differ substantially. No new index was necessary.
