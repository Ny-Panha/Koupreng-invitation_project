# 06 — Owner Workspace Authority & Race Isolation

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Role-Based Access Control, Non-Owner Protections, and Race-Free Navigation  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Role-Based Access Control (RBAC)

Event Workspace enforces server-backed permission grants via `GET /api/v1/invitations/:id/access`:
- **Owner Role:** Full access to all modules, financial reporting, publication status, team member linking, and destructive event deletion.
- **Collaborator / Viewer Role:** Access strictly bounded by granted permissions (`VIEW_EVENT`, `EDIT_EVENT`, `MANAGE_GUESTS`, etc.).
  - Destruction protection: Collaborators cannot see or trigger the Delete action.
  - Financial protection: Budget and gift metrics are hidden if `MANAGE_BUDGET` is not granted.
  - Shared Event Notice: When entering a shared event, an explicit notification banner informs the collaborator:
    > "Shared event. Available tools follow your accepted team role and the owner’s current package."

---

## 2. Race Isolation Mechanics

### Event Switch Race (Event X -> Event Y)
When navigating directly between events (e.g. `/app/events/101` to `/app/events/102`), asynchronous network latency could allow Event 101's title, cover, or metrics to flash briefly while Event 102 was resolving.

**Resolution:**
In `EventWorkspace.jsx` and `DashboardFeature.jsx`:
```javascript
useEffect(() => {
  let active = true;
  if (!/^[1-9]\d*$/.test(eventId)) return;

  // Synchronous clearance of prior event state
  setState(current => ({
    ...current,
    loading: true,
    event: null,
    access: null,
    error: ""
  }));

  Promise.all([
    invitationService.get(eventId),
    invitationService.listMine(),
    invitationService.access?.(eventId)?.catch(() => null)
  ]).then(([event, events, access]) => {
    if (!active) return;
    // Bind authoritative event data
  });

  return () => { active = false; };
}, [eventId, retry, subject]);
```

### Account Switch Isolation (User A -> User B)
When User A logs out and User B logs in within the same browser runtime:
- `subject = String(user?.id || user?.userId || '')` is included as a strict `useEffect` dependency.
- On user transition, `subject` changes immediately, aborting in-flight requests and triggering a complete state reset.
- Local drafts are indexed by `ownerUserId`, preventing User A's uncommitted drafts from leaking into User B's view.
