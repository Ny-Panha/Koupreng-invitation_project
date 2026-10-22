# Venue address publishing fix

Reproduced against the latest local Phase 3 branch, without editing a real event or removing any publish rule.

The defect is in the Studio path, not the database column or publish validator:

1. `InvitationForm.jsx` read `invitation.venueAddress` and flat customization `venueAddress`, but omitted the supported persisted `contentJson.event.venueAddress` and `contentJson.venue.address` shapes. An address visible in template content could therefore become an empty canonical `venueAddress` in the next PUT. Venue/map controls had no editable address input to correct it.
2. The shared writer's `save()` joined a running autosave for its older snapshot. Manual Save/Publish could finish waiting while newer edits remained dirty. A browser reproduction observed the older nested address in the save payload after editing it. The existing writer test already distinguished old acknowledgements from current edits; dependent actions needed to drain those edits too.
3. Khmer Celestial automatically focused its content when a live preview mounted and its opening CTA could autofocus inside the preview. This could take focus from the address validation or the event drawer's return target. Embedded previews now leave editor focus alone; the public invitation keeps its opening focus behavior.

Changes:

- `apps/frontend-user/src/features/invitations/InvitationForm.jsx`: hydrate supported nested address content, provide a labeled editable address with the existing 1000-character column limit, keep canonical trimming in the PUT, await the latest acknowledged snapshot before publishing, and reveal/focus a clear inline error for missing/blank or server-rejected addresses. Blank drafts remain saveable.
- `apps/frontend-user/src/features/invitations/studio/useStudioPersistence.js`: add `flush()` to wait for the writer and persist any newer snapshot until acknowledged. Failures return false and block dependent publication.
- `apps/frontend-user/src/features/invitations/studio/StudioToolbar.jsx`: manual Save uses `flush()`; the event menu registers its current return target.
- `apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx`: restore the current menu trigger after the drawer closes.
- `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.jsx` and `components/CelestialOpening.jsx`: restrict automatic focus to public invitation behavior.
- Regression files: `InvitationForm.test.jsx`, `studio/useStudioPersistence.test.jsx`, `KhmerCelestialLayout.test.jsx`, `tests/e2e/invitation-publishing-address.spec.js`, and backend `EventDraftPersistenceTests.java`. Existing Phase 3 navigation/event-switch regressions cover drawer integration.

Backend trace (unchanged production behavior): `InvitationRequest.venueAddress` is mapped by `InvitationService.applyRequest()` through trim-to-null into `UserInvitation.venueAddress`, explicitly mapped to `invitations.venue_address VARCHAR(1000)` from V3. `InvitationResponse` and the public response serialize it. Update and publish have transaction boundaries and owner checks. Publish loads the owned persisted entity and requires a nonblank canonical address; it does not trust React/local drafts or substitute template JSON for the column. No property renaming, DTO bypass, backfill, schema migration, placeholder address, RBAC change or backend rule weakening was introduced.

Verification:

- Full final frontend unit suite: 653 passed, 0 failed. Focused publishing/navigation/preview suite: 52 passed in four files.
- Backend: 40 passed, 0 failed, 0 skipped across InvitationServiceTests, EventDraftPersistenceTests, EventAccessPolicyTests, InvitationAccessSecurityTests and ArchitectureRulesTests. The new H2 tests use real HTTP DTOs, PUT, flush/clear, direct `venue_address` SQL reads, GET and PATCH publish for Khmer Celestial and Silk Heritage. Null, empty and whitespace-only canonical addresses remain rejected even when template content contains an address. Custom design JSON survives.
- Final 18 desktop/mobile browser checks pass, including three wedding templates (Khmer Celestial, Silk Heritage, Garden Royal), nested-address recovery, trimmed save payload, refresh/retrieval, publication, missing/whitespace inline error and focus, failed autosave, failed publish, Studio focus return and event switching. Browser DTO fixtures are synthetic; the real backend persistence boundary is separately verified through HTTP/JPA/H2, not a live owner's session.
- Production build and ESLint pass. No production restart, remote push or deployment. Existing MySQL migration/provider/Safari/device release limits remain.

Commands and raw logs are in the Phase 3 review folder. Backend command from `apps/backend`: `.\mvnw.cmd '-Dtest=InvitationServiceTests,EventDraftPersistenceTests,EventAccessPolicyTests,InvitationAccessSecurityTests,ArchitectureRulesTests' '-DargLine=-Xmx768m' test` with `MAVEN_OPTS=-Xmx512m`. Frontend full unit command: `npm test -- --maxWorkers=2 --reporter=json --outputFile=D:/Koupreng-UXUI-Phase3/logs/final-unit-results.json`. Final browser command uses `scripts/publishing.config.mjs`, the publishing/navigation/template-identity specs and `--grep 'address|Studio navigation restores|switching events' --workers=2`.
