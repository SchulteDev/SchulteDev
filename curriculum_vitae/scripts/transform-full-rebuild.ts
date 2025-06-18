// transform-full-rebuild.ts - Handles full rebuild of CV

import {CAREER_FILE, CvType, getCvTypesToProcess, setOutput} from './config.js';
import logger from './logger.js';
import {callClaudeApi, PromptResult} from './claude-api.js';
import {getFullRebuildPrompt, getSystemPrompt} from './prompts.js';
import fs from "fs";

// Build prompt for full rebuild
const buildFullRebuildPrompt = (cvType: CvType): PromptResult => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  const systemPrompt = getSystemPrompt(cvType);
  const userPrompt = getFullRebuildPrompt(cvType, careerData);

  return {systemPrompt, userPrompt};
};

export const main = async (): Promise<void> => {
  try {
    const cvTypesToProcess = getCvTypesToProcess();
    logger.info(`🏗️ Starting full rebuild for CV types: ${cvTypesToProcess.join(', ')}`);

    // Set output mode
    setOutput('mode', 'full_rebuild');

    // Process each selected CV type
    for (const cvType of cvTypesToProcess) {
      logger.info(`Processing ${cvType} CV...`);

      const {systemPrompt, userPrompt} = buildFullRebuildPrompt(cvType);

      const success = await callClaudeApi(systemPrompt, userPrompt, cvType);
      if (success) {
        logger.success(`Full rebuild response received for ${cvType} CV`);
      } else {
        throw new Error(`API call failed for ${cvType} CV`);
      }
    }

    logger.success(`All selected CV types processed successfully: ${cvTypesToProcess.join(', ')}`);
  } catch (error: any) {
    logger.error(`Error in full rebuild: ${error.message}`);
    throw error;
  }
};
