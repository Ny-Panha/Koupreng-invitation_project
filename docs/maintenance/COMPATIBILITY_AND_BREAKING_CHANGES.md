# Compatibility & Breaking Changes Assessment

**Project:** Koupreng E-Invitation Platform
**Upgrade Scope:** Full-Stack Dependency Modernization
**Date:** 2026-10-25

---

## 1. Compatibility Overview

Every upgrade performed during this modernization was evaluated against existing application contracts, database persistence rules, and security boundaries. All modifications were verified with automated test suites before being confirmed.

---

## 2. Framework & Library Migration Details

### 2.1 Backend: Spring Boot 4.1.1 Overlay
- **Spring Boot & Spring Framework:**
  - Upgraded from Spring Boot parent `4.0.8` to `4.1.1` (Spring Framework `7.0.9`).
  - No deprecated properties required adjustment in `application.properties`, `application-dev.properties`, or `application-test.properties`.
  - Virtual thread support (`spring.threads.virtual.enabled=true`) remains active and compatible with Java 25.0.1 LTS runtime.
- **Spring Security 7.1.1:**
  - Preserved `SecurityConfig` filter chain: CSRF disabled for stateless JWT REST endpoints, stateless session management, DaoAuthenticationProvider, and JwtAuthenticationConverter.
  - No breaking API changes encountered in Nimbus JOSE JWT `10.10` or Spring OAuth2 Resource Server.
- **Hibernate ORM 7.4.5.Final & Flyway 12.4.0:**
  - Dialects and entity mappings across all 33 historical Flyway migrations remained 100% compatible.
  - Zero schema drift or checksum errors.
- **Apache POI 6.0.0:**
  - Upgraded from `5.5.1` to `6.0.0`. Excel report generation (`XSSFWorkbook`, `Sheet`, `Cell`, `CellStyle`, `Font`) in `apps/backend/src/main/java/com/koupreng/backend/admin/application/AdminReportingService.java` compiled and passed all test suites without signature changes.
- **SpotBugs 4.10.5.0 Strictness:**
  - Upgraded SpotBugs plugin discovered stricter bytecode analysis rules:
    1. Unnecessary boxing/unboxing parsing in `GuestBatchRequest.java`: changed `Integer.valueOf(seatCount.trim())` to `Integer.parseInt(seatCount.trim())`.
    2. Overly broad exception catching in `InvitationContentPolicy.java`: changed `catch (Exception e)` to `catch (JsonProcessingException | RuntimeException e)`.
- **PMD 7.17.0 Enforcement:**
  - Cleaned unused import `OrganizationMember` in `InvitationService.java`.
  - Replaced redundant fully-qualified qualifiers (`@org.springframework.beans.factory.annotation.Autowired`, `java.util.ArrayList`) with standard imported names.

### 2.2 Frontend: React 19.3.1, Vite 8.3.5 & Vitest 5.0.5
- **React & React DOM 19.3.1:**
  - Smooth in-place minor patch upgrade from 19.3.0 to 19.3.1.
  - Full compatibility with React 19 concurrent features, client root hydration, and hooks (`useMemo`, `useCallback`, `useTransition`).
  - All 130 Vitest suites (896 tests) in `frontend-user` and 21 suites (121 tests) in `frontend-admin` passed without regressions.
- **Vite 8.3.5 & @vitejs/plugin-react 6.1.2:**
  - Production build generation (`npm run build`) succeeded without warnings in both `frontend-user` (2.49s) and `frontend-admin` (1.21s).
  - Code splitting, dynamic imports, and asset hashing verified intact.
- **Happy DOM 21.0.4:**
  - Fixed major host code execution vulnerability present in versions 17.0.0 - 21.0.3 (GHSA-834v-8h66-3h79 / CVE-2026-33943).
  - DOM simulation, custom event dispatching, and mock window environments functioned identically.
  - **Behavioral Note on Iframes:** Happy DOM 21 changed iframe security handling: with iframe page loading disabled by default or configuration, attaching an `<iframe src="...">` now synchronously emits `DOMException [NotSupportedError]: Failed to load iframe page ... Iframe page loading is disabled.` rather than silently suppressing navigation. While test assertions complete successfully, this error is visible in Vitest stderr when rendering iframe-based preview modals (`AdminReportOverview.test.jsx`, `HomeFeature.test.jsx`).
- **Framer Motion 14.5.0:**
  - Upgraded from 13.4.6 to 14.5.0.
  - Khmer wedding invitation opening sequences, 3D wax seal animations, guest envelope unfolding, and layout transitions verified.
- **Playwright Test 1.64.1:**
  - Upgraded test harness dependencies in `frontend-user`.
  - Configured test execution to run from `apps/frontend-user` directory with `--workers=1` on Windows local environments to avoid port exhaustion and socket contention against the single Vite preview instance.

### 2.3 Python: FastAPI 0.156.4 & Ruff 0.17.1
- **FastAPI 0.156.4:**
  - Pydantic v2 schemas, Starlette route dispatching, and dependency injection in `apps/telegram-bot/main.py` remained 100% compatible.
  - All 72 webhook security, payment completion, and delivery tests passed with zero failures.
- **Ruff 0.17.1:**
  - All linting and formatting rules validated without regressions.
- **Windows Terminal Multibyte Khmer Character Encoding:**
  - On Windows host environments where console codepage defaults to cp1252, terminal tools outputting multibyte Khmer characters (e.g., in ABA PayWay bank alert payer names) require `$env:PYTHONUTF8="1"` or `PYTHONIOENCODING=utf-8` to prevent `UnicodeEncodeError`. Linux container environments (`python:3.13-slim`) are unaffected.

---

## 3. Public API & Contract Stability

- **REST API Contracts:** No breaking modifications made to `/api/v1/*` response structures, error envelopes, HTTP status codes, or parameters.
- **Database Schema:** Forward-only and historical migration integrity preserved. No schema modifications were needed or performed.
- **Payment Reconciliation Guarantees:** Strict ABA PayWay static links and Telegram webhook merchant alert matching mechanisms preserved without alteration.
