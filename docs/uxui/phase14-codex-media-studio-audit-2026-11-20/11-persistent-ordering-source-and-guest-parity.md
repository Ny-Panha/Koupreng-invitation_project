# Phase 14 Codex Audit — Report 11: Persistent Ordering and Guest Parity

## 1. Ordering Reality
The Spring Boot backend `MediaController.java` does **not** expose a dedicated sort-order mutation endpoint. Photo ordering in the database is dictated by initial upload sequence.

## 2. Truthful UI Presentation
To maintain complete integrity with the user:
- The UI offers accessible Move Earlier / Move Later controls.
- When items are rearranged, a prominent warning banner is rendered:
  > *"Local preview order. Save your invitation design in Studio to persist the updated photo order across your invitation."*
- Durable persistence across guest views occurs when the user saves the invitation draft in Invitation Studio (`InvitationForm.jsx`).
- Gate `F14.1-32` is independently graded `PARTIALLY COMPLETE`.

- [Visual: Reorder Banner](visuals/16-gallery-reorder-banner.png)
