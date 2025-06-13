#!/bin/bash
# config.sh - Central configuration for CV generation scripts

# File paths
export CAREER_FILE="${CAREER_FILE:-_data/career.md}"
export CV_FILE="${CV_FILE:-cv/anti-cv.tex}"
export DIFF_FILE="${DIFF_FILE:-career_changes.diff}"
export RESPONSE_FILE="${RESPONSE_FILE:-claude_response.json}"
export OUTPUT_FILE="${GITHUB_OUTPUT:-/tmp/github_output.txt}"

# API configuration
export API_MODEL="${API_MODEL:-claude-opus-4-20250514}"
export API_URL="${API_URL:-https://api.anthropic.com/v1/messages}"
export MAX_TOKENS="${MAX_TOKENS:-8000}"

# Validation settings
export MIN_LATEX_LINES="${MIN_LATEX_LINES:-50}"
export MAX_LATEX_SIZE="${MAX_LATEX_SIZE:-1000000}"  # 1MB

# Helper functions
log_info() {
    echo "ℹ️ $1"
}

log_success() {
    echo "✅ $1"
}

log_error() {
    echo "❌ $1" >&2
}

log_warning() {
    echo "⚠️ $1"
}

# Check if running in GitHub Actions
is_github_actions() {
    [ -n "$GITHUB_ACTIONS" ]
}

# Output GitHub Action variable
set_output() {
    local name="$1"
    local value="$2"
    
    if is_github_actions; then
        echo "$name=$value" >> "$OUTPUT_FILE"
    else
        echo "Output: $name=$value"
    fi
}
