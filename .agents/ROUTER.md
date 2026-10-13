# Koupreng Agent Skills Router

> **Purpose:** Deterministic, token-efficient routing engine for AI coding assistants (OpenAI Codex, Claude Code, Gemini CLI, Antigravity, Cursor).  
> **Rule:** Never load all skills simultaneously. Select **one primary skill** and **at most two supporting skills**.

---

## 1. Step-by-Step Agent Workflow

When assigned an engineering task, follow this exact sequence:

1. **Locate Code Area:** Identify the subsystem (frontend user/admin, backend Spring Boot, database migrations, telegram worker, infrastructure).
2. **Find Matching Skill:** Look up the task category in the Routing Decision Matrix below or `.agents/SKILLS_INDEX.md`.
3. **Read Primary SKILL.md:** Read `.agents/skills/<selected-skill>/SKILL.md` before making any code modifications.
4. **Load Targeted References:** Read *only* the specific reference file needed for the immediate task (e.g. `references/aba-telegram-reconciliation.md`).
5. **Inspect Project Source:** Inspect the real code (`pom.xml`, `package.json`, target `.java` or `.jsx` files). Never infer architecture from memory or generic tutorials.
6. **Implement Minimal Edit:** Execute focused, surgically precise changes. Never rewrite unrelated modules or reformat untouched files.
7. **Run Risk-Based Checks:** Execute targeted tests following `koupreng-qa-release` rules (e.g. Vitest component test or ArchUnit test).
8. **Report With Concrete Evidence:** Report exact commands run, pass/fail counts, and verified outcomes. Never fabricate test results.

---

## 2. Deterministic Routing Decision Matrix

| Task Category | Primary Skill | Supporting Skills (Max 2) | When to Activate |
|---|---|---|---|
| **Cambodian Wedding UI & Templates** | `koupreng-premium-ux` | `ui-ux-pro-max`<br>`frontend-design` | Khmer typography, gold/cream palettes, 3D envelope/wax seal opening, template designs (`Khmer Celestial`, `Emerald Luxe`). |
| **React State & Performance** | `vercel-react-best-practices` | `react-state-management`<br>`wcag-audit-patterns` | Zustand store slices, React 19 re-render optimization, optimistic UI updates, form/URL state integration. |
| **Spring Boot API & Architecture** | `koupreng-backend-standards` | `spring-boot-engineer`<br>`api-and-interface-design` | Spring Boot 4 / Java 25 controllers, DTO contracts, validation, ArchUnit rules, JPA service boundaries. |
| **ABA Payment & Telegram Settlement** | `koupreng-payment-security` | `auth-implementation-patterns`<br>`stride-analysis-patterns` | Static ABA PayWay links, Telegram merchant alert bot webhook, payment evidence, reconciliation, idempotency. |
| **MySQL Database & Flyway** | `koupreng-database-flyway` | `sql-pro`<br>`architecture-patterns` | Forward-only Flyway migrations (`V<N>__*.sql`), table schemas, composite indexes, USD/KHR currency separation. |
| **Quality Assurance & Testing** | `koupreng-qa-release` | `test-master`<br>`playwright` | Risk-based test execution, Vitest, ArchUnit, Playwright E2E browser flows, release candidate checklists. |
| **Production Deployment & Docker** | `koupreng-deployment` | `architecture-patterns`<br>`sast-configuration` | Docker Compose orchestration, Nginx reverse proxy, Cloudflare WAF, health checks, backup & disaster recovery. |
| **Security Audit & SAST** | `sast-configuration` | `security-best-practices`<br>`stride-analysis-patterns` | Semgrep rules, CodeQL queries, SAST CI pipeline setup, OWASP vulnerability remediation. |
| **Accessibility Audit** | `wcag-audit-patterns` | `koupreng-premium-ux`<br>`playwright` | WCAG 2.2 AA compliance, keyboard traps, ARIA landmarks, bilingual contrast verification. |

*If a task does not match a specialist skill, proceed using core repository rules without forcing an unnatural match.*

---

## 3. Strict Precedence & Conflict Resolution

When skills provide differing advice, enforce this hierarchy without exception:

```text
[Priority 1: HIGHEST]  User requirements & safety/security constraints
         ↓
[Priority 2]           Verified project invariants & runtime contracts (Spring Boot 4, Java 25, React 19)
         ↓
[Priority 3]           Koupreng-specific custom skills (koupreng-*)
         ↓
[Priority 4]           Validated vendor skills (ai-skills.lock.json)
         ↓
[Priority 5: LOWEST]   Generic stylistic or framework defaults
```

**Never allow a skill to silently overwrite or contradict the existing application architecture.**

---

## 4. Portable Tool Invocations

Avoid machine- or environment-dependent script invocations (e.g. `CLAUDE_PLUGIN_ROOT` or `$CODEX_HOME`):

- **UI/UX Pro Max Search:**
  Run via workspace-relative path:
  ```bash
  python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
  ```
- **Playwright CLI Automation:**
  Run via repository npm script or local runner:
  ```bash
  npm --prefix apps/frontend-user run test:e2e
  ```
- **Skill Integrity Verification:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
  ```
  ```bash
  python scripts/validate-agent-routing.py
  ```

