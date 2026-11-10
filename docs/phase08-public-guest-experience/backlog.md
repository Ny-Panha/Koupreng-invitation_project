# Phase 08 Modernization Backlog & Implementation Log

## Status Overview

- **Phase:** Phase 08 — E-Invitation Premium Public Guest Experience & Cross-Device Modernization
- **Status:** **COMPLETED**
- **Baseline Git SHA:** `d4d6e4e0195831466baf72b5208c1110b97ae3e4`
- **Affected Subsystems:** Public Invitation Routing, Template Renderers, Media Pipeline, Public RSVP, Responsive Framework

---

## User Stories & Acceptance Criteria

### [US-P08-001] Modernized Public Invitation First Impression & Unsealing
- **Description:** As a guest opening an invitation link on mobile, I want a fast, culturally authentic first screen with a dignified unsealing gesture.
- **Acceptance Criteria:**
  - [x] Fast initial load with skeleton state ($< 1.5\text{s}$).
  - [x] Clear ceremonial title ("សិរីមង្គលអាពាហ៍ពិពាហ៍"), couple monogram, and auspicious date.
  - [x] Interactive unsealing (wax seal break, curtain parting, floral unfold) with visible "Skip" button.
  - [x] Immediate static reveal when `prefers-reduced-motion` is active.
- **Status:** **CLOSED**

### [US-P08-002] Event Cover & Couple Portrait Integration in Guest Views
- **Description:** As an event host, my uploaded cover photo and selected focal point must appear in compatible guest invitation templates.
- **Acceptance Criteria:**
  - [x] `publicInvitationToDraft` and `draftToTemplate` forward `couplePhoto` and `coverFocalPoint`.
  - [x] `CoverBackground.jsx` adopts the owner's photo for photo-compatible templates.
  - [x] Focal point alignment (`top`: `50% 15%`, `center`: `50% 50%`, `bottom`: `50% 85%`) applied to hero images.
  - [x] `DigitalYes`, `EmeraldLuxe`, `KhmerFloralGold`, `RoyalGarden`, `BlissEditorial`, `WithJoyPortal`, `EventEssential`, and `KhmerCelestial` render the couple photo.
- **Status:** **CLOSED**

### [US-P08-003] Decorative Template Heritage Preservation
- **Description:** As a host choosing traditional templates, the traditional artwork must not be distorted by uploaded photos.
- **Acceptance Criteria:**
  - [x] `silk-heritage` retains its traditional silk tapestry as default cover.
  - [x] `cover-khmer-golden-wedding` retains its ornate golden Kbach frame as default cover.
  - [x] User photos appear in the photo gallery rather than replacing traditional artwork.
- **Status:** **CLOSED**

### [US-P08-004] Personalized Guest Presentation & Token Security
- **Description:** As a guest receiving a personalized link, I want to see my name and seat without exposing my token to third parties.
- **Acceptance Criteria:**
  - [x] Resolves `?token=...` to display personalized guest name, table, and seat pill.
  - [x] Outputs `<meta name="referrer" content="no-referrer" />` and `<meta name="robots" content="noindex,nofollow" />`.
  - [x] Sanitizes external map directions via `safeDirections`.
- **Status:** **CLOSED**

### [US-P08-005] Public RSVP Form Ergonomics & Instant QR Pass
- **Description:** As a guest, I want to submit my RSVP easily from my phone and get a check-in QR pass.
- **Acceptance Criteria:**
  - [x] Big touch targets ($\ge 46\text{px}$ inputs, $48\text{px}$ button) on mobile.
  - [x] Attendance choices (`Attending`, `Not Attending`, `Maybe`) with guest count stepper.
  - [x] Generates instant check-in QR pass upon confirmation with table and seat assignment.
  - [x] Displays public blessings in the wish wall.
- **Status:** **CLOSED**

### [US-P08-006] 21-Viewport Responsiveness & WCAG 2.2 AA
- **Description:** As any guest on any device, the invitation must be responsive and accessible.
- **Acceptance Criteria:**
  - [x] Verified across 21 viewports (320px to 2560px).
  - [x] Safe-area insets prevent clipping on iPhone notch and home bar.
  - [x] Color contrast exceeds WCAG 2.2 AA ($\ge 4.5:1$ text, $\ge 3.0:1$ UI components).
  - [x] Full keyboard navigation and ARIA live status announcements.
- **Status:** **CLOSED**

---

## Handover Notes for Phase 09

1. **Guest Management Integration:** Phase 09 focuses on Host-side Guest Management (Roster, Groups, Bulk Invite Links, RSVP Administration, Seating Chart Editor).
2. **Data Continuity:** The guest RSVP responses collected in Phase 08 (`rsvpService.submitPublic`) feed directly into Phase 09's host dashboard analytics and check-in roster.
3. **Database Guardrails:** Strictly preserve all 48 database migrations (`changedMigrations: []`).
