# Phase 9 engineering report

Recommendation: **Ready for code review.** The requested implementation and local integration evidence are present. Production release remains conditional on the provider/device/deployment checks in `14-known-limitations.md`.

## Result and repository baseline

Invitation Studio now has six parent groups, reuses the Phase 8 date/program/map editors and preserves serialized saves, previews and revisions. Premium film authorization is enforced by the server, private storage and guest byte endpoint. Ticket artwork has an independent upload purpose and works through save/reload and personalized PNG export. The application shells share the existing warm semantic palette, with focused admin readability/accessibility repairs.

Initial state: clean `main` at `3452e436`, equal to the local `origin/main` ref. Phase 8 commit `9606873f` and Phase 7 endpoint `522e7484` were verified. Implementation and verification were completed on `feat/phase9-studio-media-tickets`; the initial handoff was uncommitted, with no fetch, push, merge or production deployment. The user subsequently authorized merging and pushing to `main` on 25 October 2026. The audit and evidence manifest describe the verification snapshot before that integration. Baseline user/admin/backend/worker results and exact final verification scope are in [test results](12-test-results.md).

## Feature matrix

| Change | Existing → resulting behavior | Principal files | Contract/data impact | Security and verification | Status |
|---|---|---|---|---|---|
| Studio navigation | Long flat section list → six bilingual parent groups with retained native disclosures, legacy section links and guided mode | `studioNavigation.js`, `StudioSections.jsx`, `InvitationForm.jsx`, `InvitationStudio.css` | Existing invitation save contract and persisted content reused; no migration | Retained drafts/revisions, keyboard/reflow and three-engine browser checks | Implemented |
| Event/date/program consolidation | Separate entry points → Event Information and Schedule & Venue parents using the established editors | `InvitationForm.jsx`, existing `SaveTheDateEditor.jsx`, schedule and venue components | Existing Phase 8 JSON/date/time/map contracts retained; editor source reused | Phase 8 regression plus real authored save/reload and independently parsed ICS | Implemented |
| Optional film | Existing covers/music → authorized cover→film→invitation stage across registered renderer families | `PreWeddingVideoEditor.jsx`, `TemplateExperience.jsx`, `CinematicOpeningProvider.jsx`, template adapters, `EventDetails.jsx` | Additive optional content/public DTO and media endpoints; old records need no conversion | Owner Premium snapshot, event-scoped IDs, publication/access/expiry checks; no raw private URL; HTTP and browser tests | Implemented; live Cloudinary and physical Safari pending |
| Private persistence | Public storage adapter → separate local private directory/volume or authenticated Cloudinary film storage | `LocalStorageService`, `CloudinaryStorageService`, storage config, Dockerfile, Compose | New string media purposes; private volume required; zero SQL changes | Private bytes outside static root; signed download stays server-side; filesystem and mocked-provider tests | Implemented; container restore/provider rehearsal pending |
| Ticket images | Gallery quota and missing static-asset CORS block design → purpose-specific cover/background uploads, saved associations and export | `MediaService`, `MediaController`, `SecurityConfig`, `TicketDesigner.jsx`, `ticketRenderer.js`, `TicketPreview.jsx` | Additive upload route and optional schema-1 focal/fit/opacity fields; no migration | Owner/QR checks, same-event image IDs, file validation, reference deletion guards, strict CORS allowlist; real PNG/QR verification | Implemented |
| Shared visual roles | Partly duplicated application palette → canonical tokens exported into both isolated build contexts | `packages/design-tokens/application.css`, `sync-design-tokens.cjs`, user/admin styles, `AdminUI.jsx`, dashboard components | No API/database/business metric changes | Export integrity test, lint/build, responsive images, scoped axe; existing template artwork preserved | Implemented |

## Ticket investigation

The original designer used `uploadGallery` for both artwork selections. A real HTTP test fills the invitation gallery, reproduces HTTP 409 on another gallery upload, then successfully uploads two independent ticket images and saves/reloads their IDs. The native browser journey exposed another cause: anonymous cross-origin image reads from local `/uploads/**` lacked CORS. GET/HEAD now use the configured frontend origin allowlist without credentials. Untrusted origins remain rejected. [The repair report](08-ticket-designer-repair.md) documents both causes, saved asset ownership and canvas behavior.

The renderer still owns one 600×900 design, 2×/3× output, personalized text and the existing admission QR payload. The browser decodes generated canvases across layouts and checks actual guest identity; the real local journey also downloads a 1200×1800 PNG. No RSVP, admission or payment state is changed by opening a ticket. WebKit ticket return-focus failure was reproduced and repaired by focusing the actual trigger before opening the shared modal.

## Visual system and review

The existing ivory/charcoal/antique-gold/teal roles were retained. A new conflicting color theme was unnecessary. Canonical tokens export into each frontend because their Docker build contexts cannot import outside the application directory. Shared action/search/header controls use readable semantic roles and visible focus. Populated admin data exposed small gold/status labels below AA contrast; these were darkened without modifying metrics or queries. Native horizontal table regions are focusable and named.

[Visual evidence](13-visual-regression.md) links original and current screens and explains fixture versus actual API provenance. Screenshot gates wait for populated content; image digests/dimensions are supplied in `evidence/screenshots.json`. Ceremonial artwork and individual template styles stay with their renderers. Route/source coverage and representative rendered coverage are documented separately.

## Premium video policy and behavior

The entitlement is derived from the active purchased Premium snapshot, never a client boolean, generic paid plan, template purchase or administrator role. Upload/replacement/association/save/publication checks use event permission and the owner's current entitlement. The public byte endpoint independently validates published invitation access, selected event-scoped media and current Premium. Guest credentials travel in a bounded request body; private assets have no public file URL and no signed Cloudinary URL is returned to the browser.

Expired benefits suppress playback while retaining saved settings; disabling/clearing remains possible. Ordinary gallery/photos/music and original covers remain available under their prior rules. No video is downloaded before the opening action. Muted inline playback offers sound, immediate Skip/Escape, error/end recovery, cancellation and a no-progress watchdog; reduced motion bypasses the film. The [media report](07-media-premium-video.md) describes provider contracts and storage.

## Verification and release conditions

The full user suite passes 896 tests, admin 121 and backend 620 with four explicit guarded skips. The final backend package passes 55 focused tests including five ArchUnit and fourteen OpenAPI checks. The unchanged worker passes 72. Phase 8 browser regression passes 45 with four historical-reference skips. The real login→edit→upload→save/reload→export→publish→public journey passes against a task-owned API/MySQL environment; direct SQL and independent calendar parsing support it. Final browser/accessibility matrices and command provenance are in [test results](12-test-results.md) and `evidence/verification.json`.

No historical Flyway file was edited. Payments remain pending until existing trusted reconciliation; server-owned prices, token expiration, IDOR boundaries, USD/KHR separation and ArchUnit rules retain their existing regression coverage. No live settlement/provider capability is inferred from fixtures or unit tests.

Docker Compose syntax passes, but the Linux Docker engine is unavailable. Before staging approval, build/recreate the images, verify the new private volume's ownership and backup/restore, and exercise authenticated Cloudinary with real staging credentials if that provider is used. Review physical Safari/iOS codecs, accessibility with human screen readers and Khmer editorial copy. Roll out backend/frontends together: older backends cannot read the new media enum values. Production rollout, restore and DNS/container operations require their own authorization; none occurred here.
