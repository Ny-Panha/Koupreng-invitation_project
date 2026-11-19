# 15 — Design Tokens & Theme Parity

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Semantic Tokens, Theme Parity, and Token Synchronization Verification  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Design Token Verification

Token integrity between `apps/frontend-user/` and `apps/frontend-admin/` is verified via:
```bash
node scripts/sync-design-tokens.cjs --check
```
**Result:** Clean exit code 0 (`2 application token exports verified in sync`).

---

## 2. Atelier Gold & Cream Palette Roles

All new styles in `EventsFeature.css` and `EventCalendar.css` reference semantic tokens:
- Primary Brand Gold: `var(--color-primary-600, #b45309)` and `var(--gold-accent, #d97706)`.
- Cream Canvas Background: `var(--bg-canvas, #faf9f6)` (light mode) / `var(--bg-canvas-dark, #0f172a)` (dark mode).
- Card Surface: `var(--bg-card, #ffffff)` with subtle border `var(--border-subtle, rgba(0, 0, 0, 0.08))`.
- Interactive Focus Ring: `var(--ring, #d97706)` with 2px offset.

---

## 3. Dark Mode Parity

All modified surfaces support dark mode seamlessly:
- Text colors adapt from dark slate (`#1e293b`) to crisp light cream (`#f8fafc`).
- Badge backgrounds use semi-transparent alphas (`rgba(..., 0.15)`) to preserve contrast against dark card containers.
- Calendar grid lines and muted dates adjust opacity to prevent eye fatigue.
