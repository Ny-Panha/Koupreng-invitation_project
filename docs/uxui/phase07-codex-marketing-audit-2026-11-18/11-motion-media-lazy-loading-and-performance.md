# Motion, media and performance

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

Before is the exact preserved Gemini working build; after is the repaired local build. HEAD is identical because no commits were authorized; source-tree/build hashes distinguish stages. Requests, decoded response bytes, ResourceTiming transfer fields, emitted raw/gzip/Brotli bytes, FCP, observed LCP element/timing, CLS and long tasks are separate records.

Lab design: Chromium/native performance clock, same loopback fixture/hardware, 390/1440, light/dark, normal/reduced, routed cold/revisit contexts, five repetitions per group. Playwright request routing disables normal HTTP caching; revisit is explicitly **routed-revisit**, not proof of native warm cache. External venue images are blocked, so these measurements do not certify their real latency/bytes. Observation window is 700ms after ready/fonts and does not measure field INP or late user scrolling. Available earlier raw rows remain in before/lab-diagnostic-initial.json and before/lab-interrupted-hover-review.json; attempts without a completion record are explicitly excluded; final controlled comparison uses the isolated frozen-source before/after run. The pair ran without concurrent agent browser/unit/build work; final regression confirmations followed it.

Current performance summary: `{"beforeSamples": 240, "afterSamples": 240, "validSamples": 480, "matchedGroups": 48, "reviewTriggers": 0, "fieldCertification": "NOT AVAILABLE"}`. [Comparison](evidence/performance-comparison.json), [build assets](evidence/build-assets.json), [before](evidence/before-manifest.json), [after](evidence/after-manifest.json). Review triggers use >100ms **and** >20% median timing, >20KiB **and** >10% route transfer, or CLS delta >0.02. Triggers are review signals, not automatic source causality.

| Route / width | FCP before → after (ms) | LCP before → after (ms) | Transfer before → after (KiB) | Largest observed CLS before → after |
|---|---|---|---|---|
| contact / 390px | 98.0 → 100.0 | 404.0 → 406.0 | 335.3 → 334.8 | 0.0000 → 0.0000 |
| contact / 1440px | 102.0 → 106.0 | 422.0 → 424.0 | 406.3 → 405.8 | 0.0000 → 0.0000 |
| home / 390px | 168.0 → 160.0 | 212.0 → 196.0 | 494.9 → 443.1 | 0.0011 → 0.0014 |
| home / 1440px | 162.0 → 166.0 | 162.0 → 166.0 | 500.6 → 524.2 | 0.0017 → 0.0030 |
| venues / 390px | 102.0 → 104.0 | 520.0 → 432.0 | 2904.8 → 2905.8 | 0.0009 → 0.0009 |
| venues / 1440px | 98.0 → 104.0 | 490.0 → 448.0 | 2900.4 → 2901.4 | 0.0013 → 0.0013 |

These summary rows pool 40 observations per stage/route/width across mode, motion and routing protocol. The comparison JSON retains all 48 matched five-repeat groups, sample ranges, outlier flags, LCP elements and every review trigger; pooled medians do not replace those groups.

| Emitted HTML/JS/CSS | Raw bytes | Gzip bytes | Brotli bytes |
|---|---|---|---|
| before | 4,202,271 | 1,196,166 | 1,014,082 |
| after | 4,205,210 | 1,196,646 | 1,014,359 |

Emitted totals cover every built route chunk and exclude public media. They are separate from actual route request bytes in the table above.

**Absolute cost remains a review item:** Venues requests the preexisting `background.png` at 2,520,889 decoded bytes (about 2.40 MiB). It dominates the route even when remote venue photos are blocked. Zero relative review triggers do not make that weight negligible. The phase defines baseline-relative diagnostics rather than an absolute venue transfer target; performance/content owners should assess an equivalent smaller derivative and a mobile transfer budget against real-device visual quality. The original decorative art was retained. This cost contributes to the partial F14 decision.

No new runtime dependency, GSAP/Three/WebGL or global smooth-scroll engine. Existing CSS/Framer paths remain; venue reveal no longer hides essential content and selected media is eager. New English editorial face use is an existing licensed local asset with explicit request-cost accounting. Historical RSVP +264ms/+41.51% review and field p75 CWV remain open; a marketing benchmark does not close them.
