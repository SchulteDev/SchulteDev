// transform-full-rebuild.ts - Handles full rebuild of CV

import {DIFF_FILE, setOutput} from './config.js';
import logger from './logger.js';
import {buildCvPrompt, callClaudeApi} from './claude-api.js';
import fs from "fs";

export const main = async (): Promise<void> => {
  try {
    logger.info('🏗️ Starting full rebuild...');

    // Set output mode
    setOutput('mode', 'full_rebuild');

    const {systemPrompt, userPrompt} = buildCvPrompt('full_rebuild');
    if (!systemPrompt || !userPrompt) {
      fs.unlinkSync(DIFF_FILE);
      throw new Error('Failed to build prompts');
    }

    const success = await callClaudeApi(systemPrompt, userPrompt);
    if (success) {
      logger.success('Full rebuild response received');
    } else {
      throw new Error('API call failed');
    }
  } catch (error: any) {
    logger.error(`Error in full rebuild: ${error.message}`);
    throw error;
  }
};
