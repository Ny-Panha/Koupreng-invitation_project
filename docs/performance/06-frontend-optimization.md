# Frontend optimization

The public invitation feature and its two draft adapters now import their actual
template engine/data/config modules directly. Previously they imported a broad
barrel that also re-exported template pages, dedicated layouts and their styles.
This altered the production dependency graph without changing JSX, CSS, state,
API requests, loading gates, templates, animations or user workflows.

## Measured public invitation resources

Production build, synthetic Silk Heritage invitation, fresh Chromium context,
three runs at each of 390×844 and 1440×900:

| Loaded resource metric | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| JavaScript decoded bytes | 1,101,616 | 927,782 | 173,834 (15.78%) |
| Sum of requested JS files compressed independently with gzip | 335,124 | 284,011 | 51,113 (15.25%) |
| CSS decoded bytes | 488,739 | 457,613 | 31,126 (6.37%) |

All six runs in each build loaded the same respective byte totals. These are
resources actually requested by this public page, not the sum of every lazy route
in the build and not on-wire gzip transfer sizes. See raw asset/gzip inventories
and resource timings in `evidence/frontend-before.json` and `frontend-after.json`.

The first screen at both viewports is pixel-identical before and after using
reduced motion and the same fallback fonts. Screenshots are under
`output/playwright/performance/`. The profiler also verifies opening the invitation.
Existing desktop/mobile route and invitation browser tests supply broader checks.

LCP/CLS observations are retained in the raw evidence. The local runs use mocked
APIs, no CPU/network throttling and blocked external assets (external stylesheets
are replaced with empty responses). They do **not** demonstrate field LCP or INP
improvement. Desktop LCP was noisier/slower in the initial after run; mobile LCP
was approximately unchanged. The retained win is the deterministic resource
reduction, not an unsupported latency claim.

## Existing behavior and deferred work

Route/template lazy loading already exists. Shared hero images are eager/high
priority, and Silk Heritage and Khmer Celestial music use `preload="none"`.
Those controls are preserved. Large background/music assets still exist in build
output; presence in `dist` alone does not mean they load on every route.

Public rendering waits for invitation, media and catalog data concurrently. Making
media/catalog nonblocking requires testing custom admin templates and first-cover
consistency, so that hypothesis remains deferred. No speculative React memoization,
virtualization, image recompression, font replacement or animation redesign is made.

Reproduce and check a public-route byte budget after building and starting preview:

```powershell
node scripts/performance/profile-public-invitation.mjs after --check-budget
```

The script uses installed Playwright, local fixture data and no added dependency.
It limits this fixture to 1,000,000 decoded JS bytes and 480,000 CSS bytes; it is
an executable local guard, not a newly claimed CI/field monitoring deployment.
