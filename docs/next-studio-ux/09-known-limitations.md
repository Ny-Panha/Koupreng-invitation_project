# Limits and release interpretation

- No production deployment, live payment, live migration, DNS change or package-policy mutation was performed. Local application package/template data was read; all security writes use owned disposable schemas.
- Browser event/auth/payment fixtures demonstrate UI behavior only. Actual HTTP/JWT/MySQL tests separately prove enforcement and concurrency. The real-catalog browser check reads the real backend while isolating event writes with fixtures.
- Physical mobile/tablet hardware and manual screen-reader testing are unavailable. Automated Chromium mobile emulation, Firefox/WebKit desktop engines, keyboard checks and Axe do not replace them.
- Account current-entitlements currently supplies invitation and guest usage. Team capacity is shown from authoritative denial metadata; the UI renders a team progress meter only if verified usage is supplied. It never invents a team count.
- Native browser leave-page guards remain synchronous. Some existing budget/gift/expense/floor-plan confirmations remain outside the selected migration; the shared facade supports incremental adoption.
- Existing server policy intentionally reserves video/monogram/illustrated map for activated PREMIUM snapshots. This phase preserves that policy rather than treating every paid plan as eligible.
- Prior broad browser specifications include retired templates, historical navigation/selectors and catalog fixtures without current publication/checkout metadata. The complete run and targeted corrections are reported in the QA document; a fixture failure is not presented as proof of a server defect or as a passing gate.
- No library installation was required. The existing React modal stack still owns focus, portals and iframe Escape handling.
- Theme preferences apply to public marketing and host controls. Authored invitations, QR image backgrounds, ticket artwork and printed reports intentionally retain their own palette. Pixel baselines use the installed Windows Chromium/font environment; cross-platform differences require their own reviewed baselines.
- Local Royal Garden is ACTIVE and Premium with an explicitly featured code. Standalone checkout remains blocked by the existing zero-price product-policy review; no individual sale price was approved or invented. Production catalog/activation remains unverified.

Release requires the new critical access/save/recovery journeys and all unit/backend integrity gates to pass. Any remaining broad-suite failure must be identified explicitly; this report does not claim unconditional production readiness from mocked browser state.
