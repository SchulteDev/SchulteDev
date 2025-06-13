// config.js - Central configuration for CV generation scripts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logDebug } from './logger.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
export const CAREER_FILE = process.env.CAREER_FILE || '_data/career.md';
export const CV_FILE = process.env.CV_FILE || 'cv/anti-cv.tex';
export const DIFF_FILE = process.env.DIFF_FILE || 'career_changes.diff';
export const RESPONSE_FILE = process.env.RESPONSE_FILE || 'claude_response.json';
export const TEMP_FILE = process.env.TEMP_FILE || 'temp_cv.tex';
export const OUTPUT_FILE = process.env.GITHUB_OUTPUT || '/tmp/github_output.txt';

// API configuration
export const API_MODEL = process.env.API_MODEL || 'claude-opus-4-20250514';
export const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '8000');

// Validation settings
export const MIN_LATEX_LINES = parseInt(process.env.MIN_LATEX_LINES || '50');
export const MAX_LATEX_SIZE = parseInt(process.env.MAX_LATEX_SIZE || '1000000'); // 1MB

// Backup settings
export const CREATE_BACKUP = process.env.CREATE_BACKUP === 'true';
export const BACKUP_DIR = process.env.BACKUP_DIR || 'backups';

// Debug settings
export const DEBUG = process.env.DEBUG === 'true';

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

// Validate required files exist
export const validateFiles = () => {
  const missingFiles = [];

  if (!fs.existsSync(CAREER_FILE)) {
    missingFiles.push(CAREER_FILE);
  }

  if (missingFiles.length > 0) {
    return false;
  }

  return true;
};

// Create backup directory if it doesn't exist
export const ensureBackupDir = () => {
  if (CREATE_BACKUP && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    logDebug(`Created backup directory: ${BACKUP_DIR}`);
  }
};
