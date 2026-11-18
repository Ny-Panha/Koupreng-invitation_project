# Phase 06 — global layout, navigation and responsive platform

**Implementation delivered; overall phase PARTIALLY COMPLETE for the explicit review and external/manual gates.** All repository-feasible reproduced shell defects were fixed, with the test/harness failures and remaining review questions retained. Phases 01/03/04/05 retain their own partial status; Phase 02 remains COMPLETE as an architecture specification. Phases 07–27 are not implemented by this change.

Execution dates: **17–18 November 2026 (Asia/Bangkok)**. The dated directory retains its 17 November start. Starting `main` `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4` matched fetched `origin/main`. Production changes are fixed at `3a02004430519ea4b9dc782821aacb4207b0b8b9`; report generation observed `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8` on `main`. Remote remains `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`. Local commits only; no push, PR, deployment or production mutation.

The shipped changes give public/owner/admin menus consistent focus return, isolate the owner drawer with native modality, preserve search/typed data during preferences and route changes, restore public Back scroll, add authorized event/admin breadcrumbs, retain all Studio sections and dirty state in short landscape, respect emulated safe areas, improve auth appearance/reflow, and make both 404s readable in light/dark. New renderer artwork, dependencies and backend behavior are absent.

* Current inventory: **135 leaves = 111 customer + 24 admin**, **62 named groups / 63 app-group pairs**, zero unassigned leaves; ten dedicated renderer families, 38 static keys, two shared IDs and the callable internal fallback preserved.
* Current proof: full suites **1,494 customer / 202 admin** pass; complete route content sweep **270/270**; navigation matrix **132/132** across six projects; controlled Phase 04/05/06 **68/68**. Default ten-worker attempts returned **62 pass / 6 fail** and **61 pass / 7 fail** and remain REVIEW REQUIRED for host capacity. The final suite has 22 Phase 06 cases. See exact stages in [QA](16-exact-tests-commands-and-results.md).
* Responsive evidence: **576** shell-width/locale/theme observations, **0** horizontal clipped-control rows; **12** selected axe scans, **0** rule findings. Special modes: **32/32** verified. Renderer review: **52/52** current semantic/action observations, including headed Silk/Emerald.
* Performance: **624** controlled navigation samples; actual HTTP cache hits and initial request bytes are recorded. See [performance](15-performance-motion-and-payload-remeasurement.md). No field INP measured.
* Original Phase 02 suite remains **26 pass / 6 known fail**: two Khmer exact-copy contracts and one impossible short-landscape iframe ratio in each project. No old assertion was weakened.

| Phase | Closed verified | Closed N/A | Review | Blocked | Deferred | Status |
|---|---:|---:|---:|---:|---:|---|
| 01 | 9 | 0 | 0 | 6 | 1 | PARTIALLY COMPLETE |
| 03 | 7 | 1 | 2 | 5 | 1 | PARTIALLY COMPLETE |
| 04 | 8 | 1 | 1 | 2 | 1 | PARTIALLY COMPLETE |
| 05 | 5 | 0 | 3 | 3 | 1 | PARTIALLY COMPLETE |


Physical Android/iOS/in-app clients, VoiceOver/TalkBack, native Khmer linguistic/diacritic review, native 200%/400% browser zoom, isolated MySQL/provider/catalog certification and field p75 CWV remain unverified. A browser fixture or zero axe result is not a universal WCAG certificate.

Start with [source](01-source-reconciliation-and-baseline.md), [complete inventory](02-entire-project-shell-and-navigation-inventory.md), [carryover closure](11-cross-phase-carryover-closure-register.md), [open gates](18-open-gates-ownership-and-phase-status.md), [rollback](17-changed-files-security-preservation-and-rollback.md) and the [Phase 07 handoff](19-phase07-marketing-experience-execution-handoff.md). Evidence JSON and reproducible scripts are in [evidence](evidence/). Full binaries are local, ignored `output/playwright/uxui-phase06-2026-11-17/`; no unseen PNG is presented as a GitHub embed.
