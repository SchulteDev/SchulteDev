#!/bin/bash
# run-cv-update.sh - Main entry point for CV update workflow

set -e

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/claude-api.sh"

# Determine mode from GitHub inputs or default
if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    MODE="${REBUILD_MODE:-incremental}"
else
    MODE="incremental"
fi

log_info "Starting CV update workflow in $MODE mode..."

# Make scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Run the appropriate transformation
if [ "$MODE" = "full_rebuild" ]; then
    "$SCRIPT_DIR/transform-full-rebuild.sh"
    PROCESS_MODE="full_rebuild"
else
    "$SCRIPT_DIR/transform-incremental.sh"

    # Read the process mode from output
    if [ -f "$OUTPUT_FILE" ]; then
        PROCESS_MODE=$(grep "process_mode=" "$OUTPUT_FILE" | cut -d'=' -f2 | head -1)
    else
        PROCESS_MODE="incremental"
    fi

    # Check immediately after reading the mode
    if [ "$PROCESS_MODE" = "skip" ]; then
        log_info "No changes to process, skipping validation and compilation"
        # Set outputs for GitHub Actions
        if is_github_actions; then
            echo "mode=skip" >> "$GITHUB_OUTPUT"
        fi
        exit 0
    fi
fi

# At this point we only have full_rebuild or incremental with actual changes
# Extract and validate LaTeX response
log_info "Processing response..."
TEMP_FILE="temp_cv.tex"

if ! extract_latex "$TEMP_FILE"; then
    log_error "Failed to extract LaTeX from response"
    exit 1
fi

# Basic validation
if [ ! -s "$TEMP_FILE" ]; then
    log_error "Extracted file is empty"
    rm -f "$TEMP_FILE"
    exit 1
fi

if ! grep -q '\\documentclass' "$TEMP_FILE"; then
    log_error "Not a valid LaTeX document (missing \\documentclass)"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Optional backup
if [ "$CREATE_BACKUP" = "true" ] && [ -f "$CV_FILE" ]; then
    backup_file="${CV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CV_FILE" "$backup_file"
    log_info "Backup created: $backup_file"
fi

# Move to final location
mv "$TEMP_FILE" "$CV_FILE"

# Cleanup
rm -f "$RESPONSE_FILE"

log_success "CV update completed successfully!"
log_info "Mode: $PROCESS_MODE"

# Set outputs for GitHub Actions
if is_github_actions; then
    echo "mode=$PROCESS_MODE" >> "$GITHUB_OUTPUT"
fi
