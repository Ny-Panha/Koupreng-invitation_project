# 15 — Themes, Typography, Responsive Layout, and Motion

**Phase:** `11.1`  
**Defect Resolved:** `D11.1-04` (Mobile Viewport Sticky Bottom Bar Obscuring Focused Input)  
**Styles:** [EventCreatePage.css](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/events/onboarding/EventCreatePage.css)

---

## 1. Responsive Viewport Adaptation

The wizard layout adapts across 4 distinct breakpoints:
1. **Desktop (> 1024px):** 2-column layout; left wizard form (60%), right live preview card (40%). Stepper displays full horizontal icons and labels.
2. **Tablet (768px – 1024px):** Stacked single column with compact sticky footer.
3. **Mobile (< 768px):** Stepper switches to horizontal scroll or numbered circles. Sticky bottom bar (`.event-mobile-bottom-bar`) docks primary action buttons.
4. **Short Landscape (Height < 500px):** Form paddings reduce to `8px`; sticky header height compressed to prevent viewport crowding.

---

## 2. Sticky Actions Bar Fix (D11.1-04)

On mobile viewports, the sticky action bar docked at the bottom of the screen (`position: sticky; bottom: 0; z-index: 40;`) caused inputs near the bottom of Step 1 to be covered when focused.

**The Fix:**
```css
.event-create {
  scroll-padding-top: 24px;
  scroll-padding-bottom: 100px;
}
```
Setting `scroll-padding-bottom: 100px` ensures the browser automatically scrolls the active input 100px above the bottom viewport edge, keeping it completely unobscured.

---

## 3. Motion & Reduced-Motion

All transitions utilize hardware-accelerated CSS transforms (`transform`, `opacity`). The entire stylesheet honors the user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  .event-create * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
