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

# Extract LaTeX from Claude's response and filter out extended_thinking
jq -r '.content[0].text' claude_response.json | \
  sed '/<extended_thinking>/,/<\/extended_thinking>/d' | \
  sed '/^$/d' > "$OUTPUT_FILE"

# Validate the response
if [ -s "$OUTPUT_FILE" ] && grep -q '\\documentclass' "$OUTPUT_FILE"; then
    mv "$OUTPUT_FILE" "$FINAL_FILE"
    echo "✅ Successfully updated $FINAL_FILE ($MODE)"

    # Show some stats
    LINES=$(wc -l < "$FINAL_FILE")
    SIZE=$(wc -c < "$FINAL_FILE")
    echo "📊 Document stats: $LINES lines, $SIZE bytes"

    # Basic LaTeX syntax check
    if grep -q '\\begin{document}' "$FINAL_FILE" && grep -q '\\end{document}' "$FINAL_FILE"; then
        echo "✅ Basic LaTeX structure validated"
    else
        printf "⚠️ Warning: Missing \\begin{document} or \\end{document}\n"
    fi
else
    echo "❌ Claude response invalid, keeping original $FINAL_FILE"
    echo "🔍 Claude response debug:"
    jq -r '.content[0].text' claude_response.json | head -n 10
    echo "..."
    exit 1
fi
