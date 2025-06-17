// transform-full-rebuild.ts - Handles full rebuild of CV

import {CAREER_FILE, setOutput} from './config.js';
import logger from './logger.js';
import {callClaudeApi, PromptResult} from './claude-api.js';
import {getFullRebuildPrompt, getSystemPrompt} from './prompts.js';
import fs from "fs";

// Build prompt for full rebuild
const buildFullRebuildPrompt = (): PromptResult => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  const systemPrompt = getSystemPrompt();
  const userPrompt = getFullRebuildPrompt(careerData);

  return {systemPrompt, userPrompt};
};

export const main = async (): Promise<void> => {
  try {
    logger.info('🏗️ Starting full rebuild...');

    // Set output mode
    setOutput('mode', 'full_rebuild');

    const {systemPrompt, userPrompt} = buildFullRebuildPrompt();

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
