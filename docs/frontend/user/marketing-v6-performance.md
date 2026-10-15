# Marketing V6 performance — 2026-10-15

## Result and limits

Desktop Khmer median LCP is **2.436s**, versus the historical V5 **2.632s** and
fresh same-session V5-code baseline **2.552s**. English medians also decreased.
**The four-case target is NOT fully met:** mobile Khmer measured **2.556s**,
56ms over 2.5s and 28ms above this session's baseline. All observed CLS values
remain below 0.001. These are three-run local lab medians, not field p75 CWV,
statistical proof of universal improvement, INP or conversion results.

## Reproduction and conditions

Run from `apps/frontend-user` with a production preview on 127.0.0.1:4173:

```powershell
npm run build
node scripts/capture-marketing-v6.mjs before --performance
# Apply V6 and rebuild, leaving the preview on the same host/port.
node scripts/capture-marketing-v6.mjs after --performance
node scripts/capture-marketing-v6.mjs after --diagnostic
```

The committed `capture-marketing-v5.mjs` is unchanged. The V6 copy retains its
LCP observer and observation window: three cold Chromium contexts per language
and width; viewport 390×900 / 1440×900, DPR1, 4×CPU, 200,000 B/s download,
75,000 B/s upload and 150ms network latency; networkidle, fonts.ready, then 1s
without interaction. Same template/package fixtures, no real API submissions.
No other build/test jobs ran during the median measurements. Browser:
Chromium 153.0.8010.12, Windows, local Vite production preview.

This SPA uses client rendering, not hydration. Request interception disables
browser caching; cold contexts and identical routing apply to both phases.
External Telegram SDK loading was retained in both builds. It adds live
third-party variability. Diagnostics use Chrome tracing in a **separate** run;
their LCP values are excluded from the median table.

The `before` production build came from clean HEAD `96682171`; historical V5
values remain in its original reports and evidence. Source-map-only profiling
builds went to ignored `profile-before/` and `profile-after/`. Reframed baseline
state screenshots later used the archived `profile-before` build on port 4186;
all timing comparisons above used port 4173 before and after, without tracing.

## LCP distributions

| Locale / width | Historical V5 median | Fresh before runs (s) | Before median | V6 runs (s) | V6 median | Change vs fresh baseline | ≤2.5s median |
| --- | ---: | --- | ---: | --- | ---: | ---: | --- |
| km / 390 | 2.480 | 2.424, 2.528, 2.560 | 2.528 | 2.532, 2.556, 2.604 | 2.556 | +0.028 | **FAIL** |
| km / 1440 | 2.632 | 2.532, 2.552, 2.736 | 2.552 | 2.492, 2.436, 2.400 | 2.436 | −0.116 | PASS |
| en / 390 | 2.316 | 2.556, 2.336, 2.396 | 2.396 | 2.136, 2.136, 2.208 | 2.136 | −0.260 | PASS |
| en / 1440 | 2.384 | 2.324, 2.456, 2.388 | 2.388 | 2.204, 2.152, 2.204 | 2.204 | −0.184 | PASS |

The 196ms desktop Khmer difference from historical V5 includes cross-session
variance. The better causal comparison is this session's 116ms reduction.
Three samples cannot establish statistical significance. Mobile Khmer retains
the faster gallery and intact typography despite its unsuccessful LCP result.

Maximum CLS before/after: mobile km/en **0**; desktop km
**0.00011290901089891976** and en **0.00013158516589506175**, unchanged.
The observer uses the same no-recent-input shift sum as V5; this short first-view
lab observation is not a field session-window CLS study.

## LCP attribution and paint order

Every median run identifies the same hero portrait as LCP. It remains high
priority, eager, asynchronously decoded and preloaded with the same `sizes` and
`srcset`; no content or image geometry was reduced.

Median subphases below are the browser Resource/Navigation Timing values in
`performance.json`. Independently calculated medians need not sum to median LCP.

| Locale / width | Phase | Navigation responseStart (ms) | Resource start minus responseStart | Image duration | Image-end → LCP paint |
| --- | --- | ---: | ---: | ---: | ---: |
| km / 390 | Before | 4.6 | 202.1 | 1346.7 | 992.3 |
| km / 390 | After | 6.4 | 219.9 | 1232.7 | 1103.8 |
| km / 1440 | Before | 3.0 | 200.2 | 1352.8 | 1002.5 |
| km / 1440 | After | 3.2 | 192.4 | 1265.6 | 984.7 |
| en / 390 | Before | 2.8 | 208.0 | 1337.0 | 848.2 |
| en / 390 | After | 2.8 | 180.5 | 1241.4 | 719.0 |
| en / 1440 | Before | 2.7 | 200.5 | 1328.2 | 868.6 |
| en / 1440 | After | 4.5 | 189.8 | 1213.6 | 796.7 |

Navigation responseStart in this fixture/CDP setup is a local-host timestamp,
not production TTFB. CDP waterfall response events also capture the artificial
network delivery delay (for example, ~182ms document request→response in the
first before run). Do not infer a 3ms production response or backend speed from
the navigation column. Raw timestamps, priorities, response headers and loading
completion are retained in every `waterfall-<locale>-<width>-<run>.json`.

The first before km/mobile run paints its background at 1.312s; first contentful
paint and portrait LCP occur at 2.424s after entry evaluation/layout. This is an
entry/render bottleneck as well as image delivery. Mobile Khmer's after render
delay increased even as image duration and total task time decreased. Removing
more artwork or moving essential content below the fold is not a valid fix.

## JS, CSS and main thread

| Asset / observation | Before | After |
| --- | ---: | ---: |
| Vite entry, uncompressed | 465.13KB | 423.38KB |
| Vite entry, build gzip estimate | 134.03KB | 123.52KB |
| Entry Resource Timing encoded body, representative km/desktop | 133,092B | 122,568B |
| Entry CSS encoded body, representative km/desktop | 27,941B | 25,497B |
| km/desktop median CDP ScriptDuration | 273ms | 273ms |
| km/desktop median CDP TaskDuration | 1159ms | 820ms |
| km/mobile median CDP ScriptDuration | 271ms | 345ms |
| km/mobile median CDP TaskDuration | 1198ms | 990ms |

Vite's gzip estimate and the preview server's encoded body are different gzip
outputs; compare like with like. HTTP transfer bytes also include headers.
The eager entry no longer contains HostNav, management message dictionaries,
Modal, invitation redirect or its storage helpers. Home stays eager; the template
registry and authentication initialization remain unchanged. HostShell and its
CSS load under the existing protected route when needed. This introduces a
host-shell chunk load on account entry; editor/handoff E2E passed with it.

Diagnostic Chrome trace event totals, before→after km/desktop: V8.CompileCode
103.4→93.8ms, V8.ParseProgram 47.5→32.2ms, module evaluation 111.8→73.4ms,
Layout 264.2→164.5ms and Paint 85.0→37.6ms. These are single instrumented
samples, not exclusive/nonoverlapping CPU buckets. Background streaming parse
events include waiting; do not sum them as main-thread blocking. Decompression
was not isolated as its own CPU measurement. Long tasks still exist: per-run
maximum task durations range 255–435ms before and 231–420ms after.

No interaction is made during median capture, so Event Timing arrays are empty.
Functional keyboard/touch checks are not field INP measurements. Field p75 INP
and React render attribution beyond browser startup traces remain unmeasured.

## Images, fonts and network

- DPR1 hero: **480w WebP, 39,796B**, once per initial navigation, high fetch
  priority, at both lab widths. Painted width ~287px mobile / 423px desktop.
  DPR2 inspection selects 768w on mobile and the existing 960w portrait on
  desktop; see `after/dpr.json`. No hero asset or preload change was necessary.
- Known gallery sources: 667,795B JPEG → 27,670B (compact mobile 320w) /
  100,188B (desktop 640w) WebP; 1,064,977B JPEG → 37,286B 240w WebP in the
  compact/mobile and DPR1 desktop painted frame. Combined when requested:
  **1,732,772B → 64,956B mobile / 137,474B desktop** (96.3% / 92.1% lower).
  DPR-aware larger candidates support sharper displays. The separate full
  catalog uses its larger painted-area sizes. No original is deleted.
- Catalog starts after LCP in the measured requested cases; lazy heuristics
  differ by geometry/timing. One baseline EN/mobile run did not request the two
  JPEGs before observation ended. Do not compare its page-total bytes to a run
  where the gallery loaded, or claim every initial visit saves 1.73MB.
- Khmer preload remains Kantumruy Pro **76,848B**. English preloads DM Sans
  **36,932B**; Cormorant **24,320B** and Khmer for bilingual UI may also load.
  `font-display: swap` remains. No duplicate Google font stylesheet requests
  occurred on the public routes. Fonts compete for bandwidth but do not create
  a new blocking stylesheet. No FOUT/FOIT duration or glyph shaping certification
  is claimed from screenshots; full existing Khmer glyph coverage is preserved.
- The local preview sends gzip for HTML/JS/CSS and `Cache-Control: no-cache`
  with ETags for the observed resources. Images/fonts are already compressed.
  The external SDK request and response are in the waterfall; no SDK/auth
  behavior was changed. Production cache/CDN headers and compression are
  **BLOCKED / unmeasured**, not passed.

## Evidence and next experiment

`output/playwright/marketing-v6/` contains build logs, before/after per-run JSON,
24 median-run waterfalls, separate startup Chrome traces, diagnostic values,
source-map profiling builds and visual/state evidence. Open `startup-trace.json`
in Chromium Performance tooling; diagnostic results are not mixed into medians.

The first safe experiment removed eager host/UI/dictionary work and reduced
catalog transfers. It improved desktop Khmer and both English medians; mobile
Khmer failed the target. Font subsetting was rejected without demonstrated
coverage, and hero geometry/preload changes were unnecessary. A next experiment
could separate static marketing presentation from the retained template registry
or profile Khmer layout/font contention with more controlled runs. That work
needs identity/editor regression coverage and a larger paired sample, followed
by an owner-approved staging host and real devices. No production changes or
unapproved field measurement were made.
