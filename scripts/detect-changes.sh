#!/bin/bash
set -e

# Detect processing mode and prepare content
echo "🔍 Detecting processing mode..."

if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    REBUILD_MODE="${REBUILD_MODE:-incremental}"
    if [ "$REBUILD_MODE" = "full_rebuild" ]; then
        echo "process_mode=full_rebuild" >> $GITHUB_OUTPUT
        echo "🔄 Manual trigger: Full rebuild mode"

        # Prepare full content
        echo "📄 Preparing full career.md content..."
        cp career.md career_full_content.md
    else
        echo "process_mode=incremental" >> $GITHUB_OUTPUT
        echo "📝 Manual trigger: Incremental mode"

        # Get changes (might be empty for manual incremental)
        echo "📝 Getting career.md changes..."
        git diff HEAD~1 HEAD career.md > career_changes.diff || echo "No changes detected" > career_changes.diff
    fi
else
    # Auto-trigger from push
    if git diff HEAD~1 HEAD --name-only | grep -q "career.md"; then
        echo "process_mode=incremental" >> $GITHUB_OUTPUT
        echo "🔍 Auto-trigger: Changes detected in career.md"

        echo "📝 Getting career.md changes..."
        git diff HEAD~1 HEAD career.md > career_changes.diff
    else
        echo "process_mode=skip" >> $GITHUB_OUTPUT
        echo "⏭️ Auto-trigger: No changes in career.md"
    fi
fi
