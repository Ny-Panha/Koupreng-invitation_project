#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Safe Git Pull (Linux / macOS)
# Features: Pre-check incoming commits, collision warning, safe auto-stash,
#           rebase pull, stash restore with conflict detection & undo guide.
# ==============================================================================

set -eo pipefail

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

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - SAFE GIT PULL${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Branch: ${GREEN}${BRANCH}${NC}"

# Step 1: Pre-fetch & Inspection
echo -e "\n${BOLD}[1/4] Checking remote commits (Fetching origin/${BRANCH})...${NC}"
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ Could not connect to GitHub. Please check your internet connection!${NC}"
  exit 1
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)
LOCAL_DIRTY=$(git status --porcelain 2>/dev/null || true)

if [ "$BEHIND" -eq 0 ]; then
  echo -e "  ${GREEN}✓ Up-to-date:${NC} No new commits found on remote origin/${BRANCH}!"
  if [ -z "$LOCAL_DIRTY" ]; then
    echo -e "  ${CYAN}— Working directory is clean.${NC}"
    echo -e "\n${BOLD}${GREEN}✅ Your local code is already up to date!${NC}\n"
    exit 0
  else
    echo -e "  ${YELLOW}— You have local uncommitted changes (${CYAN}git status${YELLOW} to inspect)${NC}"
    echo -e "  ${GREEN}✓ No pull needed since remote has no new commits.${NC}\n"
    exit 0
  fi
fi

echo -e "  ${YELLOW}⬇️ Found ${BEHIND} new commit(s) from teammates:${NC}"
git log HEAD..origin/"$BRANCH" --pretty=format:"    • %h - %s ${CYAN}(%an, %ar)${NC}" -n 5
echo ""

# Collision Pre-check
if [ -n "$LOCAL_DIRTY" ]; then
  LOCAL_FILES=$(git status --porcelain | awk '{print $NF}')
  REMOTE_FILES=$(git diff --name-only HEAD origin/"$BRANCH" 2>/dev/null || true)
  OVERLAP=$(grep -Fxf <(echo "$LOCAL_FILES") <(echo "$REMOTE_FILES") || true)
  
  if [ -n "$OVERLAP" ]; then
    echo -e "  ${BOLD}${RED}⚠️ Warning: Potential file conflicts detected:${NC}"
    while IFS= read -r f; do
      [ -n "$f" ] && echo -e "    ${RED}✗ $f${NC}"
    done <<< "$OVERLAP"
    echo -e "  ${YELLOW}Your changes will be safely auto-stashed before pulling.${NC}"
  fi
fi

# Step 2: Auto-stash local changes
echo -e "\n${BOLD}[2/4] Saving local changes temporarily (Auto-Stash)...${NC}"
STASH_TAG="koupreng-pull-$(date +%Y%m%d-%H%M%S)"
STASHED=false

if [ -n "$LOCAL_DIRTY" ]; then
  git stash push -u -m "$STASH_TAG" --quiet
  STASHED=true
  echo -e "  ${GREEN}✓ Local changes safely stored in Stash${NC}"
else
  echo -e "  ${CYAN}— Working directory clean (nothing to stash)${NC}"
fi

# Step 3: Pull with rebase
echo -e "\n${BOLD}[3/4] Pulling new commits from origin/${BRANCH}...${NC}"
if git pull --rebase origin "$BRANCH"; then
  echo -e "  ${GREEN}✓ Pull & Rebase completed successfully${NC}"
else
  echo -e "  ${RED}❌ Conflict detected during rebase!${NC}"
  echo -e "  ${YELLOW}Resolution:${NC}"
  echo -e "    1. Abort rebase: ${CYAN}git rebase --abort${NC}"
  if [ "$STASHED" = true ]; then
    echo -e "    2. Restore stashed code: ${CYAN}git stash pop${NC}"
  fi
  exit 1
fi

# Step 4: Restore local changes from stash
echo -e "\n${BOLD}[4/4] Restoring local changes...${NC}"
if [ "$STASHED" = true ]; then
  if git stash pop --quiet 2>/dev/null; then
    echo -e "  ${GREEN}✓ Local changes restored cleanly without conflict!${NC}"
  else
    echo -e "  ${BOLD}${RED}⚠️ Conflict detected while restoring stashed changes!${NC}"
    echo -e "  ${YELLOW}Conflicted files:${NC}"
    git diff --name-only --diff-filter=U 2>/dev/null | while read -r cf; do
      echo -e "    ${RED}✗ $cf${NC}"
    done
    echo -e "\n  ${BOLD}👉 How to fix:${NC}"
    echo -e "    1. Open files above and resolve conflict markers"
    echo -e "    2. Run: ${CYAN}git add <file>${NC}"
    echo -e "    3. Drop stash entry: ${CYAN}git stash drop${NC}"
    echo -e "    ${YELLOW}(To discard local changes and use remote: git checkout -- . && git stash drop)${NC}\n"
    exit 1
  fi
else
  echo -e "  ${CYAN}— Nothing to restore${NC}"
fi

echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✅ PULL COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "  ${YELLOW}To revert back to state before pull:${NC}"
echo -e "    ${CYAN}git reset --hard ORIG_HEAD${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}\n"
