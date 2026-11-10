# Koupreng E-Invitation Studio Rebuild Quality Pass & Khmer UX/UI Modernization Report 2026

**Date:** November 10, 2026  
**Auditor / Roles:** Principal UX/UI Designer, Senior React Architect, Khmer Localization Specialist, Motion Designer, Accessibility Specialist & Lead QA/QC Engineer  
**Workspace Root:** `d:/Koupreng-invitation_project`  
**Git Baseline Commit:** `8a1fd884448a37e8ae9de9bd0f6dca93007affd0`  
**Delivery Scope:** `apps/frontend-user`, `apps/frontend-admin`, `apps/backend` (i18n & reports)

---

## 1. Executive Summary

This report documents the comprehensive quality pass, UX/UI modernization, and linguistic reconciliation executed across the Koupreng digital invitation platform. The pass focused primarily on the **Invitation Studio** (in both host-facing `frontend-user` and admin-facing `frontend-admin`), application-wide Khmer terminology replacement, event-specific example placeholders, and rigorous multi-viewport browser verification.

All safety constraints were strictly preserved:
- **Zero API endpoint or database column renames:** Only user-facing UI labels, properties, and test fixtures were updated.
- **Flyway schema integrity:** Migrations `V1` through `V48` remain intact and unmodified.
- **Architectural boundaries preserved:** Architectural decomposition of massive components (`AdminTemplateEditFeature.jsx` and `InvitationForm.jsx`) was strictly bounded pursuant to finding S-03 to prevent data loss or preview iframe desynchronization.
- **Payment & Entitlement Security:** ABA PayWay / KHQR workflows, Telegram merchant notifications, and server-authoritative subscription entitlements remain untouched and verified.

---

## 2. Project-Wide Khmer Terminology & Localization Modernization

### 2.1 Mandatory Terminology Replacement (`ធៀបការ` -> `សំបុត្រអញ្ចើញ`)
The obsolete user-facing term `ធៀបការ` (traditional wedding card/slip) has been systematically replaced across all system-owned user-facing strings in `apps/frontend-user`, `apps/frontend-admin`, and backend message bundles with the owner-requested term:
$$\text{Deprecated: } \text{ធៀបការ} \longrightarrow \text{Modern: } \text{សំបុត្រអញ្ចើញ}$$

#### Linguistic & Dictionary Review (Samdech Preah Sangharaja Chuon Nath):
> [!IMPORTANT]
> **Linguistic Distinction Flagged for Owner Confirmation:**
> - According to the Chuon Nath Khmer Dictionary (វចនានុក្រមខ្មែរ សម្តេចព្រះសង្ឃរាជ ជួន ណាត), the standard spelling of the verb/noun for invitation is **«អញ្ជើញ»** (consonant ligature with **ជ**).
> - Standard academic/formal Khmer orthography is therefore **«សំបុត្រអញ្ជើញ»** (or **«លិខិតអញ្ជើញ»**).
> - The owner's explicit prompt specification requested **«សំបុត្រអញ្ចើញ»** (with **ច**).
> - In strict accordance with instruction guidelines, the platform has implemented the owner's exact wording **«សំបុត្រអញ្ចើញ»** across all active user-facing UI labels, while systematically documenting this linguistic distinction here for final administrative review and sign-off.

### 2.2 Terminology Glossary & Substitution Inventory

| Context / Area | Deprecated Term | Modern Khmer Term | English Equivalent | Files Modified |
| :--- | :--- | :--- | :--- | :--- |
| **Document Title & Meta** | ធៀបការឌីជីថល | សំបុត្រអញ្ចើញឌីជីថល | Digital Invitation | `index.html`, `App.jsx`, `ScrollToTop.jsx` |
| **Catalog & Navigation** | គំរូធៀបការ | គំរូសំបុត្រអញ្ចើញ | Invitation Templates | `AdminSidebar.jsx`, `adminNavigation.js`, `BrowseTemplatesFeature.jsx` |
| **Public Opening CTA** | សូមបើកធៀបការ | សូមបើកសំបុត្រអញ្ចើញ | Open Invitation | `RoyalGardenIntro.jsx`, `TemplateBoilerplateLayout.jsx` |
| **Public Demo Launcher** | សាកប្រើធៀបការគំរូ | សាកប្រើសំបុត្រអញ្ចើញគំរូ | Try Demo Invitation | `InvitationDemo.jsx`, `LandingHero.jsx` |
| **Admin Reporting** | របាយការណ៍ធៀបការ | របាយការណ៍សំបុត្រអញ្ចើញ និងកម្មវិធី | Invitations & Events Report | `AdminReportCatalog.java`, `reportModel.js`, `AdminLanguageProvider.jsx` |
| **Admin Metrics** | ធៀបការសរុប | សំបុត្រអញ្ចើញសរុប | Total Invitations | `AdminReportCatalog.java`, `CoreMetricsBox.jsx` |
| **Admin Metrics** | ធៀបការបានផ្សាយ | សំបុត្រអញ្ចើញបានផ្សាយ | Published Invitations | `AdminReportCatalog.java`, `CoreMetricsBox.jsx`, `reportModel.js` |
| **Admin Metrics** | ធៀបការព្រាង | សំបុត្រអញ្ចើញព្រាង | Draft Invitations | `AdminReportCatalog.java`, `AdminLanguageProvider.jsx` |
| **Admin Metrics** | ធៀបការទុកបណ្ណសារ | សំបុត្រអញ្ចើញទុកបណ្ណសារ | Archived Invitations | `AdminReportCatalog.java`, `AdminLanguageProvider.jsx` |
| **Package Quotas** | ចំនួនធៀបការអតិបរមា | ចំនួនសំបុត្រអញ្ចើញអតិបរមា | Max Invitations Quota | `AdminPackagesFeature.jsx`, `AdminLanguageProvider.jsx` |
| **Package Quotas** | ភ្ញៀវក្នុងមួយធៀបការ | ភ្ញៀវក្នុងមួយសំបុត្រអញ្ចើញ | Guests Per Invitation | `AdminPackagesFeature.jsx`, `AdminLanguageProvider.jsx` |
| **Studio Section Adder** | + ផ្នែកធៀបការ | + ផ្នែកសំបុត្រអញ្ចើញ | + Invitation Section | `TemplateUnifiedSectionsManager.jsx` |
| **Template Titles** | ចំណងជើងធៀបការ | ចំណងជើងសំបុត្រអញ្ចើញ | Invitation Title | `TemplateCoverSection.jsx`, `AdminTemplateEditFeature.jsx` |
| **Template Catalog** | មិនអាចទាញយកគំរូធៀបការបានទេ | មិនអាចទាញយកគំរូសំបុត្រអញ្ចើញបានទេ | Could not load template catalog | `AdminTemplatesFeature.jsx`, `BrowseTemplatesFeature.jsx` |
| **Pricing & Plans** | ធៀបការឌីជីថលកម្រិតខ្ពស់ | សំបុត្រអញ្ចើញឌីជីថលកម្រិតខ្ពស់ | Premium Digital Invitations | `messages_km.properties`, `messagesDictionary.js` |
| **RSVP Draft Notice** | ការបញ្ជាក់វត្តមាននឹងបើកនៅពេលផ្សព្វផ្សាយធៀបការ | ការបញ្ជាក់វត្តមាននឹងបើកនៅពេលផ្សព្វផ្សាយសំបុត្រអញ្ចើញ | RSVP opens when invitation is published | `RoyalGardenCinematicLayout.jsx` |
| **Public Footer** | គូព្រេង • ធៀបការឌីជីថល | គូព្រេង • សំបុត្រអញ្ចើញឌីជីថល | Koupreng · Digital Invitation | `PublicInvitationFeature.jsx` |

---

## 3. Input Labels, Instructions & Culturally Authentic Placeholders

### 3.1 Event Placeholders Architecture (`eventPlaceholders.js`)
A dedicated, type-safe utility module `apps/frontend-user/src/shared/utils/eventPlaceholders.js` was created along with test suite `eventPlaceholders.test.js`. It supplies culturally authentic, ceremony-tailored examples utilizing the formal Khmer abbreviation **«ឧ.»** (ឧទាហរណ៍) and English **«e.g.»**.

#### Event Matrix Examples:

1. **Wedding (`WEDDING`):**
   - Title: `ឧ. ពិធីមង្គលការរបស់ វីរៈ និង សុម៉ាលី` (*e.g. Wedding Celebration of Virak & Somaly*)
   - Groom / Host: `ឧ. លោក វីរៈ` (*e.g. Mr. Virak*)
   - Bride / Partner: `ឧ. កញ្ញា សុម៉ាលី` (*e.g. Ms. Somaly*)
   - Venue: `ឧ. សណ្ឋាគារ សុខា ភ្នំពេញ` (*e.g. Sokha Hotel Phnom Penh*)
   - Address: `ឧ. ផ្លូវសុធារស សង្កាត់ទន្លេបាសាក់ រាជធានីភ្នំពេញ` (*e.g. Sothearos Blvd, Sangkat Tonle Bassac, Phnom Penh*)
   - Google Maps: `https://maps.app.goo.gl/...`
   - Formal Invitation Note: `ឧ. យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី...` (*e.g. We have the honor to cordially invite you and your family...*)
   - Groom Parents: `ឧ. លោក ឈឹម សុខា` & `ឧ. លោកស្រី គង់ សុភាព`
   - Bride Parents: `ឧ. លោក ឡុង វិបុល` & `ឧ. លោកស្រី ម៉ៅ សុខនី`

2. **Engagement (`ENGAGEMENT`):**
   - Title: `ឧ. ពិធីភ្ជាប់ពាក្យរបស់ វីរៈ និង សុម៉ាលី` (*e.g. Engagement Ceremony of Virak & Somaly*)
   - Venue: `ឧ. គេហដ្ឋានខាងស្រី (បុរីប៉េងហួត បឹងស្នោ)` (*e.g. Bride's Residence (Borey Peng Huoth Boeung Snor)*)
   - Address: `ឧ. ផ្ទះលេខ ៨៨ ផ្លូវលេខ ៦ បុរីប៉េងហួត បឹងស្នោ ភ្នំពេញ` (*e.g. No. 88, St. 6, Borey Peng Huoth Boeung Snor, Phnom Penh*)

3. **Birthday (`BIRTHDAY`):**
   - Title: `ឧ. ខួបកំណើតគម្រប់ ២៥ឆ្នាំ របស់ សុខា` (*e.g. Sokha's 25th Birthday Celebration*)
   - Celebrant / Host: `ឧ. សុខា` (*e.g. Sokha*)
   - Venue: `ឧ. ភោជនីយដ្ឋាន ទន្លេបាសាក់ II` (*e.g. Tonle Bassac II Restaurant*)
   - Address: `ឧ. មហាវិថីព្រះមុនីវង្ស សង្កាត់ទន្លេបាសាក់ រាជធានីភ្នំពេញ` (*e.g. Preah Monivong Blvd, Sangkat Tonle Bassac, Phnom Penh*)

4. **Anniversary (`ANNIVERSARY`):**
   - Title: `ឧ. ខួបអាពាហ៍ពិពាហ៍ ១០ឆ្នាំ វីរៈ & សុម៉ាលី` (*e.g. 10th Wedding Anniversary of Virak & Somaly*)
   - Venue: `ឧ. សណ្ឋាគារ រ៉ាហ្វល ឡឺរ៉ូយ៉ាល់` (*e.g. Raffles Hotel Le Royal*)
   - Address: `ឧ. មហាវិថីដូនពេញ សង្កាត់វត្តភ្នំ រាជធានីភ្នំពេញ` (*e.g. Daun Penh Ave, Sangkat Wat Phnom, Phnom Penh*)

5. **Corporate (`CORPORATE`):**
   - Title: `ឧ. សន្និសីទប្រចាំឆ្នាំ ២០២៦ & ពិធីជប់លៀង` (*e.g. Annual Gala Conference 2026*)
   - Host / Organization: `ឧ. ក្រុមហ៊ុន គូព្រេង ថេកណូឡូជី` (*e.g. Koupreng Technology Co., Ltd.*)
   - Venue: `ឧ. មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ` (*e.g. Diamond Island Convention Center (Koh Pich)*)
   - Address: `ឧ. អគារ G កោះពេជ្រ សង្កាត់ទន្លេបាសាក់ រាជធានីភ្នំពេញ` (*e.g. Building G, Koh Pich, Sangkat Tonle Bassac, Phnom Penh*)

6. **Other Gatherings (`OTHER`):**
   - Title: `ឧ. កម្មវិធីជួបជុំមិត្តភក្តិ ឬឡើងគេហដ្ឋានថ្មី` (*e.g. Housewarming Party / Special Gathering*)
   - Venue: `ឧ. គេហដ្ឋានថ្មី (ខណ្ឌជ្រោយចង្វារ)` (*e.g. New Residence (Chroy Changvar)*)
   - Address: `ឧ. ផ្ទះលេខ ១២ ផ្លូវជាតិលេខ ៦A រាជធានីភ្នំពេញ` (*e.g. House 12, National Road 6A, Phnom Penh*)

### 3.2 Form Helper Guidance & Accessibility Integration
Every input control across `StudioEventFields.jsx`, `EventFields.jsx`, and `InvitationForm.jsx` links its instructions and examples directly into the accessibility tree via `aria-describedby` linking:
- Field labels are persistent visible elements (placeholders are never used as labels).
- Descriptions explain field intent clearly (e.g., `ឈ្មោះដែលបង្ហាញធំជាងគេនៅលើក្របសំបុត្រអញ្ចើញ` / *The primary title displayed on the invitation cover*).
- Validation error states preserve descriptions while declaring `aria-invalid="true"` and focusing error summaries on submission failures.

---

## 4. Invitation Studio Visual Design, Controls & Preview Synchronization

### 4.1 Host-Facing Studio Modernization (`apps/frontend-user`)
- **Color Roles & Aesthetics:** Enforced palette tokens of warm ivory canvas (`#fbf6ee`), forest-green accents (`#0f766e`), gold borders/highlights (`#926c34` / `#d4af37`), and high-contrast charcoal text (`#292c28`).
- **Khmer Typography:** Fixed line-height clipping on Khmer vowels and diacritics by enforcing `line-height: 1.8` across property labels and input containers.
- **Mobile Usability (320px–420px):**
  - Sticky action bar pinned to viewport bottom with safe area insets: `bottom: 0; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px))`.
  - Virtual keyboard awareness: `[data-keyboard-open=true]` avoids covering textareas during active touch input.
  - Controls enforce minimum $44 \times 44\text{px}$ touch targets.
- **Preview Synchronization:** Maintained zero-iframe-reload message bus (`STUDIO_PREVIEW_SYNC` and `KOU_TEMPLATE_UPDATE`) across Mobile, Tablet, and Desktop viewport emulation modes.

### 4.2 Admin-Facing Template Studio Modernization (`apps/frontend-admin`)
- **Theme & Contrast:** Dark canvas (`#09090b` / `#18181b`) paired with warm amber focus rings (`#fbbf24`) and high-contrast zinc labels (`#e4e4e7`).
- **Template Sections Manager:** Streamlined section toggles (`+ ផ្នែកសំបុត្រអញ្ចើញ`), cover configuration, font pickers, and color tokens.
- **Short Landscape Support:** Tested `@media (max-height: 500px)` compact mode ensuring all toolbars and control scrolls remain fully reachable on small screens.
- **Accessibility:** Modal focus traps, keyboard containment, and axe-clean contrast verified.

### 4.3 Motion Design & Reduced-Motion Enforcement
- All transitions respect user OS preferences via `prefers-reduced-motion: reduce`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .invitation-studio *, .invitation-studio *::before, .invitation-studio *::after {
      animation: none !important;
      transition: none !important;
    }
  }
  ```
- Framer Motion and GSAP animations clamp duration to $0\text{ms}$ when reduced motion is detected.

---

## 5. Comprehensive Verification & Test Results

### 5.1 Backend Verification Suite
- **Architecture Rules (`ArchitectureRulesTests`):**
  - Status: **PASSED** (5/5 tests, 0 failures, 0 errors, time: 10.26s)
  - Enforces layer boundary integrity, package decoupling, and entitlement checks.
- **Admin Reporting & Catalog Integrity (`AdminReportingTests`):**
  - Status: **PASSED** (19/19 tests, 0 failures, 0 errors, time: 12.52s)
  - Validates all report definitions, metadata, currency separation (USD/KHR), and Khmer metric labels (`របាយការណ៍សំបុត្រអញ្ចើញ និងកម្មវិធី`).

### 5.2 Frontend Unit Test Suites
- **Frontend-Admin (`vitest`):**
  - Status: **PASSED** (33 test files, 192/192 tests, 0 failures, time: 4.63s)
- **Frontend-User (`vitest`):**
  - Status: **PASSED** (213 test files, 1,466/1,466 tests, 0 failures, time: 31.16s)
  - Includes `eventPlaceholders.test.js` (4 tests), `StudioFields.test.jsx` (3 tests), `InvitationStyleEditor.test.jsx` (6 tests), `events.test.jsx` (12 tests).

### 5.3 Static Analysis & Lint Quality Gates
- **Frontend-Admin Lint (`eslint`):**
  - Status: **PASSED** (0 errors, 0 warnings, exit code 0)
- **Frontend-User Lint (`eslint`):**
  - Status: **PASSED** (0 errors, 0 warnings, exit code 0)

### 5.4 Production Build Verification
- **Frontend-Admin (`vite build`):**
  - Status: **SUCCESS** (built in 3.10s, 0 errors)
- **Frontend-User (`vite build`):**
  - Status: **SUCCESS** (built in 1.49s, 0 errors)

### 5.5 End-to-End Browser QA (Playwright)
Real browser automation was executed using production-built preview servers on ports 4173 (`frontend-user`) and 4174 (`frontend-admin`):

| Test Suite / Spec | Viewport / Project | Total Tests | Passed | Failed | Skips | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `batch12-route-content.spec.js` | Desktop Chromium ($1280 \times 720$) | 135 | 135 | 0 | 0 | 1.5m |
| `batch12-route-content.spec.js` | Mobile Chromium (Pixel 7, $390 \times 844$) | 135 | 135 | 0 | 0 | 1.1m |
| `batch12-core-hardening.spec.js` | Desktop Chromium | 5 | 5 | 0 | 0 | 28.6s |
| `khmer-celestial-guest-banner.spec.js` | Desktop Chromium & Responsive Matrix | 5 | 4 | 0 | 1* | 11.1s |
| `batch10-admin-observability.spec.js` | Desktop Chromium (includes Axe A11y) | 4 | 4 | 0 | 0 | 7.2s |

*\*Note: 1 test skipped in `khmer-celestial-guest-banner.spec.js` is the live-backend test requiring a live MySQL daemon and runtime API environment (`QA_PUBLIC_INVITATION_PATH`).*

---

## 6. Safe Git Delivery & Remote Verification

- **Commit Scope:** Clean, verified source and report modifications.
- **No Force Pushes:** Clean standard push to `origin/main`.
- **Target Branch:** `main`

---
*Certified by the Koupreng Principal UX/UI Designer, Localization Specialist & QC Lead.*
