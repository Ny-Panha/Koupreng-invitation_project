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
  echo -e "${RED}❌ មិនស្ថិតនៅក្នុង Git repository ឬមិនមាន Branch សកម្មឡើយ!${NC}"
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
  echo -e "\n${BOLD}${RED}⚠️ ព្រមាន៖ Git កំពុងជាប់គាំងក្នុង Rebase ពីមុន!${NC}"
  echo -e "  ${YELLOW}កំពុងសម្អាត និងបោះបង់ Rebase ចាស់ដោយស្វ័យប្រវត្តិ...${NC}"
  git rebase --abort 2>/dev/null || true
  echo -e "  ${GREEN}✓ បានបោះបង់ Rebase ជោគជ័យ${NC}"
fi

if [ -f "$GIT_DIR/MERGE_HEAD" ]; then
  echo -e "\n${BOLD}${RED}⚠️ ព្រមាន៖ Git កំពុងជាប់គាំងក្នុង Merge មិនទាន់ចប់!${NC}"
  echo -e "  ${YELLOW}សូមជ្រើសរើស៖${NC}"
  echo -e "  1. បោះបង់ Merge (git merge --abort)"
  echo -e "  2. បន្ត (ប្រសិនបើអ្នកបាន resolve conflict រួច)"
  echo -ne "${YELLOW}តើចង់បោះបង់ Merge ត្រឡប់មកដើមវិញទេ? [Y/n]: ${NC}"
  read -r ABORT_MERGE
  if [[ "$ABORT_MERGE" != "n" && "$ABORT_MERGE" != "N" ]]; then
    git merge --abort 2>/dev/null || true
    echo -e "  ${GREEN}✓ បានបោះបង់ Merge ជោគជ័យ${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# STEP 1: Blocker Checks (Conflict markers & Sensitive files)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[1/4] ពិនិត្យសុវត្ថិភាព Code (Safety Pre-flight Check)...${NC}"

# Check for conflict markers in tracked files
CONFLICT_FILES=$(git grep -l -E "^<<<<<<< " -- ':!scripts/dev/git/*' ':!docs/*' 2>/dev/null || true)
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
# STEP 2: Stage & Commit Local Work FIRST (Never lose local changes)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[2/4] រៀបចំ Code និង Commit លើ Local...${NC}"

LOCAL_DIRTY=$(git status --porcelain 2>/dev/null || true)
if [ -n "$LOCAL_DIRTY" ]; then
  git add -A
  if ! git diff --cached --quiet; then
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
    echo -e "  ${GREEN}✓ បាន Commit ក្នុង Local: \"${MSG}\"${NC}"
  fi
else
  echo -e "  ${CYAN}— គ្មាន file កែប្រែថ្មីក្នុង working tree ទេ${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 3: Check Remote & Smart Sync
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[3/4] ពិនិត្យមើល Remote (origin/${BRANCH})...${NC}"
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
  echo -e "  ${YELLOW}⚠️ មិនអាចទាក់ទង GitHub បានទេ សូមពិនិត្យ Internet!${NC}"
  exit 1
}

BEHIND=$(git rev-list --count HEAD..origin/"$BRANCH" 2>/dev/null || echo 0)
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)

if [ "$BEHIND" -gt 0 ]; then
  echo -e "  ${BOLD}${YELLOW}ℹ️  មាន ${BEHIND} commit(s) ថ្មីពី Teammates លើ GitHub:${NC}"
  git log HEAD..origin/"$BRANCH" --pretty=format:"    • %h - %s (%an, %ar)" -n 5
  echo ""

  echo -e "  ${CYAN}⏳ កំពុងបញ្ចូល (Merge) code ពី remote ចូល local ដោយស្វ័យប្រវត្តិ...${NC}"
  if git merge --no-edit origin/"$BRANCH"; then
    echo -e "  ${GREEN}✓ Merge code ពី teammate ចូលជោគជ័យ!${NC}"
  else
    echo -e "  ${BOLD}${RED}❌ មាន Conflict រវាង code របស់អ្នក និង teammate!${NC}"
    echo -e "  ${YELLOW}ឯកសារដែលមាន conflict:${NC}"
    git diff --name-only --diff-filter=U 2>/dev/null | while read -r cf; do
      echo -e "    ${RED}✗ $cf${NC}"
    done
    echo -e "\n  ${YELLOW}👉 របៀបដោះស្រាយ:${NC}"
    echo -e "    1. បើក file ខាងលើ រួចកែសម្រួលដក ${CYAN}<<<<<<< HEAD${NC} និង ${CYAN}>>>>>>>${NC} ចេញ"
    echo -e "    2. រត់: ${CYAN}git add -A && git commit -m 'Merge conflict resolution'${NC}"
    echo -e "    3. រត់: ${CYAN}./scripts/dev/git/push.sh${NC} ម្ដងទៀត"
    echo -e "    (ឬប្រសិនបើចង់បោះបង់ merge ត្រឡប់មកដើមវិញ: ${CYAN}git merge --abort${NC})\n"
    exit 1
  fi
else
  echo -e "  ${GREEN}✓ Local របស់អ្នកគឺស្មើ ឬលើស Remote (Ready to Push)${NC}"
fi

# Re-check ahead count
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo 0)
if [ "$AHEAD" -eq 0 ]; then
  echo -e "\n${BOLD}${GREEN}✓ គ្មានអ្វីថ្មីត្រូវ Push ទេ (Everything is already up to date)!${NC}\n"
  exit 0
fi

# ------------------------------------------------------------------------------
# STEP 4: Push to Remote
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[4/4] កំពុង Push ${AHEAD} commit(s) ទៅកាន់ origin/${BRANCH}...${NC}"
if git push origin "$BRANCH"; then
  LAST_SHA=$(git rev-parse --short HEAD)
  echo -e "\n${BOLD}${GREEN}======================================================${NC}"
  echo -e "${BOLD}${GREEN}   ✅ PUSH COMPLETED SUCCESSFULLY (ជោគជ័យ)!${NC}"
  echo -e "${BOLD}${GREEN}======================================================${NC}"
  echo -e "  📌 Commit SHA: ${CYAN}${LAST_SHA}${NC}"
  echo -e "  📍 Remote:     ${CYAN}https://github.com/Ny-Panha/Koupreng-invitation_project.git${NC}"
  echo -e "\n  ${YELLOW}ប្រសិនបើចង់ Undo (ដក commit ចុងក្រោយវិញ):${NC}"
  echo -e "    ${CYAN}./scripts/dev/git/undo-push.sh${NC}"
  echo -e "${BOLD}${GREEN}======================================================${NC}\n"
else
  echo -e "  ${RED}❌ Push បរាជ័យ!${NC}"
  echo -e "  ${YELLOW}សូមពិនិត្យសិទ្ធិ GitHub ឬរត់:${NC} ${CYAN}git push origin $BRANCH${NC}"
  exit 1
fi
