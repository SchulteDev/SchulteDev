#!/bin/bash
set -e

echo "🔄 Starting incremental transformation..."

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    exit 1
fi

# Use jq to properly construct the JSON payload
jq -n \
  --arg model "claude-opus-4-20250514" \
  --arg content "You are an expert LaTeX document designer and professional CV writer. I need you to transform career updates into a high-quality anti-CV format.

**Current LaTeX document:**
\`\`\`latex
$(jq -Rs . cv/anti-cv.tex)
\`\`\`

**Career changes detected:**
\`\`\`diff
$(jq -Rs . cv/career_changes.diff)
\`\`\`

**Instructions:**
1. Use extended thinking to analyze the changes and plan the optimal integration
2. Maintain the humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols
3. Ensure professional information is accurately incorporated
4. Optimize LaTeX formatting for visual appeal and readability
5. Consider typography, spacing, and layout improvements
6. Ensure all LaTeX syntax is correct and compilable

**Requirements:**
- Return ONLY the complete updated LaTeX code
- No explanations or markdown formatting
- Ensure the document compiles without errors
- Maintain consistency with existing styling
- Do NOT include any thinking process or explanations in your response

Please think through this carefully and produce the highest quality CV possible." \
  '{
    model: $model,
    max_tokens: 8000,
    messages: [{
      role: "user",
      content: $content
    }]
  }' | curl -X POST "https://api.anthropic.com/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d @- > claude_response.json

echo "✅ Incremental transformation response received"
