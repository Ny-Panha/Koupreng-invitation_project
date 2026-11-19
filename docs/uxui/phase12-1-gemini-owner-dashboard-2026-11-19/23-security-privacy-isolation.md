# 23 — Security, Privacy & Isolation Protections

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** C10-001 Guest RSVP Protection, Credential Hygiene, and Anti-Leakage Controls  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Preservation of Phase 10 P1 `C10-001` Protection

The guest RSVP security architecture established in Phase 10 remains strictly preserved:
- No token or authority crossover between guest RSVP sessions and host account sessions.
- No cached resurrection of expired guest tokens.
- Public RSVP form lifetimes are independent and never influenced by owner workspace mutations.

---

## 2. Credential & Data Hygiene in Visual Evidence

In accordance with security rules:
- No live bearer tokens, refresh tokens, passwords, or hashes are rendered in the DOM or visible in screenshots.
- Test sessions utilize deterministic mock tokens (`eyJhbGciOiJub25lIn0...`) restricted to local test execution.
- No real phone numbers, emails, or personal host addresses are included in test fixtures.

---

## 3. Account Switch Data Isolation

When a user logs out and another logs in within the same browser tab:
1. `EventWorkspace` monitors the active `user.id`. A change in user ID synchronously clears the in-memory event, access permissions, and dashboard totals.
2. In-flight API promises for the previous user are aborted via an `active` closure flag, preventing late-arriving responses from binding to the new user's session.
3. `weddingStorage` separates local draft storage by owner user ID, ensuring User A's uncommitted drafts cannot be read by User B.
