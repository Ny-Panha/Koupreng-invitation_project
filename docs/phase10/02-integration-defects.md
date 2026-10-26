# Repaired integration defects

| Defect | Repair | Verification |
|---|---|---|
| Appearance present in Studio JSON but dropped before public rendering | Copy studioStyle through publicInvitationToDraft and draftToTemplate.hostContent | Populated renderer contract and save/reload browser checks |
| Royal Lotus heading choice affected only body text; Latin setting unused | Bind the display and Latin CSS variables while retaining body compatibility | Registry/renderer suite; existing saved fonts preserved |
| Static copy masked authored titles/messages in several dedicated layouts | Connect title/subtitle/message headings and text to the existing view model; shared gate replaces only its default heading | Cross-template real DOM lifecycle |
| Modern layouts omitted saved family and closing wording | Small inherited-style text components; no additional data model | Populated per-template renderer probes |
| Golden Khmer renderer expected a nested parent shape and rejected arrays | Accept the existing normalized parent properties and normalize lines | Both golden aliases in renderer/browser matrix |
| External font CSS imports could reject a Vite CSS chunk and blank a route | Replace the three blocking Google imports with local OFL defaults; optional custom fonts stay asynchronous | All catalog templates with both Google font hosts blocked |
| Settings RSVP deadline could lose to stale nested content | Prefer authoritative DTO deadline, including explicit clearing, with legacy fallback | Adapter regression test and real Settings save/reload |
| A subsequent Studio save omitted the Settings RSVP deadline and cleared it on the server | Preserve the canonical deadline in the full update and local draft | Reproduced failing component test, dated/null regression cases and native Settings → Studio save |
| Studio offered wedding-party controls where no renderer consumed them | Renderer capability gate and retained-content explanation | Registry contract and six-tab browser matrix |
| Transition garden bypassed reduced-motion/Save-Data budget | Apply accessibility/data constraints before every variant | Motion budget tests |

No new API endpoints, database columns, payment paths or entitlement policy were introduced.

Source locations, relative to `apps/frontend-user/src`:

- Public appearance/canonical RSVP: `features/wedding-builder/utils/invitationDraftAdapter.js`, `draftToTemplate.js`; regressions in `invitationDraftAdapter.test.js` and `features/templates/registry/phase10Contract.test.jsx`.
- Studio full-update deadline preservation: `features/invitations/InvitationForm.jsx`; `InvitationForm.test.jsx` and `tests/e2e/phase10-live.spec.js` verify it.
- Authored titles/families/closing: `features/templates/layouts/{DigitalYes,EmeraldLuxe,SilkHeritage,KhmerRoyalLotus}` and `BlissEditorialLayout.jsx`, `WithJoyPortalLayout.jsx`; shared `AuthoredFamilies.jsx`, `AuthoredClosing.jsx`, `TemplateMessage.jsx`, `TemplateFooter.jsx` and `TemplateOpeningGate.jsx`.
- Golden parent normalization: `features/templates/experience/components/canva-khmer/CanvaKhmerWeddingTemplate.jsx`.
- Renderer capability gates: `features/templates/registry/templateCapabilities.js` and `InvitationForm.jsx`.
- Loading-safe local fonts: `shared/fonts/core-fonts.css`, `features/templates/experience/studio-fonts.css`, and removal of remote imports from the Digital Yes, Canva Khmer and cinematic-opening CSS; `phase10-typography.spec.js` verifies actual guest rendering with remote font hosts blocked.
- Motion/focus: `features/templates/layouts/KhmerCelestial/celestialMotion.js`, `CelestialLiveGarden.jsx`, `CelestialOpening.jsx`; motion model tests and Studio browser tests.

The inherited WebKit ticket axe case also exposed a verification race: the browser download event preceded React restoring export actions. The test now awaits the explicit PNG-ready status, enabled copy action and full opacity before its unchanged axe scan. Image persistence, PNG size and contrast assertions remain intact; no product colors or business behavior were changed to hide the finding.
