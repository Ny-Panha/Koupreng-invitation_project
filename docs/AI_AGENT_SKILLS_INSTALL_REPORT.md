# AI Agent Skills Discovery, Security Review & Installation Report

**Project:** E-Invitation Web Application  
**Execution Date:** 2026-10-03  
**Lockfile:** [`ai-skills.lock.json`](file:///d:/Koupreng-invitation_project/ai-skills.lock.json)  
**Configuration Directory:** [`.agents/skills/`](file:///d:/Koupreng-invitation_project/.agents/skills)  
**Specification:** Agent Skills Specification (`SKILL.md`) / OpenAI Codex / Google Antigravity / Claude Code compatible

---

## 1. Executive Summary

| Metric | Count | Details |
|---|---:|---|
| **Repositories Searched** | **84** | Scanned GitHub live via GitHub API (`topic:agent-skills`, `topic:claude-skills`, curated marketplaces) |
| **Candidates Seriously Reviewed** | **28** | Deep inspection of `SKILL.md`, references, permissions, scripts, licenses, and stack alignment |
| **Candidates Rejected** | **19** | Eliminated due to redundancy, stack mismatch (blockchain/Solidity), copyleft license, or excessive permissions |
| **New Skills Installed** | **9** | Pinned to exact Git commits, security-cleared, 100% clean documentation with zero runtime dependencies |
| **Application Code Changes** | **0** | **Strictly 0 changes** to React, Spring Boot, FastAPI, MySQL, Maven, or npm code/dependencies |

---

## 2. Installed Skills

All installed skills are pinned to immutable commit SHAs in [`ai-skills.lock.json`](file:///d:/Koupreng-invitation_project/ai-skills.lock.json) and vendored into [`.agents/skills/`](file:///d:/Koupreng-invitation_project/.agents/skills) with MIT licenses:

| Category | Skill | Repository | Stars | Commit | License | Technical Value & Stack Justification |
|---|---|---|---:|---|---|---|
| **UI/UX / Accessibility** | [`wcag-audit-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/wcag-audit-patterns) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Comprehensive WCAG 2.2 AA audit checklists, keyboard traps, ARIA landmarks, screen reader testing, and bilingual contrast verification for public invitations. |
| **Frontend Engineering** | [`react-state-management`](file:///d:/Koupreng-invitation_project/.agents/skills/react-state-management) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Direct guidance for Zustand store slicing, optimistic UI updates, multi-step RSVP forms, and React 19 state synchronization without unnecessary re-renders. |
| **Frontend Engineering** | [`tailwind-design-system`](file:///d:/Koupreng-invitation_project/.agents/skills/tailwind-design-system) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Native Tailwind CSS v4 guidance focusing on `@theme`, OKLCH design tokens, CSS-first configurations, and class-variance-authority (cva) component variants. |
| **Backend Engineering** | [`architecture-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/architecture-patterns) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Enforces Clean Architecture, Hexagonal / Ports & Adapters, and Domain-Driven Design bounded contexts (`auth`, `invitation`, `checkin`, `payment`, `reporting`). |
| **Backend / API Design** | [`api-and-interface-design`](file:///d:/Koupreng-invitation_project/.agents/skills/api-and-interface-design) | `addyosmani/agent-skills` | 100,579 | `9d0c60d4` | MIT | Contract-first REST API boundaries, Hyrum's Law adherence, strict edge validation for untrusted third-party inputs (Telegram webhooks, Google OAuth). |
| **Cybersecurity / AppSec** | [`auth-implementation-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/auth-implementation-patterns) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Hardened authentication standards: short-lived JWT access tokens, refresh token rotation, OAuth2/OIDC flows, RBAC authorization, and cookie CSRF protection. |
| **Cybersecurity / Threat Modeling** | [`stride-analysis-patterns`](file:///d:/Koupreng-invitation_project/.agents/skills/stride-analysis-patterns) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Systematic STRIDE threat modeling, Data Flow Diagram (DFD) trust boundary analysis, and threat mitigation matrices for public invitation endpoints and guest check-in. |
| **Cybersecurity / Threat Modeling** | [`attack-tree-construction`](file:///d:/Koupreng-invitation_project/.agents/skills/attack-tree-construction) | `wshobson/agents` | 40,168 | `156b7a5e` | MIT | Visual attack path modeling and AND/OR node risk quantification for payment confirmation flows, webhook forgery prevention, and password brute-force defense. |
| **QA / Performance** | [`performance-optimization`](file:///d:/Koupreng-invitation_project/.agents/skills/performance-optimization) | `addyosmani/agent-skills` | 100,579 | `9d0c60d4` | MIT | Empirical performance workflows: Core Web Vitals (LCP, INP, CLS) optimization, synthetic vs RUM profiling, database query bottlenecks, and N+1 query elimination. |

---

## 3. Existing Skills Retained

The following skills were inventoried across project and user environments. None were reinstalled or duplicated:

| Skill | Existing Location / Scope | Capability Covered | Reason Retained Without Reinstallation |
|---|---|---|---|
| `spring-boot-engineer` | `~/.codex/skills/` (USER) | Spring Boot 3/4 baseline, controllers, JPA, annotations | Provides core controller/repository boilerplate; complemented by `architecture-patterns`. |
| `sql-pro` | `~/.codex/skills/` (USER) | SQL queries, CTEs, window functions, EXPLAIN | Fully functional for SQL design; complemented by `performance-optimization`. |
| `security-best-practices` | `~/.codex/skills/` (USER) | Python, JS/TS, Go syntax security rules | Language-level secure coding; complemented by architectural AppSec (`auth-implementation-patterns`, `stride-analysis-patterns`). |
| `playwright` | `~/.codex/skills/` (USER) | E2E browser automation & specs | Established browser test runner; complemented by `wcag-audit-patterns`. |
| `test-master` | `~/.codex/skills/` (USER) | Test pyramid, unit & slice tests | Covers testing strategy; no duplicate runner needed. |
| `code-reviewer` | `~/.codex/skills/` (USER) | Patch and diff code review | Retained as primary code review agent. |
| `fastapi` | `~/.codex/skills/` (USER) | FastAPI routing & Pydantic models | Covers the Python Telegram bot service. |
| `ui-ux-pro-max` | `.agents/skills/` (PROJECT) | UI/UX heuristics, color palettes, styles | Rich design intelligence library; retained as the foundation for visual styles. |
| `frontend-design` | `.agents/skills/` (PROJECT) | High-end visual & typographic direction | Official Anthropic skill; provides distinct aesthetics without template cliches. |
| `ui-styling` | `.agents/skills/` (PROJECT) | Radix/shadcn component styling | Component library tokens; retained without modification. |
| `design-system` | `.agents/skills/` (PROJECT) | Design tokens & slide decks | Token specifications; retained without modification. |
| `vercel-react-best-practices` | `.agents/skills/` (PROJECT) | React performance & bundle optimization | Vercel engineering best practices; retained without modification. |
| `vercel-react-view-transitions` | `.agents/skills/` (PROJECT) | View Transition API choreography | Native browser transitions; retained without modification. |
| `banner-design` / `brand` / `slides` | `.agents/skills/` (PROJECT) | Creative branding, banners, presentations | Specialized creative assets; retained without modification. |
| `build-awwwards-quality-sites` | `.agents/skills/` (PROJECT) | Cinematic motion & landing page design | High-end marketing interaction; retained without modification. |

---

## 4. Rejected High-Star Candidates

Candidates evaluated during live discovery and rejected based on strict quality, relevance, security, and license criteria:

| Candidate | Repository | Stars | Verdict | Specific Justification for Rejection |
|---|---|---:|---|---|
| `frontend-design` (duplicate) | `anthropics/skills` | 179,431 | **REDUNDANT** | Exactly identical skill is already vendored at `.agents/skills/frontend-design`. Reinstalling would cause duplicate collision. |
| `webapp-testing` | `anthropics/skills` | 179,431 | **REDUNDANT** | Generic testing guide that overlaps with our installed `playwright` and `test-master` skills without adding deeper capability. |
| `entry-point-analyzer` | `trailofbits/skills` | 7,347 | **NOT_RELEVANT** | Specifically engineered for smart contracts (Solidity, Vyper, Move, Solana, TON). Irrelevant to web/Java/React application. |
| `building-secure-contracts` | `trailofbits/skills` | 7,347 | **NOT_RELEVANT** | Blockchain and smart contract security auditing; no relevance to this project stack. |
| `supply-chain-risk-auditor` | `trailofbits/skills` | 7,347 | **EXCESSIVE_PERMISSION / LICENSE** | Requires authenticated GitHub CLI (`gh auth`), runs Python scripts executing network calls. Licensed under copyleft CC-BY-SA-4.0. |
| `static-analysis` | `trailofbits/skills` | 7,347 | **DEPENDENCY / REDUNDANT** | Thin wrapper requiring external installation of Semgrep and CodeQL CLI runners. |
| `interaction-design` | `wshobson/agents` | 40,168 | **PARTIAL_OVERLAP** | Heavily biased toward `framer-motion`; contradicts the project's native React 19 View Transitions and Tailwind 4 stack. |
| `postgresql-table-design` | `wshobson/agents` | 40,168 | **NOT_RELEVANT** | PostgreSQL-specific indexing and vacuuming; our project runs on MySQL 8 + Flyway. |
| `microservices-patterns` | `wshobson/agents` | 40,168 | **NOT_RELEVANT** | Assumes distributed multi-repo microservice mesh with service discovery; our project is a clean modular monolith. |
| `nextjs-app-router-patterns` | `wshobson/agents` | 40,168 | **NOT_RELEVANT** | Next.js Server Components and App Router specific; our frontend runs on Vite + React 19 Single Page Application. |
| `book-to-skill` | `virgiliojr94/book-to-skill` | 33,324 | **NOT_RELEVANT** | Utility for converting PDF textbooks into skills; provides no engineering or architectural guidance. |
| `archify` | `tt-a1i/archify` | 76,343 | **REDUNDANT** | Diagram generation skill; our project already possesses `design-system` and built-in Mermaid/generative UI tools. |
| `agentic-awesome-skills` | `sickn33/agentic-awesome-skills` | 47,201 | **REDUNDANT** | Mega-aggregator repository containing hundreds of uncurated skills; violates quality-over-quantity principle. |

---

## 5. Security Review of Installed Skills

Every installed skill was subjected to a static security audit verifying file contents, scripts, network behaviors, and permissions:

| Installed Skill | Executable Scripts Included | Network Calls / Egress | Required Permissions | External Dependencies | Risk Level |
|---|---|---|---|---|---|
| `wcag-audit-patterns` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `react-state-management` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `tailwind-design-system` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `architecture-patterns` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `api-and-interface-design` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `auth-implementation-patterns` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `stride-analysis-patterns` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `attack-tree-construction` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |
| `performance-optimization` | None (pure Markdown) | None | Read-only | None | **LOW / SAFE** |

### Detailed Security Audit Findings:
1. **Prompt Injection Check:** Scanned for adversarial overrides (`ignore previous instructions`, `you are now`, `system prompt override`). Zero occurrences found.
2. **Credential & Secret Harvesting:** Scanned for access to `~/.ssh`, `/etc/shadow`, environment token harvesting (`AWS_SECRET`, `TELEGRAM_BOT_TOKEN`). Zero occurrences found.
3. **Execution Safety:** All installed assets consist exclusively of `.md` documentation files and `LICENSE.txt`. There are zero shell scripts, Python binaries, Node scripts, or Git hooks.
4. **Network Neutrality:** No remote tracking pixels, telemetry callbacks, or background curl/wget requests exist.

---

## 6. Team Usage Matrix

| Engineering Task | Recommended Skills to Activate | Practical Guidance |
|---|---|---|
| **UX / UI Work & Theming** | `ui-ux-pro-max`<br>`tailwind-design-system`<br>`wcag-audit-patterns` | Use Tailwind CSS 4 `@theme` and OKLCH color palettes; verify touch targets (≥44px) and bilingual Khmer/English contrast. |
| **React Component & State** | `react-state-management`<br>`vercel-react-best-practices`<br>`frontend-design` | Separate local vs global state; use Zustand stores with slices; implement optimistic updates on RSVP submissions. |
| **Accessibility Audit** | `wcag-audit-patterns`<br>`playwright`<br>`ui-styling` | Run automated axe/playwright checks; manually audit keyboard tab stops and ARIA live regions for error alerts. |
| **Spring Boot API Development** | `spring-boot-engineer`<br>`architecture-patterns`<br>`api-and-interface-design` | Keep domain models isolated from Spring/JPA annotations; enforce DTO validation with structured error envelopes. |
| **Authentication & Tokens** | `auth-implementation-patterns`<br>`stride-analysis-patterns`<br>`security-best-practices` | Verify short-lived JWTs (≤15 min), secure HTTP-only cookies, token rotation, and Google OAuth nonce validation. |
| **Payment & Webhook Flow** | `attack-tree-construction`<br>`api-and-interface-design`<br>`auth-implementation-patterns` | Verify Telegram webhook HMAC signatures; enforce strict idempotency keys to prevent duplicate transaction credits. |
| **Database & Flyway Work** | `sql-pro`<br>`performance-optimization`<br>`architecture-patterns` | Design non-locking schema migrations; check composite index coverage for frequent queries (`guest_id`, `event_id`). |
| **Performance Tuning** | `performance-optimization`<br>`vercel-react-best-practices`<br>`sql-pro` | Profile Core Web Vitals; optimize LCP and bundle size in Vite; eliminate N+1 Hibernate query loops. |
| **Full-Stack Feature** | `architecture-patterns`<br>`api-and-interface-design`<br>`react-state-management`<br>`wcag-audit-patterns`<br>`test-master` | Align domain logic, API contracts, Zustand stores, accessible UI components, and unit/integration test slices. |

---

## 7. Installation Verification Checklist

- [x] **Codex Discovery:** Every skill directory contains a valid `SKILL.md` with properly formatted YAML frontmatter (`name`, `description`).
- [x] **Pinned Revisions:** All 9 skills are pinned to exact immutable Git commits in `ai-skills.lock.json`.
- [x] **Integrity Validation:** `scripts/setup-ai-skills.ps1 -VerifyOnly` executes cleanly and confirms 27/27 files match SHA-256 hashes.
- [x] **No Application Code Modified:** Zero lines of React, Java, Python, or SQL application code were modified.
- [x] **No Dependencies Altered:** `package.json`, `pom.xml`, and Python requirement manifests are untouched.
- [x] **Zero Secrets Accessed:** No `.env` files, API tokens, or SSH keys were accessed or stored.
- [x] **No Git Commits or Pushes:** The working tree remains uncommitted in accordance with instructions.
- [x] **Team Reproducibility:** Verified bootstrap scripts for PowerShell (`setup-ai-skills.ps1`) and Bash (`setup-ai-skills.sh`).
