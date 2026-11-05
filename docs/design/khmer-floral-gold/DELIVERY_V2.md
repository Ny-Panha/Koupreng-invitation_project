# Khmer Floral Gold delivery V2

Delivered 2026-11-05 to `origin/main`. No production deployment was performed.
Implementation commit: `00dd0054b55fcbf7471fada24ce13790b8c5619c`. The subsequent documentation
commit records this source revision. Starting main: `5e0ad75c`; earlier Floral:
`a082d3d0`. Main was fetched again before delivery. No force-push, migration
rewrite or unrelated-work reset was used.

## Delivered behavior

- The schedule follows the reference's alternating ceremony text, curved gold
  thread, round nodes, date hierarchy and diamond divider. Its Studio miniature
  matches the renderer; all authored ceremonies remain present.
- Venue presentation uses a wide rounded frame, finer original road/roundabout
  diagram, centered address and beveled gold directions action. The button clears
  the floating dock. Uploaded diagrams retain their own proportions.
- The demo has 12 romantic wedding gallery photographs and separate portrait
  sources. Pinterest supplied mood references; distributed photographs are licensed
  Jin Wedding/Pexels stock. These models are not claimed drama actors or reference
  subjects. Exact sources, modifications and hashes are in [ASSETS_V2.json](ASSETS_V2.json).
- Cover → welcome/calendar fade → details starting at
  **យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ**, through the footer. Skip/Continue and
  reduced motion are available. Optional authorized Premium film follows the
  welcome, muted alongside the single selected wedding song.
- Studio includes eight date and eight program styles, original guest/initial
  frames, heading text/art and initials/logo modes, background upload/crop, motion,
  portrait, photo-layout and map-frame choices. All use additive canonical content
  JSON and existing save/preview/public adapters.
- Floral's film capability and opening invocation are fixed; old-event media and
  late uploads are isolated. Server Premium/ownership/protected-byte rules remain
  authoritative. The base Floral template remains Free.
- Registered section controls coordinate with Floral, Celestial and Silk openings
  and modals. Other templates retain their working bespoke controls.

## Preview and review

```powershell
npm --prefix apps/frontend-user run dev
```

Open `/templates/khmer-floral-gold/demo` on the Vite URL printed by the command;
append `?lang=en` for English. Open the invitation, then scroll to program/map.
The demo keeps nine Celestial-derived ceremonies. Separate two-row screenshots
match reference density without removing owner content.

For an owned event, open `/app/events/<eventId>/invitation`, then Design/Cover →
Invitation styles. Save, refresh, inspect the phone preview and publish using
existing permissions. Event Essential uses its existing details editor for date
and program settings. Browser fixtures did not publish a real customer event.

Review [agenda](screenshots/v2/agenda-reference-512.png),
[map](screenshots/v2/map-reference-512.png), [welcome](screenshots/v2/welcome-512.png),
[Studio](screenshots/v2/studio-style-gallery.png),
[before/after](screenshots/v2/before-after-scenes.jpg) and the
[recording](screenshots/v2/opening-scroll.webm). All seven widths are linked in
[VISUAL_QA_V2.md](VISUAL_QA_V2.md).

## Changed areas

- Floral layout, artwork, gallery, model and CSS: staged opening, ornaments,
  refined scenes, schedule/map, responsive media and modal coordination.
- `invitationStyles.js`, `DatePresentation.jsx`, `ProgramTimeline.jsx`, shared CSS
  and `InvitationStyleEditor.jsx`: normalized styles and actual previews.
- Studio navigation, InvitationForm, EventDetails, capabilities and view-model
  projection: canonical authoring/save/public integration.
- Cinematic provider/player/background and PreWeddingVideoEditor: lazy playback,
  muted Floral film, lifecycle and event-specific media library fixes.
- Compatible layout schedule adapters and GuestSectionNavigation: saved styles
  and registered actual anchors while preserving design boundaries.
- Demo adapter/media/template data and optimized public assets: derived sample
  content, 12 licensed photos, thumbnails, independent portraits and original art.
- Two backend integration tests, focused frontend tests, seven E2E files, root
  AGENTS entry point and design/evidence/license records. Production backend policy,
  payment handlers, admin source and applied migrations were not changed.

## Validation and limits

Full frontend: 1,257 passed. Full backend: 591 passed, 78 opt-in database skips,
zero failures/errors; five relevant MySQL tests passed separately. User/admin
lint/build and agent routing passed. Final browser counts, exact commands,
durations and failed iterations are in [TEST_RESULTS_V2.md](TEST_RESULTS_V2.md)
and [RESULTS_V2.json](RESULTS_V2.json).

Physical Safari/iOS, live Cloudinary, production accounts and the full E2E corpus
were not verified. Frame intervals describe headless Chromium. Original flowers,
frames, map details, replacement people and authored content remain distinct from
the private recording; no numerical 100% visual-identity claim is made.

Supporting records: [reference comparison](REFERENCE_VS_IMPLEMENTATION_V2.md),
[video root cause](PRE_WEDDING_VIDEO_ROOT_CAUSE.md),
[style architecture](../STUDIO_STYLE_ARCHITECTURE.md),
[template matrix](../TEMPLATE_CAPABILITY_MATRIX.md), and
[ten-library decisions](../TEN_LIBRARY_APPLICATION_PLAN_V2.md).
