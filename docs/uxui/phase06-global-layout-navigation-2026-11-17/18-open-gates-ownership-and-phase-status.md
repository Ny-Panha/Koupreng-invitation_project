# 18 — open gates and independent phase status

Phase 06’s shipped source and automated browser scope are implemented. The overall phase remains **PARTIALLY COMPLETE** pending the review and manual/external conditions below; this is not a production release certificate. Phases 01/03/04/05 are independently **PARTIALLY COMPLETE** under their own original definitions. Phase 02 is **COMPLETE as architecture** with known-red browser maintenance debt. Phases 07–27 are **NOT STARTED by this task**.

| Phase | Closed verified | Closed N/A | Review | Blocked | Deferred | Status |
|---|---:|---:|---:|---:|---:|---|
| 01 | 9 | 0 | 0 | 6 | 1 | PARTIALLY COMPLETE |
| 03 | 7 | 1 | 2 | 5 | 1 | PARTIALLY COMPLETE |
| 04 | 8 | 1 | 1 | 2 | 1 | PARTIALLY COMPLETE |
| 05 | 5 | 0 | 3 | 3 | 1 | PARTIALLY COMPLETE |


| ID | State | Owner | Reproducible next action |
|---|---|---|---|
| P01-full-domain-states | DEFERRED — DOMAIN OWNER | Phase 07–25 route owners | Execute the named domain phase with real route/state fixtures |
| P01-devices | BLOCKED — EXTERNAL | Device QA | Run low-end Android, iOS and Telegram/in-app clients against an isolated staging fixture |
| P01-database | BLOCKED — EXTERNAL | Backend QA | Provide isolated MySQL fixture; run forward migration and service integration suite; never mutate production |
| P01-providers | BLOCKED — EXTERNAL | Payments and service QA | Provide isolated provider sandbox and owned test identities; verify settlement/replay/delivery without real money |
| P01-catalog | BLOCKED — EXTERNAL | Catalog owner | Provide an isolated authorized catalog and published content dataset |
| P01-at-field | BLOCKED — EXTERNAL | Accessibility / operations QA | Record VoiceOver/TalkBack journeys and production RUM through an approved separate release scope |
| P03-renderer-parity | REVIEW REQUIRED | Template visual owner | Review original and new PNG pairs with full authored data and devices; preserve per-family artwork |
| P03-font-range | REVIEW REQUIRED | Typography / native visual reviewer | Review intended synthetic weights above 700 and authored template fidelity before a separate range-normalization change; native glyph approval remains required |
| P03-native-khmer | BLOCKED — EXTERNAL | Native Khmer reviewer | Review live glyphs, terms, diacritics and error text on Android/iOS |
| P03-native-zoom | BLOCKED — EXTERNAL | Desktop accessibility QA / computer-use runtime | Repair native window targeting or perform real browser menu zoom at 200/400%, record DPR/viewport and task reachability |
| P03-physical | BLOCKED — EXTERNAL | Device / accessibility QA | Run physical keyboard, dynamic bars, screen reader and OS text scaling matrix |
| P03-catalog-field | BLOCKED — EXTERNAL | Catalog / operations owner | Provide approved isolated authored catalog and field telemetry |
| P03-studio-font-catalog | DEFERRED — DOMAIN OWNER | Phase 25 owner | Review route-scoped font catalog loading without removing picker choices |
| P04-specialized | DEFERRED — DOMAIN OWNER | Named Phase 07–25 route owners | Execute the named domain phase with real route/state fixtures |
| P04-all-variants | REVIEW REQUIRED | Component / domain QA | Use the 46-entry resolved consumer register to exercise remaining genuine route-specific variants |
| P04-native | BLOCKED — EXTERNAL | Accessibility / device QA | Record VoiceOver/TalkBack and physical touch/keyboard flows |
| P05-timings | REVIEW REQUIRED | Performance QA | Inspect current diagnostic triggers and repeat affected matched conditions; isolate capture/fixture variance from source-caused change before approval |
| P05-concurrency | REVIEW REQUIRED | QA / CI host owner | Repeat identical final-SHA default matrix on an isolated adequately resourced runner, correlate trace action timing with host resources; keep the explicit two-worker comparator and unchanged default configuration |
| P05-historical-cause | REVIEW REQUIRED | Renderer / visual QA | Inspect original problematic PNG/trace frames on devices with complete authored DTO/media |
| P05-media-consent | DEFERRED — DOMAIN OWNER | Phase 10/16 owner | Execute the named domain phase with real route/state fixtures |
| P05-devices-at | BLOCKED — EXTERNAL | Device / accessibility QA | Profile real low-end Android/iOS and screen readers with explicit media consent |
| P05-field | BLOCKED — EXTERNAL | Operations / performance QA | Collect approved real-user p75 LCP/INP/CLS and field error telemetry |
| P01-qa-new | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner | Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P03-qa-new | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner | Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P04-qa-new | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner | Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P05-qa-new | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner | Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |

Physical Android/iOS/in-app clients, VoiceOver/TalkBack, native Khmer linguistic/diacritic review, native 200%/400% browser zoom, isolated MySQL/provider/catalog certification and field p75 CWV remain unverified. A browser fixture or zero axe result is not a universal WCAG certificate.

Native zoom attempted through the desktop bridge failed twice on an owned returned Chrome handle; no guessed window or user authentication dialog was used. Actual 200/400% and OS scaling are separate from emulated reflow. Font binary metadata is now recorded; native glyphs and intended weights still need visual approval. Live data/provider checks require isolated authorized resources, never production mutation. No optional owner calendar, general CMS, live AI, booking or refunds were authorized or implemented.
