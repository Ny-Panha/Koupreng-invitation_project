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
  echo -e "${RED}❌ មិនស្ថិតនៅក្នុង Git repository ឬមិនមាន Branch សកម្មឡើយ!${NC}"
  exit 1
fi

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - SAFE GIT PULL (ទាញ Code ដោយសុវត្ថិភាព)${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Branch: ${GREEN}${BRANCH}${NC}"

# Step 1: Pre-fetch & Inspection
echo -e "\n${BOLD}[1/4] ពិនិត្យមើល Code ថ្មីនៅលើ GitHub (Fetching origin/${BRANCH})...${NC}"
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ មិនអាចទាក់ទង GitHub បានទេ សូមពិនិត្យមើល Internet connection!${NC}"
  exit 1
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)
LOCAL_DIRTY=$(git status --porcelain 2>/dev/null || true)

if [ "$BEHIND" -eq 0 ]; then
  echo -e "  ${GREEN}✓ Up-to-date:${NC} គ្មាន commit ថ្មីនៅលើ remote origin/${BRANCH} ឡើយ!"
  if [ -z "$LOCAL_DIRTY" ]; then
    echo -e "  ${CYAN}— Working directory ស្អាតល្អ (Clean Tree)${NC}"
    echo -e "\n${BOLD}${GREEN}✅ Code របស់អ្នកគឺថ្មីចុងក្រោយបង្អស់រួចរាល់ហើយ!${NC}\n"
    exit 0
  else
    echo -e "  ${YELLOW}— Local មាន file កំពុងកែប្រែ (${CYAN}git status${YELLOW} to see)${NC}"
    echo -e "  ${GREEN}✓ មិនចាំបាច់ pull ទេព្រោះ remote គ្មាន code ថ្មី${NC}\n"
    exit 0
  fi
fi

echo -e "  ${YELLOW}⬇️ រកឃើញ ${BEHIND} commit(s) ថ្មីពី Teammates:${NC}"
git log HEAD..origin/"$BRANCH" --pretty=format:"    • %h - %s ${CYAN}(%an, %ar)${NC}" -n 5
echo ""

# Collision Pre-check
if [ -n "$LOCAL_DIRTY" ]; then
  LOCAL_FILES=$(git status --porcelain | awk '{print $NF}')
  REMOTE_FILES=$(git diff --name-only HEAD origin/"$BRANCH" 2>/dev/null || true)
  OVERLAP=$(grep -Fxf <(echo "$LOCAL_FILES") <(echo "$REMOTE_FILES") || true)
  
  if [ -n "$OVERLAP" ]; then
    echo -e "  ${BOLD}${RED}⚠️ ព្រមាន៖ អាចនឹងមានការជាន់ Code គ្នា (Potential Conflict):${NC}"
    while IFS= read -r f; do
      [ -n "$f" ] && echo -e "    ${RED}✗ $f${NC}"
    done <<< "$OVERLAP"
    echo -e "  ${YELLOW}កុំបារម្ភ ប្រព័ន្ធនឹងរក្សាទុក code របស់អ្នកក្នុង Stash មុនពេល pull!${NC}"
  fi
fi

# Step 2: Auto-stash local changes
echo -e "\n${BOLD}[2/4] រក្សាទុក Code លើ Local ជាបណ្ដោះអាសន្ន (Auto-Stash)...${NC}"
STASH_TAG="koupreng-pull-$(date +%Y%m%d-%H%M%S)"
STASHED=false

if [ -n "$LOCAL_DIRTY" ]; then
  git stash push -u -m "$STASH_TAG" --quiet
  STASHED=true
  echo -e "  ${GREEN}✓ Code ក្នុង local ត្រូវបានរក្សាទុកក្នុង Stash ដោយសុវត្ថិភាព${NC}"
else
  echo -e "  ${CYAN}— គ្មាន file កែប្រែលើ local ទេ (Clean Tree)${NC}"
fi

# Step 3: Pull with rebase
echo -e "\n${BOLD}[3/4] កំពុងទាញយក Code ថ្មីពី origin/${BRANCH}...${NC}"
if git pull --rebase origin "$BRANCH"; then
  echo -e "  ${GREEN}✓ Pull & Rebase ជោគជ័យ${NC}"
else
  echo -e "  ${RED}❌ មាន Conflict ពេលកំពុង Rebase!${NC}"
  echo -e "  ${YELLOW}ដំណោះស្រាយ:${NC}"
  echo -e "    1. បោះបង់ rebase (ត្រឡប់មកដើមវិញ): ${CYAN}git rebase --abort${NC}"
  if [ "$STASHED" = true ]; then
    echo -e "    2. យក code ក្នុង stash មកវិញ: ${CYAN}git stash pop${NC}"
  fi
  exit 1
fi

# Step 4: Restore local changes from stash
echo -e "\n${BOLD}[4/4] ដាក់ Code លើ Local មកវិញ (Restoring Local Changes)...${NC}"
if [ "$STASHED" = true ]; then
  if git stash pop --quiet 2>/dev/null; then
    echo -e "  ${GREEN}✓ Code លើ local ត្រូវបាន restore មកវិញដោយរលូន គ្មាន conflict!${NC}"
  else
    echo -e "  ${BOLD}${RED}⚠️ មាន Conflict ពេលដាក់ code របស់អ្នកមកវិញ (Stash Conflict)!${NC}"
    echo -e "  ${YELLOW}ឯកសារដែលមាន conflict:${NC}"
    git diff --name-only --diff-filter=U 2>/dev/null | while read -r cf; do
      echo -e "    ${RED}✗ $cf${NC}"
    done
    echo -e "\n  ${BOLD}👉 របៀបដោះស្រាយ (How to fix):${NC}"
    echo -e "    1. បើក file ខាងលើ រួចកែសម្រួលដក ${CYAN}<<<<<<< HEAD${NC} និង ${CYAN}>>>>>>>${NC} ចេញ"
    echo -e "    2. រត់: ${CYAN}git add <file>${NC}"
    echo -e "    3. បញ្ចប់ដោយរត់: ${CYAN}git stash drop${NC}"
    echo -e "    ${YELLOW}(ឬចង់បោះបង់ code លើ local ចោលយកតែ remote: git checkout -- . && git stash drop)${NC}\n"
    exit 1
  fi
else
  echo -e "  ${CYAN}— គ្មានអ្វីត្រូវ restore ទេ${NC}"
fi

echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✅ PULL COMPLETED SUCCESSFULLY (ជោគជ័យ)!${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "  ${YELLOW}ប្រសិនបើចង់ Revert ទៅកាន់មុនពេល pull វិញ:${NC}"
echo -e "    ${CYAN}git reset --hard ORIG_HEAD${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}\n"
