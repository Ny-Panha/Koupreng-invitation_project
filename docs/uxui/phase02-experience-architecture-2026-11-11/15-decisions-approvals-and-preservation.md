# Decisions, owner gates and preservation

These are Phase 02 architecture decisions for review. They authorize no Phases 03–27 production implementation by themselves.

| ADR | Decision and reason | Revisit trigger / owner |
|---|---|---|
| ADR-02-01 | Keep existing route/alias identity and role-specific shells; use target IA as navigation grouping. Prevent broken deep links and unauthorized role crossover. | Phase 06 route migration proposal with full alias/guard evidence; product + frontend. |
| ADR-02-02 | Treat backend amount, entitlement, order and RSVP state as authority. A return route or manual gift is not payment confirmation. | Phase 21 API/provider evidence; backend/security/product. |
| ADR-02-03 | Preserve ten bespoke renderer families, 38 aliases, two shared IDs and fallback. Capability tiers are design vocabulary only. | Phase 10/16/25 family-level visual/data proof; design + frontend. |
| ADR-02-04 | Use current `បន្ត` and current Studio external-preview accessible name as test contract candidates; no product-copy change in this phase. | Native Khmer content review, then focused test-only assertion patch; product/content + QA. |
| ADR-02-05 | Replace iframe 95%-simultaneous-visibility criterion in short landscape with reachability/scroll/control/content tests, after preserving current failure. | Phase 25 real-device, zoom and AT checks; frontend + QA. |
| ADR-02-06 | Start from semantic management tokens and existing primitives; do not install ten libraries or a global 3D engine. | Proven component gap, pinned license/version, bundle and accessibility evidence; design + frontend/legal. |

## Product decisions needed before later implementation

1. Native Khmer review of wizard and preview-link language, plus tone/status glossary. The current action evidence supports updating stale tests after review; no assertion was changed now.
2. Direction A/B/C priorities for each renderer and permissions for original art/photos/fonts/audio. No design concept grants redistribution rights.
3. Whether optional owner calendar, general marketing CMS, live AI integration, provider refunds or venue bookings should exist. Each is **PROPOSAL / REQUIRES PRODUCT DECISION**, with API, privacy, entitlement and data design first.
4. Provider sandbox, isolated MySQL and real-device/AT access for later certification. Without these, Phase 26/27 cannot honestly declare complete release readiness.

## Invariants to preserve

- All current user/admin routes and aliases, signed-out/admin guards and backend access decisions.
- Server payment order reference, exact amount/currency, replay-safe verification and entitlement; PENDING/REVIEW/FAILED/CANCELLED/EXPIRED never displayed as PAID.
- RSVP deadline, personalized token and guest privacy; no name/token leakage in logs or analytics.
- Trusted admin preview `postMessage` origin/session and editor JSON unknown fields, slug/code precedence over legacy numeric IDs, saved revision and unsaved draft behavior.
- 48 historical Flyway migrations and real MySQL semantics; no migration rewrite from a design phase.
- Upload MIME/signature/size/ownership policy; existing Khmer fonts, template assets, team styling and associated licenses.

**Rollback/no-change rationale:** Phase 02 changes documentation and read-only diagnostic scripts only. No production UI, backend, migration, test assertion, dependency or external account is modified. Later phases require focused diffs, before/after evidence and rollback plans for their own changes. The user's explicit instruction to push main applies to this completed documentation work; it does not approve future feature deployments or paid asset copying.
