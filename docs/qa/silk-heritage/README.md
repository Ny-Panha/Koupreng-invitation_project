# Silk Heritage implementation and verification

Implementation date: 2026-10-13. Branch: `feat/silk-heritage-invitation`.

## Delivered behavior

Silk Heritage is a new compatible template, not a replacement application. Its
burgundy woven folio opens onto a responsive ivory photo spread. Formal family
copy, program, story, album, venue, authorized RSVP and closing use saved content.
The gallery supports captions, alt text, a fullscreen native dialog, arrow-key
navigation, Escape, focus containment and return. Missing images become ornament
surfaces. User cover images and videos use `CoverBackground`; bright user media
receives a stronger template-scoped contrast tint. Music requires a host choice
and a user gesture. Reduced motion opens immediately, and normal opening is
skippable even while the two leaves move. Event details remain readable without
music, video or decorative animation.

The registry resolves the slug and `SILK_HERITAGE` preset, using the backend's real
numeric ID. V35 adds its catalog record and changes no existing invitation,
commercial setting or entitlement. Admin Studio provides the preset. The existing
draft and public adapters carry saved fonts, section order, media and gallery
descriptions. Public RSVP still uses the existing server-authorized form and
token endpoints. Its error and confirmation states now have accessible live roles.

Existing template aliases are retained. Dedicated layouts load lazily with a
Suspense boundary. Editor readiness is signaled after the layout mounts its
listeners, fixing a synchronization race exposed by the browser suite. Canva's
stylesheet loads with its own renderer rather than every invitation.

Marketing now shows the flagship preview, personalization benefits, the
choose/customize/share journey, FAQ and functioning destinations. The gallery has
filters, access labels, and loading/error/empty states. Offline samples are labeled
as demos; an empty live catalog stays empty. Template selection survives the login
destination. Unknown demo slugs show recovery instead of an unrelated invitation.
Package prices and limits come from the existing protected package endpoint;
signed-out visitors see an explicit sign-in requirement. No fixed package offer
or unsupported support guarantee is advertised by the modified pages.

## Verification commands and results

Commands ran in the listed workspace. Redirected terminal logs are under
`output/playwright/silk-*.log`; a compact snapshot accompanies this report in
`verification-results.json`.

| Workspace | Command | Final result |
| --- | --- | --- |
| `apps/frontend-user` | `npm test -- --reporter=dot` | 83 files, 390 tests passed |
| `apps/frontend-user` | `npm run lint` | Passed |
| `apps/frontend-user` | `npm run build` | Passed; existing >500 KB entry warning remains |
| `apps/frontend-user` | `npm run analyze:knip` | Passed |
| `apps/frontend-user` | `npm run test:e2e -- --workers=4` | 96 passed, 2 skipped |
| `apps/frontend-user` | `npm test -- --reporter=dot src/features/templates/layouts/SilkHeritage/SilkHeritageLayout.test.jsx src/features/templates/shared/Openings/CoverBackground.test.jsx` | Final contrast/media follow-up: 16 tests passed |
| `apps/frontend-admin` | `npm test -- --reporter=dot` | 10 files, 46 tests passed |
| `apps/frontend-admin` | `npm run lint` | Passed |
| `apps/frontend-admin` | `npm run build` | Passed |
| `apps/backend` | `.\mvnw.cmd test -Dtest=ArchitectureRulesTests,TemplateCatalogServiceTests,FlywayMigrationVersionTests,KhmerCelestialMigrationTests` | 11 tests passed |
| `apps/backend`, isolated MySQL 8 | `.\mvnw.cmd test -Dtest=FreshDatabaseMigrationTests,MigrationUpgradeMySqlTests,SilkHeritageMigrationMySqlTests,TemplateCheckoutPolicyTests` | 7 tests passed, none skipped |
| Repository root | `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed; zero checksum errors |
| Repository root | `python scripts/validate-agent-routing.py` | Failed on the pre-existing empty premium-UX skill |
| Repository root | `git diff --check` | Passed |

Docker Desktop was initially stopped. It was started in the background for a new,
disposable MySQL 8 container with a random name, password and localhost-only port.
No application `.env` credentials were read. The tests applied all migrations to
fresh schemas, validated Hibernate, upgraded historical schemas, and verified that
V35 preserves existing price, premium flag, status and ID. The container and its
ephemeral databases were removed after verification. Historical migration files
were not edited. No production deployment or external publication occurred.

The two browser skips belong to the existing Celestial suite. Browser API fixtures
exercise the public rendering and RSVP success/error paths, including the token
URL; they are not claims of live bank, provider or production guest authorization
testing. Lazy-loading regressions found in earlier test passes were corrected and
the complete browser suite rerun. The final contrast-only media follow-up was
verified with its targeted suite and a production build.

Routing validation reports exactly:

```text
koupreng-premium-ux: SKILL.md missing YAML frontmatter opening '---'
```

That file was empty in the baseline checkout and remains outside this UI change.

## Visual evidence and review

`baseline/` contains original 390px renders and measurements. `final/` contains
the new cover, mobile/desktop hero, program, album and measured build. `screenshots/`
contains full published-invitation fixture renders at 320, 360, 375, 390, 430, 768,
1024 and 1440 CSS pixels. These screenshots were inspected, not only generated.
The responsive browser tests verify no document overflow, no overflowing visible
text/control boxes, primary target dimensions, long Khmer names and personalized
guest names. A separate landscape case covers missing photographs.

Visual corrections made during review: removed the support bubble covering the
open action; separated refined Latin translations from Khmer display lettering;
made the mobile hero names more compact; retained art-directed portrait crops;
preserved album descriptions through both adapters; and tinted bright cover media
so ceremonial text stays readable. Desktop is a two-page spread; the mobile album
is a reading sequence and desktop photographs have staggered composition.

Default text contrast ratios, calculated from the actual palette: ivory/burgundy
9.28:1, charcoal/ivory 12.19:1, ivory/jade 9.95:1, secondary text/ivory 6.25:1.
Decorative champagne lines do not carry required information. Custom host colors
still require their own contrast review.

Provisional design review: **90/100**, based on the evidence here, not a production
readiness certification.

| Criterion | Score | Evidence / remaining limit |
| --- | ---: | --- |
| Original identity | 19/20 | Original woven SVG suite, material hierarchy, independent burgundy/jade folio composition |
| Khmer typography and craftsmanship | 17/20 | Licensed local Moul/Kantumruy, untracked Khmer, long-name screenshots; native cultural/copy review remains |
| Mobile usability | 19/20 | All eight widths, landscape, keyboard focus and primary targets; physical devices remain manual |
| Motion/storytelling | 13/15 | Hinged folio, underlying page reveal, skip and reduced-motion behavior verified in Chromium |
| Functional integration | 14/15 | Shared adapters, trusted preview, public RSVP fixtures, admin preset and real MySQL migration; live staging publication remains manual |
| Accessibility/performance | 8/10 | Contrast, dialog/focus and low CLS evidence; LCP target and field INP remain open |

## Performance interpretation

Run `node scripts/qa/capture-silk-heritage.mjs final` from the repository root while
the production preview server listens on port 4173. The recorded profile is
headless Chromium, 390 × 844, fourfold CPU throttling, 1.6 Mbps download, 150 ms
latency, cache disabled, three new browser contexts, API errors mocked, live font
requests. Raw samples and build asset sizes are in `baseline/measurements.json`
and `final/measurements.json`. `performance-comparison.json` computes the comparison.

The baseline route is Celestial and the final route is Silk Heritage. Their cover
media differ, so the timing comparison is a comparison of experiences, not a
claim that code splitting alone caused every improvement. The production shared
template JS chunk fell from 332.38 KB (82.09 KB gzip) to about 141 KB (36 KB gzip).
Silk Heritage adds its own approximately 17 KB JS chunk and scoped stylesheet.
The >500 KB app entry, legacy shared template CSS, and global Google font loading
remain further optimization candidates. Hero photography is deferred until opening.

Final medians: LCP **4.092 seconds** (baseline 13.424 seconds), CLS **0.00761**
(baseline 0.00296), transferred resources **665,852 bytes** (baseline 3,378,325).
The three final LCP samples span 3.956–4.560 seconds. The shared template CSS fell
from 274,679 to 182,257 bytes. These are laboratory observations for the documented
profile; they do not establish device performance or field INP.

One diagnostic pass overlapped build/verification work and is retained separately
in `diagnostic-overlapping-work.json`. It is excluded from the comparison because
the host was not idle. No INP value or physical-device performance result is
claimed. The 2.5-second LCP target is not met by the recorded simulated profile;
the final exact values are in the comparison JSON.

## Remaining release checks

- Native Khmer review of the working name, ceremonial copy and visual abstraction.
- iPhone Safari, mid-range Android hardware, Telegram and Facebook in-app browsers,
  including safe areas, virtual keyboard, media denial and slow/offline networking.
- A real authenticated staging editor save/publish and Admin Studio round trip,
  with premium eligibility enforced by the actual backend.
- Field INP and further LCP work; legacy demo media/music ownership review remains.

Asset provenance and commercial-use conditions are documented in
`docs/frontend/user/template-asset-licenses.md`; hashes are in `asset-inventory.json`.
All changed/new deliverable paths are listed in `modified-files.json`. Existing
untracked `output/` material was preserved and is excluded from that inventory.
Temporary font-conversion tools also remain under `output/playwright/`: automatic
approval review rejected their recursive cleanup with the reason `blocked by policy`.
