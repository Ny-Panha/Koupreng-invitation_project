# Koupreng AI Agent Skills Index

This document provides a comprehensive catalogue of all project-local AI agent skills located in `.agents/skills/`.

---

## 1. Project-Specific Koupreng Skills (Canonical)

| Skill Name | Path | Primary Trigger & Capabilities |
|---|---|---|
| [`koupreng-premium-ux`](skills/koupreng-premium-ux/SKILL.md) | `.agents/skills/koupreng-premium-ux` | Cambodian wedding elegance, Khmer typography (Moul, Noto Serif/Sans Khmer), gold/cream design tokens, 3D envelope/wax seal opening animations, wedding templates. |
| [`koupreng-backend-standards`](skills/koupreng-backend-standards/SKILL.md) | `.agents/skills/koupreng-backend-standards` | Java 25 & Spring Boot 4.0.8 compatibility overlay, clean architecture boundaries, ArchUnit enforcement, DTO validation, transaction management. |
| [`koupreng-payment-security`](skills/koupreng-payment-security/SKILL.md) | `.agents/skills/koupreng-payment-security` | Static ABA PayWay links, Telegram merchant alert webhook reconciliation, PENDING order lifecycle, payer suffix matching, replay prevention. |
| [`koupreng-database-flyway`](skills/koupreng-database-flyway/SKILL.md) | `.agents/skills/koupreng-database-flyway` | MySQL 8, forward-only Flyway migrations (`V<N>__*.sql`), composite indexes, Hibernate schema validation, USD/KHR dual-currency separation. |
| [`koupreng-qa-release`](skills/koupreng-qa-release/SKILL.md) | `.agents/skills/koupreng-qa-release` | Risk-based test selection, Vitest, ArchUnit, Playwright E2E browser flows, release checklists, accurate test reporting without fabrication. |
| [`koupreng-deployment`](skills/koupreng-deployment/SKILL.md) | `.agents/skills/koupreng-deployment` | Low-budget VPS architecture: Cloudflare WAF, Nginx reverse proxy, Docker Compose services, container health checks, automated backups. |

---

## 2. Pinned & Security-Audited Vendor Skills (`ai-skills.lock.json`)

All skills in this section are pinned to exact Git commits and validated via SHA-256 hashes:

| Skill Name | Path | Source & Commit | License | Domain / Trigger |
|---|---|---|---|---|
| [`sast-configuration`](skills/sast-configuration/SKILL.md) | `.agents/skills/sast-configuration` | `wshobson/agents` (`156b7a5e`) | MIT | Static Application Security Testing (Semgrep, CodeQL, SonarQube) across Java, Python, JavaScript. |
| [`wcag-audit-patterns`](skills/wcag-audit-patterns/SKILL.md) | `.agents/skills/wcag-audit-patterns` | `wshobson/agents` (`156b7a5e`) | MIT | WCAG 2.2 AA accessibility audit matrices, ARIA roles, bilingual contrast, keyboard navigation. |
| [`react-state-management`](skills/react-state-management/SKILL.md) | `.agents/skills/react-state-management` | `wshobson/agents` (`156b7a5e`) | MIT | Zustand store slice architecture, optimistic UI updates, form/URL state synchronization. |
| [`tailwind-design-system`](skills/tailwind-design-system/SKILL.md) | `.agents/skills/tailwind-design-system` | `wshobson/agents` (`156b7a5e`) | MIT | Native Tailwind CSS v4 `@theme` configuration, design tokens, responsive typography. |
| [`architecture-patterns`](skills/architecture-patterns/SKILL.md) | `.agents/skills/architecture-patterns` | `wshobson/agents` (`156b7a5e`) | MIT | Clean Architecture, Hexagonal / Ports & Adapters, Domain-Driven Design bounded contexts. |
| [`api-and-interface-design`](skills/api-and-interface-design/SKILL.md) | `.agents/skills/api-and-interface-design` | `addyosmani/agent-skills` (`9d0c60d4`) | MIT | Contract-first REST API design, Hyrum's Law adherence, strict input validation boundaries. |
| [`auth-implementation-patterns`](skills/auth-implementation-patterns/SKILL.md) | `.agents/skills/auth-implementation-patterns` | `wshobson/agents` (`156b7a5e`) | MIT | Short-lived JWTs, refresh token rotation, OAuth2/OIDC flows, RBAC authorization. |
| [`stride-analysis-patterns`](skills/stride-analysis-patterns/SKILL.md) | `.agents/skills/stride-analysis-patterns` | `wshobson/agents` (`156b7a5e`) | MIT | Systematic STRIDE threat analysis, Data Flow Diagrams, threat mitigation mappings. |
| [`attack-tree-construction`](skills/attack-tree-construction/SKILL.md) | `.agents/skills/attack-tree-construction` | `wshobson/agents` (`156b7a5e`) | MIT | Attack path graph modeling, AND/OR logic trees, defense gap identification. |
| [`performance-optimization`](skills/performance-optimization/SKILL.md) | `.agents/skills/performance-optimization` | `addyosmani/agent-skills` (`9d0c60d4`) | MIT | Core Web Vitals (LCP, INP, CLS), frontend bundle profiling, backend query optimization. |

---

## 3. General Engineering & Design Skills

| Skill Name | Path | Trigger & Focus Area |
|---|---|---|
| [`ui-ux-pro-max`](skills/ui-ux-pro-max/SKILL.md) | `.agents/skills/ui-ux-pro-max` | UI/UX heuristics database (run portable search via `python .agents/skills/ui-ux-pro-max/scripts/search.py`). |
| [`frontend-design`](skills/frontend-design/SKILL.md) | `.agents/skills/frontend-design` | Distinctive visual styling, bespoke art direction, avoiding boilerplate AI aesthetics. |
| [`vercel-react-best-practices`](skills/vercel-react-best-practices/SKILL.md) | `.agents/skills/vercel-react-best-practices` | Vercel engineering performance guidelines for React components and bundles. |
| [`vercel-react-view-transitions`](skills/vercel-react-view-transitions/SKILL.md) | `.agents/skills/vercel-react-view-transitions` | Native browser View Transition API choreography. |
| [`spring-boot-engineer`](skills/spring-boot-engineer/SKILL.md) | `.agents/skills/spring-boot-engineer` | Baseline Spring Boot patterns (use with `koupreng-backend-standards` overlay). |
| [`sql-pro`](skills/sql-pro/SKILL.md) | `.agents/skills/sql-pro` | SQL query optimization, CTEs, window functions, EXPLAIN plan analysis. |
| [`playwright`](skills/playwright/SKILL.md) | `.agents/skills/playwright` | E2E browser automation (run via `npm --prefix apps/frontend-user run test:e2e`). |
| [`test-master`](skills/test-master/SKILL.md) | `.agents/skills/test-master` | Test strategies, test pyramid design, mocking patterns, defect reporting. |
| [`security-best-practices`](skills/security-best-practices/SKILL.md) | `.agents/skills/security-best-practices` | Secure coding standards for Python, JavaScript/TypeScript, and Go. |
| [`code-reviewer`](skills/code-reviewer/SKILL.md) | `.agents/skills/code-reviewer` | Automated diff inspection, defect detection, and quality gates. |
| [`fastapi`](skills/fastapi/SKILL.md) | `.agents/skills/fastapi` | FastAPI endpoint patterns, Pydantic schemas, and uvicorn configuration. |
| [`build-awwwards-quality-sites`](skills/build-awwwards-quality-sites/SKILL.md) | `.agents/skills/build-awwwards-quality-sites` | High-impact interactive animations and landing page visual direction. |
| [`banner-design`](skills/banner-design/SKILL.md) | `.agents/skills/banner-design` | Promotional and social banner generation. |
| [`brand`](skills/brand/SKILL.md) | `.agents/skills/brand` | Brand identity, voice, tone, and visual guidelines. |
| [`design`](skills/design/SKILL.md) | `.agents/skills/design` | General design tokens, corporate identity programs, and presentation decks. |
| [`design-system`](skills/design-system/SKILL.md) | `.agents/skills/design-system` | Token architecture and UI component specifications. |
| [`slides`](skills/slides/SKILL.md) | `.agents/skills/slides` | Interactive presentation slides with Chart.js. |
| [`ui-styling`](skills/ui-styling/SKILL.md) | `.agents/skills/ui-styling` | Radix UI / shadcn style component integration. |
| [`web-design-guidelines`](skills/web-design-guidelines/SKILL.md) | `.agents/skills/web-design-guidelines` | Web interface guidelines and accessibility checks. |
| [`styleseed` suite](skills/styleseed/SKILL.md) | `.agents/skills/styleseed` | StyleSeed UI design tokens and review tools (`ss-*`). |

