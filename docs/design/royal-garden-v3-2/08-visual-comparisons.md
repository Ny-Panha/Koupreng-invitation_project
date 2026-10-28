# Visual comparisons and evidence

Baseline artwork/frame reference: [existing V3.1 information screenshot](../royal-garden-v3-1/evidence/browser/chromium-critical-information-top.jpg). This historical capture has different fixture content; it is a visual-language reference, not a same-content pixel-diff claim. V3.1 regression browser tests recapture entrance, film, soundtrack and fixed-frame behavior for this change under local `output/playwright/royal-garden-v3-2/v31-regression/`.

The reviewed V3.2 contact sheets contain nine guest states each. Desktop sheets crop the viewport around the unchanged central frame; full viewport originals remain local. They preserve actual rendered screenshots, not design mockups.

| Viewport | Reviewed evidence |
|---|---|
| 320×568 | [Contact sheet](evidence/review-320x568.jpg) |
| 375×667 | [Contact sheet](evidence/review-375x667.jpg) |
| 390×844 | [Contact sheet](evidence/review-390x844.jpg) |
| 430×932 | [Contact sheet](evidence/review-430x932.jpg) |
| 768×1024 | [Contact sheet](evidence/review-768x1024.jpg) |
| 834×1194 | [Contact sheet](evidence/review-834x1194.jpg) |
| 1024×768 | [Contact sheet](evidence/review-1024x768.jpg) |
| 1440×900 | [Contact sheet](evidence/review-1440x900.jpg) |
| 1920×1080 | [Contact sheet](evidence/review-1920x1080.jpg) |

[Studio and live preview](evidence/studio-live-preview.jpg), [Khmer countdown](evidence/390x844-km-countdown.jpg), [Khmer program](evidence/390x844-km-schedule.jpg), [Khmer closing](evidence/390x844-km-closing.jpg).

These fixtures use fictional hosts, venues, accounts and deliberately non-payment QR payloads. They are test evidence, not published owner content or payment instructions. Reproduce with `playwright.royal-garden-v32.config.js`, then run `python scripts/qa/package-royal-garden-v3-2.py`.
