# Pre-Release Quality Checklist

## Pre-Release Verification Steps

1. **Architecture & Contract Integrity:**
   - [ ] Run `mvn -f apps/backend/pom.xml test -Dtest=ArchitectureRulesTests` (ArchUnit pass).
   - [ ] Verify no unmapped REST endpoints or broken OpenAPI specs.

2. **Frontend Quality:**
   - [ ] All Vitest suites passing (`npm test` in both `frontend-user` and `frontend-admin`).
   - [ ] Zero ESLint errors or unhandled promise rejections.
   - [ ] Build succeeds: `npm run build` in user and admin frontends.

3. **Database & Schema:**
   - [ ] New Flyway migrations tested on MySQL 8.
   - [ ] No edited legacy migrations.
   - [ ] All currency columns explicitly configured (`USD` / `KHR`).

4. **Payment & Security:**
   - [ ] Webhook HMAC / admin payment secret verified.
   - [ ] No secrets exposed in `.env.example` or committed code.
   - [ ] Payer last-3 account masking confirmed.

5. **Accessibility & Responsive:**
   - [ ] Mobile viewports (320px, 375px) tested without overflow.
   - [ ] Focus rings and keyboard navigation functional.
   - [ ] Reduced-motion styles respected.

