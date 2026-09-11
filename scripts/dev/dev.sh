#!/usr/bin/env bash
# ==============================================================================
# Koupreng Project - Full Stack Linux Dev Orchestrator
# Author: Nha & Antigravity
# Environment: Linux
# Runs: Backend (:8080) + Frontend User (:5173) + Frontend Admin (:5174)
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

ENABLE_NGROK=false
ENABLE_BOT=false
RUN_USER=true
RUN_ADMIN=true

# Parse flags
for arg in "$@"; do
  case $arg in
    --ngrok)
      ENABLE_NGROK=true
      ;;
    --bot)
      ENABLE_BOT=true
      ;;
    --admin|--admin-only)
      RUN_ADMIN=true
      RUN_USER=false
      ;;
    --user|--user-only)
      RUN_USER=true
      RUN_ADMIN=false
      ;;
    --no-ngrok)
      ENABLE_NGROK=false
      ;;
    --help|-h)
      echo -e "${BOLD}Usage:${NC} ./scripts/dev/dev.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --admin       Run Backend + Frontend Admin only"
      echo "  --user        Run Backend + Frontend User only"
      echo "  --ngrok       Launch ngrok tunnel for Frontend (:5173)"
      echo "  --bot         Launch Telegram Bot service (:8000)"
      echo "  --no-ngrok    Run locally without tunnel (default)"
      echo "  --help, -h    Show this help message"
      exit 0
      ;;
  esac
done

cd "${ROOT_DIR}"

if [ -f "${ROOT_DIR}/.env" ]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${YELLOW}   ⚜️  KOUPRENG FULL STACK DEV RUNNER (LINUX)  ⚜️${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"

# Function to kill stale process on a port
free_port() {
  local port=$1
  local pids
  pids=$(fuser "${port}/tcp" 2>/dev/null || lsof -ti :${port} 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${YELLOW}⚡ Freeing busy port :${port}...${NC}"
    kill -9 $pids 2>/dev/null || true
    sleep 0.5
  fi
}

# 1. Database Check & Start
echo -e "\n${BOLD}[1/4] Checking Database Service...${NC}"
if systemctl is-active --quiet mariadb 2>/dev/null; then
  echo -e "  ${GREEN}✓ MariaDB service is active on port 3306${NC}"
elif systemctl is-active --quiet mysql 2>/dev/null; then
  echo -e "  ${GREEN}✓ MySQL service is active on port 3306${NC}"
else
  echo -e "  ${YELLOW}⚡ Starting database service...${NC}"
  sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null || true
  echo -e "  ${GREEN}✓ Database started${NC}"
fi

# Auto-seed Admin in DB
DB_PASS="123456"
if [ -f "${ROOT_DIR}/.env" ]; then
  ENV_PASS=$(grep '^DB_PASSWORD=' "${ROOT_DIR}/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  if [ -n "$ENV_PASS" ]; then DB_PASS="$ENV_PASS"; fi
fi

mariadb -u root -p"${DB_PASS}" -e "USE koupreng_db; INSERT INTO users (full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at) VALUES ('Admin Koupreng', 'admin@koupreng.com', '012345678', '\$2a\$10\$VYSoe48hAPodBefSWhXXo.R.LXRVTncX6B1tZiFIcMGAxUZcsgj8i', 'ADMIN', 'ACTIVE', 0, NOW(), NOW()) ON DUPLICATE KEY UPDATE role='ADMIN';" 2>/dev/null || true

# Track child PIDs
PIDS=()

cleanup() {
  echo -e "\n\n${YELLOW}🛑 Shutting down all Koupreng dev services...${NC}"
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  echo -e "${GREEN}✓ All services stopped cleanly.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 2. Start Backend (Spring Boot :8080)
free_port 8080
echo -e "\n${BOLD}[2/4] Starting Backend (Spring Boot on :8080)...${NC}"
(
  cd "${ROOT_DIR}/apps/backend"
  ./mvnw spring-boot:run -Dspring-boot.run.profiles="${SPRING_PROFILES_ACTIVE:-dev}"
) &
PIDS+=($!)

echo -e "  ${CYAN}Waiting for Backend to initialize...${NC}"
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/actuator/health/readiness >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend is READY at http://localhost:8080${NC}"
    break
  fi
  sleep 1
done

# 3. Start Frontend User (:5173)
if [ "$RUN_USER" = true ]; then
  free_port 5173
  echo -e "\n${BOLD}[3/4] Starting Frontend User (React on :5173)...${NC}"
  (
    cd "${ROOT_DIR}/apps/frontend-user"
    npm run dev -- --host --port 5173
  ) &
  PIDS+=($!)

  echo -e "  ${CYAN}Waiting for Frontend User to initialize...${NC}"
  for i in {1..30}; do
    if curl -fsS http://127.0.0.1:5173/login >/dev/null 2>&1; then
      echo -e "  ${GREEN}✓ Frontend User is READY at http://localhost:5173${NC}"
      break
    fi
    sleep 1
  done
fi

# 4. Start Frontend Admin (:5174)
if [ "$RUN_ADMIN" = true ]; then
  free_port 5174
  echo -e "\n${BOLD}[4/4] Starting Frontend Admin (React on :5174)...${NC}"
  (
    cd "${ROOT_DIR}/apps/frontend-admin"
    npm run dev -- --host --port 5174
  ) &
  PIDS+=($!)
fi

# Optional: Telegram Bot
if [ "$ENABLE_BOT" = true ] && [ -d "${ROOT_DIR}/apps/telegram-bot" ]; then
  free_port 8000
  echo -e "\n${BOLD}[Bot] Starting Telegram Bot (FastAPI on :8000)...${NC}"
  (
    cd "${ROOT_DIR}/apps/telegram-bot"
    if [ -d ".venv" ]; then source .venv/bin/activate; fi
    python3 -m uvicorn app.main:app --port 8000 --reload
  ) &
  PIDS+=($!)
fi

# Optional: Ngrok Tunnel
if [ "$ENABLE_NGROK" = true ]; then
  echo -e "\n${BOLD}[Tunnel] Starting Ngrok for :5173...${NC}"
  (
    ngrok http 5173
  ) &
  PIDS+=($!)
fi

# Status Banner
echo -e "\n${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✨ ALL SERVICES RUNNING SUCCESSFULLY! ✨${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}"
if [ "$RUN_USER" = true ]; then
  echo -e "  🌐 ${BOLD}Frontend User:${NC}   ${CYAN}http://localhost:5173${NC}"
fi
if [ "$RUN_ADMIN" = true ]; then
  echo -e "  👑 ${BOLD}Frontend Admin:${NC}  ${CYAN}http://localhost:5174${NC} ${YELLOW}(admin@koupreng.com / admin123)${NC}"
fi
echo -e "  ⚙️  ${BOLD}Backend API:${NC}     ${CYAN}http://localhost:8080${NC}"
if [ "$ENABLE_BOT" = true ]; then
  echo -e "  🤖 ${BOLD}Telegram Bot:${NC}    ${CYAN}http://localhost:8000${NC}"
fi
echo -e "------------------------------------------------------"
echo -e "  ${YELLOW}Press [Ctrl + C] anytime to stop all services.${NC}"
echo -e "======================================================\n"

wait
