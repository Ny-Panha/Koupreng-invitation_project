# 07 — Event List Information Architecture

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** `/app/events` Page Layout, Header Hierarchy, Quick Tabs, and Contextual Banners  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Information Hierarchy & Layout

The event management portal (`/app/events`) provides a structured, responsive visual hierarchy:

```
+-----------------------------------------------------------------------------------+
|  [Koupreng invitations]                                                           |
|  My Events                                                    [ List | Calendar ] |
|  Manage your weddings and celebrations...                      [ + Create Event ] |
+-----------------------------------------------------------------------------------+
|  [✨ Contextual Resume Banner: "Continue where you left off"   [ Resume draft -> ]] |
+-----------------------------------------------------------------------------------+
|  [ Tabs: All | Upcoming | Past ]   [ Search... ] [ Status v ] [ Type v ] [ Sort v ] |
+-----------------------------------------------------------------------------------+
|  +-----------------------+ +-----------------------+ +-----------------------+    |
|  | Event Card 1          | | Event Card 2          | | Event Card 3          |    |
|  | [Published]           | | [Local Draft]         | | [Shared by Oknha X]   |    |
|  | [Manage event]        | | [Resume draft]        | | [Manage event]        |    |
|  +-----------------------+ +-----------------------+ +-----------------------+    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Header & Quick View Controls

- **Brand Kicker:** Displays authentic Khmer/English branding (`Koupreng invitations` / `គូព្រេង សំបុត្រអញ្ជើញ`).
- **Layout Switcher:** Segmented control toggling between `List` (grid of editorial cards) and `Calendar` (interactive monthly grid & agenda feed).
- **Primary Creation Action:** Prominent gold button (`+ Create Event` / `+ បង្កើតកម្មវិធី`) navigating directly to the Phase 11.1 creation wizard (`/app/events/new`).

---

## 3. Contextual "Continue Where You Left Off" Banner

When a host has an active, unsaved, or failed-sync local draft and no search/status filters are applied, the resume banner renders at the top of the list:
- **Visual Design:** Warm gold background (`rgba(217, 119, 6, 0.08)`) with subtle amber border (`rgba(217, 119, 6, 0.25)`).
- **Sparkle Icon:** Lucide `Sparkles` indicating pending creator work.
- **Microcopy:**
  - Kicker: "Continue where you left off" / "បន្តការរៀបចំកម្មវិធីចុងក្រោយរបស់អ្នក"
  - Title: Displays draft headline (e.g., "Draft: Dara & Rathana Wedding")
  - Status Tag: "Saved in this browser only" or "Sync failed · Local copy retained"
- **Action:** Primary button navigating directly to the editor (`/dashboard/invitations/:id/edit`).
