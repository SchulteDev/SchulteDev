// config.ts - Central configuration for CV generation scripts

import fs from 'fs';
import os from 'os';
import path from 'path';

// File paths
export const CAREER_FILE: string = process.env.CAREER_FILE ?? '../../_data/career.md';
export const CV_FILE: string = process.env.CV_FILE ?? '../markus-schulte-dev-anti-cv.tex';
export const PROFESSIONAL_CV_FILE: string = process.env.PROFESSIONAL_CV_FILE ?? '../markus-schulte-dev-professional-cv.tex';
export const DIFF_FILE: string = process.env.DIFF_FILE ?? 'tmp/career_changes.diff';
export const RESPONSE_FILE: string = process.env.RESPONSE_FILE ?? 'claude_response.json';
export const TEMP_FILE: string = process.env.TEMP_FILE ?? 'temp_cv.tex';

// CV Types
export type CvType = 'anti' | 'professional';
export const CV_TYPES: CvType[] = ['anti', 'professional'];

// Get CV types to process based on environment variable
export const getCvTypesToProcess = (): CvType[] => {
  const cvTypesEnv = process.env.CV_TYPES;

  if (!cvTypesEnv) {
    // Default: process all CV types
    return CV_TYPES;
  }

  const requestedTypes = cvTypesEnv.split(',').map(t => t.trim()) as CvType[];
  const validTypes = requestedTypes.filter(type => CV_TYPES.includes(type));

  if (validTypes.length === 0) {
    throw new Error(`Invalid CV_TYPES: ${cvTypesEnv}. Valid options: ${CV_TYPES.join(', ')}`);
  }

  return validTypes;
};

// Get CV file path for specific type
export const getCvFile = (type: CvType): string => {
  switch (type) {
    case 'anti':
      return CV_FILE;
    case 'professional':
      return PROFESSIONAL_CV_FILE;
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }
};

// Get temporary file path for specific type
export const getTempFile = (type: CvType): string => {
  return `tmp/temp_cv_${type}.tex`;
};

// Get response file path for specific type
export const getResponseFile = (type: CvType): string => {
  return `tmp/claude_response_${type}.json`;
};

// Use a secure temporary file path or current directory as fallback
export const OUTPUT_FILE: string = process.env.GITHUB_OUTPUT ?? (process.env.GITHUB_ACTIONS ?
  path.join(os.tmpdir(), `github_output_${process.pid}_${Date.now()}.txt`) :
  './github_output.txt');

// API configuration
export const API_MODEL: string = process.env.API_MODEL ?? 'claude-opus-4-20250514';
// Set a balanced default for CV generation that won't trigger streaming warnings
// while keeping costs reasonable ($0.75 per full CV output at $75/1M tokens)
// Actual output tokens used in current CV is ~6-7K tokens based on file size
export const MAX_TOKENS: number = parseInt(process.env.MAX_TOKENS ?? '8000');

// Backup settings
export const CREATE_BACKUP: boolean = process.env.CREATE_BACKUP === 'true';
export const BACKUP_DIR: string = process.env.BACKUP_DIR ?? 'backups';

// Check if running in GitHub Actions
export const isGithubActions = (): boolean => {
  return !!process.env.GITHUB_ACTIONS;
};

// Output GitHub Action variable
export const setOutput = (name: string, value: string): void => {
  if (isGithubActions()) {
    fs.appendFileSync(OUTPUT_FILE, `${name}=${value}\n`);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};
