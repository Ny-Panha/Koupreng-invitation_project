# Repository AI skills setup and verification

The repository-local skills are listed in [the skills index](../../.agents/SKILLS_INDEX.md).
Start with [the router](../../.agents/ROUTER.md), select one primary skill and at
most two supporting skills, and read the selected instructions before editing.
The [repository guidance](../../AGENTS.md) remains authoritative.

From the repository root, inspect the installed skills without installing or
overwriting anything:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
python scripts/validate-agent-routing.py
```

The verification command checks the existing pinned skills and documentation
references. A failed verification is a failure to investigate; it does not
authorize replacing local skills or bypassing integrity checks. Consult the
[setup script](../../scripts/setup-ai-skills.ps1) and
[Python implementation](../../scripts/setup_ai_skills.py) before an explicitly
requested installation or update.

This compatibility page restores the existing reference from `CLAUDE.md` found
missing during Phase 13 revalidation. It introduces no skill or dependency update.
