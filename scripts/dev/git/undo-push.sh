#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Undo Last Git Push (Linux / macOS)
# Reverts the last commit locally + force-updates remote safely
# ==============================================================================

set -eo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

BRANCH=$(git branch --show-current 2>/dev/null || echo "")
LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "")

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${RED}   ⚠️  KOUPRENG - UNDO LAST PUSH${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Branch: ${GREEN}${BRANCH}${NC}"
echo -e "  📌 Last commit: ${YELLOW}${LAST_COMMIT}${NC}\n"

echo -ne "${RED}តើ Nha ចង់ undo commit នេះមែនទេ? [y/N]: ${NC}"
read -r CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo -e "  ${CYAN}Cancelled. Nothing changed.${NC}"
  exit 0
fi

# Step 1: Undo commit (keep code changes)
echo -e "\n${BOLD}[1/2] Undoing last commit (keeping your code)...${NC}"
git reset --soft HEAD~1
echo -e "  ${GREEN}✓ Commit undone — code changes still in staging${NC}"

# Step 2: Force update remote
echo ""
echo -ne "${YELLOW}ចង់ update remote ដែរទេ? [force push] [y/N]: ${NC}"
read -r FORCE
if [[ "$FORCE" == "y" || "$FORCE" == "Y" ]]; then
  echo -e "\n${BOLD}[2/2] Force-updating remote...${NC}"
  git push --force-with-lease origin "$BRANCH"
  echo -e "  ${GREEN}✓ Remote updated — push undone completely${NC}"
else
  echo -e "  ${CYAN}— Remote untouched. Only local commit was undone.${NC}"
  echo -e "  ${YELLOW}Your changes are still staged (git status to see).${NC}"
fi

echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✅ UNDO COMPLETED!${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "  ${CYAN}Your code changes are safe in staging area.${NC}"
echo -e "  ${CYAN}Run 'git status' to see them.${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}\n"
