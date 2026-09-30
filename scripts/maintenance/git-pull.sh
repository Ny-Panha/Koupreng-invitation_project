#!/usr/bin/env bash
set -Eeuo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# git-pull.sh — Safe team Git pull script for Koupreng
# ─────────────────────────────────────────────────────────────────────────────

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
cd "$PROJECT_ROOT"

TARGET_REMOTE="origin"
DEFAULT_BRANCH="main"

# ─────────────────────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────────────────────

fail() {
    echo -e "\n${RED}Error: $1${NC}" >&2
    exit 1
}

git_path_exists() {
    local path_name="$1"
    local git_path
    git_path="$(git rev-parse --git-path "$path_name" 2>/dev/null || true)"
    [ -n "$git_path" ] && [ -e "$git_path" ]
}

has_local_changes() {
    [ -n "$(git status --porcelain)" ]
}

origin_branch_exists() {
    local remote="$1"
    local branch="$2"
    git ls-remote --exit-code --heads "$remote" "$branch" >/dev/null 2>&1
}

show_unfinished_help() {
    cat >&2 <<EOF

${RED}A rebase or merge is already in progress.${NC}

${YELLOW}To continue:${NC}
  git status
  git rebase --continue

${YELLOW}To abort:${NC}
  git rebase --abort
  git merge --abort
EOF
}

show_pull_conflict_help() {
    cat >&2 <<EOF

${RED}Pull stopped because collaborator code conflicts with your local work.${NC}

${YELLOW}To fix:${NC}
  git status
  Edit conflicted files (look for <<<<<<< markers)
  git add .
  git rebase --continue

${YELLOW}To cancel:${NC}
  git rebase --abort
EOF
}

show_stash_conflict_help() {
    cat >&2 <<EOF

${RED}Your saved local changes conflicted with the latest code.${NC}

${YELLOW}To fix:${NC}
  git status
  Edit conflicted files (look for <<<<<<< markers)
  git add .
  git commit -m "resolve local conflict"

${CYAN}Your stash is kept as backup.${NC}

${YELLOW}To check:${NC}
  git stash list

${YELLOW}To drop after verification:${NC}
  git stash drop stash@{0}
EOF
}

safe_pull() {
    local branch="$1"
    local pull_mode="$2"
    local remote="${3:-}"
    local remote_branch="${4:-}"
    local stash_created=0
    local stash_ref='stash@{0}'

    if has_local_changes; then
        echo -e "${YELLOW}Stashing local changes...${NC}"
        git stash push --include-untracked -m "safe-pull auto-stash ${branch} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        stash_created=1
        echo -e "${GREEN}✓ Local changes stashed${NC}"
    fi

    echo -e "${BLUE}Pulling and rebasing...${NC}"

    if [ "$pull_mode" = "upstream" ]; then
        if ! git pull --rebase; then
            show_pull_conflict_help
            if [ "$stash_created" -eq 1 ]; then
                echo -e "\n${CYAN}Your uncommitted changes are still saved in the auto-stash.${NC}" >&2
                echo -e "${CYAN}Check it with: git stash list${NC}" >&2
            fi
            exit 1
        fi
    else
        if ! git pull --rebase "$remote" "$remote_branch"; then
            show_pull_conflict_help
            if [ "$stash_created" -eq 1 ]; then
                echo -e "\n${CYAN}Your uncommitted changes are still saved in the auto-stash.${NC}" >&2
                echo -e "${CYAN}Check it with: git stash list${NC}" >&2
            fi
            exit 1
        fi
    fi

    if [ "$stash_created" -eq 1 ]; then
        echo -e "${BLUE}Restoring local changes...${NC}"
        if ! git stash apply "$stash_ref"; then
            show_stash_conflict_help
            exit 1
        fi
        git stash drop "$stash_ref"
        echo -e "${GREEN}✓ Local changes restored${NC}"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Main script
# ─────────────────────────────────────────────────────────────────────────────

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not inside a Git repository."

if git_path_exists rebase-merge || git_path_exists rebase-apply || git_path_exists MERGE_HEAD; then
    show_unfinished_help
    exit 1
fi

branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
[ -n "$branch" ] || fail "You are in detached HEAD mode. Checkout a branch before pulling."

# Detect remote tracking branch, fallback to default (main)
if git rev-parse --abbrev-ref "${branch}@{upstream}" &>/dev/null; then
    upstream_ref=$(git rev-parse --abbrev-ref "${branch}@{upstream}")
    TARGET_BRANCH="${upstream_ref#*/}"
else
    echo -e "${YELLOW}[WARN]${NC} No upstream tracking branch for '${branch}'. Using ${TARGET_REMOTE}/${DEFAULT_BRANCH} as base."
    TARGET_BRANCH="$DEFAULT_BRANCH"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Koupreng Safe Team Git Pull${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Current branch:${NC} ${YELLOW}$branch${NC}"
echo -e "${GREEN}Pull target:${NC}    ${YELLOW}$TARGET_REMOTE/$TARGET_BRANCH${NC}"
if [ "$TARGET_BRANCH" != "$DEFAULT_BRANCH" ]; then
    echo -e "${GREEN}Base sync:${NC}     ${YELLOW}$TARGET_REMOTE/$DEFAULT_BRANCH${NC} (rebase on top)"
fi
echo -e "${GREEN}Pull mode:${NC}      ${YELLOW}rebase${NC}"
echo ""

echo -e "${BLUE}Fetching latest changes from $TARGET_REMOTE...${NC}"
git fetch "$TARGET_REMOTE" --prune
origin_branch_exists "$TARGET_REMOTE" "$TARGET_BRANCH" || fail "$TARGET_REMOTE/$TARGET_BRANCH was not found."

safe_pull "$branch" explicit "$TARGET_REMOTE" "$TARGET_BRANCH"

# ── Step 2: Rebase on origin/main to get latest teammate commits ──────────────
if [ "$TARGET_BRANCH" != "$DEFAULT_BRANCH" ] && origin_branch_exists "$TARGET_REMOTE" "$DEFAULT_BRANCH"; then
    echo -e "${BLUE}Syncing latest ${TARGET_REMOTE}/${DEFAULT_BRANCH} commits into branch...${NC}"
    if has_local_changes; then
        echo -e "${YELLOW}Stashing local changes for base-sync...${NC}"
        git stash push --include-untracked -m "base-sync auto-stash ${branch} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        SYNC_STASHED=1
    else
        SYNC_STASHED=0
    fi

    if ! git rebase "$TARGET_REMOTE/$DEFAULT_BRANCH"; then
        echo -e "${RED}[ERROR]${NC} Conflict while rebasing on ${TARGET_REMOTE}/${DEFAULT_BRANCH}!" >&2
        echo -e "${YELLOW}Fix conflicts then run:${NC} git rebase --continue" >&2
        if [ "$SYNC_STASHED" -eq 1 ]; then
            echo -e "${CYAN}Your local changes are in stash. Check: git stash list${NC}" >&2
        fi
        exit 1
    fi

    if [ "$SYNC_STASHED" -eq 1 ]; then
        echo -e "${BLUE}Restoring local changes...${NC}"
        if ! git stash apply stash@{0}; then
            show_stash_conflict_help
            exit 1
        fi
        git stash drop stash@{0}
        echo -e "${GREEN}✓ Local changes restored${NC}"
    fi
    echo -e "${GREEN}✓ Branch is up to date with ${TARGET_REMOTE}/${DEFAULT_BRANCH}${NC}"

    # ── Step 3: Force-push rebased branch to remote ───────────────────────────
    echo -e "${BLUE}Force-pushing rebased branch to ${TARGET_REMOTE}...${NC}"
    if git push --force-with-lease "$TARGET_REMOTE" "$branch"; then
        echo -e "${GREEN}✓ Force-push successful — remote branch is now in sync${NC}"
        FORCE_PUSHED=1
    else
        echo -e "${RED}[ERROR]${NC} Force-push failed! Someone may have pushed to this branch." >&2
        echo -e "${YELLOW}Run manually:${NC} git push --force-with-lease $TARGET_REMOTE $branch" >&2
        FORCE_PUSHED=0
    fi
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Pull completed successfully!${NC}"
echo -e "${GREEN}✓ Branch '$branch' is up to date with $TARGET_REMOTE/$TARGET_BRANCH${NC}"
if [ "${TARGET_BRANCH}" != "${DEFAULT_BRANCH}" ]; then
    echo -e "${GREEN}✓ Latest $TARGET_REMOTE/$DEFAULT_BRANCH commits included${NC}"
fi
if [ "${FORCE_PUSHED:-0}" -eq 1 ]; then
    echo -e "${GREEN}✓ Remote branch updated (force-pushed)${NC}"
fi
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
