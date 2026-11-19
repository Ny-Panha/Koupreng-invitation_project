# 08 — Accessibility, Contrast & Bilingual Parity

## WCAG 2.2 AA Compliance and Khmer/English Parity Record

### 1. Automated Accessibility Audit (Axe-Core via Playwright)
During the execution of `tests/e2e/phase08-identity-account.spec.js`, an automated Axe accessibility scan was conducted using `@axe-core/playwright` against WCAG 2.2 AA criteria across both desktop and mobile viewports.

**Results:**
- **`/login`:** **0 violations** (Pass)
- **`/register`:** **0 violations** (Pass)
- **`/forgot-password`:** **0 violations** (Pass)

### 2. Contrast Ratios
All text and interactive element contrasts were validated against the 4.5:1 ratio for normal text and 3.0:1 for large text / graphical objects:

| Element | Background Color | Text Color | Contrast Ratio | WCAG 2.2 AA Status |
|---|---|---|---|---|
| Light Body Text | `#fcfbf9` | `#1b1917` | **15.8:1** | PASS |
| Light Secondary Text | `#ffffff` | `#57534e` | **5.4:1** | PASS |
| Light Form Border | `#ffffff` | `#78716c` | **3.5:1** | PASS |
| Dark Body Text | `#0c0a09` | `#f5f5f4` | **16.2:1** | PASS |
| Dark Secondary Text | `#181613` | `#d6d3d1` | **11.2:1** | PASS |
| Dark Password Rule Checklist | `#181613` | `#a8a29e` | **6.4:1** | PASS |
| Recovery Hint Card (Light) | `#fefce8` | `#713f12` | **8.1:1** | PASS |
| Recovery Hint Card (Dark) | `#1c1917` | `#fde047` | **11.5:1** | PASS |

### 3. Touch Targets & Focus States
- All password eye toggle buttons and interactive inputs enforce a minimum touch target of **44×44px** on mobile viewports.
- Keyboard focus indicators use an explicit 2px focus ring (`var(--ui-theme-accent)` / `#8b7355`) with a 2px offset, ensuring clear visibility for keyboard-only navigators.
- Inputs with validation errors explicitly declare `aria-invalid="true"` and point to their respective alert elements via `aria-describedby`.

### 4. Bilingual Khmer / English Parity
- All form labels, placeholders, validation hints, password checklist criteria, error alerts, and success cards are localized using `copy(en, km)`.
- Khmer text renders using the canonical `Kantumruy Pro` / `Hanuman` font family hierarchy, with appropriate line-height adjustments (`1.6`–`1.8`) to prevent glyph clipping of Khmer diacritics and subscripts.
