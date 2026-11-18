# Cross-phase closure ledger

Every disposition is bounded by its named evidence; source reachability is not behavioral coverage. Historical dated reports remain unchanged. Counts refer to acceptance items, including recurring cross-phase gates, not unique product bugs.

| ID | Phase | Area | Disposition | Owner / next action |
|---|---|---|---|---|
| P01-route-inventory | 01 | Route ownership | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-001 | 01 | Studio mobile preview | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-002 | 01 | Studio preview accessible name | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-003 | 01 | Studio separator and pointer alternatives | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-004 | 01 | Guest-note contrast | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-005 | 01 | Admin subtitle/account badge contrast | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-AU-006 | 01 | Admin login footer contrast | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-audit-states | 01 | Audit state breadth | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-evidence-links | 01 | Portable audit evidence | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P01-full-domain-states | 01 | Domain journeys | DEFERRED — DOMAIN OWNER | Phase 07–25 route owners: Execute the named domain phase with real route/state fixtures |
| P01-devices | 01 | Physical phones / in-app clients | BLOCKED — EXTERNAL | Device QA: Run low-end Android, iOS and Telegram/in-app clients against an isolated staging fixture |
| P01-database | 01 | MySQL and applied migrations | BLOCKED — EXTERNAL | Backend QA: Provide isolated MySQL fixture; run forward migration and service integration suite; never mutate production |
| P01-providers | 01 | ABA / Telegram / delivery | BLOCKED — EXTERNAL | Payments and service QA: Provide isolated provider sandbox and owned test identities; verify settlement/replay/delivery without real money |
| P01-catalog | 01 | Dynamic published catalog | BLOCKED — EXTERNAL | Catalog owner: Provide an isolated authorized catalog and published content dataset |
| P01-at-field | 01 | Assistive technology / field data | BLOCKED — EXTERNAL | Accessibility / operations QA: Record VoiceOver/TalkBack journeys and production RUM through an approved separate release scope |
| P03-tokens | 03 | Canonical token parity | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-theme | 03 | Computed theme and focus | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-fonts | 03 | Local fonts and fallback | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-reflow | 03 | Spacing / forced colors | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-form-focus | 03 | Theme/locale state retention | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-registry | 03 | Registry identity / aliases | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P03-fallback | 03 | Unknown fallback public screenshot | CLOSED — NOT APPLICABLE | Shell / frontend QA: Keep regression coverage |
| P03-renderer-parity | 03 | Historical renderer pixel variation | REVIEW REQUIRED | Template visual owner: Review original and new PNG pairs with full authored data and devices; preserve per-family artwork |
| P03-font-metadata | 03 | Font binary weight metadata | CLOSED — VERIFIED | Typography QA: Keep regression coverage |
| P03-font-range | 03 | Declared and binary weight range | REVIEW REQUIRED | Typography / native visual reviewer: Review intended synthetic weights above 700 and authored template fidelity before a separate range-normalization change; native glyph approval remains required |
| P03-native-khmer | 03 | Native Khmer typography/copy | BLOCKED — EXTERNAL | Native Khmer reviewer: Review live glyphs, terms, diacritics and error text on Android/iOS |
| P03-native-zoom | 03 | Native 200%/400% zoom | BLOCKED — EXTERNAL | Desktop accessibility QA / computer-use runtime: Repair native window targeting or perform real browser menu zoom at 200/400%, record DPR/viewport and task reachability |
| P03-physical | 03 | Physical keyboard/safe area/AT | BLOCKED — EXTERNAL | Device / accessibility QA: Run physical keyboard, dynamic bars, screen reader and OS text scaling matrix |
| P03-catalog-field | 03 | Live catalog and production CWV | BLOCKED — EXTERNAL | Catalog / operations owner: Provide approved isolated authored catalog and field telemetry |
| P03-studio-font-catalog | 03 | Remote Studio font picker | DEFERRED — DOMAIN OWNER | Phase 25 owner: Review route-scoped font catalog loading without removing picker choices |
| P04-consumers | 04 | Resolved component consumer graph | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-modal | 04 | Existing modal stack/inert/Escape/restore | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-actions | 04 | LoadingButton busy/disabled and ActionButton submit semantics | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-table | 04 | Named table keyboard scroll | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-fields | 04 | Form descriptions/search clear state | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-toast-status | 04 | Persistent error toast and authoritative status labels | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-shell-menus | 04 | Public/owner/admin drawer semantics | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-studio | 04 | All five Studio sections and reachability | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P04-unused | 04 | Unused FilterTabs / DataTable | CLOSED — NOT APPLICABLE | Shell / frontend QA: Keep regression coverage |
| P04-specialized | 04 | Specialized media/chart/export/selection variants | DEFERRED — DOMAIN OWNER | Named Phase 07–25 route owners: Execute the named domain phase with real route/state fixtures |
| P04-all-variants | 04 | All primitive permutations | REVIEW REQUIRED | Component / domain QA: Use the 46-entry resolved consumer register to exercise remaining genuine route-specific variants |
| P04-native | 04 | AT and physical interaction | BLOCKED — EXTERNAL | Accessibility / device QA: Record VoiceOver/TalkBack and physical touch/keyboard flows |
| P05-policy | 05 | Canonical motion and task immediacy | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P05-drawer | 05 | Owner offscreen menu focus | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P05-visibility | 05 | Silk desktop / Emerald mobile paint | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P05-families | 05 | Ten family action/boundary review | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P05-payload | 05 | Final build inventory | CLOSED — VERIFIED | Shell / frontend QA: Keep regression coverage |
| P05-timings | 05 | Six condition groups / seven metric triggers | REVIEW REQUIRED | Performance QA: Inspect current diagnostic triggers and repeat affected matched conditions; isolate capture/fixture variance from source-caused change before approval |
| P05-concurrency | 05 | Default worker instability / origin | REVIEW REQUIRED | QA / CI host owner: Repeat identical final-SHA default matrix on an isolated adequately resourced runner, correlate trace action timing with host resources; keep the explicit two-worker comparator and unchanged default configuration |
| P05-historical-cause | 05 | Old paint root cause | REVIEW REQUIRED | Renderer / visual QA: Inspect original problematic PNG/trace frames on devices with complete authored DTO/media |
| P05-media-consent | 05 | Dedicated family full guest/media journeys | DEFERRED — DOMAIN OWNER | Phase 10/16 owner: Execute the named domain phase with real route/state fixtures |
| P05-devices-at | 05 | Low-end phones / assistive technology | BLOCKED — EXTERNAL | Device / accessibility QA: Profile real low-end Android/iOS and screen readers with explicit media consent |
| P05-field | 05 | Field p75 CWV / INP | BLOCKED — EXTERNAL | Operations / performance QA: Collect approved real-user p75 LCP/INP/CLS and field error telemetry |
| P01-qa-new | 01 | QA-NEW-01/02/03 maintenance gate | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P03-qa-new | 03 | QA-NEW-01/02/03 maintenance gate | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P04-qa-new | 04 | QA-NEW-01/02/03 maintenance gate | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |
| P05-qa-new | 05 | QA-NEW-01/02/03 maintenance gate | BLOCKED — EXTERNAL | Native Khmer copy reviewer / QA owner: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces |

## P01-route-inventory — Route ownership

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: 135 source routes; state coverage incomplete. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Executed factories + AST lazy/shell bindings account for 135 leaves, 62 groups, 63 app/group pairs; 270 desktop/mobile content checks pass.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Route ownership.

Reproduction: source-snapshot.json; route-shell-adoption.json; route-content-sweep command. Required fix / retained contract: Executed factories + AST lazy/shell bindings account for 135 leaves, 62 groups, 63 app/group pairs; 270 desktop/mobile content checks pass.

Tests: source-snapshot.json; route-shell-adoption.json; route-content-sweep command. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-001 — Studio mobile preview

Origin: Phase 01; severity P1; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "admin-template-edit", "routeIds": ["SCOPE-114"], "patterns": ["/templates/:templateId"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Studio mobile preview.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-002 — Studio preview accessible name

Origin: Phase 01; severity P1; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "admin-template-edit", "routeIds": ["SCOPE-114"], "patterns": ["/templates/:templateId"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Studio preview accessible name.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-003 — Studio separator and pointer alternatives

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "admin-template-edit", "routeIds": ["SCOPE-114"], "patterns": ["/templates/:templateId"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Studio separator and pointer alternatives.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-004 — Guest-note contrast

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "public-invitation", "routeIds": ["SCOPE-013", "SCOPE-014"], "patterns": ["/w/:slug", "/i/:slug"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Guest-note contrast.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-005 — Admin subtitle/account badge contrast

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "admin-users", "routeIds": ["SCOPE-117", "SCOPE-128"], "patterns": ["/users", "/admin/users"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Admin subtitle/account badge contrast.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-AU-006 — Admin login footer contrast

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Historical AU defect required current revalidation. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Affected scope: {"group": "auth-login", "routeIds": ["SCOPE-112"], "patterns": ["/login"], "scope": "Current route consumers; named tests specify verified states"}. User impact: Admin login footer contrast.

Reproduction: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Required fix / retained contract: Current real-route legacy AU checks plus Phase 06 Studio/focus and contrast checks retain the corrected contract; live/device mutation certification not implied.

Tests: baseline-phase02-unchanged and final-phase02-unchanged; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-audit-states — Audit state breadth

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Single 390px initial render was too narrow. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Current shell-width observations in both locales/themes, 270 route renders, drawer/history/actions, 404, denied and offline recovery now exercised; denominators are recorded in responsive-focus-results.json.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Audit state breadth.

Reproduction: responsive-focus-results.json; phase06-layout-navigation.spec.js. Required fix / retained contract: Current shell-width observations in both locales/themes, 270 route renders, drawer/history/actions, 404, denied and offline recovery now exercised; denominators are recorded in responsive-focus-results.json.

Tests: responsive-focus-results.json; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-evidence-links — Portable audit evidence

Origin: Phase 01; severity P2; owner Shell / frontend QA.

Old claim: Ignored PNGs cannot be GitHub image embeds. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: New before/after indexes and reproduction scripts identify ignored binaries; history is unchanged and links are checked.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Portable audit evidence.

Reproduction: before-manifest.json; after-manifest.json; capture-diff.json; verify-evidence.py. Required fix / retained contract: New before/after indexes and reproduction scripts identify ignored binaries; history is unchanged and links are checked.

Tests: before-manifest.json; after-manifest.json; capture-diff.json; verify-evidence.py. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P01-full-domain-states — Domain journeys

Origin: Phase 01; severity P2; owner Phase 07–25 route owners.

Old claim: All role/error/empty/live mutation combinations unverified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Initial content smoke covers every leaf; domain-specific exhaustive state journeys retain their primary phase owners.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Domain journeys.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Initial content smoke covers every leaf; domain-specific exhaustive state journeys retain their primary phase owners.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **DEFERRED — DOMAIN OWNER**. Evidence level: DEFERRED — DOMAIN OWNER. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Execute the named domain phase with real route/state fixtures. Related later phase: 07–25.

## P01-devices — Physical phones / in-app clients

Origin: Phase 01; severity P2; owner Device QA.

Old claim: Original audit gate not certified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Browser fixtures do not supply this evidence.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Physical phones / in-app clients.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser fixtures do not supply this evidence.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Run low-end Android, iOS and Telegram/in-app clients against an isolated staging fixture. Next action: Run low-end Android, iOS and Telegram/in-app clients against an isolated staging fixture. Related later phase: 26–27.

## P01-database — MySQL and applied migrations

Origin: Phase 01; severity P2; owner Backend QA.

Old claim: Original audit gate not certified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Browser fixtures do not supply this evidence.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: MySQL and applied migrations.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser fixtures do not supply this evidence.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Provide isolated MySQL fixture; run forward migration and service integration suite; never mutate production. Next action: Provide isolated MySQL fixture; run forward migration and service integration suite; never mutate production. Related later phase: 26–27.

## P01-providers — ABA / Telegram / delivery

Origin: Phase 01; severity P2; owner Payments and service QA.

Old claim: Original audit gate not certified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Browser fixtures do not supply this evidence.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: ABA / Telegram / delivery.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser fixtures do not supply this evidence.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Provide isolated provider sandbox and owned test identities; verify settlement/replay/delivery without real money. Next action: Provide isolated provider sandbox and owned test identities; verify settlement/replay/delivery without real money. Related later phase: 26–27.

## P01-catalog — Dynamic published catalog

Origin: Phase 01; severity P2; owner Catalog owner.

Old claim: Original audit gate not certified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Browser fixtures do not supply this evidence.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Dynamic published catalog.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser fixtures do not supply this evidence.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Provide an isolated authorized catalog and published content dataset. Next action: Provide an isolated authorized catalog and published content dataset. Related later phase: 26–27.

## P01-at-field — Assistive technology / field data

Origin: Phase 01; severity P2; owner Accessibility / operations QA.

Old claim: Original audit gate not certified. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Browser fixtures do not supply this evidence.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Assistive technology / field data.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser fixtures do not supply this evidence.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Record VoiceOver/TalkBack journeys and production RUM through an approved separate release scope. Next action: Record VoiceOver/TalkBack journeys and production RUM through an approved separate release scope. Related later phase: 26–27.

## P03-tokens — Canonical token parity

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: Generated admin mirror must match user canonical source. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Two application exports verified by sync-design-tokens --check; canonical token source unchanged.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Canonical token parity.

Reproduction: final-token-parity; semanticTokens unit tests. Required fix / retained contract: Two application exports verified by sync-design-tokens --check; canonical token source unchanged.

Tests: final-token-parity; semanticTokens unit tests. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-theme — Computed theme and focus

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: Selector/cascade coverage incomplete. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Both stores preserved; six shell contexts checked in EN/KM light/dark; new 404 roles, countdown contrast and accessible label corrected.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Computed theme and focus.

Reproduction: after-shell-probes.json; special-mode-results.json. Required fix / retained contract: Both stores preserved; six shell contexts checked in EN/KM light/dark; new 404 roles, countdown contrast and accessible label corrected.

Tests: after-shell-probes.json; special-mode-results.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-fonts — Local fonts and fallback

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: DM Sans, Kantumruy Pro and Moul needed loading/fallback proof. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: FontFace results explicitly load local DM Sans/Kantumruy Pro/Moul; missing-font and spacing probes retain task reachability.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Local fonts and fallback.

Reproduction: special-mode-results.json. Required fix / retained contract: FontFace results explicitly load local DM Sans/Kantumruy Pro/Moul; missing-font and spacing probes retain task reachability.

Tests: special-mode-results.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-reflow — Spacing / forced colors

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: Only width-equivalent zoom was measured. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Current source breakpoints including 359/360/361 and 479/480/481, text spacing, forced colors, long mixed-script event titles and emulated notch insets now checked.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Spacing / forced colors.

Reproduction: responsive-focus-results.json; special-mode-results.json. Required fix / retained contract: Current source breakpoints including 359/360/361 and 479/480/481, text spacing, forced colors, long mixed-script event titles and emulated notch insets now checked.

Tests: responsive-focus-results.json; special-mode-results.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-form-focus — Theme/locale state retention

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: Focus and typed data were not broadly tested. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Auth typed fields, owner query focus, current event and Studio dirty state survive tested navigation/preferences.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Theme/locale state retention.

Reproduction: final-cross-engine-all; phase06-layout-navigation.spec.js. Required fix / retained contract: Auth typed fields, owner query focus, current event and Studio dirty state survive tested navigation/preferences.

Tests: final-cross-engine-all; phase06-layout-navigation.spec.js. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-registry — Registry identity / aliases

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: All aliases not visually exercised. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: All 38 static keys and ten family identities preserved; literal alias precedence and shared IDs covered by current registry unit suite.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Registry identity / aliases.

Reproduction: renderer-registry.json; user-units-committed. Required fix / retained contract: All 38 static keys and ten family identities preserved; literal alias precedence and shared IDs covered by current registry unit suite.

Tests: renderer-registry.json; user-units-committed. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-fallback — Unknown fallback public screenshot

Origin: Phase 03; severity P2; owner Shell / frontend QA.

Old claim: No public fallback screenshot existed. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Public unknown stable codes intentionally show unavailable; callable DefaultTemplateLayout is an internal useFallback contract, not an active public unknown-code route.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Unknown fallback public screenshot.

Reproduction: registry/templateRegistry.js resolveTemplateRenderer; special-mode-results.json unknown-renderer-boundary. Required fix / retained contract: Public unknown stable codes intentionally show unavailable; callable DefaultTemplateLayout is an internal useFallback contract, not an active public unknown-code route.

Tests: registry/templateRegistry.js resolveTemplateRenderer; special-mode-results.json unknown-renderer-boundary. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — NOT APPLICABLE**. Evidence level: SOURCE-MAPPED / scope proof. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-renderer-parity — Historical renderer pixel variation

Origin: Phase 03; severity P2; owner Template visual owner.

Old claim: Nine representative pairs differed; later phases added other differences. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Current family actions/paint reviewed; moving art and historical unpainted frames are not a universal artwork parity certificate.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Historical renderer pixel variation.

Reproduction: renderer-visibility-review.json; capture-diff.json. Required fix / retained contract: Current family actions/paint reviewed; moving art and historical unpainted frames are not a universal artwork parity certificate.

Tests: renderer-visibility-review.json; capture-diff.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Review original and new PNG pairs with full authored data and devices; preserve per-family artwork. Next action: Review original and new PNG pairs with full authored data and devices; preserve per-family artwork. Related later phase: 10/16.

## P03-font-metadata — Font binary weight metadata

Origin: Phase 03; severity P2; owner Typography QA.

Old claim: fontTools not available in the earlier environment. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Temporary ignored fontTools 4.68 reads binary names, OS/2, variable axes, Khmer sample coverage and local OFL notices without modifying assets.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Font binary weight metadata.

Reproduction: local-font-metadata.json; local-font-metadata command. Required fix / retained contract: Temporary ignored fontTools 4.68 reads binary names, OS/2, variable axes, Khmer sample coverage and local OFL notices without modifying assets.

Tests: local-font-metadata.json; local-font-metadata command. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P03-font-range — Declared and binary weight range

Origin: Phase 03; severity P2; owner Typography / native visual reviewer.

Old claim: CSS ranges had not been compared to binary axes. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: DM Sans binary wght 100–1000, Kantumruy Pro 100–700 and Moul static 400. Shared/studio Kantumruy CSS advertises 100–900; dedicated Silk/Floral already declares 100–700. No binary or authored font styling was replaced.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Declared and binary weight range.

Reproduction: local-font-metadata.json; core-fonts.css; studio-fonts.css. Required fix / retained contract: DM Sans binary wght 100–1000, Kantumruy Pro 100–700 and Moul static 400. Shared/studio Kantumruy CSS advertises 100–900; dedicated Silk/Floral already declares 100–700. No binary or authored font styling was replaced.

Tests: local-font-metadata.json; core-fonts.css; studio-fonts.css. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Review intended synthetic weights above 700 and authored template fidelity before a separate range-normalization change; native glyph approval remains required. Next action: Review intended synthetic weights above 700 and authored template fidelity before a separate range-normalization change; native glyph approval remains required. Related later phase: 10/16/26.

## P03-native-khmer — Native Khmer typography/copy

Origin: Phase 03; severity P2; owner Native Khmer reviewer.

Old claim: No native linguistic/diacritic certification. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Long mixed-script geometry passes; native letterforms and terms remain unapproved.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Native Khmer typography/copy.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Long mixed-script geometry passes; native letterforms and terms remain unapproved.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Review live glyphs, terms, diacritics and error text on Android/iOS. Next action: Review live glyphs, terms, diacritics and error text on Android/iOS. Related later phase: No automatic later implementation authorization.

## P03-native-zoom — Native 200%/400% zoom

Origin: Phase 03; severity P2; owner Desktop accessibility QA / computer-use runtime.

Old claim: CSS width equivalence is not real zoom. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Headed Playwright zoom keys did not change DPR; Windows sky get_window rejected its own returned Chrome handle twice; no native input issued.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Native 200%/400% zoom.

Reproduction: renderer-visibility-review.json zoom; native-zoom-results.json. Required fix / retained contract: Headed Playwright zoom keys did not change DPR; Windows sky get_window rejected its own returned Chrome handle twice; no native input issued.

Tests: renderer-visibility-review.json zoom; native-zoom-results.json. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Repair native window targeting or perform real browser menu zoom at 200/400%, record DPR/viewport and task reachability. Next action: Repair native window targeting or perform real browser menu zoom at 200/400%, record DPR/viewport and task reachability. Related later phase: No automatic later implementation authorization.

## P03-physical — Physical keyboard/safe area/AT

Origin: Phase 03; severity P2; owner Device / accessibility QA.

Old claim: Not tested on devices. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: CDP safe-area/forced-color tests are browser emulation only.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Physical keyboard/safe area/AT.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: CDP safe-area/forced-color tests are browser emulation only.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Run physical keyboard, dynamic bars, screen reader and OS text scaling matrix. Next action: Run physical keyboard, dynamic bars, screen reader and OS text scaling matrix. Related later phase: No automatic later implementation authorization.

## P03-catalog-field — Live catalog and production CWV

Origin: Phase 03; severity P2; owner Catalog / operations owner.

Old claim: No isolated dataset/field sample. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Fixture art and lab timing cannot certify live published parity or p75.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Live catalog and production CWV.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Fixture art and lab timing cannot certify live published parity or p75.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Provide approved isolated authored catalog and field telemetry. Next action: Provide approved isolated authored catalog and field telemetry. Related later phase: 10/16/26.

## P03-studio-font-catalog — Remote Studio font picker

Origin: Phase 03; severity P2; owner Phase 25 owner.

Old claim: Broad remote font catalog remains. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Retained existing feature and licenses; local management fonts load independently.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Remote Studio font picker.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Retained existing feature and licenses; local management fonts load independently.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **DEFERRED — DOMAIN OWNER**. Evidence level: DEFERRED — DOMAIN OWNER. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Review route-scoped font catalog loading without removing picker choices. Related later phase: 25.

## P04-consumers — Resolved component consumer graph

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: 46 component entries only had textual import candidates. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: AST imports + expanded lazy route bindings now map all 46 entries to direct, transitive and route consumers.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Resolved component consumer graph.

Reproduction: shell-consumer-graph.json; module-graph.json; route-shell-adoption.json. Required fix / retained contract: AST imports + expanded lazy route bindings now map all 46 entries to direct, transitive and route consumers.

Tests: shell-consumer-graph.json; module-graph.json; route-shell-adoption.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-modal — Existing modal stack/inert/Escape/restore

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Existing modal stack/inert/Escape/restore.

Reproduction: Modal.test.jsx; EventWorkspace tests; real event drawer paths. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: Modal.test.jsx; EventWorkspace tests; real event drawer paths. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-actions — LoadingButton busy/disabled and ActionButton submit semantics

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: LoadingButton busy/disabled and ActionButton submit semantics.

Reproduction: Full sharedUi/AdminUI suites; phase04 admin report refresh. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: Full sharedUi/AdminUI suites; phase04 admin report refresh. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-table — Named table keyboard scroll

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Named table keyboard scroll.

Reproduction: ResponsiveTable unit; unchanged Phase 04 table test passed 20/20 focused repeats after scoped key handling. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: ResponsiveTable unit; unchanged Phase 04 table test passed 20/20 focused repeats after scoped key handling. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-fields — Form descriptions/search clear state

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Form descriptions/search clear state.

Reproduction: FormField/sharedUi suites and actual guests/RSVP/organization consumers. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: FormField/sharedUi suites and actual guests/RSVP/organization consumers. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-toast-status — Persistent error toast and authoritative status labels

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Persistent error toast and authoritative status labels.

Reproduction: AdminUI/Toast suites; full route smoke; no payment state source change. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: AdminUI/Toast suites; full route smoke; no payment state source change. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-shell-menus — Public/owner/admin drawer semantics

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Public/owner/admin drawer semantics.

Reproduction: phase06-layout-navigation.spec.js; 132 cross-engine cases. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: phase06-layout-navigation.spec.js; 132 cross-engine cases. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-studio — All five Studio sections and reachability

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: Shared contract required broader real consumer proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: All five Studio sections and reachability.

Reproduction: Three landscape sizes, dirty value retention, keyboard resizer, trusted preview link; CDP notch regression fixed. Required fix / retained contract: Existing API retained and tested; narrow shell fixes supply the named evidence without a second focus manager.

Tests: Three landscape sizes, dirty value retention, keyboard resizer, trusted preview link; CDP notch regression fixed. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-unused — Unused FilterTabs / DataTable

Origin: Phase 04; severity P2; owner Shell / frontend QA.

Old claim: No production consumer found. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Current source search finds only declarations; AST module graph does not invent function adoption.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Unused FilterTabs / DataTable.

Reproduction: AdminUI.jsx declarations; shell-consumer-graph.json. Required fix / retained contract: Current source search finds only declarations; AST module graph does not invent function adoption.

Tests: AdminUI.jsx declarations; shell-consumer-graph.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — NOT APPLICABLE**. Evidence level: SOURCE-MAPPED / scope proof. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P04-specialized — Specialized media/chart/export/selection variants

Origin: Phase 04; severity P2; owner Named Phase 07–25 route owners.

Old claim: 97 leaves lacked direct primitive adoption proof. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Every route is accountable; media, print, charts, route-specific selection/pagination variants remain domain work, not completed by shared shell styles.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Specialized media/chart/export/selection variants.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Every route is accountable; media, print, charts, route-specific selection/pagination variants remain domain work, not completed by shared shell styles.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **DEFERRED — DOMAIN OWNER**. Evidence level: DEFERRED — DOMAIN OWNER. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Execute the named domain phase with real route/state fixtures. Related later phase: 07–25.

## P04-all-variants — All primitive permutations

Origin: Phase 04; severity P2; owner Component / domain QA.

Old claim: Complete disabled/busy/error/denied/offline matrix unproven. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Named shared contracts pass; exhaustive specialized state permutations are not claimed.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: All primitive permutations.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Named shared contracts pass; exhaustive specialized state permutations are not claimed.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Use the 46-entry resolved consumer register to exercise remaining genuine route-specific variants. Next action: Use the 46-entry resolved consumer register to exercise remaining genuine route-specific variants. Related later phase: 07–25/26.

## P04-native — AT and physical interaction

Origin: Phase 04; severity P2; owner Accessibility / device QA.

Old claim: No actual screen-reader/device review. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Browser focus and axe checks cannot supply AT pronunciation/touch certification.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: AT and physical interaction.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Browser focus and axe checks cannot supply AT pronunciation/touch certification.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Record VoiceOver/TalkBack and physical touch/keyboard flows. Next action: Record VoiceOver/TalkBack and physical touch/keyboard flows. Related later phase: 26.

## P05-policy — Canonical motion and task immediacy

Origin: Phase 05; severity P2; owner Shell / frontend QA.

Old claim: Tokens/route curtain/admin operational values needed revalidation. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Current tokens and source graph retain restrained management policy; shared Skip is silent; operational values do not wait for count-up.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Canonical motion and task immediacy.

Reproduction: final-source-graph; phase05-motion.spec.js; full unit suites. Required fix / retained contract: Current tokens and source graph retain restrained management policy; shared Skip is silent; operational values do not wait for count-up.

Tests: final-source-graph; phase05-motion.spec.js; full unit suites. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P05-drawer — Owner offscreen menu focus

Origin: Phase 05; severity P2; owner Shell / frontend QA.

Old claim: Transform/inert existed but background and dismissal proof incomplete. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Native modality excludes background; closed DOM remains inert; Escape, backdrop, route/history, desktop resize and focus return pass.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Owner offscreen menu focus.

Reproduction: phase06-layout-navigation.spec.js; final-cross-engine-all. Required fix / retained contract: Native modality excludes background; closed DOM remains inert; Escape, backdrop, route/history, desktop resize and focus return pass.

Tests: phase06-layout-navigation.spec.js; final-cross-engine-all. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P05-visibility — Silk desktop / Emerald mobile paint

Origin: Phase 05; severity P2; owner Shell / frontend QA.

Old claim: Unpainted Silk and missing Emerald action text. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Current normal/reduced loaded/missing-media headed cases show painted, named, hit-testable actions and completed transitions; no renderer reskin or source fix required.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Silk desktop / Emerald mobile paint.

Reproduction: renderer-visibility-review.json; headed PNG paths in each row. Required fix / retained contract: Current normal/reduced loaded/missing-media headed cases show painted, named, hit-testable actions and completed transitions; no renderer reskin or source fix required.

Tests: renderer-visibility-review.json; headed PNG paths in each row. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P05-families — Ten family action/boundary review

Origin: Phase 05; severity P2; owner Shell / frontend QA.

Old claim: Only initial captures existed. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Ten dedicated families receive current semantic/paint/action checks; Boilerplate starts open by design, map destination is checked without contacting provider.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Ten family action/boundary review.

Reproduction: renderer-visibility-review.json; registry unit suite. Required fix / retained contract: Ten dedicated families receive current semantic/paint/action checks; Boilerplate starts open by design, map destination is checked without contacting provider.

Tests: renderer-visibility-review.json; registry unit suite. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P05-payload — Final build inventory

Origin: Phase 05; severity P2; owner Shell / frontend QA.

Old claim: Prior lab predated final Phase 05 CSS. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Fresh before/after build hashes and initial request bytes are measured separately after final Phase 06 code.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Final build inventory.

Reproduction: final-build-assets.json; performance-comparison.json. Required fix / retained contract: Fresh before/after build hashes and initial request bytes are measured separately after final Phase 06 code.

Tests: final-build-assets.json; performance-comparison.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **CLOSED — VERIFIED**. Evidence level: FIXTURE VERIFIED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Keep regression coverage. Related later phase: No automatic later implementation authorization.

## P05-timings — Six condition groups / seven metric triggers

Origin: Phase 05; severity P2; owner Performance QA.

Old claim: Prior timing review unresolved. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Fresh cache-valid comparison records three-sample medians/ranges and LCP identities across 104 condition groups; historical groups are explicitly revisited. Diagnostic triggers are kept open for causal review.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Six condition groups / seven metric triggers.

Reproduction: performance-comparison.json; lab-summary.json. Required fix / retained contract: Fresh cache-valid comparison records three-sample medians/ranges and LCP identities across 104 condition groups; historical groups are explicitly revisited. Diagnostic triggers are kept open for causal review.

Tests: performance-comparison.json; lab-summary.json. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Inspect current diagnostic triggers and repeat affected matched conditions; isolate capture/fixture variance from source-caused change before approval. Next action: Inspect current diagnostic triggers and repeat affected matched conditions; isolate capture/fixture variance from source-caused change before approval. Related later phase: No automatic later implementation authorization.

## P05-concurrency — Default worker instability / origin

Origin: Phase 05; severity P2; owner QA / CI host owner.

Old claim: Preview origin mismatch and stalled lazy requests. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Origins are aligned and controlled checks pass. Final default-10 attempts produced 62/68 and 61/68; monitored run peaked at 97% CPU, under 865 MiB free physical memory and 75 headless processes. Native table keys were hardened and the unchanged table test then passed 20/20; Studio passed 10/10 focused repeats. Remaining varied 30-second timeouts retain host/runner review.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Default worker instability / origin.

Reproduction: concurrency-host-metrics.json; post-final-default-concurrency; post-table-default-68; table-key-old-contract-repeat; focused-old-studio-repeat. Required fix / retained contract: Origins are aligned and controlled checks pass. Final default-10 attempts produced 62/68 and 61/68; monitored run peaked at 97% CPU, under 865 MiB free physical memory and 75 headless processes. Native table keys were hardened and the unchanged table test then passed 20/20; Studio passed 10/10 focused repeats. Remaining varied 30-second timeouts retain host/runner review.

Tests: concurrency-host-metrics.json; post-final-default-concurrency; post-table-default-68; table-key-old-contract-repeat; focused-old-studio-repeat. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Repeat identical final-SHA default matrix on an isolated adequately resourced runner, correlate trace action timing with host resources; keep the explicit two-worker comparator and unchanged default configuration. Next action: Repeat identical final-SHA default matrix on an isolated adequately resourced runner, correlate trace action timing with host resources; keep the explicit two-worker comparator and unchanged default configuration. Related later phase: 26/27.

## P05-historical-cause — Old paint root cause

Origin: Phase 05; severity P2; owner Renderer / visual QA.

Old claim: Headless paint nondeterminism suspected. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Current headed/semantic proof does not prove why historical unseen frames were blank.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Old paint root cause.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Current headed/semantic proof does not prove why historical unseen frames were blank.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **REVIEW REQUIRED**. Evidence level: REVIEW REQUIRED. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Inspect original problematic PNG/trace frames on devices with complete authored DTO/media. Next action: Inspect original problematic PNG/trace frames on devices with complete authored DTO/media. Related later phase: 10/16.

## P05-media-consent — Dedicated family full guest/media journeys

Origin: Phase 05; severity P2; owner Phase 10/16 owner.

Old claim: Audio denial, map/calendar/RSVP and cancellation not all certified. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Shared gate/Skip tests retained; full per-family authored guest journey is separately owned.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Dedicated family full guest/media journeys.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Shared gate/Skip tests retained; full per-family authored guest journey is separately owned.

Tests: Not claimed beyond source evidence. Visual/trace: Portable before-manifest.json / after-manifest.json / renderer-visibility-review.json and exact QA command logs identify local screenshots/traces. Unit-only proof is named in tests; no extra screenshot is invented..

Disposition: **DEFERRED — DOMAIN OWNER**. Evidence level: DEFERRED — DOMAIN OWNER. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: None for this bounded disposition. Next action: Execute the named domain phase with real route/state fixtures. Related later phase: 10/16.

## P05-devices-at — Low-end phones / assistive technology

Origin: Phase 05; severity P2; owner Device / accessibility QA.

Old claim: Physical frames/AT not certified. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Local frame/navigation profiles and emulated browsers are not physical GPU/AT proof.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Low-end phones / assistive technology.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: Local frame/navigation profiles and emulated browsers are not physical GPU/AT proof.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Profile real low-end Android/iOS and screen readers with explicit media consent. Next action: Profile real low-end Android/iOS and screen readers with explicit media consent. Related later phase: No automatic later implementation authorization.

## P05-field — Field p75 CWV / INP

Origin: Phase 05; severity P2; owner Operations / performance QA.

Old claim: No field/real network INP. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: No field INP measured; local interactions are separately labeled lab samples.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: Field p75 CWV / INP.

Reproduction: See exact command ledger and named evidence script. Required fix / retained contract: No field INP measured; local interactions are separately labeled lab samples.

Tests: Not claimed beyond source evidence. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Collect approved real-user p75 LCP/INP/CLS and field error telemetry. Next action: Collect approved real-user p75 LCP/INP/CLS and field error telemetry. Related later phase: 26/27.

## P01-qa-new — QA-NEW-01/02/03 maintenance gate

Origin: Phase 01; severity P2; owner Native Khmer copy reviewer / QA owner.

Old claim: Old suite has three unsuitable assertion types in two projects. [Original evidence](../../audits/ultimate-uxui-phase01-2026-11-11/15-evidence-index-and-limitations.md).

Present behavior: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: QA-NEW-01/02/03 maintenance gate.

Reproduction: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Required fix / retained contract: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Tests: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Next action: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Related later phase: 11/25.

## P03-qa-new — QA-NEW-01/02/03 maintenance gate

Origin: Phase 03; severity P2; owner Native Khmer copy reviewer / QA owner.

Old claim: Old suite has three unsuitable assertion types in two projects. [Original evidence](../phase03-canonical-visual-system-2026-11-11/14-open-gates-decisions-and-limitations.md).

Present behavior: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: QA-NEW-01/02/03 maintenance gate.

Reproduction: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Required fix / retained contract: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Tests: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Next action: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Related later phase: 11/25.

## P04-qa-new — QA-NEW-01/02/03 maintenance gate

Origin: Phase 04; severity P2; owner Native Khmer copy reviewer / QA owner.

Old claim: Old suite has three unsuitable assertion types in two projects. [Original evidence](../phase04-reusable-component-system-2026-11-11/16-open-gates-and-deferrals.md).

Present behavior: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: QA-NEW-01/02/03 maintenance gate.

Reproduction: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Required fix / retained contract: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Tests: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Next action: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Related later phase: 11/25.

## P05-qa-new — QA-NEW-01/02/03 maintenance gate

Origin: Phase 05; severity P2; owner Native Khmer copy reviewer / QA owner.

Old claim: Old suite has three unsuitable assertion types in two projects. [Original evidence](../phase05-motion-interaction-platform-2026-11-11/17-open-gates-decisions-and-remaining-verification.md).

Present behavior: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Affected scope: See route-shell-adoption.json for complete consumers and route groups. User impact: QA-NEW-01/02/03 maintenance gate.

Reproduction: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Required fix / retained contract: Original file remains unchanged; current wizard term and trusted preview name tested behaviorally; stronger landscape contract added separately; copy/QA approval is absent.

Tests: 12-qa-new-01-to-03-and-browser-instability.md; baseline/final phase02 logs. Visual/trace: NOT TESTED for this external gate; no device/provider/native certificate image claimed.

Disposition: **BLOCKED — EXTERNAL**. Evidence level: BLOCKED — EXTERNAL. Verified source: `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8`.

Blocker: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Next action: Approve current Khmer terms and the replacement reachability contract, then make a distinct maintenance patch; retain original red traces. Related later phase: 11/25.
