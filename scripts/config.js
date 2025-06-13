// config.js - Central configuration for CV generation scripts

import fs from 'fs';
import os from 'os';
import path from 'path';

// File paths
export const CAREER_FILE = process.env.CAREER_FILE || '_data/career.md';
export const CV_FILE = process.env.CV_FILE || 'cv/anti-cv.tex';
export const DIFF_FILE = process.env.DIFF_FILE || 'career_changes.diff';
export const RESPONSE_FILE = process.env.RESPONSE_FILE || 'claude_response.json';
export const TEMP_FILE = process.env.TEMP_FILE || 'temp_cv.tex';

// Use a secure temporary file path or current directory as fallback
export const OUTPUT_FILE = process.env.GITHUB_OUTPUT || (process.env.GITHUB_ACTIONS ?
  path.join(os.tmpdir(), `github_output_${process.pid}_${Date.now()}.txt`) :
  './github_output.txt');

// API configuration
export const API_MODEL = process.env.API_MODEL || 'claude-opus-4-20250514';
export const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '8000');

// Backup settings
export const CREATE_BACKUP = process.env.CREATE_BACKUP === 'true';
export const BACKUP_DIR = process.env.BACKUP_DIR || 'backups';

// Check if running in GitHub Actions
export const isGithubActions = () => {
  return !!process.env.GITHUB_ACTIONS;
};

// Output GitHub Action variable
export const setOutput = (name, value) => {
  if (isGithubActions()) {
    fs.appendFileSync(OUTPUT_FILE, `${name}=${value}\n`);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};
