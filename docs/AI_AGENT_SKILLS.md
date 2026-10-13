# Team AI Agent Skills Guide — Koupreng E-Invitation Project

> **Project Stack Alignment:** React 19 (Vite 8, Tailwind CSS 4, Zustand 5, React Router 7) · Spring Boot 4.0.8 / Java 25 (Spring Security, JPA/Hibernate, Flyway) · MySQL 8.0 (`utf8mb4_unicode_ci`, Redis 7.4) · FastAPI / Telegram Bot · Strict AppSec (JWT, Google Auth, Telegram Webhook HMAC, ABA Payment Reconciliation).

---

## 1. What the Skills System Does

The Koupreng AI Agent Skills infrastructure equips AI coding assistants (OpenAI Codex, Claude Code, Gemini CLI, Antigravity, Cursor) with modular, domain-specific engineering guidance. Rather than dumping entire style guides, architecture patterns, and security manuals into every context window, skills are loaded **on-demand** based on the active task.

---

## 2. Where Canonical Skill Files Live

All canonical, project-local skill packages live directly under:
```text
.agents/skills/<skill-name>/
  ├── SKILL.md          # Primary specification with YAML frontmatter
  └── references/       # Targeted technical deep-dives
```

The router and index live at:
- **Routing Engine:** [`.agents/ROUTER.md`](../.agents/ROUTER.md)
- **Skills Directory Index:** [`.agents/SKILLS_INDEX.md`](../.agents/SKILLS_INDEX.md)
- **Integrity Lockfile:** [`ai-skills.lock.json`](../ai-skills.lock.json)

---

## 3. How Codex, Claude, and Gemini Discover Instructions

- **OpenAI Codex:** Automatically discovers and loads [`AGENTS.md`](../AGENTS.md) at the repository root. `AGENTS.md` directs Codex to consult [`.agents/ROUTER.md`](../.agents/ROUTER.md). Supplementary workflow details live in [`CODEX.md`](../CODEX.md).
- **Claude Code:** Automatically reads [`CLAUDE.md`](../CLAUDE.md) at the root, which imports canonical instructions via `@./AGENTS.md` and discovers project skills in `.agents/skills/`.
- **Gemini CLI:** Reads [`GEMINI.md`](../GEMINI.md) at the root, importing `@./AGENTS.md` and recognizing the workspace skill path `.agents/skills/`.

---

## 4. How a Skill is Selected

AI agents and team members follow a deterministic selection process:
1. Identify the task domain (e.g. Wedding invitation UI, Spring Boot API, Payment reconciliation).
2. Consult the decision matrix in [`.agents/ROUTER.md`](../.agents/ROUTER.md).
3. Select **one primary skill**.
4. Select **at most two supporting skills** if the task spans multiple disciplines.
5. Read only the chosen skill's `SKILL.md` and required `references/` before touching code.

---

## 5. How to Verify Installation

Run the automated integrity verification tools from the project root:

**PowerShell (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
```

**Bash / Git Bash (Linux / macOS / Windows):**
```bash
./scripts/setup-ai-skills.sh
```

**Python 3 (Cross-Platform Routing & Hash Validator):**
```powershell
python scripts/validate-agent-routing.py
```

All 10 pinned external skills, 6 custom Koupreng skills, frontmatter manifests, router references, and entry file imports are verified with exit code 0.

---

## 6. How to Add an Approved Skill

To introduce a new third-party skill:
1. Verify upstream repository ownership and license (MIT, Apache-2.0, or BSD). Reject copyleft (GPL, CC-BY-SA) or unverified sources.
2. Resolve an immutable Git commit SHA (never track mutable branches).
3. Inspect `SKILL.md` for executable commands, prompt injections, or unauthorized network calls.
4. Prefer documentation-only skills with zero external runtime dependencies.
5. Vendor into `.agents/skills/<skill-name>/`.
6. Calculate SHA-256 hashes and byte counts for all files.
7. Record the entry into `ai-skills.lock.json`.
8. Update `.agents/SKILLS_INDEX.md` and `.agents/ROUTER.md`.
9. Verify using `python scripts/validate-agent-routing.py`.

---

## 7. How to Update a Pinned Skill

1. Identify the new target upstream commit SHA.
2. Review the upstream diff and verify security compliance.
3. Update the files in `.agents/skills/<skill-name>/`.
4. Recompute file hashes and update `ai-skills.lock.json`.
5. Run `python scripts/validate-agent-routing.py` and commit changes.

---

## 8. How to Avoid Conflicting Skills

When skills offer overlapping or differing recommendations, follow this strict precedence hierarchy:
1. **Security Invariants & Codebase Constraints:** Token expiration, HMAC webhook validation, server-owned prices, and IDOR prevention take precedence over all else.
2. **Framework & Architecture Contracts:** Java 25 / Spring Boot 4 boundaries, ArchUnit tests, and React 19 conventions override generic tutorials.
3. **Koupreng Custom Skills:** (`koupreng-*` custom skills provide the authoritative overlay).
4. **Validated Vendor Skills:** Pinned skills in `ai-skills.lock.json`.
5. **Generic Aesthetic Defaults:** General styling guidelines.

*Repository code conventions and existing test suites always override generic skill defaults.*

---

## 9. How to Troubleshoot Skill Activation

| Issue | Root Cause | Solution |
|---|---|---|
| Agent ignores custom skill | Agent did not read `ROUTER.md` | In your prompt, remind the agent: "Consult `.agents/ROUTER.md` and activate `koupreng-backend-standards`." |
| Hash mismatch error in script | File was edited without updating lockfile | Revert accidental edits in `.agents/skills/` or update checksum in `ai-skills.lock.json`. |
| Script references `CLAUDE_PLUGIN_ROOT` | Outdated environment path in third-party skill | Use the portable project command: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>"`. |
| Spring Boot 3 deprecated annotations | Generic `spring-boot-engineer` loaded alone | Activate `koupreng-backend-standards` as primary skill for Spring Boot 4 & Java 25 compatibility. |

---

## 10. How to Reduce Context & Token Usage

1. **Never Load All Skills:** Do not load the whole `.agents/skills` tree into context.
2. **Read Slices, Not Entire Files:** Inspect only the specific lines or classes under modification.
3. **Targeted Reference Loading:** Only open references directly relevant to the current user request (e.g. read `aba-telegram-reconciliation.md` only when touching payments).
4. **Run Targeted Tests:** Run only unit tests covering the modified function instead of the entire monorepo suite.

---

## 11. Practical Team Routing Examples

### Example A: Premium Wedding Invitation UI
> **User Prompt:** "Improve my wedding invitation UI to look premium."  
> **Routing:**
> - **Primary:** `koupreng-premium-ux`
> - **Supporting:** `ui-ux-pro-max`, `frontend-design`  
> - **Action:** Apply gold/cream palettes (`--wed-gold-400`, `--wed-cream`), refine Khmer typography (`Moul` display headers, `Noto Sans Khmer` body with `leading-relaxed`), ensure 3D wax seal or envelope opening animation respects reduced-motion.

### Example B: Secure Spring Boot API Endpoint
> **User Prompt:** "Build a secure Spring Boot endpoint for guest RSVP check-in."  
> **Routing:**
> - **Primary:** `koupreng-backend-standards`
> - **Supporting:** `api-and-interface-design`, `spring-boot-engineer`  
> - **Action:** Implement clean architecture boundaries, ensure controller delegates to application use case, validate request DTO with Jakarta constraints, return `ApiResponse<T>`, verify with ArchUnit test (`mvn test -Dtest=ArchitectureRulesTests`).

### Example C: ABA Telegram Payment Reconciliation
> **User Prompt:** "Test ABA Telegram payment verification and settle candidate orders."  
> **Routing:**
> - **Primary:** `koupreng-payment-security`
> - **Supporting:** `koupreng-qa-release`, `stride-analysis-patterns`  
> - **Action:** Verify webhook secret and bot ID whitelisting, enforce pessimistic locking on candidate order, match exact amount and currency, check payer suffix, prevent double-spend replay, test scenario without granting access to unverified browser claims.

### Example D: Guest Management QA
> **User Prompt:** "Run QA on the guest management module."  
> **Routing:**
> - **Primary:** `koupreng-qa-release`
> - **Supporting:** `test-master`, `playwright`  
> - **Action:** Execute targeted Vitest specs in `apps/frontend-user/src/features/guests/`, execute backend guest service unit tests, run Playwright E2E smoke tests if browser flows are affected, report exact pass/fail counts.

### Example E: Security Audit & SAST
> **User Prompt:** "Review security vulnerabilities and configure static analysis."  
> **Routing:**
> - **Primary:** `sast-configuration`
> - **Supporting:** `security-best-practices`, `stride-analysis-patterns`  
> - **Action:** Configure Semgrep and CodeQL rules for Java, Python, and TypeScript, review authentication token lifetimes, audit webhook boundaries, verify no hardcoded secrets exist.
