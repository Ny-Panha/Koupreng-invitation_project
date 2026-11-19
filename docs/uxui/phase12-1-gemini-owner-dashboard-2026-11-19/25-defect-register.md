# 25 — Defect Register & Resolution Log

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Identified Defects, Root Cause Analysis, and Verifiable Fixes  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Defect Register

| Defect ID | Severity | Surface | Summary | Root Cause | Resolution | Status |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **DEF-12.1-01** | Medium | `EventsFeature.jsx` | Non-deterministic "Newest" sort | Sort comparator returned `0` for `sort === "newest"`, leaving ordering to browser engine variation | Implemented multi-level sort evaluating `updatedAt`, `createdAt`, and tie-breaking by ID | **RESOLVED_LOCAL** |
| **DEF-12.1-02** | High | `EventCard.jsx`, `EventsFeature.jsx` | Local drafts attempting server routing | Local drafts without integer server IDs routed to `/app/events/:draftId` which fails on backend | Differentiated `isServerEvent` vs `isLocalDraft`; local drafts route to `/dashboard/invitations/:id/edit` with "Resume draft" | **RESOLVED_LOCAL** |
| **DEF-12.1-03** | Medium | `EventWorkspace.jsx`, `DashboardFeature.jsx` | Flashing stale event data on event switch | `state.event` was not cleared synchronously when `eventId` route parameter changed | Added immediate state clearance in `useEffect` setting `event: null, loading: true` | **RESOLVED_LOCAL** |
| **DEF-12.1-04** | Low | `EventCalendar.jsx` | Missing `initialDate` prop support | Calendar hardcoded initial month to `new Date()`, impeding leap year testing | Added `initialDate` prop support to allow explicit initial month targeting | **RESOLVED_LOCAL** |
