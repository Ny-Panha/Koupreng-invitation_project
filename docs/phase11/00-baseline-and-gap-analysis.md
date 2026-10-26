# Phase 11 baseline - 26 October 2026

Initial checkout: clean `main`, HEAD and fetched origin/main `17484e58bba7b211b4ec62a7025a4adde992f20a`. Post-Phase-10 changes: `cab82502` security merge, `17484e58` source refactor. Work is isolated on `feat/phase11-bilingual-design` at `D:/Koupreng-Phase11-worktree`; the user's checkout is preserved.

Read `.agents/ROUTER.md`, `CODEX.md`, Premium UX, backend standards and QA skills, Phase 10 final report/testing/registry, and the supplied Phase 11 prompt. All four reference screenshots were visible in the conversation. They inform information hierarchy only; no personal details, art or geography were copied. The external Phase 10 ZIP was not supplied as a filesystem attachment; current `docs/phase10` and source are the available evidence.

Untouched user baseline: `npm --prefix apps/frontend-user test` -> 134 files / 926 tests passed, 44.20s. Happy DOM reports disabled iframe/stylesheet requests. Untouched backend command selected singular test names that do not exist, so only `ArchitectureRulesTests` actually ran: 5 passed, 21.064s total Maven execution. The corrected post-change selection is recorded separately; historic Phase 10 counts are not Phase 11 results.

P0 reproduced: the original InvitationForm activeLangTab only changes pill state; both preset branches call update on the same message fields. The root-cause component test was run against the original HEAD source and failed at the first EN empty-value assertion, then passed with the implementation. The existing public feature passes languageMode but has no visitor-selected authored-version switch. Existing schedule titleEn/descriptionEn and programDays already represent separate translations and must stay canonical.

Storage/flow: InvitationForm form -> contentJson/designJson -> one-writer useStudioPersistence -> InvitationService.applyRequest -> InvitationContentPolicy -> invitation JSON columns -> publicResponse -> publicInvitationToDraft -> draftToTemplate -> TemplateExperience -> dedicated renderer. Ownership/collaboration precedes content mutation; expectedUpdatedAt provides row-locked conflict checks. Public access checks precede DTO assembly. Roles do not confer paid benefits. No SQL migration is necessary for additive JSON.

Main gaps: destructive language editing; untranslated guest labels/fallbacks; incomplete-English leakage; locale omission by old replacement clients; optional blank text rehydration; renderer-specific family layout; absent Premium diagram editor and separate monogram authority. Publication and paid design work stay gated on verified integrity.

Concurrent main reconciliation: origin/main advanced to `0f0b4cb8c3d3722acdbc9688fe571c3be0e73ef1`. The feature branch fast-forwarded safely without overwriting its changes. Obsolete package assets deleted upstream remain deleted; still-required OpenAPI and token consumers were relocated. The original checkout contains two unrelated untracked user maintenance/QA scripts, left untouched.

Verified current runtime: Java 25 / Spring Boot 4.1.1, React 19.3.1, Vite 8.3.5. Current source outranks the historical stack versions in AGENTS.md.
