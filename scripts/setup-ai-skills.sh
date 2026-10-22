#!/usr/bin/env bash
# Verify and install all bundled skills. See docs/development/AI_SKILLS_SETUP.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for candidate in python3 python; do
    if command -v "${candidate}" >/dev/null 2>&1 &&
        "${candidate}" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
        exec "${candidate}" "${SCRIPT_DIR}/setup_ai_skills.py" "$@"
    fi
done

echo 'ERROR: Python 3.10+ is required. Install Python, reopen the terminal, and rerun this script.' >&2
exit 1
