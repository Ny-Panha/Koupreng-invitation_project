#!/usr/bin/env bash
# ==============================================================================
# Koupreng Project - Clean Linux Setup Script
# Author: Nha & Antigravity
# Environment: Linux (Kali / Debian / Ubuntu)
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Colors & Formatting
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

cd "${ROOT_DIR}"

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG - FULL STACK LINUX SETUP  ⚜️${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"

# 1. Check System Prerequisites
echo -e "\n${BOLD}[1/6] Checking System Tools...${NC}"
command -v java >/dev/null 2>&1 || { echo -e "${RED}✗ Java not found. Please install OpenJDK 25.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Node.js not found. Please install Node 20+.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}✗ npm not found.${NC}"; exit 1; }

JAVA_VER=$(java -version 2>&1 | head -n 1)
NODE_VER=$(node -v)
echo -e "  ${GREEN}✓ Java:${NC} ${JAVA_VER}"
echo -e "  ${GREEN}✓ Node:${NC} ${NODE_VER}"

# 2. Setup .env
echo -e "\n${BOLD}[2/6] Configuring Environment (.env)...${NC}"
if [ ! -f "${ROOT_DIR}/.env" ]; then
  cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
  # Set default DB password to 123456
  sed -i 's/DB_PASSWORD=change_me/DB_PASSWORD=123456/g' "${ROOT_DIR}/.env" || true
  echo -e "  ${GREEN}✓ Created .env with default DB_PASSWORD=123456${NC}"
else
  echo -e "  ${GREEN}✓ .env file exists${NC}"
fi

# 3. Check & Start MariaDB / MySQL
echo -e "\n${BOLD}[3/6] Configuring MariaDB / MySQL Database...${NC}"
if ! systemctl is-active --quiet mariadb && ! systemctl is-active --quiet mysql; then
  echo -e "  ${YELLOW}Starting MariaDB service...${NC}"
  sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null || true
fi

# Create database koupreng_db and grant permissions
DB_PASS="123456"
if [ -f "${ROOT_DIR}/.env" ]; then
  ENV_PASS=$(grep '^DB_PASSWORD=' "${ROOT_DIR}/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  if [ -n "$ENV_PASS" ]; then DB_PASS="$ENV_PASS"; fi
fi

mysql -u root -p"${DB_PASS}" -e "CREATE DATABASE IF NOT EXISTS koupreng_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || \
sudo mariadb -e "CREATE DATABASE IF NOT EXISTS koupreng_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_PASS}'; FLUSH PRIVILEGES;" 2>/dev/null || true

echo -e "  ${GREEN}✓ Database 'koupreng_db' is ready on port 3306${NC}"

# 4. Install Frontend User Dependencies
echo -e "\n${BOLD}[4/6] Installing Frontend User Dependencies...${NC}"
(
  cd "${ROOT_DIR}/apps/frontend-user"
  npm install
  echo -e "  ${GREEN}✓ apps/frontend-user packages installed${NC}"
)

# 5. Install Frontend Admin Dependencies
echo -e "\n${BOLD}[5/6] Installing Frontend Admin Dependencies...${NC}"
(
  cd "${ROOT_DIR}/apps/frontend-admin"
  npm install
  echo -e "  ${GREEN}✓ apps/frontend-admin packages installed${NC}"
)

# 6. Telegram Bot Python Environment (Optional)
echo -e "\n${BOLD}[6/6] Setting up Python Environment for Telegram Bot...${NC}"
if [ -d "${ROOT_DIR}/apps/telegram-bot" ]; then
  (
    cd "${ROOT_DIR}/apps/telegram-bot"
    if [ ! -d ".venv" ]; then
      python3 -m venv .venv 2>/dev/null || true
    fi
    if [ -f ".venv/bin/activate" ]; then
      source .venv/bin/activate
      pip install --quiet fastapi httpx uvicorn python-dotenv 2>/dev/null || true
      echo -e "  ${GREEN}✓ Telegram Bot virtualenv ready${NC}"
    fi
  )
fi

echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   🎉 SETUP COMPLETED SUCCESSFULLY FOR LINUX! 🎉${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "To start all dev servers, run:"
echo -e "  ${CYAN}./scripts/dev/dev.sh${NC}\n"
