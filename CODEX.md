# CODEX.md — Codex Assistant Companion Guide

> **Important System Note:** OpenAI Codex automatically discovers and loads [`AGENTS.md`](AGENTS.md) at the repository root as its canonical instruction file. Codex does not load `CODEX.md` by default. This document serves as a companion reference for developers and agents looking for Codex-specific workflow optimizations.

---

## 1. Operating from Repository Root

Always begin interactions and shell executions from the project root (`Koupreng-invitation_project`). All relative paths in documentation and scripts assume execution from the root directory.

---

## 2. Skill Routing Workflow

1. Read the user request.
2. Consult [`.agents/ROUTER.md`](.agents/ROUTER.md) to pick the matching primary skill and optional supporting skills.
3. Inspect the chosen skill's `SKILL.md` (e.g. `.agents/skills/koupreng-backend-standards/SKILL.md`).
4. Read only specific reference files needed for the task (e.g. `.agents/skills/koupreng-backend-standards/references/architecture-rules.md`).
5. Proceed to examine actual source code before generating patches.

---

## 3. Minimal Context Loading & Token Economy

- **Do Not Ingest Entire Directories:** Use targeted line slices or file inspection rather than bulk-reading complete modules.
- **Do Not Read Unrelated Skills:** Strictly limit your context to the active primary skill and supporting skills.
- **Targeted Grep / Search:** Use targeted regex or file searches instead of crawling all files recursively.

---

## 4. Focused Code Changes

- Make surgical edits to specific lines or functions.
- Do not reformat untouched code, update unrelated dependencies, or refactor unrelated classes.
- Maintain existing comments, licenses, and architecture boundaries.

---

## 5. Risk-Based Test Selection

Run tests appropriate to the change:
- **Frontend Component:** `npm --prefix apps/frontend-user test` or `npx --prefix apps/frontend-user vitest run <file>`.
- **Backend Architecture:** `mvn -f apps/backend/pom.xml test -Dtest=ArchitectureRulesTests`.
- **Backend Service:** `mvn -f apps/backend/pom.xml test -Dtest=<ServiceName>Test`.
- **Skills Integrity:** `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly`.

---

## 6. Reporting Expectations

- Detail exact terminal commands executed.
- Report real pass/fail counts and execution times.
- If a tool or test is blocked by the environment (e.g. missing Docker daemon or browser binaries), state this transparently. Never fabricate test output.

