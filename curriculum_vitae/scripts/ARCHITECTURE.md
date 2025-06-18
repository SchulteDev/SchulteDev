# CV Generation Scripts - Architecture Overview

## Structure

```
─ config.ts                 # Central configuration & environment variables
─ logger.ts                 # Simple logging with Consola
─ claude-api.ts             # Shared API logic using Anthropic SDK
─ prompts.json              # External prompt templates (Anti-CV + Professional CV)
─ prompts.ts                # Prompt management utilities with CV type support
─ run-cv-update.ts          # Main workflow orchestrator (dual CV processing)
─ transform-incremental.ts  # Incremental update (both CV types)
─ transform-full-rebuild.ts # Full rebuild from scratch (both CV types)
─ test-local.ts             # Local testing utility (dual CV support)
```

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
  (API + prompts for each CV type)
         ↓
  run-cv-update
(validation + placement for both CVs)
         ↓
  Recommit changes  
         ↓
  Both CVs updated (Anti-CV + Professional CV)
```

## CV Types

The system generates two CV formats from the same career data:

- **Anti-CV** (`markus-schulte-dev-anti-cv.tex`): Humorous, self-deprecating format showcasing
  failures and lessons learned
- **Professional CV** (`markus-schulte-dev-professional-cv.tex`): Traditional format highlighting
  achievements and expertise

Both CVs are generated simultaneously from `_data/career.md` using different AI prompts.

## Implementation Notes

### Key Components

- `CvType` enum with utility functions for type-safe file handling
- CV-specific response files (`claude_response_anti.json`, `claude_response_professional.json`)
- Iterative processing over `CV_TYPES` array in transformation scripts
- Enhanced GitHub Action with separate compilation steps

### File Naming Pattern

- Temporary files: `tmp/temp_cv_anti.tex`, `tmp/temp_cv_professional.tex`
- Response files: `tmp/claude_response_anti.json`, `tmp/claude_response_professional.json`
- Diff file: `tmp/career_changes.diff`
- Output files: `markus-schulte-dev-anti-cv.tex`, `markus-schulte-dev-professional-cv.tex`

## Usage Examples

### Local Testing

```bash
# Option 1: Create a .env file (recommended)
# Create a file named .env in the project root with:
# ANTHROPIC_API_KEY=your-key-here
# DEBUG=true  # Optional for verbose logging

# Option 2: Set API key in terminal
export ANTHROPIC_API_KEY="your-key-here"  # Unix/Linux/macOS

npm test                   # Test incremental update for both CVs (alias for cv:test)
npm run cv:test            # Test incremental update for both CVs
npm run cv:test:full       # Test full rebuild for both CVs

# Select specific CV types
CV_TYPES=anti npm test                    # Only Anti-CV
CV_TYPES=professional npm test            # Only Professional CV
CV_TYPES=anti,professional npm test       # Both CVs (default)

# Skip API (use existing claude_response_*.json files)
SKIP_API=true npm test                    # Unix/Linux/macOS

# Dry run
DRY_RUN=true npm test                     # Unix/Linux/macOS
```

### Production Scripts

```bash
# Main CV update workflow (used by GitHub Action)
npm run cv:update          # Generates both Anti-CV and Professional CV

# Direct transformation scripts
npm run cv:full-rebuild    # Full rebuild from scratch (both CVs)
npm run cv:incremental     # Incremental update only (both CVs)

# Clean up build artifacts
npm run clean
```

### Custom Configuration

```bash
# Override paths for both CV types
CAREER_FILE=my_career.md PROFESSIONAL_CV_FILE=output/professional.tex npm test   # Unix/Linux/macOS

# Select specific CV types
CV_TYPES=anti npm test                                                           # Only Anti-CV
CV_TYPES=professional npm test                                                   # Only Professional CV

# Create backups for both files
CREATE_BACKUP=true npm test                                                      # Unix/Linux/macOS
```

### Direct Script Usage with tsx

```bash
# Using tsx for direct TypeScript execution (no build step required)
npx tsx test-local.ts

# With arguments (applies to both CV types)
npx tsx test-local.ts full_rebuild
```

## Environment Variables

### Required

- `ANTHROPIC_API_KEY` - API key for Claude

### Optional Paths

- `CAREER_FILE` - Input markdown (default: `_data/career.md`)
- `CV_FILE` - Output LaTeX for Anti-CV (default: `curriculum_vitae/markus-schulte-dev-anti-cv.tex`)
- `PROFESSIONAL_CV_FILE` - Output LaTeX for Professional CV (default:
  `curriculum_vitae/markus-schulte-dev-professional-cv.tex`)
- `DIFF_FILE` - Git diff for incremental (default: `tmp/career_changes.diff`)
- `TEMP_FILE` - Temporary file for processing (default: `temp_cv.tex`)

### Optional Settings
 
- `CREATE_BACKUP` - Backup before updating (default: false)
- `SKIP_API` - Skip API call for testing (default: false)
- `DRY_RUN` - Show what would be done (default: false)
- `REBUILD_MODE` - For GitHub Actions (incremental/full_rebuild)
- `CV_TYPES` - Comma-separated CV types to process (default: anti,professional)
  - Examples: `anti`, `professional`, `anti,professional`

### GitHub Actions Specific

- `GITHUB_OUTPUT` - Used for setting workflow outputs
- `GITHUB_EVENT_NAME` - Determines trigger context
- `GITHUB_REF` - Branch reference for conditional operations

## TypeScript Configuration

The project uses TypeScript with tsx for direct execution without a build step:

```
project/
├── tsconfig.json     # Main TypeScript configuration
├── package.json      # Contains tsx-based npm scripts
└── *.ts              # TypeScript source files (executed directly)
```

### Development Workflow

1. Edit TypeScript files in this directory
2. Run scripts directly using npm commands (e.g., `npm test`)
3. tsx handles TypeScript compilation on-the-fly

## Available NPM Scripts

Based on the current package.json configuration:

- `npm test` - Alias for `npm run cv:test` (incremental update test for both CVs)
- `npm run clean` - Remove tmp/ and node_modules/ directories
- `npm run cv:update` - Main CV update workflow (used by GitHub Actions, generates both CVs)
- `npm run cv:full-rebuild` - Full rebuild transformation (both CVs)
- `npm run cv:incremental` - Incremental update transformation (both CVs)
- `npm run cv:test` - Local testing with incremental update (both CVs)
- `npm run cv:test:full` - Local testing with full rebuild (both CVs)

## Prompt Management

Prompts are externalized to `prompts.json` with CV-type-specific organization. Currently supports
`antiCv` and `professionalCv` with template variable substitution:

- `{{CAREER_DATA}}` - career.md content (full rebuild)
- `{{CURRENT_CV}}` - current CV content (incremental)
- `{{DIFF_DATA}}` - git diff content (incremental)

The system automatically processes both CV types using their respective prompts. Each CV type has:

- **System prompts**: Define the AI's role and formatting requirements
- **Full rebuild prompts**: Create complete CV from career data
- **Incremental prompts**: Apply specific changes to existing CV

Professional CV prompts focus on achievements, technical expertise, and business impact using
professional language, while Anti-CV prompts maintain the humorous, self-deprecating approach.

Edit `prompts.json` directly to modify prompts for either CV type.
