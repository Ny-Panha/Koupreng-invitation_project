# Marketing V6 implementation — 2026-10-15

## Outcome

Local V6 reduces eager shared JavaScript and unnecessary management CSS, uses
responsive derivatives for two known static gallery sources and adds folio
Escape/focus return. It retains the approved V5 visual composition, native Khmer
wording, full fonts, portrait/preload, early featured designs, source identifiers,
pricing/access distinction and Contact API behaviors.

Desktop Khmer LCP is 2.436s (fresh baseline 2.552s; historical V5 2.632s).
Mobile Khmer is 2.556s, so the all-four ≤2.5s goal **remains unmet**. English
mobile/desktop medians are 2.136s / 2.204s. These are local lab results only.
See [performance](marketing-v6-performance.md),
[audit](marketing-v6-audit.md) and [UX/privacy review](marketing-v6-ux-review.md).

## Implementation decisions

- `HostShell` and `InvitationScopedRedirect` are React.lazy boundaries inside
  existing routes/RequireAuth. Home remains eager; guards and server auth rules
  are unchanged. A direct ToastContainer import avoids the shared UI barrel's
  eager component/CSS side effects.
- TemplateGrid reads the existing language store directly. It previously used
  only `lang` from useBackendMessages, despite owning its copy inline. Removing
  that unused request/effect makes the management dictionaries lazy with their
  routes. No approved string was edited.
- PublicTemplateCard receives compact/full geometry and an exact-URL image
  presentation helper. It maps only two existing static paths; all uploaded,
  remote, query-bearing or unrecognized sources retain their exact URL. It never
  matches artwork by server numeric ID or invents image transformations.
- The thumbnail generator uses existing Playwright Chromium canvas, WebP quality
  0.88, unchanged aspect ratio, no crop/upscale, and SHA-256 provenance. CSS
  framing and original full assets remain. No package dependency was added.
- Folio records the initiating control and returns focus on Escape or close.
  Closed contents remain inert/aria-hidden. Existing motion and copy remain.
- Tracking is a documented proposal only. No runtime analytics, vendor request,
  identifier, consent bypass or no-op abstraction was added.

## Verification actually executed

Logs are under `output/playwright/marketing-v6/`.

| Command / check | Actual outcome |
| --- | --- |
| `npm --prefix apps/frontend-user run lint` | PASS, exit 0 (`lint.log`). |
| `npm --prefix apps/frontend-user test` | Initial FAIL: 8 timeout failures, 458 passed / 466, 84 passed / 88 files, 82.12s. Excess concurrent workers/test jobs; retained `unit.log`. |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | PASS: **466 tests / 88 files**, 64.05s, exit 0 (`unit-bounded.log`). No timeout limit/test logic was weakened. Existing fixture/happy-dom stderr remains in log. |
| `npm --prefix apps/frontend-user run build` | PASS before, after and final; final 1.53s, exit 0. Entry 423.38KB / 123.52KB build gzip. Existing missing SVG warning remains. |
| `$env:MARKETING_EVIDENCE_DIR='../../output/playwright/marketing-v6/regression'; npm --prefix apps/frontend-user run test:e2e -- marketing-landing.spec.js marketing-pages.spec.js --workers=2` | PASS: **72 tests**, desktop Chromium + Pixel 7 Chromium, 2.6m, exit 0. Evidence directory override preserves historical captures. |
| V6 before/after `--performance` | 12 comparable cold contexts per phase; all run values/waterfalls retained. Desktop km and both en medians meet 2.5s; mobile km FAIL at 2.556s. CLS within goal. |
| V6 before/after default capture + `--states` | 64 normal geometry cases per phase, four authenticated pricing cases and 32 mocked states; no page errors, overflow or clipped text at normal sizing. |
| Axe, both phases | **52 audits each, 0 violations**. Eight Home/guest-filter contrast checks remain incomplete; no WCAG certification claimed. |
| V6 `after --comfort` | Eight mobile computed-text doubling cases report no overflow/clipping; language switching/reload passed on every route. Eight CSS-zoom cases report no document overflow, but visual inspection found the English desktop CTA clipped: **FAIL for that synthetic header-fit case**. |
| V6 `after --zoom-reflow` | PASS: eight route/language cases at 720×450 CSS pixels, DPR2, modeling a 1440×900 window at 200% zoom. Mobile navigation visible; no horizontal overflow/out-of-bounds checked controls. Native browser zoom is still NOT TESTED. |
| V6 `after --dpr` | Four isolated DPR2 initial views: mobile 768w / desktop 960w portrait, one hero image request each, Khmer/English. |
| `git diff --check` | PASS, no whitespace errors. |
| Firefox / WebKit | NOT TESTED: executable files absent; recorded launch checks. No browser downloads/installations performed. |
| Physical devices, native zoom/text, screen readers, webviews, real services | NOT TESTED; matrix in UX report. |
| Production headers/CDN, field p75 CWV / INP | BLOCKED / unmeasured; no authorized staging/production host or field dataset was available. |

The two new browser scenarios cover opener-specific focus restoration, exclusion
of eager host chunks on public navigation, responsive local image loading,
unknown server URL/query preservation, image fallback and retained use routing.
Existing scenarios cover public preview, code→server ID preservation through
login/refresh/back, premium/missing price, catalog retry/empty, package flags and
currency separation, form validation/double-submit/429/retry/unacknowledged
delivery, keyboard menu/FAQ and reduced motion. All API calls use fixtures.

The initial comfort harness reset its seeded language on every refresh, causing
an assertion failure. Fixed the fixture to seed only absent preferences and
reran successfully; no app language bug was inferred. A separate evidence
polish corrected full-page state framing so sticky chrome appears at the top.
Baseline state views were regenerated from the archived pre-V6 build on 4186;
median measurements were not repeated or altered. Early logs are retained.
The enlarged-layout review also exposed why document overflow alone cannot pass
CSS-zoom accessibility: the desktop English CTA was clipped. A separate effective
viewport check passed responsive reflow without changing production CSS. Both
the failed proxy and its limitations are documented in the UX report.

## Asset provenance and release limitations

The derivatives reuse `/facebook/all/06-card/cover-card.jpg` and
`/templates/canva-luxury/emerald-luxury.jpg`. `catalog/provenance.json` records
source hashes, output hashes, dimensions/bytes, algorithm and Chromium version.
Six outputs total **968,242B** on disk; visitors select responsive candidates,
not all six. Original files and template renderers are unchanged.

These source artworks were already in V5's public catalog. Their original
ownership/redistribution proof remains unresolved in
[template asset licenses](template-asset-licenses.md) and
`docs/qa/asset-reference-report.md`. Conversion to WebP does not establish rights.
Release remains blocked on owner rights review for those older assets. No new
creative artwork, photo, font, stock download or image-generation service was
introduced. Existing Silk/DM Sans font/photo license notes remain applicable.

The pre-existing `/templates/cover-khmer-golden-wedding/cover-bg.svg` build warning
is outside the marketing path and was left intact. Manual devices/AT/webviews,
authorized staging headers, real service verification, asset rights and owner
release approval remain separate release gates. No payment, SMTP acceptance,
conversion improvement, field INP or production readiness is asserted.

## File-level inventory

All paths below are repository-relative. No admin/reports/budget/backend file
was edited. This inventory records the pre-commit verification snapshot, when
the Git index was unchanged and new files were untracked for review.

| Existing file | Change |
| --- | --- |
| `apps/frontend-user/src/app/App.jsx` | Direct ToastContainer import. |
| `apps/frontend-user/src/app/routes/hostRoutes.jsx` | Lazy host shell and invitation redirect; guards retained. |
| `apps/frontend-user/src/features/marketing/components/LandingHero.jsx` | Escape dismissal and actual-opener focus return. |
| `apps/frontend-user/src/features/templates/components/PublicTemplateCard.jsx` | Responsive exact-source image presentation. |
| `apps/frontend-user/src/features/templates/components/TemplateGrid.jsx` | Direct language subscription and compact image geometry. |
| `apps/frontend-user/tests/e2e/marketing-landing.spec.js` | Two regressions and configurable capture destination. |

Final tracked `git diff --stat`:

```text
 apps/frontend-user/src/app/App.jsx                 |  2 +-
 apps/frontend-user/src/app/routes/hostRoutes.jsx    |  5 ++-
 .../features/marketing/components/LandingHero.jsx   | 17 +++++++--
 .../templates/components/PublicTemplateCard.jsx     |  5 ++-
 .../features/templates/components/TemplateGrid.jsx  |  6 +--
 .../tests/e2e/marketing-landing.spec.js              | 43 +++++++++++++++++++++-
 6 files changed, 66 insertions(+), 12 deletions(-)
```

Git diff excludes untracked files. The following 14 additions bring the full
review inventory to **20 files**, without staging them:

| New file | Purpose / bytes where binary |
| --- | --- |
| `apps/frontend-user/src/features/templates/model/publicTemplateImage.js` | Exact-source responsive mapping. |
| `apps/frontend-user/scripts/capture-marketing-v6.mjs` | Fixtures, visuals, axe, waterfalls, startup traces and comfort checks. |
| `apps/frontend-user/scripts/generate-marketing-thumbnails.mjs` | Reproducible local derivatives, no added dependency. |
| `apps/frontend-user/public/images/marketing/catalog/khmer-celestial-320.webp` | 27,670B compact cover. |
| `apps/frontend-user/public/images/marketing/catalog/khmer-celestial-640.webp` | 100,188B cover. |
| `apps/frontend-user/public/images/marketing/catalog/khmer-celestial-1280.webp` | 350,998B larger/DPR cover. |
| `apps/frontend-user/public/images/marketing/catalog/emerald-luxe-240.webp` | 37,286B compact portrait. |
| `apps/frontend-user/public/images/marketing/catalog/emerald-luxe-480.webp` | 133,146B sharper portrait. |
| `apps/frontend-user/public/images/marketing/catalog/emerald-luxe-768.webp` | 318,954B maximum source-width portrait. |
| `apps/frontend-user/public/images/marketing/catalog/provenance.json` | Source/output SHA-256 and generation metadata. |
| `docs/frontend/user/marketing-v6-audit.md` | Repository, component map and diagnosis. |
| `docs/frontend/user/marketing-v6-performance.md` | Run distributions, attribution and limits. |
| `docs/frontend/user/marketing-v6-ux-review.md` | Visual review, privacy event proposal and manual matrix. |
| `docs/frontend/user/marketing-v6-implementation.md` | Changes, checks, risks and this inventory. |

Ignored screenshots, profiling builds, traces, JSON and logs live only in the
V6 output directory. Existing ignore rules, package manifests/locks, historical
V5 evidence and source scripts were not changed. At completion of local
verification, HEAD was `96682171` on `main`; no commit, push, PR or deployment
had been performed. The user subsequently authorized committing and pushing
this V6 work to `main`. Publication is recorded in Git history; deployment
remains outside this task.
