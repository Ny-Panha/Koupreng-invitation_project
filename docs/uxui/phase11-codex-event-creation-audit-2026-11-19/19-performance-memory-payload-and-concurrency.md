# 19 — performance memory payload and concurrency

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

| Stage | Route JS/CSS chunks | Entry JS/CSS chunks | All emitted JS bytes | All emitted CSS bytes |
| --- | --- | --- | --- | --- |
| HEAD 0cf4755b | EventCreatePage-C3OFDRFo.css: 21634 B (4771 gzip), EventCreatePage-DSaphteB.js: 51158 B (12881 gzip) | index-Dfx7LbIC.css: 258041 B, index-gzgYGN88.js: 477847 B | 2921829 | 1307949 |
| Gemini inherited runtime | EventCreatePage-3UG5kMBl.css: 22395 B (4981 gzip), EventCreatePage-d7ZWEOk3.js: 53297 B (13326 gzip) | index-Dfx7LbIC.css: 258041 B, index-n-_6IXtq.js: 477847 B | 2923968 | 1308710 |
| Codex final | EventCreatePage-Bf83FAUw.js: 58152 B (14812 gzip), EventCreatePage-D7USAr43.css: 23538 B (5154 gzip) | index-Bx_0eZae.css: 258130 B, index-DsAej_L3.js: 477847 B | 2928874 | 1309942 |

HEAD and inherited Gemini sources were reconstructed in isolated ignored directories using the same installed tooling and public VITE settings. Actual checkout files were not reverted. Route chunk cost is not total first-load cost: entry/shared dependencies and media must also be counted. All-emitted lazy bytes are not a network waterfall.

Runtime measurements, if present, are transparent local diagnostic samples with cold/warm and CPU conditions. Input-to-frame timing is a lab proxy, never field INP. There is no matched baseline latency series, RUM/p75, comprehensive heap proof or native-device budget certificate. No budget was changed to turn a failure green.

Controlled, configured-default and repeated browser results retain every failed trial, including Windows artifact locking. [Performance data](evidence/performance-compare.json), [exact runs](evidence/exact-test-command-results.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).


| Condition | Samples | FCP median ms | LCP median ms | Input-to-frame median / p95 ms | Maximum CLS | Resource transfer median bytes |
| --- | --- | --- | --- | --- | --- | --- |
| cold | 5 | 64 | 408 | 7.20 / 14.80 | 0 | 411162 |
| warm | 5 | 52 | 392 | 8.00 / 20.30 | 0 | 411162 |
| cpu4x | 3 | 128 | 624 | 8.10 / 14.80 | 0 | 411162 |

Warm mode permits cache; it does not prove cache hits. An incomplete earlier dist lacked public branding and fonts; a sequential rebuild restored them. Final branding returned image/webp with a decoded image, and complete-build browser captures/performance replaced earlier diagnostics. Its precise cause was not established. This is a local build-output incident, not an additional product-source repair.
