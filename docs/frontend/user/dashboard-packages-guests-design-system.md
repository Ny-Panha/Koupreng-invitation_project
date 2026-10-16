# Koupreng Atelier — Premium Host Workspace Design System

## 1. Design Philosophy & Aesthetic Foundation

The **Koupreng Atelier** design system bridges Cambodian cultural warmth with high-performance SaaS productivity. An operational workspace must not be treated as a decorative marketing brochure, nor should it feel like an unstyled administrative utility. It balances clarity, information density, and refined craftsmanship:

- **Canvas & Surfaces:** Warm ivory base canvas (`#FBF6EE`) with crisp white card surfaces (`#FFFFFF`), avoiding harsh dark-mode contrasts or washed-out grays.
- **Accents:** Traditional Cambodian antique gold (`#B98B42` / `#D4AF37`) for premium highlights and deep ceremonial evergreen (`#0F766E` / `#0D5F58`) for trusted primary interactions.
- **Typography:** Deep ink text (`#1F2421`) for headings and body, ensuring effortless readability for Khmer script diacritics and bilingual labels.
- **Geometry:** Ergonomic rounded pill buttons (`rounded-full` / `border-radius: 9999px`), smooth card corners (`rounded-2xl` / 18–24px), and spacious touch targets (minimum 44px).

---

## 2. Design Tokens & Visual Hierarchy

### 2.1 Palette Tokens

```css
:root {
  /* Canvas & Surfaces */
  --host-canvas: #fbf6ee;
  --host-surface: #ffffff;
  --host-surface-elevated: #ffffff;
  --host-surface-subtle: #f7f3eb;

  /* Brand Accents */
  --host-gold: #b98b42;
  --host-gold-hover: #9c7332;
  --host-gold-subtle: rgba(185, 139, 66, 0.12);
  --host-gold-border: rgba(185, 139, 66, 0.28);

  --host-evergreen: #0f766e;
  --host-evergreen-hover: #0d5f58;
  --host-evergreen-subtle: rgba(15, 118, 110, 0.1);
  --host-evergreen-border: rgba(15, 118, 110, 0.24);

  /* Typography & Ink */
  --host-ink: #1f2421;
  --host-ink-secondary: #4b5563;
  --host-ink-muted: #6f766f;
  --host-ink-disabled: #9ca3af;

  /* Borders & Dividers */
  --host-border: #eadfce;
  --host-border-light: #f1ebd8;
  --host-border-subtle: rgba(42, 31, 16, 0.08);

  /* Semantic Feedback */
  --host-success: #059669;
  --host-success-subtle: #ecfdf5;
  --host-warning: #d97706;
  --host-warning-subtle: #fffbeb;
  --host-danger: #dc2626;
  --host-danger-subtle: #fef2f2;
  --host-info: #0284c7;
  --host-info-subtle: #f0f9ff;
}
```

### 2.2 Elevation & Shadows

- **Card Elevation:** `box-shadow: 0 4px 20px -2px rgba(42, 31, 16, 0.06), 0 2px 6px -1px rgba(42, 31, 16, 0.03);`
- **Elevated Hover Lift:** `box-shadow: 0 12px 32px -4px rgba(42, 31, 16, 0.1), 0 4px 12px -2px rgba(42, 31, 16, 0.05); transform: translateY(-2px);`
- **Modal / Floating Drawer:** `box-shadow: 0 24px 48px -12px rgba(42, 31, 16, 0.18);`

---

## 3. Component Design Specifications

### 3.1 Buttons & Interactive Controls
- **Primary Pill Action (`.host-btn-primary`):**
  - Fully rounded pill (`border-radius: 9999px`).
  - Height: 44px–48px.
  - Background: Deep evergreen (`#0F766E`) or Antique Gold (`#B98B42`).
  - Typography: 14px–15px font-weight 700 with generous Khmer line spacing.
  - Focus Ring: `outline: 2px solid var(--host-evergreen); outline-offset: 2px;`
- **Secondary Pill Action (`.host-btn-secondary`):**
  - Background: Crisp white (`#FFFFFF`) with border `1px solid var(--host-border)`.
  - Color: `#1F2421`.
  - Hover: Subtle gold tint (`#FBF6EE`) with border `var(--host-gold-border)`.
- **Icon Actions (`.host-icon-btn`):**
  - 36px × 36px circular target (`rounded-full`), padded for effortless touch interaction on mobile.

### 3.2 Form Inputs & Selection
- **Field Height:** 44px–48px.
- **Border Radius:** 12px–14px (`rounded-xl`).
- **Border:** `1px solid #D5D9D1`.
- **Focus State:** `border-color: #0F766E; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);`
- **Labels:** Always visible high-contrast labels (`#1F2421`, font-semibold, 13px) with explicit `*` required indicators.

### 3.3 Metric Summary Cards
- **Structure:** 4-card horizontal grid on desktop, 2-column on tablet, and stacked on mobile.
- **Content:** Icon badge (gold/evergreen), clear descriptive Khmer label, large tabular bold numeral (`font-variant-numeric: tabular-nums`).

### 3.4 Responsive Layout Strategy
- **Desktop (≥ 1024px):** Full multi-column data table with spacious rows, clear status badges, and inline actions.
- **Tablet (768px – 1023px):** Compact table columns, secondary metadata deferred to drawer/dialog.
- **Mobile (< 768px):** Automatic switch to structured **Guest Cards** featuring prominent guest name, group tag, seat allocation pill, RSVP badge, and accessible action toolbar. No horizontal scrolling or cramped column squeezing.

---

## 4. Khmer Typography & Accessibility Invariants

1. **Khmer Line-Height Multiplier:** Khmer scripts feature upper and lower vowel/consonant subscripts (`ជើង`, `ស្រៈ`). Line-height must never drop below 1.55 on headings or 1.6 on body copy to eliminate text clipping.
2. **WCAG 2.2 AA Contrast:** All body text maintains at least 4.5:1 contrast against `#FFFFFF` or `#FBF6EE`. Large headings (≥ 24px) maintain at least 3:1.
3. **Reduced Motion:** Interactive transitions respect `@media (prefers-reduced-motion: reduce)`, disabling transform animations while maintaining instant opacity changes.
4. **Keyboard Accessibility:** All interactive elements (`<button>`, `<input>`, `<select>`, `<dialog>`) provide distinct `:focus-visible` styles with keyboard tab navigation and Escape dismissal.

