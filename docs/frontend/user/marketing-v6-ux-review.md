# Marketing V6 UX review — 2026-10-15

## Review method and evidence

Local Chromium production preview, fixture APIs, Khmer/English. Before/after
screenshots use identical framing: 390×844 and 1440×900 on Home, Templates,
Pricing, Contact and authenticated pricing. Public routes also have captures at
320, 360, 430, 768, 1024 and 1920px. Full-page captures scroll/decode lazy media
before returning to the top; they are visual evidence, not LCP measurements.

`output/playwright/marketing-v6/{before,after}/` contains route hero/full captures,
folio open, guest details/filter, catalog loading/offline/image failure and
contact invalid/error/429/accepted states. Contact uses fixture text only.
`states-*.zip` records the state flows. `render-audit.json` records geometry,
clipping, fonts, errors and automated accessibility. `states-audit.json` records
the state accessibility audits. `review-*.png` are inspection contact sheets.

## Six-axis rendered assessment

Qualitative assessments use observable criteria; these are not numerical ratings
or WCAG certification.

| Axis | Before finding | After acceptance criterion / finding |
| --- | --- | --- |
| Hierarchy — retained | `home-{km,en}-390-hero.png`: one clear primary action, meaningful preview secondary, portrait and folio within the mobile frame. | Same composition and section order; featured collection remains immediately after Hero. |
| Typography / Khmer — retained | Khmer heading stacks and line spacing are readable; English uses the approved existing type treatment. | Original fonts and wording retained. Compare matched hero/contact/catalog captures for diacritics, wrapping and clipped lines. Native copy approval predates V6; no new cultural wording was introduced. |
| Layout rhythm — retained | Single-column mobile contact form; desktop pricing explanation has distinct sign-in/access guidance. | Same spacing, field order and honest empty/public pricing states. No new content density or repeated hero chips. |
| Product imagery — refined | Catalog downloads 1.73MB of JPEGs for small frames; Silk preview already vector. | Same artwork, aspect ratio and CSS framing with local responsive WebP. Compare `templates-{km,en}-{390,1440}-full.png`; no placeholder substitution or missing design. |
| Interaction clarity — refined | Opening via secondary action focuses the demo link, but Escape did not dismiss the folio. | Escape and close return focus to whichever opener was used. Existing preview/use labels and premium/missing-price guidance remain. |
| Mobile comfort — retained, stress-tested separately | Navigation and actions fit narrow widths; support control does not duplicate Contact's form. | Native dialog focus containment, touch emulation, reduced motion and narrow layouts verified. CSS zoom/text stress are explicitly distinguished from real device settings below. |

Rendered inspection found no need for a second visual redesign/polish loop.
Before/after document heights match on all 64 normal route/locale/width cases;
none reports page overflow, clipped text or page errors. The Khmer hero stacks
cleanly at 320px, the English secondary action wraps below the primary on narrow
screens, and both retain the folio. At 768px the tall portrait continues below
the first viewport and remains available by scrolling. Desktop contact keeps
the help/form columns; mobile puts help after the form. Derivative gallery
photos retain their crop and recognizable gold/floral detail in the paired
catalog inspection sheet. Open folio, offline labels, retained contact drafts
and accepted states were inspected separately in both languages.
Authenticated pricing inspection shows the three fixture offers stacked on
mobile and aligned on desktop, with separate USD/KHR labels and mobile
comparison disclosures (`review-auth-pricing.png`). These are fixture offers.

After captures contain 204 PNGs: 136 normal/authenticated page frames, eight
folio/detail frames, 32 state frames and 28 DPR/text/zoom/reflow frames. Before has
176 PNGs (normal/authenticated and state frames). Eight text-size stress cases
(computed font sizes doubled on mobile) report zero overflow or clipped text;
eight desktop CSS-zoom cases also report zero page overflow, but that scalar
does not establish that all controls fit (see the diagnostic below). Language changes
persisted through refresh on all four public routes in both viewport contexts.
`after/dpr.json` contains isolated initial request counts; use it rather than
the earlier comfort run's request arrays, which include subsequent navigations.

Visual review of CSS zoom found the English desktop Create invitation control
partly outside the viewport. **That synthetic CSS-zoom stress case fails the
header-fit check** despite reporting no document overflow: global horizontal
clipping can mask overflow, and CSS zoom keeps the desktop media queries active.
No production style was changed to satisfy this misleading proxy. An additional
`--zoom-reflow` run modeled a 1440×900 window at 200% browser zoom using a
720×450 CSS viewport and DPR2. All eight route/language cases show the mobile
navigation, with zero horizontal overflow or out-of-bounds checked header/primary
controls; `zoom-reflow.json` and `review-zoom-reflow.png` record this result.
This models responsive reflow rather than operating native browser controls;
native browser/OS zoom remains NOT TESTED. The failed CSS-zoom proxy is retained.

Axe ran on 52 states per phase: 16 public route/locale/width combinations, four
authenticated pricing combinations and 32 mocked interaction states. Both
phases have **zero violations**. Eight Home/guest-filter audits retain an
incomplete `color-contrast` result; these are explicitly unresolved automated
checks, not a blanket contrast/conformance pass. Human contrast/assistive
technology review remains part of the release gate.

## Journeys and source of truth

- **Explore → preview → use → login → editor:** fixtures verify Silk code survives
  encoded `next`, login, refresh and catalog restoration, then server ID `2`
  selects the editor. Premium server ID `81` stays behind access/checkout gates;
  missing or invalid prices lead to pricing. No frontend entitlement grant.
- **Home → pricing:** anonymous visitors see access explanations and sign-in;
  no anonymous GET packages request. Authenticated offers keep USD/KHR separate,
  exact feature flags, unavailable amounts and retry/empty states. Fixture prices
  are illustrative test data, not public offers.
- **Contact:** required validation focuses the first invalid field, failed/429
  responses retain the draft, double submissions are guarded, and only
  `{accepted:true, delivery:"SMTP_ACCEPTED"}` shows acceptance. Every test POST
  is intercepted; no real message or bank action occurred.
- **Catalog reliability:** delayed loading, 503 demo fallback, retry, actual empty
  catalog and broken artwork remain actionable. Unknown image URLs, including
  query strings, are requested unchanged. The new derivatives do not affect
  template identity or routing.
- **Navigation/language:** shared chrome, active route, mobile menu, keyboard
  containment and escape, language persistence across reload and each public
  route are checked. Approved copy is read from the same local state.
- **Motion:** manual folio remains the signature effect. No continuous animation,
  scroll-jacking, content hiding or new animation engine was added.

## Privacy event dictionary — proposal only, not activated

No analytics framework was found in the inspected entry/public source. No vendor,
network adapter, cookie, identifier or event transport was added. This dictionary
is a future opt-in design requiring owner approval of purpose, privacy basis,
retention and consent/settings before implementation. All events default off;
denial or withdrawal must prevent collection and clear queued events. Do not
replay interactions that happened before consent. Do not collect in invitation
guest views, authenticated account screens or the editor under this proposal.

Permitted common properties: `locale=km|en`, `route=home|templates|pricing|contact`,
`viewport=small|medium|large`, and a version enum. These are aggregate categories,
not browser fingerprints. No persistent user/session ID or raw referrer/URL.

| Event | Trigger and route | Controlled extra properties | Purpose / proposed privacy basis | Consent/settings and deduplication |
| --- | --- | --- | --- | --- |
| `marketing_home_view` | Home route becomes visible | none | Aggregate entry count; opt-in product measurement | Only while enabled; once per navigation, never rerender. |
| `landing_primary_cta_click` | Home primary template action | `placement=hero|footer` | Design discovery intent; opt-in measurement | One per user activation, keyboard and click share a handler. |
| `hero_folio_open` | Closed → open on Home | `opener=secondary|cover` | Preview curiosity; opt-in measurement | Once per actual closed→open transition; no repeated render count. |
| `featured_template_preview_click` | Featured preview on Home | `design=silk|celestial|emerald|other`, `placement=image|text` | Aggregate design interest; opt-in measurement | One per navigation activation, never both parent and link. |
| `template_use_click` | Use action on public Home/Templates | same allowlisted design enum; `access_label=free|premium|demo|unknown` | Creation intent, not entitlement; opt-in measurement | One per activation; do not log server IDs, names or image URLs. |
| `auth_handoff_start` | Public use/sign-in link activates | `destination=template_selection|packages` | Handoff count; opt-in measurement | One at outgoing activation; no tokens, raw `next`, login result or user ID. |
| `pricing_page_view` | Public pricing becomes visible | `view=explanation|offers` | Pricing information intent; opt-in measurement | Once per navigation; no package amounts, payment or account identifiers. |
| `contact_submit_result` | Mock/future real request settles | `result=accepted|validation|rate_limited|delivery_error|network_error` | Reliability counts; opt-in measurement | Once per attempt result; no form fields, response body, email or message. |

Prohibit names, emails, phone/Telegram handles, guest details, free-text strings,
auth/payment identifiers, full invitation URLs and arbitrary backend error text.
An approved implementation must use allowlisted enums and aggregate retention.
No conversion uplift, traffic volume or A/B result is claimed. A future consented
usability study can test task completion; traffic suitability for an A/B test is
unknown.

## Manual and service matrix

| Environment / claim | Status | Remaining evidence |
| --- | --- | --- |
| Chromium desktop and Pixel 7 emulation | Automated fixture checks; see implementation report for counts | Emulation does not establish physical phone behavior. |
| Firefox / WebKit | NOT TESTED — binaries absent | Install and run on a separate authorized QA session. |
| Physical Android Chrome / iPhone Safari | NOT TESTED | Cold-load readability, tapping, virtual keyboard and safe areas on real hardware. |
| VoiceOver / TalkBack / desktop screen reader | NOT TESTED | Spoken order, dialog, form errors, acceptance and folio focus. |
| Telegram / Messenger webviews | NOT TESTED | Native SDK, viewport resize, links and authentication on real clients. SDK loading/initialization logic was retained. |
| Native 200% browser zoom / OS large text | NOT TESTED | CSS zoom/computed-text stress captures are proxies; verify actual browser/OS controls. |
| SMTP, package authorization, bank settlement | Fixture-only, real services NOT TESTED | Separate authorized staging and service validation. |
| Production compression/cache/CDN and field CWV/INP | BLOCKED — no staging/production host measured | Owner-approved host and consented field data. |
| Older catalog artwork rights | BLOCKED for release | Derivatives inherit unresolved source ownership; see asset license notes. |

V6 does not establish production readiness or WCAG conformance from automated
checks alone. Production release remains outside this local task.
