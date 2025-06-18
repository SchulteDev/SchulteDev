// transform-full-rebuild.ts - Full CV rebuild

import {CAREER_FILE, CvType, getCvTypesToProcess, setOutput} from './config.js';
import logger from './logger.js';
import {callClaudeApi, PromptResult} from './claude-api.js';
import {getFullRebuildPrompt, getSystemPrompt} from './prompts.js';
import fs from "fs";

const buildPrompt = (cvType: CvType): PromptResult => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  return {
    systemPrompt: getSystemPrompt(cvType),
    userPrompt: getFullRebuildPrompt(cvType, careerData)
  };
};

export const main = async (): Promise<void> => {
  try {
    const types = getCvTypesToProcess();
    logger.info(`🏗️ Full rebuild for: ${types.join(', ')}`);
    setOutput('mode', 'full_rebuild');

    for (const type of types) {
      logger.info(`Processing ${type} CV...`);
      const {systemPrompt, userPrompt} = buildPrompt(type);

      if (await callClaudeApi(systemPrompt, userPrompt, type)) {
        logger.success(`Full rebuild complete for ${type} CV`);
      } else {
        throw new Error(`API call failed for ${type} CV`);
      }
    }

    logger.success(`All CVs processed: ${types.join(', ')}`);
  } catch (error: any) {
    logger.error(`Full rebuild error: ${error.message}`);
    throw error;
  }
};
