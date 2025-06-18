// config.ts - Central configuration for CV generation scripts

import fs from 'fs';

// File paths
export const CAREER_FILE: string = process.env.CAREER_FILE ?? '../../_data/career.md';
export const PROFESSIONAL_CV_FILE: string = '../markus-schulte-dev-professional-cv.tex';
export const ANTI_CV_FILE: string = '../markus-schulte-dev-anti-cv.tex';
export const DIFF_FILE: string = 'tmp/career_changes.diff';

// API Configuration
export const API_MODEL: string = process.env.API_MODEL ?? 'claude-3-5-sonnet-20241022';
export const MAX_TOKENS: number = parseInt(process.env.MAX_TOKENS ?? '8192', 10);
export const MIN_CONTENT_LENGTH: number = parseInt(process.env.MIN_CONTENT_LENGTH ?? '500', 10);

// Git diff range for incremental updates
export const GIT_DIFF_RANGE: number = parseInt(process.env.GIT_DIFF_RANGE ?? '1', 10);

// CV Types
export type CvType = 'professional' | 'anti';

// Backup settings
export const CREATE_BACKUP: boolean = process.env.CREATE_BACKUP === 'true';
export const BACKUP_DIR: string = process.env.BACKUP_DIR ?? 'backups';

// Get CV file path based on type
export const getCvFile = (cvType: CvType): string => {
  switch (cvType) {
    case 'professional':
      return PROFESSIONAL_CV_FILE;
    case 'anti':
      return ANTI_CV_FILE;
    default:
      throw new Error(`Unknown CV type: ${cvType}`);
  }
};

// Get response file path for API responses
export const getResponseFile = (cvType: CvType): string => {
  return `tmp/response_${cvType}.json`;
};

// Get temporary file path for processing
export const getTempFile = (cvType: CvType): string => {
  return `tmp/temp_${cvType}.tex`;
};

// Check if running in GitHub Actions
export const isGithubActions = (): boolean => {
  return process.env.GITHUB_ACTIONS === 'true';
};

// Get CV types to process
export const getCvTypesToProcess = (): CvType[] => {
  const types = process.env.CV_TYPES?.split(',') as CvType[] | undefined;
  return types ?? ['professional', 'anti'];
};

// GitHub Actions output function
export const setOutput = (name: string, value: string): void => {
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::set-output name=${name}::${value}`);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};

// Ensure required directories exist
export const ensureDirectories = (): void => {
  const tmpDir = 'tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, {recursive: true});
  }

  if (CREATE_BACKUP && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, {recursive: true});
  }
};
