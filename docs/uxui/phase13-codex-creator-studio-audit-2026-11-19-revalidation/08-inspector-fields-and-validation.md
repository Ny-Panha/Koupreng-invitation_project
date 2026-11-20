# Inspector hierarchy and authored input

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

StudioField supplies linked labels/help/errors, required-to-publish descriptions and field groups. Actual title, partner names, date/time/timezone and venue fields are exercised by current form/onboarding tests; the long save/reload journey edits an actual input rather than a fabricated object. Validation and publish review remain separate from optional authoring fields. Unknown JSON is retained even where no inspector control exists.

The large InvitationForm is still a monolith and is not claimed exhaustively audited by a small six-file diff. Broad family/story/FAQ/closing/template-specific combinations remain partial coverage, identified in the gates. Short-landscape spacing changes retain reading line height and 44px commands rather than hiding fields or reducing the browser zoom. New color fixes apply only to management chrome, leaving dedicated invitation artwork untouched.

Evidence:

- [source-routes.json](evidence/source-routes.json)
- [f13-independent-54-gates.json](evidence/f13-independent-54-gates.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
