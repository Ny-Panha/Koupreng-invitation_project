# Workstreams E & F — Seating Management & Check-in Architecture

## 1. Seating Management (`/app/events/:eventId/seating`)

### Table Capacity & Assignment Rules
- **Capacity Enforcement:** Assignments check table capacity against party size. Overcapacity assignments are blocked with clear feedback.
- **Dual Presentation:**
  1. **Table List Card Grid:** Quick overview of all banquet tables, occupancy badges, assigned guests, and quick unassign actions.
  2. **Interactive Floor Plan Canvas (`SeatingFloorPlan.jsx`):** Symmetrical banquet hall layout with stage, central walkway, and tables.
- **Accessibility & Keyboard Alternatives:**
  - Full keyboard positioning support via arrow keys: Arrow keys move the focused element by 1%; Shift + Arrow keys move by 5%.
  - Screen reader announcements for table selections and moves.
- **Mobile Usability:**
  - Dedicated mobile tab navigation (`Tables`, `Assignment`, `Plan`).
  - Mobile hosts can assign guests via simple dropdown forms without requiring fine-motor dragging on small touchscreens.

---

## 2. Check-In & Attendance Management (`/app/events/:eventId/check-in`)

### Roster, Scanning & Feedback
- **Camera QR Scanner (`QrCameraScanner.jsx`):** Real-time video stream scanning with WebRTC / MediaDevices API.
- **Audio Feedback:** Synthesized audio beeps using Web Audio API:
  - `playBeep()`: 880 Hz sine wave for successful check-in.
  - `playWarningBeep()`: 320 Hz sawtooth wave for duplicate or invalid scans.
- **Duplicate Check-in Alert:** Highlights previous check-in timestamp and warns the usher before recording any duplicate actions.
- **Manual Check-In & Undo:** Allows search by guest name or phone number, with undo capability to revert accidental check-ins.
- **Online Requirement Invariant:** The system clearly communicates that live attendance recording requires an active network connection to authenticate with the backend server, avoiding misleading claims of unverified offline synchronization.
