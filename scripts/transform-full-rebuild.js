// transform-full-rebuild.js - Handles full rebuild of CV

import {DIFF_FILE, setOutput} from './config.js';
import logger from './logger.js';
import {buildCvPrompt, callClaudeApi} from './claude-api.js';
import fs from "fs";

export const main = async () => {
  try {
    logger.info('🏗️ Starting full rebuild...');

    // Set output mode
    setOutput('mode', 'full_rebuild');

    const {systemPrompt, userPrompt} = buildCvPrompt('full_rebuild');
    if (!systemPrompt || !userPrompt) {
      logger.error('Failed to build prompts');
      fs.unlinkSync(DIFF_FILE);
      throw new Error('Failed to build prompts');
    }

    const success = await callClaudeApi(systemPrompt, userPrompt);
    if (success) {
      logger.success('Full rebuild response received');
    } else {
      logger.error('API call failed');
      throw new Error('API call failed');
    }
  } catch (error) {
    logger.error(`Error in full rebuild: ${error.message}`);
    throw error;
  }
};
