// config.ts - Central configuration for CV generation scripts

import * as fs from 'fs-extra';
import * as core from '@actions/core';

// File paths
export const CAREER_FILE: string = process.env.CAREER_FILE ?? '../../_data/career.md';
export const PROFESSIONAL_CV_FILE: string = '../markus-schulte-dev-professional-cv.tex';
export const ANTI_CV_FILE: string = '../markus-schulte-dev-anti-cv.tex';
export const DIFF_FILE: string = 'tmp/career_changes.diff';

// API Configuration
export const API_MODEL: string = process.env.API_MODEL ?? 'claude-sonnet-4-20250514';
export const MAX_TOKENS: number = parseInt(process.env.MAX_TOKENS ?? '8192', 10);
export const MIN_CONTENT_LENGTH: number = parseInt(process.env.MIN_CONTENT_LENGTH ?? '500', 10);

// Git diff range for incremental updates
export const GIT_DIFF_RANGE: number = parseInt(process.env.GIT_DIFF_RANGE ?? '1', 10);

// CV Types
export type CvType = 'professional' | 'anti';

// Settings
export const CREATE_BACKUP: boolean = process.env.CREATE_BACKUP === 'true';

// Simple getters
export const getCvFile = (cvType: CvType): string =>
  cvType === 'professional' ? PROFESSIONAL_CV_FILE : ANTI_CV_FILE;

export const getResponseFile = (cvType: CvType): string =>
  `tmp/response_${cvType}.json`;

export const getTempFile = (cvType: CvType): string =>
  `tmp/temp_${cvType}.tex`;

export const getCvTypesToProcess = (): CvType[] =>
  (process.env.CV_TYPES?.split(',') as CvType[]) ?? ['professional', 'anti'];

// Environment checks
export const isGithubActions = (): boolean =>
  process.env.GITHUB_ACTIONS === 'true';

// GitHub Actions output function using @actions/core
export const setOutput = (name: string, value: string): void => {
  if (isGithubActions()) {
    core.setOutput(name, value);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};

// Directory management
export const ensureDirectories = (): void => {
  fs.ensureDirSync('tmp');
};
