# CV Generation Scripts Architecture

This document describes the architecture and workflow of the AI-powered CV generation system.

## Overview

The system consists of TypeScript scripts that automatically update CV files based on changes in career data using Claude AI. It supports both incremental updates and full rebuilds.

## Core Components

### 1. Configuration (`config.ts`)
Central configuration file containing:
- File paths for career data and CV outputs
- API configuration (model, tokens, content validation)
- CV type definitions and processing functions
- Environment variable handling
- Directory management utilities

### 2. API Integration (`claude-api.ts`)
Handles interaction with Claude AI:
- API calls with proper error handling
- Mock response generation for testing
- LaTeX extraction and cleaning from AI responses
- Content validation and formatting

### 3. Transformation Scripts

#### Incremental Transform (`transform-incremental.ts`)
- Detects changes in career data using git diff
- Processes only changed content for efficiency
- Supports configurable git diff range
- Handles both manual and automatic triggers

#### Full Rebuild (`transform-full-rebuild.ts`)
- Complete regeneration of CV from scratch
- Used for major changes or initial setup
- Processes entire career data file

### 4. Main Workflow (`run-cv-update.ts`)
Orchestrates the entire process:
- Determines update mode (incremental vs full rebuild)
- Manages temporary files and cleanup
- Validates LaTeX output
- Creates backups when enabled
- Handles multiple CV types simultaneously

### 5. Testing (`test-local.ts`)
Local testing framework:
- Simulates GitHub Actions environment
- Supports dry-run mode
- Environment variable management
- Comprehensive validation and debugging

## Workflow

```
1. Career Data Change
   ↓
2. Mode Detection (incremental/full)
   ↓
3. Content Processing
   ├── Git diff generation (incremental)
   └── Full content read (rebuild)
   ↓
4. AI Processing
   ├── Prompt generation
   ├── Claude API call
   └── Response validation
   ↓
5. LaTeX Generation
   ├── Content extraction
   ├── Format cleaning
   └── Validation
   ↓
6. File Updates
   ├── Backup creation
   ├── Content replacement
   └── Cleanup
```

## File Structure

```
curriculum_vitae/scripts/
├── config.ts              # Central configuration
├── claude-api.ts          # AI integration
├── transform-incremental.ts # Change-based updates
├── transform-full-rebuild.ts # Complete rebuilds
├── run-cv-update.ts       # Main orchestrator
├── test-local.ts          # Testing framework
├── logger.ts              # Logging utilities
├── prompts.ts             # AI prompt templates
└── tmp/                   # Temporary files
    ├── response_*.json    # AI responses
    ├── temp_*.tex         # Processed content
    └── career_changes.diff # Git diff output
```

## Environment Variables

### Required
- `ANTHROPIC_API_KEY`: Claude AI API key

### Optional
- `CV_TYPES`: Comma-separated CV types to process (default: "professional,anti")
- `GIT_DIFF_RANGE`: Number of commits for diff (default: 1)
- `SKIP_API`: Skip API calls, use mock responses (default: false)
- `CREATE_BACKUP`: Create backups before updates (default: false)
- `DRY_RUN`: Show planned actions without execution (default: false)

## CV Types

### Professional CV
- Traditional format
- Focus on technical skills and achievements
- Corporate-friendly presentation

### Anti-CV
- Unconventional format
- Highlights failures and lessons learned
- Emphasizes growth through challenges

## Error Handling

The system includes comprehensive error handling:
- API call failures with retry logic
- File system errors with graceful degradation
- Content validation with detailed reporting
- Cleanup on interruption or failure

## Testing Strategy

### Local Testing
```bash
# Basic test
npm test

# Specific CV type
CV_TYPES=anti npm test

# With different git range
GIT_DIFF_RANGE=30 npm test

# Dry run
DRY_RUN=true npm test
```

### Mock Mode
When `SKIP_API=true` or no API key is provided:
- Uses existing CV content as mock response
- Validates full workflow without API costs
- Useful for development and CI/CD

## GitHub Actions Integration

The system is designed for GitHub Actions:
- Automatic triggering on career data changes
- Manual workflow dispatch with mode selection
- Proper output setting for downstream jobs
- Environment variable inheritance

## Logging

Structured logging with different levels:
- `info`: General workflow progress
- `debug`: Detailed execution information
- `success`: Completion confirmations
- `error`: Failure details with context
- `warn`: Non-fatal issues

## Future Enhancements

- Support for additional CV formats (JSON, XML)
- Multi-language CV generation
- Advanced diff algorithms for better change detection
- Integration with other AI providers
- Automated testing with content validation
