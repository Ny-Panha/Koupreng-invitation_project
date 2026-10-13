# Koupreng Design Tokens Reference

## Overview

All visual tokens in Koupreng are anchored in CSS custom properties declared in `apps/frontend-user/src/styles/index.css` and consumed via Tailwind CSS v4.

---

## 1. Palette Tokens

### Wedding Invitation Surfaces & Tones (`--wed-*`)
```css
/* Canvas & Surfaces */
--wed-cream: #f6efe4;
--wed-paper: #fffaf1;
--wed-bg: #fbf5ec;
--wed-bg-tint: #f0e6d4;
--wed-overlay: rgba(33, 24, 15, 0.55);

/* Gold Ramp */
--wed-gold-50: #fbf3e1;
--wed-gold-100: #f0e1bf;
--wed-gold-200: #e1c890;
--wed-gold-300: #d2af67;
--wed-gold-400: #c8a35f;  /* signature warm gold */
--wed-gold-500: #b0926a;  /* classic gold */
--wed-gold-600: #8e7245;
--wed-gold-700: #7d6443;  /* primary CTA */
--wed-gold-800: #6f4d24;  /* primary hover */
--wed-gold-900: #4a3414;

/* Text & Contrast */
--wed-ink: #21180f;         /* headlines, 14:1 contrast on paper */
--wed-text: #2c1f12;        /* body copy, 10:1 contrast */
--wed-text-muted: #816b50;  /* secondary metadata, 4.8:1 contrast */
--wed-text-subtle: #b6a48a; /* decorative elements */

/* Hairline Borders */
--wed-border: rgba(111, 77, 36, 0.18);
--wed-border-subtle: rgba(111, 77, 36, 0.10);
--wed-border-strong: rgba(111, 77, 36, 0.34);
```

### Dashboard & Host Surfaces (`--brand-*`)
```css
/* Surfaces */
--brand-bg: #f7f5fb;
--brand-surface: #ffffff;
--brand-surface-2: #f8f8fd;
--brand-surface-3: #eae9f8;
--brand-overlay: rgba(15, 23, 42, 0.45);

/* Purple Action Ramp */
--brand-50: #f3f1fc;
--brand-100: #e9e6f9;
--brand-200: #d3ccf2;
--brand-300: #b3a8e8;
--brand-400: #8e80da;
--brand-500: #6b6bc4;  /* primary interactive */
--brand-600: #5a55b3;  /* hover */
--brand-700: #4b479a;  /* active */

/* Text & Contrast */
--brand-text: #1e293b;
--brand-text-muted: #7a8799;
--brand-border: #e7e7ee;
```

---

## 2. Spacing & Elevation Scale

- **Base Unit:** 4px
- `--space-1` = 4px, `--space-2` = 8px, `--space-3` = 12px, `--space-4` = 16px, `--space-6` = 24px, `--space-8` = 32px, `--space-12` = 48px
- **Border Radii:**
  - `radius-sm`: 6px (tags, badges)
  - `radius-md`: 10px (inputs, dropdowns)
  - `radius-lg`: 14px (cards, modal containers)
  - `radius-xl`: 20px (feature cards, invitation envelopes)
  - `radius-pill`: 999px (action pills, audio controller)
- **Shadows:**
  - Soft, multi-layered ambient shadows: `0 4px 12px rgba(15, 23, 42, 0.08)` for cards; `0 12px 32px rgba(15, 23, 42, 0.10)` for elevated modals.

