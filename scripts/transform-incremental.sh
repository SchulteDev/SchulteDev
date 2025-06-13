#!/bin/bash
set -e

echo "🔄 Starting incremental transformation with Claude 4 Opus..."

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    exit 1
fi

# Escape content for JSON
CURRENT_LATEX=$(cat anti-cv.tex | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')
CAREER_CHANGES=$(cat career_changes.diff | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

echo "📤 Sending request to Claude 4 Opus..."

curl -X POST "https://api.anthropic.com/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"claude-opus-4\",
    \"max_tokens\": 8000,
    \"thinking\": {
      \"mode\": \"extended\"
    },
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"You are an expert LaTeX document designer and professional CV writer. I need you to transform career updates into a high-quality anti-CV format.\\n\\n**Current LaTeX document:**\\n\\\`\\\`\\\`latex\\n$CURRENT_LATEX\\\`\\\`\\\`\\n\\n**Career changes detected:**\\n\\\`\\\`\\\`diff\\n$CAREER_CHANGES\\\`\\\`\\\`\\n\\n**Instructions:**\\n1. Use extended thinking to analyze the changes and plan the optimal integration\\n2. Maintain the humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols\\n3. Ensure professional information is accurately incorporated\\n4. Optimize LaTeX formatting for visual appeal and readability\\n5. Consider typography, spacing, and layout improvements\\n6. Ensure all LaTeX syntax is correct and compilable\\n\\n**Requirements:**\\n- Return ONLY the complete updated LaTeX code\\n- No explanations or markdown formatting\\n- Ensure the document compiles without errors\\n- Maintain consistency with existing styling\\n\\nPlease think through this carefully and produce the highest quality CV possible.\"
    }]
  }" > claude_response.json

echo "✅ Response received from Claude 4 Opus"
