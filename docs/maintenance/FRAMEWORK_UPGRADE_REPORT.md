# Framework & Runtime Modernization Report

**Project:** Koupreng E-Invitation Platform
**Target Environment:** Java 25, Node.js 22/26, Python 3.13/3.14/3.15, Docker Compose, MySQL 8.0, Redis 7.4
**Date:** 2026-10-25

---

## 1. Java & Spring Boot Subsystem Modernization (`apps/backend`)

### 1.1 Spring Boot Parent Upgrade: 4.0.8 → 4.1.1
- **Spring Boot Starter Parent:** Upgraded from `4.0.8` to `4.1.1` (the newest officially released stable production line; pre-release 4.2.0-RC1 was rejected per engineering safety policy).
- **Underlying Framework Components:**
  - **Spring Framework:** Automatically managed at `7.0.9`.
  - **Spring Security:** Automatically managed at `7.1.1` (preserves OAuth2 Resource Server, stateless JWT bearer tokens, and method security invariants).
  - **Spring Data JPA & Redis:** Managed at `4.1.1`.
  - **Hibernate ORM:** Resolves to `7.4.5.Final` with verified MySQL / MariaDB dialect support.
  - **Flyway Core:** Resolves to `12.4.0`.

### 1.2 Auxiliary Backend Libraries & Tooling
- **SpringDoc OpenAPI:** `org.springdoc:springdoc-openapi-starter-webmvc-ui` and `springdoc-openapi-starter-webmvc-scalar` upgraded from `3.1.1` to `3.2.0`, aligning OpenAPI 3.1 specification endpoints and Scalar UI interactive documentation.
- **Apache POI:** Upgraded `org.apache.poi:poi` and `poi-ooxml` from `5.5.1` to `6.0.0`, ensuring secure Excel generation for admin reporting without XML external entity vulnerabilities.
- **ArchUnit:** Upgraded `com.tngtech.archunit:archunit-junit5` from `1.5.0` to `1.5.1`, guaranteeing continuous enforcement of Clean Architecture and layered boundary tests.
- **Nimbus JOSE+JWT:** Upgraded `com.nimbusds:nimbus-jose-jwt` from `10.4` to `10.10`.
- **ZXing:** Aligned `com.google.zxing:javase` from `3.5.3` to `3.5.4` matching `zxing:core:3.5.4`.
- **PostgreSQL JDBC:** Upgraded `org.postgresql:postgresql` from `42.7.13` to `42.7.14`.
- **SpotBugs Maven Plugin:** Upgraded from `4.10.4.1` to `4.10.5.0` (using SpotBugs 4.10.5 engine).

### 1.3 Code Quality & Compiler Compliance Remediations
1. **SpotBugs DM_BOXED_PRIMITIVE_FOR_PARSING in `GuestBatchRequest.java`:**
   - Modified line 23 to use `Integer.parseInt(seatCount.trim())` rather than `Integer.valueOf(...)`, avoiding redundant autoboxing/unboxing cycles.
2. **SpotBugs REC_CATCH_EXCEPTION in `InvitationContentPolicy.java`:**
   - Refactored `catch (Exception e)` to explicitly catch `JsonProcessingException | RuntimeException e`.
3. **PMD 7.17.0 Clean-up in `InvitationService.java`:**
   - Removed unused import `com.koupreng.backend.organization.domain.OrganizationMember`.
   - Replaced redundant fully-qualified `@org.springframework.beans.factory.annotation.Autowired` with standard imported `@Autowired`.
   - Replaced redundant `new java.util.ArrayList<>()` with imported `new ArrayList<>()`.

---

## 2. React & Frontend Subsystems Modernization (`apps/frontend-user` & `apps/frontend-admin`)

### 2.1 Core React Runtime
- **React & React DOM:** Upgraded from `19.2.8` (resolved `19.3.0`) to `19.3.1` in both `frontend-user` and `frontend-admin`.
- **TypeScript Declarations:** Pinned `@types/react` and `@types/react-dom` to `^19.3.0` (the highest published release on npm).

### 2.2 Vite & Build Toolchain
- **Vite:** Upgraded from `8.2.1` / `8.3.1` (resolved `8.3.0`) to `8.3.5` across both applications.
- **Vite React Plugin:** Upgraded `@vitejs/plugin-react` from `6.0.5` (resolved `6.1.1`) to `6.1.2`.
- **Vitest:** Upgraded from `5.0.2` to `5.0.5` across both applications.
- **Happy DOM:** Upgraded from `20.11.8` (resolved `20.14.5`) to `21.0.4`.

### 2.3 UI & Animation Libraries
- **Framer Motion:** Upgraded `framer-motion` from `13.4.6` to `14.5.0` in `frontend-user`.
- **Lucide Icons:** Upgraded `lucide-react` from `1.49.0` to `1.61.0` across both applications.
- **Zustand:** Upgraded `zustand` from `5.0.14` (resolved `5.0.15`) to `5.0.16` in `frontend-user`.
- **Playwright Test Runner:** Upgraded `@playwright/test` from `1.62.1` (resolved `1.63.0`) to `1.64.1` in `frontend-user`.
- **Knip:** Upgraded `knip` from `6.38.0` to `6.43.0` across both applications.
- **ESLint & Globals:** Upgraded `eslint` to `10.13.0` and `globals` to `17.13.0`.

---

## 3. Python Telegram Bot Modernization (`apps/telegram-bot`)

- **FastAPI:** Upgraded from `0.143.0` to `0.156.4` in `requirements.txt`.
- **Ruff:** Upgraded `ruff` from `0.17.0` to `0.17.1` in `requirements-dev.txt`.
- **Runtime Libraries:** Retained verified stable `httpx==0.28.1`, `python-dotenv==1.2.4`, `uvicorn==0.54.0`.

---

## 4. CI/CD & Infrastructure Modernization

- **GitHub Actions:**
  - Upgraded `actions/setup-python` across all workflows from `5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0` to `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 # v7.1.0`.
  - Retained strict 40-character commit SHA pinning and readable version tags.
- **Docker Compose:**
  - Preserved verified base images (`mysql:8.0`, `redis:7.4-alpine`, `nginx:1.27-alpine`).
