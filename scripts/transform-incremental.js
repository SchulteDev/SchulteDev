// transform-incremental.js - Handles incremental updates to CV

import fs from 'fs';
import {exec} from 'child_process';
import util from 'util';
import {CAREER_FILE, DIFF_FILE, setOutput} from './config.js';
import {logError, logInfo, logSuccess} from './logger.js';
import {buildCvPrompt, callClaudeApi} from './claude-api.js';

// Promisify exec
const execAsync = util.promisify(exec);

// Function to generate diff
const generateDiff = async () => {
  try {
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      // For manual triggers
      await execAsync(`git diff HEAD~1 HEAD "${CAREER_FILE}" > "${DIFF_FILE}"`);
      return true;
    } else {
      // For auto-triggers
      const {stdout} = await execAsync(`git diff HEAD~1 HEAD --name-only`);
      if (stdout.includes(CAREER_FILE)) {
        await execAsync(`git diff HEAD~1 HEAD "${CAREER_FILE}" > "${DIFF_FILE}"`);
        return true;
      } else {
        logInfo(`⏭️ Auto-trigger: No changes in ${CAREER_FILE}`);
        setOutput('mode', 'skip');
        return false;
      }
    }
  } catch (error) {
    // If git diff fails, create an empty diff file with a message
    fs.writeFileSync(DIFF_FILE, 'No changes detected');
    logInfo('No changes detected in git diff');
    return true; // Continue processing to check if diff is empty
  }
};

const main = async () => {
  try {
    logInfo('🔄 Starting incremental transformation...');

    // Detect if we need to process
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      if (process.env.REBUILD_MODE === 'full_rebuild') {
        setOutput('mode', 'full_rebuild');
        logInfo('🔄 Manual trigger: Switching to full rebuild');
        process.exit(0);
      }
      setOutput('mode', 'incremental');
      logInfo('📝 Manual trigger: Incremental mode');
    }

    // Generate diff
    const shouldContinue = await generateDiff();
    if (!shouldContinue) {
      process.exit(0);
    }

    // Check if diff is empty
    const diffContent = fs.readFileSync(DIFF_FILE, 'utf8');
    if (!diffContent || diffContent.trim() === '' || diffContent === 'No changes detected') {
      logInfo('ℹ️ No actual changes to process');
      setOutput('mode', 'skip');
      process.exit(0);
    }

    // Build prompt using shared function
    const prompt = buildCvPrompt('incremental');
    if (!prompt) {
      logError('Failed to build prompt');
      fs.unlinkSync(DIFF_FILE);
      process.exit(1);
    }

    // Make API call
    const success = await callClaudeApi(prompt);
    if (success) {
      logSuccess('Incremental transformation response received');
      // Cleanup
      fs.unlinkSync(DIFF_FILE);
    } else {
      logError('API call failed');
      fs.unlinkSync(DIFF_FILE);
      process.exit(1);
    }
  } catch (error) {
    logError(`Error in incremental transformation: ${error.message}`);
    // Cleanup
    if (fs.existsSync(DIFF_FILE)) {
      fs.unlinkSync(DIFF_FILE);
    }
    process.exit(1);
  }
};

// Run the main function
main();
