# Changed files, preservation and rollback

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

[Attribution ledger](evidence/attributed-changes.json) lists Gemini starting hashes, Codex current hashes, ownership and exact paths. [Source preservation](evidence/source-preservation.json) checks all original Gemini report hashes and protected categories. Production changes are marketing JSX/CSS/metadata and one duplicate title-writer removal; no route factory, auth/payment API, data migration, dependency or template art/registry changed.

The original venue unit test was changed only to mount the real optional-id route; all its original assertions remain. New browser tests cover stronger actual-route behavior. Original Phase02/04/05/06 E2E files are unchanged. New metadata tests prove canonical updates and restoration on unmount.

Rollback is **reviewable, per-file/per-hunk**, not a reset: preserve current later work first; inspect `output/phase07-codex-2026-11-18/codex-only.patch` against the recorded starting hashes; apply only approved reverse hunks to attributed paths. Inspect new files individually and their consumers before any removal. Retain Gemini's starting files, all 13 Phase06 commits and original reports. Do not run Gemini's blanket checkout/remove recipe. No rollback has been executed. No commit/push/deploy occurred.
