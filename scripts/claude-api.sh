#!/bin/bash
# claude-api.sh - Shared helper for Claude API calls

set -e

# Configuration with defaults
RESPONSE_FILE="${RESPONSE_FILE:-claude_response.json}"
API_MODEL="${API_MODEL:-claude-opus-4-20250514}"
API_URL="${API_URL:-https://api.anthropic.com/v1/messages}"
MAX_TOKENS="${MAX_TOKENS:-8000}"

# Function to make Claude API call
call_claude_api() {
    local prompt="$1"
    
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "❌ ANTHROPIC_API_KEY not set"
        return 1
    fi
    
    if [ -z "$prompt" ]; then
        echo "❌ No prompt provided"
        return 1
    fi
    
    echo "🤖 Calling Claude API..."
    
    jq -n \
      --arg model "$API_MODEL" \
      --arg content "$prompt" \
      --argjson max_tokens "$MAX_TOKENS" \
      '{
        model: $model,
        max_tokens: $max_tokens,
        messages: [{
          role: "user",
          content: $content
        }]
      }' | curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -d @- > "$RESPONSE_FILE"
    
    # Check if response is valid
    if ! jq -e '.content[0].text' "$RESPONSE_FILE" >/dev/null 2>&1; then
        echo "❌ Invalid API response:"
        jq . "$RESPONSE_FILE" | head -20
        return 1
    fi
    
    echo "✅ API response received"
    return 0
}

# Function to extract LaTeX from response
extract_latex() {
    local output_file="$1"
    
    if [ -z "$output_file" ]; then
        echo "❌ No output file specified"
        return 1
    fi
    
    # Extract text, remove extended_thinking tags, code block markers, and clean up
    jq -r '.content[0].text' "$RESPONSE_FILE" | \
      sed '/<extended_thinking>/,/<\/extended_thinking>/d' | \
      sed '/^```latex$/d' | \
      sed '/^```$/d' | \
      sed '/^$/d' > "$output_file"

    echo "✅ Extracted LaTeX and removed any code block markers"
    return 0
}

# Function to build CV transformation prompt
build_cv_prompt() {
    local mode="$1"
    local prompt=""
    
    local base_instructions="You are an expert LaTeX document designer and professional CV writer."
    local common_instructions="
**Instructions:**
1. Use extended thinking to analyze and plan the optimal document
2. Maintain the humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols
3. Ensure professional information is accurately incorporated
4. Apply modern LaTeX best practices for typography and design
5. Ensure excellent visual hierarchy and readability
6. Optimize LaTeX formatting for visual appeal
7. Ensure all LaTeX syntax is correct and compilable

**Requirements:**
- Return ONLY the complete LaTeX document code
- No explanations or markdown formatting
- Ensure the document compiles without errors
- Make it the best possible anti-CV design
- Do NOT include any thinking process or explanations in your response"
    
    case "$mode" in
        incremental)
            if [ ! -f "$CV_FILE" ]; then
                echo "❌ CV file not found: $CV_FILE"
                return 1
            fi
            if [ ! -f "$DIFF_FILE" ]; then
                echo "❌ Diff file not found: $DIFF_FILE"
                return 1
            fi
            
            prompt="$base_instructions I need you to transform career updates into a high-quality anti-CV format.

**Current LaTeX document:**
\`\`\`latex
$(cat "$CV_FILE")
\`\`\`

**Career changes detected:**
\`\`\`diff
$(cat "$DIFF_FILE")
\`\`\`

$common_instructions
- Maintain consistency with existing styling

Please think through this carefully and produce the highest quality CV possible."
            ;;
            
        full_rebuild)
            if [ ! -f "$CAREER_FILE" ]; then
                echo "❌ Career file not found: $CAREER_FILE"
                return 1
            fi
            
            prompt="$base_instructions I need you to create a complete anti-CV from scratch using the provided career information.

**Complete career information:**
\`\`\`markdown
$(cat "$CAREER_FILE")
\`\`\`

**Instructions:**
1. Create a COMPLETE anti-CV LaTeX document from scratch
$common_instructions
- Include \\documentclass and all necessary setup

Please create the highest quality complete anti-CV possible."
            ;;
            
        *)
            echo "❌ Invalid mode: $mode"
            return 1
            ;;
    esac
    
    echo "$prompt"
}
