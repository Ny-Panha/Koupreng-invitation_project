# Khmer Typography & Text Shaping Reference

## 1. Font Assets & Font Declarations

All fonts are loaded locally from `apps/frontend-user/src/assets/fonts/fonts.css`.

- **Moul:** Traditional ceremonial Khmer display typeface used for couple names, traditional auspicious titles (សិរីសួស្តី អាពាហ៍ពិពាហ៍), and cover headings.
- **Noto Serif Khmer:** Elegant serif font for formal ceremony schedules, Buddhist stanzas, and parent blessings.
- **Noto Sans Khmer:** High-legibility sans-serif for UI labels, form fields, RSVP selectors, and guest lists.
- **Kantumruy Pro:** Contemporary geometric Khmer sans-serif, excellent for modern digital layouts and mobile screens.

## 2. Text Shaping Invariants

1. **Subscript Consonants (ជើងអក្សរ):**
   Khmer characters have deep subscripts. In CSS:
   - Always ensure `line-height >= 1.5` (preferably `leading-relaxed` or `1.65`).
   - Never apply `overflow-hidden` tightly around single-line Khmer text, as subscripts will get clipped.
   - Use sufficient vertical padding on input fields (`py-2.5` or `py-3` instead of `py-1`).

2. **Word Breaking:**
   Khmer script does not use spaces between words; spaces represent sentence boundaries or clause breaks.
   - Use `break-words` and `hyphens-none`.
   - Never force hard character wrapping (`break-all`) through Khmer words.

3. **Font Sizing in Bilingual Components:**
   Because Khmer glyphs are visually more complex than Latin glyphs:
   - At the same nominal font size (e.g. 16px), Khmer glyphs may look slightly larger or visually denser.
   - Balance English and Khmer side-by-side using optical sizing: `text-sm` for English subtitles under `text-base` Khmer headings.

