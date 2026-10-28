# Rendered visual evidence

Evidence is captured from actual browser rendering with synthetic authentication/event records unless specifically marked real catalog. Images do not claim a real settled payment or production event mutation.

## Before / after

| Screen | Before | After |
| --- | --- | --- |
| Event information, desktop | [1440](../../output/playwright/next-studio-ux/before/studio-eventInformation-1440.jpg) | [1440](../../output/playwright/next-studio-ux/after/studio-eventInformation-1440.jpg) |
| Event information, mobile | [390](../../output/playwright/next-studio-ux/before/studio-eventInformation-390.jpg) | [390](../../output/playwright/next-studio-ux/after/studio-eventInformation-390.jpg) |
| Schedule / venue | [Desktop](../../output/playwright/next-studio-ux/before/studio-scheduleVenue-1440.jpg) | [Desktop](../../output/playwright/next-studio-ux/after/studio-scheduleVenue-1440.jpg) |
| Media / opening | [Desktop](../../output/playwright/next-studio-ux/before/studio-mediaOpening-1440.jpg) | [Desktop](../../output/playwright/next-studio-ux/after/studio-mediaOpening-1440.jpg) |
| Design / cover | [Desktop](../../output/playwright/next-studio-ux/before/studio-designCover-1440.jpg) | [Desktop](../../output/playwright/next-studio-ux/after/studio-designCover-1440.jpg) |
| Guest experience | [Desktop](../../output/playwright/next-studio-ux/before/studio-guestExperience-1440.jpg) | [Desktop](../../output/playwright/next-studio-ux/after/studio-guestExperience-1440.jpg) |
| Tickets / QR | [Desktop](../../output/playwright/next-studio-ux/before/studio-ticketsQr-1440.jpg) | [Desktop](../../output/playwright/next-studio-ux/after/studio-ticketsQr-1440.jpg) |

All six tabs also have 390px after captures in the same directory. The reviewed pass removes the repeated event-card heading, reduces the language toolbar to immediate language switching plus a disclosure, replaces nested borders with spacing/rules, uses forest Save actions and keeps the actual invitation visible in its existing preview. The final copy pass removes nonessential instruction paragraphs.

## Feedback / access evidence

- Upgrade dialogs: `upgrade-desktop-chromium-{320,375,390,430,768,1024,1366,1440,1920}.jpg`.
- Firefox/WebKit 390px upgrade captures: `upgrade-desktop-firefox-390.jpg`, `upgrade-desktop-webkit-390.jpg`.
- Persistent save failure and confirmed success: `save-failure-*.jpg`, `save-success-*.jpg`.
- Cancel-focused confirmation and read-only retained draft: `confirmation-*.jpg`, `revoked-draft-*.jpg`.

`next-studio-ux.spec.js` checks modal reflow and focus trapping at the nine requested representative widths; Axe checks the access dialog. `playwright.studio.config.js` runs the critical access/recovery/save journeys in Firefox and WebKit with separate trace directories. Chromium captures the tab matrix once, avoiding redundant screenshot generation in those two browser projects.

The existing full viewport suites include both UI languages, long Khmer values and responsive split/preview checks. These are automated render/reflow checks, not a claim of physical-device or manual screen-reader testing. Physical devices, screen-reader speech/gesture behavior and operating-system font rendering remain manual acceptance items.

## Project-wide light/dark pass

The expanded route matrix captures My Events, event overview, guests, Studio, RSVP, delivery, ticket design, invitation preview, media, seating, check-in, analytics, gifts, budget, reports, QR, wishes, settings and team at light 1440px and dark 390/768/1440px. Landing adds 320/390/768/1440px and a full-page desktop capture. Each dark management content region and the whole dark marketing shell receives an Axe check.

Examples: [landing](../../output/playwright/next-studio-ux/project-wide/landing-dark-full.jpg), [overview](../../output/playwright/next-studio-ux/project-wide/overview-dark-390.jpg), [guests](../../output/playwright/next-studio-ux/project-wide/guests-dark-1440.jpg), [Studio](../../output/playwright/next-studio-ux/project-wide/invitation-dark-1440.jpg), [reports](../../output/playwright/next-studio-ux/project-wide/reports-dark-1440.jpg), [ticket artwork within dark tools](../../output/playwright/next-studio-ux/project-wide/tickets-dark-1440.jpg).

Four actual Windows Chromium PNG pixel baselines live beside `project-wide-ui.spec.js`: My Events in English at 1440px and overview in Khmer at 390px, both light and dark. They are generated and visually reviewed, then compared in a separate run without `--update-snapshots`. This creates a repeatable future regression gate; it is not a pixel comparison against historical production screenshots. The original Studio before/after evidence remains a separate visual review.

Initial checks found low-contrast inherited labels, white finance/scanner surfaces, and loading-only QR/team captures. Those were corrected before the final comparison. Screenshots use fixture data; actual local catalog and real disposable MySQL tests are separately identified in the QA report.
