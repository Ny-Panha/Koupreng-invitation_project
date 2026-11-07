# Performance evidence and limits

The browser suite records one local sample in `evidence/performance.json`: production Vite preview, desktop Chromium, 390×844, reduced motion, API fixtures, no CPU or network throttling. Its PerformanceObservers capture LCP, cumulative layout shift excluding recent input, and total long-task duration. It also records approximate JS heap, resource count, and the 95th percentile of 60 scroll-frame intervals. These are local observations, not mobile field Core Web Vitals or a before/after performance claim.

Final sampled values are retained in that JSON rather than treated as stable benchmarks; timing varies with browser startup and concurrent local work. The final screenshot pass samples the same declared profile again.

Final sample: LCP 808 ms, CLS 0.000692, 66 ms total long-task duration, approximate heap 11.9 MB, scroll-frame p95 16.7 ms, 105 resource entries. This is one unthrottled local sample, not a production performance guarantee.

The Royal Garden production layout chunk is about 64.3 kB / 20.1 kB gzip. New curtain texture is 13 kB. The transparent frame has 640px and 1024px variants. Supplied art, calligraphy and buttons retain their existing responsive image variants. No animation library or dependency was added.

Curtains animate transforms; photo transitions animate opacity and a small transform. The curtain texture is requested only when the curtain scene mounts. The montage mounts only the active and adjacent photographs. Gallery tiles use lazy image loading and supplied thumbnails where available; the original is loaded by the lightbox on demand. Browser lazy-loading heuristics can load nearby offscreen tiles, so this does not promise a fixed request count for arbitrary galleries.

The audio element persists across scene, gallery and language changes. Visibility pauses timed scenes and CSS motion. Reduced-motion and Save-Data bypass the cinematic gate and decorative effects. The existing observer uses the inner scroll container and leaves content visible even without Web Animations support. No full-screen filter is animated.

No baseline was instrumented under the same performance profile, so no performance improvement is claimed. Memory is Chromium's approximate `performance.memory` value, not a leak test. Real-device thermal/battery behavior, slow-network video, production CDN caching and long-session memory remain unverified.
