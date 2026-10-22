@./AGENTS.md

# Claude Code Agent Guide

## Skill Routing & Execution
- Before implementing any change, consult [`.agents/ROUTER.md`](.agents/ROUTER.md) to identify the primary and supporting skills.
- Read the corresponding `.agents/skills/<skill-name>/SKILL.md` before touching code.
- Run the [team setup script](docs/development/AI_SKILLS_SETUP.md) to copy the canonical `.agents/skills/` into Claude Code's project discovery directory, `.claude/skills/`.
- For tool searches in `ui-ux-pro-max`, execute the portable project command:
  ```bash
  python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
  ```
- Respect risk-based test verification outlined in `koupreng-qa-release`.

