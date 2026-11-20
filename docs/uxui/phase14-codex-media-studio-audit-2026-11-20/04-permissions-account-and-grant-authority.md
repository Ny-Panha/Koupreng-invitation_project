# Phase 14 Codex Audit — Report 04: Permissions, Account, and Grant Authority

## 1. Async Authority Lifecycle Protection
In `apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx`, asynchronous requests are protected by `authorityRef`:
```javascript
const authorityRef = useRef({
  eventId: id,
  userId: currentUserId,
  generation: 0,
});
```

### Pre-Dispatch and Post-Await Invariants
1. When `id` or `currentUserId` changes, `authorityRef.current` immediately increments `generation`, clears pending staged files (`preflightFiles`), resets inspector modal, and dismisses active errors.
2. In `executeSafeAction`, an `authSnapshot` is captured prior to dispatch. Following async operations (`upload`, `replace`, `delete`), the snapshot is checked against `authorityRef.current`. If `generation`, `eventId`, or `userId` diverged, the late response is dropped and no UI state mutation occurs.
3. Negative scenario `N14-22` and `N14-26` confirm that account switches isolate uploads and unauthorized collaborators cannot trigger delete or replace endpoints.

- [Machine Evidence: Permission Race Matrix](evidence/permission-race-matrix.json)
