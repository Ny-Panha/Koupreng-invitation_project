# Phase 12 audit and release gaps

Audit date: 26 October 2026 (Asia/Bangkok). Initial local `main`, tracking `origin/main`, and fetched remote: `124c7c277a00ecb8043b39b54092a3cce95db60a`. Checkout was clean. Work stays in the original checkout on main. No worktree, branch, reset, stash, production deployment or database migration is authorized or needed.

## Current source, not historical assumptions

Phase 11 reports `00` through `13` are present. Its tests and limitations distinguish browser route fixtures from real HTTP/MySQL journeys. The current head adds Royal Garden Cinematic after Phase 11. Catalogue counts must come from `TEMPLATES`, plus neutral Event Essential, rather than reusing the old twelve-presentation JSON.

Current manifests declare React 19.3.1, Vite 8.3.5, Tailwind 4.3.3, Router 7.18.2, Zustand 5.0.16, Java 25 and Spring Boot **4.1.1**. Root guidance still mentions Boot 4.0.8; this task preserves the actual runtime. No dependency upgrade is required.

## Verified routes

`src/app/routes/hostRoutes.jsx` and `features/events/workspace/eventRoutes.js` define `/app/events`, `/app/events/new`, and `/app/events/:eventId/{invitation,settings,preview,tickets/design,guests,rsvp,gifts,budget,seating,check-in,reports,delivery,media,qr,wishes,assistant,team,analytics}`. The event index is the dashboard. Legacy `/dashboard/invitations/:id/edit` redirects into the event workspace. `/templates/browse/:id` is authenticated. Marketing template routes use the catalogue renderer. Public invitations use `/i/:slug` with presentation-only `lang=km|en` and existing guest/access parameters.

The six Studio tabs, Guided/Advanced modes, split controls, revision writer, trusted iframe messaging and mobile Edit/Preview flow are existing contracts. Settings already use the canonical invitation endpoint and revision. Ownership governs access/publication; subscription tier governs benefits; collaborator roles remain independent.

## Contracts and source inventory

| Contract | Current implementation |
|---|---|
| Studio save/reload and preview | `InvitationForm.jsx`, `studio/useStudioPersistence.js`, `LivePhoneSimulator.jsx` |
| Locale authoring/projection | `templates/shared/localizedContent.js`, backend `LocalizedInvitationPolicy.java` |
| Guest identity and RSVP | `wedding-site/PublicInvitationFeature.jsx`, `invitations/PublicRsvpForm.jsx`, ticket feature |
| Normalization | `wedding-builder/utils/invitationDraftAdapter.js`, `draftToTemplate.js` |
| Capabilities | `templates/registry/templateRegistry.js`, `templateCapabilities.js` |
| Program | `studio/WeddingProgramEditor.jsx`, shared `program.js`, `ProgramTimeline.jsx`, `ProgramDetails.jsx` |
| Design and entitlements | `FamilyDesignEditor.jsx`, `IllustratedMapEditor.jsx`, `FamilyNames.jsx`, `IllustratedMap.jsx`, backend `InvitationDesignPolicy.java`, `entitlement/application/EntitlementService.java` |
| Settings | `events/onboarding/EventDetails.jsx`, `LocalizedEventEditor.jsx`, `eventFields.js` |

`localizedContentV1`, `familyGroupsV1`, `coupleMonogram` and `illustratedMap` are additive JSON contracts. Maps remain v1 with at most 80 bounded nodes. Monograms remain text/vector with existing frames/motifs/fonts. Server-owned entitlement checks and unpublished English filtering must remain authoritative. All applied Flyway files are preserved.

## Reproducible prioritized gaps

1. **P1 program clarity:** open a compatible invitation with an `iconKey` row. Shared `.kp-timeline-marker::after` paints a dot over the ceremony SVG; the marker's fixed height also shortens the connecting line. There is no explicit no-icon choice. Fix the common timeline and retain all existing row IDs and keys.
2. **P1 map usability:** open Premium Studio → Schedule & Venue → illustrated map. The blank editor has no useful route starting points; all landmarks share a generic building drawing; map touch-action disables page scrolling even without a selected element. Add editable original presets, selection tools, scroll mode, safe exports and cancellation tests.
3. **P1 monogram legibility:** enter a 60-character monogram. One line exceeds the frame. Curate bundled licensed font labels and shape multiline text without splitting Khmer graphemes. Add decorative export without expanding the upload boundary.
4. **P1 authoring completeness:** switch between Khmer and English. Only English exposes missing-field navigation, and venue misses route to general information. Expose both checklists, correct field navigation and intentional per-value Khmer copy. Preserve empty optional values.
5. **P1 new renderer locale parity:** Royal Garden's gallery previous/next/close controls and music/section labels use English in Khmer. Its hosted language selector duplicates the public selector and exposes a disabled draft-language choice. Use localized controls and the canonical hosted switch; retain gallery cancellation behavior.
6. **Verification gap:** Phase 11's matrix reads a historical Phase 10 list. Generate Phase 12 coverage from current catalogue and capabilities. Explicitly distinguish DOM rendering from HTTP/persistence, and leave unexecuted combinations `NOT_TESTED`.

## Baseline execution

User: lint/build pass; **1,005 tests in 140 files pass** (75.67 s). Main 452.15 kB raw / 131.59 kB gzip; Studio 193.89 / 51.29. Admin: lint/build pass; **121 tests in 21 files pass** (23.97 s). Worker: **74 pass**, Ruff and Bandit pass; one Starlette TestClient deprecation warning. Token exports: two verified. OpenAPI: 269 endpoints. Routing: zero errors; installer verifies 59 bundled skill directories. Repository policy/config/NVD: 16 pass.

Docker daemon is unavailable. A new native MySQL 8.0.39 instance was initialized only under `.cache/phase12/mysql-data`, bound to `127.0.0.1:3420`, with a generated private local password. Initial backend attempt discovered 638 tests, zero assertion failures, 18 context errors and four skips: the opt-in Phase 7/9 tests enforce their old `3416/phase7_disposable` URL. The guard is extended narrowly to the new explicitly disposable address; no application security check is relaxed. Final rerun results and browser baseline are recorded in report 08.

Raw logs remain private under `.cache/phase12`; sanitized evidence is published under this directory. Existing local environment, database snapshots, uploads, and the ignored guest-data backup remain untouched. Manual Khmer cultural/editorial, physical device and screen-reader gates remain distinct from automated checks.
