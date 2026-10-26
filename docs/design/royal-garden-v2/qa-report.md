# Royal Garden V2 QA report

Verified 26 October 2026 on branch `feature/royal-garden-v2-studio-redesign`, based on fetched `origin/main` commit `be949921`.

## Executed gates

| Command from repository root | Actual result |
| --- | --- |
| `npm --prefix apps/frontend-user run lint` | PASS, no lint findings |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2 --reporter=dot` | **140 files passed, 1,005 tests passed**, 60.43 seconds |
| `npm --prefix apps/frontend-user run build` | PASS, final production output built in 1.31 seconds |
| `npm --prefix apps/frontend-user run test:e2e -- --config=playwright.royal-garden.config.js` | **64 passed, 0 skipped, 0 flaky, 0 unexpected**, 159.07 seconds (CLI rounds to 2.7 minutes) |
| Same browser command with `--grep responsive --reporter=list` after the final title/focus/touch CSS refinement | **4 passed**, 41.5 seconds; eight widths and axe checks repeated in all four browser projects |
| `powershell -ExecutionPolicy Bypass -File ./scripts/setup-ai-skills.ps1 -VerifyOnly` | PASS, 59 bundled directories checked, 10 pinned skills verified, 0 failures |
| `python scripts/validate-agent-routing.py` | PASS, 58 valid skills, 0 failures |
| `git diff --check` | PASS |

The Playwright JSON report is summarized in `execution-results.json`. Raw local logs and traces are under `.cache/royal-garden*` and frontend `test-results`; they are not required production files. Screenshots are checked in under `evidence/`.

## Browser coverage

Sixteen scenarios run in each of desktop Chromium, mobile Chromium, Firefox and WebKit. They cover:

- Complete cinematic sequence and skip without stale timers.
- Live couple-name edits.
- Signature-validated portrait uploads and accessible slide ordering.
- Canonical date changes and Khmer numerals/calendar synchronization.
- Ceremony insertion/order and multi-day model rendering.
- Saved map URL and venue navigation CTA.
- Gallery reordering into public rendering.
- Approved locale switching without dropping a guest token.
- Intro save, confirmed acknowledgement and browser reload.
- Studio publication confirmation and the saved public view.
- System reduced-motion behavior.
- Empty owner galleries/schedules and cleared optional wording.
- 500 failure and 409 conflict retention.
- An unrelated existing template's renderer.
- Eight widths (320, 375, 390, 430, 512, 768, 1024, 1440), long program content, no horizontal overflow, and axe WCAG 2 A/AA and 2.1 AA checks on the captured invitation surface.

Browser flows use the repository's **synthetic API/authentication fixtures**, including uploads, saves and publication. These test frontend request/render behavior and persistence adapters; they do not establish a successful live database write or production entitlement/catalog activation. No real guest messages were submitted.

## Findings fixed during verification

The first pre-registration integration run had 972 passing and 3 failing tests: two newly ported template/registry integration failures and one existing form timeout under parallel load. It was not a clean-main baseline. All final unit/component tests pass.

Subsequent checks caught missing static demo date metadata, an assumption about catalog ordering, a gallery-only saved-data round-trip, exact label/renderer selectors in the new browser tests, and a low-contrast language control. These were corrected. A valid WebP upload was rejected by Windows WebKit because it reported a generic MIME; validation now inspects JPEG/PNG/WebP signatures and normalizes the file MIME before the existing upload pipeline. The regression is covered by unit and browser tests.

The template uses readable darker brass for text and keeps pale gold for ornamental strokes. The public ticket shortcut sits above the new bottom navigation. No assertions or accessibility rules were disabled to obtain passing results.

A subsequent unrestricted full-suite rerun had an unrelated owner-report integration test fail while its asynchronous summary was still loading (1,004 passed, 1 failed). That unchanged file passed in isolation (2/2 tests, 639ms). The final bounded-worker full run passed all 1,005 tests. This transient failure is recorded rather than omitted.

An additional headless Chromium check opened the real static catalog demo without a backend catalog, verified the supplied couple names and nine ceremonies, and saved four 512px sample screenshots (information, program, closing and countdown).

## Outstanding integration checks

- Local backend `/actuator/health` returned **HTTP 503**, `status: DOWN`. Real database create/save/reload/publish, live upload storage and real authorization could not be verified.
- Backend catalog activation requires an administrator to create/activate the stable template code. No production catalog, purchase record, price, DNS entry, container or deployment was changed.
- No moderated public wishes feed API exists; RSVP wishes remain private. This is intentionally not represented as a working public comment feed.
- Canva is not connected; no unavailable generation/export is claimed. Original vectors and documented local photography/fonts are used.
- No real-device Android/iOS, throttled mobile-network benchmark or Lighthouse/Core Web Vitals measurement was performed. Browser emulation and transform/opacity implementation are not proof of a mobile performance score.
- Backend Maven and worker pytest suites were not executed for this frontend-only change; no Java/Python/schema change was made.

This PR is suitable for frontend review, with live backend/catalog acceptance still outstanding.
