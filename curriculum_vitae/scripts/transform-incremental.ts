// transform-incremental.ts - Handles incremental updates to CV

import fs from 'fs';
import {exec} from 'child_process';
import util from 'util';
import {
  CAREER_FILE,
  CvType,
  DIFF_FILE,
  getCvFile,
  getCvTypesToProcess,
  setOutput
} from './config.js';
import logger from './logger.js';
import {callClaudeApi, PromptResult} from './claude-api.js';
import {getIncrementalPrompt, getSystemPrompt} from './prompts.js';

// Promisify exec
const execAsync = util.promisify(exec);

// Build prompt for incremental update
const buildIncrementalPrompt = (cvType: CvType): PromptResult => {
  const cvFile = getCvFile(cvType);

  if (!fs.existsSync(cvFile)) {
    throw new Error(`CV file not found: ${cvFile}`);
  }
  if (!fs.existsSync(DIFF_FILE)) {
    throw new Error(`Diff file not found: ${DIFF_FILE}`);
  }

  const currentCv = fs.readFileSync(cvFile, 'utf8');
  const diffData = fs.readFileSync(DIFF_FILE, 'utf8');
  const systemPrompt = getSystemPrompt(cvType);
  const userPrompt = getIncrementalPrompt(cvType, currentCv, diffData);

  return {systemPrompt, userPrompt};
};

// Function to generate diff
const generateDiff = async (): Promise<boolean> => {
  // Skip diff generation if SKIP_API is true
  if (process.env.SKIP_API === 'true') {
    logger.info('SKIP_API is set to true, skipping diff generation');
    const mockDiff = '+ This is a mock diff for testing purposes';
    fs.writeFileSync(DIFF_FILE, mockDiff);
    return true;
  }

  try {
    // Get relative path for git commands
    const relativePath = CAREER_FILE.replace(process.cwd() + '/', '');

    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      // For manual triggers
      await execAsync(`git diff HEAD~1 HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
      return true;
    } else {
      // For auto-triggers
      const {stdout} = await execAsync(`git diff HEAD~1 HEAD --name-only`);
      if (stdout.includes(relativePath)) {
        await execAsync(`git diff HEAD~1 HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
        return true;
      } else {
        logger.info(`⏭️ Auto-trigger: No changes in ${CAREER_FILE}`);
        setOutput('mode', 'skip');
        return false;
      }
    }
  } catch (error: any) {
    // If git diff fails, create an empty diff file with a message
    fs.writeFileSync(DIFF_FILE, 'No changes detected');
    logger.info('No changes detected in git diff');
    return true; // Continue processing to check if diff is empty
  }
};

export const main = async (): Promise<void> => {
  try {
    logger.info('🔄 Starting incremental transformation for all CV types...');

    // Detect if we need to process
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      if (process.env.REBUILD_MODE === 'full_rebuild') {
        setOutput('mode', 'full_rebuild');
        logger.info('🔄 Manual trigger: Switching to full rebuild');
        // Don't exit here - let the parent handle it
        throw new Error('SWITCH_TO_FULL_REBUILD');
      }
      setOutput('mode', 'incremental');
      logger.info('📝 Manual trigger: Incremental mode');
    }

    // Generate diff
    const shouldContinue = await generateDiff();
    if (!shouldContinue) {
      return; // Return instead of exit
    }

    // Check if diff is empty
    const diffContent = fs.readFileSync(DIFF_FILE, 'utf8');
    if (!diffContent || diffContent.trim() === '' || diffContent === 'No changes detected') {
      logger.info('ℹ️ No actual changes to process');
      setOutput('mode', 'skip');
      return; // Return instead of exit
    }

    // Process each CV type
    const cvTypesToProcess = getCvTypesToProcess();
    for (const cvType of cvTypesToProcess) {
      logger.info(`Processing incremental update for ${cvType} CV...`);

      const {systemPrompt, userPrompt} = buildIncrementalPrompt(cvType);

      // Make API call with separate system and user prompts
      const success = await callClaudeApi(systemPrompt, userPrompt, cvType);
      if (success) {
        logger.success(`Incremental transformation response received for ${cvType} CV`);
      } else {
        throw new Error(`API call failed for ${cvType} CV`);
      }
    }

    logger.success('All CV types processed successfully');

    // Cleanup
    if (fs.existsSync(DIFF_FILE)) {
      try {
        fs.unlinkSync(DIFF_FILE);
      } catch (unlinkError: any) {
        logger.error(`Failed to delete diff file: ${unlinkError.message}`);
      }
    }
  } catch (error: any) {
    if (error.message === 'SWITCH_TO_FULL_REBUILD') {
      throw error; // Re-throw to let parent handle
    }
    logger.error(`Error in incremental transformation: ${error.message}`);
    // Cleanup
    if (fs.existsSync(DIFF_FILE)) {
      try {
        fs.unlinkSync(DIFF_FILE);
      } catch (unlinkError: any) {
        logger.error(`Failed to delete diff file: ${unlinkError.message}`);
      }
    }
    throw error;
  }
};
