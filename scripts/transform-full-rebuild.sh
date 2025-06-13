#!/bin/bash
set -e

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/claude-api.sh"

echo "🏗️ Starting full rebuild..."

# Set output mode
set_output "process_mode" "full_rebuild"

# Build prompt using shared function
PROMPT=$(build_cv_prompt "full_rebuild")
if [ $? -ne 0 ]; then
    echo "❌ Failed to build prompt"
    exit 1
fi

# Make API call
if call_claude_api "$PROMPT"; then
    echo "✅ Full rebuild response received"
else
    echo "❌ API call failed"
    exit 1
fi
