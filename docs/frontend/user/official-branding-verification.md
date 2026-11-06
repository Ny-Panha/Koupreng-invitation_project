# Branding verification — 2026-11-06

## Commands and outcomes

Commands ran from the repository root unless a frontend working directory is
specified. No deployment or backend/database mutation was performed.

| Command | Result |
| --- | --- |
| `python scripts/prepare-branding.py` | 19 runtime assets per app; 822,374 bytes per complete set; admin primitive synchronized |
| `npm run build` in `apps/frontend-user` | Passed final production build (1.30s) |
| `npm run build` in `apps/frontend-admin` | Passed production build |
| `npm run lint` in each frontend | Passed after correcting the Floral footer variable; final changed/new JSX also checked with `npx eslint` |
| User targeted `npm test -- ...` below | 13 files, 114 tests passed (21.83s) |
| `npm test -- src/layouts/AdminLayout.test.jsx` in admin | 1 file, 6 tests passed (2.62s) |
| `npm test -- src/layouts/components/HostNav.test.jsx` in user | 5 tests passed after correcting the logo's home-link label (770ms); targeted `npx eslint` passed |
| `git diff --check` | Passed; Git emitted existing CRLF/LF normalization notices |
| Python SHA-256/alpha validation | Both production outputs contain all 19 runtime assets with expected checksums; RGBA logo derivatives retain alpha; all 35 original package files unchanged |
| Python `urllib.request.urlopen` against both preview origins | 38/38 runtime asset URLs returned HTTP 200 and expected byte counts |

Exact final user test selection, run in `apps/frontend-user`:

```powershell
npm test -- src/features/templates/shared/InvitationBranding.test.jsx src/layouts/components/HostNav.test.jsx src/features/templates/registry/templateRegistry.test.jsx src/features/templates/registry/phase10Contract.test.jsx src/features/templates/layouts/hostedRsvp.test.jsx src/features/templates/layouts/previewSecurity.test.jsx src/features/templates/experience/TemplateExperience.test.jsx src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx src/features/templates/layouts/SilkHeritage/SilkHeritageLayout.test.jsx src/features/templates/layouts/EventEssentialLayout.test.jsx src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.test.jsx src/features/templates/layouts/DigitalYes/DigitalYesLayout.test.jsx src/features/invitations/studio/StudioToolbar.test.jsx
```

Final focused ESLint used `git diff --name-only -- src` filtered to `.js`/`.jsx`,
plus the new branding JSX files, passed as arguments to `npx eslint`. Neither
frontend defines a separate type-check script; both applications use JSX.
Backend tests were not run because no backend code changed.

## Browser evidence

Built apps were served through `npm run preview -- --host 127.0.0.1 --port 4173
--strictPort` (user) and the same command with `4174` (admin).
Browser automation used `npx --yes --package @playwright/cli playwright-cli`
with isolated named sessions, snapshots, clicks, screenshots and these scripts:

- `run-code --filename=output/playwright/branding-review.js`: marketing at
  320/375/768/1440px; auth/recovery/reset/404 at 375px; loaded assets, correct
  aspect ratios and no document overflow.
- `run-code --filename=output/playwright/branding-management.js`: host and admin
  at 320/375/1440px using synthetic account/API fixtures. Final controls stayed
  within the viewport, including 320px headers.
- `run-code --filename=output/playwright/branding-density.js`: 2× mobile chose
  256w WebP at 128px; desktop chose 384w at 168px. Removing the WebP source in the
  temporary review DOM confirmed a loaded 384w PNG fallback.
- `run-code --filename=output/playwright/branding-guest-fixture.js`, followed by
  real cover controls: hosted `/w/...` fixtures showed one closing signature;
  hidden branding showed zero marks on opening and closing; a custom mark
  replaced attribution with zero platform signatures.
- Actual Royal Garden and Celestial catalog openings/closings were inspected at
  375px. Their closing logos rendered at 148px. Public menu opened, closed with
  Escape, and returned focus to its trigger. Dark marketing was checked using
  its real theme control. Auth keeps its existing fixed light surface.

Screenshots are under `output/playwright/branding-*.png`, including
`branding-header-320.png`, `branding-footer-1440.png`,
`branding-marketing-dark.png`, `branding-mobile-menu.png`,
`branding-admin-320.png`, `branding-guest-closing.png`,
`branding-guest-hidden.png`, `branding-guest-custom.png`,
`branding-royal-closing.png`, and `branding-celestial-closing.png`.
Build/lint/test and browser matrix logs are in `output/branding/` (local logs).

## Failures encountered and resolved/limits

- Initial user tests: 86 passed, 1 failed because a Celestial assertion expected
  three copies of the old mark with the couple-name alt text. Updated it to
  verify the preserved custom opening/hero/closing mark and absent platform
  attribution. Final tests pass.
- Initial user lint caught `english is not defined` in the Floral footer; fixed
  to that layout's existing `en` variable. Final lint passes.
- Screenshots exposed obsolete 60px/mobile and 36×24px/footer image rules, plus
  320px header crowding. Removed conflicting logo rules and rechecked layouts.
- First preview launch found port 4173 occupied, so the existing preview was
  used. After the conversation resumed, those preview/browser processes were
  gone; a follow-up navigation returned connection refused. Fresh local preview
  servers and a browser session completed the remaining inspections.
- Happy DOM reports disabled external Google Font stylesheets and Google Maps
  iframe loads during tests. They do not fail the tests. Browser Telegram SDK
  warnings about unsupported native features also occurred. One user build
  passed in 8.47s with a Rolldown plugin-timings performance notice; the final
  build passed in 1.30s.
- Live backend delivery, deployment, social-crawler refresh and every template
  at every breakpoint were not tested. Guest/management checks used intercepted
  DTOs, not live user records. No full backend or monorepo release suite was run.
- Automatic approval review rejected the optional recursive cleanup command
  with `blocked by policy`. Temporary extracted inspection files under
  `output/branding/source`, CLI traces under `.playwright-cli`, and intermediate
  screenshots were left in place. These are outside the frontend runtime source.

The initial test failure was:

```text
AssertionError: expected [ <img …(5)></img> ] to have a length of 3 but got 1
src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx:451:70
```

## New and modified paths

Modified tracked files:

- `apps/frontend-admin/index.html`
- `apps/frontend-admin/src/layouts/AdminLayout.css`
- `apps/frontend-admin/src/layouts/components/AdminHeader.jsx`
- `apps/frontend-admin/src/layouts/components/AdminSidebar.jsx`
- `apps/frontend-admin/src/pages/auth/LoginPage.jsx`
- `apps/frontend-user/index.html`
- `apps/frontend-user/src/features/auth/AuthPage.css`
- `apps/frontend-user/src/features/auth/components/AuthLayout.jsx`
- `apps/frontend-user/src/features/invitations/studio/InvitationStudio.css`
- `apps/frontend-user/src/features/invitations/studio/StudioToolbar.jsx`
- `apps/frontend-user/src/features/marketing/NotFoundFeature.jsx`
- `apps/frontend-user/src/features/templates/experience/components/canva-khmer/CanvaKhmerWeddingTemplate.jsx`
- `apps/frontend-user/src/features/templates/experience/components/sections/TemplateFooter.jsx`
- `apps/frontend-user/src/features/templates/layouts/BlissEditorialLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/DefaultTemplate/DefaultTemplateLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/DigitalYes/DigitalYesLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/EmeraldLuxe/EmeraldLuxeLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/EventEssentialLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx`
- `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/components/CelestialOpening.jsx`
- `apps/frontend-user/src/features/templates/layouts/KhmerCelestial/khmerCelestialAssets.js`
- `apps/frontend-user/src/features/templates/layouts/KhmerFloralGold/KhmerFloralGoldLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/RoyalGardenCinematic/model/royalGardenPresentation.js`
- `apps/frontend-user/src/features/templates/layouts/RoyalGardenCinematic/royal-garden-scenes.css`
- `apps/frontend-user/src/features/templates/layouts/SilkHeritage/SilkHeritageLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/TemplateBoilerplate/TemplateBoilerplateLayout.jsx`
- `apps/frontend-user/src/features/templates/layouts/WithJoyPortalLayout.jsx`
- `apps/frontend-user/src/layouts/HostShell.css`
- `apps/frontend-user/src/layouts/components/Footer.jsx`
- `apps/frontend-user/src/layouts/components/Header.jsx`
- `apps/frontend-user/src/layouts/components/HostNav.css`
- `apps/frontend-user/src/layouts/components/HostNav.jsx`
- `apps/frontend-user/src/layouts/components/MarketingChrome.css`
- `apps/frontend-user/src/shared/animations/SiteAnimations.jsx`
- `apps/frontend-user/src/shared/styles/app-experience.css`

New source/documentation files:

- `apps/frontend-user/src/shared/branding/BrandLogo.jsx`
- `apps/frontend-user/src/shared/branding/BrandLogo.css`
- `apps/frontend-user/src/features/templates/shared/InvitationBranding.jsx`
- `apps/frontend-user/src/features/templates/shared/InvitationBranding.css`
- `apps/frontend-user/src/features/templates/shared/InvitationBranding.test.jsx`
- `apps/frontend-admin/src/shared/branding/BrandLogo.jsx`
- `apps/frontend-admin/src/shared/branding/BrandLogo.css`
- `scripts/prepare-branding.py`
- `docs/frontend/user/official-branding.md`
- `docs/frontend/user/official-branding-verification.md`

New derivatives/manifests live under each app's `public/branding/` (PNG fallbacks, icons, social card, runtime manifest; admin also gets the selected WebP files). The original untracked user asset pack was already present and was preserved. Browser scripts/screenshots live under `output/playwright/branding-*`; raw logs are local under `output/branding/`.
