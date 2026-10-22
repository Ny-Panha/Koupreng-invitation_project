# Team AI skills setup

After cloning this repository, run one command to make the bundled engineering,
design, security, testing, and Koupreng skills available to Codex and Claude Code.
Requires **Python 3.10+** and your chosen coding agent installed and signed in.
No Python packages, administrator access, or API keys are needed for setup.

## Windows

From the repository root in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1
```

This enables both agents for this checkout. To choose one agent:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -Agent codex
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -Agent claude
```

## macOS, Linux, WSL, or Git Bash

```bash
bash scripts/setup-ai-skills.sh
# Optional: choose one agent
bash scripts/setup-ai-skills.sh --agent claude
```

The Python entry point also works directly on every supported platform:

```bash
python scripts/setup_ai_skills.py --agent all --scope project
```

Launchers locate the checkout from their own location, so an absolute script path
also works when your current directory is elsewhere or contains spaces.

## What gets installed

| Agent | Default: this project | Optional: current user's account |
| --- | --- | --- |
| Codex | Uses the existing `.agents/skills/` directly | Copies to `~/.agents/skills/` |
| Claude Code | Copies to `.claude/skills/` | Copies to `~/.claude/skills/` |

The default stays within the checkout. For personal availability across repositories:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -Scope user
```

```bash
bash scripts/setup-ai-skills.sh --scope user
```

`~` means the home directory of the account running the command. Use `-Agent` or
`--agent` with user scope to install for only one agent. Koupreng-specific skills
still rely on this project's architecture, source files, and routing documents;
use them with this checkout open. Project scope is the team default.

The installer includes **every skill directory in `.agents/skills/`**, including
references, scripts, data, assets, and licenses. It runs the existing routing
validator first: pinned vendor files must match `ai-skills.lock.json`, custom
skills must have their required assets, and all skill frontmatter and entry
documents must pass validation. Other bundled skills are checked structurally;
they do not have vendor hashes unless listed in the lockfile.

Copies are checked against the source bytes. Setup runs offline and does not
execute bundled skill scripts. Generated Claude copies and backups are ignored
by Git. The source of truth remains `.agents/skills/`; edit skills there.

## Start using the skills

Open the repository in a **new Codex or Claude Code session**, then use a prompt
such as:

> Read AGENTS.md and .agents/ROUTER.md. Choose the appropriate primary skill and
> up to two supporting skills, then improve the registration flow and run the
> relevant checks.

Codex reads `AGENTS.md`; Claude Code reads `CLAUDE.md`, which imports `AGENTS.md`.
Both should select skills for the task instead of loading all instructions at
once. Browse the [skill index](../../.agents/SKILLS_INDEX.md) for available skills.

Discovery locations follow the official [Codex documentation](https://learn.chatgpt.com/docs/build-skills)
and [Claude Code documentation](https://code.claude.com/docs/en/skills).
Other coding agents can follow `AGENTS.md` and read the canonical skills, but
this script configures native discovery for Codex and Claude Code only.

## Verify, update, and troubleshoot

Read-only source verification (also suitable for CI):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
```

```bash
bash scripts/setup-ai-skills.sh --verify-only
python scripts/validate-agent-routing.py
```

After pulling skill changes, rerun setup. Identical installed copies are skipped.
Different copies cause setup to stop before changing any destination. To update
them, use `-Force` in PowerShell or `--force` in Bash/Python, keeping the same
agent and scope options. Each previous copy is preserved under the affected
agent's `skill-backups/setup-*/` directory, outside its skill discovery path.
Unrelated installed skills are preserved. A failed replacement restores the
previous copy; rerunning setup can finish a partially completed installation.

If source verification fails, restore the reported files from the team's
reviewed Git revision and rerun. Force only replaces installed copies; it cannot
bypass source verification or download/repair missing repository skills.
Verification currently reports an existing duplicate React skill name; both
bundled folders are preserved. This notice does not fail setup.

If Python is missing, install Python 3.10+ with its launcher/PATH option, reopen
the terminal, and retry. Agent runtimes and optional tools used by individual
skills (such as Node.js or Playwright) are installed separately.
