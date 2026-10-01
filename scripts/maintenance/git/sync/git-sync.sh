#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$SCRIPT_DIR/../../../.." && pwd -P))"
cd "$PROJECT_ROOT"

MESSAGE="${1:-}"

if [ -z "$MESSAGE" ]; then
    printf 'Commit message: '
    IFS= read -r MESSAGE
fi

if [ -z "$MESSAGE" ]; then
    printf '\nCommit message cannot be empty. Usage: ./scripts/maintenance/git/sync/git-sync.sh "update invitation flow"\n' >&2
    exit 1
fi

printf 'Safe Team Git Sync\n'
printf 'Commit local work, rebase on latest origin/main, then push.\n'
"$SCRIPT_DIR/../push/git-push.sh" "$MESSAGE"
