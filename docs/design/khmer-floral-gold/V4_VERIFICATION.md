# V4 authoring, media and template verification

Run date: 2026-11-06. See [baseline](V4_BASELINE.md),
[visual review](V4_VISUAL_REVIEW.md) and [delivery commands/results](V4_DELIVERY.md).

## Actual local services

Docker Desktop's daemon was unavailable. A new native MySQL data directory was
initialized under `.cache/floral-v4/mysql-<random>` on loopback **3420**. Spring
Boot ran on **8088** using only `floral_v4_live`; Vite used **4384** and proxied
that backend. Separate opt-in security tests used `phase12_disposable`. No normal
development database, production account, payment provider or production secret
was used. The task-owned account received a temporary development Premium grant
after the Free boundary was checked; this does not verify a real purchase.

`floral-v4-live.spec.js` has no route interception. It registers through the browser,
uses the server-issued JWT, reads the actual catalog and creates a Free Floral
wedding. Families, program rows, portraits, diagram, gallery, text/artwork modes,
date/program/frame/motion and music are edited through Studio. Saved data and
durable media paths are checked through the actual API after save completion,
refresh and reopening. Fictional bilingual review copy is approved through the
real owner's update API, with the existing translation-readiness rules checked;
this part is not claimed as a complete manual translation-editor journey.

The actual generated guest URL renders both approved languages, a selected date
style and saved names. A guest RSVP returns 201 and appears in the owner's actual
RSVP list. Editing/submitting it again leaves one response record. Uncaught page
errors are collected and the journey asserts none. The fictional guest capture is
[here](screenshots/v4/live-guest.png). No tokens/passwords or browser traces are
included in committed evidence.

## Studio matrix

| Feature | Verification and limits |
| --- | --- |
| Eight date styles | All eight rendered by existing style-combination browser tests; selected tear-off survives actual save/reopen/public view. |
| Eight program styles | All eight rendered, save/public contract tests across compatible templates; alternating selected in live journey. Nine-row preservation unit/fixtures remain. |
| Eight guest frames | All eight combinations rendered; Royal frame checked through actual save/reopen. |
| Heading text/artwork, initials/logo | Existing contract tests select/remove all modes; actual heading/logo/background uploads persist as owned `/uploads/` URLs. |
| Background fit/focus/overlay | Existing normalized bounded controls and unit tests retained; actual uploaded background retained. Every slider position is not individually certified on the real server. |
| Portraits and gallery | Two independent portraits plus three gallery photos and a diagram saved together against the server. All 12 licensed demo photos remain; owner collections are preserved. |
| Map frames | Framed/plain/compact checked by browser tests; actual uploaded diagram retained. No claim that an image is interactive. |
| Motion presets | Existing None/Subtle/Romantic/Elegant/Cinematic normalization retained; existing staged-motion regression tests plus static/data-saving and listener cleanup checks. |
| Music | Native keyboard track selection; actual persisted song becomes one guest audio player. Existing synthetic-audio test covers play/pause and route cleanup. |
| Save feedback | The test waits for `data-phase=saved`, after uploads and final reference update, before refresh. Intermediate metadata acknowledgement is insufficient. |
| WebKit WebP uploads | Reproduced rejection of valid WebP files with browser-specific MIME. Shared byte-signature normalization now supports heading/logo/background, portrait/gallery and diagram inputs; WebKit save/reopen/public contract cases pass. Backend type/size/ownership checks remain unchanged. |
| Mobile controls | Closed workspace Help footer no longer inherits overlay stacking above Save; 360px English dock fits all six actions, Khmer labels retain their intrinsic width in the scrollable dock, and demo RSVP radios use their visible label hit area. |

The old mostly blank Studio image was reproducible as a capture extending beyond
the bounded editor scrollport. Scrolled viewport captures show real content.
Separately, a new invitation with no program really lacked representative style
miniatures. Preview-only examples now fill that gap, explicitly labeled in both
languages; examples never enter the authored form/save payload.

## Media and Premium boundaries

| Check | Evidence |
| --- | --- |
| Free base Floral | Actual catalog selection, creation and authoring; no checkout required. |
| Free film upload | Actual server 403 before the development grant. |
| MP4 | Actual Studio upload, selected media ID, owner-preview decoding and published protected playback in Chromium. |
| WebM | Actual upload, protected bytes and selection/save through Studio; published protected WebM decoding in Chromium. |
| Size | Actual Studio rejects a 51 MiB file before upload. Backend media validation is covered by the full service suite; no claim of sending a 51 MiB body to Cloudinary. |
| Poster | Actual owned image selected, saved and returned as public video poster. The panel refreshes its stale image list after film upload. |
| Skip / replay / failure | Actual published MP4 Skip/Escape and replay; actual WebM source followed by a simulated browser media-error event recovers to usable details. This simulates decoder failure, not a provider outage. |
| Audio | Floral film remains muted; one background audio element. No competing audible film channel. |
| Ownership / private / expiry | Five enabled `Phase9MediaMySqlTests`: real HTTP/JWT/MySQL/storage checks for Free/Pro denial, forged/other-owner IDs, selected ID, expired entitlement, private access and Free Floral publication. |
| Missing media / reduced motion | Existing player/provider unit tests and browser protected-media failure/bypass contracts; normal invitation remains accessible. |
| Browser codecs | Four browser profiles run fixture video cases. Any engine-specific decoding limitation is recorded in the final test report; emulation is not physical Safari verification. |
| Cloudinary | Not exercised. No specifically authorized development provider configuration was verified; actual storage testing used local files only. |

## Registered template compatibility

Source inspected: registry, capability declarations, Studio flow, public adapter,
the generated Phase 12 matrix and existing dedicated layouts. The fresh actual
catalog has only **four** ACTIVE records. A fixture catalog proves renderer
contracts, not public catalog availability or production permission.

| Renderer / stable code | Actual fresh catalog | V4 coverage |
| --- | --- | --- |
| Khmer Floral Gold | ACTIVE / Free | Real complete journey; seven-width scenes, styles, motion, gallery, media and RSVP. |
| Khmer Celestial | ACTIVE / Free | Style save/public contracts, template identity/switching, eight-width bilingual public matrix and film cases; full unit suite. |
| Silk Heritage | ACTIVE / Free | Style save/public contracts, bilingual public matrix and film cases; folio identity retained. |
| Event Essential | ACTIVE / Free | Existing settings editor/date/program persistence, neutral public matrix and film cases. No decorative wedding cover forced on it. |
| Royal Garden Cinematic | Absent | Dedicated capabilities/source/unit suite and bilingual public matrix. Bespoke calendar, scene navigation and paid map controls retained. No real-catalog Studio creation claim. |
| Digital Yes | Absent | Style save/public, identity switching, bilingual public matrix and film; seal opening retained. |
| Emerald Luxe | Absent | Style save/public, bilingual public matrix and film; curtain/flip navigation retained. |
| WithJoy | Absent | Style save/public, bilingual public matrix and film; portal navigation retained. |
| Bliss Editorial | Absent | Style save/public, bilingual public matrix and film; RSVP drawer retained. |
| Golden Canva / Cover Golden | Absent | Both stable-code style save/public and bilingual public contracts; original navigation retained. |
| Royal Khmer alias | Absent | Its existing Celestial adapter receives style/public and bilingual contracts. |
| Koupreng demo | Absent | Shared style save/public contract. Not represented as selectable in the actual catalog. |
| Developer boilerplate | Absent | Registry/capability unit tests; no date/program controls advertised. No full customer-template certification. |
| Retired Garden Royal / Royal Lotus | Inactive/absent | Their retired public cases intentionally skip; exclusion is covered by current catalog/registry tests. |

Every rendered template is not certified through every real-server upload and
RSVP combination. The real journey is Floral; other renderer coverage is explicitly
source/unit/browser-contract based. No catalog records or paid features were
activated merely to make the matrix appear complete.

## Repeating the local journey

1. Run `python scripts/qa/prepare-floral-v4-media.py` (Pillow and FFmpeg or
   imageio-ffmpeg required). Generated footage/silent audio/diagram are original QA fixtures.
2. Provision an isolated native MySQL instance on 127.0.0.1:3420 and create
   `floral_v4_live`. The live spec's development grant uses that owned instance's
   local root account without a password; never aim it at a normal/shared DB.
3. Start the backend with an ephemeral JWT secret, `DB_URL` pointing only at that
   database, `DB_USERNAME=root`, empty `DB_PASSWORD`, `DEV_SAMPLE_DATA_ENABLED=false`,
   `FIRST_USER_ADMIN_ENABLED=false`, server port 8088, local storage under
   `.cache/floral-v4/uploads`, and allowed origin `http://127.0.0.1:4384`.
4. Write `.cache/floral-v4/runtime.json` with the explicit markers
   `{"owner":"floral-v4-disposable","port":3420,"database":"floral_v4_live"}`.
   This is a guard, not a substitute for verifying the actual isolated server.
5. Start Vite with `BACKEND_PORT=8088`, `FRONTEND_USER_PORT=4384`, host 127.0.0.1.
   Set `FLORAL_V4_LIVE=1`; run the exact live command in the delivery report.

Use only fictional accounts/media. Keep `.cache` and generated traces private;
they can contain ephemeral authentication and guest credentials. The test intentionally
skips without its explicit opt-in and ownership marker. Browser-contract suites
need no database, but require Vite and installed Playwright engines.
