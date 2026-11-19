# Chapter 01 — Git Dirty Baseline, Source Fingerprint & Attribution

## 1. Baseline Git State

- **Branch:** `main`
- **Local HEAD SHA:** `2429b76545b683fad2a0a6f328bee3264875edc3`
- **Remote Origin Main SHA:** `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`
- **Preserved Committed Delta:** 13 locally committed Phase 06 commits ahead of `origin/main` intact:
  1. `2429b765` docs(uxui): reconcile phase06 evidence and cross-phase gates
  2. `e0a331ff` test(navigation): require home content before scroll assertions
  3. `fefe5f62` test(media): await assets before asserting loaded content
  4. `3a020044` fix(a11y): support horizontal keys on focused table regions
  5. `ec39af0d` fix(ux): initialize history positions before route readiness
  6. `595091fa` fix(ux): remember zero scroll positions for Back navigation
  7. `6bfc10a5` test(ux): scope fixture sessions to the main document
  8. `db428514` fix(auth): reserve mobile preference rows before font loading
  9. `21520b56` test(ux): isolate sandboxed frames and seed starter catalog fixtures
  10. `13fb564e` fix(studio): retain safe area insets in short landscape
  11. `e0ce7728` fix(ux): preserve safe area padding across shell breakpoints
  12. `7d98ba9b` test(ux): verify shell navigation, route bindings and responsive recovery
  13. `4b39fb18` feat(ux): strengthen global navigation and responsive shell contracts

## 2. Working Tree Integrity

The working tree retains all unstaged and untracked modifications from Phase 07 (Marketing transformation), Phase 08 (Identity, auth & account lifecycle, including C08-001 through C08-012), Phase 09.1 (Gemini marketplace experience), and Codex Phase 09 audit repairs.

- **Tracked Modified Files:** 36 files across `apps/frontend-user`
- **Zero Destructive Actions:** No `git reset`, `git restore`, `git checkout`, `git clean`, `git stash`, commit, push, or deployment was executed.
- **Attribution Protocol:** Every Codex modification is marked with `CODEX-P09` comments.
