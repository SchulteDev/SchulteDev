# Test change detection
GITHUB_EVENT_NAME=workflow_dispatch REBUILD_MODE=full_rebuild ./scripts/detect-changes.sh

# Test incremental transformation (need ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY="your-key-here"
./scripts/transform-incremental.sh
./scripts/validate-response.sh incremental

# Test full rebuild
./scripts/transform-full-rebuild.sh
./scripts/validate-response.sh full_rebuild
