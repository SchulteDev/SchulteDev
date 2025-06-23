// transform-utils.ts - Shared utilities for CV transformations

import fs from 'fs';
import {exec} from 'child_process';
import util from 'util';
import {
  CAREER_FILE,
  CvType,
  DIFF_FILE,
  ensureDirectories,
  getCvFile,
  getCvTypesToProcess,
  GIT_DIFF_RANGE,
  setOutput
} from './config.js';
import logger from './logger.js';
import {callClaudeApi, PromptResult} from './claude-api.js';
import {getFullRebuildPrompt, getIncrementalPrompt, getSystemPrompt} from './prompts.js';

const execAsync = util.promisify(exec);

// Common prompt building
export const buildFullRebuildPrompt = (cvType: CvType): PromptResult => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  return {
    systemPrompt: getSystemPrompt(cvType),
    userPrompt: getFullRebuildPrompt(cvType, careerData)
  };
};

export const buildIncrementalPrompt = (cvType: CvType): PromptResult => {
  const cvFile = getCvFile(cvType);

  if (!fs.existsSync(cvFile)) throw new Error(`CV file not found: ${cvFile}`);
  if (!fs.existsSync(DIFF_FILE)) throw new Error(`Diff file not found: ${DIFF_FILE}`);

  return {
    systemPrompt: getSystemPrompt(cvType),
    userPrompt: getIncrementalPrompt(
      cvType,
      fs.readFileSync(cvFile, 'utf8'),
      fs.readFileSync(DIFF_FILE, 'utf8')
    )
  };
};

// Git operations
export const generateGitDiff = async (): Promise<boolean> => {
  try {
    const range = `HEAD~${GIT_DIFF_RANGE}`;

    logger.debug(`Git diff range: ${range} HEAD`);

    const {stdout} = await execAsync(`git diff ${range} HEAD --name-only`);
    logger.debug(`Files changed: "${stdout.trim()}"`);

    if (stdout.includes('_data/career.md')) {
      await execAsync(`git diff ${range} HEAD -- _data/career.md > "${DIFF_FILE}"`);
      logger.debug(`Created diff file for _data/career.md`);
      return true;
    }

    logger.info(`No changes in _data/career.md (last ${GIT_DIFF_RANGE} commits)`);
    setOutput('mode', 'skip');
    return false;
  } catch (error: any) {
    logger.error(`Git diff error: ${error.message}`);
    throw new Error(`Failed to generate git diff: ${error.message}`);
  }
};

export const validateDiffContent = (): boolean => {
  const diffContent = fs.readFileSync(DIFF_FILE, 'utf8');

  if (!diffContent?.trim() || diffContent === 'No changes detected in git diff') {
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      logger.info('No changes but manual trigger - creating test diff');
      fs.writeFileSync(DIFF_FILE, '+ Minor update for testing incremental workflow');
      return true;
    } else {
      logger.info('ℹ️ No changes to process');
      setOutput('mode', 'skip');
      return false;
    }
  }

  return true;
};

// CV processing
export const processAllCvTypes = async (promptBuilder: (cvType: CvType) => PromptResult): Promise<void> => {
  const types = getCvTypesToProcess();

  for (const type of types) {
    logger.info(`Processing ${type} CV...`);
    const {systemPrompt, userPrompt} = promptBuilder(type);

    if (await callClaudeApi(systemPrompt, userPrompt, type)) {
      logger.success(`Processing complete for ${type} CV`);
    } else {
      throw new Error(`API call failed for ${type} CV`);
    }
  }

  logger.success('All CV types processed');
};

// Cleanup utilities
export const cleanupDiffFile = (): void => {
  if (fs.existsSync(DIFF_FILE)) {
    try {
      fs.unlinkSync(DIFF_FILE);
    } catch (e: any) {
      logger.error(`Failed to delete diff file: ${e.message}`);
    }
  }
};

export const setupEnvironment = (): void => {
  ensureDirectories();
};
