# Six categories, mobile select and focus

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

STUDIO_TABS contains six categories: Event Information, Schedule & Venue, Media & Opening, Design & Cover, Guest Experience, and Tickets & QR. Desktop markup is a nav containing grouped buttons with aria-current; it is not falsely documented as a ten-tab ARIA tablist. Arrow keys wrap and Home/End choose first/last. Natural Tab stops remain available on the semantic buttons.

The mobile native select has the visible Edit section label and the same category values. resolveStudioSection chooses a supported section, with an explicit unsupported-content notice when the template does not provide that group. Existing section data is retained. Browser keyboard assertions exercise actual focus/current state; viewport journeys exercise the select layout. Complete template-dependent disappearing-section focus recovery remains a review item rather than a blanket accessibility claim.

Evidence:

- [source-routes.json](evidence/source-routes.json)
- [negative-tests.json](evidence/negative-tests.json)
- [visual-manifest.json](evidence/visual-manifest.json)

[Report index](README.md).
