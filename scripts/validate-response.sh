#!/bin/bash
set -e

MODE="$1"
echo "🔍 Validating Claude response for $MODE mode..."

# Extract the response
FINAL_FILE="cv/anti-cv.tex"
if [ "$MODE" = "incremental" ]; then
    OUTPUT_FILE="updated_anti-cv.tex"
elif [ "$MODE" = "full_rebuild" ]; then
    OUTPUT_FILE="new_anti-cv.tex"
else
    echo "❌ Invalid mode: $MODE"
    exit 1
fi

# Extract LaTeX from Claude's response
jq -r '.content[0].text' claude_response.json > "$OUTPUT_FILE"

# Validate the response
if [ -s "$OUTPUT_FILE" ] && grep -q "\\documentclass" "$OUTPUT_FILE"; then
    mv "$OUTPUT_FILE" "$FINAL_FILE"
    echo "✅ Successfully updated $FINAL_FILE with Claude 4 Opus ($MODE)"

    # Show some stats
    LINES=$(wc -l < "$FINAL_FILE")
    SIZE=$(wc -c < "$FINAL_FILE")
    echo "📊 Document stats: $LINES lines, $SIZE bytes"

    # Basic LaTeX syntax check
    if grep -q "\\begin{document}" "$FINAL_FILE" && grep -q "\\end{document}" "$FINAL_FILE"; then
        echo "✅ Basic LaTeX structure validated"
    else
        echo "⚠️ Warning: Missing \\begin{document} or \\end{document}"
    fi
else
    echo "❌ Claude response invalid, keeping original $FINAL_FILE"
    echo "🔍 Claude response debug:"
    cat claude_response.json | jq -r '.content[0].text' | head -n 10
    echo "..."
    exit 1
fi
