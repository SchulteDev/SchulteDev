#!/bin/bash
# test-local.sh - Test CV generation locally

set -e

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Parse arguments
MODE="${1:-incremental}"
SKIP_API="${SKIP_API:-false}"
DRY_RUN="${DRY_RUN:-false}"

usage() {
    cat << EOF
Usage: $0 [mode] [options]

Modes:
  incremental  - Update CV based on changes (default)
  full_rebuild - Rebuild CV from scratch
  
Environment variables:
  ANTHROPIC_API_KEY - Required for API calls
  SKIP_API=true    - Skip API call, use existing response
  DRY_RUN=true     - Show what would be done without executing
  CREATE_BACKUP=true - Create backup before updating

Examples:
  $0 incremental
  $0 full_rebuild
  SKIP_API=true $0 incremental
  DRY_RUN=true $0 full_rebuild
EOF
}

# Check for help
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Validate mode
if [ "$MODE" != "incremental" ] && [ "$MODE" != "full_rebuild" ]; then
    log_error "Invalid mode: $MODE"
    usage
    exit 1
fi

log_info "Running in $MODE mode"

# Check prerequisites
check_prerequisites() {
    local missing=()
    
    # Check required commands
    for cmd in jq curl git; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done
    
    # Check required files
    if [ ! -f "$CAREER_FILE" ]; then
        missing+=("$CAREER_FILE file")
    fi
    
    if [ "$MODE" = "incremental" ] && [ ! -f "$CV_FILE" ]; then
        missing+=("$CV_FILE file")
    fi
    
    # Check API key
    if [ "$SKIP_API" != "true" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
        missing+=("ANTHROPIC_API_KEY environment variable")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing prerequisites:"
        printf '  - %s\n' "${missing[@]}"
        exit 1
    fi
}

# Simulate GitHub environment
setup_local_env() {
    export GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-workflow_dispatch}"
    export REBUILD_MODE="$MODE"
    
    # Create temp directory for outputs
    mkdir -p tmp
    export GITHUB_OUTPUT="tmp/github_output.txt"
    > "$GITHUB_OUTPUT"
}

# Main execution
main() {
    check_prerequisites
    setup_local_env
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN - Would execute:"
        echo "  1. Run $MODE transformation"
        echo "  2. Validate and apply changes"
        echo "  3. Update $CV_FILE"
        exit 0
    fi
    
    # Run the CV update workflow
    "$SCRIPT_DIR/run-cv-update.sh"
    
    log_success "Local test completed successfully!"
    
    # Show what changed
    if [ -f "$CV_FILE" ]; then
        log_info "CV file updated. Size: $(wc -c < "$CV_FILE") bytes"
    fi
    
    # Cleanup
    rm -rf tmp
}

# Run main
main
