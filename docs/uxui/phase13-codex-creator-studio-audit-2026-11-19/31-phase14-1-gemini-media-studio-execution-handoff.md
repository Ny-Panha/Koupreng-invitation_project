# Report 31: Phase 14.1 Gemini Media Studio Execution Handoff Contract

> **Target:** Architectural Boundaries, Preconditions & Scope for Phase 14.1  
> **Author:** Codex (Senior Release & Architecture Engineer)  
> **Recipient:** Gemini CLI (Incoming Phase 14.1 Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Clean Architectural Boundary

Phase 13 delivered the **Creator Studio Shell & Section Editors** (`InvitationStudio.jsx`, `StudioToolbar.jsx`, `StudioSections.jsx`, `useStudioPersistence.js`, `useStudioSplit.js`). 

Phase 13 deliberately scoped media fields to:
- URL string bindings (`coverImage`, `backgroundImage`, `invitationImage`, `musicUrl`, `videoUrl`).
- Local temporary object URLs (`blob:`) for instant preview simulator rendering.
- Basic image format and 10MB size validation.

**Phase 14.1 owns the complete Media Studio & Asset Pipeline.** No media transformation, Cloudinary direct upload, or waveform visualization was implemented in Phase 13.

---

## 2. Phase 14.1 Scope of Work (Media Studio)

When authorized by user prompt for Phase 14.1, Gemini CLI will implement:

### 1. Direct Cloudinary CDN Signed Upload Pipeline
- Backend signature generation endpoint (`/api/v1/media/signature`).
- Client-side pre-upload image compression (WebP conversion, max dimension clamping) to reduce bandwidth on Cambodian mobile connections.
- Chunked, resumable direct upload to Cloudinary with real-time upload progress indicators.

### 2. Photo Gallery & Album Management
- Multi-photo drag-and-drop reordering (reorder wedding photo cards with immediate preview sync).
- Aspect ratio focal point selector (ensures couple's faces remain centered regardless of viewport crop).
- Image caption and alt-text localization in Khmer and English.

### 3. Audio & Music Studio
- Real-time HTML5 Web Audio API waveform scrubber and visualizer.
- Dedicated volume controls and loop/fade-out settings for ceremony music.
- Support for multiple ceremony cue tracks (Entrance, Ring Exchange, Dinner).

### 4. Video Studio Enhancements
- Automated video thumbnail extraction from YouTube/Vimeo API.
- Custom poster frame image binding for pre-wedding videos.
- Video duration and aspect ratio validation (16:9 vs 9:16 vertical reels).

### 5. Centralized Event Asset Library
- Modal asset manager allowing couples to browse previously uploaded photos across events.
- Tagging, search, and bulk deletion with storage quota tracking.

---

## 3. Invariants That Gemini Must Preserve in Phase 14.1

1. **C10-001 Guest Privacy:** Media assets must not expose private attendee pictures without explicit gallery permission.
2. **Phase 11 Credential Binding:** All media API requests must bind to the authenticated session with CSRF protection.
3. **Phase 12 Ownerless Draft Safety:** Uploaded media must attach to the active event draft; revoked collaborator permissions (HTTP 403) must fail-closed immediately.
4. **Unknown JSON Preservation:** `contentJson` and `designJson` payload reconstruction must retain `...safeJson(...)` at the base to preserve arbitrary metadata.
5. **Zero External Bundle Bloat:** Any image cropping or waveform visualization must use lightweight canvas or native APIs without heavy third-party bloat.
6. **All 48 Flyway Migrations:** Zero changes or rollbacks to applied database migrations.
7. **10 Template Families:** All 10 template renderers must continue to display photos and artwork cleanly without regression.
