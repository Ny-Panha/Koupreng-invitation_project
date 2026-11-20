# Phase 14 Codex Audit — Report 16: Ticket Image Boundary

## 1. Ticket Image Upload Boundary
Ticket backgrounds use `/api/v1/invitations/{id}/media/ticket-image` (max 5 MiB image).
- The Media Atelier provides a direct action link to Ticket Designer (`/app/events/:id/tickets`).
- Ticket preview images uploaded in Media Atelier remain fully synchronized with Ticket Designer canvas views without cross-phase regressions (verified in `N14-39`).

- [Machine Evidence: Actual Media API Contract](evidence/actual-media-api-contract.json)
