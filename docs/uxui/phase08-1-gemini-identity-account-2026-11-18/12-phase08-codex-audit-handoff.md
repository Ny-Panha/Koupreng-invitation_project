# 12 — Phase 08 Codex Audit Handoff

## Independent Audit Guide for Codex (Phase 08)

**Target:** Codex Independent Reviewer  
**Subject:** KoupReng Phase 08 Identity, Authentication, Recovery, Profile & Account Lifecycle  
**Handoff Source:** Gemini Phase 08.1 Delivery Package  

---

### 1. Audit Starting Position
- **Branch:** `main`
- **Baseline Commit:** `2429b76545b683fad2a0a6f328bee3264875edc3`
- **Worktree State:** Preserved uncommitted changes from Phase 07 and Phase 06; all Phase 08.1 edits remain unstaged and uncommitted.
- **Rollback Patch:** `output/playwright/uxui-phase08-1-2026-11-18/phase07-preserved.patch` contains the clean baseline diff of preexisting Phase 07 changes prior to Phase 08.1.

---

### 2. Primary Verification Commands to Run

```bash
# 1. Verify token consistency & linting
node scripts/sync-design-tokens.cjs --check
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint

# 2. Run the full Auth domain unit suite (9 test files, 63 tests)
npm --prefix apps/frontend-user test -- src/features/auth/ --run

# 3. Run the full frontend user unit suite (224 files, 1525 tests)
npm --prefix apps/frontend-user test -- --run

# 4. Run the full frontend admin unit suite (37 files, 202 tests)
npm --prefix apps/frontend-admin test -- --run

# 5. Run the dedicated Phase 08 Playwright E2E suite (18 tests across desktop and mobile chromium)
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line

# 6. Verify production build sanity
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
```

---

### 3. Key Architectural Focus Areas for Auditor
1. **Password Visibility & Focus Retention:**
   - Verify that clicking the show/hide password toggle does not steal focus or blur the input field (tested via `onMouseDown={(e) => e.preventDefault()}`).
   - Verify `aria-label` and `aria-pressed` announcements.
2. **5-Rule Password Checklist in Registration:**
   - Verify real-time criteria evaluation against length (8-100), uppercase, lowercase, and digit rules.
   - Verify that live password matching indicator handles matching and mismatching states correctly.
3. **Recovery Discrepancy (Phone vs. Email):**
   - Confirm that `/forgot-password` displays the `.auth-recovery-hint` card clarifying how phone-registered accounts can recover access.
   - Confirm privacy-neutral confirmation state.
4. **Theme Parity:**
   - Inspect `/app/profile` and `/app/change-password` in both light mode and dark mode (`:root[data-color-mode="dark"]`). Confirm zero inline `<style>` injections and complete `--ui-theme-*` token coverage.
5. **Session Guard UX:**
   - Verify that `RequireAuth` renders the new `.auth-session-error-container` card with retry and back-to-login actions when `authStatus === "error"`.

---

### 4. Non-Functional & External Gates (Expected: REVIEW REQUIRED / BLOCKED)
- **External SMS / Telegram Gateway:** Live SMS OTP delivery or direct Telegram bot webhook ingestion requires live API secrets and infrastructure (`BLOCKED — EXTERNAL`).
- **Live ABA PayWay Gateway:** Unchanged (`BLOCKED — EXTERNAL`).
- **Native Khmer Proofreading:** Khmer translations follow canonical terminology; final approval by native Khmer speaker remains `REVIEW REQUIRED`.
