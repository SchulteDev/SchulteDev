[![Update CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml)
[![Release CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SchulteDev_SchulteDev%3Acurriculum_vitae_scripts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SchulteDev_SchulteDev%3Acurriculum_vitae_scripts)

# Markus Schulte (Schulte development) CV Generation

AI-powered CV generation using Claude to transform [career data](../_data/career.md) into LuaLaTeX documents.
The layout is fixed in [cv-preamble.tex](scripts/cv-preamble.tex); Claude writes the document body.

## Workflows

- [update-cvs.yml](../.github/workflows/update-cvs.yml): generates the CVs with Claude and commits the .tex files
- [release-cvs.yml](../.github/workflows/release-cvs.yml): compiles the PDFs, reports their PDF/UA-1 conformance and publishes a GitHub release

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

### Local PDF Build

In this directory, compiles like [release-cvs.yml](../.github/workflows/release-cvs.yml), needing only
rootless [Podman](https://podman.io). Each PDF lands next to its `.tex` file, or in the `-o` directory:

```bash
scripts/compile-pdf.sh *-cv.tex
scripts/compile-pdf.sh -o /tmp/cv old-cv.tex
```
