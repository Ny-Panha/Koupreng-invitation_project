# Final laboratory performance

Three fresh Chromium 156.0.8078.4 contexts, Windows, local Vite production preview on port 4186, 390x844 CSS pixels, DPR 1, CPU slowdown 4x, 1.6Mbps downstream / 750Kbps upstream / 150ms latency, cache disabled. API responses are synthetic empty catalog data, using the real local template fallback. Browser regression/unit runs had finished before these samples. [Raw measurements and resource entries](evidence/performance.json); command: `node scripts/qa/measure-royal-garden-ui-repair.mjs`.

| Run | LCP | CLS | Initial encoded resource bytes | Initial film requests | Maximum observed event duration |
| --- | --- | --- | --- | --- | --- |
| 1 | 7.028s | 0.000536 | 1,134,699 | 0 | 104ms |
| 2 | 7.032s | 0.000536 | 1,134,699 | 0 | 112ms |
| 3 | 7.028s | 0.000536 | 1,134,699 | 0 | 96ms |

Median LCP is **7.028s**, exceeding the 2.5s target. CLS is below the 0.1 target. The sampled interaction event durations are below 200ms in this run; they are **not field INP**, do not certify all interactions and are not physical-device FPS evidence. No production Core Web Vitals or 60fps certification is claimed.

Entrance-critical original-art derivatives and local fonts remain part of the initial payload. The demo portrait uses its 640px responsive derivative where selected. The MP4 starts loading only after Open; the background audio uses `preload="none"` and a direct user-gesture play request. The approved existing 2,704,609-byte song can add transfer after opening. Protected owner film still uses the existing authorized whole-blob loader; no public URL/security bypass or quality downgrade was introduced to improve a score.

The earlier repair measured a median 7.788s and approximately 1.154MB initial encoded resources under the same nominal profile. That historical run used different title/layout/catalog state and is not a controlled paired A/B experiment. The final measured target miss remains explicit. Further shared-bundle/font/art delivery work requires separate profiling and visual acceptance; it is not hidden by reporting only passing functional tests.
