#!/bin/bash
set -e

echo "🏗️ Starting full rebuild with Claude 4 Opus..."

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    exit 1
fi

# Escape content for JSON
CAREER_CONTENT=$(cat career_full_content.md | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

echo "📤 Sending full rebuild request to Claude 4 Opus..."

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
      \"content\": \"You are an expert LaTeX document designer and professional CV writer. I need you to create a complete anti-CV from scratch using the provided career information.\\n\\n**Complete career information:**\\n\\\`\\\`\\\`markdown\\n$CAREER_CONTENT\\\`\\\`\\\`\\n\\n**Instructions:**\\n1. Create a COMPLETE anti-CV LaTeX document from scratch\\n2. Use extended thinking to design the optimal structure and layout\\n3. Maintain humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols\\n4. Apply modern LaTeX best practices for typography and design\\n5. Ensure excellent visual hierarchy and readability\\n6. Include all necessary packages and document setup\\n7. Optimize for professional appearance while keeping the anti-CV humor\\n\\n**Requirements:**\\n- Return ONLY the complete LaTeX document code\\n- Include \\\\documentclass and all necessary setup\\n- No explanations or markdown formatting\\n- Ensure the document compiles without errors\\n- Make it the best possible anti-CV design\\n\\nPlease think through this carefully and create the highest quality complete anti-CV possible.\"
    }]
  }" > claude_response.json

echo "✅ Full rebuild response received from Claude 4 Opus"
