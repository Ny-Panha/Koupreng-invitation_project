# 08 — Editing Inspector Forms, Validations, and Content

## 1. Inspector Form Ergonomics
- Grouped panels with semantic legends and clear hierarchical labels.
- Bilingual labels and helper text in English and Khmer.
- Inline validation errors near the offending control (`StudioFieldError`).
- Validation summary alert at the top of the form with direct jump buttons.

## 2. Diacritic & Typography Safety
- Form fields provide line-height 1.8+ to prevent clipping Khmer subscripts and upper vowels.
- Unicode normalization (NFC) applied to prevent character corruption during IME composition.

See [Axe and Contrast Results](evidence/axe-contrast-and-zoom-results.json).
