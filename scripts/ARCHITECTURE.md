# CV Generation Scripts - Architecture Overview

## Structure

```
scripts/
├── config.js                 # Central configuration & environment variables
├── logger.js                 # Enhanced logging with Winston
├── claude-api.js             # Shared API logic using Anthropic SDK
├── run-cv-update.js          # Main workflow orchestrator (includes validation)
├── transform-incremental.js  # Incremental update (includes detection)
├── transform-full-rebuild.js # Full rebuild from scratch
└── test-local.js             # Local testing utility
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
# Option 1: Create a .env file (recommended)
# Create a file named .env in the project root with:
# ANTHROPIC_API_KEY=your-key-here
# DEBUG=true  # Optional for verbose logging

# Option 2: Set API key in terminal
export ANTHROPIC_API_KEY="your-key-here"  # Unix/Linux/macOS
# or
set ANTHROPIC_API_KEY="your-key-here"     # Windows Command Prompt
# or
$env:ANTHROPIC_API_KEY="your-key-here"    # Windows PowerShell

# Using npm scripts (recommended)
npm run cv:test            # Incremental update
npm run cv:test:full       # Full rebuild

# Direct Node.js execution
node scripts/test-local.js incremental
node scripts/test-local.js full_rebuild

# Skip API (use existing claude_response.json)
set SKIP_API=true && node scripts/test-local.js

# Dry run
set DRY_RUN=true && node scripts/test-local.js
```

### Custom Configuration
```bash
# Override paths
set CAREER_FILE=my_career.md
set CV_FILE=output/cv.tex
node scripts/test-local.js

# Create backups
set CREATE_BACKUP=true && node scripts/test-local.js
```

### Direct Script Usage
```bash
# Just run the update (GitHub Actions uses this)
node scripts/run-cv-update.js

# Run specific transformation
node scripts/transform-incremental.js
node scripts/transform-full-rebuild.js

# Using npm scripts
npm run cv:update
npm run cv:incremental
npm run cv:full-rebuild
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

### 1. **JavaScript-Based Architecture**
- Modern JavaScript ES modules for better code organization
- Async/await for cleaner asynchronous code
- Error handling with try/catch blocks
- NPM scripts for easier command execution
- Official Anthropic SDK for reliable API integration
- Winston logger for enhanced logging capabilities

### 2. **Shared Components**
- `config.js` - Environment variables and configuration settings
- `logger.js` - Centralized logging with Winston
- `claude-api.js` - API calls using Anthropic SDK, LaTeX extraction, and prompt building

### 3. **Simplified Architecture**
- Modular code structure with clear imports/exports
- Consistent error handling across all scripts
- Improved logging with emoji indicators
- Fewer files, clearer responsibilities

### 4. **Main Orchestrator**
`run-cv-update.js` handles:
- Mode selection
- Running appropriate transformation
- LaTeX extraction
- Basic validation (file exists, has \documentclass)
- Optional backup
- File placement
- Cleanup
