# Report 24: Cross-Subsystem Regression Audit

> **Target:** Verification Across User App, Admin App, Backend Services & Telegram Bot  
> **Auditor:** Codex (Senior Release & Full-Stack Architect)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Monorepo Subsystem Blast Radius

While Phase 13 focus is located in `apps/frontend-user/src/features/invitations/studio/`, modifications to shared utilities, navigation contracts, and JSON payload serialization could potentially cause ripple regressions across downstream systems.

Codex audited all six key subsystems:

```
                               ┌─────────────────────────────┐
                               │   Phase 13 Creator Studio   │
                               │  (InvitationForm & Studio)  │
                               └──────────────┬──────────────┘
                                              │
                 ┌──────────────┬─────────────┼─────────────┬──────────────┐
                 │              │             │             │              │
                 ▼              ▼             ▼             ▼              ▼
           ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
           │ Templates │  │ Check-In  │  │ Payments  │  │ Admin App │  │ Telegram  │
           │ 10 Layouts│  │  Scanner  │  │ABA PayWay │  │ Dashboard │  │   Bot     │
           │142 Tests  │  │ 18 Tests  │  │ 39 Tests  │  │ 202 Tests │  │ 74 Tests  │
           │  ✓ PASS   │  │  ✓ PASS   │  │  ✓ PASS   │  │  ✓ PASS   │  │  ✓ PASS   │
           └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

---

## 2. Subsystem Audit Results

1. **Templates Subsystem:**
   - Evaluated all 10 layout families and 38 registered aliases.
   - `SilkHeritageLayout.test.jsx` (12 tests passed): Confirmed that decorative artwork preservation logic is completely unaffected.
   - `KhmerFloralGoldLayout` and `RoyalGardenCinematicLayout`: All animation hooks and cinematic intro components pass.
2. **Check-In & Guest Management:**
   - QR scanner, manual walk-in creation, attendance summary queries, and attendance undo services pass 18 tests.
   - Guest RSVP isolation (C10-001) verified.
3. **Backend Spring Boot 4 / Java 25:**
   - ArchUnit tests (`ArchitectureRulesTests`): 5 of 5 passed.
   - Template payment service tests (`TemplatePaymentServiceTests`): 39 of 39 passed.
   - Flyway migration tests (`FlywayMigrationVersionTests`): Verified that all 48 database migrations are intact and forward-only.
4. **Admin Portal:**
   - 37 test files, 202 tests passed. Build passes in 670ms. Route inventory intact.
5. **Telegram Bot:**
   - 74 pytest tests passed in 0.97s. Webhook signature security and settlement alerts intact.
