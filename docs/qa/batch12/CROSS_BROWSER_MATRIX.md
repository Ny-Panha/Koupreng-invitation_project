# Cross-browser results

| Scope | Chromium 156.0.8078.4 | Firefox 157.0 | WebKit 27.2 |
|---|---|---|---|
| All 135 leaf read/render contracts | PASS 135 | Full inventory not run | Full inventory not run |
| Template roundtrip/load recovery/unsaved Back | PASS | PASS | PASS |
| Package keyboard/focus/labels/contrast | PASS | PASS | PASS after focus correction |
| Public opening/localized content | PASS | PASS | PASS after button-name correction |
| Wrong-role/expired/cross-app sessions | PASS | PASS | PASS |
| Server-controlled payment returns/denied receipt | PASS | PASS | PASS |
| Khmer/English, seven widths, reduced motion | PASS selected states | PASS selected states | PASS selected states |

The final dedicated run has **174 passes**: 135 Chromium leaf contracts and 13 core/security cases in each engine. There are no retries or skips. Earlier exploratory failures exposed selector/fixture mistakes and real contrast, focus and naming defects; they were corrected, not counted as passes.

These are Playwright engine builds on Windows, not real iPhone Safari, Android Chrome or physical camera hardware. Cross-origin providers are controlled fixtures or blocked. Real providers and hardware are not certified by this matrix.
