# Implementation changelog

## Server contracts

- `EntitlementService`: preserve enforcement while sharing feature projection with the public package DTO; add safe feature/quota metadata and authorized per-event guest usage.
- `ApiException` / `GlobalExceptionHandler`: optional immutable details; preserve status/code/message.
- `InvitationService` / controller / DTOs: owner-scoped template access after event permission; additive event quota DTO.
- `PublicPackageResponse` / `SubscriptionService`: actual eligible feature keys, without changing prices, publication, snapshots or payment verification.
- Regenerate and normally verify `src/test/resources/contracts/openapi.yaml`; includes previously stale Admin compatibility fields as well as the reviewed additions.
- No schema migration or application-record write was required.

## React and visual changes

- Central reason/offer/return-route model, entitlement refresh provider, feature lock/retry/quota components and one feedback host.
- Structured ApiError survives QR/seating/check-in/media/template paths; generic permission failures never become upsells.
- Reusable Studio fields, date/time group, text editor, summary, upload field and section/action presentation.
- Compact language disclosure; clean white/forest management styling; responsive editor-container layout; existing Focus Preview plus Focus on Editing.
- Honest deliberate Save, quiet autosave, retained failed/revoked drafts and recovery download. Existing conflict, bilingual data, optimistic revision and template persistence remain.
- Contextual package/owner/permission explanations in Studio, templates, creation, guests/import, QR, tickets, seating, check-in, analytics, teams, media and branding.
- Featured-event image containment repairs the blocked recovery button; cards no longer infer a commercial reason from error-message text.
- Expanded management presentation: one light/dark palette, visible Khmer/English and appearance controls, short reduced-motion-aware route transitions, and theme coverage for all requested event tools. See `12-project-wide-design.md`.
- Unknown stable template codes no longer inherit a default theme's renderer. Explicit Admin presets/variants and registered stable codes retain their resolution; a collision regression is covered in unit and browser tests.

## Verification maintenance

New unit/component tests cover independent access reasons, dynamic plans, severity/timers/deduplication, confirmation focus, identity/expiry refresh, retained drafts and old-response races. New real MySQL HTTP/JWT tests use the sanitized actual four-plan policy in fresh owned schemas. Existing integrity/migration suites run separately against disposable MySQL.

Browser fixtures are explicitly synthetic. Older tests are updated for the current paginated guest DTO, explicit access response, selected-export behavior and six-tab/shared-confirmation UI. Those changes do not weaken server security tests or substitute fixtures for actual enforcement evidence.

Generated Admin report binaries, a pre-existing compiled test class and the two pre-existing live screenshots are excluded from the commit. Raw traces remain local; reviewed visual evidence is under `output/playwright/next-studio-ux`.
