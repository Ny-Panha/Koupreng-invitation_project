# Chapter 19 — Phase 09 Codex Independent Audit Handoff

## 1. Handoff Contract

This handoff is prepared for **OpenAI Codex** to conduct the independent Phase 09 source audit, QA, defect repair, and completion decision.
- **Current Head:** `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`.
- **Gemini Status:** Implementation complete across Slices A through F. Self-certification is strictly local.
- **Codex Responsibility:** Verify all route behaviors independently, probe edge cases, check security boundaries, and render the final Phase 09 audit verdict.

## 2. Verification Commands for Codex

```powershell
# 1. Check token integrity
node scripts/sync-design-tokens.cjs --check

# 2. Run unit suites
npm --prefix apps/frontend-user test -- src/features/templates/
npm --prefix apps/frontend-user test -- src/features/marketing/
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx

# 3. Lint and build
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build

# 4. Run dedicated Phase 09 Playwright suite
npm --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js
```
