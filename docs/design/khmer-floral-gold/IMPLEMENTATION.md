# Khmer Floral Gold — implementation record

## Reference and design direction

Source supplied by the user: `IMG_0309.MP4`, 77,627,321 bytes, 128.10 seconds, HEVC Main 10/PQ, 1284×2252, variable frame rate (~39.20 fps), AAC stereo. The approximate 512×896 dimensions in the brief describe a reduced viewing size. FFmpeg 7.1 from the installed imageio-ffmpeg package decoded 31 timestamped frames. Private frames, contact sheets and metadata remain under the local temporary directory `koupreng-khmer-floral-reference`; neither the recording, its soundtrack, competitor artwork nor photographed people are shipped.

The compositional reference is a narrow ceremonial scroll: ivory stationery with translucent blush/purple botanical corners; a tall gold initial frame; separate guest panel; gold capsule actions; a seven-column calendar; two overlapping torn-edge portraits; a large couple photograph fading into countdown; gold agenda nodes; framed map; peeking photo carousel and dark thumbnail lightbox; thank-you/apology; RSVP; Koupreng footer. Browser/Telegram chrome, AssistiveTouch, exposure cast, location permission sheet and revisits are recording artifacts.

| Time | Scene and measurements at a 512px reference width | Intended implementation |
|---|---|---|
| 4–8s | Corner florals, 180×240 initial frame near upper third; heading ~32px; 400×80 guest panel; bottom 320×48 gold action | Original watercolor artwork and SVG frame, personalized guest identity, controlled opening |
| 12–16s | Centered welcome, generous whitespace; ~360px seven-column calendar card | Saved date, localized existing calendar |
| 20–36s | Two family columns; ~220×280 portrait cards overlap diagonally; gold names | Canonical family fields and owner portrait uploads; torn-paper masks |
| 36–44s | Small date tear-off card followed by edge-to-edge couple photo | Dynamic date and owner inner/cover photograph |
| 44–56s | Photo-bottom gradient; four rounded gold counter frames; calendar button below | Existing timezone/countdown/export utilities, no hardcoded timer |
| 56–64s | Centered program heading and gold curved timeline | Existing normalized program and editable day order |
| 64–70s | Venue wording; 460×350 gold framed schematic; maps action | Existing uploaded sketch map with accessible viewer and saved directions |
| 72–84s | Center photo ~330px wide with neighbor peeks; 1/4 indicator; dark fullscreen viewer with thumbnails | Swipe/buttons/keyboard, named modal and focus/scroll restoration |
| 104–108s | Thank-you/apology paragraphs with floral paper and gold headings | Existing localized closing fields |
| 108–116s | Two attendance pills, name input, gold submit and branded footer | Existing real public RSVP injected into renderer; explicit nonpersistent demo |

Palette: paper `#fffdf8`, blush `#edd3d9`, orchid `#8b6b9e`, leaf `#849775`, legible gold `#876326`, ink `#463b31`. Decorative highlights can use lighter gold; body text and controls retain readable contrast. Khmer: bundled OFL Moul headings and Kantumruy/Battambang body. English: bundled OFL Cormorant Garamond. Maximum reading canvas ~560px, with surrounding paper at desktop widths. No SaaS card grid or glass treatment.

UI/UX Pro Max was invoked with `wedding invitation floral luxury --design-system`, then a narrower paper-style query and keyboard/modal UX search. Its wedding color/type and accessibility guidance informs the design; its generic marketing/SaaS pattern is not used because it conflicts with the supplied ceremonial composition. `koupreng-premium-ux` governs Khmer typography and culture; `frontend-design` supports the reference-led hierarchy.

## Integration map and plan

1. Add one lazy dedicated renderer under `features/templates/layouts/KhmerFloralGold`, scoped CSS, original watercolor artwork and SVG ornaments. Reuse `normalizeTemplateViewModel`, existing locale projection, `FamilyNames`, `ProgramTimeline`, `EventCalendar`, countdown, calendar export, shared modal and music controller. Keep the existing renderer engine.
2. Add stable `khmer-floral-gold` metadata, registry/capabilities and admin preset. Catalog pages continue to require a real ACTIVE backend numeric record. A forward-only V51 migration inserts a new free record and WEDDING/KH/EN/BOTH classifications, without repointing invitations or overwriting records.
3. Reuse studio `invitationImage`/`invitationImage2` for groom/bride portraits, `backgroundImage`/cover for couple photo, gallery media, canonical program/date/locale/closing fields, and `sketchMapImage` plus saved Google Maps directions. Extend scalar initials end-to-end only as needed. Do not introduce a second editor or payload.
4. Keep premium vector monogram and Map Studio entitlements intact. This renderer's original decorative initials and uploaded venue diagram use basic existing content. Hide irrelevant premium authoring entry points for this template. Account-wide quotas, upload authorization, revision checks, publication and RSVP security remain authoritative.
5. Verify free and configured paid plans, stable renderer/catalog identity, persistence/studio/public data projection, real RSVP API behavior, reduced motion, missing media/date/map states, responsive composition, and existing-template regressions. Record executed results and visual differences separately.

## React UI sources

All ten sources are already researched with official license links in [the repository matrix](../TEN_LIBRARY_INTEGRATION_MATRIX.md) and [license register](../THIRD_PARTY_UI_LICENSES.md). For this template: shadcn/Animate UI inform modal/focus contracts; Untitled UI informs form validation; Kokonut informs music feedback; Skiper informs carousel/thumbnails; React Bits informs restrained reveal; Magic UI informs stable countdown numerals; Aceternity informs portrait depth; Badtz informs content hierarchy; Lightswind informs tonal separation. Original project implementations and existing React/Framer Motion/Lucide are preferred. No restricted library source or brand assets are copied, and no redundant animation engine is installed.
