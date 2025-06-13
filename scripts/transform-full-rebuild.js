// transform-full-rebuild.js - Handles full rebuild of CV

import {setOutput} from './config.js';
import {logError, logInfo, logSuccess} from './logger.js';
import {buildCvPrompt, callClaudeApi} from './claude-api.js';

const main = async () => {
  try {
    logInfo('🏗️ Starting full rebuild...');

    // Set output mode
    setOutput('mode', 'full_rebuild');

    // Build prompt using shared function
    const prompt = buildCvPrompt('full_rebuild');
    if (!prompt) {
      logError('Failed to build prompt');
      process.exit(1);
    }

    // Make API call
    const success = await callClaudeApi(prompt);
    if (success) {
      logSuccess('Full rebuild response received');
    } else {
      logError('API call failed');
      process.exit(1);
    }
  } catch (error) {
    logError(`Error in full rebuild: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main();
