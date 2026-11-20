# Phase 14 Codex Audit — Report 13: Cover, Background, and Map Imagery

## 1. Cover Resolution Hierarchy
Function `resolveEventCover(invitation)` cleanly differentiates:
1. `owner`: Uploaded custom cover photo (`coverUrl`).
2. `invitation`: Authored cover specified in draft design.
3. `template`: Default decorative artwork provided by the chosen wedding template.

## 2. Template Artwork Preservation
If an owner removes their custom cover, the UI restores the template's authentic decorative artwork (e.g. Silk Heritage gold border) without leaving a blank placeholder. Sketch map images and portrait photos are tracked in `invitationMediaReferences` and preserved across all mutations (verified in `N14-08` and `N14-29`).

- [Visual: Template Artwork Card](visuals/19-template-artwork-card.png)
