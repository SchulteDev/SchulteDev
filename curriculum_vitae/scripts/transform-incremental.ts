// transform-incremental.ts - Handles incremental updates to CV

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

// Promisify exec
const execAsync = util.promisify(exec);

// Build prompt for incremental update
const buildPromptForType = (cvType: CvType): PromptResult => {
  const cvFile = getCvFile(cvType);

  if (!fs.existsSync(cvFile)) {
    throw new Error(`CV file not found: ${cvFile}`);
  }
  if (!fs.existsSync(DIFF_FILE)) {
    throw new Error(`Diff file not found: ${DIFF_FILE}`);
  }

  const currentCv = fs.readFileSync(cvFile, 'utf8');
  const diffData = fs.readFileSync(DIFF_FILE, 'utf8');

  return {
    systemPrompt: getSystemPrompt(cvType),
    userPrompt: getIncrementalPrompt(cvType, currentCv, diffData)
  };
};

// Generate git diff for incremental updates
const generateDiff = async (): Promise<boolean> => {
  // Mock diff for testing
  if (process.env.SKIP_API === 'true') {
    fs.writeFileSync(DIFF_FILE, '+ This is a mock diff for testing purposes');
    return true;
  }

  try {
    const relativePath = CAREER_FILE.replace(process.cwd() + '/', '');
    const isManualTrigger = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
    const diffRange = `HEAD~${GIT_DIFF_RANGE}`;

    logger.debug(`Using git diff range: ${diffRange} HEAD`);

    if (isManualTrigger) {
      await execAsync(`git diff ${diffRange} HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
      return true;
    }

    // Auto-trigger: check if career file changed
    const {stdout} = await execAsync(`git diff ${diffRange} HEAD --name-only`);
    if (stdout.includes(relativePath)) {
      await execAsync(`git diff ${diffRange} HEAD -- "${relativePath}" > "${DIFF_FILE}"`);
      return true;
    }

    logger.info(`No changes in ${CAREER_FILE} over last ${GIT_DIFF_RANGE} commits`);
    setOutput('mode', 'skip');
    return false;
  } catch (error: any) {
    fs.writeFileSync(DIFF_FILE, 'No changes detected');
    logger.info('No changes detected in git diff');
    return true;
  }
};

export const main = async (): Promise<void> => {
  try {
    // Ensure required directories exist
    ensureDirectories();

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
      // In test mode with SKIP_API, still create mock responses
      if (process.env.SKIP_API === 'true') {
        logger.info('No changes detected, but SKIP_API=true, creating mock responses for testing');
        const cvTypesToProcess = getCvTypesToProcess();
        for (const cvType of cvTypesToProcess) {
          logger.info(`Creating mock response for ${cvType} CV...`);
          const {systemPrompt, userPrompt} = buildPromptForType(cvType);
          const success = await callClaudeApi(systemPrompt, userPrompt, cvType);
          if (success) {
            logger.success(`Mock response created for ${cvType} CV`);
          } else {
            throw new Error(`Failed to create mock response for ${cvType} CV`);
          }
        }
        logger.success('All mock responses created successfully');
        return;
      } else {
        logger.info('ℹ️ No actual changes to process');
        setOutput('mode', 'skip');
        return; // Return instead of exit
      }
    }

    // Process each CV type
    const cvTypesToProcess = getCvTypesToProcess();
    for (const cvType of cvTypesToProcess) {
      logger.info(`Processing incremental update for ${cvType} CV...`);

      const {systemPrompt, userPrompt} = buildPromptForType(cvType);

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
