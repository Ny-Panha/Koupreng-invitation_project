# Studio increment

The decorated wedding Studio now offers the five-step guide alongside its existing
advanced section editor. It reuses the original fields, save queue and renderer.
New event creation opens the invitation route with `mode=guided`; existing links
keep their advanced editing behavior. Other event types still use `EventDetails`
and received the corresponding guided integration in the later publishing increment
described in `05-publishing-workflow.md`.

Publishing opens a checklist and explicit confirmation. Required fields follow
the existing server rules; optional story/gallery content does not block it.
The confirmed server response supplies the public slug. The UI explains private
access and subsequent edits, reports errors, and can recheck uncertain publication.
The returned timestamp updates the editor revision, preventing a false conflict
on the next edit.

HTTP 409 and 401 preserve the local form, suspend writes and offer a local JSON
download for recovery. Ordinary failures remain explicitly retryable. This is
manual recovery, not automatic conflict merging. No newer server data is silently
overwritten. The iframe has a loading/retry state; the existing nonce/origin/source
checks remain intact.

Mobile actions use one bottom bar with safe-area padding and hide while the visual
viewport indicates an input keyboard. This is browser logic; physical iOS/Android
keyboard validation remains outstanding. The existing fullscreen preview and focus
restoration remain in use. Fonts, invitation artwork and animation implementations
were retained.

## Executed checks

- Targeted Vitest: 52 passed in five files (Studio, persistence, form, creation).
- Targeted ESLint: passed. Initial full lint found one new export/refresh error;
  the unused export was removed and the affected files were rechecked.
- Vite production build: passed.
- Existing Chromium address/program/story suite: 10 passed (45.7 seconds).
- Guided Chromium checks at 320/360/375/390/430/768/1024/1440/1920 CSS pixels plus
  server-conflict retention: 10 passed (23.3 seconds).
- Initial guided test used a guessed field name, `Cover title`; the actual localized
  catalog label is `Main Title`. The selector was corrected before the passing run.

Browser suites use fictional intercepted HTTP fixtures, not a live backend.
Screenshots and logs live under `D:/Koupreng-Phase7-private/m1-*`; the 320 and 1440
screens were visually inspected. Real HTTP and broader accessibility/browser gates
were subsequently completed: the real UI/API save/reload/publish journey passed,
along with the final 72-case three-engine accessibility/keyboard matrix. See
`10-test-results.md` for the final gates. `playwright.phase7.config.js` uses
isolated port 4288 and fails
if that port is occupied. Existing regression screenshots now use each test's
output directory, avoiding writes to historical Phase 6 evidence.
