# Marketing V4 art direction

Three small rendered prototypes are under
`output/design-review/marketing-v4/concepts/` (HTML plus PNG). They compare a shared
hero, product glimpse, pricing discovery and contact surface, using existing Silk
Heritage artwork. These are composition studies, not live plans or forms.

| Direction | Strength | Limit | Decision |
| --- | --- | --- | --- |
| Ivory workspace | Clear UI hierarchy; light functional panels; burgundy folio carries ceremony | Needs product-specific content to avoid a generic card kit | Selected |
| Editorial studio | Strong English serif and stationery character | Overweights design-studio identity and is less suitable for prices/forms | Keep serif only in brand/folio accents |
| Evergreen product stage | Strong separation and dramatic invitation stage | Too much dark area for the requested light SaaS journey | Reserve green for actions and the short final CTA |

The selected direction presents a useful invitation and guest platform first,
with ceremonial warmth concentrated in the real folio. Home demonstrates guest
statuses with clearly labeled fixture data; pricing compares server fields;
contact uses a 40/60 split and a clean labeled form. These three artifacts have
different structures rather than repeated identical shadow cards.

## Public-only design contract

Ivory `#F8F5EE`, white `#FFFFFF`, soft paper `#F2ECE2`, ink `#262622`, muted
`#695D50`, border `#E5DED2`, evergreen `#2E433A`, decorative gold `#C3A26B`,
gold text `#77572C`, focus blue `#254F7E`. Gold text is AA on ivory; no normal-text
AAA claim. Success/error retain semantic green/red colors. Dashboard colors and
invitation themes are outside this scope.

Khmer uses the existing local OFL Kantumruy Pro, with >=1.6 body line height and
no arbitrary tracking. Latin UI uses DM Sans; Cormorant Garamond stays in brief
editorial/folio accents. Display Khmer uses bold Kantumruy rather than claiming
that Noto Serif Khmer is bundled. Target header: 74 px desktop, 68–70 mobile;
content 1200 px; inputs 16 px; primary targets 48 px; panel radius 12–16 px.

Motion responds to user intent: the existing folio opening, template image focus,
an active step in the choose/customize/share sequence, comparison disclosure,
field focus, submitting state and acceptance. Initial copy is visible. Native
CSS/Web Animations supplement content and honor reduced motion. No scroll engine
or animation dependency is added.

## Provenance and restraint

Existing Silk Heritage SVGs, photographs and fonts retain the license record in
`template-asset-licenses.md`. Product fixture names/statuses are illustrative and
based on the existing guest/RSVP model; they are not customer metrics. No new
testimonials, staff portraits, decorative raster backgrounds or partner logos are
used. New local font/asset provenance and visual correction notes are recorded
below as implementation is verified.
