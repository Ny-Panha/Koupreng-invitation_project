# Studio data contract

| Existing object | New optional property | Accepted values / fallback |
| --- | --- | --- |
| `cinematicIntro` | `curtainEnabled` | boolean / true |
| `cinematicIntro` | `curtainSpeed` | `standard`, `gentle` / standard |
| `cinematicIntro` | `montageEnabled` | boolean / true |
| `informationScene` | `colorPreset` | `royal-blue`, `burgundy-heritage` / royal-blue |
| `informationScene` | `galleryPresentation` | `collage`, `carousel` / collage for royal arch; carousel for legacy styles |

The existing intro normalizer now retains the three intro properties when Studio edits other controls. `informationScene` remains an extensible presentation object. Names, dates, programs, guest identity, QR images and protected media stay in their canonical fields.

Studio exposes curtain enable/speed and montage enable under **Media & Opening → Cinematic intro**, and colors/gallery layout under **Design & Cover → Colors & typography**. Existing slide selection, reorder, duration, focal positions, crossfade, section visibility/order, video fit and video-then-photos controls remain in use.

Unit tests round-trip settings through `draftToInvitationPayload` / `publicInvitationToDraft`. Browser tests edit the same preview, save, reload, and verify persistence. A separate regression verifies trusted preview messages and protected media behavior. Author-authored `sectionOrder` is respected. Only marketing sample content gets the reference order and default burgundy style. Missing color settings retain blue; old saved values are not overwritten.
