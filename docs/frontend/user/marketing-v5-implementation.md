# Marketing V5 implementation and verification

15 October 2026. Incremental work on V4 HEAD `3393cddd`, left local and
uncommitted. No push, PR, deployment, real contact submission or payment.
Native Khmer wording approval was supplied by the user during this review.

## Result and visual evidence

Selected direction: **folio + designs**, retaining Silk & Ink Editorial.
See [the baseline audit](marketing-v5-audit.md) for screen-by-screen qualitative
scores, the actual journey and the three composition studies.

The hero names the product, has one primary exploration action and a secondary
manual preview. Feature chips and the redundant scroll link are removed. The
opened folio connects its working demo to an identity-preserving use action.
On mobile the smaller closed folio leaves both faces readable; the opened paper
has more space, with its close button beside it and the use link below it.

Home now follows hero → three curated designs → guest-detail illustration →
guest-management demonstration → creation steps → package/access explanation
→ FAQ/help → final action. The later illustration defaults to details, avoiding
another closed Silk cover before the visitor interacts with it.

Home's three mobile designs use compact image/text compositions; the full catalog
retains larger previews. Solid preview bars replace the translucent overlays.
Known designs have specific visual descriptions, while server descriptions,
prices, IDs, categories, retries, offline disclosures and access checks remain
authoritative. A successful empty catalog has its own message and never becomes
an offline demo collection.

Packages and individual premium designs are explained separately. Public
navigation says “Packages & access”; no fabricated public price grid is implied.
The authenticated table has keyboard focus, bounded scrolling and sticky column
headings/row labels. Mobile comparison remains native disclosures. Contact has
shorter bilingual guidance and a better-fitting desktop title; its API and form
state machine are unchanged.

Useful before/after pairs, all under `output/playwright/marketing-v5/`:

| Screen | Baseline | V5 | Observed change |
| --- | --- | --- | --- |
| Home km mobile | `before/home-km-390-hero.png` | `after/home-km-390-hero.png` | Primary action ends at 379px; opening control ends at 756px, within 844px |
| Home en mobile | `before/home-en-390-hero.png` | `after/home-en-390-hero.png` | Primary action ends at 363px; opening control ends at 792px |
| Home desktop | `before/home-en-1440-full.png` | `after/home-en-1440-full.png` | Curated choices precede product demo; distinct detail illustration |
| Catalog | `before/templates-km-390-full.png` | `after/templates-km-390-full.png` | Less cover height, visible preview bars, specific descriptions |
| Public packages | `before/pricing-en-390-full.png` | `after/pricing-en-390-full.png` | Design/package distinction and concrete account review steps |
| Account packages | `before/pricing-auth-km-1440-full.png` | `after/pricing-auth-km-1440-full.png` | Real feature flags/currencies retained; comparison stays usable |
| Contact | `before/contact-en-1440-hero.png` | `after/contact-en-1440-hero.png` | Two-line title; clearer lead and intact form hierarchy |

Baseline has 56 source PNGs. V5 has 56 matching page captures plus eight opened
folio/detail-state PNGs. All are represented in opened inspection sheets under
each phase's `inspection-sheets/`; larger individual hero, catalog and state
images were inspected as well. Home covers 320, 390, 768, 1024, 1440 and 1920 in
both languages. Other routes cover 390 and 1440. Final mobile page captures are
390×844; desktop is 1440×900. The inherited baseline authenticated mobile pricing
capture used 390×900, so compare its content rather than its exact fold position.

Two visual refinements followed the first implementation: reduce the closed
mobile folio and enlarge its opened reading surface; restore a purposeful crop
for the landscape thumbnail instead of leaving excessive blank image space.
The final opened-paper measurements show no internal content overflow.

## Focused file inventory

Paths below are relative to `apps/frontend-user/`.

| Files | Purpose |
| --- | --- |
| `src/features/marketing/HomeFeature.jsx` | Design-first section sequence |
| `src/features/marketing/components/LandingHero.jsx` | Clearer bilingual hero, manual preview focus, selected-design handoff |
| `src/features/marketing/components/InvitationShowcase.jsx` | Details-first sample, quieter stage controls |
| `src/features/marketing/components/LandingProduct.jsx` | Immediate, short filter response animation |
| `src/features/marketing/components/{LandingConversion,PricingFactors}.jsx` | Honest design/package explanations and connected actions |
| `src/features/marketing/{PricingFeature,ContactFeature}.jsx` | Copy clarity and accessible comparison container |
| `src/features/marketing/{MarketingFeature,MarketingPages}.css` | Responsive composition, reading space, restrained feedback |
| `src/features/templates/components/{TemplateGrid.jsx,templates.css}` | Empty state, image framing, compact home gallery, visible actions |
| `src/features/templates/model/templatePresentation.js` | Identity-matched visual description fallback |
| `src/layouts/components/{Header,Footer}.jsx` | Honest package navigation labels |
| `src/layouts/components/MarketingChrome.css` | Pressed feedback |
| `src/pages/marketing/TemplatesPage.jsx` | Direct catalog import avoids renderer CSS/font side effects |
| `src/features/marketing/{HomeFeature,PricingFeature}.test.jsx` | Update assertions for intentional copy/empty-state changes |
| `tests/e2e/{marketing-landing,marketing-pages}.spec.js` | Fold, handoff, empty/invalid-price states and public catalog checks |
| `scripts/{capture-marketing-v5,compare-marketing-v5}.mjs` | Fixture-only visual, composition and lab evidence |

`MarketingShell.jsx` keeps its single header/footer and language handling.
No backend, payment entitlement, editor, guest renderer or database change.
No new runtime dependency or animation engine. Dashboard StyleSeed rules remain
untouched. Separate concurrent changes in `src/features/reports/` belong to other
work and were preserved, including its CSS, tests and `scripts/diagnose-reports.mjs`.

## Verification

| Command | Actual outcome |
| --- | --- |
| `npm --prefix apps/frontend-user test -- src/features/templates/model/templatePresentation.test.js src/shared/i18n/marketingFallback.test.jsx` | 2 files, 22 tests passed |
| `npm --prefix apps/frontend-user test -- src/features/marketing/HomeFeature.test.jsx src/features/marketing/PricingFeature.test.jsx` | 2 files, 20 tests passed after copy assertions were updated |
| `npm --prefix apps/frontend-user run lint` | Exit 0 |
| `npm --prefix apps/frontend-user test` | 88 files, 466 tests passed, 23.63s |
| `npm --prefix apps/frontend-user run build` | Exit 0, final build 895ms |
| `npm --prefix apps/frontend-user run test:e2e -- marketing-landing.spec.js marketing-pages.spec.js --workers=2` | 68 passed, 1.4m; desktop Chromium and Pixel 7 Chromium |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | 10/10 pinned and 6/6 custom skills; zero missing files/checksum errors |
| `python scripts/validate-agent-routing.py` | 58 skills, zero errors; existing duplicate React-skill-name notice |

Logs: `output/playwright/marketing-v5/{lint-final,vitest-final,build-final,e2e-final}.log`.
Visual/lab commands run from `apps/frontend-user/`:
`node scripts/capture-marketing-v5.mjs before`,
`node scripts/capture-marketing-v5.mjs after`, and each phase with `--performance`.
The catalog was recaptured with `after --route=/templates`; authenticated pricing
with `after --route=/pricing-auth` and, for the isolated V4 preview,
`before --route=/pricing-auth` with `MARKETING_PREVIEW_ORIGIN=http://127.0.0.1:4175`.
`node scripts/compare-marketing-v5.mjs` produced the V4 composition studies.
Both capture scripts pass `node --check`; `git diff --check` reports no whitespace errors.
After the full run, the preview test was strengthened to switch through arrival,
story and details explicitly. `npm --prefix apps/frontend-user run test:e2e -- marketing-landing.spec.js --grep 'preview stages, envelope' --workers=2`
passed both projects (2 passed, 5.3s); see `stage-check.log`.
The initial full unit run had two old-copy assertions (462 passed, two failed);
these were updated and the full suite rerun. Adding `/templates` to font checks
exposed two Google Fonts requests via the template barrel. Replacing that page's
barrel import with a direct page import fixed the four browser failures; the
final complete browser run passed. These were diagnosed failures, not waived checks.

The full unit suite emits happy-dom external stylesheet/Google Maps iframe load
warnings from existing invitation tests; it exits 0. Production build retains
the existing unresolved `cover-khmer-golden-wedding/cover-bg.svg` warning, outside
the marketing routes. These are not browser console errors observed on V5 pages.

Fresh axe WCAG 2 A/AA, 2.1 AA and 2.2 AA audits: zero violations across the 20
route/language/viewport states (including authenticated fixture pricing); final
catalog import was re-audited separately. No horizontal overflow or clipped
tested text in the page matrix. This is automated evidence, not full WCAG certification.
Keyboard tests cover menu containment/Escape, FAQ, preview focus, login handoff,
comparison disclosures, invalid-field focus and acknowledged-success focus.
200% CSS zoom, broken images, loading/error/retry, empty catalog, invalid premium
amount/currency, missing price, paid access, checkout and Back/reload are covered.

Computed sRGB contrast (`contrast.json`): ink/ivory 13.95:1, muted/ivory 5.88:1,
gold text/ivory 6.06:1, ivory/evergreen 9.74:1, muted/white 6.40:1. Decorative
gold is reserved for decoration. Reduced motion disables transitions/animations;
initial content remains visible. No physical low-end Android or assistive
screen-reader session was available; Chromium emulation is not a substitute.

## Performance and remaining work

Comparable baseline/final lab results are in `before/performance.json` and
`after/performance.json`. The final run is performed after other browser/test
jobs finish, with three cold Chromium contexts per language/width, 4× CPU,
200,000 bytes/s download (1.6 Mbps), 150ms latency and fixture APIs. Lab viewports
are 390×900 and 1440×900 in both phases. LCP/CLS are recorded before interaction;
no field INP claim is made. Preview transfer sizes reflect its HTTP compression.

| Language / viewport | V4 median LCP | V5 median LCP | V5 range | V5 maximum CLS |
| --- | --- | --- | --- | --- |
| km / 390 | 2.556s | 2.480s | 2.456-2.592s | 0.000000 |
| km / 1440 | 2.824s | 2.632s | 2.624-2.724s | 0.000113 |
| en / 390 | 2.288s | 2.316s | 2.312-2.472s | 0.000000 |
| en / 1440 | 2.344s | 2.384s | 2.348-2.432s | 0.000132 |

The 2.5s median LCP target is met for English and mobile Khmer; **desktop Khmer
remains above target at 2.632s** (baseline 2.824s). The small English increases
(28ms mobile, 40ms desktop) are within the observed run spread; do not claim a
universal speedup. All measured CLS values are comfortably below 0.1. No field
INP, conversion uplift or live-user Core Web Vitals claim is made.

The LCP element in every final sample is the hero portrait. Both tested widths
select the existing 480px WebP (39,796 bytes at DPR 1). Only the hero and the
first above-fold public catalog candidate request high image priority; Home's
featured cards stay lazy. Existing eager entry loading, responsive image
preload and local font preload remain intact. The largest transfers started before LCP are the shared JS entry (~133KB compressed), Khmer UI font (76,848 bytes),
portrait and shared CSS. Final entry is 464.46KB / 133.95KB gzip versus baseline
465.40KB / 134.37KB gzip. No heavier renderer, chat bundle, decorative raster
background or legacy animation engine is requested on initial Home.

The direct public catalog import removes the two renderer Google Fonts CSS
requests demonstrated by the added browser checks. The renderer's own fonts and
behavior are unchanged. Next performance priority is profiling the shared entry
and Khmer first render against a production-like host; the remaining 132ms
desktop Khmer gap was not hidden through a different benchmark or font change.
The fixture catalog's two large JPEGs still transfer about 1.73MB after LCP as
they approach the browser's lazy-loading distance. Responsive server-provided
catalog thumbnails are another performance priority; the numeric LCP results
do not imply the whole page is lightweight on a slow connection.


All existing local photos, SVGs, WebPs and fonts are reused. No external asset,
stock subscription or generated artwork was introduced. Existing provenance and
older catalog rights-review limitations remain in
[template-asset-licenses.md](template-asset-licenses.md).

Native Khmer wording is approved. Before any later release, verify on a physical
lower-end Android phone and with assistive technology, and review existing asset
rights. Public numeric package discovery still requires a separately approved
sanitized API/product contract; no private package endpoint was opened here.
