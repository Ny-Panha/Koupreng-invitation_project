# Modernization Backlog — Post Phase 04 State

This document updates the modernization backlog following the successful completion and verification of **Phase 04**. It preserves all historical items while updating current task statuses.

---

## 1. Phase 04 Items — Completed

| Item ID | Domain | Scope & Description | Phase 04 Status |
|---|---|---|---|
| **UI-004** | Creation Wizard Modernization | Modernize Event Creation Wizard (`/app/events/new`) into an accessible, mobile-first 4-step progressive wizard with sticky stepper, progress tracking, live Step 4 review card, inline edit shortcuts, recommendation filters, draft autosave persistence, and idempotent submission safety. | **COMPLETED & VERIFIED.** 1,588 unit tests passing (+5 new tests), 270 Playwright cross-browser tests passing, 0 ESLint warnings, 0 Flyway migration changes, 0 backend API changes. |
| **WIZ-001** | Progressive Stepper Architecture | Interactive 4-step navigation (`#step-1-type`, `#step-2-details`, `#step-3-design`, `#step-4-review`) with active/completed indicators, animated progress bar (25%–100%), smooth scrolling, and accessible ARIA attributes. | **COMPLETED.** Verified with `EventWizardModernization.test.jsx` in both English and Khmer. |
| **WIZ-002** | Mobile In-Flow Summary Card | Fix mobile summary blackout on `<= 1100px` viewports where desktop sticky aside was hidden. Step 4 in-flow review card provides celebrant, venue, map, template, and entitlement summary with jump-to-step edit links. | **COMPLETED.** Verified on 320px, 360px, 430px, 768px, and 1440px viewports. |
| **WIZ-003** | Recommendation & Entitlement Filtering | Live template recommendations filtered by style category, invitation language, and price/entitlement status with deep-linked URL intent handling (`?template=...`, `?package=...`). | **COMPLETED.** Verified with `subscriptionService` and `templateCatalogService`. |
| **WIZ-004** | Draft Autosave & Idempotency Safeguards | Form persistence to `sessionStorage` (`koupreng.onboarding.<userId>`) with graceful fallback, UUIDv4 `clientRequestId` idempotency, and double-click submission prevention. | **COMPLETED.** Verified with 21 existing tests in `EventCreatePage.test.jsx`. |

---

## 2. Forward Roadmap Backlog (Phases 05 – 14)

| Phase | Item ID | Description & Acceptance Gates | Target Phase |
|---|---|---|---|
| **Phase 05** | **UI-005** | **Owner Dashboard & Calendar Modernization:** Event management overview, RSVP summaries, timeline shortcuts, real-time metrics, and verified calendar integrations. | Next Phase (Phase 05) |
| **Phase 06** | **UI-006** | **Template Marketplace & Catalog:** Template browsing, filtering, live demo preview transitions, and premium entitlement checks. | Phase 06 |
| **Phase 07** | **UI-007** / **MED-001** | **Invitation Studio & Media Manager:** Visual invitation editor, media asset uploader, image cropping, HEIC support guidance, and race condition prevention. | Phase 07 |
| **Phase 08** | **UI-008** | **Guest Experience & Ceremonial Presentation:** Dedicated guest invitation layouts, 3D wax seal and envelope opening animations, music player, interactive map integration, and performance optimization. | Phase 08 |
| **Phase 09** | **UI-009** | **Guest List & RSVP Operations:** Guest import/export (CSV/Excel), custom guest links, dietary requirements, party size tracking, and Telegram alerts. | Phase 09 |
| **Phase 10** | **PAY-001** / **PAY-002** | **Payment & Monetization Architecture:** ABA PayWay KHQR flow, Telegram merchant proof ingestion, idempotent payment verification, and financial audit trails. | Phase 10 |
| **Phase 11** | **UI-011** / **CMS-001** | **Admin Workspace & CMS Modernization:** Template CRUD, user administration, transaction auditing, and system logs. | Phase 11 |
| **Phase 12** | **UI-012** / **AI-001** | **Analytics, Reports & AI Assistant:** Financial ledger exports, guest analytics, and AI-assisted wedding wording/itinerary generation. | Phase 12 |
| **Phase 13** | **A11Y-013** | **Full Accessibility & Performance Hardening:** Comprehensive screen-reader audits, zoom/text spacing, manual keyboard navigation, and Core Web Vitals optimization. | Phase 13 |
| **Phase 14** | **REL-001** / **V-001** / **V-002** | **Production Release Readiness & Final Certification:** Production environment validation, Docker Compose deployment, Nginx proxy, backup/restore runbooks, and final security sign-off. | Phase 14 |
