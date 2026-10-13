---
name: koupreng-qa-release
description: "Risk-based quality assurance, automated test execution, and release verification for Koupreng. Use when running tests, executing Playwright E2E browser tests, Vitest component tests, Spring Boot integration tests, ArchUnit checks, or validating release readiness."
---

# Koupreng QA & Release Verification Standards

## 1. Risk-Based Test Selection Strategy

Do not rerun the entire monorepo test suite for every minor change. Select tests proportionate to the blast radius of your modifications:

| Change Scope | Risk Level | Minimum Required Verification |
|---|---|---|
| **UI Component / Styling** (e.g. Button, Card, CSS) | Low | Targeted Vitest: `npx vitest run src/.../Component.test.jsx`. Visual/responsive inspection. |
| **Frontend Store / Hook** (e.g. Zustand store, form state) | Medium | Vitest store tests + affected component tests + lint (`npm run lint`). |
| **Backend REST Controller / DTO** | Medium | ArchUnit tests (`mvn test -Dtest=ArchitectureRulesTests`) + targeted controller test. |
| **Backend Service / Business Logic** | High | Service unit tests + ArchUnit tests + module integration tests. |
| **Payment / Auth / Security** | Critical | Payment tests (`mvn test -Dtest=*Payment*`) + Auth tests (`mvn test -Dtest=*Auth*`) + ArchUnit + STRIDE review. |
| **Database Schema / Flyway Migration** | Critical | Flyway migration compile check + JPA entity verification + related repository tests. |
| **Release Candidate / Major PR** | Comprehensive | Full backend Maven suite + Frontend Vitest suites + Playwright E2E smoke tests + Telegram pytest. |

---

## 2. Test Execution Commands by Subsystem

### A. Frontend User (`apps/frontend-user/`)
```powershell
# Run all unit and component tests
npm --prefix apps/frontend-user test

# Run a single targeted test file
npx --prefix apps/frontend-user vitest run src/features/templates/registry/templateRegistry.test.jsx

# Run Playwright E2E tests
npm --prefix apps/frontend-user run test:e2e
```

### B. Frontend Admin (`apps/frontend-admin/`)
```powershell
npm --prefix apps/frontend-admin test
```

### C. Backend (`apps/backend/`)
```powershell
# Run ArchUnit architecture tests
mvn -f apps/backend/pom.xml test -Dtest=ArchitectureRulesTests

# Run a specific test class
mvn -f apps/backend/pom.xml test -Dtest=TemplatePaymentServiceTest

# Run all backend tests
mvn -f apps/backend/pom.xml test
```

### D. Telegram Bot (`apps/telegram-bot/`)
```powershell
pytest apps/telegram-bot/tests
```

---

## 3. Reporting Expectations & Integrity

When reporting test results to users or in PRs:
1. **Report Actual Output:** Include the exact command run, test pass/fail counts, and execution duration.
2. **Never Fabricate Test Evidence:** If an environment lacks a running database, browser binary, or external tool, clearly state: `BLOCKED: [Tool Name] not available in current environment`.
3. **Trace Failures:** For failed tests, paste the exact assertion message and stack trace.

---

## 4. Release Readiness Checklist

Before approving any release:
- [ ] Working tree clean, no uncommitted temporary scratch files.
- [ ] No regression in ArchUnit architecture rules.
- [ ] All targeted unit and integration tests pass cleanly (exit code 0).
- [ ] No hardcoded secrets, API tokens, or test credentials added.
- [ ] No breaking changes to existing Flyway migrations.
- [ ] Responsive UI verified on mobile (320px/375px) and desktop.
- [ ] WCAG 2.2 AA contrast and keyboard accessibility maintained.

---

## 5. Detailed References

- [Risk-Based Testing Framework](references/risk-based-testing.md)
- [Comprehensive Test Commands Guide](references/test-commands.md)
- [Pre-Release Quality Checklist](references/release-checklist.md)

