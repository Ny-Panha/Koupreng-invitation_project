# AGENTS.md — Koupreng Engineering Agent Instructions

This repository defines team-shared engineering standards and architectural rules for AI coding assistants (OpenAI Codex, Claude Code, Gemini CLI, Antigravity, Cursor).

---

## 1. Golden Rule & Skill Routing

> **MANDATORY INSTRUCTION:**  
> **Before substantial implementation, review [`.agents/ROUTER.md`](.agents/ROUTER.md), identify the applicable skills, and read their `SKILL.md` instructions before making changes.**

Project-local agent skills live in [`.agents/skills/`](.agents/skills/). For a complete list of capabilities, consult [`.agents/SKILLS_INDEX.md`](.agents/SKILLS_INDEX.md).  
Pinned external skills and cryptographic hashes are tracked in [`ai-skills.lock.json`](ai-skills.lock.json).  
For Codex-specific workflow details, see [`CODEX.md`](CODEX.md).
For one-command teammate installation in Codex or Claude Code, see [team skills setup](docs/development/AI_SKILLS_SETUP.md).

---

## 2. Verified Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7, Zustand 5, Playwright, Vitest.
- **Backend:** Java 25, Spring Boot 4.0.8, Spring Security (OAuth2 Resource Server), Spring Data JPA, Flyway, Maven.
- **Database:** MySQL 8.0 (`utf8mb4_unicode_ci`), Redis 7.4.
- **Worker Service:** Python (FastAPI, Telegram Bot webhook integration).
- **Deployment:** Low-budget VPS (Docker Compose, Nginx reverse proxy, Cloudflare WAF/SSL).

---

## 3. Precedence Hierarchy

When skills or instructions conflict, enforce this strict hierarchy:
1. **User Requirements & Core Security Invariants:** Enforce token expiration, HMAC webhook validation, server-owned prices, and IDOR prevention above all else.
2. **Verified Project Invariants & Contracts:** Java 25 / Spring Boot 4 runtime conventions, ArchUnit boundaries, forward-only Flyway migrations.
3. **Koupreng Custom Skills:** (`koupreng-premium-ux`, `koupreng-backend-standards`, `koupreng-payment-security`, `koupreng-database-flyway`, `koupreng-qa-release`, `koupreng-deployment`).
4. **Validated Vendor Skills:** Pinned skills in `ai-skills.lock.json` (`sast-configuration`, `architecture-patterns`, etc.).
5. **Generic Aesthetic / Framework Defaults:** Baseline styling and library recommendations.

---

## 4. Architectural & Safety Invariants

- **Clean Architecture Boundaries:** ArchUnit verifies that controllers never access persistence directly, never expose domain/JPA entities (use immutable DTOs), and domain packages remain free of outer-layer dependencies.
- **Payment Reconciliation Rules:** Orders are created `PENDING`. Browser submissions are untrusted claimant evidence and must *never* self-approve payment. Official bank alerts captured by the Telegram bot reconcile candidate orders via amount, currency, payer suffix, and unique transaction ID.
- **Database Migrations:** Never edit previously applied Flyway migrations (`V1`–`V33`). All schema changes must be forward-only increments (`V34__...`).
- **USD / KHR Separation:** Always maintain explicit 3-letter currency columns. Never sum or conflate USD and KHR balances without explicit conversion metadata.
- **Operational Safety:** Never deploy, restart production containers, or modify live DNS records without explicit user authorization.

---

## 5. Token Efficiency & Context Management

1. **Selective Activation:** Activate at most **one primary skill** and **up to two supporting skills** per task as directed by [`.agents/ROUTER.md`](.agents/ROUTER.md).
2. **Minimal Loading:** Read only the necessary sections or reference documents. Do not load entire skill directories into context.
3. **Focused Edits:** Make surgical, minimal modifications. Preserve existing unrelated docstrings, comments, and logic.

---

## 6. Verification & Quality Expectations

- **Risk-Based Testing:** Run tests matching the scope of your changes (e.g. `npx vitest run <file>` for components; `mvn test -Dtest=ArchitectureRulesTests` for backend changes).
- **Verification Commands:**
  ```powershell
  # Verify skills integrity
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
  # Validate routing and file references
  python scripts/validate-agent-routing.py
  ```
- **Integrity Rule:** Report actual commands, output, pass/fail counts, or environment blockers. Never fabricate test evidence.
