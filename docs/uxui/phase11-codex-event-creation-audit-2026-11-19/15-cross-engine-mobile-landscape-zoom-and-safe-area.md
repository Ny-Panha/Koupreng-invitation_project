# 15 — cross engine mobile landscape zoom and safe area

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

The focused configuration exercises 320×568, 360×640, 393×851, 768×1024, 844×390, 820×430 and 1440×900 in Chromium, plus 393×851 Firefox and WebKit. It measures document overflow and records relevant overflow ancestors. The stepper is an intentional horizontal control scroller; that is distinguished from page-level clipping.

Captures include loaded forms/review, invalid focus, forced colors, upload failure, reload with missing File, recommendation error and denied premium. Each final metadata record binds locale, theme, viewport, engine, motion and frozen source/build hashes to actual PNG bytes. Manual review is recorded only for images actually inspected; uncaught images remain explicitly pending manual review.

The single failing-before focus capture has a missing original build hash, which is recorded rather than reconstructed as fictitious proof. CSS viewport proxies and lab keyboard bounds do not equal natural browser zoom, real iOS/Android virtual keyboards, safe-area hardware or in-app browsers. Those remain device-QA owner gates. [Visual manifest](evidence/visual-manifest.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
