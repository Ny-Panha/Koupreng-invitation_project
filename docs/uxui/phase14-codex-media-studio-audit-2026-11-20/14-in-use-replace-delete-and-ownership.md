# Phase 14 Codex Audit — Report 14: In-Use Replace, Delete, and Ownership

## 1. In-Use Reference Dependency Graph
Function `invitationMediaReferences(invitation)` inspects `designJson`, `contentJson`, `layoutSettings`, and root fields:
- Matches URL strings across `coverImage`, `gallery`, `venueMap`, `portraits`, `ticketImage`, etc.
- If an asset URL is present in the reference set, it receives an in-use tag (`t('inUse')`) and a dedicated badge.

## 2. Destructive Action Guards
- If a user attempts to delete an in-use asset, a warning dialog prompts them to edit or unlink the asset in Studio first (verified in `N14-30`).
- If an asset is actively used as the cover, the "Set as cover image" button is cleanly disabled.
- In-place replacement (`PUT /api/v1/invitations/{id}/media/{mediaId}/replace`) updates the binary file without mutating its referenced URL or breaking existing layouts.

- [Visual: In-Use Reference Tag](visuals/18-in-use-reference-tag.png)
