# Invitation Studio and personalized tickets — engineering report

## A. Implementation summary

The existing wedding editor now has a section-based desktop studio and mobile Edit/Preview views. It preserves the template renderers and existing controls, adds supported appearance/wording controls, persists missing customization fields, repairs event prefilling and media-reference saves, and provides serialized autosave, honest status, retry, history, reset and leave warnings. Publication uses the existing backend API after saving.

The new event ticket designer supplies four layouts, saved per event and personalized from existing guest/seating records. Guest rows and public guest links can preview/download/share permitted tickets before RSVP. PNG export is deterministic at 2×/3× with bundled Khmer fonts. The original QR payload and check-in service remain authoritative.

## B. Architecture

See [architecture, contracts and flows](../architecture/invitation-studio-tickets.md). Existing invitation JSON and event-owned media hold invitation customization. A new single-row event ticket design supplies appearance. Application services enforce owner, entitlement, media and guest scope; public reads reuse published invitation access. One canvas renderer produces preview and PNG. No second guest/event identity or QR credential system exists.

## C. Source changes

Verified implementation milestones: `290f4eda` discovery, `fe9171a8` studio shell, `c16c34c6` serialized persistence, `73c358e4` ticket API/persistence, `0856bace` lifecycle/contracts and `3032b6ba` integrated studio, designer, exports and guest/public entry points.

| Area | Main files and purpose |
| --- | --- |
| Editor | `InvitationForm.jsx`, `LivePhoneSimulator.jsx`, `studio/*`: section navigation, preview tools, appearance, persistence/history/navigation guard and nested media resolution |
| Rendering | `TemplateExperience.jsx`, `templateExperienceContent.js`, `studioStyle.js`, `studio-fonts.css`, Khmer Celestial layout: approved styling, schedule dates and accurate cleared values |
| Tickets | `features/tickets/*`: API adapter, designer, minimal preview, deterministic export/share actions and owner/public modals |
| Routing | `hostRoutes.jsx`, `EventWorkspace.jsx`, `eventRoutes.js`: event ticket route/navigation; `App.jsx`, `unsavedHistoryGuard.js`: early back/forward guard |
| Guest/public entry points | `GuestsPage.jsx`, `GuestTable.jsx`, `PublicInvitationFeature.jsx`: ticket access without creating guests or submitting RSVP |
| Backend | `ticket/{api,application,domain,infrastructure}`: immutable validated DTOs, scoped service, revisioned JPA persistence and private responses |
| Existing backend reuse | `InvitationService`, `QrCodeService`: public access-token overload and existing QR image rendering; no new token identity |
| Schema/contract | V38/V39 and `packages/api-contracts/openapi.yaml`: event design table, lifecycle cleanup and documented endpoints |
| Tests | Studio/media hook/form tests, `TicketIntegrationTests`, architecture domain coverage, studio Playwright tests and synthetic fixtures |

## D. UI/UX changes

Previously, all template sections occupied one long form beside a phone preview, and saving navigated away. The studio provides a section rail, focused controls and the real preview. Mobile uses a compact selector and Edit/Preview controls. Background uploads preserve the cover; real event names/title are prefilled rather than replaced by preset heuristics. Template-specific layouts and decorative assets remain.

Screenshots: [before desktop](../qa/studio-tickets/before-editor-1440.png), [after desktop](../qa/studio-tickets/editor-en-1440.png), [before mobile](../qa/studio-tickets/before-editor-390.png), [after mobile](../qa/studio-tickets/editor-en-390.png), [ticket designer](../qa/studio-tickets/designer-en-1440.png). See the QA report for capture provenance and all widths.

## E. Backend and database

Owner GET/PUT `ticket-design`, general/personal owner ticket GETs and the published public ticket GET are implemented. Design revisions reject stale updates. Image IDs must belong to the event and represent validated images. V38/V39 are forward-only; event deletion also removes appearance. H2 integration tests verify persistence and cleanup; MySQL migration certification remains gated.

## F. Security

Exact event ownership and existing entitlements protect owner operations. Published/moderated access and event-scoped guest tokens protect public personalization. DTOs exclude guest contact data. Private caching/referrer/robots headers and document metadata reduce credential exposure. Sharing is explicit. Existing owner/ADMIN check-in authorization, locked guest lookup and duplicate handling remain; global STAFF receives no implicit grant. JWT expiration, subscription settlement and payment KHQR are unchanged.

## G. QA/QC results

See [exact commands, counts, evidence and manual steps](../qa/studio-ticket-verification.md). No skipped/provider/hardware check is counted as passing.

## H. Completed, blocked and deferred

Completed: implemented studio/ticket APIs and persistence, supported controls, PNG exports, guest/public integration, scope checks, check-in reuse and automated evidence.

Blocked certification: MySQL 8 migrations/schema/cascade behavior, opt-in live backend browser scenarios and actual storage/payment/auth/Telegram providers. Physical camera and native OS sharing remain manual device checks.

Deferred: PDF export, unsupported template appearance controls and arbitrary section ordering for fixed-order renderers. No nonfunctional controls are presented for those capabilities. Existing Khmer/English wording is retained in the established invitation text model.

## I. Manual verification

Follow the ten-step [local verification procedure](../qa/studio-ticket-verification.md#manual-verification), using an isolated database and an existing account with the required QR/check-in entitlements. Review V38/V39 and the database target before startup. Never self-approve a browser payment to unlock a test feature.

## J. Final status

Ready for local code review and automated demonstration. The implementation uses real backend services; browser layout/export scenarios use explicit contract fixtures, and H2 integration tests exercise real persistence, public HTTP contracts and check-in behavior. This is not staging or production certification: MySQL, provider and physical-device gates remain open. PDF remains deferred.

No push, merge or deployment was performed. Rollback and forward-migration guidance is included in the architecture document.
