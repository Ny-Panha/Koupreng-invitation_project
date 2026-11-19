# Phase 07.1 — Animation, Motion Design, and Selective Depth

## 1. Motion Philosophy: Luxury Editorial Calm

In luxury digital design, motion is an instrument of prestige and clarity, not entertainment or distraction. KoupReng enforces strict motion governance defined in Phase 05:
1. **Immediate Operational Accessibility:** Never block the user with full-page loading curtains, forced intro animations, or navigation delays.
2. **Organic Physics:** All transitions employ cubic bezier curves modeled on physical momentum (`cubic-bezier(0.16, 1, 0.3, 1)` for entrances; `cubic-bezier(0.4, 0, 0.2, 1)` for UI feedback).
3. **Strict Isolation:** Marketing animations reside entirely within marketing styles (`MarketingFeature.css`, `MarketingChrome.css`, `VenuesFeature.css`) and never leak into the 10 isolated wedding invitation renderers.

---

## 2. Motion Tier Hierarchy

### Tier A: Immediate Interactive Feedback (150ms – 250ms)
- **Buttons & CTAs:** Subtle transform scale (`scale(0.98)`) and gold border brightening on `:hover` and `:active`.
- **Navigation Drawer:** Native `<dialog>` backdrop fade and drawer slide-in using hardware-accelerated transforms (`transform: translateX(...)`).
- **Focus Rings:** Instant champagne-gold focus outline (`2px solid var(--ui-theme-primary)`) with a 2px offset.

### Tier B: Contextual Disclosure & Elevation (300ms – 400ms)
- **FAQ Accordions:** Native `<details>` smooth expansion using CSS grid template rows transition (`grid-template-rows: 0fr` to `1fr`).
- **Venue Cards:** Elevation lift (`translateY(-4px)`) with subtle shadow bloom (`0 12px 30px rgba(0,0,0,0.08)`) on hover.
- **Form Error States:** Gentle 300ms slide-and-fade entrance for validation error feedback.

### Tier C: Hero 2.5D Atelier Depth & Metallic Gleam (500ms – 700ms)
- **Interactive Phone Mockup:** The hero invitation showcase features a 2.5D perspective enclosure (`perspective: 1200px`) that responds subtly to cursor hover, rendering realistic depth for the digital envelope and seal.
- **Metallic Specular Gleam:** A gentle 6-second ambient linear gradient sheen passes across the gold card border, evocative of stamped gold foil on luxury cardstock.

---

## 3. Accessibility & `prefers-reduced-motion`

KoupReng strictly honors user operating system preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .hero-mockup-wrapper,
  .gold-shimmer,
  .floating-badge {
    transform: none !important;
    animation: none !important;
  }
}
```

When reduced motion is enabled:
- All transform movements and ambient floating animations are disabled.
- Interactive states (hover, focus, dialog transitions) switch to instant opacity swaps.
- Layout remains visually rich, stable, and completely accessible.
