# Verification limits

The full backend suite passed with 71 tests skipped by existing environment gates, including `RUN_FLYWAY_INTEGRATION`. A disposable MySQL integration environment was not configured for this run. Live bank/provider calls, live email/Telegram delivery, production deployment, physical devices and manual assistive-technology testing were not exercised.

Chromium desktop/mobile emulation supplies the new browser evidence. Cross-engine and physical-device certification remains separate. Existing happy-dom tests emit disabled iframe/stylesheet loading diagnostics; successful exit codes and assertions, rather than the absence of stderr, determine results.

Before screenshots were recorded, but no numeric pre-change CLS trace was captured. The final CLS gate and visual comparisons are evidence of bounded current behavior, not a measured before/after speedup. Browser task time is a local main-thread proxy, not total device/GPU energy consumption.

The first broad historical browser run recorded 205 passed, 15 failed and 26 duplicate/conditional skips. Investigation found obsolete helper-copy expectations, hidden desktop controls in mobile tests, continuously moving opening buttons in functional tests, and date-sensitive overview goldens. Test repairs use current controls, the suite's existing reduced-motion policy, and a fixed golden clock. Subsequent verification results are listed in [05](05-tests-and-visual-regression.md); the original log is retained rather than erased.

Recommendations are limited to code review and staging validation. Environment-gated integration tests and manual accessibility/device checks remain required before claiming production certification.
