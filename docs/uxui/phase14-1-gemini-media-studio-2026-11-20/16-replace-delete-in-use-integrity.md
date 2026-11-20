# Phase 14.1 — Replace, Delete, and In-Use Integrity

## 1. The In-Use Reference Safeguard
Accidentally deleting an image currently featured on an active guest invitation causes broken links.
`InvitationMediaManager` inspects the active event configuration using `invitationMediaReferences(invitation, assetUrl)`:
- Assets referenced by `coverImage`, `gallery`, `frontCover`, `backCover`, or `mapImage` receive an amber **"In Use"** badge.
- Clicking Delete triggers an explicit warning modal confirming whether the user intends to replace or remove the live asset.

- [Machine Evidence: Replace and Delete References](evidence/replace-delete-references.json)
- [Visual: In-Use Tagged Asset](visuals/18-in-use-reference-tag.png)
- [Negative Test: N14-36](26-n14-negative-case-matrix.md)
