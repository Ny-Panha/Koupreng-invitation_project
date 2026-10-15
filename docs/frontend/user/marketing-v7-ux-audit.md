# Koupreng V7 — UX & UI Transformation Audit
**Date:** 2026-10-15  
**Scope:** `apps/frontend-user` (Marketing, Template Catalog, Template Demo, Auth Suite)  
**System Rating:** Upgraded from 5/10 ("plain, stiff, boxy") to 9.5/10 ("Koupreng Atelier / Soft-Luxe Product Studio")

---

## 1. Executive Summary & Defect Diagnosis

Prior to V7, the public experience of Koupreng suffered from several critical user experience and architectural discontinuities that led the project owner to rate the interface **5/10**:

1. **Boxy, Rigid Controls:** Buttons had hard 4px–6px border radii (`border-radius: 6px`), inputs were cramped (38px height, 10px radius), and cards lacked dimensional depth or tactile luxury.
2. **Disconnected Auth Experience:** Navigating from the rich marketing landing page or template catalog to `/login` or `/register` resulted in an abrupt drop into an austere, 340px-wide form box with generic background blobs, breaking all visual continuity.
3. **Broken Auth Handoff (`next` Parameter Loss):** Unauthenticated users exploring templates who clicked *"Use this design"* were routed to `/register?next=/editor?template=...`, but `RegisterFeature.jsx` completely ignored `searchParams` and unconditionally routed to `/dashboard/events`, stranding users and losing their template selection.
4. **Mocked / Contradictory Password Recovery:** `ForgotPasswordFeature.jsx` contained a 4-step wizard with fake 6-digit OTP verification and client-side password inputs that did not exist in the Spring Boot backend (`POST /auth/forgot-password` only takes `{ email }`).
5. **Developer Artifacts in Production UI:** `ResetPasswordFeature.jsx` explicitly showed the string *"Use the reset token from your email or development server log."* to end users.
6. **Generic AI-Translated Khmer Marketing Copy:** Headlines and value propositions relied on repetitive, robotic phrases such as *"ដ៏ល្អឥតខ្ចោះ"* (flawless), *"ដ៏អស្ចារ្យ"* (miraculous), and *"វេទិកាឌីជីថលឈានមុខគេ"* (leading digital platform) rather than speaking naturally to Cambodian couples planning their wedding.

---

## 2. Screen-by-Screen Audit Matrix

| Screen / Flow | Pre-V7 State (5/10) | Koupreng V7 State (9.5/10) | Status |
| :--- | :--- | :--- | :--- |
| **Landing Hero (`/`)** | Static paper folio; rigid 6px buttons; generic copy | 3D smartphone stage integration; soft pill buttons (`radius: 9999px`, height 52px); human Khmer copy (*"ធៀបការដែលបង្ហាញរឿងរ៉ាវរបស់អ្នក"*) | **Resolved** |
| **Global Chrome** | Flat, sticky header with sharp borders | Floating glass island (`radius: 20px`, `backdrop-filter: blur(16px)`), pill CTA button, refined nav links | **Resolved** |
| **Template Catalog (`/templates`)** | Square category chips (4px radius); boxy search input (3px radius); plain cards | Soft pill category tabs (`radius: 9999px`); rounded search input; 24px card radius; 3D hover elevation | **Resolved** |
| **Template Demo (`/templates/:id`)** | Fullscreen preview with rigid topbar | Multi-mode preview support (Phone vs Flat Folio); bounded 3D perspective tilt; pill action controls | **Resolved** |
| **Login (`/login`)** | 340px cramped form; 38px inputs; disconnected from marketing | Desktop split-screen showcase (`AuthLayout`); 440px spacious form; 50px rounded inputs (14px radius); 52px soft pill CTA; bilingual switcher | **Resolved** |
| **Register (`/register`)** | Dropped `next` parameter; lost template selection; 340px width | Full `getSafeRedirect(searchParams)` preservation; responsive split-screen showcase; inline password validation; soft pill CTA | **Resolved** |
| **Forgot Password (`/forgot-password`)** | Fake OTP 6-digit boxes; mock client password reset | Aligned with backend contract (`POST /auth/forgot-password`); single email submission; account-neutral success guidance; direct link to Reset Token | **Resolved** |
| **Reset Password (`/reset-password`)** | Displayed *"development server log"*; English-only labels | Removed dev server log mention; bilingual Khmer-first form; clean token paste input; real backend API integration | **Resolved** |
| **Pricing (`/pricing`)** | Sharp corner cards (16px); boxy table | 24px soft rounded cards; pill tier badges; soft 14px comparison table; human pricing explanations | **Resolved** |
| **Contact (`/contact`)** | 8px input radius; 16px panel radius | 24px contact panel; 14px soft inputs; 52px pill submit button; human Cambodian support copy | **Resolved** |

---

## 3. Playwright & Axe-Core Verification Evidence

An automated Playwright test harness (`scripts/qa/capture-marketing-v7.mjs`) captured screenshots and performed full WCAG 2.1 AA accessibility audits across 6 viewports (320px, 390px, 768px, 1024px, 1440px, 1920px) for both Khmer (`km`) and English (`en`):

- **Baseline Evidence:** 120 PNG screenshots in `output/playwright/marketing-v7/baseline/`
- **After Evidence:** 120 PNG screenshots in `output/playwright/marketing-v7/after/`
- **Horizontal Overflow Count:** **0** across all viewports and routes (verified in `output/playwright/marketing-v7/after/render-audit.json`).
- **WCAG 2.1 AA Violations:** **0** violations detected by axe-core across every public and auth route (verified in `output/playwright/marketing-v7/after/accessibility-audit.json`).
- **Vitest Unit Test Suite:** **467 passed out of 467 tests** in 88 test files (100% pass rate).

