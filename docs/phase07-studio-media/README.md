# Phase 07 — Visual Invitation Studio, Required Event Photo Upload & Media Modernization

## Executive Summary

Phase 07 delivers a comprehensive modernization of the event media pipeline, visual invitation editor, and owner experience across mobile and desktop devices. It resolves key user journeys:
1. **Mandatory Event Photo Selection:** Couples and hosts select their event photo during event onboarding (`/app/events/new` in Step 2: Event Essentials) with contextual bilingual labels, client-side validation (JPEG, PNG, WebP <= 5 MB), HEIC guidance, focal point positioning (Top, Center, Bottom), and instant object URL preview.
2. **Two-Stage Idempotent Persistence:** Robust sequential persistence where `invitationService.create` creates the server event entity, followed by immediate cover upload via `mediaService.uploadCover(eventId, photoFile)`. If network failure strikes the photo upload step, `pendingEventId` prevents duplicate event creation and provides a single-click retry action. Partial drafts (`mode === "draft"`) remain accessible without requiring a photo.
3. **Event Cover Precedence:** Automatic integration with `eventCover.js` and `EventCover.jsx` ensuring owner-uploaded photos (`coverSource: "owner"`) take precedence over template default artwork on event cards (`/app/events`), event overview headers (`/app/events/:id`), and workspace navigation.
4. **Template Capability & Cultural Photo Reuse:** Intelligent mapping of the uploaded event photo into template layouts that feature couple portraits, hero covers, and floral unsealing moments (`khmer-floral-gold`, `royal-garden-cinematic`, `bliss-editorial-wedding`, `the-digital-yes-wedding`, `emerald-luxe`, `withjoy-modern-portal`, `khmer-celestial`), while strictly preserving traditional decorative-only artwork (`silk-heritage` tapestry and `cover-khmer-golden-wedding` Kbach frame).
5. **Modernized Visual Studio:** Responsive 3-region layout (desktop) and focused mobile editing drawer with safe-area insets, interactive focal point alignment, and bilingual Khmer/English typography.
6. **Drag-and-Drop Media Manager:** Interactive dropzone, upload progress indicator, mime/size tags, and safe media replacement and removal.
7. **Architectural Safety & Stability:** Zero changes to all 48 database migrations (`changedMigrations: []`), zero backend API breaks, 1,441 passing frontend unit tests, 0 ESLint errors across user and admin apps, and verified design tokens.

---

## File Structure & Documentation Index

- [`event-photo-architecture.md`](./event-photo-architecture.md) — Two-stage sequential upload architecture, focal point mechanics, client-side validation, error recovery, and draft handling.
- [`event-cover-template-mapping.md`](./event-cover-template-mapping.md) — Template capability matrix, cover precedence hierarchy, decorative template preservation, and dynamic template switching.
- [`studio-modernization.md`](./studio-modernization.md) — Visual Invitation Studio architecture, 3-region desktop layout, mobile drawer, focal alignment controls, and section choreography.
- [`media-manager.md`](./media-manager.md) — Media Manager enhancements, drag-and-drop dropzone, upload progress tracking, asset cards, and safety checks.
- [`responsive-accessibility.md`](./responsive-accessibility.md) — Multi-viewport responsive verification (320px–1920px), WCAG 2.2 AA contrast, keyboard accessibility, and ARIA landmarks.
- [`test-results.md`](./test-results.md) — Complete quality assurance records, Vitest suites, Playwright verification, linting status, token sync, and foundation bundle impact.
- [`backlog.md`](./backlog.md) — Completed Phase 07 user stories, acceptance criteria, and roadmap progression toward Phase 08.
