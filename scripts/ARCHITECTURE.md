# CV Generation Scripts - Architecture Overview

## Structure

```
scripts/
├── config.sh                 # Central configuration & helper functions
├── claude-api.sh             # Shared API logic & prompt builder
├── run-cv-update.sh          # Main workflow orchestrator (includes validation)
├── transform-incremental.sh  # Incremental update (includes detection)
├── transform-full-rebuild.sh # Full rebuild from scratch
└── test-local.sh             # Local testing utility
```

## Data Flow

```
GitHub Action / Local Test
         ↓
  run-cv-update.sh
         ↓
  Determines mode
    ↙        ↘
transform-    transform-
incremental   full-rebuild
    ↘        ↙
  claude-api.sh
  (API + prompts)
         ↓
  run-cv-update.sh
  (validation + placement)
         ↓
    CV Updated
```

## Usage Examples

### Local Testing
```bash
export ANTHROPIC_API_KEY="your-key-here"

# Test with real API
./scripts/test-local.sh incremental

# Test full rebuild
./scripts/test-local.sh full_rebuild

# Skip API (use existing claude_response.json)
SKIP_API=true ./scripts/test-local.sh

# Dry run
DRY_RUN=true ./scripts/test-local.sh
```

### Custom Configuration
```bash
# Override paths
CAREER_FILE=my_career.md CV_FILE=output/cv.tex ./scripts/test-local.sh

# Create backups
CREATE_BACKUP=true ./scripts/test-local.sh
```

### Direct Script Usage
```bash
# Just run the update (GitHub Actions uses this)
./scripts/run-cv-update.sh

# Run specific transformation
./scripts/transform-incremental.sh
./scripts/transform-full-rebuild.sh
```

## Environment Variables

### Required
- `ANTHROPIC_API_KEY` - API key for Claude

### Optional Paths
- `CAREER_FILE` - Input markdown (default: `_data/career.md`)
- `CV_FILE` - Output LaTeX (default: `cv/anti-cv.tex`)
- `RESPONSE_FILE` - API response (default: `claude_response.json`)
- `DIFF_FILE` - Git diff for incremental (default: `career_changes.diff`)

### Optional Settings
- `CREATE_BACKUP` - Backup before updating (default: false)
- `SKIP_API` - Skip API call for testing (default: false)
- `DRY_RUN` - Show what would be done (default: false)
- `REBUILD_MODE` - For GitHub Actions (incremental/full_rebuild)

## Key Improvements

### 1. **Shared Components**
- `config.sh` - Environment variables and logging functions
- `claude-api.sh` - API calls, LaTeX extraction, and prompt building

### 2. **Simplified Architecture**
- Removed `detect-changes.sh` - logic merged into `transform-incremental.sh`
- Removed `validate-response.sh` - validation integrated into `run-cv-update.sh`
- Fewer files, clearer responsibilities

### 3. **Main Orchestrator**
`run-cv-update.sh` now handles:
- Mode selection
- Running appropriate transformation
- LaTeX extraction
- Basic validation (file exists, has \documentclass)
- Optional backup
- File placement
- Cleanup
