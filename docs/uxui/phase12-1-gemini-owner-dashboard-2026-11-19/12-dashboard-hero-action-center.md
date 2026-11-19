# 12 — Dashboard Hero & Action Center

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Event Overview Hero, Dynamic Action Center, and Countdown Pill  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Overview Hero Presentation

`DashboardFeature.jsx` presents an editorial hero section at the top of the event workspace:
- **Event Visual:** Resolved cover photo or template artwork with subtle gradient scrim.
- **Labels:** Tone-coded status pill (`badge-published`, `badge-draft`) paired with event type ("Wedding", "Birthday", etc.).
- **Headlines:** Event title and couple/host names formatted with Heart icon.
- **Meta Row:** CalendarDays with formatted date, reception time, and MapPin with venue name.

---

## 2. Dynamic Countdown Pill

- **Future Events:** Renders an animated gold countdown pill with Sparkles icon:
  `"{days} days to your celebration"` / `"{days} ថ្ងៃទៀតដល់កម្មវិធីរបស់អ្នក"`.
- **Past Events:** Replaces countdown with a neutral status tag:
  `"Event completed"` / `"កម្មវិធីបានកន្លងផុត"`.
- **Unscheduled Events:** Omitted cleanly without displaying `NaN` or negative numbers.

---

## 3. Dynamic Action Center

Rather than a static checklist, the Action Center computes the single most impactful next step based on actual server state:
1. **Details Incomplete:** CTA -> "Complete event details" (`/app/events/:id/settings`).
2. **Template Not Selected:** CTA -> "Choose your invitation" (`/app/events/:id/invitation`).
3. **Draft State:** CTA -> "Review and publish" (`/app/events/:id/invitation`).
4. **Published (No Guests):** CTA -> "Add your first guests" (`/app/events/:id/guests`).
5. **Published (Guests Present):** CTA -> "Review guest RSVPs" (`/app/events/:id/rsvp`).

Unauthorized viewers are never directed into owner-only settings or publishing workflows.
