# 19 — UX Laws & Nielsen Heuristics Traceability

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Observable Code Implementation of UX Laws and Usability Heuristics  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. UX Laws Traceability

| Law | Principle | Observable Implementation | Code Location |
| :--- | :--- | :--- | :--- |
| **Fitts's Law** | Target acquisition time is a function of distance and size | Primary action buttons ("Manage event" / "Resume draft") occupy prominent positions with large touch areas (full-width on mobile) | `EventCard.jsx`, `EventsFeature.css` |
| **Jakob's Law** | Users expect your site to work like sites they already know | Event cards follow familiar digital atelier patterns; calendar uses standard Monday-first grid and chronological feed | `EventsFeature.jsx`, `EventCalendar.jsx` |
| **Hick's Law** | Time to decide increases with number and complexity of choices | Period filter tabs (All / Upcoming / Past) reduce cognitive overload compared to raw date pickers | `EventsFeature.jsx` |
| **Miller's Law** | Working memory holds 7±2 chunks | Event workspace organizes 18 modules into 4 logical groups (Overview, Design, Guests, Operations) | `EventNavigation.jsx` |

---

## 2. Nielsen Usability Heuristics Traceability

| Heuristic | Principle | Observable Implementation | Code Location |
| :--- | :--- | :--- | :--- |
| **#1: Visibility of System Status** | System keeps users informed through timely feedback | Distinct provenance badges (`Published`, `Draft`, `Local draft`, `Sync failed`, `Shared by X`) keep hosts informed of exact cloud status | `EventCard.jsx`, `EventCalendar.jsx` |
| **#2: Match Between System & Real World** | Speak the user's language | Authentic Khmer celebration terminology (e.g. អាពាហ៍ពិពាហ៍ for Wedding, ពិធីភ្ជាប់ពាក្យ for Engagement) | `eventFields.js`, `EventCalendar.jsx` |
| **#5: Error Prevention** | Eliminate error-prone conditions | Local drafts cannot route to integer-only server endpoints; destructive delete requires modal confirmation | `EventsFeature.jsx`, `EventDeleteModal.jsx` |
| **#6: Recognition Rather than Recall** | Make elements visible | Contextual "Continue where you left off" banner surfaces uncommitted drafts without forcing users to search | `EventsFeature.jsx` |
| **#9: Error Recovery** | Help users recognize and recover from errors | Failed sync preserves the local draft with clear error copy and direct Resume action | `useEvents.js`, `EventsFeature.jsx` |
