# CV Generation Scripts - Architecture Overview

## Structure

```
scripts/
├── config.ts                 # Central configuration & environment variables
├── logger.ts                 # Simple logging with Consola
├── claude-api.ts             # Shared API logic using Anthropic SDK
├── run-cv-update.ts          # Main workflow orchestrator (includes validation)
├── transform-incremental.ts  # Incremental update (includes detection)
├── transform-full-rebuild.ts # Full rebuild from scratch
└── test-local.ts             # Local testing utility
```

The compiled JavaScript files are stored in the `dist/` directory.

## Data Flow

```
GitHub Action / Local Test
         ↓
  run-cv-update
         ↓
  Determines mode
    ↙        ↘
transform-    transform-
incremental   full-rebuild
    ↘        ↙
  claude-api
  (API + prompts)
         ↓
  run-cv-update
(validation + placement)
         ↓
  Recommit changes  
         ↓
    CV updated
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

npm test                   # Test incremental update (alias for cv:test)
npm run cv:test            # Test incremental update
npm run cv:test:full       # Test full rebuild

# Skip API (use existing claude_response.json)
SKIP_API=true npm test                    # Unix/Linux/macOS

# Dry run
DRY_RUN=true npm test                     # Unix/Linux/macOS
```

### Production Scripts

```bash
# Main CV update workflow (used by GitHub Action)
npm run cv:update

# Direct transformation scripts
npm run cv:full-rebuild    # Full rebuild from scratch
npm run cv:incremental     # Incremental update only

# Clean up build artifacts
npm run clean              # Remove dist/ and node_modules/
```

### Custom Configuration

```bash
# Override paths
CAREER_FILE=my_career.md CV_FILE=output/cv.tex npm test                     # Unix/Linux/macOS

# Create backups
CREATE_BACKUP=true npm test                                                 # Unix/Linux/macOS
```

### Direct Script Usage with tsx

```bash
# Using tsx for direct TypeScript execution (no build step required)
npx tsx scripts/test-local.ts

# With arguments
npx tsx scripts/test-local.ts full_rebuild
```

## Environment Variables

### Required

- `ANTHROPIC_API_KEY` - API key for Claude

### Optional Paths

- `CAREER_FILE` - Input markdown (default: `_data/career.md`)
- `CV_FILE` - Output LaTeX (default: `cv/markus-schulte-dev-anti-cv.tex`)
- `RESPONSE_FILE` - API response (default: `claude_response.json`)
- `DIFF_FILE` - Git diff for incremental (default: `career_changes.diff`)
- `TEMP_FILE` - Temporary file for processing (default: `temp_cv.tex`)

### Optional Settings

- `CREATE_BACKUP` - Backup before updating (default: false)
- `SKIP_API` - Skip API call for testing (default: false)
- `DRY_RUN` - Show what would be done (default: false)
- `REBUILD_MODE` - For GitHub Actions (incremental/full_rebuild)

### GitHub Actions Specific

- `GITHUB_OUTPUT` - Used for setting workflow outputs
- `GITHUB_EVENT_NAME` - Determines trigger context
- `GITHUB_REF` - Branch reference for conditional operations

## TypeScript Configuration

The project uses TypeScript with tsx for direct execution without a build step:

```
project/
├── tsconfig.json           # Main TypeScript configuration
├── package.json            # Contains tsx-based npm scripts
└── scripts/                # TypeScript source files (executed directly)
```

### Development Workflow

1. Edit TypeScript files in the scripts/ directory
2. Run scripts directly using npm commands (e.g., `npm test`)
3. tsx handles TypeScript compilation on-the-fly

## Available NPM Scripts

Based on the current package.json configuration:

- `npm test` - Alias for `npm run cv:test` (incremental update test)
- `npm run clean` - Remove dist/ and node_modules/ directories
- `npm run cv:update` - Main CV update workflow (used by GitHub Actions)
- `npm run cv:full-rebuild` - Full rebuild transformation
- `npm run cv:incremental` - Incremental update transformation
- `npm run cv:test` - Local testing with incremental update
- `npm run cv:test:full` - Local testing with full rebuild
