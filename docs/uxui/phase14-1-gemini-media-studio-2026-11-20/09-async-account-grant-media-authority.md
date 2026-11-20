# Phase 14.1 — Async Account, Grant, and Media Authority

## 1. The Async Race Vulnerability
In single-page applications, users may switch events, log out, or switch accounts while large file uploads are in flight. If the upload resolves after the switch, data may inadvertently bleed into the wrong event.

## 2. Authority Snapshot Mechanism
`InvitationMediaManager` protects against this by creating an immutable authority snapshot before initiating uploads:
```javascript
const authoritySnapshot = {
  eventId: currentEventId,
  userId: currentUserId,
  generation: generationRef.current
};
```
Upon completion of each batch chunk, the component compares `authoritySnapshot` with the active context. If the event ID or user ID has changed, or the component was unmounted, the response is discarded safely and no state mutation occurs.

- [Machine Evidence: Async Races](evidence/async-authority-races.json)
- [Negative Tests: N14-22 and N14-23](26-n14-negative-case-matrix.md)
