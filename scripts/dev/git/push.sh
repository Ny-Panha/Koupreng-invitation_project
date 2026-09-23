#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Safe Anti-Collision Git Push (Linux / macOS)
# Features: Conflict recovery, secret file blocker, commit-first safety,
#           smart auto-sync with teammates' commits, and clean push.
# ==============================================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$BRANCH" ]; then
  echo -e "${RED}❌ Not in a git repository or no active branch found!${NC}"
  exit 1
fi

MSG="$1"

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - SAFE ANTI-COLLISION GIT PUSH${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Branch: ${GREEN}${BRANCH}${NC}"

# ------------------------------------------------------------------------------
# STEP 0: Check for in-progress rebase or merge
# ------------------------------------------------------------------------------
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null || echo ".git")
if [ -d "$GIT_DIR/rebase-merge" ] || [ -d "$GIT_DIR/rebase-apply" ]; then
  echo -e "\n${BOLD}${RED}⚠️ Warning: Git is currently stuck in a previous rebase!${NC}"
  echo -e "  ${YELLOW}Automatically aborting previous rebase...${NC}"
  git rebase --abort 2>/dev/null || true
  echo -e "  ${GREEN}✓ Successfully aborted rebase${NC}"
fi

if [ -f "$GIT_DIR/MERGE_HEAD" ]; then
  echo -e "\n${BOLD}${RED}⚠️ Warning: Git is stuck in an incomplete merge!${NC}"
  echo -e "  ${YELLOW}Options:${NC}"
  echo -e "  1. Abort merge (git merge --abort)"
  echo -e "  2. Continue (if you have already resolved conflicts)"
  echo -ne "${YELLOW}Do you want to abort the merge and reset? [Y/n]: ${NC}"
  read -r ABORT_MERGE
  if [[ "$ABORT_MERGE" != "n" && "$ABORT_MERGE" != "N" ]]; then
    git merge --abort 2>/dev/null || true
    echo -e "  ${GREEN}✓ Successfully aborted merge${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# STEP 1: Blocker Checks (Conflict markers & Sensitive files)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[1/4] Safety Pre-flight Check...${NC}"

# Check for conflict markers in tracked files
CONFLICT_FILES=$(git grep -l -E "^<<<<<<< " -- ':!scripts/dev/git/*' ':!docs/*' 2>/dev/null || true)
if [ -n "$CONFLICT_FILES" ]; then
  echo -e "  ${BOLD}${RED}❌ Push rejected! Found unresolved conflict marker (<<<<<<<) in:${NC}"
  while IFS= read -r cf; do
    [ -n "$cf" ] && echo -e "    ${RED}✗ $cf${NC}"
  done <<< "$CONFLICT_FILES"
  echo -e "\n  ${YELLOW}Please remove <<<<<<<, =======, and >>>>>>> markers before pushing!${NC}\n"
  exit 1
fi

# Check for accidental sensitive files
SENSITIVE_FILES=$(git status --porcelain 2>/dev/null | grep -E '\.env$|\.env\.local$|\.pem$|\.key$' || true)
if [ -n "$SENSITIVE_FILES" ]; then
  echo -e "  ${BOLD}${RED}⚠️ Warning: Sensitive/Secret files detected in staging:${NC}"
  echo -e "    ${RED}$SENSITIVE_FILES${NC}"
  echo -e "  ${YELLOW}Please ensure you are not pushing credentials or API keys to GitHub!${NC}"
  echo -ne "${YELLOW}Are you sure you want to proceed? [y/N]: ${NC}"
  read -r FORCE_SECRET
  if [[ "$FORCE_SECRET" != "y" && "$FORCE_SECRET" != "Y" ]]; then
    echo -e "  ${CYAN}Cancelled. Unstage sensitive files using (git reset <file>)${NC}"
    exit 1
  fi
fi
echo -e "  ${GREEN}✓ No conflict markers or sensitive files detected (Safe)${NC}"

# ------------------------------------------------------------------------------
# STEP 2: Stage & Commit Local Work FIRST (Never lose local changes)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[2/4] Preparing Code and Committing Locally...${NC}"

LOCAL_DIRTY=$(git status --porcelain 2>/dev/null || true)
if [ -n "$LOCAL_DIRTY" ]; then
  git add -A
  if ! git diff --cached --quiet; then
    if [ -z "$MSG" ]; then
      if [ -t 0 ]; then
        echo -e "  ${CYAN}You have uncommitted local changes:${NC}"
        git status -s
        echo -ne "${YELLOW}✍️  Enter commit message: ${NC}"
        read -r INPUT_MSG
        MSG="${INPUT_MSG:-update: changes by $(whoami) at $(date '+%Y-%m-%d %H:%M')}"
      else
        MSG="update: changes by $(whoami) at $(date '+%Y-%m-%d %H:%M')"
      fi
    fi
    git commit -m "$MSG"
    echo -e "  ${GREEN}✓ Committed locally: \"${MSG}\"${NC}"
  fi
else
  echo -e "  ${CYAN}— Working tree is clean (nothing to commit)${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 3: Check Remote & Smart Sync
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[3/4] Checking Remote (origin/${BRANCH})...${NC}"
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ Could not connect to GitHub. Please check your internet connection!${NC}"
  exit 1
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)

if [ "$BEHIND" -gt 0 ]; then
  echo -e "  ${BOLD}${YELLOW}ℹ️  Found ${BEHIND} new commit(s) from teammates on GitHub:${NC}"
  git log HEAD..origin/"$BRANCH" --pretty=format:"    • %h - %s (%an, %ar)" -n 5
  echo ""

  echo -e "  ${CYAN}⏳ Auto-merging remote code into local branch...${NC}"
  if git merge --no-edit origin/"$BRANCH"; then
    echo -e "  ${GREEN}✓ Successfully merged remote commits!${NC}"
  else
    echo -e "  ${BOLD}${RED}❌ Merge conflict detected between local and remote code!${NC}"
    echo -e "  ${YELLOW}Conflicted files:${NC}"
    git diff --name-only --diff-filter=U 2>/dev/null | while read -r cf; do
      echo -e "    ${RED}✗ $cf${NC}"
    done
    echo -e "\n  ${YELLOW}👉 Resolution steps:${NC}"
    echo -e "    1. Open each file above and resolve conflict markers"
    echo -e "    2. Run: ${CYAN}git add -A && git commit -m 'Merge conflict resolution'${NC}"
    echo -e "    3. Run: ${CYAN}./scripts/dev/git/push.sh${NC} again"
    echo -e "    (Or abort merge with: ${CYAN}git merge --abort${NC})\n"
    exit 1
  fi
else
  echo -e "  ${GREEN}✓ Local branch is up to date or ahead of remote (Ready to push)${NC}"
fi

# Re-check ahead count
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)
if [ "$AHEAD" -eq 0 ]; then
  echo -e "\n${BOLD}${GREEN}✓ Nothing to push (Everything is already up to date)!${NC}\n"
  exit 0
fi

# ------------------------------------------------------------------------------
# STEP 4: Push to Remote
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[4/4] Pushing ${AHEAD} commit(s) to origin/${BRANCH}...${NC}"
if git push origin "$BRANCH"; then
  LAST_SHA=$(git rev-parse --short HEAD)
  echo -e "\n${BOLD}${GREEN}======================================================${NC}"
  echo -e "${BOLD}${GREEN}   ✅ PUSH COMPLETED SUCCESSFULLY!${NC}"
  echo -e "${BOLD}${GREEN}======================================================${NC}"
  echo -e "  📌 Commit SHA: ${CYAN}${LAST_SHA}${NC}"
  echo -e "  📍 Remote:     ${CYAN}https://github.com/Ny-Panha/Koupreng-invitation_project.git${NC}"
  echo -e "\n  ${YELLOW}To undo the last push:${NC}"
  echo -e "    ${CYAN}./scripts/dev/git/undo-push.sh${NC}"
  echo -e "${BOLD}${GREEN}======================================================${NC}\n"
else
  echo -e "  ${RED}❌ Push failed!${NC}"
  echo -e "  ${YELLOW}Please check GitHub permissions or run:${NC} ${CYAN}git push origin $BRANCH${NC}"
  exit 1
fi
