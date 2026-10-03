# Team AI Agent Skills Guide — E-Invitation Project

> **Project Stack Alignment:** React 19 (Vite, Tailwind CSS 4, Zustand, React Router) · Spring Boot 4 / Java 25 (Spring Security, JPA/Hibernate) · MySQL 8 (Flyway, Redis) · FastAPI / Telegram Bot · Strict AppSec (JWT, Google Auth, Telegram Webhook HMAC, Payment Reconciliation).

---

## 1. Overview & System Purpose

The E-Invitation Project employs a reproducible, project-local AI Agent Skill architecture compliant with the [Agent Skills Standard](https://agentskills.io) and OpenAI Codex / Anthropic / Google Antigravity multi-harness specifications.

Agent Skills provide modular, contextual engineering knowledge loaded dynamically when specific engineering workflows are executed. This prevents context bloat while enforcing strict architectural standards, security controls, and design consistency across all team members.

All skills approved for this repository have been:
1. **Discovered live** from high-reputation, actively maintained repositories.
2. **Security-audited** against prompt injections, arbitrary shell execution, unauthorized network egress, and secret harvesting.
3. **Verified non-redundant** against pre-existing capabilities.
4. **Pinned to exact Git commit SHAs** in [`ai-skills.lock.json`](file:///d:/Koupreng-invitation_project/ai-skills.lock.json).
5. **Vendored project-locally** into [`.agents/skills/`](file:///d:/Koupreng-invitation_project/.agents/skills) under permissive MIT licenses.

---

## 2. Complete Skills Inventory

### A. Newly Installed Project-Local Skills (`.agents/skills/`)

| Skill | Category | Source Repository | Commit SHA | License | Primary Focus |
|---|---|---|---|---|---|
| [`wcag-audit-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/wcag-audit-patterns) | UI/UX / Accessibility | `wshobson/agents` | `156b7a5e` | MIT | WCAG 2.2 AA audit matrix, focus management, screen reader test patterns, bilingual contrast |
| [`react-state-management`](file:///d:/Koupreng-invitation_project/.agents/skills/react-state-management) | Frontend Engineering | `wshobson/agents` | `156b7a5e` | MIT | Zustand store slices, optimistic UI updates, form/URL state integration, React 19 state |
| [`tailwind-design-system`](file:///d:/Koupreng-invitation_project/.agents/skills/tailwind-design-system) | Frontend Engineering | `wshobson/agents` | `156b7a5e` | MIT | Tailwind CSS v4 `@theme`, CSS-first configuration, OKLCH tokens, variant authority |
| [`architecture-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/architecture-patterns) | Backend Engineering | `wshobson/agents` | `156b7a5e` | MIT | Clean Architecture, Hexagonal / Ports & Adapters, Domain-Driven Design bounded contexts |
| [`api-and-interface-design`](file:///d:/Koupreng-invitation_project/.agents/skills/api-and-interface-design) | Backend / API Design | `addyosmani/agent-skills` | `9d0c60d4` | MIT | Contract-first API boundaries, Hyrum's Law, structured errors, untrusted webhook validation |
| [`auth-implementation-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/auth-implementation-patterns) | Cybersecurity / AppSec | `wshobson/agents` | `156b7a5e` | MIT | JWT lifecycle, short-lived tokens, refresh rotation, OAuth2/OIDC, RBAC, session cookie hardening |
| [`stride-analysis-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/stride-analysis-patterns) | Cybersecurity / Threat Modeling | `wshobson/agents` | `156b7a5e` | MIT | Systematic STRIDE threat analysis, DFD trust boundaries, threat mitigation mappings |
| [`attack-tree-construction`](file:///d:/Koupreng-invitation_project/.agents/skills/attack-tree-construction) | Cybersecurity / Threat Modeling | `wshobson/agents` | `156b7a5e` | MIT | Attack path graph modeling, AND/OR logic trees, defense gap identification, payment flow defense |
| [`performance-optimization`](file:///d:/Koupreng-invitation_project/.agents/skills/performance-optimization) | QA / Performance | `addyosmani/agent-skills` | `9d0c60d4` | MIT | Core Web Vitals (LCP, INP, CLS), frontend bundle profiling, backend query tuning, N+1 fix |

### B. Pre-Existing Project Skills (`.agents/skills/`)

- `banner-design`: Promotional and invitation visual banner generation.
- `brand`: Brand identity, voice, tone, and visual guidelines.
- `build-awwwards-quality-sites`: High-impact landing page motion and creative direction.
- `design`: General design tokens, CIP mockups, and presentations.
- `design-system`: Token architecture and UI component specifications.
- `frontend-design`: Intentional visual design avoiding generic template aesthetics.
- `slides`: Presentation slides with Chart.js.
- `ui-styling`: Radix UI / shadcn style component integration.
- `ui-ux-pro-max`: Multi-platform UI/UX intelligence database (colors, typography, heuristics).
- `vercel-react-best-practices`: Vercel performance and architecture patterns.
- `vercel-react-view-transitions`: Native browser View Transition API choreography.

### C. Retained User/Global Skills (`~/.codex/skills/`)

- `spring-boot-engineer`: Spring Boot 3/4 baseline configurations, controllers, and JPA repositories.
- `sql-pro`: Complex query formulation, CTEs, window functions, and EXPLAIN plans.
- `security-best-practices`: Language-specific secure coding guidance (Python, JS, Go).
- `playwright`: End-to-end browser test automation.
- `test-master`: Test slicing, unit testing, and test pyramid workflows.
- `code-reviewer`: Automated patch inspection and defect detection.
- `fastapi`: Python FastAPI service configuration and endpoint patterns.
- `styleseed`: StyleSeed design token generation and UI review suite.

---

## 3. Skill Precedence & Conflict Resolution Rules

When multiple skills offer guidance on a shared technical area, AI agents and engineers must enforce the following strict precedence hierarchy:

```
[Level 1: Highest] Project Security Rules & Codebase Invariants
       ↓
[Level 2] Framework-Specific & Architecture Guidance
       ↓
[Level 3] Domain & State Management Patterns
       ↓
[Level 4: Lowest] General Design, Style & Aesthetic Guidance
```

### Concrete Conflict Scenarios & Precedence:

1. **Security vs Convenience:**
   - Any conflict between security rules (`auth-implementation-patterns`, `stride-analysis-patterns`) and ease-of-use or design flexibility is resolved in favor of **Security**.
   - Example: JWT tokens must remain short-lived with rotation, and Telegram webhooks must verify HMAC signatures, regardless of UI simplicity.

2. **Tailwind CSS 4 vs Legacy Tailwind v3:**
   - The project uses Tailwind CSS 4.
   - Use `tailwind-design-system` over legacy Tailwind tutorials.
   - Precedence: `@theme` in CSS-first configuration overrides any obsolete `tailwind.config.js` guidance.

3. **React State Architecture:**
   - Use `react-state-management` for Zustand store slicing and optimistic UI updates.
   - Precedence: `react-state-management` governs store topology; `vercel-react-best-practices` governs rendering lifecycle and bundle splitting.

4. **API Design & Domain Boundaries:**
   - Use `architecture-patterns` to enforce Domain-Driven Design and Clean Architecture boundaries (`domain/` vs `application/` vs `infrastructure/`).
   - Use `api-and-interface-design` for REST DTO contracts, input validation, and backwards compatibility.
   - Precedence: Application domain invariants override generic REST defaults.

5. **Existing Codebase Conventions:**
   - Repository-specific conventions (e.g. bilingual Khmer/English dictionary structure, Flyway migration versioning `V<n>__...sql`) always supersede generic agent rules.

---

## 4. Team Task Routing Matrix

Agents and developers should activate skills according to the nature of the task:

| Engineering Task | Recommended Skills to Activate | Key Objectives |
|---|---|---|
| **UX / UI Work & Theming** | `ui-ux-pro-max`<br>`tailwind-design-system`<br>`wcag-audit-patterns` | Ensure responsive layout, consistent OKLCH tokens, accessible contrast, and mobile readiness. |
| **React Component / State** | `react-state-management`<br>`vercel-react-best-practices`<br>`frontend-design` | Maintain clean Zustand store boundaries, eliminate unnecessary re-renders, handle loading states. |
| **Accessibility Audit / Remediation** | `wcag-audit-patterns`<br>`playwright`<br>`ui-styling` | Verify keyboard navigation, ARIA landmarks, form labels, and bilingual screen-reader behavior. |
| **Spring Boot API Development** | `spring-boot-engineer`<br>`architecture-patterns`<br>`api-and-interface-design` | Implement clean layered architecture, immutable DTO contracts, input validation, and error envelopes. |
| **Authentication & Tokens** | `auth-implementation-patterns`<br>`stride-analysis-patterns`<br>`security-best-practices` | Ensure secure JWT signing, refresh token rotation, OAuth2 handling, and CSRF protection. |
| **Payment & Webhook Flow** | `attack-tree-construction`<br>`api-and-interface-design`<br>`auth-implementation-patterns` | Map attack vectors, enforce idempotency keys, validate untrusted payloads, prevent double-spend. |
| **Database & Migration Work** | `sql-pro`<br>`performance-optimization`<br>`architecture-patterns` | Optimize queries, eliminate N+1 scans, design non-blocking Flyway migrations, verify index coverage. |
| **Performance Tuning & Profiling** | `performance-optimization`<br>`vercel-react-best-practices`<br>`sql-pro` | Measure before optimizing; optimize Core Web Vitals (LCP, INP, CLS); tune database bottlenecks. |
| **Full-Stack Feature Implementation** | `architecture-patterns`<br>`api-and-interface-design`<br>`react-state-management`<br>`wcag-audit-patterns`<br>`test-master` | End-to-end alignment from domain models and REST APIs to reactive Zustand stores and accessible UI. |

---

## 5. Team Bootstrap & Reproducibility Guide

The skill set is completely locked and self-contained within the repository.

### Verifying Installation Integrity

To verify that all skill files are present and match their cryptographic SHA-256 hashes:

**PowerShell (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
```

**Bash (Linux / macOS):**
```bash
chmod +x ./scripts/setup-ai-skills.sh
./scripts/setup-ai-skills.sh
```

### Lockfile Manifest (`ai-skills.lock.json`)

The lockfile pins each skill to:
- Upstream GitHub repository and exact Git commit SHA.
- License type and local target directory.
- Individual relative file paths, byte sizes, and SHA-256 checksums.

Never modify files inside `.agents/skills/` without updating `ai-skills.lock.json` and obtaining security approval.
