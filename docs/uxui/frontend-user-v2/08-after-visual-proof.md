# 08 — AFTER Visual Proof & Controlled Before/After Comparison (`FUV2`)

**Capture Command:** `node scripts/qa/capture-fuv2-visuals.mjs --stage=after` (`2026-11-26`, fresh Vite build `dist/` from `apps/frontend-user`; exact ISO `capturedAt` recorded in `docs/uxui/frontend-user-v2/evidence/after/metrics.json`)  
**Evidence Location:** `docs/uxui/frontend-user-v2/evidence/after/*.png` and `docs/uxui/frontend-user-v2/evidence/after/metrics.json`

---

## 1. Controlled Before vs. After Proof Table (Identical Route, Fixture, Viewport, Theme, Locale)

| Capture File | Route / Scenario | BEFORE (`53896aa7`) | AFTER (Frontend User 2.0) | Verified Visual & DOM Difference |
|---|---|---|---|---|
| `01-home-light-en-1440.png` | `/` (`1440x900`, light, `en`) | `axe=1` (**9 nodes** contrast fail during 600ms fade), duplicate category caption, `overflow=0px` | **`axe=0`**, `overflow=0px` | Single crisp pill eyebrow, framed architectural showcase card, immediate LCP typography (`duration={0.12}`) |
| `02-home-dark-km-390.png` | `/` (`390x844`, dark, `km`) | `axe=0`, duplicate Khmer category under badge, bright blue `#4285F4` FAB overlap | **`axe=0`**, `overflow=0px` | Duplicate `.kp-hero-category` removed; compact emerald-gold support launcher |
| `03` / `04-login-dark-km-390.png` | `/login` (`1440x900` light / `390x844` dark `km`) | Floating blue ChatBot overlapped mobile dark login links | **`axe=0`**, `overflow=0px` | Dedicated auth routes omit floating support FAB cleanly; balanced card breathing room |
| `05` / `06-templates-dark-km-390.png` | `/templates` (`1440x900` light / `390x844` dark `km`) | `06`: **`axe=1`** (`.is-active` pill `2.2:1`); fixture `/khmer-celestial/cover.svg` missing | **`axe=0`**, `overflow=0px` | Active price/category pill champagne gold CTA (`>= 9.6:1`); real `khmer-floral-gold` cover artwork loads |
| `07-events-light-en-1440.png` | `/app/events` (`1440x900`, light, `en`) | Cropped calendar placeholder SVG (`object-fit: cover` zoom), flat shadowless cards | Clean `object-fit: contain` card banner, subtle depth shadows, `overflow=0px`, **`axe=0`** | Cards elevate cleanly on hover while keeping 3-col hierarchy |
| `08-events-dark-km-320.png` | `/app/events` (`320x640`, dark, `km`) | `overflow=0px`, `axe=0`, white `.events-view-toggle` pill leak on dark canvas | `overflow=0px`, **`axe=0`**, dark `.events-view-toggle` & `.events-period-tab` | Ultra-compact `320px` dark Khmer layout fits without horizontal clip or white pill bleed |
| `09-dashboard-top-light-en-1440.png` | `/app/events/42` (`1440x900`, light, `en`, `scrollY=0`) | `sidebarPos=static`, `sidebarTop=88`, blended light card | **`sidebarPos=sticky`**, **`sidebarTop=96`**, deep forest Atelier rail (`256px`), **`axe=0`** | Clear executive separation between navigation rail and ivory content |
| `10-dashboard-scrolled-light-en-1440.png` | `/app/events/42` (`1440x900`, light, `en`, `scrollY=700`) | `sidebarPos=static`, **`sidebarTop=-612`** (navigation scrolled off screen) | **`sidebarPos=sticky`**, **`sidebarTop=96`** (`scrollY=700`, `0px` drift!), **`axe=0`** | Sidebar stays pinned cleanly; `.host-header-wrapper` gradient backdrop seals top `8px` scroll edge |
| `11-dashboard-dark-en-1440.png` | `/app/events/42` (`1440x900`, dark, `en`) | `sidebarPos=static`, **`axe=1`**, washed mint CTA, white card sticker | **`sidebarPos=sticky`**, **`axe=0`**, champagne-gold primary CTA (`9.6:1`), `[src$="event-essential.svg"]` dark filter | Complete dark atelier hierarchy across rail, metrics, hero & activity |
| `12-dashboard-short-768x600.png` | `/app/events/42` (`1024x600`, collapsed `72px`) | `sidebarPos=static`, `height=1121px`, `overflowY=visible` (overflowed 600px viewport) | **`sidebarPos=sticky`**, `height=492px` (`bottom=588 <= 600`), `overflowY=auto`, **`axe=0`** | Independent internal sidebar scroll keeps footer buttons reachable cleanly |
| `13-dashboard-mobile-km-390.png` | `/app/events/42` (`390x844`, light, `km`) | Mobile `.dash-page-header` centered `<h1>` in column flex | Start-aligned Khmer heading `ទិដ្ឋភាពទូទៅនៃកម្មវិធី` (`h1Box.x < 60px`), `overflow=0px`, **`axe=0`** | Verified true left/start alignment on mobile (`align-items: flex-start`) |
| `14` / `15-guests-dark-km-390.png` | `/app/events/42/guests` (`1440x900` light `en` fullPage / `390x844` dark `km` fullPage) | `15`: **`axe=1` (8 nodes)** — stark `#ffffff` filter pills & `#fee2e2` pink error box (`53896aa7` mock only covered `/guests`) | **`axe=0`**, `overflow=0px`, real `/guests/page` & `/guests/overview` contracts, `3` guests / `5` seats stats, full desktop table rows (`Chanthy & Sophea`, `Visal Dara`, `Dara & Pisey`) & dark Khmer mobile guest cards (`ខាងកូនក្រមុំ`/`ខាងកូនកំលោះ`) | Complete dark-mode token fidelity across stats, filter pills, inline quick-add, and mobile cards with zero error states |
| `16-studio-light-en-1440.png` | `/app/events/42/invitation` (`1440x900`) | Clean Studio shell without Publish access/share UI | Phase 15 visibility/password controls + Share Atelier + rendered `khmer-floral-gold` live preview | Preserved split studio workspace & authentic template frame |
| `17-public-password-gate-km-390.png` | `/i/protected-sample` (`390x844`, `km`) | Invisible borderless `<input>`, English error on Khmer page, no reveal toggle | Structured Atelier gate card, visible bordered `<input>`, Eye/EyeOff toggle, Khmer alert, **`axe=0`** | Immediately usable mobile password verification UX |
| `18`..`22` (`after`-only dark matrix) | Studio, Settings, Seating, Calendar, Budget (`1440x900`, dark, `en`) | Unstyled light hexes on calendar heading/toggle, settings `[role="status"]:empty`, seating cards, budget | **`axe=0`**, **`overflow=0px`** across all 5 dark secondary views; `20-seating-dark-en-1440.png` renders `Tables 2`, `Capacity 20`, `Assigned seats 4`, `Unassigned guests 1`, `VIP Table 1` (`8 available`, `2 / 10 seats`, `Chanthy & Sophea`) & `Table 2` (`Dara & Pisey`) cleanly | Verified calendar (`November 2026`, `Month \| Agenda`), settings, seating (real `tableName`/`remainingSeats`/`assignments` contracts), Studio & budget dark parity |

---

## 2. Score Improvement Summary

- **Axe WCAG 2.2 AA Failures:** Dropped from **4 failing captures (19 failing nodes)** BEFORE -> **`0` failing captures (`0` failing nodes across all 20 non-iframe axe runs; `16`/`18` Studio runAxe skipped for third-party preview iframe)** AFTER.
- **Horizontal Overflow (`scrollWidth - innerWidth`):** `0px` across all **22 / 22** AFTER renders (including `320x640`, `390x844`, `1024x600`, and `1440x900`).
- **Desktop Sidebar Pinning Drift (`scrollY=0` vs `scrollY=700`):** Fixed from **`700px` drift (`top=88` -> `-612px`)** to **`0px` drift (`top=96` -> `96px`)**.
