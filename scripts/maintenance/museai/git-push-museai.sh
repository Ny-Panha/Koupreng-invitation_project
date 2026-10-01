#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# git-push-museai.sh — Interactive Git push script for Koupreng (Branch: museai)
# ─────────────────────────────────────────────────────────────────────────────

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$SCRIPT_DIR/../../.." && pwd -P))"
cd "$PROJECT_ROOT"

TARGET_BRANCH="museai"

# ─────────────────────────────────────────────────────────────────────────────
# Commit message templates
# ─────────────────────────────────────────────────────────────────────────────
show_menu() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  Koupreng Git Push Menu [Branch: ${MAGENTA}museai${CYAN}]${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${GREEN}Backend (Spring Boot)${NC}"
  echo -e "  ${YELLOW}1)${NC}  Update backend API endpoints"
  echo -e "  ${YELLOW}2)${NC}  Fix backend bug"
  echo -e "  ${YELLOW}3)${NC}  Add backend feature"
  echo -e "  ${YELLOW}4)${NC}  Update backend security/auth"
  echo -e "  ${YELLOW}5)${NC}  Update database schema/migration"
  echo ""
  echo -e "${GREEN}Frontend User${NC}"
  echo -e "  ${YELLOW}6)${NC}  Update user interface/UI"
  echo -e "  ${YELLOW}7)${NC}  update chat bot"
  echo -e "  ${YELLOW}8)${NC}  update page page"
  echo -e "  ${YELLOW}9)${NC}  Fix frontend-user bug"
  echo -e "  ${YELLOW}10)${NC} Add user-facing feature"
  echo -e "  ${YELLOW}11)${NC} Update invitation templates"
  echo ""
  echo -e "${GREEN}Frontend Admin${NC}"
  echo -e "  ${YELLOW}12)${NC} Update admin dashboard"
  echo -e "  ${YELLOW}13)${NC} Fix admin panel bug"
  echo -e "  ${YELLOW}14)${NC} Add admin feature"
  echo ""
  echo -e "${GREEN}Telegram Bot${NC}"
  echo -e "  ${YELLOW}15)${NC} Update telegram bot"
  echo -e "  ${YELLOW}16)${NC} Fix telegram bot webhook"
  echo -e "  ${YELLOW}17)${NC} Add telegram bot feature"
  echo ""
  echo -e "${GREEN}Infrastructure & Configuration${NC}"
  echo -e "  ${YELLOW}18)${NC} Update environment configuration"
  echo -e "  ${YELLOW}19)${NC} Update dependencies"
  echo -e "  ${YELLOW}20)${NC} Update dev scripts (dev.sh, setup.sh)"
  echo -e "  ${YELLOW}21)${NC} Update documentation"
  echo ""
  echo -e "${GREEN}Payment Integration${NC}"
  echo -e "  ${YELLOW}22)${NC} Update payment flow"
  echo -e "  ${YELLOW}23)${NC} Fix payment bug"
  echo -e "  ${YELLOW}24)${NC} Add payment feature (ABA PayWay, etc.)"
  echo ""
  echo -e "${GREEN}General${NC}"
  echo -e "  ${YELLOW}25)${NC} Refactor code"
  echo -e "  ${YELLOW}26)${NC} Update tests"
  echo -e "  ${YELLOW}27)${NC} Performance improvements"
  echo -e "  ${YELLOW}28)${NC} Security updates"
  echo -e "  ${YELLOW}29)${NC} General bug fixes"
  echo -e "  ${YELLOW}30)${NC} Work in progress (WIP)"
  echo ""
  echo -e "${GREEN}Quick Actions${NC}"
  echo -e "  ${YELLOW}31)${NC} Quick commit (default message)"
  echo -e "  ${YELLOW}32)${NC} Custom commit message"
  echo ""
  echo -e "${RED}0)${NC}  Cancel and exit"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main script
# ─────────────────────────────────────────────────────────────────────────────

# If a message is provided as argument, use it directly (backward compatibility)
if [ $# -ge 1 ]; then
  MSG="$1"
else
  # Show interactive menu
  show_menu
  
  # Get user choice
  echo -n -e "${CYAN}Select an option [0-32]: ${NC}"
  read -r CHOICE
  
  case "$CHOICE" in
    1)  MSG="Update backend API endpoints" ;;
    2)  MSG="Fix backend bug" ;;
    3)  MSG="Add backend feature" ;;
    4)  MSG="Update backend security/auth" ;;
    5)  MSG="Update database schema/migration" ;;
    6)  MSG="Update user interface/UI" ;;
    7)  MSG="update chat bot" ;;
    8)  MSG="update page page" ;;
    9)  MSG="Fix frontend-user bug" ;;
    10) MSG="Add user-facing feature" ;;
    11) MSG="Update invitation templates" ;;
    12) MSG="Update admin dashboard" ;;
    13) MSG="Fix admin panel bug" ;;
    14) MSG="Add admin feature" ;;
    15) MSG="Update telegram bot" ;;
    16) MSG="Fix telegram bot webhook" ;;
    17) MSG="Add telegram bot feature" ;;
    18) MSG="Update environment configuration" ;;
    19) MSG="Update dependencies" ;;
    20) MSG="Update dev scripts" ;;
    21) MSG="Update documentation" ;;
    22) MSG="Update payment flow" ;;
    23) MSG="Fix payment bug" ;;
    24) MSG="Add payment feature" ;;
    25) MSG="Refactor code" ;;
    26) MSG="Update tests" ;;
    27) MSG="Performance improvements" ;;
    28) MSG="Security updates" ;;
    29) MSG="General bug fixes" ;;
    30) MSG="WIP: Work in progress" ;;
    31) MSG="Update project" ;;
    32) 
      echo -n -e "${CYAN}Enter custom commit message: ${NC}"
      read -r MSG
      if [ -z "$MSG" ]; then
        echo -e "${RED}Error: Commit message cannot be empty${NC}"
        exit 1
      fi
      ;;
    0)
      echo -e "${YELLOW}Cancelled.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Exiting.${NC}"
      exit 1
      ;;
  esac
fi

# ─────────────────────────────────────────────────────────────────────────────
# Git operations
# ─────────────────────────────────────────────────────────────────────────────

git_path_exists() {
  local path_name="$1"
  local git_path
  git_path="$(git rev-parse --git-path "$path_name" 2>/dev/null || true)"
  [ -n "$git_path" ] && [ -e "$git_path" ]
}

show_rebase_conflict_help() {
  echo -e "${RED}Rebase failed. Resolve conflicts, then continue manually.${NC}" >&2
  echo -e "${YELLOW}Run:${NC}" >&2
  echo -e "  git status" >&2
  echo -e "  git add ." >&2
  echo -e "  git rebase --continue" >&2
  echo -e "${YELLOW}Or cancel with:${NC}" >&2
  echo -e "  git rebase --abort" >&2
}

echo ""
echo -e "${BLUE}Checking repository state...${NC}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo -e "${RED}Error: Not inside a Git repository.${NC}"
  exit 1
}

if git_path_exists rebase-merge || git_path_exists rebase-apply || git_path_exists MERGE_HEAD; then
  echo -e "${RED}Error: A rebase or merge is already in progress.${NC}" >&2
  echo -e "${YELLOW}Run git status, then finish or abort the current operation.${NC}" >&2
  exit 1
fi

echo ""
echo -e "${BLUE}Checking current branch...${NC}"
CURRENT_BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"

if [ -z "$CURRENT_BRANCH" ]; then
  echo -e "${RED}Error: You are in detached HEAD mode. Checkout $TARGET_BRANCH before pushing.${NC}" >&2
  exit 1
fi

echo -e "${GREEN}Current branch: $CURRENT_BRANCH${NC}"
echo -e "${GREEN}Target branch:  $TARGET_BRANCH (origin/$TARGET_BRANCH)${NC}"

# Ensure local target branch exists and tracks origin
if ! git show-ref --verify --quiet refs/heads/"$TARGET_BRANCH"; then
  echo -e "${BLUE}Setting up local branch '$TARGET_BRANCH' from 'origin/$TARGET_BRANCH'...${NC}"
  git branch --track "$TARGET_BRANCH" "origin/$TARGET_BRANCH"
fi

echo ""
echo -e "${BLUE}Fetching latest changes from origin/$TARGET_BRANCH...${NC}"
git fetch origin "$TARGET_BRANCH" --prune

echo ""
echo -e "${BLUE}Checking for changes...${NC}"

# Stage all changes, including deletes and renames.
git add -A

HAS_CHANGES=true
if git diff --cached --quiet; then
  HAS_CHANGES=false
fi

if [ "$HAS_CHANGES" = false ]; then
  echo -e "${YELLOW}No uncommitted changes to stage.${NC}"

  # If on another branch, merge into target branch and push
  if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo -e "${BLUE}Switching to $TARGET_BRANCH and merging branch '$CURRENT_BRANCH'...${NC}"
    git checkout "$TARGET_BRANCH"
    git pull --rebase origin "$TARGET_BRANCH"
    git merge "$CURRENT_BRANCH" -m "Merge branch '$CURRENT_BRANCH' into $TARGET_BRANCH"
  fi

  LOCAL="$(git rev-parse HEAD)"
  REMOTE="$(git rev-parse "origin/$TARGET_BRANCH" 2>/dev/null || echo "")"

  if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓ Already up to date with origin/$TARGET_BRANCH${NC}"
    exit 0
  fi

  echo -e "${BLUE}Rebasing existing local commits on origin/$TARGET_BRANCH...${NC}"
  if ! git pull --rebase origin "$TARGET_BRANCH"; then
    show_rebase_conflict_help
    exit 1
  fi

  echo -e "${BLUE}Pushing existing local commits to origin/$TARGET_BRANCH...${NC}"
  git push origin "$TARGET_BRANCH"
  echo -e "${GREEN}✓ Up to date with origin/$TARGET_BRANCH${NC}"
  exit 0
fi

# Show what will be committed
echo ""
echo -e "${CYAN}Files to be committed:${NC}"
git diff --cached --name-status | while read -r status file; do
  case "$status" in
    A) echo -e "  ${GREEN}[Added]${NC}    $file" ;;
    M) echo -e "  ${YELLOW}[Modified]${NC} $file" ;;
    D) echo -e "  ${RED}[Deleted]${NC}  $file" ;;
    *) echo -e "  [$status]      $file" ;;
  esac
done

echo ""
echo -e "${CYAN}Commit message:${NC} ${MAGENTA}$MSG${NC}"
echo ""

# Ask for confirmation
echo -n -e "${YELLOW}Proceed with commit and push to origin/$TARGET_BRANCH? [Y/n]: ${NC}"
read -r CONFIRM

if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo -e "${YELLOW}Cancelled by user.${NC}"
  git reset > /dev/null 2>&1
  exit 0
fi

# Commit
echo -e "${BLUE}Committing changes...${NC}"
git commit -m "$MSG"

# If on another branch, checkout target branch and merge
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  echo -e "${BLUE}Switching to $TARGET_BRANCH and merging branch '$CURRENT_BRANCH'...${NC}"
  git checkout "$TARGET_BRANCH"
  echo -e "${BLUE}Rebasing $TARGET_BRANCH on origin/$TARGET_BRANCH...${NC}"
  if ! git pull --rebase origin "$TARGET_BRANCH"; then
    show_rebase_conflict_help
    exit 1
  fi
  echo -e "${BLUE}Merging '$CURRENT_BRANCH' into $TARGET_BRANCH...${NC}"
  git merge "$CURRENT_BRANCH" -m "Merge branch '$CURRENT_BRANCH' into $TARGET_BRANCH"
else
  # On target branch: rebase directly
  echo -e "${BLUE}Rebasing on origin/$TARGET_BRANCH...${NC}"
  if ! git pull --rebase origin "$TARGET_BRANCH"; then
    show_rebase_conflict_help
    exit 1
  fi
fi

# Push directly to target branch
echo -e "${BLUE}Pushing to origin/$TARGET_BRANCH...${NC}"
git push origin "$TARGET_BRANCH"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Successfully pushed to origin/$TARGET_BRANCH!${NC}"
echo -e "${GREEN}✓ Commit: $MSG${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
