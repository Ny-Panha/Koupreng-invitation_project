#!/usr/bin/env bash
# ==============================================================================
# Koupreng Project - Root Dev Entrypoint
# Forward to scripts/maintenance/dev/dev.sh
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/scripts/maintenance/dev/dev.sh" "$@"
