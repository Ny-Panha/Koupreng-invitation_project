# Phase 14.1 — Media Source, Route, and Permission Map

## 1. Route Topology
The media studio is accessed via the authenticated owner/editor route:
- **Route:** `/app/events/:eventId/media`
- **Component:** `InvitationMediaManager`
- **Route Guard:** `RequireAuth` + Event Ownership / Collaborator Editor check.
- **Deep Navigation:** Integrated with `/app/events/:eventId/studio` and ticket designer `/app/events/:eventId/tickets`.

## 2. Permission Matrix
| Role | Access Route | View Assets | Upload / Preflight | Focal Point Edit | Delete / Replace |
|---|---|---|---|---|---|
| **Event Owner** | Allowed | Full | Allowed (5-file chunks) | Allowed | Allowed (with in-use warning) |
| **Collaborator (Editor)** | Allowed | Full | Allowed | Allowed | Allowed |
| **Collaborator (Viewer)** | Denied / Read-Only | Read-Only | Denied | Denied | Denied |
| **Guest / Public** | Blocked | Denied | Blocked | Blocked | Blocked |

## 3. Backend Endpoints
- `POST /api/events/{eventId}/media` — Multipart file upload (max 5 files/request).
- `GET /api/events/{eventId}/media` — Retrieve media asset inventory for event.
- `DELETE /api/events/{eventId}/media/{mediaId}` — Delete asset if not locked.

- [Machine Evidence: Route Permission Matrix](evidence/route-permission-matrix.json)
- [Machine Evidence: Source Inventory](evidence/media-source-inventory.json)
