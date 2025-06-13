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

build_cv_prompt() {
    local mode="$1"
    local prompt=""

    local base_instructions="You are an expert LaTeX document designer and professional CV writer."
    local github_actions_context="
**Deployment Context:**
This LaTeX document will be automatically compiled in a GitHub Actions CI/CD environment using xu-cheng/latex-action with TeXLive distribution. The compilation must be robust and reliable for automated processing."

    local latex_compatibility_rules="
**GitHub Actions LaTeX Requirements:**
- Use modern, widely-supported packages available in standard TeXLive distributions
- Ensure compatibility with automated compilation environments (no interactive prompts)
- Use robust package combinations that work reliably in Docker containers
- Follow proper package loading order for consistent compilation
- Avoid experimental or cutting-edge packages that might not be available
- Generate LaTeX that compiles successfully with: pdflatex -pdf -file-line-error -halt-on-error -interaction=nonstopmode
- Ensure all fonts and dependencies are commonly available in CI environments
- Use packages that handle encoding and internationalization properly"

    local common_instructions="
**Instructions:**
1. Use extended thinking to analyze and plan the optimal document
2. Maintain the humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols
3. Ensure professional information is accurately incorporated
4. Apply modern LaTeX best practices for typography and design
5. Ensure excellent visual hierarchy and readability
6. Optimize LaTeX formatting for visual appeal
7. Generate LaTeX optimized for automated GitHub Action compilation
$github_actions_context
$latex_compatibility_rules

**Requirements:**
- Return ONLY the complete LaTeX document code
- No explanations or markdown formatting
- Ensure robust compilation in GitHub Actions CI/CD environment
- Use battle-tested package combinations suitable for automated processing
- Optimize for xu-cheng/latex-action compilation pipeline
- Make it the best possible anti-CV design
- Do NOT include any thinking process or explanations in your response"
