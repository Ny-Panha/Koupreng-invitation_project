# Security, data truthfulness and accessibility review

## Enforced boundaries

All new APIs authenticate and authorize on the server. Event owner, platform role, accepted collaborator role and owner subscription remain distinct. Team codes are 256-bit random values, stored as SHA-256 hashes, expire after seven days and are bound to the intended email. List/reload responses do not disclose codes. Acceptance, membership changes and capacity checks lock the owner/membership transactionally. Removal, role changes, owner entitlement expiry and over-capacity policies are evaluated on subsequent requests. Legacy membership alone is not explicit consent to the new event tools.

Operational managers can edit invitation/guest/RSVP/seating/check-in modules. Designers have invitation tools. Check-in staff use a bounded redacted roster. Viewers have event/report reads. Sensitive publication, access settings, membership administration and financial operations stay owner-controlled. Contribution fields are redacted for collaborators and cannot be forged or silently cleared by their guest edits. Owner-only legacy helpers were not generalized globally.

ExpectedUpdatedAt and READ_COMMITTED locking protect participating clients from silent lost updates. Real concurrent HTTP writes produced one success and one conflict. Conflicts retain local edits, suspend blind retries and offer recovery. There is no presence stream or real-time multi-user synchronization claim.

Guest pages bind and validate filters, cap rows and paginate on the server. Selected export accepts at most 100 distinct event-scoped IDs, fails the whole selection for missing/cross-event IDs and applies the existing CSV formula escaping. It excludes contacts, guest tokens, notes and money. Analytics requires both report permission and the owner's Advanced Analytics entitlement; dates are bounded and no contact or financial data is returned.

JWT expiry, token-version checks, fresh account state, appropriate cookie/CSRF protections, HMAC/trusted payment evidence, server-owned prices, payment reconciliation/idempotency and immutable purchase benefits remain enforced. Existing STAFF remains ROLE_STAFF; the stale native test expecting STAFF to become ADMIN was corrected, with an explicit ADMIN assertion retained. No server permission was loosened to satisfy a test. Native check-in history fixtures now provision an explicit nonrevenue grant rather than bypass the feature guard.

## Admin dashboard audit

The previous dashboard fabricated daily curves, week-on-week growth, fallback $4,772 cash, RSVP goals/rates, 98% delivery, 99.98% uptime, health assertions and a notification count. These displays were removed. Current cards use actual receipt/counter responses, show unavailable when a report is absent, separate currencies and preserve zeros. The core money card was corrected to use the shared currency-aware formatter instead of forcing every number to USD. Recent invitation cards no longer invent records, templates or event types; their report link opens Reports. Refresh now refreshes auxiliary snapshots as well as the summary. Unsupported daily comparisons remain unavailable; the existing dated reporting/export engine is retained.

The full admin suite passes, including missing-report, zero-data and mixed USD/KHR regression tests. Actual admin login/dashboard/report navigation passed in both languages against the disposable backend. Matched zero-activity screenshots show the original behavior and the corrected behavior using identical fictional input.

## Verified and unverified

Backend tests cover cross-user reads/writes, wrong-recipient/replayed/expired codes, removed members, owner expiry, role changes, quota races, concurrent edits, financial redaction, SQL filter bounds and CSV injection. Full report tests cover filtering/sorting, CSV/XLSX/HTML exports, currency separation and large result sets. Browser fixture payment checks never unlock on a claimant action; only the simulated authoritative PAID response changes UI access. Trusted-payment backend fixtures are separate from any live provider claim.

Accessibility findings and fixes are in `04-localization-accessibility.md`. Axe checks are not a security scanner or a complete accessibility certification. No physical screen reader/device, live ABA/Telegram settlement, production Redis/cache topology or production deployment was exercised. No secrets, real account passwords, invite codes or private runtime logs are included in the public review artifacts.
