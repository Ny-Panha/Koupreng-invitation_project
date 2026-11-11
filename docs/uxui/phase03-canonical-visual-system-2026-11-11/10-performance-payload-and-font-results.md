# Performance, payload and font results

Method: clean isolated Vite builds for each stage (`--emptyOutDir`), same local Chromium on Windows, 390×844 viewport, reduced motion, loopback previews, fictional read-only DTO fixtures, default unthrottled CPU/network. Five routes were navigated three times each in a fresh context (cold) and revisited once in that context (warm): Home, create event, admin dashboard, admin Studio and Khmer Floral Gold. Values are lab observations, not field CWV. LCP/FCP observers sometimes produced only 1–2 valid values in three trials; no INP was measured.

| Initial asset | Before raw/gzip | After raw/gzip | Delta gzip |
|---|---:|---:|---:|
| User entry CSS | 222,370 / 40,594 B | 225,829 / 41,280 B | +686 B |
| Admin entry CSS | 191,039 / 27,422 B | 194,309 / 28,241 B | +819 B |
| User entry JS | 472,266 / 139,993 B | 472,266 / 139,973 B | −20 B |
| Admin entry JS | 284,587 / 89,593 B | 284,587 / 89,598 B | +5 B |

These are Node zlib gzip outputs from built files; the Vite CLI's gzip result can differ slightly. `evidence/lab-summary.json` records each initial HTML asset (including module preloads), Brotli, every CSS/JS chunk and the three raw timing samples. All generated CSS/JS totaled 4,180,707→4,186,008 B for user and 1,349,647→1,353,122 B for admin. The CSS growth corresponds to the new role taxonomy and scoped adoption; there is no new runtime package.

| Route | Cold load median before → after (range before; range after) | Warm load median before → after |
|---|---|---|
| Home | 75.5→67.8 ms (71.7–82.4; 65.0–71.4) | 49.6→43.0 ms |
| Create event | 65.8→63.8 ms (63.7–68.5; 61.7–66.6) | 50.0→50.4 ms |
| Admin dashboard | 40.2→37.2 ms (39.6–44.9; 36.1–39.8) | 25.9→24.5 ms |
| Admin Studio | 40.9→37.3 ms (36.1–43.0; 36.8–70.8) | 31.1→30.9 ms |
| Khmer Floral Gold | 62.0→64.7 ms (60.2–68.9; 61.8–65.1) | 46.1→63.2 ms |

The invitation warm timing varies and cannot be causally attributed to the token CSS. Studio warm LCP varied from 48–388ms after and is unsuitable for a performance claim. Fixture CLS was 0 for create event/admin dashboard, about .014 for Studio and <.007 for representative invitation; these are local lab observations only. Production targets (LCP ≤2.5s, INP ≤200ms, CLS ≤.1 at field p75) remain targets, not measured achievements.

Admin management now requests local DM Sans/Kantumruy faces; its broad remote Studio catalog remains in `index.html` and was blocked by the offline capture harness. Before admin had an additional CSS-level Google font request; after it is removed. Local DM Sans WOFF2 adds 36,932 B on disk, but face loading is route/glyph-dependent and CDN compression/cache behavior is unmeasured. Selected after captures report loaded local `DM Sans` and `Kantumruy Pro` faces; marketing also loaded `Koupreng Editorial`. Font display and physical layout shift should be checked against production connectivity in Phase 25.
