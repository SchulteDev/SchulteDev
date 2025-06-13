#!/bin/bash
set -e

# Set a default output file if GITHUB_OUTPUT is not set
OUTPUT_FILE="${GITHUB_OUTPUT:-/tmp/github_output.txt}"

# Detect processing mode and prepare content
echo "🔍 Detecting processing mode..."

if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    REBUILD_MODE="${REBUILD_MODE:-incremental}"
    if [ "$REBUILD_MODE" = "full_rebuild" ]; then
        echo "process_mode=full_rebuild" >> "$OUTPUT_FILE"
        echo "🔄 Manual trigger: Full rebuild mode"
    else
        echo "process_mode=incremental" >> "$OUTPUT_FILE"
        echo "📝 Manual trigger: Incremental mode"

        # Get changes (might be empty for manual incremental)
        echo "📝 Getting career.md changes..."
        git diff HEAD~1 HEAD _data/career.md > _data/career_changes.diff || echo "No changes detected" > career_changes.diff
    fi
else
    # Auto-trigger from push
    if git diff HEAD~1 HEAD --name-only | grep -q "_data/career.md"; then
        echo "process_mode=incremental" >> "$OUTPUT_FILE"
        echo "🔍 Auto-trigger: Changes detected in career.md"

        echo "📝 Getting career.md changes..."
        git diff HEAD~1 HEAD _data/career.md > career_changes.diff
    else
        echo "process_mode=skip" >> "$OUTPUT_FILE"
        echo "⏭️ Auto-trigger: No changes in career.md"
    fi
fi
