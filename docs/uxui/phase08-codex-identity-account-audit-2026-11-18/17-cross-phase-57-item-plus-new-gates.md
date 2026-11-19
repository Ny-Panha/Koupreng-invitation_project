# 57 historical items and separate new gates

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

Historical status distribution is unchanged: `{'CLOSED — VERIFIED': 29, 'DEFERRED — DOMAIN OWNER': 4, 'BLOCKED — EXTERNAL': 16, 'CLOSED — NOT APPLICABLE': 2, 'REVIEW REQUIRED': 6}`. Every57 original ID/owner/status retained; zero speculative closures. Five AUTH IDs are new additions, making62 rows if combined, not57 with34 verified. Gemini’s category arithmetic mixed these denominators.


| Original ID | Inherited status | Owner | Next action |
| --- | --- | --- | --- |
| P01-route-inventory | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-001 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-002 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-003 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-004 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-005 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-AU-006 | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-audit-states | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-evidence-links | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P01-full-domain-states | DEFERRED — DOMAIN OWNER | Phase 07–25 route owners | Execute the named domain phase with real route/state fixtures |
| P01-devices | BLOCKED — EXTERNAL | Device QA | Run low-end Android, iOS and Telegram/in-app clients against an isolated staging fixture |
| P01-database | BLOCKED — EXTERNAL | Backend QA | Provide isolated MySQL fixture; run forward migration and service integration suite; never mutate production |
| P01-providers | BLOCKED — EXTERNAL | Payments and service QA | Provide isolated provider sandbox and owned test identities; verify settlement/replay/delivery without real money |
| P01-catalog | BLOCKED — EXTERNAL | Catalog owner | Provide an isolated authorized catalog and published content dataset |
| P01-at-field | BLOCKED — EXTERNAL | Accessibility / operations QA | Record VoiceOver/TalkBack journeys and production RUM through an approved separate release scope |
| P03-tokens | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-theme | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-fonts | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-reflow | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-form-focus | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-registry | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P03-fallback | CLOSED — NOT APPLICABLE | Shell / frontend QA | Keep regression coverage |
| P03-renderer-parity | REVIEW REQUIRED | Template visual owner | Review original and new PNG pairs with full authored data and devices; preserve per-family artwork |
| P03-font-metadata | CLOSED — VERIFIED | Typography QA | Keep regression coverage |
| P03-font-range | REVIEW REQUIRED | Typography / native visual reviewer | Review intended synthetic weights above 700 and authored template fidelity before a separate range-normalization change; native glyph approval remains required |
| P03-native-khmer | BLOCKED — EXTERNAL | Native Khmer reviewer | Review live glyphs, terms, diacritics and error text on Android/iOS |
| P03-native-zoom | BLOCKED — EXTERNAL | Desktop accessibility QA / computer-use runtime | Repair native window targeting or perform real browser menu zoom at 200/400%, record DPR/viewport and task reachability |
| P03-physical | BLOCKED — EXTERNAL | Device / accessibility QA | Run physical keyboard, dynamic bars, screen reader and OS text scaling matrix |
| P03-catalog-field | BLOCKED — EXTERNAL | Catalog / operations owner | Provide approved isolated authored catalog and field telemetry |
| P03-studio-font-catalog | DEFERRED — DOMAIN OWNER | Phase 25 owner | Review route-scoped font catalog loading without removing picker choices |
| P04-consumers | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-modal | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-actions | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-table | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-fields | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-toast-status | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-shell-menus | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-studio | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P04-unused | CLOSED — NOT APPLICABLE | Shell / frontend QA | Keep regression coverage |
| P04-specialized | DEFERRED — DOMAIN OWNER | Named Phase 07–25 route owners | Execute the named domain phase with real route/state fixtures |
| P04-all-variants | REVIEW REQUIRED | Component / domain QA | Use the 46-entry resolved consumer register to exercise remaining genuine route-specific variants |
| P04-native | BLOCKED — EXTERNAL | Accessibility / device QA | Record VoiceOver/TalkBack and physical touch/keyboard flows |
| P05-policy | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P05-drawer | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P05-visibility | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P05-families | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
| P05-payload | CLOSED — VERIFIED | Shell / frontend QA | Keep regression coverage |
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

| Separate AUTH item | Independent status | Evidence |
| --- | --- | --- |
| AUTH-A11Y-01 | PARTIALLY COMPLETE | Toggle browser pointer/keyboard and unit contracts; physical AT/device breadth open |
| AUTH-A11Y-02 | PARTIALLY COMPLETE | Login linked errors tested; full form/AT semantics not certified |
| AUTH-PWD-01 | PARTIALLY COMPLETE | DTO/service predicates and feedback verified; actual encoder byte ceiling C08-013 remains inconsistent |
| AUTH-LIFE-01 | PARTIALLY COMPLETE | Truthful guidance and contact link; no linked email for phone-only account remains a service gap |
| AUTH-GUARD-01 | VERIFIED — LOCAL | Localized error retry card + cookie bootstrap race/outage tests |


Phase07 retains9 partial marketing gates in [phase07-partial-gates.json](evidence/phase07-partial-gates.json); venues/media rights/facts,2.40MiB background, SEO crawler fallback, device/native copy and field/runner review are not closed by auth tests. See next owners in the unchanged ledger and Phase09.1 handoff.
