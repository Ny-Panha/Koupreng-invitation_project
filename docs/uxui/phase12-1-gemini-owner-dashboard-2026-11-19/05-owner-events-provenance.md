# 05 — Owner Events Provenance Architecture

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Truthful Provenance Taxonomy, Local Draft Handling, and Server Authority  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Provenance Problem Statement

In previous iterations, the `drafts` array returned by `useEvents` was an ad-hoc merge of real backend records and browser `localStorage` drafts. Because both were referred to as "drafts", local unsaved items could appear identical to server-backed events. Attempting to click "Manage" on a local draft caused routing failures (`/app/events/wed-xxx-xxx` returned 404/400 because backend IDs must be numeric integers).

---

## 2. 5-Tier Provenance Taxonomy

Phase 12.1 establishes a strict, verifiable taxonomy in `EventCard.jsx`, `EventsFeature.jsx`, and `EventCalendar.jsx`:

| Tier | Identifier / Criteria | Badge Label (EN / KM) | Tone Class | Primary Action | Destination |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SERVER_PUBLISHED** | Numeric ID (`/^[1-9]\d*$/`), `status === "PUBLISHED"` | Published / បានផ្សាយ | `.event-card-badge--published` | Manage event | `/app/events/:id` |
| **SERVER_DRAFT** | Numeric ID, `status === "DRAFT"` | Draft / ព្រាង | `.event-card-badge--draft` | Manage event | `/app/events/:id` |
| **LOCAL_ONLY** | `syncStatus === "LOCAL_ONLY"` or `isLocal === true` | Local draft / ព្រាងលើឧបករណ៍នេះ | `.event-card-badge--local` | Resume draft | `/dashboard/invitations/:id/edit` |
| **SYNC_FAILED** | `syncStatus === "SYNC_FAILED"` | Sync failed / Sync បរាជ័យ | `.event-card-badge--sync-failed` | Resume draft | `/dashboard/invitations/:id/edit` |
| **SHARED** | `shared === true`, `ownerName` present | Shared by {owner} / ចែករំលែកដោយ {owner} | `.event-card-badge--shared` | Manage event | `/app/events/:id` |

---

## 3. Implementation Logic

```javascript
// Truthful differentiation between local draft and server-backed event
const isLocalDraft = Boolean(
  draft.syncStatus === "LOCAL_ONLY" ||
  draft.isLocal === true ||
  String(draft.id || "").startsWith("draft-") ||
  (String(draft.id || "").startsWith("wed-") && !draft.backendInvitationId)
);

const isSyncFailed = draft.syncStatus === "SYNC_FAILED";
const isServerEvent = !isLocalDraft && !isSyncFailed;
```

This ensures:
1. Local drafts never route to server workspace endpoints that require integer IDs.
2. Users are never deceived into thinking an offline draft is safely synced to the cloud.
3. Failed syncs preserve local user payloads while clearly signaling that attention is needed.
