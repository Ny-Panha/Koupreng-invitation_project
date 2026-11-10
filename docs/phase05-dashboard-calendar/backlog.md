# Modernization Backlog — Post Phase 05 State

This document updates the modernization backlog following the successful completion and verification of **Phase 05**. It preserves all historical items while updating task statuses.

---

## 1. Phase 05 Items — Completed

| Item ID | Domain | Scope & Description | Phase 05 Status |
|---|---|---|---|
| **UI-005** | Owner Dashboard & Event Management | Modernize the event management hub (`/app/events`), event card interaction patterns, and individual event overview dashboard (`/app/events/:eventId`) into a premium, responsive, mobile-first experience. | **COMPLETED & VERIFIED.** 1,602 unit tests passing (+14 new tests across 3 suites), 0 ESLint warnings, 0 Flyway migration changes, 0 backend API contract breaks. |
| **EVT-001** | View Mode & Period Filtering | Segmented view mode toggle (List View vs. Calendar View) with persistent state and chronological period filter tabs ("All", "Upcoming", "Past") using local date string comparisons. | **COMPLETED.** Verified with `EventsViewModes.test.jsx`. |
| **EVT-002** | Enhanced Event Cards | Modern card design with local date countdown pill ("In X days" / "Today" / "Past"), event type tag, sparkle accents, celebrant/couple names, venue details, direct "Manage" action, and 3-dots contextual menu. | **COMPLETED.** Verified with existing and enhanced tests. |
| **EVT-003** | Mobile-First Event Calendar | Desktop monthly grid with Monday-first indexing, localized Khmer/English headers, month/year navigation, "Today" jump button, event chips, and selected day inspector. Mobile-responsive layout featuring Agenda view mode with chronological event grouping. | **COMPLETED.** Verified with `EventCalendar.test.jsx` (6 comprehensive tests covering English/Khmer, month navigation, Today jump, Agenda view, and leap-year safety). |
| **EVT-004** | Enriched Event Overview Dashboard | Event hero with cover, countdown badge, couple names, venue details, and link copy action. Sourced 4-metric pulse cards (Guests, Attending, Pending, Checked In) with contextual rates. Preparation checklist with dynamic progress pill. Day-of quick coordination tools. | **COMPLETED.** Verified with `DashboardFeature.test.jsx` (5 tests covering overview, metrics, checklist, tools, and clipboard action). |
| **EVT-005** | Mobile Floating Action Button (FAB) | High-contrast, accessible floating `+` button on mobile viewports (`<= 768px`) for immediate event creation without header scrollback. | **COMPLETED.** Verified across mobile viewports. |

---

## 2. Forward Roadmap Backlog (Phases 06 – 14)

| Phase | Item ID | Description & Acceptance Gates | Target Phase |
|---|---|---|---|
| **Phase 06** | **UI-006** | **Template Marketplace & Catalog:** Template browsing, filtering, live demo preview transitions, and premium entitlement checks. | Next Phase (Phase 06) |
| **Phase 07** | **UI-007** / **MED-001** | **Invitation Studio & Media Manager:** Visual invitation editor, media asset uploader, image cropping, HEIC support guidance, and race condition prevention. | Phase 07 |
| **Phase 08** | **UI-008** | **Guest Experience & Ceremonial Presentation:** Dedicated guest invitation layouts, 3D wax seal and envelope opening animations, music player, interactive map integration, and performance optimization. | Phase 08 |
| **Phase 09** | **UI-009** | **Guest List & RSVP Operations:** Guest import/export (CSV/Excel), custom guest links, dietary requirements, party size tracking, and Telegram alerts. | Phase 09 |
| **Phase 10** | **PAY-001** / **PAY-002** | **Payment & Monetization Architecture:** ABA PayWay KHQR flow, Telegram merchant proof ingestion, idempotent payment verification, and financial audit trails. | Phase 10 |
| **Phase 11** | **UI-011** / **CMS-001** | **Admin Workspace & CMS Modernization:** Template CRUD, user administration, transaction auditing, and system logs. | Phase 11 |
| **Phase 12** | **UI-012** / **AI-001** | **Analytics, Reports & AI Assistant:** Financial ledger exports, guest analytics, and AI-assisted wedding wording/itinerary generation. | Phase 12 |
| **Phase 13** | **A11Y-013** | **Full Accessibility & Performance Hardening:** Comprehensive screen-reader audits, zoom/text spacing, manual keyboard navigation, and Core Web Vitals optimization. | Phase 13 |
| **Phase 14** | **REL-001** / **V-001** / **V-002** | **Production Release Readiness & Final Certification:** Production environment validation, Docker Compose deployment, Nginx proxy, backup/restore runbooks, and final security sign-off. | Phase 14 |
