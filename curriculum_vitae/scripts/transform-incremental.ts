// transform-incremental.ts - Incremental CV updates

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
import {getIncrementalPrompt, getSystemPrompt} from './prompts.js';

const execAsync = util.promisify(exec);

const buildPrompt = (cvType: CvType): PromptResult => {
  const cvFile = getCvFile(cvType);

  if (!fs.existsSync(cvFile)) throw new Error(`CV file not found: ${cvFile}`);
  if (!fs.existsSync(DIFF_FILE)) throw new Error(`Diff file not found: ${DIFF_FILE}`);

  return {
    systemPrompt: getSystemPrompt(cvType),
    userPrompt: getIncrementalPrompt(cvType, fs.readFileSync(cvFile, 'utf8'), fs.readFileSync(DIFF_FILE, 'utf8'))
  };
};

const generateDiff = async (): Promise<boolean> => {
  try {
    const relativePath = CAREER_FILE.replace(process.cwd() + '/', '');
    const isManual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
    const range = `HEAD~${GIT_DIFF_RANGE}`;

    logger.debug(`Git diff range: ${range} HEAD`);

    if (isManual) {
      await execAsync(`git diff ${range} HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
      return true;
    }

    const {stdout} = await execAsync(`git diff ${range} HEAD --name-only`);
    if (stdout.includes(relativePath)) {
      await execAsync(`git diff ${range} HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
      return true;
    }

    logger.info(`No changes in ${CAREER_FILE} (last ${GIT_DIFF_RANGE} commits)`);
    setOutput('mode', 'skip');
    return false;
  } catch (error: any) {
    fs.writeFileSync(DIFF_FILE, 'No changes detected in git diff');
    logger.info('No git changes detected, created mock diff');
    return true;
  }
};

export const main = async (): Promise<void> => {
  try {
    ensureDirectories();
    logger.info('🔄 Starting incremental transformation...');

    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      if (process.env.REBUILD_MODE === 'full_rebuild') {
        setOutput('mode', 'full_rebuild');
        logger.info('🔄 Manual trigger: Switching to full rebuild');
        throw new Error('SWITCH_TO_FULL_REBUILD');
      }
      setOutput('mode', 'incremental');
      logger.info('📝 Manual trigger: Incremental mode');
    }

    if (!await generateDiff()) return;

    const diffContent = fs.readFileSync(DIFF_FILE, 'utf8');
    if (!diffContent?.trim() || diffContent === 'No changes detected in git diff') {
      if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
        logger.info('No changes but manual trigger - creating test diff');
        fs.writeFileSync(DIFF_FILE, '+ Minor update for testing incremental workflow');
      } else {
        logger.info('ℹ️ No changes to process');
        setOutput('mode', 'skip');
        return;
      }
    }

    const types = getCvTypesToProcess();
    for (const type of types) {
      logger.info(`Processing incremental ${type} CV...`);
      const {systemPrompt, userPrompt} = buildPrompt(type);

      if (await callClaudeApi(systemPrompt, userPrompt, type)) {
        logger.success(`Incremental update complete for ${type} CV`);
      } else {
        throw new Error(`API call failed for ${type} CV`);
      }
    }

    logger.success('All CV types processed');
  } catch (error: any) {
    if (error.message === 'SWITCH_TO_FULL_REBUILD') throw error;
    logger.error(`Incremental error: ${error.message}`);
    throw error;
  } finally {
    if (fs.existsSync(DIFF_FILE)) {
      try {
        fs.unlinkSync(DIFF_FILE);
      } catch (e: any) {
        logger.error(`Failed to delete diff file: ${e.message}`);
      }
    }
  }
};
