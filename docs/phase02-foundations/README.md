# Phase 02 — responsive and accessible foundations

Implementation date: 10 November 2026. Baseline: `main` at `b96e24297b8f0b44c5119c3f0a5a24b8ea2ac1cd`.

**Status: Phase 02 implementation complete within the documented local/fixture verification scope.** All six confirmed defects are fixed; current combined cross-browser verification passes. Open real-environment release gates remain explicitly separate.

This implements the [Phase 01 handoff](../audits/phase01-2026-11-10/11-prompt-02-implementation-plan.md). Phase 01 documents and screenshots remain historical evidence. The starting tracked tree was clean; the existing untracked `docs/audits/` and `output/playwright/phase01-audit-20261110/` were preserved. No commit, push, database operation, dependency installation or Phase 03 work was performed.

Current manifests retain React/React DOM `^19.3.1`, React Router `^7.18.2`, Tailwind `^4.3.3` and Vite `^8.3.5` in both apps; the user app uses Zustand `^5.0.16` and Framer Motion `^14.5.0`, while admin already has dnd-kit `^6.3.1`. Backend remains Spring Boot 4.1.1 / Java 25. No framework upgrade was part of this work.

## A. Implementation summary and checklist

| Handoff task | Implementation | Verification |
|---|---|---|
| T1: verify baseline and failed cases | Inspected both manifests, current editor, token sync, fixture contracts and audit evidence; reproduced all six defects before production edits | Six baseline tests failed at their intended conditions; retained logs/screenshots |
| T2: AU-001 mobile editor | Edit/Preview panes below 1024px; one mounted form and iframe; scaled preview footprint; wrapping toolbar/sections; usable short-height scrolling | 18 widths, portrait/landscape, retained edits, actual iframe viewport and rendered content |
| T3: AU-002/003 controls | Localized link names; bounded keyboard/pointer separator and simple decrease/reset/increase buttons | Named-link axe, keyboard/focus, mouse drag, touch alternatives, viewport changes |
| T4: AU-004–006 contrast | Existing semantic gold/muted roles plus small extensions to the canonical token file | Rendered axe checks in light/dark modes; semantic color contrast unit test |
| T5: reusable foundations | Extracted only preview sizing, panel sizing and resize controls; preserved working modal, input, feedback and table contracts | Existing unit suites and responsive browser journeys |
| T6: QA-001/002 reliable regression | Active-panel/locale-aware assertions; source-built served iframe origin; deterministic screenshots and real normal-motion opening | All 135 route patterns on desktop/mobile Chromium; focused Chromium/WebKit/Firefox coverage |

The original gold, cream and forest identity, Khmer/English content, invitation artwork and approved fonts remain. No API, DTO, serializer, permission, entitlement, payment-verification or preview-trust rules changed. All 48 migration hashes match the Phase 01 inventory; manifests and lockfiles are unchanged. See [compatibility and bundle evidence](evidence/compatibility-and-bundles.json).

## B. Defect resolution matrix

Paths below are relative to the app named in each row. Complete file inventory is in section G.

| Audit ID | Original problem and root cause | Files changed | Fix | Tests / status |
|---|---|---|---|---|
| AU-001 | At 390px, a minimum 320px controls pane and 360px preview ended at x=680; overflow hiding concealed the inaccessible content. Fixed frame dimensions did not model the scaled footprint. | Admin `features/templates/AdminTemplateEditFeature.jsx`, `TemplateStudio.css`, `components/StudioPreviewFrame.jsx`, `useStudioPanelLayout.js` | Single-pane mobile workflow with explicit Edit/Preview buttons; desktop split from 1024px; logical 380/680/1024px frame scaled to the available width; one iframe remains mounted. Short landscape gets a minimum 320px workspace and native vertical scrolling. Decorative glow stays inside the panel bounds. | Original geometry/visibility test failed before and passes after. All requested widths plus breakpoint neighbors, field retention, actual frame viewport sizes, horizontal overflow and landscape checked. **Fixed** in tested environments. |
| AU-002 | External preview link lost its only text below `md`, leaving an unnamed icon. | Admin `AdminTemplateEditFeature.jsx` | Persistent localized accessible name, decorative icon hidden from accessibility tree; configured URL and new-tab behavior preserved. Export/import controls also retain localized names when their visible labels collapse. | Exact EN/KM role/name checks; axe `link-name`; mobile/desktop coverage. **Fixed**. |
| AU-003 | Nonfocusable div with mouse-only window listeners and fixed percentage bounds. | Admin editor, `components/StudioPanelResize.jsx`, `useStudioPanelLayout.js`, `TemplateStudio.css` | Focusable vertical separator with name/value/min/max; ArrowLeft/Right, Home/End, Enter/Escape reset; native pointer capture; simple 44px adjustment/reset buttons; bounds account for both panes and 44px divider. Explicit semantic gold focus outline. | Keyboard adjustment/reset/end bound, 3px focus outline, actual mouse drag and viewport-bound recalculation. Touch profiles use real center-hit-tested touchscreen taps on adjustment/reset buttons; phones use pane switching. **Fixed**; physical touch/stylus/AT remain unverified. |
| AU-004 | Guest-note summary used gold `#b98b42` on white: 3.07:1. | User `features/guests/GuestWorkspace.css` | Uses the existing themed `--guest-gold` role instead of a separate light gold. | Scoped axe contrast in light/dark, EN/KM; native details interaction preserved. **Fixed**. |
| AU-005 | Hard-coded admin subtitle and current-user badge colors measured 4.42:1 and 2.96:1. | Admin `features/users/AdminUsersFeature.jsx`, `styles/index.css`, shared token exports | Subtitle uses existing muted foreground; current-account badge uses warning foreground/soft surface roles, including dark variants. | Scoped light/dark axe; token contrast tests; account identity/actions and route checks retained. **Fixed**. |
| AU-006 | Dark login footer used `#71717b` on `#121214`: 3.87:1. | Admin `pages/auth/LoginPage.jsx`, `styles/index.css`, shared token exports | Uses readable `--ui-on-dark-muted` (`#a1a1aa`). | Anonymous login footer axe on narrow and desktop browser profiles; no auth/navigation behavior changes. **Fixed**. |

The expanded checks found related details after the first passing suite: the separator needed an explicit focus selector, the old negative decorative-glow positioning produced internal horizontal scrolling in short landscape, and synchronous observer-driven sizing produced a WebKit resize-observer delivery warning during save/reload and viewport changes. These were corrected within AU-001/003; observer work is now coalesced into animation frames with cleanup. JavaScript-error assertions remain strict. Failed intermediate runs remain available; see [test history](test-results.md).

## C. Responsive compatibility matrix

| State | Viewports / conditions | Coverage |
|---|---|---|
| Admin editor, phone | 320, 360, 375, 390, 414, 430px, height 844 | All three engines, desktop and touch-capable profiles; Edit/Preview, five sections, name retention, one iframe, frame bounds and page/internal overflow |
| Intermediate/tablet | 599/600/601, 767/768/769, 820px, height 844 | Same six profiles; mobile pane workflow retained until the desktop split fits |
| Desktop breakpoint | 1023/1024/1025px, height 844 | Same six profiles; single-pane → split transition, retained field and preview |
| Wide editor | 1280/1440px, height 844; 1440×1000 | Same six profiles; reachable sections, split resizing; actual frame content widths 380/680/1024 |
| Short landscape | 844×390 | Same six profiles; native vertical scrolling, full frame reachable, no horizontal content overflow |
| EN/KM editor and contrast | 390×844; light/dark management themes | Six profiles; translated names, section wrapping, screenshots and scoped contrast |
| Repaired Khmer route assertions | 320/390/1440px | Six route groups: events, creation, invitation editor, checkout, admin template edit, admin dashboard; each checked in all six profiles |
| Route leaves and aliases | 135 patterns at desktop Chromium defaults and Pixel 7 emulation defaults | 270 passing route-specific checks, including real active ticket/seating controls; no forced desktop viewport in mobile project |
| Existing dialogs/navigation/auth/payments | Desktop/mobile Chromium | Existing functional, focus/restore, reduced-motion, access-denial and synthetic payment journeys; see command/results ledger |
| Physical iPhone/Android, virtual keyboard, Telegram/Facebook WebViews | Not available | **Untested**; browser emulation is not physical-device verification |

Profiles: Desktop Chrome, Pixel 7, Desktop Safari, iPhone 13, Desktop Firefox, and Firefox at 390×844 with touch enabled. Firefox does not support Playwright's mobile mode; its narrow profile uses desktop Firefox with a narrow viewport and touch, not Android Firefox emulation. Width-sweep tests override profile viewport dimensions while retaining its engine/device characteristics.

Deterministic reduced-motion screenshots were captured and inspected for actual rendered portrait, desktop and landscape preview states and EN/KM editing states. These are reviewable captures, **not a claimed golden-image pixel comparison**. The new foundation and route-smoke tests block external network resources; local font/artwork assets remain available. Physical Khmer font rendering and native keyboard occlusion remain device checks.

Reviewed final captures: [phone preview](../../output/playwright/phase02-foundations/accepted-verification-results/phase02-foundations-AU-001-c9f24--reachable-editing-sections-mobile-chromium/studio-mobile-preview.png), [desktop split](../../output/playwright/phase02-foundations/accepted-verification-results/phase02-foundations-respon-37324--all-sections-across-widths-desktop-chromium/studio-desktop.png), [WebKit landscape](../../output/playwright/phase02-foundations/accepted-verification-results/phase02-foundations-respon-37324--all-sections-across-widths-mobile-webkit/studio-landscape.png), [Khmer editing](../../output/playwright/phase02-foundations/accepted-verification-results/phase02-foundations-Studio-1369d--usable-in-km-and-dark-mode-mobile-chromium/studio-edit-km.png).

## D. Design system and reusable components

The canonical source remains `apps/frontend-user/src/shared/styles/semantic-tokens.css`, synchronized to admin by the existing `scripts/sync-design-tokens.cjs`. Added roles are `--ui-warning-soft`, `--ui-on-dark-muted` and `--ui-on-dark-focus`; admin supplies its warning dark-mode pair. Existing radius and 44px control tokens are reused. No second theme system was introduced.

The admin-only stylesheet scopes dynamic viewport height, safe-area padding, wrapping, 16px touched form fields, generous unitless line heights, focus and reduced motion to the template Studio. It does not recolor the embedded invitation. A field label/id was associated for the existing catalog name input. Device and section buttons now expose selected state through `aria-pressed`; inactive mobile panes are hidden while their state stays mounted. Native scroll is preserved, including an intentionally scrollable short-height editor.

Rendered computed RGB pairs measure guest notes at **5.78:1 light / 8.96:1 dark**, admin subtitle at **5.93:1 / 7.76:1**, and account badge at **6.57:1 / 9.37:1**. The auth footer also passes rendered axe; its translucent OKLab surface is preserved in the computed-style evidence rather than assigned an incorrect uncomposited RGB ratio. See [verification summary](evidence/verification-summary.json) and the token contrast test.

KEEP: existing buttons/feedback host, `FormField`, customer `Modal`, package modal, `ResponsiveTable`, date/time controls and navigation APIs. Their existing loading/error/empty/success, focus return, Escape, contained table scrolling and validation contracts were not rewritten. FIX/ENHANCE: affected editor layout, preview sizing, resize interaction, catalog label, link and semantic contrast roles. REFACTOR: only these small reusable editor primitives. REPLACE: none.

UI/UX Pro Max was available and used as the primary skill, with React best-practice and Koupreng QA guidance supporting it. Local searches for dragging alternatives, reflow and contrast are retained in `evidence/ux-*.txt`. Product-specific audit evidence took precedence over generic generated aesthetics. The implementation uses derived resize bounds, refs for transient pointer state and cleaned-up ResizeObservers/listeners, with no global state or additional animation engine.

## E. UI library usage

**No new library, copied upstream component, font or image asset was needed.** All ten entries in the [Phase 01 evaluation](../audits/phase01-2026-11-10/07-ui-library-evaluation.md) were considered:

| Candidates | Phase 02 decision |
|---|---|
| Animate UI, Badtz UI, Lightswind UI | Existing pane/state/feedback primitives suffice; no motion or wizard package added. |
| Kokonut UI, Untitled UI | Responsive toolbar, grouping and form hierarchy are useful patterns; implemented through current project styles and native controls. |
| shadcn/ui | Existing component contracts retained; no registry initialization, Base UI/Radix addition or competing reset required. |
| React Bits, Aceternity UI, Magic UI, Skiper UI | Preserve existing adapted components and invitation behavior. No new decorative effects, 3D dependencies or restricted source/template redistribution. |

The existing provenance ledger is unchanged. Upstream compatibility/license/maintenance was not freshly re-audited because no upstream component or dependency was adopted; the dated Phase 01 evaluation remains the reference, not a new blanket compatibility guarantee.

## F. Regression and performance results

Full commands, failures, corrections, historical comparison and environment limits are recorded in [test-results.md](test-results.md). Frontend unit results: **1,392 user + 191 admin = 1,583 passing** (one more than Phase 01). Both frontend lints and token synchronization pass. The broad browser regression run passed **334/334**, including 270 route checks and 64 existing regression/journey cases. The final combined gate passed **126/126** in 7.6 minutes: **96 foundation + 30 core cases**, with 21 cases in each of six engine/device profiles and zero failures/skips/retries. This final run includes strict JavaScript-error checks and actual hit-tested touch resizing. The original four failures are individually explained in the test ledger.

Backend/Telegram tests were not rerun: backend, DTOs, security rules, payments and worker code were unchanged. The historical 598 backend passes/82 skips are not presented as current verification. The migration checksum check passed for all 48 files. Browser APIs are explicit fictional contracts, with bounded unknown-request/mutation rejection; real provider, database and production behavior remain outside this evidence.

Same-mode retained before/after build assets give the following raw/gzip byte deltas (Node gzip defaults; not network transfer):

| Artifact | Raw delta | Gzip delta |
|---|---:|---:|
| User entry JS | 0 | -4 |
| User global CSS | +80 | +29 |
| Admin entry JS | +47 | +14 |
| Admin global CSS | -1,767 | -155 |
| Admin Studio lazy JS | +2,766 | +1,034 |
| New admin Studio lazy CSS | +4,302 | +1,324 |

The small editor helpers/CSS load with the admin editor chunk. No new public-journey dependency was introduced. The [measurement script](evidence/verify-foundations.mjs) resolves current emitted entry/chunk names and excludes stale cached hashes. Phase 01's concurrent synthetic LCP samples are not comparable field CWV; no LCP/INP improvement or production performance guarantee is claimed.

## G. Changed file inventory

All paths are relative to repository root.

| Application file | Purpose |
|---|---|
| `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx` | Compose adaptive panes, accessible names/states, field association and new preview/resize primitives |
| `apps/frontend-admin/src/features/templates/TemplateStudio.css` (new) | Scoped responsive layout, touch sizes, focus, safe areas and motion |
| `apps/frontend-admin/src/features/templates/useStudioPanelLayout.js` (new) | Observe workspace and derive bounded desktop split |
| `apps/frontend-admin/src/features/templates/components/StudioPanelResize.jsx` (new) | Pointer, keyboard and simple-button resizing |
| `apps/frontend-admin/src/features/templates/components/StudioPreviewFrame.jsx` (new) | Scale one mounted logical viewport to its available footprint |
| `apps/frontend-admin/src/features/users/AdminUsersFeature.jsx` | Semantic current-account badge |
| `apps/frontend-admin/src/pages/auth/LoginPage.jsx` | Readable footer role |
| `apps/frontend-admin/src/styles/index.css` | Semantic subtitle/badge/footer and dark warning pair |
| `apps/frontend-admin/src/styles/application-tokens.css` | Generated canonical token synchronization |
| `apps/frontend-user/src/features/guests/GuestWorkspace.css` | Themed readable note summary |
| `apps/frontend-user/src/shared/styles/semantic-tokens.css` | Three bounded semantic role additions |

| Test/tooling file | Purpose |
|---|---|
| `apps/frontend-user/src/shared/styles/semanticTokens.test.js` | Assert intended role contrast alongside existing sync check |
| `apps/frontend-user/tests/e2e/phase02-foundations.spec.js` (new) | Six defect regressions, width/breakpoint/landscape checks, normal-motion pointer/keyboard opening, EN/KM/dark and Khmer route checks |
| `apps/frontend-user/tests/e2e/batch12-core-hardening.spec.js` | Activate mobile preview/edit; explicitly reduce motion and use the fixture's actual invitation route |
| `apps/frontend-user/tests/e2e/batch12-route-content.spec.js` | Honor project viewport while retaining all 135 leaves |
| `apps/frontend-user/tests/e2e/support/batch12RouteContracts.js` | Correct visible creation link, active ticket/seating controls and localized expectations |
| `apps/frontend-user/playwright.phase02-foundations.config.js` (new) | Six browser profiles, deterministic motion, traces and source-built servers |
| `scripts/qa/serve-phase02.mjs` (new) | Isolated production builds/previews with matching loopback iframe origin; no `.env` writes |

Documentation changes are confined to this new `docs/phase02-foundations/` directory: this report, test-results ledger, updated backlog, evidence logs/JSON/search output and verification scripts. New builds, screenshots and failure traces are under `output/playwright/phase02-foundations/`. Existing audit evidence is untouched. No package manifests, lockfiles, backend or migrations changed.

## H–J. Risks, backlog and Phase 03 readiness

See the [updated backlog](backlog.md) for resolved IDs and explicit carry-forward work. Real-device keyboards, OS text scaling, screen readers, in-app browsers, actual deployment, disposable MySQL, provider payment/Telegram settlement and live owner/public integration remain unverified. Automated axe was scoped to the repaired issues and selected existing journeys; this is not a full WCAG certification. Existing admin unit stderr/network warnings and historical development advisory findings remain separate follow-up work.

The verified foundations are suitable for the separately authorized Phase 03 landing/navigation/auth work. That does **not** satisfy release gates V-001/V-002/V-003/REL-001. Phase 03 has not been started.

Rollback is a focused revert of the eleven listed application files (remove the four new editor primitives/styles and restore their prior composition), with corresponding test/tooling adjustments if abandoning this behavior. There is no data, database or API migration to reverse. No rollback command was executed.
