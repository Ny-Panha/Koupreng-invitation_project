# 13 — KPI, RSVP, Guests & Check-in Truth

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Truth in Metric Reporting, Zero vs. Missing Values, and Reception Attendance  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Zero vs. Uninitialized Differentiation

In `DashboardFeature.jsx`, KPI metrics strictly differentiate between a truthful `0` (e.g. 0 guests invited) and missing or uninitialized data:
- **Invited Guests:**
  - `stats.guestTotal > 0`: Displays count + `"total invited"` / `"នាក់បានអញ្ជើញ"`.
  - `stats.guestTotal === 0`: Displays `"No guests yet"` / `"មិនទាន់មានភ្ញៀវ"` with direct link to add guests.
- **Confirmed RSVPs:**
  - `stats.guestTotal > 0`: Displays percentage + `"attending"` / `"នឹងមកចូលរួម"`.
  - `stats.guestTotal === 0`: Displays `"Awaiting reply"` / `"រង់ចាំការឆ្លើយតប"`.
- **Reception Check-in:**
  - `stats.rsvpYes > 0`: Computes percentage of confirmed guests checked in (`Math.round((checkedIn / rsvpYes) * 100)%`).
  - `stats.rsvpYes === 0`: Displays `"Ready for reception"` / `"ត្រៀមសម្រាប់ពិធី"`.

---

## 2. API Source Precedence

Metrics are derived strictly from authoritative backend reports:
1. `GET /api/v1/reports/invitations/:id/dashboard`: Source for `totalGuests`, `attending`, `declined`, `pending`, and `rsvpRate`.
2. `GET /api/v1/guests/check-in/summary?invitationId=:id`: Source for physical reception attendance.
3. No speculative milestone progress bars or mock guest numbers are ever injected.
