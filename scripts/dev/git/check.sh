#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Team Git Radar & Status Inspector (Linux / macOS)
# Purpose: Check local vs remote status, see teammates' commits, and detect conflicts
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
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - TEAM GIT RADAR & CONFLICT CHECK${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Current Branch: ${GREEN}${BRANCH}${NC}"
echo -e "  ⏳ Fetching remote status from origin/${BRANCH}..."

git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ មិនអាច fetch ពី origin/${BRANCH} បានទេ (ពិនិត្យមើល internet/remote)${NC}"
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)

# Local changes
MODIFIED_FILES=$(git status --porcelain 2>/dev/null || true)
HAS_LOCAL_DIRTY=false
if [ -n "$MODIFIED_FILES" ]; then
  HAS_LOCAL_DIRTY=true
fi

echo -e "\n${BOLD}[1] ស្ថានភាព Sync (Sync Overview):${NC}"
if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
  echo -e "  ${GREEN}✓ Up-to-date:${NC} Local និង GitHub Remote ស្មើគ្នា (Synched)"
else
  if [ "$BEHIND" -gt 0 ]; then
    echo -e "  ${YELLOW}⬇️ Behind:${NC} មាន ${YELLOW}${BEHIND}${NC} commit(s) ថ្មីពី teammates នៅលើ GitHub មិនទាន់ pull"
  fi
  if [ "$AHEAD" -gt 0 ]; then
    echo -e "  ${CYAN}⬆️ Ahead:${NC} មាន ${CYAN}${AHEAD}${NC} commit(s) នៅលើ local មិនទាន់ push ឡើង GitHub"
  fi
fi

# Show teammates' incoming commits
if [ "$BEHIND" -gt 0 ]; then
  echo -e "\n${BOLD}[2] Commit ថ្មីពី Teammates លើ GitHub (${BEHIND} commits):${NC}"
  git log HEAD..origin/"$BRANCH" --pretty=format:"  ${YELLOW}• %h${NC} - %s ${CYAN}(%an, %ar)${NC}" -n 10
  echo ""
fi

# Show local outgoing commits
if [ "$AHEAD" -gt 0 ]; then
  echo -e "\n${BOLD}[3] Commit លើ Local ដែលត្រៀម Push (${AHEAD} commits):${NC}"
  git log origin/"$BRANCH"..HEAD --pretty=format:"  ${CYAN}• %h${NC} - %s ${GREEN}(%ar)${NC}" -n 10
  echo ""
fi

# Show local uncommitted changes
if [ "$HAS_LOCAL_DIRTY" = true ]; then
  echo -e "\n${BOLD}[4] ឯកសារកំពុងកែប្រែលើ Local (Uncommitted Changes):${NC}"
  git status -s
fi

# Collision & Conflict Detection
echo -e "\n${BOLD}[5] ពិនិត្យការជាន់ Code គ្នា (Collision Detection):${NC}"
if [ "$BEHIND" -gt 0 ] && [ "$HAS_LOCAL_DIRTY" = true ]; then
  LOCAL_FILES=$(git status --porcelain | awk '{print $NF}')
  REMOTE_FILES=$(git diff --name-only HEAD origin/"$BRANCH" 2>/dev/null || true)
  
  OVERLAP=$(grep -Fxf <(echo "$LOCAL_FILES") <(echo "$REMOTE_FILES") || true)
  
  if [ -n "$OVERLAP" ]; then
    echo -e "  ${BOLD}${RED}⚠️ ព្រមាន៖ រកឃើញការជាន់ Code គ្នា (Conflict Risk)!${NC}"
    echo -e "  ${YELLOW}ឯកសារខាងក្រោមត្រូវបានកែប្រែដោយទាំងអ្នក និង Teammate:${NC}"
    while IFS= read -r file; do
      [ -n "$file" ] && echo -e "    ${RED}✗ $file${NC}"
    done <<< "$OVERLAP"
    echo -e "  ${BOLD}${YELLOW}👉 ដំណោះស្រាយ:${NC} សូមរត់ ${CYAN}./scripts/dev/git/pull.sh${NC} ដើម្បី sync code ចូលដោយសុវត្ថិភាព!"
  else
    echo -e "  ${GREEN}✓ គ្មាន file ជាន់គ្នាទេ!${NC} (អ្នក និង Teammate កែប្រែ file ផ្សេងគ្នា - Safe to Pull/Push)"
  fi
elif [ "$BEHIND" -gt 0 ]; then
  echo -e "  ${GREEN}✓ Local គ្មាន file កំពុងកែប្រែទេ${NC} (Safe to Pull)"
else
  echo -e "  ${GREEN}✓ គ្មានហានិភ័យជាន់ code ទេ (Up to date with remote)${NC}"
fi

# Conflict marker check in working directory
CONFLICT_MARKERS=$(grep -rn --exclude-dir={.git,node_modules,target,build,dist,.next} -l "^<<<<<<< " . 2>/dev/null || true)
if [ -n "$CONFLICT_MARKERS" ]; then
  echo -e "\n${BOLD}${RED}🚨 ព្រមានធ្ងន់ធ្ងរ៖ រកឃើញ Conflict Markers (<<<<<<<) ក្នុង file:${NC}"
  while IFS= read -r f; do
    [ -n "$f" ] && echo -e "    ${RED}✗ $f${NC}"
  done <<< "$CONFLICT_MARKERS"
  echo -e "  ${YELLOW}សូមកែសម្រួលដក <<<<<<<, =======, >>>>>>> ចេញជាមុនសិន!${NC}"
fi

echo -e "\n${BOLD}${CYAN}======================================================${NC}"
echo -e "  ${YELLOW}Commands សម្រាប់ Team ប្រើប្រាស់:${NC}"
echo -e "    • ពិនិត្យ status:  ${CYAN}./scripts/dev/git/check.sh${NC}"
echo -e "    • Pull សុវត្ថិភាព: ${CYAN}./scripts/dev/git/pull.sh${NC}"
echo -e "    • Push សុវត្ថិភាព: ${CYAN}./scripts/dev/git/push.sh \"សារ commit\"${NC}"
echo -e "    • Menu ងាយស្រួល:  ${CYAN}./scripts/dev/git/menu.sh${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}\n"
