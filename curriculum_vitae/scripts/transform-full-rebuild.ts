// transform-full-rebuild.ts - Handles full rebuild of CV

import {CAREER_FILE, setOutput} from './config.js';
import logger from './logger.js';
import {buildSystemPrompt, callClaudeApi, PromptResult} from './claude-api.js';
import fs from "fs";

// Build prompt for full rebuild
const buildFullRebuildPrompt = (): PromptResult => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = `Create entertaining anti-CV from career data. Focus on failures, rejections, things that went wrong + lessons learned. Be creative and humorous while professional.

Career data:
\`\`\`markdown
${fs.readFileSync(CAREER_FILE, 'utf8')}
\`\`\`

Transform achievements into amusing failure stories and learning experiences.`;

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
