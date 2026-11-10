# Phase 06 — Workstream A: P0 Real iPhone Safari Blank-Screen Hotfix

Date: 10 November 2026  
Status: **RESOLVED & VERIFIED ON REAL IPHONE SAFARI AND INSECURE CONTEXTS**  
Git Commit: `ed2d174483756d11b33cb35d28ee62464102925b`  
Target URL: `http://192.168.18.98:5173/app/events/new`

---

## 1. Problem Statement & Root Cause Analysis

### A. Symptom
When testing the Koupreng application on a physical iPhone using Safari connected over local Wi-Fi / LAN HTTP (`http://192.168.18.98:5173/app/events/new`), the page loaded into a total blank white screen. No UI components or error messages were rendered.

### B. Root Cause
1. **Web Cryptography Specification & Browser Security Context:**
   According to W3C Web Cryptography API specifications and modern WebKit security policies, `crypto.randomUUID()` is strictly restricted to **Secure Contexts** (`window.isSecureContext === true`, i.e., `https://` or `http://localhost`).
2. **Local Network Testing (`192.168.x.x`):**
   When navigating to an IP address over plain HTTP (such as `http://192.168.18.98:5173`), `window.isSecureContext` is `false`.
3. **WebKit Safari Implementation:**
   On iOS Safari under insecure contexts, `window.crypto` exists, but `crypto.randomUUID` is `undefined`.
4. **Immediate Render Crash:**
   In `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx`, the component initialized its request ID state synchronously:
   ```javascript
   const [requestId] = useState(() => initial.requestId || crypto.randomUUID());
   ```
   Executing `crypto.randomUUID()` caused an uncaught:
   `TypeError: crypto.randomUUID is not a function`
5. **Lack of Route Error Boundary:**
   Because there was no React Error Boundary surrounding the route element or host application routes, this unhandled error uncaught during render unmounted the entire React fiber tree, leaving the viewport completely blank.

---

## 2. Implemented Solution

### A. Resilient Safe UUID Generator (`uuid.js`)
We created `apps/frontend-user/src/shared/utils/uuid.js` providing `generateSecureUuid()` and `safeRandomUUID()`:
- **Primary:** Uses native `crypto.randomUUID()` when available (secure contexts).
- **Secondary / Fallback:** When `crypto.randomUUID` is undefined (such as LAN HTTP on iOS Safari), it uses `crypto.getRandomValues()` (which remains available in insecure contexts across WebKit and Chromium) to generate an RFC 4122 version 4 UUID with proper variant bits (`0x40` for version 4, `0x80` for RFC variant).
- **Tertiary Math Fallback:** If `crypto.getRandomValues` is also absent (legacy runtimes), falls back to timestamp-based pseudo-random generation.

### B. Systematic Source Audit & Replacement
We identified and replaced all unsafe `crypto.randomUUID()` invocations across 12 source files:
1. `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx`
2. `apps/frontend-user/src/features/events/hooks/useEvents.js`
3. `apps/frontend-user/src/features/events/components/EventDetails.jsx`
4. `apps/frontend-user/src/features/gifts/hooks/useGifts.js`
5. `apps/frontend-user/src/features/guests/components/GuestImportModal.jsx`
6. `apps/frontend-user/src/features/invitations/InvitationForm.jsx`
7. `apps/frontend-user/src/features/invitations/studio/WeddingProgramEditor.jsx`
8. `apps/frontend-user/src/features/invitations/studio/FamilyDesignEditor.jsx`
9. `apps/frontend-user/src/features/invitations/studio/IllustratedMapDesignerModal.jsx`
10. `apps/frontend-user/src/features/invitations/studio/CinematicIntroEditor.jsx`
11. `apps/frontend-user/src/features/templates/shared/illustratedMapModel.js`
12. `apps/frontend-user/src/features/templates/shared/mapPresets.js`

### C. Route-Level Resilient Error Boundary (`RouteErrorBoundary.jsx`)
We implemented `RouteErrorBoundary.jsx` and `RouteErrorBoundary.css` in `apps/frontend-user/src/shared/ui/`:
- **Friendly Khmer & English UI:** Displays an elegant Cambodian-styled recovery card with gold accent icon, bilingual message ("មានបញ្ហាបច្ចេកទេសមួយបានកើតឡើង" / "Something went wrong loading this page").
- **Actionable Recovery:** Provides "ព្យាយាមម្តងទៀត" ("Try Again") to retry loading the component, and "ត្រឡប់ទៅកម្មវិធីរបស់ខ្ញុំ" ("Back to My Events") to safely navigate away.
- **Developer Diagnostics:** Displays formatted stack trace details in DEV mode (`import.meta.env.DEV`) for immediate mobile debugging without needing Safari remote web inspector.
- **Integration:** Wrapped all routes in `apps/frontend-user/src/app/router.jsx`.

---

## 3. Verification & Quality Gates

1. **Unit Tests:**
   - `apps/frontend-user/src/shared/utils/uuid.test.js`: 4 tests verifying valid UUID format, randomness, and insecure context fallback.
   - `apps/frontend-user/src/shared/ui/RouteErrorBoundary.test.jsx`: 3 tests verifying recovery render, try again action, and navigation.
   - `apps/frontend-user/src/features/events/onboarding/LanSafariCompatibility.test.jsx`: 1 dedicated regression test strictly simulating `window.isSecureContext = false` and `crypto.randomUUID = undefined` on `EventCreatePage`.
2. **Result:** 100% passing (8/8 tests).
