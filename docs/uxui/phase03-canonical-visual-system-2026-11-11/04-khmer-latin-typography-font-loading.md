# Khmer and Latin typography, font loading

The management body stack is `DM Sans`, `Kantumruy Pro`, system UI. Explicit roles also name Khmer body (`Kantumruy Pro`), Latin body (`DM Sans`) and display (`Moul`, then Khmer/system fallback). Public marketing keeps its existing Khmer-first family and editorial display stack. Invitation themes retain their own font families and preload decisions.

| Asset | Source in repository | Right/use decision |
|---|---|---|
| DM Sans Latin WOFF2 (36,932 bytes) | `apps/frontend-user/public/fonts/marketing/` with `DMSans-OFL.txt` | Copied into admin `public/fonts/management/` with the matching OFL; consistent management Latin UI and no CSS-level Google import |
| Kantumruy Pro WOFF2 and Moul WOFF2 | Existing admin `public/fonts/reports/` with OFL files | Reused in admin `@font-face`; no new archive or license assumption |
| Existing user Khmer/marketing and template fonts | User `public/fonts/` and `src/shared/fonts/core-fonts.css` | Existing local declarations preserved |
| Broad admin Google font catalog | Admin `index.html` | Remains for Studio font selection; requests can fail offline. Route-scoped loading is a Phase 25 performance decision |

Admin CSS no longer imports the extra Google stylesheet for Inter/Kantumruy/Moul. Local font faces use `font-display: swap`; browser fixture screenshots await `document.fonts.ready`. The capture records actual CSS `font-family`, `FontFace.status` and requested URLs. At 390px, Home, auth, owner, admin dashboard and Studio reported local `DM Sans` and `Kantumruy Pro` as **loaded**; marketing also reported `Koupreng Editorial` loaded. The marketing Khmer heading computed `Kantumruy Pro` at 31.2px/54.6px line height; owner shell 16px/28.8px; admin shell 16px/26.4px. The auth heading used 21.45px/38.61px. CSS family names and FontFace status do not alone prove glyph selection for every character; native Khmer review remains necessary.

Khmer UI should normally allow about 1.65–1.9 line height and natural wrapping, especially names and venues. `--ui-leading-khmer: 1.8` is available and the dark auth divider now uses it at 12px. `--ui-leading-latin: 1.5` supports Latin copy. Avoid global letter spacing on Khmer and use `lang` already provided by the app; do not rewrite DOM language attributes. Money columns should use `font-variant-numeric: tabular-nums` in their owning component phase, without altering calculations or currency truth.

The 320–1920px fixture matrix found no document overflow, but a native Khmer speaker must review diacritics, long labels and mixed-script samples on Android/iOS and at physical text scaling. This is **REVIEW REQUIRED**, not linguistic certification. Phase 04 should add reusable long-label/field samples and ensure error copy is never clipped.
