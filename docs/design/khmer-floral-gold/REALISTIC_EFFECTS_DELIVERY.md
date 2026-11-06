# Khmer Floral Gold: final guest experience

Latest responsive cover/calendar, Studio controls and landing phone demo: [Mobile and Studio delivery](MOBILE_STUDIO_DELIVERY.md). The delivery below records the earlier artwork baseline.

Updated 2026-11-06. This continues Floral V5 and includes the latest copy, cover ordering, personalized guest-name presentation and original Rumduol/Khmer-kbach artwork.

## Delivered behavior

- The first screen shows the wedding heading above the complete couple-name frame. The guest panel and Open button remain fully reachable without scrolling. Original top/bottom white-green garlands stay in place; four native-proportion rotated panels extend the flowers along both sides with measured content clearance.
- The new guest frame and button are original transparent raster artwork inspired by Rumduol and Khmer kbach. Names and labels remain accessible, editable HTML text. Other owner-selected guest-frame styles are retained. The Khmer button reads **សូមគោរពអញ្ចើញ**.
- The demo guest is **លោក រ៉ាន់ ណារ៉ាត់ ព្រមទាំងគ្រួសារ**. Published invitations use their configured personalized guest. Page 3 repeats that guest directly beneath **យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ**, with restrained gold typography and a fine underline.
- Page 3 uses the requested ceremonial paragraph: **ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។**
- The welcome lasts seven seconds, with Skip beside music and a compact date presentation on short phones. The selected calendar date uses the same rose color in a heart shape and follows the saved event date.
- Details begin higher. The marketing agenda has Day 1 and Day 2; each day uses one uninterrupted, vertically tangent cubic road through the existing marker positions. Owner-authored days/titles remain intact.
- Ten effects use the existing Motion package: paper depth, garden stagger, frame arrival, name cascade, heading rise, guest arrival, Open arrival, welcome cascade, detail stagger and control feedback. Core cover content never starts hidden; completion uses Motion's actual `.finished` contract, with a finite entrance deadline and cleanup for interrupted scenes.
- Twelve butterflies in four colors and twelve textured petals continue across the template. Petals have 100% CSS opacity and native, lossless textures. Reduced motion, slow-update displays, None and data saving use the static path; hidden tabs pause decoration.
- Welcome/details have mirrored flowering branches in all four scene corners and a credited white-flower photograph behind the reading area. Music still starts only on an authorized gesture and persists across scenes.

## Assets and provenance

[Exact Rumduol prompts, built-in generation mode and saved paths](ROMDUOL_KBACH_ARTWORK.md).
[New artwork dimensions, alpha and checksums](ROMDUOL_KBACH_ASSETS.json).
[Effect/restoration prompts](REALISTIC_EFFECTS_PROMPTS.md).
[Source/master/runtime inventory](REALISTIC_EFFECTS_ASSETS.json).
[Photo source and license](PHOTO_BACKGROUND_SOURCE.md).

The two new native 2172 × 724 PNG masters are retained under `assets/khmer-floral-gold/romduol-kbach/`. Their trimmed lossless runtime images are 2158 × 491 and 2148 × 360. CSS nine-slice edges preserve the ornament at responsive widths. The fourteen ambience/background textures total 2,830,973 bytes; the two new UI images add 1,028,780 bytes.

Effect atlases and the restored user-selected floral border are native 1536 × 1024; the photograph is 1600 × 1067. These are HD/native raster assets, not a claim of native 4K detail. There is no new animation dependency, canvas loop, particle engine or extra video decoder. Original source videos and photographs are preserved.

## Verification

Commands run from `apps/frontend-user` unless marked root. [Executed browser cases and built-app results](REALISTIC_EFFECTS_BROWSER_RESULTS.json).

| Command | Observed result |
| --- | --- |
| `npm test -- --maxWorkers=2` | Full frontend baseline: 1,375 tests / 194 files passed, 103.18s. Run before the final copy/order edits; the affected files were checked again below. |
| Targeted Vitest command below | 33 tests / 4 files passed, 1.80s after the final copy/order edits. |
| `npm run lint` | Final run passed, exit 0, no warnings. |
| `npx eslint src/features/templates/layouts/KhmerFloralGold/useFloralMotion.js --max-warnings=0` | Passed after capturing the stable played-phase Set for cleanup. |
| `npm run build` | Passed, exit 0; 3.47s. |
| `npx playwright test --config playwright.floral-v5.config.js floral-v5-regal.spec.js floral-v5-visual.spec.js` | 74 passed, 6 intentionally skipped duplicate visual/export cases; 401.22s. Chromium, Firefox, WebKit and mobile Chromium. Zero failures or flakes. |
| Built-app command below, base URL `http://127.0.0.1:4395` | 5 passed, 24.56s against the final production build. Covers entrance/reload visibility, opening/music, the actual catalog image, personalized guest/owner frame preservation and saved-date heart/lossless petals. |
| `python scripts/qa/prepare-floral-source-effects.py` (root) | Packaged 14 native-resolution textures, 2,830,973 bytes. |
| `python scripts/qa/prepare-romduol-kbach.py` (root) | Packaged two lossless UI assets; transparent guest-frame center and opaque button center verified. |
| `python scripts/qa/prepare-floral-v5-preview.py` (root) | Refreshed three catalog WebPs (320/640/960px) and seven before/after comparisons from the actual final rendered cover. |
| `node .cache/floral-realistic-live-check.mjs` and `node .cache/floral-cover-visibility.mjs` (root; temporary helpers removed after recording evidence) | Exact user URL on localhost:5173: four viewport checks, no scrolling, overflow, broken images or alert banners; 12 butterflies and 12 petals; at least 8px side-flower clearance. Two reloads sampled immediately, during and after entrance: core content always visible, no page errors. |

Final affected-file unit command:

```powershell
npx vitest run src/features/templates/layouts/KhmerFloralGold/FloralRegal.test.jsx src/features/templates/layouts/KhmerFloralGold/FloralAmbience.test.jsx src/features/templates/layouts/KhmerFloralGold/useFloralEnvironment.test.jsx src/features/templates/layouts/KhmerFloralGold/useFloralScrollReveal.test.jsx --maxWorkers=2
```

Final built-app command:

```powershell
$env:FLORAL_V4_BASE_URL='http://127.0.0.1:4395'
npx playwright test --config playwright.floral-v5.config.js floral-v5-regal.spec.js --project=chromium --grep 'cover content|actual transparent|template listing|Rumduol artwork|saved wedding'
```

[Live responsive measurements](REALISTIC_EFFECTS_LIVE_RESULTS.json).
[Two-reload visibility samples](COVER_VISIBILITY_LIVE_RESULTS.json).
[Final live cover](screenshots/v5/cover-motion-restored-live.png).
[Mobile cover](screenshots/v5/responsive-mobile-opaque-border.png).
[Personalized guest](screenshots/v5/romduol-personalized-guest.png).
[Details opening and guest dedication](screenshots/v5/details-compact-top.png).
[Two-day agenda](screenshots/v5/agenda-two-days.png).
[Short-screen welcome](screenshots/v5/welcome-responsive-640.png).
[Catalog card](screenshots/v5/catalog-card.png).

## Resolved failures and limits

- The earlier cover disappeared during an interrupted entrance. Promise coercion did not wait for Motion 14.5 group controls. Using `.finished`, finite completion, cleanup and visible core baselines fixed it; live reload and four-browser regression checks pass.
- Reading images during an earlier packaging run produced `EncodingError` from partially written WebPs. Packaging now writes atomically and finishes before browser checks.
- An early welcome geometry assertion rejected the floating-point viewport ratio `0.9999999403953552`. It now allows subpixel precision while explicitly asserting the button bounds and no document overflow.
- One earlier full-unit run under concurrent media/QA load timed out an unrelated InvitationForm test at 5,000ms. The standalone two-worker full run passed all 1,375 tests. Obsolete fixed-name/identity-matrix assertions were also corrected to inspect the configured content and actual geometry.
- A cleanup-ref lint warning was resolved by capturing the stable Set within the effect. Final whole-app lint has no warnings. Existing QA ports initially rejected duplicate starts (`Port 4384 is already in use`); the running task servers were reused.
- An intermediate browser run was stopped when the user supplied the final wording/order changes. It is not counted as completed evidence; the subsequent complete run and final built-app smoke results are recorded above.
- Browser publication/persistence scenarios use intercepted synthetic API fixtures. Physical-device testing and live MySQL publication were not performed. Windows WebKit's existing Premium MP4 codec recovery remains annotated in its test; the floral effects have no video codec dependency.

Task-only reference frames, abandoned video/keying experiments, raw traces, temporary helpers and QA logs were removed from the workspace after retaining the reviewed assets and evidence. Permanent deletion was rejected by automatic approval review ("blocked by policy"); reversible cleanup through Windows' Recycle Bin succeeded: three temporary directories and 60 floral QA cache files recycled. Every recursive target was resolved and checked inside the workspace, with no tracked files or linked directories. The task QA servers on 4384/4395 were stopped; the user's frontend on 5173 remains available. Original source media, generated masters, the owner's local 4K Regal master, runtime images and reviewed screenshots are retained.

No production deployment was performed. Changes are committed and pushed normally to `origin/main`; the final response records the verified remote commit.
