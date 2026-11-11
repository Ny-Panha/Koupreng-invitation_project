# Before/after evidence index

**Environment:** Windows, Chromium 156.0.8078.4, CSS viewport 390×844 or 1440×900, device scale 1, Khmer locale, reduced motion, localhost Vite previews on 4173/4174. Fixtures are `batch12RouteContracts` fictional read-only DTOs; missing local shared template rows use explicit fictional GET mocks. External network requests were aborted. The manifest's SHA is the **starting** `c4af9e8`; the after stage is the modified working tree built before commit, not that unmodified SHA.

Tracked metadata: [`before-manifest.json`](evidence/before-manifest.json), [`after-manifest.json`](evidence/after-manifest.json), [`capture-diff.json`](evidence/capture-diff.json), [`responsive-a11y-results.json`](evidence/responsive-a11y-results.json), [`lab-results.json`](evidence/lab-results.json), [`lab-summary.json`](evidence/lab-summary.json). The first two contain 52 records each with URL, viewport, appearance, font requests, computed samples, browser and capture time; the diff links every matching image pair.

| Screenshot group | Before and after variants |
|---|---|
| Home, catalog, auth/login, create event, owner dashboard, guests, RSVP | 390/1440 light; Home/auth/dashboard also 390 dark |
| Admin login, dashboard, users, Template Studio | 390/1440 light; dashboard/users/Studio also 390 dark |
| Ten dedicated renderer keys, two shared IDs | 390/1440 light per key |

Full PNGs and clean build outputs are **local ignored files**, not included in GitHub: `output/playwright/uxui-phase03-2026-11-11/{before,after}/`. Example pairs: `before/auth-login-390-dark.png` ↔ `after/auth-login-390-dark.png`, `before/admin-template-edit-390-light.png` ↔ `after/admin-template-edit-390-light.png`, `before/khmer-floral-gold-390-light.png` ↔ `after/khmer-floral-gold-390-light.png`. To share the complete gallery, package that ignored directory through an approved artifact channel; the tracked JSON and scripts alone do not show PNG pixels.

Reproduce from the relevant source state using `node evidence/capture-visual.mjs before|after` from repository root with the full path shown in [11](11-automated-testing-and-exact-commands.md). The harness builds both apps into isolated stage directories, serves loopback previews and never writes application data. `evidence/analyze-captures.py` requires Pillow. `evidence/audit-responsive.mjs` and `evidence/measure-lab.mjs` require the project's installed Playwright browsers. Before/after values may vary with font/animation timing, as the template boilerplate repeat demonstrated.
