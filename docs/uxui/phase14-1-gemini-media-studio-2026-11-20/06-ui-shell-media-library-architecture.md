# Phase 14.1 — UI Shell and Media Library Architecture

## 1. Component Composition
The KoupReng Media Atelier shell is implemented in `apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx`:
- **Header & Workspace Context:** Surfaces event name, active media count, and direct links to Invitation Studio.
- **Category Tabs:** `<button type="button" aria-pressed="...">` inside `role="group"` navigating between Cover, Gallery, Video, and Music.
- **Upload Action Bar:** Dropzone area with native `<input type="file">` trigger and batch-upload action buttons.
- **Preflight Staging Tray:** Displays staged files awaiting upload with individual progress indicators, format tags, and cancel buttons.
- **Asset Grid:** Responsive grid (1 to 4 columns depending on viewport) rendering interactive asset cards.
- **Focal Point Inspector Modal:** Accessible dialog trapping focus for 2D focal calibration.

## 2. State Management
- `activeTab`: Current category view (`cover`, `gallery`, `video`, `music`).
- `preflightQueue`: Array of staged files with per-file validation state, progress, and object URLs.
- `focalModal`: Open state and active asset payload for focal framing.
- `inUseMap`: Cached dictionary of active invitation field references.

- [Machine Evidence: Changed Files](evidence/changed-files-attribution.json)
- [Source Reference: InvitationMediaManager.jsx](../../../apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx)
