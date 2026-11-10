# Phase 09 — Premium Guest Management, RSVP Administration, Personalized Invitation Sharing, Seating & Check-in Modernization

## 1. Executive Summary

Phase 09 modernizes the host-facing guest ecosystem for the E-Invitation Project, establishing a unified, secure, culturally respectful, and mobile-first experience across:
- **Guest Management:** Responsive cards for mobile phones (`< 820px`) and dense productive table for desktop, bulk selection, CSV export, phone click-to-call, and bilingual Khmer/English controls.
- **CSV & Excel Import:** 5-step idempotent import wizard with server-side validation, duplicate detection, formula injection defense, and a critical Web Crypto fallback ensuring zero crashes on iPhone Safari over LAN HTTP.
- **Personalized Invitation Sharing & Delivery:** Support for Telegram, WhatsApp, and Native Web Share (`navigator.share`) with clear distinction between manual records and provider-confirmed delivery.
- **RSVP Administration:** Authoritative backend counts distinguishing total guest records from allocated party headcounts, wish moderation, and guest privacy protection.
- **Seating & Interactive Floor Plan:** Table capacity validation, dual view (cards and banquet canvas), touch-friendly table cards, and keyboard arrow-key navigation.
- **QR Check-in & Attendance:** Camera scanner, duplicate scan alerts, manual check-in, and clear online-status requirements.

---

## 2. Phase 08 Baseline & Invariants

- **Preceding Commit:** `6dbe48458bcbedcdfac7db8f23efd05d92ea1699`
- **Database Migrations:** 48 migrations preserved intact (`V1` to `V48`, `changedMigrations: []`).
- **Backend API Endpoints:** 100% backward-compatible REST contracts.
- **Test Suite Status:** 1,452 passing vitest tests (+6 tests added in Phase 09) across 209 test files.

---

## 3. Documentation Suite Sitemap

1. [README.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/README.md) — Executive summary, baseline verification, and architecture overview.
2. [guest-management.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/guest-management.md) — Guest dashboard, responsive mobile cards, group filtering, and CRUD operations.
3. [import-workflow.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/import-workflow.md) — 5-step import wizard, duplicate protection, formula escaping, and Web Crypto Safari fallback.
4. [invitation-delivery.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/invitation-delivery.md) — Telegram, WhatsApp, Web Share, and delivery status integrity.
5. [rsvp-administration.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/rsvp-administration.md) — Headcounts vs records, wish moderation, and host controls.
6. [seating-and-check-in.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/seating-and-check-in.md) — Table capacities, floor plan canvas, QR camera check-in, and duplicate alerts.
7. [responsive-accessibility.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/responsive-accessibility.md) — 21 viewport audit and WCAG 2.2 AA accessibility verification.
8. [security-data-integrity.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/security-data-integrity.md) — Token confidentiality, formula sanitization, and access boundaries.
9. [test-results.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/test-results.md) — Full automated test reports, lint results, and build artifacts.
10. [backlog.md](file:///d:/Koupreng-invitation_project/docs/phase09-guest-management/backlog.md) — Completed Phase 09 scope, VCF contact import roadmap, and Phase 10 boundary.
