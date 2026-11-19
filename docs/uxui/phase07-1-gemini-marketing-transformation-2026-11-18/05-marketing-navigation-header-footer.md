# 05 — Marketing Navigation, Header & Footer Architecture

## 1. Marketing Chrome (`Header.jsx`, `Footer.jsx`, `MarketingChrome.css`)

The shared marketing chrome wraps all public marketing routes under `MarketingShell.jsx`.

### Structure:
```html
<div className="kp-marketing-shell" lang={lang}>
  <a className="host-skip-link" href="#marketing-content">Skip to main content</a>
  <Header />
  <main id="marketing-content" tabIndex={-1}>
    <Outlet />
  </main>
  <Footer />
</div>
```

---

## 2. Header & Desktop Navigation

- **Brand Logo:** Links to `/` with localized label (`Koupreng · Home` / `គូព្រេង · ទំព័រដើម`) and SVG vector mark (`BrandLogo`).
- **Desktop Items:**
  1. `/` — Home
  2. `/templates` — Templates
  3. `/pricing` — Packages & access
  4. `/contact` — Contact
- **Current Route Indicator:** Identified using `[aria-current="page"]` with an emerald pill background and subtle gold accent.
- **Actions Bar:**
  - Language switcher (`.kp-language`) with `aria-pressed` indicators for `km` and `en`.
  - Display preferences component (`DisplayPreferences`) for dark/light mode toggle.
  - Contextual authentication CTAs:
    - Signed out: "Log in" link (`/login`) + "Create invitation" primary CTA (`/app/events/new`).
    - Signed in: "Log out" button + "Dashboard" primary CTA (`/dashboard`).

---

## 3. Mobile Navigation Drawer (`<dialog>`)

Phase 06 established a strict native dialog modal contract. Phase 07.1 preserved this behavior completely while elevating its visual presentation:

1. **Native Dialog Element:** Uses `<dialog ref={dialog} id="public-mobile-navigation" className="kp-mobile-dialog">`.
2. **Trigger:** Hamburger button with `aria-controls="public-mobile-navigation"`, `aria-expanded={menuOpen}`, and accessible label.
3. **Focus Containment:** `containMenuFocus` intercepts Tab and Shift+Tab, wrapping focus exclusively within the open dialog.
4. **Scroll Lock:** Locks `document.body.style.overflow = "hidden"` while menu is open.
5. **Dismissal Pathways:**
   - Close button (`.kp-menu-close`) with autofocus.
   - Native `Escape` key press.
   - Backdrop click outside the dialog surface.
   - Route change via React Router `useLocation` listener.
   - Screen resize to desktop (`min-width: 1101px`).
6. **Focus Restoration:** On dismissal, focus returns automatically to the originating trigger button.

---

## 4. Footer System

The footer (`Footer.jsx`) presents a structured 3-column layout:
- **Column 1 (Brand):** Koupreng logo mark and bilingual elevator description.
- **Column 2 (Explore):** Links to `/templates`, `/pricing`, `/venues`.
- **Column 3 (Support):** Links to `/contact` (Contact us), `/contact` (Help with your invitation), and `/login`.
- **Bottom Bar:**
  - Dynamic copyright notice: `© {currentYear} Koupreng. All rights reserved.`
  - Cultural attribution: `Made with care for Cambodian celebrations` / `រចនាជាមួយក្តីស្រលាញ់ សម្រាប់គូស្វាមីភរិយាខ្មែរ`.

---

## 5. Bidirectional Dark Mode

Dark mode is activated via `:root[data-color-mode="dark"]`:
- **Header:** Translucent dark obsidian glass (`rgba(23, 32, 25, 0.88)`), dark border (`--ui-theme-border`), and gold accent borders.
- **Mobile Drawer:** Surface `#202A24`, high-contrast white text, and gold active indicators.
- **Footer:** Deep canvas background with clear borders and muted champagne links.
