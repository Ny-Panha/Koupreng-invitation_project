# Marketing V5 audit

Audit date: 15 October 2026 (Asia/Bangkok). Local working copy is authoritative.
HEAD, local main, cached origin/main and `git ls-remote origin HEAD refs/heads/main`
all resolve to `3393cddd2bdb4737a5992bff2473773f2ea3c60a`.
`git status --short`, `git diff --stat` and the untracked-file inventory were empty
before work. No existing changes needed a backup. No commit, push or deployment.

## Evidence and scope

Production build and local preview on 127.0.0.1:4173. Catalog, account and package
responses are fixtures; capture rejects non-GET API requests. Existing journey
tests intercept login, checkout and contact. No real message or payment is sent.

Screenshots: `output/playwright/marketing-v5/before/`. Naming is
`{home,templates,pricing,pricing-auth,contact}-{km,en}-{width}-{hero,full}.png`.
Both languages have Home at 320, 390, 768, 1024, 1440 and 1920; other screens at
390 and 1440. Mobile viewport is 390×844; desktop is 1440×900. Authenticated
pricing uses illustrative fixture offers, never actual customer/account data.
`render-audit.json` contains DOM layout, font, console and axe evidence.
`inspection-sheets/` groups every captured PNG for visual inspection; individual
hero and full catalog images were also opened at larger scale.

Capture correction: V4's inherited `scrollTo(0, 0)` could capture an intermediate
smooth-scroll position. V5 capture uses instant scroll and two animation frames.
The corrected baseline replaces those early exploratory captures.

## Qualitative screen assessment before implementation

W = weak, A = adequate, S = strong. These are design judgments, not customer
research, conversion measurements or a certification. Dimensions in order:
value clarity, distinction, focal point, typography, CTA hierarchy, density,
image crops, interactions, accessibility, route consistency.

| Screen / language / width | Clarity | Distinct | Focus | Type | CTA | Density | Images | Touch | A11y | System | Visual evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home km 390 | A | S | A | S | A | W | A | A | A | S | Chips delay opening control past fold |
| Home en 390 | A | S | A | S | A | W | A | A | A | S | Same; copy competes with art |
| Home km 1440 | A | S | S | S | A | A | S | S | A | S | Guest demo precedes first choices |
| Home en 1440 | A | S | S | S | A | A | S | S | A | S | Emotional headline needs lead to explain product |
| Templates km 390 | S | S | A | A | A | W | S | A | A | S | Cover dominates; use action much lower |
| Templates en 390 | S | S | A | A | A | W | S | A | A | S | Long title line-height; repeated descriptions |
| Templates km 1440 | S | S | S | S | S | A | S | S | A | S | Useful preview/use distinction; oversized covers |
| Templates en 1440 | S | S | S | S | S | A | S | S | A | S | Same description on three distinct designs |
| Pricing km 390 public | A | A | A | S | S | A | — | S | A | S | Sign-in gate precedes explanation of design vs package |
| Pricing en 390 public | A | A | A | S | S | A | — | S | A | S | Heading implies package selection before prices exist |
| Pricing km 1440 public | A | A | A | S | S | S | — | S | A | S | Clear access gate; differentiation buried in FAQ |
| Pricing en 1440 public | A | A | A | S | S | S | — | S | A | S | Same |
| Pricing km 390 auth | S | A | S | S | S | A | — | S | A | S | Long but readable cards; mobile comparison works |
| Pricing en 390 auth | S | A | S | S | S | A | — | S | A | S | Fixture prices/currencies clearly separated |
| Pricing km 1440 auth | S | A | S | S | S | S | — | S | A | S | Comparison has no persistent row label when scrolled |
| Pricing en 1440 auth | S | A | S | S | S | S | — | S | A | S | No invented recommendations; preserve |
| Contact km 390 | S | A | S | S | S | A | — | S | A | S | Helpful form; long lead adds height |
| Contact en 390 | S | A | S | S | S | A | — | S | A | S | Comfortable labels, required/error handling |
| Contact km 1440 | S | A | S | S | S | S | — | S | A | S | Balanced split; preserve form behavior |
| Contact en 1440 | S | A | S | S | S | S | — | S | A | S | Heading breaks into three lines at desktop |

Each row refers to its matching `before/<screen>-<language>-<width>-*.png` pair.
Edge widths show no horizontal overflow. At 320, two hero actions wrap into
separate rows, further delaying the folio. At 768, the tall stacked art makes
the first section especially long. No font clipping was detected by DOM checks;
visual glyph shaping still needs native Khmer review before release.

## Prioritized findings

- P0: simplify the hero around product, exploration and one manual preview.
  Remove redundant feature chips. Preserve accessible open/close and real demo.
- P0: move three curated choices ahead of guest management. The current mobile
  page asks visitors to read a product explanation before seeing a second design.
  This is a friction hypothesis based on page structure, not measured conversion.
- P0: surface the difference between service packages and individual premium
  designs before the public sign-in gate. Keep protected prices protected.
- P1: reduce home gallery height on small screens; keep the complete catalog on
  `/templates`. Use design-specific descriptions and comfortable visible actions.
- P1: start the secondary illustration on guest details so it teaches something
  beyond the folio already shown in the hero. Retain user-controlled stages.
- P1: make wide package comparison keyboard-scrollable with persistent row labels.
- P2: tighten contact lead and desktop heading sizing; preserve all delivery,
  validation and retained-input behavior. Review bilingual copy with a native speaker.

## Journey evidence

Baseline command: `npm --prefix apps/frontend-user run test:e2e -- marketing-landing.spec.js marketing-pages.spec.js --project=desktop-chromium --workers=2`.
Result: **26 passed (26.0s)**. This is fresh V4 evidence, not a historical report.

Home → Templates → Silk preview → Use action → real login form (fixture response)
→ selected catalog (`?template=silk-heritage`) → reload → editor (`templateId=2`)
→ Back preserves the selection. Missing premium price routes to Pricing; valid
premium routes to its real checkout page; paid fixture access retains server ID 81.
No entitlement or auth change is justified by this baseline. The hero's secondary
generic creating link is an opportunity to offer an immediate preview instead.

## Composition studies and selected contract

Public marketing is a separate artifact. `.styleseed/manifest.json` selects
`operations-console` / productivity / list; it is not a marketing design contract.
No dashboard lock or StyleSeed installation is changed.

Three wireframes, retaining the same imagery, language and fixture catalog:

```text
V4 product-first       A: folio + designs       B: centered stationery
copy  | portrait       copy   | portrait         centered copy / actions
chips | folio          action | manual folio     large centered folio / portrait
guest-management demo  3 curated design choices  3 design choices
3 design choices       guest-management demo     guest-management demo
folio illustration     guest-detail illustration guest-detail illustration
```

Renderable order/composition studies are in
`output/playwright/marketing-v5/concepts/`; `comparison.json` records section
positions. Choose A: it preserves the recognizable V4 focal point, brings choices
forward without adding a click, and leaves room for the actual invitation control
on mobile. B elongates the desktop hero and repeats a centered-page pattern; V4
keeps the guest-management interruption. The implementation then places the
details-first illustration before guest management to keep the invitation
journey together. No claim of user-tested conversion uplift.

Tokens stay ivory #F8F5EE, white #FFFFFF, evergreen #2E433A, ink #262622,
muted #695D50, decorative gold #C3A26B and readable gold #77572C. Khmer uses
local Kantumruy Pro with >=1.6 line height and normal tracking; Latin UI uses
local DM Sans; Cormorant is limited to brand/folio/editorial accents.
Manual folio reveal remains the signature motion. Filter changes are immediate,
small feedback answers input, and reduced motion removes transitions.

Final measurements, changes, contrast checks and remaining release gates are
recorded in `marketing-v5-implementation.md` after verification.
