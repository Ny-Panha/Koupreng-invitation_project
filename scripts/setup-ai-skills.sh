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
    echo "WARNING: jq not installed. Verifying file presence only."
    MISSING=0
    for skill in $(ls -d "${SKILLS_DIR}"/*/ 2>/dev/null); do
        if [[ -f "${skill}SKILL.md" ]]; then
            echo "  [+] Found skill: $(basename "${skill}")"
        else
            echo "  [-] Missing SKILL.md in: $(basename "${skill}")"
            MISSING=$((MISSING + 1))
        fi
    done
    if [[ $MISSING -eq 0 ]]; then
        echo "All skills verified."
        exit 0
    else
        echo "Verification failed."
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
        NORM_SHA=$(tr -d '\r' < "${FULL_PATH}" | sha256sum | awk '{print $1}')

        if [[ "${CURRENT_SHA}" != "${EXPECTED_SHA}" && "${NORM_SHA}" != "${EXPECTED_SHA}" ]]; then
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

echo "----------------------------------------------------------"
echo "Verified Skills: ${VERIFIED} / ${TOTAL_SKILLS}"
echo "Errors: ${ERRORS}"

if [[ "${ALL_VALID}" == "true" ]]; then
    echo "All team AI Agent Skills are fully verified and intact!"
    exit 0
else
    echo "Skill verification failed with ${ERRORS} error(s)."
    exit 1
fi
