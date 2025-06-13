// transform-full-rebuild.js - Handles full rebuild of CV

import {setOutput} from './config.js';
import logger from './logger.js';
import {buildCvPrompt, callClaudeApi} from './claude-api.js';

export const main = async () => {
  try {
    logger.info('🏗️ Starting full rebuild...');

    // Set output mode
    setOutput('mode', 'full_rebuild');

    // Build prompt using shared function
    const prompt = buildCvPrompt('full_rebuild');
    if (!prompt) {
      logger.error('Failed to build prompt');
      process.exit(1);
    }

    // Make API call
    const success = await callClaudeApi(prompt);
    if (success) {
      logger.success('Full rebuild response received');
    } else {
      logger.error('API call failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Error in full rebuild: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main().then(() => {
  logger.debug('Full rebuild completed');
}).catch(error => {
  logger.error(`Unhandled error in full rebuild: ${error.message}`);
  process.exit(1);
});
