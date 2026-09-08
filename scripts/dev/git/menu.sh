#!/usr/bin/env bash
# ==============================================================================
# Koupreng - Team Git Interactive Dashboard (Linux / macOS)
# Author: Nha & Antigravity
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

while true; do
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  echo -e "\n${BOLD}${CYAN}======================================================${NC}"
  echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - TEAM GIT MANAGER (ការពារជាន់ CODE) ⚜️${NC}"
  echo -e "${BOLD}${CYAN}======================================================${NC}"
  echo -e "  📍 Current Branch: ${GREEN}${BRANCH}${NC}"
  echo -e "------------------------------------------------------"
  echo -e "  ${BOLD}[1]${NC} 🔍 ${CYAN}Check Radar${NC}    - មើល Team push អីខ្លះ & ពិនិត្យ Conflict"
  echo -e "  ${BOLD}[2]${NC} ⬇️  ${GREEN}Safe Pull${NC}      - ទាញ Code ថ្មីចូល (Auto-stash & Safe)"
  echo -e "  ${BOLD}[3]${NC} ⬆️  ${YELLOW}Safe Push${NC}      - Push Code (ពិនិត្យកុំឱ្យជាន់ Code គ្នា)"
  echo -e "  ${BOLD}[4]${NC} 🔄 ${CYAN}Full Sync${NC}      - Pull រួច Push ដោយសុវត្ថិភាព"
  echo -e "  ${BOLD}[5]${NC} ↩️  ${RED}Undo Push${NC}      - ដក Commit ចុងក្រោយវិញ"
  echo -e "  ${BOLD}[6]${NC} 🌿 ${GREEN}Branch Menu${NC}    - បង្កើត ឬប្ដូរ Branch ធ្វើការ"
  echo -e "  ${BOLD}[0]${NC} ❌ ចាកចេញ (Exit)"
  echo -e "${BOLD}${CYAN}======================================================${NC}"
  
  echo -ne "${BOLD}${YELLOW}ជ្រើសរើសជម្រើស [0-6]: ${NC}"
  read -r CHOICE
  echo ""

  case "$CHOICE" in
    1)
      "${SCRIPT_DIR}/check.sh"
      ;;
    2)
      "${SCRIPT_DIR}/pull.sh"
      ;;
    3)
      "${SCRIPT_DIR}/push.sh"
      ;;
    4)
      echo -e "${BOLD}${CYAN}>>> ដំណាក់កាលទី 1: ទាញ Code ថ្មីចូល (Pulling)...${NC}"
      "${SCRIPT_DIR}/pull.sh"
      echo -e "\n${BOLD}${CYAN}>>> ដំណាក់កាលទី 2: Push Code របស់អ្នក (Pushing)...${NC}"
      "${SCRIPT_DIR}/push.sh"
      ;;
    5)
      "${SCRIPT_DIR}/undo-push.sh"
      ;;
    6)
      echo -e "${BOLD}${CYAN}--- Branch Management ---${NC}"
      echo -e "Branches បច្ចុប្បន្ន:"
      git branch -a
      echo ""
      echo -ne "${YELLOW}តើចង់ [1] Switch Branch ឬ [2] បង្កើត Branch ថ្មី? [1/2/cancel]: ${NC}"
      read -r B_ACTION
      if [ "$B_ACTION" = "1" ]; then
        echo -ne "${CYAN}បញ្ចូលឈ្មោះ Branch ដែលចង់ប្ដូរទៅ: ${NC}"
        read -r TARGET_B
        if [ -n "$TARGET_B" ]; then
          git checkout "$TARGET_B"
        fi
      elif [ "$B_ACTION" = "2" ]; then
        echo -ne "${CYAN}បញ្ចូលឈ្មោះ Feature Branch ថ្មី (ឧ. feature/my-work): ${NC}"
        read -r NEW_B
        if [ -n "$NEW_B" ]; then
          git checkout -b "$NEW_B"
          echo -e "${GREEN}✓ បានបង្កើត និងប្ដូរទៅ Branch: $NEW_B${NC}"
        fi
      fi
      ;;
    0)
      echo -e "${GREEN}អរគុណ! រីករាយការសរសេរ Code ជាមួយ Koupreng Team! 👋${NC}\n"
      exit 0
      ;;
    *)
      echo -e "${RED}ជម្រើសមិនត្រឹមត្រូវទេ! សូមជ្រើសរើសលេខពី 0 ដល់ 6។${NC}"
      ;;
  esac

  echo -ne "${YELLOW}ចុច [Enter] ដើម្បីបន្ត...${NC}"
  read -r _
done
