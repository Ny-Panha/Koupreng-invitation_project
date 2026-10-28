# Performance report

Measured locally using the same explicit profile before implementation and after the final production build: Chromium, 390×844, DPR 1, CPU slowdown 4×, 150ms network latency, 1.6 Mbps down / 750 Kbps up, disabled cache, three fresh contexts. The API is a synthetic empty catalog response using the local catalog fallback. These are laboratory measurements, not field Core Web Vitals or physical-device results.

| Metric | Baseline | V3.2 |
|---|---:|---:|
| LCP samples (ms) | 6676 / 6632 / 6472 | 6564 / 6408 / 6276 |
| Median LCP | **6.632s** | **6.408s** |
| Median CLS | 0.000511 | 0.000511 |
| Encoded entrance resource bytes | 1,151,483 | 1,159,547 |
| JavaScript bytes, representative second sample | 388,210 | 394,832 |
| Font bytes, representative second sample | 178,020 | 178,020 |
| Sum of observed entrance long tasks per sample (ms) | 339 / 363 / 215 | 213 / 219 / 256 |
| Video/audio requests before click | 0 / 0 | 0 / 0 |

The median LCP improved by 224ms (3.4%), with an 8,064-byte (0.7%) entrance-resource increase for the feature work. This small change does **not** establish a large performance gain; three-run local results have normal variability. **The 2.5-second target was not achieved.**

The measured LCP element remains the existing responsive golden calligraphy (`opening-calligraphy-320.webp`). It was discovered around 5369ms in the representative baseline run; its resource request now starts around 209ms and finishes around 1497ms using a matching catalog-only responsive preload. This hint never fetches unknown owner/protected media for hosted invitations. Its paint still waits for the shared route/template rendering path; preloading alone does not remove that bottleneck.

Profiling confirms substantial shared entry/route JavaScript, stylesheet and local font work before the Royal cover mounts. DMSans, Kantumruy Pro, Battambang and Cormorant account for the observed 178KB font payload. Existing small decorative effects still reference a larger ornamental WebP crop. Further gains require reducing the shared critical path and decorative/font costs while checking visual fidelity. No new font weights, bitmap assets, gallery preload, eager film or second audio controller were added. Export construction/download occurs on guest action; the shared engine can already have loaded some utility code. The calendar uses the existing light date utilities and mounts with information content.

Actual request timings, LCP element details, long tasks, layout shifts and image priorities are in [before JSON](evidence/performance-before.json) and [after JSON](evidence/performance-after.json). Reproduce with `node scripts/qa/measure-royal-garden-v3-2.mjs before` or `after` against the corresponding build on local port 4186. Do not run concurrent test/build workloads during comparisons. No field INP, native Safari performance, image-decode CPU attribution or FPS threshold is claimed.
