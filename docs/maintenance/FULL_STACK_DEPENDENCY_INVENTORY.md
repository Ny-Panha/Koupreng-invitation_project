# Full-Stack Dependency & Technology Inventory

**Project:** Koupreng E-Invitation Modernization
**Repository:** `https://github.com/Ny-Panha/Koupreng-invitation_project`
**Execution Date:** 2026-10-25
**Baseline Git Branch:** `chore/full-stack-security-modernization` (isolated from `feat/phase10-studio-heritage`)
**Base HEAD:** `516923b651b33dafc8ee47ecca45fee6b55bb8ce`

---

## 1. Executive Summary & Version Matrix

| Ecosystem / Component | Subsystem | Old Declared / Resolved | Target / Upgraded Version | Status | Security / Compatibility Rationale |
|---|---|---|---|---|---|
| **Java JDK Runtime** | Backend | 25.0.1 LTS | 25.0.1 LTS (Oracle / Temurin) | Retained (Optimal LTS) | Latest official production release; verified 100% compatible |
| **Spring Boot Parent** | `apps/backend` | 4.0.8 | 4.1.1 | **Upgraded** | Latest stable release; brings Spring 7.0.9, Security 7.1.1, Data 4.1.1 |
| **Springdoc OpenAPI (UI & Scalar)** | `apps/backend` | 3.1.1 | 3.2.0 | **Upgraded** | API documentation compatibility for Spring Boot 4.1.1 |
| **Apache POI & POI-OOXML** | `apps/backend` | 5.5.1 | 6.0.0 | **Upgraded** | Secure Excel reporting engine |
| **ArchUnit JUnit 5** | `apps/backend` | 1.5.0 | 1.5.1 | **Upgraded** | Architecture boundary verification rules |
| **Nimbus JOSE+JWT** | `apps/backend` | 10.4 | 10.10 | **Upgraded** | JWT cryptographic token validation |
| **ZXing JavaSE** | `apps/backend` | 3.5.3 | 3.5.4 | **Upgraded** | Aligned with ZXing Core 3.5.4 for QR code generation |
| **PostgreSQL JDBC Driver** | `apps/backend` | 42.7.13 | 42.7.14 | **Upgraded** | Security patch for database connectivity |
| **SpotBugs Maven Plugin** | `apps/backend` | 4.10.4.1 | 4.10.5.0 | **Upgraded** | Static bug analysis toolchain |
| **Node.js Environment** | Frontend / CI | v26.12.1 / CI 22 | v26.12.1 (Host) / 22 (CI/Docker) | Verified Compatible | Supported Node.js active/LTS release lines |
| **React & React DOM** | `apps/frontend-admin` | 19.2.8 (19.3.0) | 19.3.1 | **Upgraded** | Latest official React 19 stable patch release |
| **React & React DOM** | `apps/frontend-user` | 19.2.8 (19.3.0) | 19.3.1 | **Upgraded** | Latest official React 19 stable patch release |
| **Vite** | `apps/frontend-admin` | 8.3.1 | 8.3.5 | **Upgraded** | Fixes GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-9jrq-w75r-8gcw |
| **Vite** | `apps/frontend-user` | 8.2.1 (8.3.0) | 8.3.5 | **Upgraded** | Fixes launch-editor & cross-origin script execution vulnerabilities |
| **@vitejs/plugin-react** | `apps/frontend-admin` | 6.0.5 (6.1.1) | 6.1.2 | **Upgraded** | Fast Refresh & React 19 compiler integration |
| **@vitejs/plugin-react** | `apps/frontend-user` | 6.0.5 (6.1.1) | 6.1.2 | **Upgraded** | Fast Refresh & React 19 compiler integration |
| **Vitest** | `apps/frontend-admin` | 5.0.2 | 5.0.5 | **Upgraded** | Fixes GHSA-qxg6-89mg-rqv8 & GHSA-xp26-3454-mjgp (@vitest/mocker code injection) |
| **Vitest** | `apps/frontend-user` | 5.0.2 | 5.0.5 | **Upgraded** | Fixes GHSA-qxg6-89mg-rqv8 & GHSA-xp26-3454-mjgp (@vitest/mocker code injection) |
| **happy-dom** | `apps/frontend-admin` | 20.11.8 (20.14.5) | 21.0.4 | **Upgraded** | Fixes GHSA-834v-8h66-3h79 (CVE-2026-33943 host code execution) |
| **happy-dom** | `apps/frontend-user` | 20.11.8 (20.14.5) | 21.0.4 | **Upgraded** | Fixes GHSA-834v-8h66-3h79 (CVE-2026-33943 host code execution) |
| **ESLint & Plugins** | Both frontends | 10.8.1 / 10.11.0 | 10.13.0 | **Upgraded** | Toolchain linting modernization |
| **lucide-react** | Both frontends | 1.49.0 | 1.61.0 | **Upgraded** | Icon system upgrade with full backwards compatibility |
| **framer-motion** | `apps/frontend-user` | 13.4.6 | 14.5.0 | **Upgraded** | Wedding invitation choreography & layout animations |
| **@playwright/test** | `apps/frontend-user` | 1.62.1 (1.63.0) | 1.64.1 | **Upgraded** | Modern browser testing harness |
| **zustand** | `apps/frontend-user` | 5.0.14 (5.0.15) | 5.0.16 | **Upgraded** | State management stability patch |
| **knip** | Both frontends | 6.38.0 | 6.43.0 | **Upgraded** | Unused file and dependency detection |
| **FastAPI** | `apps/telegram-bot` | 0.143.0 | 0.156.4 | **Upgraded** | Webhook API gateway framework |
| **Ruff** | `apps/telegram-bot` | 0.17.0 | 0.17.1 | **Upgraded** | High-performance Python linter and formatter |
| **actions/setup-python** | `.github/workflows` | 7.0.0 (5fda3b9) | 7.1.0 (6d4fd22) | **Upgraded** | CI/CD GitHub Action pinned with verified SHA |
| **MySQL Container** | `docker-compose.yml` | 8.0 | 8.0 (`utf8mb4_unicode_ci`) | Retained | Preserves historical schema V1-V33 & Khmer Unicode |
| **Redis Container** | `docker-compose.yml` | 7.4-alpine | 7.4-alpine | Retained | Production cache and token bucket rate limiter |
| **Nginx Container** | `docker-compose.yml` | 1.27-alpine | 1.27-alpine | Retained | Gateway reverse proxy with Permissions-Policy |

---

## 2. Manifest Locations & Verification Points

```text
apps/backend/pom.xml                    -> Spring Boot 4.1.1, POI 6.0.0, ArchUnit 1.5.1, SpotBugs 4.10.5.0
apps/frontend-user/package.json        -> React 19.3.1, Vite 8.3.5, Vitest 5.0.5, happy-dom 21.0.4, Framer Motion 14.5.0
apps/frontend-admin/package.json       -> React 19.3.1, Vite 8.3.5, Vitest 5.0.5, happy-dom 21.0.4
apps/telegram-bot/requirements.txt     -> FastAPI 0.156.4, HTTPX 0.28.1, python-dotenv 1.2.4, Uvicorn 0.54.0
apps/telegram-bot/requirements-dev.txt -> Ruff 0.17.1, Bandit 1.9.4, pip-audit 2.10.1, Pytest 9.1.1
.github/workflows/ci.yml               -> actions/setup-python@6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 # v7.1.0
```
