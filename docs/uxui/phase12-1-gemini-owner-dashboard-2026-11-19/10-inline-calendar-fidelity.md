# 10 — Inline Calendar Fidelity & Temporal Correctness

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Leap Year Calculations, Month Transitions, Agenda Feed, and Bilingual Rendering  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Calendar Architecture & Subviews

`EventCalendar.jsx` provides two synchronized subviews:
1. **Month Grid View:** A Monday-first 7-column calendar grid showing all days of the selected month, muted days of adjacent months, and multi-status event chips.
2. **Agenda Feed View:** A chronological list of upcoming celebrations with formatted local dates, reception times, and direct action triggers.

---

## 2. Leap Year Accuracy (`2028-02-29`)

A common bug in date arithmetic is assuming February always has 28 days, causing leap-day events to roll over into March 1st.
`EventCalendar` computes days in month dynamically using:
```javascript
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
```
For `year = 2028` and `month = 1` (February), `getDaysInMonth(2028, 1)` yields `29`.
The leap day `2028-02-29` renders as a distinct gridcell button without date drift. Verified by `Phase12_1EventCalendarFidelity.test.jsx`.

---

## 3. Bilingual Month & Day Labeling

- **English (`en`):** Months formatted via `Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })` (e.g., "November 2026"); weekday headers: `["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]`.
- **Khmer (`km`):** Authentic Khmer months array:
  `["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"]`;
  short weekday headers: `["ច", "អ", "ព", "ព្រ", "សុ", "ស", "អា"]`.

---

## 4. Multi-Tone Status Chips

Event chips in month cells and detail cards are tone-coded:
- `.is-published`: Emerald green tone for live, published events.
- `.is-draft`: Cool slate tone for server drafts.
- `.is-local`: Warm amber tone for uncommitted local drafts.
- `.is-sync-failed`: Coral rose tone for failed sync attempts.
