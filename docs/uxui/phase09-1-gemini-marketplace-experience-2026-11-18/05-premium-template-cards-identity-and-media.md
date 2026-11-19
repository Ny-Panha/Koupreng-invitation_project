# Chapter 05 — Premium Template Cards, Identity & Media

## 1. Card Architecture

- **Aspect Ratio:** 3:4.5 vertical invitation aspect ratio preventing unwanted cropping of Khmer wedding couple names.
- **Loading Strategy:** Priority eager loading on above-the-fold cards; lazy loading with `decoding="async"` on below-the-fold cards.
- **Error Fallback:** Styled icon placeholder with localized announcement if cover images fail to load.
- **No False Entitlements:** Visual badges reflect presentation status; client-side cards cannot authorize usage without server confirmation.
- **CTA Hierarchy:**
  - Primary CTA: "Use design" / "ប្រើគំរូនេះ" directs authenticated users to event creation or pre-checkout.
  - Secondary CTA: "Preview" / "មើលគំរូ" opens standalone demo preview.
