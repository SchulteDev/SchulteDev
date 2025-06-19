# CV Generation Architecture

AI-powered CV generation using Claude to transform career data into LaTeX documents.

## Core Files

- **run-cv-update.ts** - Main orchestrator
- **transform-incremental.ts** - Processes git diff changes  
- **transform-full-rebuild.ts** - Complete regeneration
- **transform-utils.ts** - Shared processing logic
- **claude-api.ts** - API calls and LaTeX extraction
- **config.ts** - Paths, types, environment variables

## Workflow

```
Career data change → Git diff → Claude API → LaTeX → PDF
```

**Incremental**: Only processes git changes since last commit  
**Full rebuild**: Regenerates entire CV from career data

## Local Testing

```bash
# Basic test with mocks
npm test

# Test specific CV type
CV_TYPES=anti npm test

# Test with git history
GIT_DIFF_RANGE=5 npm test

# Dry run (no file changes)
DRY_RUN=true npm test
```

## Environment Variables

**Required for API**: `ANTHROPIC_API_KEY`

**Optional**:
- `CV_TYPES=professional,anti` (default: both)
- `SKIP_API=true` (uses mocks)
- `DRY_RUN=true` (no file writes)
- `GIT_DIFF_RANGE=1` (commits to diff)

## CV Types

- **professional**: Traditional business format
- **anti**: Humorous format highlighting failures

## File Structure

```
tmp/
├── response_*.json    # API responses
├── temp_*.tex         # Processed LaTeX
└── career_changes.diff # Git diff
```

Mock mode automatically activates without API key or with `SKIP_API=true`.
