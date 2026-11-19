# Performance and payload evidence

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

[build-assets.json](evidence/build-assets.json) records every emitted final HTML/JS/CSS raw/gzip/Brotli separately for user/admin. These totals are not initial route transfer; public media is excluded. Gemini’s382kB main chunk claim is stale. No runtime dependency was added.

[performance-comparison.json](evidence/performance-comparison.json) aggregates three samples per route×cold/repeat-navigation condition,18 before and18 after. Native browser FCP/LCP/CLS clocks and resource transfer/duration arrays are retained in before/after-performance.json. Interception disables HTTP cache; repeat navigation is not a true warm-cache sample. Zero LCP means observation not yet reported, not instant paint. No baseline all-chunk Brotli inventory, CPU/3G acceptance, device benchmark, field p75 or INP is certified. Variance and fixture/provider errors limit causal speed claims.

Performance remains REVIEW REQUIRED; current large marketing background, font range and Studio catalog remain owned carryovers, not Phase08 optimization targets.

Browser lab medians [minimum–maximum]; FCP/LCP in milliseconds, CLS unitless. An unreported zero LCP is excluded rather than presented as instantaneous paint.

| Stage | Route | Condition | FCP | LCP | CLS |
| --- | --- | --- | --- | --- | --- |
| before | auth-login | cold | 92.000 [88.000–92.000], n=3 | 400.000 [396.000–404.000], n=3 | 0.005 [0.005–0.005], n=3 |
| before | auth-login | warm | 72.000 [68.000–72.000], n=3 | 696.000 [692.000–712.000], n=3 | 0.000 [0.000–0.004], n=3 |
| before | auth-reset | cold | 88.000 [88.000–120.000], n=3 | 420.000 [412.000–424.000], n=3 | 0.000 [0.000–0.000], n=3 |
| before | auth-reset | warm | 68.000 [60.000–72.000], n=3 | 688.000 [380.000–696.000], n=3 | 0.000 [0.000–0.000], n=3 |
| before | profile | cold | 92.000 [88.000–92.000], n=3 | 420.000 [408.000–436.000], n=3 | 0.000 [0.000–0.000], n=3 |
| before | profile | warm | 68.000 [56.000–72.000], n=3 | 388.000 [384.000–388.000], n=3 | 0.000 [0.000–0.000], n=3 |
| after | auth-login | cold | 96.000 [96.000–96.000], n=3 | 416.000 [412.000–424.000], n=3 | 0.005 [0.004–0.005], n=3 |
| after | auth-login | warm | 84.000 [80.000–88.000], n=3 | 404.000 [388.000–720.000], n=3 | 0.005 [0.004–0.005], n=3 |
| after | auth-reset | cold | 116.000 [108.000–144.000], n=3 | 428.000 [420.000–464.000], n=3 | 0.000 [0.000–0.000], n=3 |
| after | auth-reset | warm | 76.000 [60.000–88.000], n=3 | 384.000 [380.000–712.000], n=3 | 0.000 [0.000–0.000], n=3 |
| after | profile | cold | 92.000 [92.000–96.000], n=3 | 420.000 [416.000–436.000], n=3 | 0.000 [0.000–0.000], n=3 |
| after | profile | warm | 76.000 [76.000–76.000], n=3 | 396.000 [388.000–412.000], n=3 | 0.000 [0.000–0.000], n=3 |

These small unthrottled loopback samples do not establish a causal speedup or field acceptance.

| App | All emitted raw bytes | gzip bytes | Brotli bytes |
| --- | --- | --- | --- |
| user | 4218304 | 1200235 | 1016723 |
| admin | 1354713 | 343885 | 289666 |
