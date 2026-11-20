# Phase 14 Codex Audit — Report 03: Media Route, API, and Backend Inventory

## 1. Real Spring Boot Controller Mapping
The authoritative backend endpoints reside in `apps/backend/src/main/java/com/koupreng/backend/media/api/MediaController.java` under `/api/v1`:

1. `POST /api/v1/invitations/{invitationId}/media/cover` — Single cover image upload (max 5 MiB).
2. `POST /api/v1/invitations/{invitationId}/media/gallery` — Multi-image gallery upload (max 5 files/request, max 5 MiB/file).
3. `POST /api/v1/invitations/{invitationId}/media/video` — Standard event video (max 50 MiB).
4. `POST /api/v1/invitations/{invitationId}/media/music` — Ceremonial background audio (max 15 MiB).
5. `POST /api/v1/invitations/{invitationId}/media/ticket-image` — Ticket design background (max 5 MiB).
6. `POST /api/v1/invitations/{invitationId}/media/pre-wedding-video` — Cinematic pre-wedding feature (max 50 MiB).
7. `GET /api/v1/invitations/{invitationId}/media` — Fetch all media assets for an invitation.
8. `PUT /api/v1/invitations/{invitationId}/media/{mediaId}/replace` — In-place replacement of a media record.
9. `DELETE /api/v1/invitations/{invitationId}/media/{mediaId}` — Delete asset if not in active locked use.
10. `GET /api/v1/public/invitations/{slug}/media` — Public read-only media list for published invitations.

## 2. Frontend Client Binding
The frontend service `apps/frontend-user/src/features/invitations/api/mediaApi.js` communicates with `/v1/invitations/...` via shared Axios client `api`. Local draft IDs (`wed-*` or non-numeric) are handled locally using `weddingStorage.js` without dispatching HTTP requests to the backend.

- [Machine Evidence: Actual Media API Contract](evidence/actual-media-api-contract.json)
