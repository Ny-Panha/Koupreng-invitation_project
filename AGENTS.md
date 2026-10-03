# AGENTS.md — E-Invitation Engineering Agent Instructions

This repository defines team-shared agent skills and architectural rules for AI coding assistants (OpenAI Codex, Claude Code, Antigravity, Cursor).

---

## 1. Skill Discovery & Architecture

Project-local agent skills are located in:
```
.agents/skills/
```

All installed skills are pinned with exact commit SHAs and SHA-256 file hashes in [`ai-skills.lock.json`](file:///d:/Koupreng-invitation_project/ai-skills.lock.json).
Detailed documentation and usage patterns live in [`docs/AI_AGENT_SKILLS.md`](file:///d:/Koupreng-invitation_project/docs/AI_AGENT_SKILLS.md).

---

## 2. Core Project Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Zustand, Axios, React Hook Form, Playwright, Vitest.
- **Backend:** Java 25, Spring Boot 4, Spring Security, REST APIs, JPA / Hibernate, Maven.
- **Database:** MySQL 8, Flyway, Redis.
- **Python:** FastAPI, Telegram Bot, Webhook integration.
- **Security:** JWT authentication, Google OAuth, Telegram HMAC validation, payment reconciliation, public RSVP authorization, role-based access control.

---

## 3. Skill Precedence Hierarchy

Always enforce this precedence order:
1. **Security Requirements & Codebase Invariants:** Enforce token expiration, HMAC webhook validation, CSRF protection, and IDOR prevention above all else.
2. **Framework & Architecture Guidance:** Clean Architecture boundaries, Domain-Driven Design (`architecture-patterns`), contract-first API design (`api-and-interface-design`).
3. **State & UI Specifications:** Tailwind CSS 4 (`tailwind-design-system`), Zustand store slicing (`react-state-management`), accessibility standards (`wcag-audit-patterns`).
4. **General Aesthetics:** Generic styling guidelines.

*Repository code conventions and existing test suites always override generic skill defaults.*

---

## 4. When to Use Specific Skills

Do NOT activate every skill simultaneously. Select skills specifically matching the task:

- **UI / Design Changes:**
  Use `tailwind-design-system`, `ui-ux-pro-max`, `wcag-audit-patterns`.
  *Ensure Tailwind CSS 4 `@theme` syntax and WCAG 2.2 AA contrast compliance.*

- **React State & Component Architecture:**
  Use `react-state-management`, `vercel-react-best-practices`.
  *Structure Zustand stores cleanly; avoid unnecessary re-renders; maintain optimistic UI updates.*

- **Backend Architecture & REST APIs:**
  Use `architecture-patterns`, `api-and-interface-design`, `spring-boot-engineer`.
  *Maintain separation between domain, application, and infrastructure layers; enforce immutable DTOs and structured errors.*

- **Authentication, Security & Threat Modeling:**
  Use `auth-implementation-patterns`, `stride-analysis-patterns`, `attack-tree-construction`, `security-best-practices`.
  *Perform STRIDE threat analysis on authentication, payment notifications, and webhook endpoints.*

- **Database Queries & Optimization:**
  Use `sql-pro`, `performance-optimization`.
  *Analyze execution plans, eliminate N+1 queries, ensure non-breaking Flyway migrations.*

- **End-to-End Testing & QA:**
  Use `playwright`, `test-master`, `wcag-audit-patterns`.

---

## 5. Verification Command

Verify the integrity of installed skills:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
```
```bash
./scripts/setup-ai-skills.sh
```
