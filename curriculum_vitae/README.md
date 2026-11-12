[![Update CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml)
[![Release CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SchulteDev_SchulteDev%3Acurriculum_vitae_scripts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SchulteDev_SchulteDev%3Acurriculum_vitae_scripts)

# Markus Schulte (Schulte development) CV Generation

AI-powered CV generation using Claude to transform [career data](../_data/career.md) into LuaLaTeX documents.

## Workflows

- [update-cvs.yml](../.github/workflows/update-cvs.yml): generates the CVs with Claude and commits the .tex files
- [release-cvs.yml](../.github/workflows/release-cvs.yml): compiles the PDFs, reports their PDF/UA-2 conformance and publishes a GitHub release

## CV Types

- **professional**: Traditional business format with quantified impact
- **anti**: Humorous format highlighting failures and lessons

## Local Usage

In [scripts](scripts), with settings from the environment or a `.env` file (see [config.ts](scripts/config.ts)):

```bash
npm test
npm run typecheck
SKIP_API=true npm run cv:update   # without API calls
npm run cv:update                 # needs ANTHROPIC_API_KEY
```
