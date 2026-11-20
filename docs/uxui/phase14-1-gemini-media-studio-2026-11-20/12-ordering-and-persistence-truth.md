# Phase 14.1 — Ordering and Persistence Truth

## 1. Backend Persistence Reality
The Spring Boot backend `MediaController.java` does **not** expose a dedicated reorder endpoint. Media records in the database are returned by their creation/sort order.

## 2. Truthful UI Presentation
To avoid falsely claiming that reordering in the media tab is immediately saved to the server:
- The UI features accessible keyboard controls (Move Earlier / Move Later) and drag ordering for the gallery preview.
- A prominent, accessible banner states:
  > *"Local preview order. Save design in Studio to persist across guest views."*
- Full persistence occurs when saving the draft in `InvitationDesignStudio.jsx`.

- [Machine Evidence: Reorder Persistence](evidence/reorder-persistence.json)
- [Visual: Reorder Banner](visuals/16-gallery-reorder-banner.png)
