#!/bin/bash
# run-cv-update.sh - Main entry point for CV update workflow

set -euo pipefail

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/claude-api.sh"

# Cleanup function
cleanup() {
    local exit_code=$?
    if [ -f "$TEMP_FILE" ]; then
        rm -f "$TEMP_FILE"
    fi
    if [ $exit_code -ne 0 ]; then
        log_error "Script failed with exit code $exit_code"
    fi
}
trap cleanup EXIT

# Determine mode from GitHub inputs or default
if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    MODE="${REBUILD_MODE:-incremental}"
else
    MODE="incremental"
fi

log_info "Starting CV update workflow in $MODE mode..."

# Validate mode
if [[ ! "$MODE" =~ ^(incremental|full_rebuild)$ ]]; then
    log_error "Invalid mode: $MODE. Must be 'incremental' or 'full_rebuild'"
    exit 1
fi

# Run the appropriate transformation
if [ "$MODE" = "full_rebuild" ]; then
    if ! "$SCRIPT_DIR/transform-full-rebuild.sh"; then
        log_error "Full rebuild transformation failed"
        exit 1
    fi
    PROCESS_MODE="full_rebuild"
else
    # Clean up any existing response file first
    rm -f "$RESPONSE_FILE"

    # Run incremental transformation
    if ! "$SCRIPT_DIR/transform-incremental.sh"; then
        log_error "Incremental transformation failed"
        exit 1
    fi

    # Check if response file was created (indicating changes were processed)
    if [ -f "$RESPONSE_FILE" ] && [ -s "$RESPONSE_FILE" ]; then
        PROCESS_MODE="incremental"
        log_info "Response file found, proceeding with processing"
    else
        # No response file means no changes to process
        log_info "No changes to process, skipping validation and compilation"
        if is_github_actions; then
            echo "mode=skip" >> "$GITHUB_OUTPUT"
        fi
        exit 0
    fi
fi

# At this point we only have full_rebuild or incremental with actual changes
# Extract and validate LaTeX response
log_info "Processing response..."

if ! extract_latex "$TEMP_FILE"; then
    log_error "Failed to extract LaTeX from response"
    exit 1
fi

# Enhanced validation
if [ ! -s "$TEMP_FILE" ]; then
    log_error "Extracted file is empty"
    exit 1
fi

if ! grep -q '\\documentclass' "$TEMP_FILE"; then
    log_error "Not a valid LaTeX document (missing \\documentclass)"
    exit 1
fi

# Additional LaTeX validation
if ! grep -q '\\begin{document}' "$TEMP_FILE"; then
    log_error "Invalid LaTeX document (missing \\begin{document})"
    exit 1
fi

if ! grep -q '\\end{document}' "$TEMP_FILE"; then
    log_error "Invalid LaTeX document (missing \\end{document})"
    exit 1
fi

# Optional backup with error handling
if [ "$CREATE_BACKUP" = "true" ] && [ -f "$CV_FILE" ]; then
    backup_file="${CV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    if ! cp "$CV_FILE" "$backup_file"; then
        log_warning "Failed to create backup, continuing without backup"
    else
        log_info "Backup created: $backup_file"
    fi
fi

# Move to final location with validation
if ! mv "$TEMP_FILE" "$CV_FILE"; then
    log_error "Failed to move temporary file to final location"
    exit 1
fi

# Cleanup
rm -f "$RESPONSE_FILE"

log_success "CV update completed successfully!"
log_info "Mode: $PROCESS_MODE"

# Set outputs for GitHub Actions
if is_github_actions; then
    echo "mode=$PROCESS_MODE" >> "$GITHUB_OUTPUT"
fi
