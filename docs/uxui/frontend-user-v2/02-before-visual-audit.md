# 02 — BEFORE Visual Audit & Quantitative Baseline (`FUV2`)

**Capture Command:** `node scripts/qa/capture-fuv2-visuals.mjs --stage=before` (executed on `53896aa72a8eeee6570fb5c75e9b3b867ec27e11`, `2026-11-26T01:28:31Z`)  
**Evidence Location:** `docs/uxui/frontend-user-v2/evidence/before/*.png` and `docs/uxui/frontend-user-v2/evidence/before/metrics.json`

---

## 1. Key Findings Observed in BEFORE Renders & Metrics

1. **Sidebar Cascade Failure (`09` & `10-dashboard-scrolled-light-en-1440.png`):**
   - On `/app/events/42` at `1440x900`, `.event-workspace-sidebar` resolved to `position: static`, `top: auto` (`y=88` at scrollY=0).
   - After `window.scrollTo(0, 700)` (`10-dashboard-scrolled-light-en-1440.png`), `sidebarStyle.rect.top` collapsed to **`-612px`** — the sidebar navigation scrolled off the top edge of the viewport, leaving the upper navigation items inaccessible and leaving an unanchored stub card on the left.
   - `.event-navigation-body` resolved to `overflowY: visible` (`clientHeight === scrollHeight === 942px` on `12-dashboard-short-768x600.png`), overflowing past the `600px` viewport height instead of bounding to `dvh` with internal scroll.
2. **Dark Mode Leakage & WCAG AA Contrast Failures (`06`, `11`, `15`):**
   - `15-guests-dark-km-390.png` (8 failing axe nodes): Late-loaded `GuestWorkspace.css` overrode `.guest-workspace` CSS variables back to `#ffffff` and `#fbf6ee`, causing bright white status filter pills with faint gold text and `#fee2e2` pink `ErrorState.css` alert boxes on dark obsidian surfaces.
   - `06-templates-dark-km-390.png` (`axe=1`): Active pill `.tp-price-pill.is-active` inherited dark text (`#172019`) on dark sage `#3d5a4d` (`2.2:1` contrast).
   - `11-dashboard-dark-en-1440.png` (`axe=1`): Low-contrast muted metadata (`#7d8c78`, `#697963`) on dark cards, pale mint `#b7d2b8` primary button lacking distinction, and unframed bright-white placeholder card thumbnail.
3. **Hero Entrance Timing & Contrast (`01-home-light-en-1440.png`):**
   - Above-the-fold Hero `FadeContent` used `duration={0.6}` (600ms) and `.kp-mini-invitation` `kpPaperReveal` used `0.35s`, causing mid-fade blended colors (`~1.5:1`) at initial hydration check and `kp-demo-status` light badge contrast warnings (`3.1–3.7:1`).
4. **Public Password Gate Defect (`17-public-password-gate-km-390.png`):**
   - `.protected-gate-card` had no CSS rules defined anywhere (`InvitationPages.css`): no card box, no visible border/background on `<input>`, no password visibility toggle, and untranslated English error text (`"Invitation password required"`) inside a Khmer UI view.
5. **Mobile Heading & Card Placeholder Sizing (`07`, `13`):**
   - `07-events-light-en-1440.png`: Event card placeholder SVGs filled `aspect-ratio: 16/7` with `object-fit: cover`, zooming/cropping the central graphic.
   - `13-dashboard-mobile-km-390.png`: Dashboard page heading `ទិដ្ឋភាពទូទៅនៃកម្មវិធី` shifted rightward inside mobile layout.

---

## 2. Quantitative BEFORE Screenshot Manifest (All 17 Captures)

| Artifact File | Route | Viewport | Theme / Lang | Overflow | Sidebar Pos / Top | Axe Violations |
|---|---|---|---|---|---|---|
| `01-home-light-en-1440.png` | `/` | `1440x900` | light / `en` | `0px` | n/a | `1` rule (9 nodes) |
| `02-home-dark-km-390.png` | `/` | `390x844` | dark / `km` | `0px` | n/a | `0` |
| `03-login-light-en-1440.png` | `/login` | `1440x900` | light / `en` | `0px` | n/a | `0` |
| `04-login-dark-km-390.png` | `/login` | `390x844` | dark / `km` | `0px` | n/a | `0` |
| `05-templates-light-en-1440.png` | `/templates` | `1440x900` | light / `en` | `0px` | n/a | `0` |
| `06-templates-dark-km-390.png` | `/templates` | `390x844` | dark / `km` | `0px` | n/a | `1` (`is-active` pill) |
| `07-events-light-en-1440.png` | `/app/events` | `1440x900` | light / `en` | `0px` | n/a | `0` |
| `08-events-dark-km-320.png` | `/app/events` | `320x640` | dark / `km` | `0px` | n/a | `0` |
| `09-dashboard-top-light-en-1440.png` | `/app/events/42` | `1440x900` | light / `en` | `0px` | `static` / `88px` | `0` |
| `10-dashboard-scrolled-light-en-1440.png` | `/app/events/42` (scrollY=700) | `1440x900` | light / `en` | `0px` | `static` / **`-612px`** | `0` |
| `11-dashboard-dark-en-1440.png` | `/app/events/42` | `1440x900` | dark / `en` | `0px` | `static` / `88px` | `1` |
| `12-dashboard-short-768x600.png` | `/app/events/42` | `1024x600` | light / `en` | `0px` | `static` (`942px` overflow body) | `0` |
| `13-dashboard-mobile-km-390.png` | `/app/events/42` | `390x844` | light / `km` | `0px` | mobile bar | `0` |
| `14-guests-light-en-1440.png` | `/app/events/42/guests` | `1440x900` | light / `en` | `0px` | `static` / `88px` | `0` |
| `15-guests-dark-km-390.png` | `/app/events/42/guests` | `390x844` | dark / `km` | `0px` | mobile bar | `1` rule (8 nodes) |
| `16-studio-light-en-1440.png` | `/app/events/42/invitation` | `1440x900` | light / `en` | `0px` | Studio full width | `0` |
| `17-public-password-gate-km-390.png` | `/i/protected-sample` | `390x844` | light / `km` | `0px` | n/a | `0` (invisible `<input>`) |
