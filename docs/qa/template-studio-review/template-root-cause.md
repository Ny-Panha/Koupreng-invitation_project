# Assigned template identity investigation

21 October 2026 · baseline `81b14f50` · branch `fix/template-studio-review-20261021`.

## Verified evidence and its limits

A real read-only `GET http://localhost:8080/api/v1/templates` returned Khmer Celestial as database ID **4**, Garden Royal as **2**, and Silk Heritage as **5**. `metadata/local-catalog-http.json` contains only public identity fields. The stored development login returned **401** for event 61. Its owner record was therefore not obtained, and this report does not claim to have verified its persisted association or saved it.

The regression reproduces the defect with synthetic event 101 assigned that real catalog mapping: `templateId: 4`, `templateCode: khmer-celestial`. Deliberately stale Garden Royal customization is included. This is a controlled browser fixture, not a copy of event 61.

| Boundary | Before | After |
| --- | --- | --- |
| Catalog assignment | 4 / khmer-celestial | 4 / khmer-celestial |
| Editor label | Khmer Celestial | Khmer Celestial |
| Iframe route | /templates/bliss-editorial-wedding/preview | /templates/khmer-celestial/preview |
| Mounted layout | `.bliss-container` | `.kc-root` |
| Public layout | Khmer Celestial | Khmer Celestial |

Both JSON identity records and original PNGs are in `metadata/template-identity-*.json` and `screenshots/template-tests/{before,after}/`. The before reproduction confirms the mounted Bliss component, rather than inferring it from visual similarity or the URL alone.

## Root causes

1. `LivePhoneSimulator.jsx` maintained a second numeric lookup: **4 → Bliss**, **2 → Emerald**, **5 → Golden**, and **10 → Celestial**. These historical seed IDs disagree with the current database. The iframe used this lookup even when the catalog had correctly identified Celestial.
2. `getTemplateFormFlow` interpreted numeric IDs independently. Celestial ID 4 received a general editor flow. The editor now passes the resolved catalog object, whose stable code selects the form configuration.
3. `registerDynamicTemplates` used one `find()` with code, preset and historical numeric matches joined by OR. Array order could select an unrelated preset before the exact code. Garden ID 2 could inherit Emerald defaults. Exact code lookup now precedes an explicit preset lookup; database IDs never choose preset artwork.
4. The component registry tested numeric aliases before its Garden exception. A Garden object with ID 2 could select Emerald. Stable identifiers and Garden's intentional shared renderer now take priority.
5. Unknown template lookups silently returned Garden Royal or the first dynamic catalog item. These fallbacks are removed. Numeric database lookups wait for the actual catalog. Missing registration, catalog failure and invalid assignments produce recovery states.

## Final flow

Server-owned event association → exact catalog row → stable code and its catalog preset → existing component registry → supported editor sections → live iframe → the same public experience engine.

`templateFromCatalogItem` normalizes catalog responses for both registration and public demos. There is one component registry. Human-readable names remain display metadata. The public draft adapter prioritizes the server association over serialized customization. Route changes remount the form by event identity, and loading state resets before another event is displayed.

The owner editor checks that the persisted database ID and stable code identify the same catalog row. Empty catalogs block editing; a known static demo cannot replace a missing database association. A nonempty authoritative catalog also prevents saving historical seed IDs for absent codes. Explicit admin Garden Royal presets retain their intentional shared renderer.

Saving maps the selected stable code back to the catalog's numeric ID through the existing invitation API. Template changes check compatibility and existing premium access, warn about appearance/optional sections, retain event details and customization collections, and use serialized persistence. The backend continues to enforce ownership and entitlements. Failed saves remain unsaved; changing a selection does not claim server success. No event-61 special case, backend payment change, schema migration or bulk customization rewrite was introduced.

An image-load warning retains the selected renderer. A lazy renderer failure or unregistered design shows recovery instead of substituting another wedding. Existing template artwork and layouts remain in place.

## Regression coverage

Vitest covers exact Celestial/Garden/Silk identities, colliding numeric IDs, invalid and absent IDs, cold lookup, preset selection and public/editor draft agreement. Browser checks assert the iframe route and mounted component, cold delayed catalog loading, refresh, event switching, stale customization, persisted switching, preserved schedule/title, premium denial, invalid assignment, missing registration and missing assets. Existing public invitation, Celestial scrolling and Silk Heritage suites also run.

The owner-specific follow-up is to sign in as event 61's owner, inspect its actual invitation response, open its studio, save a permitted edit and refresh. That remains an access-gated verification step, not a claimed pass.
