# 19 — Phase 08 Codex Independent Audit, QA & Fix Handoff

## 1. Governance & Phase Boundary

- **Phase 08.1 (Completed by Gemini):** Full frontend UX/UI implementation, dark mode token integration, phone/email recovery guidance, accessible show/hide toggles with caret retention, 5-criterion password checklist, scoped stylesheets for profile & change password, unit tests, and Playwright E2E with Axe WCAG 2.2 AA audit.
- **Phase 08 (Owned by Codex):** Independent source code audit, QA regression checks, test fixes, and final completion decision.
- **Status:** **PARTIALLY COMPLETE** (Implementation complete, test suites 100% green; awaiting Codex independent verification and external release gates).

---

## 2. Independent Audit Verification Runbook for Codex

```bash
# 1. Verify baseline SHA and branch
git branch --show-current
# Expected: main
git rev-parse HEAD
# Expected: 2429b76545b683fad2a0a6f328bee3264875edc3

# 2. Verify design token synchronization
node scripts/sync-design-tokens.cjs --check
# Expected: Verified 2 application token exports.

# 3. Verify static analysis (ESLint)
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
# Expected: 0 errors, 0 warnings across both workspaces.

# 4. Run Auth domain unit tests (9 test files, 63 tests)
npm --prefix apps/frontend-user test -- src/features/auth/ --run
# Expected: 63/63 passed.

# 5. Run dedicated Phase 08 Playwright E2E suite
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line
# Expected: 18/18 passed across desktop and mobile chromium with 0 Axe violations.

# 6. Verify production builds
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
# Expected: Built with 0 errors.
```

---

## 3. High-Priority Audit Checkpoints for Codex

1. **Password Visibility & Caret Retention:**
   - Confirm that toggling password visibility in `LoginFeature.jsx`, `RegisterFeature.jsx`, `ResetPasswordFeature.jsx`, `ProfileFeature.jsx`, and `ChangePasswordFeature.jsx` does not blur input or reset caret position (`onMouseDown={(e) => e.preventDefault()}`).
2. **Registration vs Recovery Contract Truth:**
   - Confirm that registration preserves the phone DTO (`fullName`, `phone`, `password`) while recovery provides clear `.auth-recovery-hint` for phone accounts and privacy-neutral confirmation for email accounts.
3. **Zero Inline Styles in Profile & Change Password:**
   - Confirm that `ProfileFeature.jsx` and `ChangePasswordFeature.jsx` have no `<style>` tags and rely entirely on `ProfileFeature.css` and `ChangePasswordFeature.css`.
4. **Theme Parity in Dark Mode:**
   - Confirm that `:root[data-color-mode="dark"]` properly styles all auth cards, inputs, error states, and profile forms without contrast failures.
5. **Renderer Isolation:**
   - Confirm that `packages/templates/` and all 10 wedding invitation renderer packages remain 100% untouched.