#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Safe Anti-Collision Git Push (Linux / macOS)
# Features: Conflict marker blocker, secret file blocker, remote collision radar,
#           auto-sync with teammates' commits, commit prompt, clean push & undo guide.
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

MSG="$1"

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - SAFE ANTI-COLLISION GIT PUSH${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "  📍 Branch: ${GREEN}${BRANCH}${NC}"

# ------------------------------------------------------------------------------
# STEP 1: Blocker Checks (Conflict markers & Sensitive files)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[1/5] ពិនិត្យសុវត្ថិភាព Code (Safety Pre-flight Check)...${NC}"

# Check for conflict markers in tracked files
CONFLICT_FILES=$(git grep -l "^<<<<<<< " 2>/dev/null || true)
if [ -n "$CONFLICT_FILES" ]; then
  echo -e "  ${BOLD}${RED}❌ បដិសេធមិន Push! រកឃើញ Conflict Marker (<<<<<<<) ក្នុង file:${NC}"
  while IFS= read -r cf; do
    [ -n "$cf" ] && echo -e "    ${RED}✗ $cf${NC}"
  done <<< "$CONFLICT_FILES"
  echo -e "\n  ${YELLOW}សូមបើកកែសម្រួលដក <<<<<<<, =======, >>>>>>> ចេញជាមុនសិន ដើម្បីកុំឱ្យខូច code លើ GitHub!${NC}\n"
  exit 1
fi

# Check for accidental sensitive files
SENSITIVE_FILES=$(git status --porcelain 2>/dev/null | grep -E '\.env$|\.env\.local$|\.pem$|\.key$' || true)
if [ -n "$SENSITIVE_FILES" ]; then
  echo -e "  ${BOLD}${RED}⚠️ ព្រមាន៖ រកឃើញ Sensitive/Secret File ក្នុង staging:${NC}"
  echo -e "    ${RED}$SENSITIVE_FILES${NC}"
  echo -e "  ${YELLOW}សូមប្រយ័ត្នកុំ push credentials ឬ API keys ឡើង GitHub!${NC}"
  echo -ne "${YELLOW}តើអ្នកច្បាស់ថានៅតែចង់បន្ត push ដែរទេ? [y/N]: ${NC}"
  read -r FORCE_SECRET
  if [[ "$FORCE_SECRET" != "y" && "$FORCE_SECRET" != "Y" ]]; then
    echo -e "  ${CYAN}Cancelled. សូមដក file sensitive ចេញ (git reset <file>)${NC}"
    exit 1
  fi
fi
echo -e "  ${GREEN}✓ គ្មាន Conflict Markers ឬ Sensitive files ឡើយ (Safe)${NC}"

# ------------------------------------------------------------------------------
# STEP 2: Collision Radar (Check if teammates pushed to remote)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[2/5] ពិនិត្យមើល Teammates (Remote Collision Radar)...${NC}"
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ មិនអាចទាក់ទង GitHub បានទេ សូមពិនិត្យ Internet!${NC}"
  exit 1
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)

if [ "$BEHIND" -gt 0 ]; then
  echo -e "  ${BOLD}${RED}⚠️ ព្រមាន៖ មាន ${BEHIND} commit(s) ថ្មីពី Teammate នៅលើ GitHub!${NC}"
  echo -e "  ${YELLOW}ប្រសិនបើ push ឥឡូវ នឹងត្រូវ Rejected ឬជាន់ code គ្នា!${NC}"
  echo -e "  ${CYAN}Commits ថ្មីលើ GitHub:${NC}"
  git log HEAD..origin/"$BRANCH" --pretty=format:"    • %h - %s (%an, %ar)" -n 5
  echo ""
  
  # Auto sync prompt
  if [ -t 0 ]; then
    echo -ne "${YELLOW}👉 តើចង់ទាញ [Sync & Pull] code ថ្មីពី Teammate ចូលសិនទេ? [Y/n]: ${NC}"
    read -r DO_SYNC
  else
    DO_SYNC="y"
  fi

  if [[ "$DO_SYNC" != "n" && "$DO_SYNC" != "N" ]]; then
    echo -e "\n  ${CYAN}⏳ កំពុងទាញ និងបញ្ចូល code ពី remote ដោយស្វ័យប្រវត្តិ...${NC}"
    # Stash if dirty
    DIRTY_CHECK=$(git status --porcelain 2>/dev/null || true)
    STASH_SYNC=false
    if [ -n "$DIRTY_CHECK" ]; then
      git stash push -u -m "pre-push-auto-sync-$(date +%s)" --quiet
      STASH_SYNC=true
    fi

    # Pull rebase
    if git pull --rebase origin "$BRANCH"; then
      echo -e "  ${GREEN}✓ Pull commits ពី teammate បានជោគជ័យ!${NC}"
    else
      echo -e "  ${RED}❌ មាន Conflict ពេលកំពុង pull code ពី teammate!${NC}"
      echo -e "  ${YELLOW}សូមរត់: ${CYAN}git rebase --abort${NC} រួចដោះស្រាយជាមួយ teammate${NC}"
      exit 1
    fi

    # Restore stash if needed
    if [ "$STASH_SYNC" = true ]; then
      if git stash pop --quiet 2>/dev/null; then
        echo -e "  ${GREEN}✓ Restore code របស់អ្នកមកវិញបានជោគជ័យ${NC}"
      else
        echo -e "  ${BOLD}${RED}⚠️ មាន Conflict ជាមួយ code របស់ teammate!${NC}"
        echo -e "  ${YELLOW}សូមបើក file ដែល conflict រួចកែសម្រួលដក <<<<<<< ចេញ មុននឹង push!${NC}"
        exit 1
      fi
    fi
  else
    echo -e "  ${RED}បោះបង់ការ push ដើម្បីការពារការជាន់ code គ្នា!${NC}"
    exit 1
  fi
else
  echo -e "  ${GREEN}✓ គ្មាន code ថ្មីពី teammate ជាន់ផ្លូវទេ (Clean to Push)${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 3: Stage & Commit Local Work
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[3/5] រៀបចំ Code និងបង្កើត Commit...${NC}"
git add -A

HAS_STAGED_CHANGES=false
if ! git diff --cached --quiet; then
  HAS_STAGED_CHANGES=true
fi

AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)

if [ "$HAS_STAGED_CHANGES" = true ]; then
  if [ -z "$MSG" ]; then
    if [ -t 0 ]; then
      echo -e "  ${CYAN}អ្នកមាន code ថ្មីដែលមិនទាន់ commit:${NC}"
      git status -s
      echo -ne "${YELLOW}✍️  បញ្ចូលសារ Commit (Commit Message): ${NC}"
      read -r INPUT_MSG
      MSG="${INPUT_MSG:-update: changes by $(whoami) at $(date '+%Y-%m-%d %H:%M')}"
    else
      MSG="update: changes by $(whoami) at $(date '+%Y-%m-%d %H:%M')"
    fi
  fi
  git commit -m "$MSG"
  echo -e "  ${GREEN}✓ បាន Commit: \"${MSG}\"${NC}"
else
  if [ "$AHEAD" -gt 0 ]; then
    echo -e "  ${CYAN}— គ្មាន file កែប្រែថ្មីទេ ប៉ុន្តែមាន ${AHEAD} commit(s) រួចរាល់សម្រាប់ push${NC}"
  else
    echo -e "  ${GREEN}✓ គ្មានអ្វីត្រូវ commit ឬ push ទេ (Everything up to date)!${NC}\n"
    exit 0
  fi
fi

# ------------------------------------------------------------------------------
# STEP 4: Push to Remote
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[4/5] កំពុង Push ទៅកាន់ origin/${BRANCH}...${NC}"
if git push origin "$BRANCH"; then
  echo -e "  ${GREEN}✓ Push ជោគជ័យទៅកាន់ origin/${BRANCH}${NC}"
else
  echo -e "  ${RED}❌ Push បរាជ័យ! (Remote អាចនឹងមាន commit ថ្មីបន្ថែមទៀត)${NC}"
  echo -e "  ${YELLOW}សូមរត់: ${CYAN}./scripts/dev/git/pull.sh${NC} រួចសាកល្បងម្ដងទៀត${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# STEP 5: Success Summary & Undo Instructions
# ------------------------------------------------------------------------------
LAST_SHA=$(git rev-parse --short HEAD)
echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✅ PUSH COMPLETED SUCCESSFULLY (ជោគជ័យ)!${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "  📌 Commit SHA: ${CYAN}${LAST_SHA}${NC}"
echo -e "  📍 Remote:     ${CYAN}https://github.com/Ny-Panha/Koupreng-invitation_project.git${NC}"
echo -e "\n  ${YELLOW}ប្រសិនបើចង់ Undo (ដក commit ចុងក្រោយវិញ):${NC}"
echo -e "    ${CYAN}./scripts/dev/git/undo-push.sh${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}\n"
