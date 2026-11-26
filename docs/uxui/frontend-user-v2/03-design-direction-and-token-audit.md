# 03 — Design Direction, Official Logo Palette Derivation, and Token Audit (`FUV2-01`)

**Theme Name:** *Koupreng / The Digital Ceremony Atelier*  
**Routing Selection (`.agents/ROUTER.md`):** Primary `koupreng-premium-ux`; Supporting `ui-ux-pro-max`, `frontend-design`.

---

## 1. Official Brand Asset & Pixel Palette Audit (`public/branding/`)

RGB sampling performed directly on the official PNG assets (`apps/frontend-user/public/branding/koupreng-mark.png`, `icon-192.png`, `koupreng-logo-1024w-transparent.png`):
- **Dominant Gold & Warm Champagne Clusters:** `#f0a000`, `#f0c030`, `#c09050`, `#a07030`, `#703000`
- **Highlight Cream Clusters:** `#f0d0a0`, `#f0e0b0`
- **Artwork Rule Preserved:** No blanket recolor of logos or invitation template artwork; derived management palette complements the warm burnished gold emblem and red-heart lotus detail cleanly across light & dark surfaces.

---

## 2. Three Distinct Surface Systems

1. **System A — Enterprise Owner Workspace (`HostShell`, `EventWorkspace`, `Guests`, `Dashboard`):**
   - Deep Botanical Atelier Executive Rail (`--ui-rail-bg: #172b25`, `--ui-rail-surface: #1f3730`, `--ui-rail-active-bg: #2e5045`, `--ui-rail-gold: #d8b875`, `--ui-rail-ink: #f6f4ee`, `--ui-rail-muted: #c2cfc9`).
   - Luminous Ivory & Warm Paper Worksurfaces (`--ui-theme-canvas: #f7f5f0`, `--ui-theme-surface: #fffefb`, `--ui-theme-subtle: #efebe2`).
   - Obsidian Dark Workspace (`--ui-theme-canvas: #111a17`, `--ui-theme-surface: #182520`, `--ui-theme-subtle: #20312b`, `--ui-theme-action: #d8b875`, `--ui-theme-on-action: #14221d`).
2. **System B — Public Marketing, Auth, Discovery & Commerce:**
   - Editorial serif/Khmer headings, restrained parchment cards, verified contrast pills (`.tp-price-pill.is-active` dark mode fixed from `2.2:1` failure -> `>= 9.6:1`), dark-mode commerce overrides in `PaymentPages.css`, crisp password gate card in `InvitationPages.css`.
3. **System C — Guest Invitation Renderers:**
   - **Strictly isolated:** `royal-garden-cinematic`, `khmer-floral-gold`, `khmer-celestial`, `silk-heritage`, `emerald-canva-luxe-wedding`, `digital-yes`, `with-joy-portal`, `bliss-editorial` keep their individual template art, typography, and ceremony color systems untouched by management dark/light toggles (`FUV2-N08`, `FUV2-N09`).

---

## 3. Canonical Token Inventory (`apps/frontend-user/src/shared/styles/semantic-tokens.css`)

Synchronized deterministically to `apps/frontend-admin/src/styles/application-tokens.css` via `node scripts/sync-design-tokens.cjs`.

| Token Role | Light Mode | Dark Mode | Measured Contrast Guarantee |
|---|---|---|---|
| `--ui-theme-canvas` | `#f7f5f0` | `#111a17` | Base background |
| `--ui-theme-surface` | `#fffefb` | `#182520` | Card/panel paper |
| `--ui-theme-ink` | `#1e2824` | `#f4f3ee` | `> 13:1` body text (`semanticTokens.test.js` verified) |
| `--ui-theme-muted` | `#525f58` | `#b8c6be` | `>= 5.7:1` light / `>= 7.8:1` dark |
| `--ui-theme-action` / `on-action` | `#1c3a32` / `#ffffff` | `#d8b875` / `#14221d` | `12.6:1` light / `9.6:1` dark |
| `--ui-theme-gold` | `#8c6628` | `#d8b875` | `>= 4.8:1` on paper / `> 7.5:1` dark |
| `--ui-theme-focus` | `#176f67` | `#f0cf8b` | `>= 3.0:1` WCAG 2.2 Focus Appearance (`semanticTokens.test.js`) |
| `--ui-rail-bg` / `--ui-rail-ink` | `#172b25` / `#f6f4ee` | `#0f1815` / `#f4f3ee` | `> 13:1` rail labels / `> 8.6:1` muted |
| Fluid Scales | `clamp(1.375rem, 1.15rem + 1.1vw, 2rem)` page title | Same responsive clamp | Smooth 320px–2560px scaling without manual patches |

---

## 4. Light / Dark System Integrity

- **Zero FOWT:** `public/color-mode.js` synchronously applies `dataset.colorMode`, `.dark` class, and `style.colorScheme` in `<head>` prior to React mount.
- **Cross-tab Sync & Form Preservation:** `ThemeProvider.jsx` syncs via `useLayoutEffect` and `storage` listener + `<MotionConfig reducedMotion="user">`. Form state stays intact (`DisplayPreferences.test.jsx` verified).
- **Root Cascade Cleanups:** Fixed `GuestWorkspace.css` late chunk override (which previously rewrote `--guest-paper: #ffffff` onto dark-mode views), `ErrorState.css` light-pink override (`#fee2e2`), and `ConfirmDialog.css` white card override (`#ffffff`).
