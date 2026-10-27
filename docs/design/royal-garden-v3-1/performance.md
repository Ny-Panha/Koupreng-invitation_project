# Performance measurement

These are local laboratory measurements, not production field metrics or physical-device FPS.

## Identical before/final profile

- Windows, Chromium 156; 390×844 CSS px, DPR 1.
- Local Vite production preview on `127.0.0.1:4186`.
- CDP CPU slowdown 4×, downstream 1.6 Mbps, upstream 750 Kbps, 150ms latency.
- Cache disabled; three fresh browser contexts for each version.
- Synthetic empty catalog API; the real local catalog fallback renders. No live customer data.
- Real Open and Skip interactions follow initial measurement. The final run uses the requested Nisai soundtrack.
- Reproduction: `node scripts/qa/measure-royal-garden-v3-1.mjs after` from repository root, with no concurrent test workload.

| Metric | Before main `1b4b8d15` | Final refinement |
| --- | ---: | ---: |
| LCP, three samples | 6964 / 6888 / 6968 ms | 6604 / 6520 / 6768 ms |
| Median LCP | 6964 ms | 6604 ms |
| CLS | ≈0.000536 | ≈0.000511 |
| Initial encoded response bytes | 1,134,744 | 1,151,483 |
| Audio downloaded before interaction | No | No |
| Pre-wedding video downloaded before interaction | No | No |
| Largest observed interaction duration, each final run | — | 48 / 56 / 64 ms |

Median LCP improves about 5.2%. **The 2.5s goal is not achieved** under this profile. CLS is below 0.1. The reported interaction durations cover sampled synthetic actions; they are not verified field INP. No measured 60 FPS claim is made.

## Causes and scope

The baseline's largest contentful element is the portrait, requested after the shared/template route chain and painted around 6.96s. Catalog-only responsive portrait discovery and warming the same lazy Royal module shorten that chain. The 480px portrait is 63,230 bytes versus 96,678 for the former 640px choice. The responsive frame hint is restricted to the catalog route; hosted invitation rendering still resolves authorized owner media first.

The final transparent foreground changes the visible composition and LCP candidate: the final recorded largest element is the opening calligraphy. On the first final sample it is requested around 5.34s and renders at 6.60s. The shared experience chunk finishes around 4.68s, followed by component/font/image work. The complete 128,132-byte mobile frame is discovered early; the supplied source is 4,561,248 bytes. Its original blue/gold pixels and alpha are preserved.

Remaining transfer includes the shared app/runtime, multiple existing font families, and the older 166,806-byte arch texture sampled by the existing petal/flower effects. Initial encoded bytes increase about 1.5% after the requested new foreground and wide button. Fixing the broader shared-route/font/decorative transfer path is outside the latest position-only steering. No assets were silently removed or motion features disabled to produce a better score.

`performance-after-first.json` records an intermediate 5.07s median before the latest transparent-frame and positioning requirements. It is retained as engineering history and is **not** presented as the final result. The complete resource waterfalls, selected responsive sources, LCP candidate and layout shifts are in [before](evidence/performance-before.json) and [final](evidence/performance-after.json).
