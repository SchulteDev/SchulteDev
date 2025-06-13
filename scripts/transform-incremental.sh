#!/bin/bash
set -e

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/claude-api.sh"

echo "🔄 Starting incremental transformation..."

# Detect if we need to process
if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    if [ "${REBUILD_MODE:-incremental}" = "full_rebuild" ]; then
        set_output "process_mode" "full_rebuild"
        echo "🔄 Manual trigger: Switching to full rebuild"
        exit 0
    fi
    set_output "process_mode" "incremental"
    echo "📝 Manual trigger: Incremental mode"
    git diff HEAD~1 HEAD "$CAREER_FILE" > "$DIFF_FILE" || echo "No changes detected" > "$DIFF_FILE"
else
    if git diff HEAD~1 HEAD --name-only | grep -q "$CAREER_FILE"; then
        set_output "process_mode" "incremental"
        echo "🔍 Auto-trigger: Changes detected in $CAREER_FILE"
        git diff HEAD~1 HEAD "$CAREER_FILE" > "$DIFF_FILE"
    else
        set_output "process_mode" "skip"
        echo "⏭️ Auto-trigger: No changes in $CAREER_FILE"
        exit 0
    fi
fi

# Check if diff is empty
if [ ! -s "$DIFF_FILE" ] || [ "$(cat "$DIFF_FILE")" = "No changes detected" ]; then
    echo "ℹ️ No actual changes to process"
    set_output "process_mode" "skip"
    exit 0
fi

# Build prompt using shared function
PROMPT=$(build_cv_prompt "incremental")
if [ $? -ne 0 ]; then
    echo "❌ Failed to build prompt"
    rm -f "$DIFF_FILE"
    exit 1
fi

# Make API call
if call_claude_api "$PROMPT"; then
    echo "✅ Incremental transformation response received"
    # Cleanup
    rm -f "$DIFF_FILE"
else
    echo "❌ API call failed"
    rm -f "$DIFF_FILE"
    exit 1
fi
