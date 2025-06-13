#!/bin/bash
set -e

echo "🏗️ Starting full rebuild with Claude 4 Opus..."

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    exit 1
fi

echo "📤 Starting full rebuild..."

# Use jq to properly construct the JSON payload
jq -n \
  --arg model "claude-opus-4-20250514" \
  --arg content "You are an expert LaTeX document designer and professional CV writer. I need you to create a complete anti-CV from scratch using the provided career information.

**Complete career information:**
\`\`\`markdown
$(cat _data/career.md | jq -Rs .)
\`\`\`

**Instructions:**
1. Create a COMPLETE anti-CV LaTeX document from scratch
2. Use extended thinking to design the optimal structure and layout
3. Maintain humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols
4. Apply modern LaTeX best practices for typography and design
5. Ensure excellent visual hierarchy and readability
6. Include all necessary packages and document setup
7. Optimize for professional appearance while keeping the anti-CV humor

**Requirements:**
- Return ONLY the complete LaTeX document code
- Include \\documentclass and all necessary setup
- No explanations or markdown formatting
- Ensure the document compiles without errors
- Make it the best possible anti-CV design

Please think through this carefully and create the highest quality complete anti-CV possible." \
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

echo "✅ Full rebuild response received"
