# Route, feature and state coverage

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

Current source inventory has 135 routes, 62 groups and 63 application/group pairs. Every current factory entry is retained in [route-shell inventory](evidence/route-shell-inventory.json). A route sweep is readiness coverage, not complete business-state certification of 135 routes.

| Route | Consumer | Owned states | Actual case family | Dependency / boundary |
|---|---|---|---|---|
| `/` | HomeFeature + MarketingShell | hero, primary/browse/create continuation, real demo entry, featured collection/empty, folio stages, guest sample, packages, FAQ, final CTA | home discovery; reflow/axe; signed-in; SPA renderer isolation | catalog + public packages; fictional read-only responses |
| `/contact` | ContactFeature + MarketingShell | pristine, required/malformed, typed, locale/theme, pending, duplicate guard, SMTP_ACCEPTED, unacknowledged, 429/503/offline, retry | contact draft/rejection/retry; service error; Phase07 edges | POST /api/v1/contact intercepted; no real email |
| `/venues` | VenuesFeature + MarketingShell | four static entries; filter/empty/reset; failed/slow media; selected detail via click; Back | venue search; history; background modality; slow-photo edges | local static records; blocked external photos in fixtures |
| `/venues/:id` | VenuesFeature + native dialog portal | direct known ID, invalid ID, Escape/close/backdrop, inert background, trap/return, short landscape, eager selected image | direct entry; eager/fallback; reflow/axe; venue inquiry edge | local static records; no booking or availability service |
| `/about` | Navigate replace → /contact | client redirect, destination title/description/focus; no 301 server assertion | about/help redirects | no dedicated About page |
| `/help` | Navigate replace → /contact | client redirect, destination contact recovery | about/help redirects | no dedicated Help page |
| `*` | NotFoundFeature, standalone system main | 404 heading, home recovery, bilingual theme source; six-project Phase06 system checks | alias/404 recovery; Phase06 system-page cases | SPA fallback HTTP status needs deployment review |
| `/templates` | existing catalog in MarketingShell | marketing entry/teaser and destination only; full catalog preserved | home browse + 135-route sweep | Phase09 owns catalog states and pricing |
| `/pricing` | existing pricing in MarketingShell | marketing entry; real package service untouched | CTA href + 135-route sweep | Phase09/21 own amounts, eligibility and checkout |
| `/login → /app/events/new` | existing auth guard and return intent | anonymous create continuation; signed-in Dashboard chrome | home continuation + existing guard units | Phase08 identity; Phase11 creation |
| `/templates/:id, /templates/:id/demo` | existing independent renderers | real demo entry; Silk computed style after SPA marketing; Silk/Emerald before/after | new isolation case; Phase06 cover tests | Phase10 art/registry; Phase16 guest journey |

[Machine state matrix](evidence/route-state-matrix.json). Unsupported booking, refunds, general CMS, owner calendar and live AI remain out of scope. `/support` is not a marketing alias; it receives existing 404 recovery. `/pricing/packages` is not inferred from Gemini prose. All in-scope states have named local evidence or explicit external/domain limits.
