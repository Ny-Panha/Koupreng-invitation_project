# Security, contracts and persistence

New upload endpoints are `POST /api/v1/invitations/{id}/media/ticket-image` and `/pre-wedding-video`. Existing replacement/deletion endpoints retain ownership, event permissions, file validation and storage compensation. Ticket upload/replacement also enforce the owner’s QR benefit; cinematic upload/replacement/configuration/publication enforce current Premium.

Owners preview film bytes through `GET /api/v1/invitations/{id}/media/{mediaId}/cinematic-content`. Guests use `POST /api/v1/public/invitations/{slug}/media/{mediaId}/cinematic-content`, with existing access/invite tokens in a bounded JSON body. The request DTO redacts its string representation. Tokens are not placed in video URLs. Both responses are private/no-store; public film access rechecks publication, moderation, invitation access, current Premium and the selected owned ID. Private local files are outside the static root; Cloudinary uses authenticated delivery and keeps signed requests server-side.

Public listing filters do not substitute for asset authorization. The new film purpose stores no raw URL. Ordinary public image/video behavior is preserved. Read-only upload CORS uses the configured frontend origin allowlist and rejects unknown origins; it grants no invitation/API authority.

Invitation JSON and ticket transforms are additive. No schema or Flyway migration was needed because existing media types are stored as strings and content/design JSON supports optional fields. Every historical migration through V49 remains unchanged. The current backend reads old invitation/ticket records; the existing migration/upgrade suites run against the task-owned native MySQL instance. Release backend and frontends together: an older backend does not know the new media enum values, so a rollback must account for media records created by this version.

The checked-in OpenAPI contract and admin endpoint manifest include the additive endpoints and optional fields. ArchUnit passes. Existing auth/token expiration, HMAC/payment reconciliation, server prices, subscription snapshots, guest RSVP/check-in identity, financial currency separation, collaboration and analytics services were not rewritten and remain covered by the full backend regression suite.

Operational changes are definitions only: persistent private volume, backend directory ownership and documented backup/restore requirements. Compose configuration parses successfully. No production migration, deployment, restart, DNS change, push or merge was performed.
