# Release readiness

Royal Garden now has an ornate cover → curtain → authorized video or portrait montage → formal document → venue/program → manually explored gallery → countdown/calendar → gift → RSVP → private wishes → closing journey. The existing section-order system controls authored information order; the reference order is the new marketing sample only.

Reused: canonical wedding data, cover resolver, scene hook, protected-media provider, audio, shared Modal, calendar/ICS, program, illustrated map/designer, public RSVP and gift components. Added: a small curtain presentation component, optional palette filter, original velvet/gold assets, presentation settings, tests and evidence. Backend authorization, entitlements, guest scoping, USD/KHR gift separation, privacy and Flyway migrations were not changed.

Automated checks and local browser evidence support the implementation. [QA results](08-qa-results.md), [performance limits](07-performance.md), and [remaining visual differences](09-reference-comparisons.md) delimit what was verified. No production deployment was performed. A literal 100% reference match still requires human comparison and approval; it would also conflict with retaining actual wedding data and the project's existing security/features.

Base commit: `2bc854ab` on `main`, matching `origin/main` at initial fetch. Implementation and evidence are delivered as focused commits; final commit identifiers and push status are reported in the task delivery message. No feature branch, PR, force-push or production deployment is part of this change.

Verified implementation commit: `b8b14162c526e351292e3e06c40806bad1a4f87a` (`feat(templates): add Royal Garden heritage curtain journey`). The following documentation commit adds the actual reference/comparison screenshots, reproducible extraction scripts, exact asset prompts and check logs. The final full unit suite has 1,387 passing tests; the two full browser sweeps have 42 passing / 4 explicitly skipped cases, and the final capture/replay checks also pass.
