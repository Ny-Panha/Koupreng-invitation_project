# Ready-to-use Prompt 02 — implementation handoff

**This file is a proposal. Phase 02 has not been executed.** Copy the prompt below only when authorizing implementation. Findings are dated 10 November 2026; re-check current source and working tree before edits.

---

# PROMPT 02 — GLOBAL DESIGN SYSTEM, RESPONSIVE FOUNDATIONS AND VERIFIED MOBILE FIXES

Implement Phase 02 in `D:\Koupreng-invitation_project` using the repository-specific Phase 01 evidence in `docs/audits/phase01-2026-11-10/`. Begin at the root, follow `.agents/ROUTER.md` and the current skill index. Choose one primary skill and at most two supporting skills for the active phase. Inspect Git status, manifests and current target files; preserve all unrelated changes.

## Mission and baseline

Improve the existing responsive foundation and fix AU-001–006 without replacing the working product. Most owner/guest usage is expected on phones; prioritize mobile usability, while preserving desktop authoring and administration. Do not install all ten UI libraries or introduce a new global framework.

Actual architecture at audit: React 19.3.1 JSX, React Router 7.18.2, Tailwind 4.3.3, Vite 8.3.5, Axios, Framer Motion; Zustand in customer app, dnd-kit in admin. Java 25/Spring Boot **4.1.1**, MySQL/Flyway. Current versions may differ; manifests prevail over older skill examples. Existing shared design-system, modal, fields, feedback, skeletons and preview messaging are substantive foundations.

Read these audit files first: `05-confirmed-bug-register.md`, `08-design-system-proposal.md`, `09-security-performance-qa.md`, `13-backend-api-database.md`, `14-team-preservation.md`. Use `03-feature-and-route-inventory.md` for all 135 route patterns and `10-modernization-backlog.md` for deferred work.

Baseline evidence: frontend unit suites 1,391 + 191 pass; both builds/lints pass; backend 598 executed pass + 82 gated skips. Twelve synthetic mobile/desktop journeys pass. General extra browser run has four failures explained by preview-origin configuration and unstable locator-click automation; two preview tests pass after the correct origin is served, and six direct physical-coordinate opening taps pass in three engines. Do not silently turn those failed-run records into clean evidence.

No P0 authorization/payment bypass or core owner/guest mobile blocker was confirmed. Do not invent P0 fixes. AU-001 is a confirmed P1 administrative mobile authoring defect, and AU-002 is a confirmed mobile accessibility barrier. If a new verified P0 emerges during implementation, address its prerequisite safely before proceeding with polish.

## Required work, in dependency order

### T1 — Preserve and refine the existing semantic foundation

Relevant files:

- `apps/frontend-user/src/shared/styles/semantic-tokens.css`
- `apps/frontend-user/src/shared/styles/workspace-ui.css`
- `apps/frontend-user/src/shared/styles/app-experience.css`
- `apps/frontend-user/src/shared/styles/semanticTokens.test.js`
- `scripts/sync-design-tokens.cjs` and its actual generated admin destination
- `apps/frontend-user/src/shared/fonts/core-fonts.css`
- existing admin theme/styles and affected page classes

Keep cream/white/forest/gold, DM Sans and Kantumruy Pro/Battambang. Preserve template-owned decorative fonts and colors. Refine semantic text/action/status roles only where contrast or repeated behavior demonstrates a need; apply the existing token synchronization flow. Document spacing, control sizes, state variants and content-driven responsive bands. Do not add a second root stylesheet/reset or an unrelated pink wedding palette from a generic skill result.

Acceptance: affected text meets contrast in both management themes; form baseline is readable on phone; 44–48px comfort target for primary touch controls; visible focus; no published invitation theme changes when changing owner/admin appearance. WCAG 2.5.8 minimum is 24px with exceptions, not a blanket 44px AA requirement. Existing token sync/tests and affected screenshots pass at 320/390/1440. Roll back by reverting focused token/application changes, not by editing template assets.

### T2 — AU-001: repair admin Studio mobile layout

Relevant files:

- `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx`
- relevant local styles, only if extraction improves clarity
- `apps/frontend-admin/src/shared/preview/previewMessaging.js`
- `apps/frontend-admin/src/shared/hooks/usePreviewSyncRetries.js`
- `apps/frontend-admin/src/shared/config/runtime.js`
- existing admin feature tests and `apps/frontend-user/tests/e2e/batch12-core-hardening.spec.js`

Current failure: at 390px the controls are 320px wide and preview is another 360px, extending to x=680; fixed/overflow-hidden ancestors conceal the remainder. Root horizontal overflow checks miss it. Source locations at audit: fullscreen root around line 1547, split around 1674, aside around 1686, preview around 4037, device frame around 4095.

Introduce a clear single-pane Edit/Preview interaction before both panes cease fitting. All five editing sections must remain readable/reachable. Preserve form state, dirty state, validation, preview gate, selected device mode, trusted postMessage session/origin checks, exact serialization, immutable existing template code, save/retry behavior and Back confirmation. Avoid mounting duplicate active preview frames. Keep the desktop split layout; define a sensible tablet transition based on usable pane space rather than a CSS label alone. Use dynamic viewport bounds and safe areas, and ensure toolbar actions remain reachable at short heights.

Acceptance: on 320/360/375/390/414/430/600/768, edit a visible field, open preview, return, and save/reload without losing that field or unknown authored JSON. Inspect essential pane bounds and hit-test action centers. At 1024/1280/1440 preserve current desktop functionality and pane resizing. Include long Khmer headings and 844×390 short-height checks. Test actual virtual keyboard on a device when available; otherwise mark it unverified. Rollback is a focused layout/control revert; no schema or data migration.

### T3 — AU-002/003: make toolbar and resizing accessible

Same admin Studio file. Add a persistent localized accessible name to the external-preview link whose only text is currently `hidden md:inline` (around 1650). Keep the external destination configured through runtime helpers; mark decorative SVG appropriately.

Replace the mouse-only divider div (around 4005; handlers around 914–950) with accessible bounded adjustment behavior: keyboard operation, value/min/max semantics where appropriate, clear focus, and a simple pointer alternative such as increase/decrease/reset or layout presets. Use pointer events if dragging remains. Phone users should use the T2 panel switch instead of precision dragging.

Acceptance: keyboard and touch users can reach all functions; the link has an EN/KM name at every breakpoint; resize works with mouse plus keyboard and simple taps; no drag gesture traps scrolling; existing widths/reset behavior remain valid. Test 390 and 1440 in Chromium/Firefox/WebKit where installed. Rollback only these controls, preserving trusted preview messaging.

### T4 — AU-004–006: focused contrast corrections

Files and measured failures:

- `apps/frontend-user/src/features/guests/GuestWorkspace.css:136`: note summaries `#b98b42` on white, 3.07:1.
- `apps/frontend-admin/src/features/users/AdminUsersFeature.jsx:294` and header/theme styles: current-user badge 2.96:1; subtitle 4.42:1.
- `apps/frontend-admin/src/pages/auth/LoginPage.jsx:229`: 11px footer text 3.87:1 on dark background.

Use the existing/refined semantic roles on actual surfaces. Preserve guest details, account identity/status, auth forms and actions. Do not globally recolor invitation artwork or alter user roles.

Acceptance: affected normal text ≥4.5:1 on light/dark; EN/KM and 320/390/1440 remain readable; labels and functionality unchanged; axe checks and actual computed colors demonstrate correction. Rollback by reverting affected role use/color changes.

### T5 — Shared component and responsive contracts

Use current `shared/ui/Modal`, `FormField`, `LoadingButton`, `ResponsiveTable`, date/time controls, feedback host and skeletons as the foundation. Scope implementation to demonstrated shared defects or adoption needed by T1–T4; do not rewrite working buttons/forms/tables to satisfy a library checklist. The customer Modal already handles focus, inert backgrounds, scroll, nested preview Escape and restoration. Preserve its API and tests. The admin app should reuse its own compatible primitives or mirror a proven behavior contract deliberately; do not introduce a cross-app source dependency just for appearance.

Document consistent disabled/loading/error/success/empty feedback, label/error associations, native input types/input modes, safe-area/sticky action spacing and contained table overflow. Repair an actual cross-cutting issue when reproduced. Keep the current image MIME/size/entitlement limits and format guidance; HEIC conversion is later feature work.

Acceptance: affected dialogs trap and restore focus, allow Escape, fit short viewports and preserve form state; primary controls remain operable with touch and keyboard; input/error content is not clipped; desktop forms/tables unchanged in purpose. Check zoom/text spacing on affected forms and real keyboard behavior when available. No new animation/scroll/icon engine or duplicate component system.

### T6 — QA-001/002: make responsive verification trustworthy

Relevant files:

- `apps/frontend-user/tests/e2e/support/batch12RouteContracts.js`
- `apps/frontend-user/tests/e2e/batch12-core-hardening.spec.js`
- `apps/frontend-user/tests/e2e/support/activateOpening.js`
- current Playwright configs and fixture origin setup
- audit evidence harnesses as references, not automatically production test modules

Fix hidden-first creation-link assertions, explicitly activate ticket Preview & export and seating Assign guests panels, and make Khmer expectations locale-aware. Preserve all 135 route leaves/aliases and route-specific content assertions. Do not weaken checks to a nonempty root or blanket exclude mobile tests.

Ensure the admin frame origin is actually served/configured. The audit build defaults to `http://localhost:5173`; 4173/4174 alone leave its preview unavailable. Do not relax origin/session validation. Use deterministic reduced-motion paths for accessibility/render checks and retain real coordinate/pointer activation for normal-motion ceremonial controls. A forced click alone does not prove touch usability.

Acceptance: all intended route checks have explicit PASS/FAIL/BLOCKED results with no hidden-desktop or language false failures; failed logs retained; user-visible clipping tests fail before T2 and pass after; correct origin permits authored-field roundtrip; normal-motion tap and keyboard both open the public invitation. Test aliases/back/navigation, nested modal focus and no unexpected API writes.

### T7 — Verification gates and focused performance baseline

Use available dependencies only. Run unit/lint/build checks proportionate to changed modules, then the meaningful affected browser journeys. For frontend-only changes, do not require rerunning unrelated provider/database suites without reason; retain backend compatibility and existing baseline evidence. If an API/authorization/payment contract changes, run relevant backend architecture/auth/payment/integration checks.

Repeat the three-route performance diagnostic on an idle environment before claiming improvement. Current entry bundle is ~462KB raw/~139KB gzip; single throttled lab LCP samples are 4.004/4.592/4.988s with synthetic APIs. Do not add dependencies that materially worsen phone load for decorative benefit. Do not present field INP or Lighthouse numbers that were not measured.

Live core-flow, MySQL and physical-device verification are open gates, not authorization to start a destructive database or real transaction. Use a task-owned disposable schema/event and free template for save/publish/RSVP. Run existing MySQL fresh/upgrade/concurrency tests only with verified task-owned configuration. Telegram pytest was missing; report the environment requirement if still unavailable. Do not install dependencies silently or substitute H2 pass for MySQL proof.

## Library policy

Consult `07-ui-library-evaluation.md` and the existing `docs/design/THIRD_PARTY_UI_LICENSES.md`. Existing project components remain the shared foundation. shadcn is a possible source of a missing primitive, not a requirement to initialize a new design system. Seven adapted vendor components already exist. Animate UI/React Bits/Badtz/Lightswind/Aceternity/Skiper have scope restrictions or unresolved commercial/export terms; do not copy their premium or restricted implementations into paid invitation templates. Use general ideas with original code where justified. Preserve notices and exact-source provenance for any permitted code adoption. No ten-package installation.

## Regression matrix and preservation rules

Every T1–T6 change must have relevant mobile and desktop evidence, keyboard and touch operation, EN/KM labels, light/dark management states, reduced motion and normal-motion interaction where applicable. Critical dimensions: 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440; use focused routes and breakpoint-adjacent dimensions rather than duplicating every expensive suite. Desktop emulation does not certify real iPhone/Android/WebView or Telegram/Facebook clients.

Preserve all authorization/entitlement rules, request IDs, currency/price facts, API shapes, draft/server boundaries, unknown JSON fields, template registry aliases, artwork/fonts, applied Flyway history and teammates' changes. No real financial transaction, outbound message, production data mutation, bulk deletion, commit or push is implied. Do not expand this phase into a landing/editor/marketplace rewrite. Full feature scopes remain Phases 03–14.

Report concrete changes, commands and pass/fail/skip counts, before/after screenshots, any environmental limits, and remaining backlog IDs. A restored test environment does not erase earlier failed evidence. Deliver a reviewable focused Phase 02 result and rollback notes for each task; do not claim production approval while the live/device/MySQL gates remain open.

---

End of proposed Prompt 02. **No changes described above were implemented during Phase 01.**
