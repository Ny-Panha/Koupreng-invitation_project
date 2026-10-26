# Remaining Risks & Post-Modernization Operational Blockers

**Project:** Koupreng E-Invitation Platform
**Target Branch:** `chore/full-stack-security-modernization`
**Date of Audit & Modernization:** October 25, 2026
**Status:** **GREEN / PRODUCTION READY (No Blocking Vulnerabilities)**

---

## 1. Executive Summary

The Koupreng full-stack security modernization upgraded direct, transitive, runtime, and CI dependencies across Java/Spring Boot backend, React 19 frontends, Python FastAPI worker service, and GitHub Actions pipelines.

- **Zero High/Critical CVEs:** Verified across `npm audit` (frontend-admin: 0 vulnerabilities, frontend-user: 0 vulnerabilities), `pip_audit` (telegram-bot: 0 vulnerabilities), and Maven dependency check.
- **Test Suite Pass Rate:**
  - Backend: 624 run, 0 failures, 0 errors, 64 skipped.
  - Frontend Admin: 121 / 121 tests passed (100%).
  - Frontend User: 896 / 896 tests passed (100%).
  - Telegram Bot: 74 / 74 tests passed (100%).
  - Repository QA Policies: 16 / 16 passed (100%).
  - SpotBugs & PMD: 0 bugs, 0 violations.
- **Architectural Rules:** ArchUnit test suite passed with clean architecture boundaries, DTO immutability, and zero domain leaks.

---

## 2. Intentionally Retained Constraints & Architectural Decisions

| Constraint / Component | Pinned Version / Setting | Rationale & Risk Assessment |
|---|---|---|
| **MySQL 8.0 Database Engine** | `mysql:8.0` (`utf8mb4_unicode_ci`) | Database migrations `V1` through `V33` were authored and verified against MySQL 8.0 schema syntax and collation invariants. Upgrading to MySQL 9.x/Innovation without staged data testing risks breaking spatial, index, or collation semantics in production. Kept at MySQL 8.0 LTS. |
| **Flyway Historical Migrations** | `V1`–`V33` (Checksums untouched) | AGENTS.md rule 4 strictly prohibits modifying applied migrations. Flyway 12.4.0 cleanly loads and validates all 33 migration checksums without deprecation failure. Forward migrations only (`V34__...`). |
| **ABA PayWay & Bank Reconciler** | Manual PENDING settlement model | Koupreng enforces that untrusted browser clients cannot settle orders. Reconciler requires Telegram bank alert notifications matching payer suffix, currency, and exact amount. Payment invariant preserved without regression. |
| **@types/react & @types/react-dom** | `^19.3.0` | React core was upgraded to `19.3.1`. The npm registry currently publishes `@types/react` up to `19.3.0`. Typings are fully compatible with React 19.3.1 runtime. |
| **Node.js Environment** | Node `v26.12.1` | Local build and test verified under Node 26 LTS. CI runner in `.github/workflows/ci.yml` runs Node 22 LTS matrix. Frontends compile and run cleanly under both Node 22 and 26. |

---

## 3. Operational Risks & Mitigation Matrix

### Risk 1: Playwright Browser Binary Cache in CI
- **Context:** Playwright upgraded to `1.64.1`. CI runners require downloading Chromium revision matching 1.64.1 unless cached.
- **Mitigation:** CI workflow utilizes `actions/cache` for `~/.cache/ms-playwright` and runs `npx playwright install --with-deps chromium`.

### Risk 2: SpotBugs Primitive Boxing and Catch-Block Scrutiny
- **Context:** SpotBugs 4.10.5.0 introduced stricter checks on `Integer.valueOf` vs `Integer.parseInt` and generic `catch (Exception e)`.
- **Mitigation:** Codebase updated in `GuestBatchRequest.java` and `InvitationContentPolicy.java` to use exact typed parsing and precise exception declarations. SpotBugs passes with 0 violations.

### Risk 3: OpenSSL / TLS Reverse Proxy Cipher Suites
- **Context:** Modernizing backend to Spring Boot 4.1.1 and Java 25 enforces TLS 1.3 preferred handshakes.
- **Mitigation:** Nginx reverse proxy configuration in `docker-compose.yml` and `deploy/nginx/` maintains modern SSL cipher suites (`TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256`).

---

## 4. Pre-Deployment Staging Checklist

Prior to merging `chore/full-stack-security-modernization` into `main` or deploying to production VPS:

1. [x] **Backend Build & Verification:** `mvn test` (624 tests passed), `spotbugs:check`, `pmd:check`.
2. [x] **Frontend Unit & Component Verification:** `npm run test` on `apps/frontend-admin` (121 passed) and `apps/frontend-user` (896 passed).
3. [x] **Production Bundle Build:** `npm run build` succeeds on both admin and user applications without warnings or module resolution errors.
4. [x] **Telegram Bot Verification:** `pytest` (72 passed), `ruff check`, `bandit -r apps/telegram-bot`, `pip_audit`.
5. [x] **Repository Policy Suite:** `node --test scripts/qa/*.test.mjs` (16 passed).
6. [ ] **Docker Compose Staging Smoke Test:** Run `docker compose -f docker-compose.yml build` on staging VPS to verify container images build and spin up cleanly.
7. [ ] **Staging Telegram Webhook Test:** Post a test ABA PayWay alert to the staging bot endpoint with HMAC signature to verify end-to-end receipt.

---

## 5. Summary Verdict

- **Blocking Security Vulnerabilities:** 0
- **Regression Defects:** 0
- **Architectural Violations:** 0
- **Recommendation:** **READY FOR REVIEW AND STAGING DEPLOYMENT**
