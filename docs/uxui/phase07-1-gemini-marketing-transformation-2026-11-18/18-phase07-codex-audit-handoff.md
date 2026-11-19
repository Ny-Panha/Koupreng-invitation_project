# Phase 07.1 &rarr; Phase 07 Codex Audit Handoff Protocol

## 1. Governance & Phase Division of Responsibility

- **Phase 07.1 (Completed by Gemini):** Implementation of public marketing visual transformation, dark mode token cascade, CSS extraction on `/venues`, contact form feedback, single H1 hierarchy, and marketing regression tests. Status: **PARTIALLY COMPLETE** pending independent Codex verification.
- **Phase 07 (Owned by Codex):** Independent source code audit, rigorous verification, edge-case regression validation, and final phase sign-off.
- **Explicit Invariant:** Gemini's self-review does **not** substitute for Codex's independent audit.

---

## 2. Independent Audit Verification Runbook for Codex

Codex must execute the following commands to confirm implementation integrity:

```bash
# 1. Verify Baseline & Branch State
git branch --show-current
# Expected: main
git rev-parse HEAD
# Expected: 2429b76545b683fad2a0a6f328bee3264875edc3 (or local commit if authorized)

# 2. Verify Design Token Synchronization
node scripts/sync-design-tokens.cjs --check
# Expected: Verified 2 application token exports.

# 3. Verify Route Inventories
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx
# Expected: All route parity tests PASS.

# 4. Verify Marketing Test Suite
npm --prefix apps/frontend-user test -- src/features/marketing/
# Expected: 7 test files, 41 tests pass (including Phase07Marketing.test.jsx).

# 5. Verify Static Analysis
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
# Expected: 0 errors, 0 warnings across both workspaces.

# 6. Verify Production Builds
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
# Expected: Both builds pass cleanly. Check that VenuesPage-*.css is emitted (~8.38 kB).

# 7. Run E2E Test Verification
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js --reporter=line --workers=2
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase05-motion.spec.js --reporter=line --workers=2
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase06-layout-navigation.spec.js --reporter=line --workers=2
# Expected: Phase 04 passes (10/10); Phase 05 passes (14/14); Phase 06 passes 36/44 (8 Studio landscape baseline carryovers).
```

---

## 3. High-Priority Audit Checkpoints for Codex

1. **Zero Inline Styles in Marketing Pages:**
   - Verify that `apps/frontend-user/src/features/marketing/VenuesFeature.jsx` does not contain `<style>` tags.
2. **Dark Mode Toggle Integrity:**
   - Verify `:root[data-color-mode="dark"]` transforms surfaces, borders, text, inputs, and modals cleanly without contrast failures.
3. **Invitation Renderer Quarantine:**
   - Confirm that packages in `packages/templates/` and `apps/frontend-user/src/features/templates/` have zero git modifications.
4. **Accessible Dialog Traps:**
   - Test both mobile header drawer (`#nav-menu`) and venue modal (`#venue-dialog`) for keyboard tab traps and clean `Escape` key dismissal.
