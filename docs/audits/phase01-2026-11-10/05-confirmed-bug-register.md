# Confirmed bug register

No P0 defect was confirmed. Priorities below reflect demonstrated impact, not assumed production exposure. Reproduce using the audit builds and `evidence/browser-audit.mjs` / `responsive-followup.mjs`; APIs are fictional and no production writes occur. Screenshots live at repository-root `output/playwright/phase01-audit-20261110/`.

## AU-001 — Admin Studio preview is clipped on mobile

- **Priority/severity:** P1, high. **Role:** administrator. **Routes:** `/templates/:templateId`, same shared layout on `/templates/new` in the admin app. **Device:** touch-capable desktop emulation, **390×844**. **Engines:** Chromium, Firefox, WebKit.
- **Reproduction:** install the `admin-template-edit` bounded route fixture; open admin `/templates/30`; try to inspect the invitation preview and switch editor sections. Compare the same page at 1440px. No save is needed.
- **Expected:** full-width usable editing or a clear Edit/Preview switch, with all controls reachable. **Actual:** aside x=0,width=320; preview x=320,width=360,right=680; frame right≈686. Root scrollWidth remains 390 because ancestors hide overflow. Most preview is clipped and the five-section row crowds text. Desktop has space for both panels.
- **Evidence:** `evidence/responsive-followup.json`; `followup-chromium-admin-template-edit-390.png`, equivalent Firefox/WebKit captures, and `probe-admin-template-edit-390.png`.
- **Source/root cause:** `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx:1547` fixed viewport/overflow; `:1674` horizontal workspace; `:1686` nonshrinking minimum 320px aside; `:4037` minimum 360px preview; `:4095` fixed device frame.
- **Proposed correction:** add a responsive single-panel editor/preview mode; keep full form state mounted or lifted; scale preview within available width; use dynamic viewport height and safe-area padding. Preserve desktop split and serialization.
- **Regression:** physical tap between panels, change a field then preview/back/save/reload; all five sections reachable at 320/360/390/430/600/768; desktop 1024/1280/1440; long Khmer labels, short height and keyboard; assert essential pane bounds/hit testing, not only document overflow.
- **Phase/effort/risk:** Phase 02; M (2–4 engineering days including tests), medium regression risk; depends on preserving preview messaging and form state. Full Studio redesign stays Phase 11.

## AU-002 — Mobile external preview link has no accessible name

- **Priority:** P1 accessibility barrier; administrator; admin `/templates/30`; 390×844; Chromium/Firefox/WebKit.
- **Reproduction:** open the fixture editor; inspect the toolbar's external-link icon with accessibility tools or keyboard navigation. **Expected:** announced purpose, for example “Open template preview in a new tab.” **Actual:** focusable link with no text accessible to a screen reader because its text span is `hidden md:inline`; SVG carries no name.
- **Evidence:** `browser-engines-results.json`, axe `link-name`, selector `a[target="_blank"]`; mobile Studio screenshots.
- **Source/root cause:** `AdminTemplateEditFeature.jsx:1650–1657`, responsive visual text is also the sole accessible label.
- **Fix:** persistent localized `aria-label`, decorative SVG, retained visible desktop label; do not infer success from a tooltip alone.
- **Regression:** accessible role/name at 320/390/768/1440 in EN/KM; keyboard activation opens only the configured preview origin. **Phase 02**, XS (<½ day), low risk, no backend dependency.

## AU-003 — Studio resize control is unavailable by keyboard

- **Priority:** P2; administrator using keyboard, including desktop; reproduced element at 390×844 in three engines; same source on desktop.
- **Reproduction:** Tab through Studio and attempt to adjust the panel divider. **Expected:** adjustable separator or equivalent buttons/preset. **Actual:** `DIV`, tabIndex -1, no role; only mouse down/move/up handlers. Source also shows no pointer/touch resize path.
- **Evidence:** `responsive-followup.json` divider metadata; `AdminTemplateEditFeature.jsx:914–950`, `:4005`.
- **Root cause/fix:** mouse-specific custom resizer. Add an accessible separator with bounded values/arrow keys and simple increase/decrease/reset controls; use pointer events where dragging remains. On phones use the AU-001 panel switch. Double-click reset alone does not expose arbitrary sizes without dragging.
- **Regression:** keyboard and tap alternatives, mouse drag, Escape/cancel, focus visibility, minimum widths; verify no resize gesture traps page scrolling. **Phase 02**, S (½–1 day), medium risk; shares AU-001 layout constraints.

## AU-004 — Guest note summaries fail text contrast

- **Priority:** P2; owner/staff reading guest details; user `/app/events/101/guests` and aliases; 390×844; confirmed across three engines.
- **Reproduction:** load guests fixture; locate each “Notes” summary. **Expected:** normal text contrast ≥4.5:1. **Actual:** axe reports **3.07:1**, `#b98b42` on `#ffffff` at 12px.
- **Evidence:** `browser-routes-results.json` / `browser-engines-results.json`, `color-contrast`; `probe-guests-390.png`.
- **Root cause/source:** `apps/frontend-user/src/features/guests/GuestWorkspace.css:136` hard-codes decorative gold instead of a readable semantic role.
- **Fix:** use an existing tested text/action role or darker token. Check light/dark surfaces rather than globally darkening invitation gold.
- **Regression:** realistic notes in EN/KM, closed/open details, light/dark, 320/390/1440; scoped axe and computed contrast. **Phase 02**, XS, low risk.

## AU-005 — Admin user subtitle/current-account badge fail contrast

- **Priority:** P2; administrator; admin `/users`; 390×844; Firefox and WebKit automated evidence.
- **Reproduction:** load current admin fixture; inspect subtitle and “You” badge. **Expected:** ≥4.5:1 for small text. **Actual:** subtitle **4.42:1** (`#62748e`/`#fbf6ee`); badge **2.96:1** (`#e17100`/`#fff5e6`). Badge is informational, not a financial verification indicator.
- **Evidence:** `browser-engines-results.json`, axe node `p` and `.ml-1\.5`.
- **Root cause/source:** `apps/frontend-admin/src/features/users/AdminUsersFeature.jsx:294` utility palette badge; subtitle/admin theme styles require inspection alongside the page header. Do not treat one global color substitution as universally valid.
- **Fix:** semantic muted/status text with verified surface contrast and existing dark variant.
- **Regression:** current/noncurrent account rows, table overflow, EN/KM, light/dark, mobile/desktop; no role/action changes. **Phase 02**, XS, low risk.

## AU-006 — Administrative login footer fails contrast

- **Priority:** P2; administrator before login; admin `/login`; 390×844; Firefox/WebKit.
- **Reproduction:** load admin login and inspect the small footer text. **Expected:** readable normal text. **Actual:** **3.87:1**, `#71717b` on `#121214`, 11px.
- **Evidence:** `browser-engines-results.json`, axe `color-contrast`, selector `.mt-8`.
- **Root cause/source:** `apps/frontend-admin/src/pages/auth/LoginPage.jsx:229`, `text-[11px] text-zinc-500` on a dark surface.
- **Fix/regression:** readable localized footer text token, check contrast and reflow at 320/390/1440; preserve auth API/guard behavior. **Phase 02 or 03**, XS, low risk.

## Test failures that are not confirmed product outages

**QA-001:** `tests/e2e/support/batch12RouteContracts.js:137` selects the first `/app/events/new` link, which is a hidden desktop navigation duplicate below its breakpoint. Its ticket/seating contracts at lines 142/150 also require inactive panels. Follow-up taps pass in three engines. Six Khmer raw failures expect English headings/buttons. Fix tests in Phase 02; keep original raw results for provenance.

**QA-002:** General config regression run: four failures, 48 passes. Two admin preview tests initially point frames at default `http://localhost:5173` while only 4173/4174 were served. Two public opening tests use stable-locator clicks on an intentionally floating button without requesting reduced motion. The trace explicitly repeats “element is not stable.” These are setup/automation failures until further reproduction proves a user failure. Retest results and normal-motion physical taps are recorded in the QA report. Do not weaken real pointer coverage by only bypassing animation with forced clicks.

**Not promoted to bugs:** HEIC rejection is an existing explicit format limitation; physical iOS autozoom/keyboard behavior is unverified; no concrete AI provider is present; public wishes return empty by policy; low-bandwidth LCP requires controlled profiling. Each remains in the backlog with the correct evidence status.
