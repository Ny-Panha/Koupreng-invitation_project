#!/usr/bin/env bash
# ==============================================================================
# E-Invitation Project - AI Agent Skills Setup & Verification
# Verifies project-local AI agent skills against ai-skills.lock.json.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCK_FILE="${PROJECT_ROOT}/ai-skills.lock.json"
SKILLS_DIR="${PROJECT_ROOT}/.agents/skills"

echo "=========================================================="
echo "   E-Invitation Project - AI Agent Skills Setup & Verification"
echo "=========================================================="
echo "Project Root: ${PROJECT_ROOT}"
echo "Skills Directory: ${SKILLS_DIR}"
echo "Lockfile: ${LOCK_FILE}"

if [[ ! -f "${LOCK_FILE}" ]]; then
    echo "ERROR: Lockfile not found at ${LOCK_FILE}" >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    if python -c "import sys" >/dev/null 2>&1; then
        echo "Notice: jq not found; delegating to python for full SHA-256 cryptographic verification..."
        python "${PROJECT_ROOT}/scripts/validate-agent-routing.py"
        exit $?
    elif python3 -c "import sys" >/dev/null 2>&1; then
        echo "Notice: jq not found; delegating to python3 for full SHA-256 cryptographic verification..."
        python3 "${PROJECT_ROOT}/scripts/validate-agent-routing.py"
        exit $?
    else
        echo "ERROR: Neither 'jq' nor a functioning 'python/python3' interpreter was found." >&2
        echo "Cannot perform required SHA-256 cryptographic integrity verification without jq or Python." >&2
        echo "Please install jq or Python 3 to verify ai-skills.lock.json." >&2
        exit 1
    fi
fi

TOTAL_SKILLS=$(jq '.skills | length' "${LOCK_FILE}")
echo "Verifying ${TOTAL_SKILLS} pinned skills from lockfile..."

ALL_VALID=true
VERIFIED=0
ERRORS=0

for i in $(seq 0 $((TOTAL_SKILLS - 1))); do
    SKILL_NAME=$(jq -r ".skills[$i].skill" "${LOCK_FILE}")
    CATEGORY=$(jq -r ".skills[$i].category" "${LOCK_FILE}")
    COMMIT=$(jq -r ".skills[$i].commit" "${LOCK_FILE}")
    TARGET_DIR="${SKILLS_DIR}/${SKILL_NAME}"

    echo "Checking [${CATEGORY}] ${SKILL_NAME}..."

    if [[ ! -d "${TARGET_DIR}" ]]; then
        echo "  [-] Missing directory: ${TARGET_DIR}"
        ALL_VALID=false
        ERRORS=$((ERRORS + 1))
        continue
    fi

    FILES_COUNT=$(jq ".skills[$i].files | length" "${LOCK_FILE}")
    SKILL_OK=true

    for j in $(seq 0 $((FILES_COUNT - 1))); do
        FILE_PATH=$(jq -r ".skills[$i].files[$j].path" "${LOCK_FILE}")
        EXPECTED_SHA=$(jq -r ".skills[$i].files[$j].sha256" "${LOCK_FILE}")
        FULL_PATH="${TARGET_DIR}/${FILE_PATH}"

        if [[ ! -f "${FULL_PATH}" ]]; then
            echo "    [x] Missing file: ${FILE_PATH}"
            SKILL_OK=false
            ERRORS=$((ERRORS + 1))
            continue
        fi

        CURRENT_SHA=$(sha256sum "${FULL_PATH}" | awk '{print $1}')
        if [[ "${CURRENT_SHA}" != "${EXPECTED_SHA}" ]]; then
            echo "    [!] Hash mismatch: ${FILE_PATH}"
            SKILL_OK=false
            ERRORS=$((ERRORS + 1))
        fi
    done

    if [[ "${SKILL_OK}" == "true" ]]; then
        echo "  [+] Verified (${FILES_COUNT} files) [Commit: ${COMMIT:0:8}]"
        VERIFIED=$((VERIFIED + 1))
    else
        ALL_VALID=false
    fi
done

CUSTOM_SKILLS=(
    "koupreng-premium-ux"
    "koupreng-backend-standards"
    "koupreng-payment-security"
    "koupreng-database-flyway"
    "koupreng-qa-release"
    "koupreng-deployment"
)

echo ""
echo "Checking Koupreng Custom Canonical Skills..."
CUSTOM_VERIFIED=0

for c_skill in "${CUSTOM_SKILLS[@]}"; do
    C_DIR="${SKILLS_DIR}/${c_skill}"
    C_MD="${C_DIR}/SKILL.md"
    C_REFS="${C_DIR}/references"

    if [[ -d "${C_DIR}" && -f "${C_MD}" && -d "${C_REFS}" ]]; then
        echo "  [+] Verified [Koupreng Canonical] ${c_skill}"
        CUSTOM_VERIFIED=$((CUSTOM_VERIFIED + 1))
    else
        echo "  [x] Missing custom skill assets in: ${c_skill}"
        ALL_VALID=false
        ERRORS=$((ERRORS + 1))
    fi
done

echo "----------------------------------------------------------"
echo "Verified Pinned Skills : ${VERIFIED} / ${TOTAL_SKILLS}"
echo "Verified Custom Skills : ${CUSTOM_VERIFIED} / ${#CUSTOM_SKILLS[@]}"
echo "Errors                 : ${ERRORS}"

if [[ "${ALL_VALID}" == "true" ]]; then
    echo "All team AI Agent Skills are fully verified and intact!"
    exit 0
else
    echo "Skill verification failed with ${ERRORS} error(s)."
    exit 1
fi
