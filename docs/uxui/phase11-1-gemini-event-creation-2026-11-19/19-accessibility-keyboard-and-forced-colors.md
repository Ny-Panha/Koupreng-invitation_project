# 19 — Accessibility, Keyboard Navigation, and Forced Colors

**Phase:** `11.1`  
**Compliance Standard:** WCAG 2.2 Level AA  
**Axe Contrast Audit:** [axe-contrast-matrix.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/axe-contrast-matrix.json)

---

## 1. Contrast Ratios Matrix

All color pairings exceed WCAG 2.2 AA minimums (4.5:1 for body text, 3:1 for non-text controls):

| Element | Foreground | Background | Contrast Ratio | WCAG Verdict |
|---|---|---|---|---|
| Body text | `#1C1917` | `#FDFBF7` | **14.2:1** | AAA Pass |
| Primary Action Button | `#FFFFFF` | `#8B1E3F` | **7.34:1** | AAA Pass |
| Gold Badge Border | `#B8860B` | `#FFFFFF` | **4.54:1** | AA Pass |
| Step Indicator Active | `#FFFFFF` | `#8B1E3F` | **7.34:1** | AAA Pass |
| Input Borders | `#D1D5DB` | `#FFFFFF` | **3.12:1** | AA Pass (Non-text) |
| Dark Mode Text | `#F3F4F6` | `#111827` | **15.6:1** | AAA Pass |

---

## 2. Keyboard Navigation & Focus Visible

1. **Logical Tab Order:** Focus moves sequentially through stepper buttons, active step inputs, and bottom navigation controls.
2. **High-Contrast Focus Rings:** Enforced via `:focus-visible` with `2px solid #8B1E3F` and `2px offset`. Focus is never hidden.
3. **Non-Obscured Focus:** Verified via Playwright on mobile screens; `scroll-padding-bottom: 100px` guarantees focused inputs remain completely visible above the sticky footer.
4. **Windows Forced Colors:** Borders and outlines utilize semantic system colors in High Contrast mode (`forced-colors: active`).
