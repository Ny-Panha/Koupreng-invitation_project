# Batch 11 remaining gaps

## P0/P1

No unresolved P0/P1 defect has been demonstrated in the executed scenarios. This is not evidence that untested routes or environments are defect free. Payment/provider state is never certified by a mocked browser response.

## Route and workflow verification still pending

- Rows marked guard-only or pending in [route-matrix.json](route-matrix.json) still need authenticated route-specific functional audits. The previous 87 `NOT IMPLEMENTED` route rows describe modernization/verification debt, not 87 missing screens.
- Legacy local-draft editors/preview identities, every invalid/deleted-resource alias, suspended-account deep links and every refresh/history combination have not been exhaustively exercised in the browser. Existing focused unit/backend tests cover some of these independently.
- Full media-upload/import/export journeys, every guest pagination/import failure, ticket export on actual printers, camera permission/device failures, all payment failure/cancellation/rate-limit/network races and all team roles on every module need further route-level coverage.
- Admin user detail, templates and package pages have targeted route/control evidence. Complete template authoring/preview synchronization and package revision/entitlement behavior across the admin UI remain separate audits; shell rendering does not complete them.
- The real-browser chain uses the existing Event Essential template and a disposable, explicitly granted owner package. Template checkout and payment authority are tested separately; it does not represent a real bank-paid customer-to-guest purchase.
- Responsive checks cover representative delivery and notification workflows at 320, 375, 390, 430, 768, 1024 and 1440 pixels, in English and Khmer. They do not cover every route/state at every width. Automated Axe checks do not substitute for a full manual WCAG, contrast, focus, screen-reader or touch-target audit.
- Diagnostic filtering covers documented structures and examples. Unknown secret syntax and unlabelled personal data remain outside its guarantee.

## Tier D: deliberately pending

Real ABA settlement, real Google/Telegram OAuth, email deliverability, live Telegram delivery, physical camera scanning, actual iOS/Safari, Android devices and non-Chromium engines were not exercised. No provider/device pass is inferred from Chromium viewport emulation, fixtures, browser redirects or local grants.

Docker Desktop's daemon was unavailable. A running loopback MySQL service allowed disposable-schema integration tests; container-specific and production infrastructure behavior remains pending. The full default Maven suite contains environment-gated skips, reported explicitly in test results.

## Batch 12

Performance, Security, Accessibility, Cross-Browser QA and Release-Readiness Assessment: prioritize the remaining authenticated route audits, larger-data query/bundle measurements, manual accessibility, real browser engines/devices and a separately authorized provider sandbox plan. Production readiness requires those additional results and operational release checks.
