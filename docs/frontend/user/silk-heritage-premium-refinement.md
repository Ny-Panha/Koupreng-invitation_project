# Silk Heritage ceremonial refinement

Verified on 2026-10-14.

Silk Heritage now carries the complete Khmer Celestial sample structure: guest
dedication, family headings and parent labels, invitation text, the 20 December
2026 event, Himawari venue, nine ceremonial program entries, gratitude, apology,
story, dress code, opening metadata, music metadata and section settings. The
latest sample names and parent edits in the working file were preserved.

Its own burgundy, ivory, champagne and jade palette, woven ornaments, photographs
and `SILK_HERITAGE` preset remain in use. The dress code matches these colors.
Story and dress code remain disabled by the copied section settings. English
ceremonial translations are available alongside Khmer; demo translations are
excluded from saved invitations with host content.

The cover has a woven surface, fine foil borders, monogram seal and a 1.1-second
folding reveal. The invitation uses an arched portrait, family paper panels,
four-part countdown, numbered ceremonial timeline and a framed apology. One-time
scroll motion uses native Web Animations with small staggered entrances; it
cancels offscreen, on document hiding and on unmount. Gallery hover motion is
limited to fine pointers. The HTML remains visible if motion APIs are unavailable.
Reduced motion opens immediately, and the opening can be skipped. Returning to
the cover restores focus to its open button.

Published RSVP and host-selected media still use the existing shared components.
The demo has no playable unverified music or fabricated payment QR. No new
runtime dependencies or external assets were added; the additional geometric
linework and woven CSS surface are original project material.

## Verification

Commands below ran in `apps/frontend-user` unless noted.

| Command | Result |
| --- | --- |
| `npm test` | 87 files, 432 tests passed; 19.90 seconds |
| `npm run test:e2e -- tests/e2e/silk-heritage.spec.js tests/e2e/marketing-landing.spec.js --workers=2` | 50 passed; 53.7 seconds |
| `npm run test:e2e -- tests/e2e/silk-heritage-premium.spec.js --workers=2` | 4 passed; 13.2 seconds |
| `npm run lint` | Passed |
| `npm run build` | Passed; 1.13 seconds |
| Root: `python scripts/validate-agent-routing.py` | Passed; zero errors |
| Root: `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed; zero missing files or checksum errors |
| Root: `git diff --check` | Passed |

The initial concurrent lint attempt raced Playwright's removal of `test-results`;
rerunning after browser tests completed passed. Unit tests emit existing Happy DOM
messages about intentionally disabled external font and map loading. The build
still reports the existing unresolved golden-template cover and >500 KB entry
chunk warnings.

Real Chromium inspection of the complete local demo found no horizontal overflow
or clipped text at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 pixels.
It found one visible H1, nine program entries and no page errors. Axe 4.14.0 found
zero violations on the cover and opened invitation at 390 and 1440 pixels. Axe
could not evaluate all gradient contrast automatically; manual token calculations
give ivory text 9.28:1 against burgundy and 12.19:1 against charcoal, and the dark
gold family text 6.54:1 against paper. These checks describe the default palette.

New local screenshots and machine-readable audits are under
`output/playwright/silk-premium/`: `cover-1440.png`, `hero-1440.png`,
`families-390.png`, `program-390.png`, `open-390.png`, `audit.json` and
`accessibility.json`. This ignored directory holds review artifacts without
overwriting the previous tracked screenshots. Browser API fixtures verify local
rendering and guest interactions; no production deployment was performed.
