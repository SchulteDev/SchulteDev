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
# or
set ANTHROPIC_API_KEY="your-key-here"     # Windows Command Prompt
# or
$env:ANTHROPIC_API_KEY="your-key-here"    # Windows PowerShell

# Using npm scripts (recommended)
npm run cv:test            # Incremental update
npm run cv:test:full       # Full rebuild

# Direct execution (requires build step first)
npm run build
node dist/test-local.js incremental
node dist/test-local.js full_rebuild

# Skip API (use existing claude_response.json)
$env:SKIP_API="true"; npm run cv:test     # PowerShell
# or
set SKIP_API=true && npm run cv:test      # Command Prompt
# or
SKIP_API=true npm run cv:test             # Unix/Linux/macOS

# Dry run
$env:DRY_RUN="true"; npm run cv:test      # PowerShell
# or
set DRY_RUN=true && npm run cv:test       # Command Prompt
# or
DRY_RUN=true npm run cv:test              # Unix/Linux/macOS
```

### Custom Configuration

```bash
# Override paths
$env:CAREER_FILE="my_career.md"; $env:CV_FILE="output/cv.tex"; npm run cv:test     # PowerShell
# or
set CAREER_FILE=my_career.md && set CV_FILE=output/cv.tex && npm run cv:test       # Command Prompt
# or
CAREER_FILE=my_career.md CV_FILE=output/cv.tex npm run cv:test                     # Unix/Linux/macOS

# Create backups
$env:CREATE_BACKUP="true"; npm run cv:test                                         # PowerShell
# or
set CREATE_BACKUP=true && npm run cv:test                                          # Command Prompt
# or
CREATE_BACKUP=true npm run cv:test                                                 # Unix/Linux/macOS
```

### Direct Script Usage

```bash
# Build TypeScript files first
npm run build

# Run the compiled JavaScript files
node dist/run-cv-update.js
node dist/transform-incremental.js
node dist/transform-full-rebuild.js

# Using npm scripts (recommended - these handle the build step automatically)
npm run cv:update
npm run cv:incremental
npm run cv:full-rebuild
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

The project uses TypeScript for improved developer experience and code quality:

```
project/
├── tsconfig.json           # Main TypeScript configuration
├── tsconfig.node.json      # Node.js specific TypeScript configuration
└── dist/                   # Compiled JavaScript output directory
```

### TypeScript Features

- **Static Type Checking**: Catch errors at compile time rather than runtime
- **Type Definitions**: Using types from @anthropic-ai/sdk and other dependencies
- **Code Completion**: Better IDE support with autocompletion and documentation
- **Improved Refactoring**: Safer code changes with type checking
- **Build Process**: Compiles TypeScript to JavaScript in the dist/ directory

### Development Workflow

1. Edit TypeScript files in the scripts/ directory
2. Run `npm run build` to compile to JavaScript
3. Run scripts using npm commands (e.g., `npm run cv:test`)
4. For direct execution, use the compiled files in dist/

## Key Improvements

### 1. **TypeScript-Based Architecture**

- TypeScript for better type safety and developer experience
- Modern ES modules for better code organization
- Async/await for cleaner asynchronous code
- Error handling with try/catch blocks
- NPM scripts for easier command execution
- Official Anthropic SDK for reliable API integration
- Consola for simple, efficient logging

### 2. **Shared Components**

- `config.ts` - Environment variables and configuration settings with type safety
- `logger.ts` - Simplified logging with Consola
- `claude-api.ts` - API calls using Anthropic SDK with proper type definitions, LaTeX extraction, and prompt building

### 3. **Simplified Architecture**

- Modular code structure with clear imports/exports
- Consistent error handling across all scripts
- Improved logging with emoji indicators
- Fewer files, clearer responsibilities

### 4. **Main Orchestrator**

`run-cv-update.ts` handles:

- Mode determination (from GitHub inputs or defaults)
- Running appropriate transformation (incremental/full_rebuild)
- LaTeX extraction and validation
- GitHub Actions output setting
- Optional backup creation
- File placement and cleanup
- Comprehensive error handling with proper exit codes

### 5. **Workflow Integration**

The architecture properly integrates with GitHub Actions by:

- Setting required outputs for workflow decisions
- Handling different trigger scenarios (push, PR, manual)
- Providing proper error states and cleanup
- Supporting artifact collection for debugging
- Enabling conditional PDF compilation and release creation
- Using TypeScript for improved code quality and maintainability
- Compiling TypeScript to JavaScript before execution in the workflow
