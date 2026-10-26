# Source contract matrix

The 36 registry keys are aliases, not 36 designs. The nine dedicated groups are Digital Yes, Emerald, WithJoy, Bliss, Golden Canva, Khmer Celestial (also Royal Khmer), Boilerplate, Silk Heritage and Royal Lotus. Garden Royal and demo use the shared engine; Event Essential is neutral. Catalog designs and group aliases are inherited from `docs/phase10/01-studio-template-contract-matrix.json`, not counted as independent HTTP field journeys.

| Contract | Source | Phase 11 boundary |
|---|---|---|
| Authoring, save, rehydrate | InvitationForm.jsx; useStudioPersistence.js | separate locale text, canonical form history and writer |
| Public identity and access | PublicInvitationFeature.jsx; InvitationService.java | one slug/token; locale is display only |
| Normalization | invitationDraftAdapter.js; draftToTemplate.js | legacy keys retained; locale text projected |
| Wedding program | program.js; WeddingProgramEditor.jsx; ProgramTimeline.jsx | stable IDs/dates and existing EN fields |
| Renderer capabilities | templateCapabilities.js; templateRegistry.js | only validated layouts receive positioning controls |
| Premium owner benefits | EntitlementService.java; PackageSnapshot.java | current owner snapshot, expiry and revoked collaboration |
| Media | MediaService.java; PreWeddingVideoPolicy.java | existing event ownership; no arbitrary SVG upload |
| Public JSON | LocalizedInvitationPolicy.java | strip unpublished EN before delivery |

All 12 catalog/Event Essential presentations require render and viewport verification. Unsupported layout/art controls must remain unavailable and retain authored data. Executed coverage and exclusions are recorded in the test/visual reports; this table is not a claim that every field x design combination has run through HTTP.
