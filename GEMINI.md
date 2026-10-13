@./AGENTS.md

# Gemini CLI Agent Guide

## Skill Routing & Workspace Discovery
- Gemini CLI discovers workspace skills natively from `.agents/skills/`. Do not duplicate skill directories.
- Always consult [`.agents/ROUTER.md`](.agents/ROUTER.md) first to select the single primary skill and optional supporting skills.
- Read only the required `SKILL.md` and relevant reference documentation.
- Maintain minimal context by loading files with precise line slices when inspecting source code.
- Enforce the precedence hierarchy in `AGENTS.md`: Security > Framework Contracts > Koupreng Skills > Vendor Skills > Generic Styling.

