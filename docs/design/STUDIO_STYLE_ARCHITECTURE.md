# Canonical invitation styles — V2

Reviewed 2026-11-05. The existing Invitation Studio, settings editor, draft adapters,
`TemplateExperience`, registry, media APIs and public renderer remain authoritative.
No database migration or parallel template engine was introduced.

## Persisted contract

`contentJson.invitationStyleV1` is an additive presentation object. Existing
documents without it retain their template defaults. `invitationStyles.js`
normalizes unknown IDs, bounds numeric inputs, and sanitizes image URLs. Settings
do not contain a second date, schedule, venue, guest identity or entitlement.

| Field | Values / behavior |
| --- | --- |
| `version` | 1 |
| `date` | traditional, minimal, gold-calendar, watercolor, tear-off, typographic, horizontal, floral |
| `program` | classic, gold-curve, alternating, ceremonial, editorial, numbered, floral-list, multi-day |
| `guestFrame` | khmer, floral-gold, engraved, double-gold, vintage, royal, minimal, champagne |
| `motion` | none, subtle, romantic, elegant, cinematic |
| `headingMode`, `headingImage` | Live text or uploaded artwork; switching preserves the inactive choice |
| `headingSize`, `headingAlign` | 20–40px; left, center, right |
| `monogramMode`, `monogramImage`, `monogram` | Text / image; ornate, oval, diamond, minimal original SVG frames |
| `backgroundFit`, `backgroundX/Y`, `backgroundOverlay`, `backgroundBlur` | cover/contain, 0–100, 0–1, 0–12px |
| `portraitFrame`, `gallery`, `map`, `florals` | torn/arch/gold; carousel/grid/filmstrip; framed/plain/compact; boolean |

Text remains in the existing localized `title`, `monogramText`, family, program
and message fields. Cover media remains `coverBackgroundImage` and the existing
opening-video fields. Uploaded artwork uses the existing authenticated gallery
API and its 5 MB/type/quota checks. Removing a selection stores an empty URL;
it does not delete a library asset or resurrect demo media.

## Complete data path

`InvitationStyleEditor` → existing `update` / Undo / Redo → `eventPresentationFields`
→ Studio save and preview payloads → `draftToInvitationPayload` / API content JSON
→ `publicInvitationToDraft` / `draftToTemplate` → `buildTemplateContent`
→ live `TemplateExperience` projection → shared `DatePresentation` / `ProgramTimeline`
and the compatible dedicated renderer. Event Essential uses the same editor inside
its existing `EventDetails` save queue.

Eight date and program miniatures use the real rendering components and owner
data. Inert, aria-hidden previews do not create extra keyboard controls. Choosing
a program style opts legacy flat schedules into the shared normalized renderer;
legacy documents without a style retain their previous presentation.

Floral's default program is the reference-aligned `gold-curve` presentation.
Its editor resolves the same default without rewriting canonical schedule data.
This style uses alternating time/copy around connected cubic SVG segments with
small round nodes; it scales to variable descriptions and multiple days. An
explicitly saved program style takes precedence. Other templates keep their own
default program presentation. The original 700×520 demo map is illustrative;
hosts' uploaded diagrams and safe saved directions remain authoritative.

Capabilities expose only implemented controls. Royal Garden keeps its bespoke
calendar and offers the shared program styles. Floral-specific cover, portrait,
gallery, map framing and motion controls are not advertised to unrelated layouts.
Template compatibility does not grant subscription benefits.

## Opening and media lifecycle

The latest user instruction takes precedence over the original continuous scroll:
Floral now follows cover → cover release → welcome/calendar fade in/hold/fade out
→ optional authorized Premium video → wedding details beginning with the family
invitation heading. The welcome scene lasts 3.2 seconds after the cover release.
Skip/Continue enters details immediately. Reduced motion / no-motion bypasses the
nonessential welcome animation. Studio can inspect the welcome scene without an
automatic timeout by selecting the invitation/calendar section.

The detailed scroll excludes the earlier welcome scene. A selected calendar/date
style or explicitly enabled calendar appears after the portraits; otherwise the
default keeps its tear-off date card. The Studio-only style editor is a lazy
chunk in both authoring routes, with an accessible loading status.
The shared video provider loads its player on demand. Floral video stays muted
while the single selected wedding song can play from the opening gesture.
Failed/blocked playback, ended, Skip, Escape, replay and abort/object-URL cleanup
continue through the existing authorized stage. No direct public film URL is stored.

## Verification and boundaries

`invitationStyles.test.jsx` checks all 16 styles through serialized draft/public
projection and real markup. `invitation-styles-v2.spec.js` checks editor selection,
save, refresh, phone preview and published rendering; it also renders every date,
program and guest-frame combination. The H2 Floral service test verifies actual
JPA persistence/publication, and `Phase9MediaMySqlTests` exercises real HTTP,
Flyway, MySQL, Premium/expired/private/stranger media rules and Floral publication.
Browser API fixtures and mocked Cloudinary tests are explicitly separate evidence.

No Google Maps embed was added without configured credentials/consent. Uploaded
diagrams remain labeled images with an enlargement dialog; directions use the
existing safe Google Maps URL allowlist. The paid illustrated-map and vector-
monogram authoring contracts remain separate and server controlled.
