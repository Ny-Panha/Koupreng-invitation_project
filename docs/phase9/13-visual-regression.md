# Visual evidence and review

The 106 evidence PNGs (32 original user, 55 current user, 19 real local/admin captures), dimensions and SHA-256 digests are recorded in `evidence/screenshots.json`. Screenshots are evidence of the named state; they are not a claim of exhaustive route coverage or a deterministic pixel-diff budget. Dates, clocks, fictional data, media loading and animation make raw pixel equality inappropriate for several screens.

## Comparison method

The original user production build was retained before implementation. Its captures cover landing, login, event list, event dashboard, marketplace, Studio, packages and public invitation in English/Khmer at 390 and 1440px. The original admin source was rebuilt from an exact archive of `3452e436`; both admin builds authenticate against the same disposable local API. Admin screenshots cover populated dashboard/reports in English/Khmer at both widths. No production account or revenue is used.

User route comparisons use explicit fictional response fixtures. Premium and ticket behavior has separate real local browser evidence. A capture review found loading-only screenshots; capture gates were strengthened to wait for route headings, fonts and completed admin report loading, and those captures were replaced. This matters because a successful screenshot command alone does not prove the intended screen was visible.

## Reviewed comparisons

| Surface | Before | After | Specific finding |
|---|---|---|---|
| Studio phone | [Original Studio](evidence/before/studio-kh-390.png) | [Media & Opening](evidence/after/studio-mediaOpening-kh-390.png) | Six parent choices, native selector and grouped disclosures reduce the long navigation list while retaining Khmer labels and preview access |
| Studio desktop | [Original Studio](evidence/before/studio-en-1440.png) | [Schedule & Venue](evidence/after/studio-scheduleVenue-en-1440.png) | Date, program and venue editors share one parent; existing phone artwork remains intact |
| Marketing phone | [Original landing](evidence/before/landing-en-390.png) | [Current landing](evidence/after/landing-en-390.png) | Shared warm canvas, readable neutral text and established action roles; existing product content/hierarchy reused |
| Event workspace | [Original dashboard](evidence/before/dashboard-en-390.png) | [Current dashboard](evidence/after/dashboard-en-390.png) | Shared application canvas and existing responsive tools retain their product behavior |
| Admin phone | [Original dashboard](evidence/live/admin-before-dashboard-en-390.png) | [Current dashboard](evidence/live/admin-after-dashboard-en-390.png) | Warm semantic canvas, stronger headings/muted text/status contrast and keyboard-accessible horizontal table region |
| Admin reports | [Original reports](evidence/live/admin-before-reports-km-1440.png) | [Current reports](evidence/live/admin-after-reports-km-1440.png) | Shared headings/actions without changing financial amounts, currency separation or report contracts |
| Ticket images | Existing gallery-bound upload reproduced through HTTP | [Actual local design](evidence/live/ticket-images-en-1440.png) | Independent images persist; focal controls, fit/opacity, explicit save/export feedback and a preserved white QR area |
| Guest film | Existing template opening | [Decoded film](evidence/after/video-playing-en-1440.png) | Optional modal after the cover, contained aspect ratio, sound/Skip controls; original invitation visible behind it |

All six Studio groups have English/Khmer phone and desktop captures. Ticket mobile Edit/Preview and full-width layout checks run in all three bundled browser engines. Inherited Studio tests cover 320 through 1920px; Phase 8 date/program captures cover nine widths in both languages. These older regression files remain in their established evidence location and are not relabeled as new Phase 9 source.

Visual review checked actual image files for Studio desktop/Khmer phone, ticket preview, decoded film, marketing phone and populated admin comparisons. Template cover images, floral/ceremonial art and authored style controls remain in their existing renderer paths. No template was replaced with application dashboard styling.

## Bounds

No physical device or human Khmer editorial review is claimed. Browser emulation does not establish iOS codec behavior. Windows WebKit verifies MP4 error recovery rather than decoding. The source inventory covers more route variants and provider-dependent states than the representative screenshot set; use `01-route-inventory.md` to distinguish them.
