#!/bin/bash
# config.sh - Central configuration for CV generation scripts

# File paths
export CAREER_FILE="${CAREER_FILE:-_data/career.md}"
export CV_FILE="${CV_FILE:-cv/anti-cv.tex}"
export DIFF_FILE="${DIFF_FILE:-career_changes.diff}"
export RESPONSE_FILE="${RESPONSE_FILE:-claude_response.json}"
export TEMP_FILE="${TEMP_FILE:-temp_cv.tex}"
export OUTPUT_FILE="${GITHUB_OUTPUT:-/tmp/github_output.txt}"

# API configuration
export API_MODEL="${API_MODEL:-claude-opus-4-20250514}"
export API_URL="${API_URL:-https://api.anthropic.com/v1/messages}"
export MAX_TOKENS="${MAX_TOKENS:-8000}"

# Validation settings
export MIN_LATEX_LINES="${MIN_LATEX_LINES:-50}"
export MAX_LATEX_SIZE="${MAX_LATEX_SIZE:-1000000}"  # 1MB

# Backup settings
export CREATE_BACKUP="${CREATE_BACKUP:-true}"
export BACKUP_DIR="${BACKUP_DIR:-backups}"

# Debug settings
export DEBUG="${DEBUG:-false}"

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

log_debug() {
    if [ "$DEBUG" = "true" ]; then
        echo "🐛 $1"
    fi
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

# Validate required files exist
validate_files() {
    local missing_files=()

    if [ ! -f "$CAREER_FILE" ]; then
        missing_files+=("$CAREER_FILE")
    fi

    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Missing required files: ${missing_files[*]}"
        return 1
    fi

    return 0
}

# Create backup directory if it doesn't exist
ensure_backup_dir() {
    if [ "$CREATE_BACKUP" = "true" ] && [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_debug "Created backup directory: $BACKUP_DIR"
    fi
}
