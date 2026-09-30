#!/usr/bin/env bash

# ==============================================================================
# Script: safe-pull.sh
# Purpose: Auto stash local changes, pull latest remote commits, and pop stash
# ==============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}[INFO]${NC} Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

# Check for local changes (staged, unstaged, or untracked)
HAS_CHANGES=false
if ! git diff-index --quiet HEAD -- 2>/dev/null || [ -n "$(git status --porcelain)" ]; then
    HAS_CHANGES=true
fi

STASHED=false
if [ "$HAS_CHANGES" = true ]; then
    BACKUP_TAG="safe-pull-backup-$(date +'%Y%m%d_%H%M%S')"
    echo -e "${YELLOW}[INFO]${NC} Detecting uncommitted changes. Stashing backup as: ${GREEN}$BACKUP_TAG${NC}..."
    git stash push -m "$BACKUP_TAG"
    STASHED=true
else
    echo -e "${GREEN}[INFO]${NC} Working tree is clean. No local changes to stash."
fi

# Pull latest changes from remote
echo -e "${BLUE}[INFO]${NC} Pulling latest commits from origin/$CURRENT_BRANCH..."
if git pull origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}[SUCCESS]${NC} Pulled latest commits successfully!"
else
    echo -e "${RED}[ERROR]${NC} git pull failed!"
    if [ "$STASHED" = true ]; then
        echo -e "${YELLOW}[INFO]${NC} Restoring your local changes..."
        git stash pop
    fi
    exit 1
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo -e "${BLUE}[INFO]${NC} Restoring your local changes (git stash pop)..."
    set +e
    git stash pop
    POP_STATUS=$?
    set -e

    if [ $POP_STATUS -ne 0 ]; then
        echo -e "${RED}[WARNING]${NC} Merge conflict detected after stash pop!"
        echo -e "${YELLOW}Please check conflicted files with: ${GREEN}git status${NC}"
        echo -e "${YELLOW}Conflicted files:${NC}"
        git diff --name-only --diff-filter=U
    else
        echo -e "${GREEN}[SUCCESS]${NC} All changes merged and restored cleanly!"
    fi
fi

echo -e "${GREEN}=== Safe pull completed ===${NC}"
