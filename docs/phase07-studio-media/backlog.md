# Phase 07 Modernization Backlog & Implementation Log

## Status Overview

- **Phase:** Phase 07 — Visual Invitation Studio, Required Event Photo Upload & Media Modernization
- **Status:** **COMPLETED**
- **Baseline Git SHA:** `09e7a28379e5039d1f3e0618bc14deb272d28cc9`
- **Affected Subsystems:** Event Creation Wizard, Visual Invitation Studio, Media Library, Template Engine, Design Tokens

---

## User Stories & Acceptance Criteria

### [US-P07-001] Required Event Photo in Event Creation Wizard
- **Description:** As an event host creating a new event, I must select an event photo in Step 2 (Event Essentials) so my event has an immediate visual identity.
- **Acceptance Criteria:**
  - [x] Clear contextual label based on event type (Wedding: "រូបថតគូស្នេហ៍ / Couple Photo", Engagement: "រូបថតភ្ជាប់ពាក្យ / Engagement Photo", Birthday: "រូបថតម្ចាស់ខួប / Celebrant Photo", Corporate: "រូបសញ្ញា ឬរូបភាពកម្មវិធី / Event Cover or Logo").
  - [x] Validates MIME types (JPEG, PNG, WebP) and maximum size of 5 MB.
  - [x] Provides helpful guidance modal when user attempts to upload Apple HEIC/HEIF images.
  - [x] Interactive focal point alignment selector (`Top`, `Center`, `Bottom`) with live preview overlay.
  - [x] Allows clearing and replacing the selected photo before submission.
  - [x] Step 4 (Review) displays a photo thumbnail and link back to Step 2 for editing.
- **Status:** **CLOSED**

### [US-P07-002] Two-Stage Idempotent Persistence & Error Recovery
- **Description:** As an event host, my event creation must reliably create the event and upload the cover image without duplicating records if the network fails during upload.
- **Acceptance Criteria:**
  - [x] Sequential flow: `invitationService.create` followed by `mediaService.uploadCover(eventId, photoFile)`.
  - [x] Failed photo upload records `pendingEventId`, alerts the user, and allows 1-click retry without re-creating the event.
  - [x] Draft mode (`mode === "draft"`) does not block when photo is omitted.
  - [x] Revokes object URLs on component unmount to prevent memory leaks.
- **Status:** **CLOSED**

### [US-P07-003] Event Card & Dashboard Cover Precedence
- **Description:** As an event host, my uploaded photo must automatically become the cover on event cards and overview headers.
- **Acceptance Criteria:**
  - [x] Resolves owner cover photo (`coverSource = "owner"`) before falling back to template default artwork.
  - [x] Applies focal point CSS (`object-position`) based on user selection.
  - [x] Fully integrated with `eventCover.js` and `EventCover.jsx`.
- **Status:** **CLOSED**

### [US-P07-004] Template Capability & Cultural Photo Mapping
- **Description:** As an event host, my uploaded portrait should automatically be used in invitation templates that support portraits, while preserving traditional decorative artwork.
- **Acceptance Criteria:**
  - [x] Maps uploaded photo to `couplePhoto` and `coverUrl` for photo-compatible templates (`khmer-floral-gold`, `bliss-editorial-wedding`, `royal-garden-cinematic`, `the-digital-yes-wedding`, etc.).
  - [x] Strictly preserves decorative artwork for heritage templates (`silk-heritage` tapestry, `cover-khmer-golden-wedding` Kbach frame).
  - [x] Preserves photo mappings across dynamic template switching in the Studio.
- **Status:** **CLOSED**

### [US-P07-005] Visual Studio Modernization & Focal Point Alignment
- **Description:** As an event host, I want a responsive, elegant invitation editor with real-time preview and focal point adjustments.
- **Acceptance Criteria:**
  - [x] 3-region desktop layout: Left section nav, Center live scaled canvas, Right theme controls.
  - [x] Mobile drawer / bottom sheet preview with safe-area insets.
  - [x] Focal point controls in the Studio cover section.
  - [x] Unsaved changes tracking with sticky header actions.
- **Status:** **CLOSED**

### [US-P07-006] Media Manager Modernization
- **Description:** As an event host, I want an intuitive media library to manage all my event assets.
- **Acceptance Criteria:**
  - [x] Drag-and-drop file upload dropzone.
  - [x] Upload progress indicator and validation toasts.
  - [x] Asset cards displaying category badge, format, and size.
  - [x] Safe in-place replacement and confirmed deletion.
- **Status:** **CLOSED**

### [US-P07-007] Responsiveness & WCAG 2.2 AA Accessibility
- **Description:** As any user on mobile, tablet, or desktop, the interface must be fully accessible and responsive.
- **Acceptance Criteria:**
  - [x] Verified viewports: 320px, 390px, 768px, 1024px, 1440px, 1920px.
  - [x] Touch targets meet >= 44x44px.
  - [x] WCAG 2.2 AA contrast ratios verified (>= 4.5:1 text, >= 3.0:1 UI components).
  - [x] Full keyboard navigation and ARIA landmarks.
- **Status:** **CLOSED**

---

## Handover Notes for Phase 08

1. **Guest Management Integration:** Phase 08 will focus on Guest List management, bulk invite link generation, Khmer naming formats, and RSVP responses.
2. **Media Link in Guest Invites:** The event cover photo resolved in Phase 07 (`coverSource: "owner"`) will be rendered on guest preview envelopes and unsealing screens.
3. **Database Guardrails:** Retain the untouched 48 migrations invariant (`changedMigrations: []`).
