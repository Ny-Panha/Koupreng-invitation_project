# Modernization Backlog — Post Phase 03 State

This document updates the modernization backlog following the successful completion and verification of **Phase 03**. It preserves all historical items while updating current task statuses.

---

## 1. Phase 03 Items — Completed

| Item ID | Domain | Scope & Description | Phase 03 Status |
|---|---|---|---|
| **UI-003** | Public UX / Mobile / Auth | Modernize public landing page, mobile drawer navigation, and authentication experience with Khmer cultural identity, WCAG 2.2 AA accessibility, and mobile-first responsiveness (320px–1440px). | **COMPLETED & VERIFIED.** 1,583 unit tests passing, 292 Playwright cross-browser tests passing, 0 Axe accessibility violations, 0 backend changes. |
| **NAV-001** | Navigation Architecture | Mobile drawer full-height (`100dvh`), left rounded radius, safe-area insets, scroll lock/containment, focus containment guard, and desktop preference visibility fix. | **COMPLETED.** Fixed `.kp-mobile-preferences` and `.host-mobile-menu` desktop style conflicts. |
| **AUTH-001** | Authentication Experience | Mobile responsive card scaling (`<= 480px` & `<= 360px`), >= 44px touch targets on home, language, and footer links, password requirement checklist preservation, Google GSI & Telegram OIDC integration safety. | **COMPLETED.** Verified with `@axe-core/playwright` on Chromium and WebKit. |
| **LAND-001** | Landing Page Modernization | Cultural trust badge, 3 core feature highlights, horizontal overflow containment on guest demo table, and focus outlines on FAQ accordions. | **COMPLETED.** Verified with `HomeFeature.test.jsx` in both English and Khmer. |

---

## 2. Forward Roadmap Backlog (Phases 04 – 14)

| Phase | Item ID | Description & Acceptance Gates | Target Phase |
|---|---|---|---|
| **Phase 04** | **UI-004** | **Creation Wizard Modernization:** Evidence-based creation flow, multi-event type selection (Traditional Cambodian Wedding, Monks Blessing, Reception, Engagement), draft state persistence, idempotent retry logic, and disposable integration. | Next Phase (Phase 04) |
| **Phase 05** | **UI-005** | **Owner Dashboard:** Event management overview, RSVP summaries, timeline shortcuts, real-time metrics, and verified calendar integrations. | Phase 05 |
| **Phase 06** | **UI-006** | **Template Marketplace & Catalog:** Template browsing, filtering, live demo preview transitions, and premium entitlement checks. | Phase 06 |
| **Phase 07** | **UI-007** / **MED-001** | **Invitation Studio & Media Manager:** Visual invitation editor, media asset uploader, image cropping, HEIC support guidance, and race condition prevention. | Phase 07 |
| **Phase 08** | **UI-008** | **Guest Experience & Ceremonial Presentation:** Dedicated guest invitation layouts, 3D wax seal and envelope opening animations, music player, interactive map integration, and performance optimization. | Phase 08 |
| **Phase 09** | **UI-009** | **Guest List & RSVP Operations:** Guest import/export (CSV/Excel), custom guest links, dietary requirements, party size tracking, and Telegram alerts. | Phase 09 |
| **Phase 10** | **PAY-001** / **PAY-002** | **Payment & Monetization Architecture:** ABA PayWay KHQR flow, Telegram merchant proof ingestion, idempotent payment verification, and financial audit trails. | Phase 10 |
| **Phase 11** | **UI-011** / **CMS-001** | **Admin Workspace & CMS Modernization:** Template CRUD, user administration, transaction auditing, and system logs. | Phase 11 |
| **Phase 12** | **UI-012** / **AI-001** | **Analytics, Reports & AI Assistant:** Financial ledger exports, guest analytics, and AI-assisted wedding wording/itinerary generation. | Phase 12 |
| **Phase 13** | **A11Y-013** | **Full Accessibility & Performance Hardening:** Comprehensive screen-reader audits, zoom/text spacing, manual keyboard navigation, and Core Web Vitals optimization. | Phase 13 |
| **Phase 14** | **REL-001** / **V-001** / **V-002** | **Production Release Readiness & Final Certification:** Production environment validation, Docker Compose deployment, Nginx proxy, backup/restore runbooks, and final security sign-off. | Phase 14 |
