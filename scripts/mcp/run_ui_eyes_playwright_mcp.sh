#!/bin/bash
#
# run_ui_eyes_playwright_mcp.sh
# 
# Wrapper script to run the UI Eyes Playwright MCP server.
# This script ensures the repository root path is valid before starting the server.
#
# CRITICAL: This script produces ZERO STDOUT output to avoid polluting MCP JSON-RPC traffic.
# All messages are redirected to STDERR.
#
# Usage:
#   ./run_ui_eyes_playwright_mcp.sh <REPO_ROOT>
#
# Example:
#   ./run_ui_eyes_playwright_mcp.sh "/mnt/c/Users/ABY/Documents/APP test/workout-tracker"
#

set -euo pipefail

# Check if repo root argument is provided
if [ $# -eq 0 ]; then
    echo "Error: Repository root path is required" >&2
    echo "Usage: $0 <REPO_ROOT>" >&2
    exit 1
fi

REPO_ROOT="$1"

# Normalize path (resolve symlinks, remove trailing slashes)
REPO_ROOT=$(cd "$REPO_ROOT" 2>/dev/null && pwd || echo "$REPO_ROOT")
REPO_ROOT="${REPO_ROOT%/}"

# Check if path exists
if [ ! -d "$REPO_ROOT" ]; then
    echo "Error: Repository root path does not exist: $REPO_ROOT" >&2
    exit 1
fi

# Check if path is readable
if [ ! -r "$REPO_ROOT" ]; then
    echo "Error: Repository root path is not readable: $REPO_ROOT" >&2
    exit 1
fi

# Get script directory to find ui_eyes_playwright_server.mjs
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/ui_eyes_playwright_server.mjs"

# Check if server script exists
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo "Error: Server script not found: $SERVER_SCRIPT" >&2
    exit 1
fi

# Disable color output to prevent ANSI escape codes in STDOUT
export NO_COLOR=1
export FORCE_COLOR=0

# Run the MCP server with the validated repository root
# Use exec to replace shell process and prevent any extra output
exec node "$SERVER_SCRIPT" "$REPO_ROOT"
