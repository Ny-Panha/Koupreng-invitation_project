# Silk Heritage: baseline and implementation direction

Date: 2026-10-13. Branch: `feat/silk-heritage-invitation`.

## Baseline and priorities

The checkout began on `fix/ci-local-payment-verification`, with only untracked
`output/playwright/` evidence. Existing source changes were not present. The routed
`koupreng-premium-ux/SKILL.md` is empty; the template contract, frontend-design and
UI/UX guidance provide the implementation rules. QA uses the repository QA and
Playwright workflows. The dashboard StyleSeed lock explicitly permits separate
expressive public invitation designs.

Baseline commit: `b1c72db489ce1960399e98ececbe604c8c42aee2`.

| Template | Source findings | Priority / incremental action |
| --- | --- | --- |
| Khmer Celestial | Dedicated large renderer, original botanical styling, personalized cover and responsive tests; Royal Khmer aliases share this renderer. | Preserve published aliases and tests. Separate the new folio identity. |
| Digital Yes | Wax-seal opening and petal effects, separate schedule and RSVP presentation. | Preserve; verify guest RSVP through shared contracts. |
| Emerald Luxe | Velvet opening and flip interaction, dark palette, dedicated tests. | Preserve; monitor motion and contrast independently. |
| Bliss Editorial | Editorial layout with image narrative and its own drawer/gallery behavior. | Preserve; shared normalization is reusable, visual language remains separate. |
| WithJoy Portal | App-like navigation, independent gallery and RSVP presentation. | Preserve; no need to reproduce portal chrome in the folio. |
| Canva Khmer | Two compatible catalog codes share one renderer and cover art family. | Preserve aliases; license warnings apply to existing demo media. |
| Garden Royal | Shared experience sections rather than a dedicated registry entry. | Preserve fallback and existing editor adapters. |
| Starter | Dedicated developer scaffold with manifest and shared cover. | Keep as a development surface, outside sellable catalog. |

The registry statically imports every dedicated layout. Its legacy numeric keys
can collide with database-generated IDs; slug/preset resolution takes precedence.
Do not assign a guessed numeric ID to Silk Heritage. Catalog registration must
resolve the backend-generated ID dynamically. Several historical layouts lack
the manifest now required by the contract; retrofitting all is outside this change.

`TemplateExperience` constructs real host content separately from demo defaults,
then passes the same content to dedicated layouts. `draftToTemplate` and
`publicInvitationToDraft` already connect builder, preview and publication.
`PublicInvitationFeature` injects the existing authorized `PublicRsvpForm` as a
child. The flagship must render that child instead of an imitation form. Admin
Studio stores version-compatible design settings in catalog JSON; no new DTO or
schema field is necessary. Template, invitation, media and payment APIs remain
unchanged. Server-side entitlement checks remain authoritative.

V16 consolidated historical invitations, orders and access into Garden Royal and
deactivated other catalog rows. V22 added Celestial without repointing invitations.
The latest actual migration is V34, so the new catalog insert will be V35. It must
leave existing rows, invitations, orders, prices and entitlements untouched.

P0: preserve authorization and host/demo separation. P1: add an original complete
folio using shared cover, adapters and RSVP. P1: integrate slug/preset/catalog and
admin. P2: improve discovery and explicit catalog loading/error/empty states.
P2: split only the new layout safely, measure production assets and browser timing.

## Visual benchmark and evidence boundaries

- [GoEvent public landing](https://goevent.online/) visibly describes choosing a
  template, entering event details, and activation/sharing; it lists personalization,
  RSVP, maps and music. Its [template index](https://goevent.online/partners/templates)
  yields a thin client-rendered document to the text browser. Opening choreography,
  actual RSVP and template motion are unverified at this stage. No code or assets
  are copied.
- [Cartalia](https://www.cartalia.co.uk/) shows folio, linen, embossing and letterpress
  stationery. General lesson: give each material and composition a deliberate job.
- [Ivy & Palette](https://www.ivyandpalette.com/) presents illustration-led custom
  stationery. General lesson: a coherent suite feels personal through composition.
- [Cambodian silk research, Royal College of Art](https://researchonline.rca.ac.uk/4945/1/MBerthon-Thesis-Cambodia-Silk-redacted.pdf)
  documents silk textiles and gilded geometric hems worn for ceremonies. Our
  geometric SVG border is a contemporary abstraction, not a claimed sacred motif.
- [W3C Khmer resources](https://www.w3.org/TR/khmr-lreq/) guide script rendering.
  Use normal Khmer letter spacing, generous line boxes, LTR direction, real Khmer
  fonts and browser wrapping; no English tracking applied to Khmer.

## Art direction and storyboard

Silk Heritage / សូត្រមង្គល uses ivory `#F6F0E5`, burgundy `#672C39`, champagne
`#B39460`, jade `#283F39`, charcoal `#362A28`. Moul carries ceremonial headings,
Kantumruy Pro supports reading and controls, Cormorant Garamond supports Latin
names. Locally hosted licensed fonts provide an offline baseline.

The signature is a geometric woven folio: a burgundy cover with slim gold-thread
borders and a guest dedication, hinged leaves opening into a photo-led ivory
spread. A formal family invitation follows; a jade agenda and venue form a useful
counterpoint. The gallery reads as a photo album with captions. RSVP and closing
stay quiet and connected to the invitation. Gold is a line material, not body text.

Mobile uses a single folio column; desktop opens into a two-page hero spread.
Names wrap naturally; no fixed text boxes. Opening is user-triggered, shorter than
one second, skippable, and immediate under reduced motion. Other sections remain
static. Missing photos become ornamental compositions rather than broken images.

## QA plan

Capture baseline and final production renders. Test 320, 360, 375, 390, 430, 768,
1024 and 1440 CSS pixels; include landscape, keyboard opening/focus, reduced
motion, long Khmer names, disabled sections, missing media, map links and gallery
focus return. Verify demo/editor/public share saved values; mock API contracts in
browser tests and clearly distinguish those from live provider tests. Run user
lint, Vitest, build, Knip, Playwright; admin checks for preset changes; backend
catalog/migration/architecture tests and isolated MySQL migration validation.
Record actual timing and bundle size, never substitute a self-score for evidence.

## Follow-up browser observations

A real Chromium browser loaded GoEvent's landing and public template index with
HTTP 200. The index exposed cover, opening, main-content and language-preview
labels. A later reload still showed a loading composition at screenshot time;
individual template opening, RSVP submission and music behavior remain unverified.
Only the public UX was inspected. No source code or competitor artwork was taken
into the product.

Baseline captures at 390px are in `docs/qa/silk-heritage/baseline/`. Digital Yes and
Emerald render distinct opening compositions; Celestial has substantially more
media than the new folio. Several legacy local demos have empty couple names, so
their visual baseline is not an authored sample suite. Those are existing content
gaps, not permission to populate real invitations with invented personal data.
The historical starter is a scaffold rather than an active catalog product.

Across the legacy collection, full device, contrast, and license verification is
not established by source inspection alone. Existing Celestial browser tests and
the complete route suite provide regression coverage, not a certification of every
legacy template. Remaining template-specific issues are documented here instead
of deleting aliases or rewriting existing layouts.
