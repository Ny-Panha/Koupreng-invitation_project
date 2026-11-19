# 03 — Studio Routes and Authorization Ownership

## 1. Route Map
- `/app/events/:eventId/invitation`: Canonical entry point embedded in `EventWorkspace`.
  - Condition: `event.eventType === 'WEDDING' && event.templateCode !== 'event-essential'` routes to `InvitationEditFeature`.
  - Non-wedding or `event-essential` routes to `EventDetails` gracefully.
- `/dashboard/invitations/:id/edit`: Legacy continuation route mapping to `InvitationEditFeature`.

## 2. Authorization Boundaries
- **Owner (`isOwner: true`):** Full mutation grant, template switching, publish review, and media management.
- **Collaborator with Edit Grant (`MANAGE_INVITATION`):** Can edit form content, save drafts, and preview.
- **Collaborator with View-Only (`VIEW_EVENT`):** All mutation controls disabled; save button disabled; cannot switch templates or publish.
- **Anonymous / Expired Session:** Edit actions fail closed; prompt to save recovery JSON draft.

See [Route Authority Matrix](evidence/route-editor-mode-authority-matrix.json).
