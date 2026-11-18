# 15 — performance, motion and payload remeasurement

The current series uses the unchanged final Phase 05 baseline and final Phase 06 production builds. [Build inventory](evidence/final-build-assets.json) gives every JS/CSS hash and emitted totals. [Lab summary](evidence/lab-summary.json) and [performance comparison](evidence/performance-comparison.json) distinguish navigation resources, cache hits, LCP element/render state, CLS, long tasks, initial request bytes and variability. Raw samples remain local in `output/playwright/uxui-phase06-2026-11-17/lab-results.json`.

Protocol: Chromium 156.0.8078.4, loopback fictional HTTP API/static server, DPR 1, 390×844 / 1440×900, normal/reduced, CDP CPU 2×, 20ms latency, 10Mbps down / 5Mbps up, at least three observations per condition. Actual HTTP caching is enabled: first navigation in a new context is cold, second is warm, with browser cache-hit events recorded. The server’s API mocks fail unknown reads/mutations closed and CSP excludes external resources. Its local uncompressed transfer timing is not a production CDN model.

This corrects a historical methodology limit: [Playwright documents that request routing disables HTTP cache](https://playwright.dev/docs/api/class-page#page-route). Mocks were moved out of page.route into a loopback fixture server. The smoke check recorded zero cold hits and 27 warm hits on home. Therefore older “warm” routed series are historical navigation comparators, not equivalent actual-cache measurements; no causal subtraction is claimed across the changed method.

The Date-only override preserves native performance entries. Screenshots consume a paint; no Playwright fixed clock erases navigation/paint/resource observations. A wrong editor readiness selector caused rejected first-attempt samples, and an interrupted before-only series is archived rather than blended into the final restarted comparison.

Current sample count: **624**; unresolved measurement errors: **0**. Review budgets require BOTH >100ms and >20% for load/FCP/LCP, BOTH >20KiB and >10% for transfer, or CLS increase >0.02. These are local diagnostic change budgets, not field CWV thresholds. The six historical condition groups are listed individually in performance-comparison: cinematic desktop normal warm load/FCP; four create-event LCP conditions; RSVP mobile normal warm LCP — seven metric triggers in six groups.

| Historical condition | Metric | Final before → after median | Delta | Final three-trial verdict | Final five-round verdict |
|---|---|---:|---:|---|---|
| cinematic-invitation 1440 no-preference warm | load | 214 → 205.7 | -8.3 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| cinematic-invitation 1440 no-preference warm | fcp | 136 → 132 | -4 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| create-event 390 no-preference warm | lcp | 724 → 732 | 8 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| create-event 390 reduce warm | lcp | 528 → 472 | -56 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| create-event 1440 no-preference warm | lcp | 496 → 496 | 0 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| create-event 1440 reduce cold | lcp | 1716 → 1692 | -24 | NO DIAGNOSTIC TRIGGER | NO DIAGNOSTIC TRIGGER |
| rsvp 390 no-preference warm | lcp | 916 → 912 | -4 | NO DIAGNOSTIC TRIGGER | REVIEW REQUIRED |


The earlier post-safe-area 624 series and its **220-observation five-round alternating-stage follow-up** are retained in `performance-comparison.pre-auth-shift.json` and `performance-diagnostic-review.pre-auth-shift.json`; their raw samples remain local. The follow-up had **0 timing budget flags**. The repeatable mobile auth CLS increase was isolated to toolbar reflow: 0.0062 baseline → 0.0484 first implementation → 0.0049 reserved-row diagnostic. Commit `db428514` applied that fix. The later zero-scroll correction required another final build: **all 312 final-after observations were resampled**, while the already validated 312 observations of the unchanged baseline were retained with their original command windows. This forms the current 624-observation matched-condition matrix; it is not described as 624 newly executed post-fix navigations. [Conclusions](evidence/performance-conclusions.json) records actual final auth values and every historical metric verdict. One premature attempt was stopped after an admin build-origin mismatch was found; it is not blended into the current series. Missing observations from transient navigation/readiness timeouts are retried as complete cold/warm pairs with the original attempt archived.

Final diagnostic review flags (if any) remain explicit below. Overlapping ranges and an unstable three-sample median do not prove a source regression; these require targeted causal review rather than a fabricated performance pass.

A separate **140-observation final-source follow-up**, in [performance-diagnostic-review.json](evidence/performance-diagnostic-review.json), alternates before/after over five rounds for every final trigger dimension and the six historical groups. It has 1 repeat budget flags; raw observations are separate from the 624 matrix. [Resource-window diagnosis](evidence/resource-window-diagnosis.json) compares unchanged static media hashes and completion/cache windows for any transfer flags; existing media arriving in a different snapshot is not newly emitted application code.

| Five-round condition | Metric | Delta | Percent | Before range | After range |
|---|---|---:|---:|---|---|
| rsvp 390 no-preference warm | lcp | 264 | 41.51% | [632, 896] | [880, 932] |


The RSVP LCP candidate is the same visible `.rsvp-count-context` paragraph, with the same text/font and 59 warm cache hits, and no recorded long tasks in the five-round samples. The primary invitation-editor flag did not repeat, while the five-round RSVP flag remains. [RSVP paint diagnosis](evidence/rsvp-paint-diagnosis.json) separately records content/font readiness, actual LCP entries, candidate bounds/ancestors and the effect of consuming earlier frames. This capture-scheduling experiment is not blended into either comparison and does not by itself prove a field or source regression. The timing gate remains REVIEW REQUIRED.

The [24-observation supplemental review](evidence/rsvp-paint-review.json) found no LCP change-budget flag in either scheduling mode. Warm median deltas were +16ms with the primary snapshot and −16ms with earlier consumed frames. Variable paint times occur in both builds; the original five-round +264ms / +41.51% RSVP result remains visible, with no asserted causal fix or production performance certificate.

| Final condition | Metric | Delta | Before range | After range |
|---|---|---:|---|---|
| invitation 390 reduce warm | lcp | 556 | [492, 1376] | [712, 1376] |


| Stage | App | Files | Raw bytes | Gzip bytes | Asset-list SHA-256 |
|---|---|---:|---:|---:|---|
| before | user | 271 | 4182623 | 1190891 | `171b5ca00c41831ba054fc5eeb74c7cc1776b91ba4a721575f72dcb759732f3a` |
| before | admin | 52 | 1350113 | 342425 | `63eb89a29fe9a501e49a10c63844aedf8afbc1aa03e21704d35d2ce8d71e69d5` |
| after | user | 271 | 4188545 | 1192407 | `64d44daf23fe87cc008f69610f9f1b02f0d30177aa262239913aaeed1a15c917` |
| after | admin | 52 | 1352569 | 342904 | `4e4dd2ef03f7beb029859936a8cf7bc84f8ac225369cc985e77acfacbfb0ea92` |


All emitted chunks are not initial page payload. Resource transfer and cache state are measured separately. Historical final Phase 05 user raw total 4,182,623 B is reproduced; minor admin gzip/hash differences from historical reports are qualified by the aligned preview build origin. Current source introduces no dependency or art/media asset.

Local interaction/frame observations, if available, are in [interaction-profile.json](evidence/interaction-profile.json) and explicitly include automation/profiling overhead. No no-interaction navigation series measures INP. Field p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 remain future production targets, not a certificate. Physical low-end GPU/radio behavior, media decode cost and actual user p75 require approved device/field measurement.
