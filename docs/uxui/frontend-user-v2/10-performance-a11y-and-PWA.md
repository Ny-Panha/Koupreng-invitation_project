# 10 — Performance, Accessibility (`WCAG 2.2 AA`), and PWA Evaluation (`FUV2`)

---

## 1. Accessibility Audit Summary (`axe-core` + Manual Keyboard Checks)

### Before vs. After `axe-core` Results (`capture-fuv2-visuals.mjs`, tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`)

| Capture | Before Axe Violations | After Axe Violations | Key Remediation Applied |
|---|---|---|---|
| `01-home-light-en-1440.png` | **1** (9 failing contrast nodes) | **0** | Hero `<FadeContent duration={0.12}>`, accelerated `kpPaperReveal` (`0.16s`), strengthened `.kp-mini-kicker` & `.kp-demo-status` ratios |
| `02-home-dark-km-390.png` | `0` (after short dark toggle check: `.kp-mini-kicker`) | **0** | Added `:root[data-color-mode="dark"] .kp-mini-kicker` gold contrast token |
| `06-templates-dark-km-390.png` | **1** (`.is-active` pill 2.2:1) | **0** | Fixed `:root[data-color-mode="dark"] .tp-price-pill.is-active` action contrast (`>= 9.6:1`) |
| `11-dashboard-dark-en-1440.png` | **1** (`li > p` / `.overview-activity p`) | **0** | Mapped `.overview-metric-sub`, `.overview-activity p`, `.overview-countdown-pill` to semantic dark tokens |
| `15-guests-dark-km-390.png` | **1** (8 failing nodes) | **0** | Removed hardcoded white/cream overrides in lazy `GuestWorkspace.css` and pink `#fee2e2` in `ErrorState.css` |
| All other `03..05`, `07..10`, `12..14`, `16..22` captures | `0` | **0** | Verified `0` violations across **all 20 non-iframe axe captures** (`08` Events toggle, `19` Settings, `20` Seating, `21` Calendar, `22` Budget dark modes included) |

### Keyboard Navigation, Focus Appearance & Motion Safety
- `scroll-padding-top: calc(var(--host-nav-offset, 84px) + 16px)` ensures keyboard Tab/focus-into-view never hides controls behind fixed/sticky top bars.
- Mobile module drawer (`EventNavigation` modal dialog) closes on `Escape` and cleanly returns keyboard focus onto `"Toggle modules menu"` trigger (`frontend-user-v2.spec.js` verified).
- `<MotionConfig reducedMotion="user">` wraps the entire React tree (`ThemeProvider.jsx`), paired with `@media (prefers-reduced-motion: reduce)` CSS overrides (`0ms`).

---

## 2. Web Performance & Build Metrics (Vite Production Bundle)

Measured cleanly via `npm --prefix apps/frontend-user run build` (`vite v8.3.5`):
- **Total transform:** 3,103 modules -> built cleanly (`dist/index.html` `8.13 kB` / gzip `2.39 kB`, `index.css` `262.43 kB` / gzip `47.97 kB`, `index.js` `478.46 kB` / gzip `142.44 kB`, route-split lazy chunks intact).
- **LCP Hero Protection:** Retained preload hints for `/fonts/marketing/DMSans-Latin.woff2`, `/fonts/silk-heritage/KantumruyPro.woff2`, and `/templates/khmer-floral-gold/phone-preview-440.webp` (`fetchpriority="high"`) while eliminating `600ms` Hero fade delay so primary typography paints immediately.
- **No Heavy Runtime Libraries Added:** Reused installed `framer-motion@14`, `lucide-react`, and `react-qr-code`. Did **not** import GSAP, Spline, or heavy dashboard WebGL (`FUV2-G25`).
- **Limitation Honesty:** No fabricated Lighthouse scores or synthetic "60fps" telemetry claims are made where Lighthouse CLI wasn't separately executed.

---

## 3. PWA Readiness & Safety Boundary (`FUV2-13` / `FUV2-G41`)

- **Web App Manifest Implemented & Verified:**
  - Added `apps/frontend-user/public/manifest.webmanifest` (`name: "Koupreng · គូព្រេង"`, `short_name: "Koupreng"`, `display: "standalone"`, `theme_color: "#172b25"`, `background_color: "#f7f5f0"`, `start_url: "/"`) linking existing verified icons `/branding/icons/icon-192.png` (`29,544` bytes) and `/branding/icons/icon-512.png` (`133,381` bytes).
  - Wired `<link rel="manifest" href="/manifest.webmanifest" />` and `<meta name="theme-color">` (light & dark variants) into `apps/frontend-user/index.html`.
  - Preserved `public/branding/manifest.json` cleanly as the branding-asset inventory manifest.
- **Service Worker & Offline Caching Intentionally Deferred (Safety Guard):**
  - No runtime Service Worker was registered (`navigator.serviceWorker.getRegistrations()` confirmed `0` in Playwright).
  - Rationale: Caching HTML/fetch responses carries elevated risk of retaining authenticated dashboard shells, private `/api/` responses, guest PII, or short-lived access tokens across user sign-out (`FUV2-N29`, `FUV2-N47`). Offline mutation writes fail loudly through the existing `apiClient`/`useStudioPersistence` retry flow (`FUV2-N46`). Full offline static asset caching remains explicitly scoped as an optional future enhancement with strict static-only precache allowlist + logout cache purge.
