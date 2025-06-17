// prompts.ts - Prompt management utilities

import fs from 'fs';
import path from 'path';
import logger from './logger.js';

interface PromptsConfig {
  system: {
    default: string;
  };
  user: {
    fullRebuild: string;
    incremental: string;
  };
}

let cachedPrompts: PromptsConfig | null = null;

// Load prompts from JSON file
const loadPrompts = (): PromptsConfig => {
  if (cachedPrompts) {
    return cachedPrompts;
  }

  const promptsPath = path.join(process.cwd(), 'prompts.json');

  try {
    const promptsData = fs.readFileSync(promptsPath, 'utf8');
    cachedPrompts = JSON.parse(promptsData);
    logger.debug('Loaded prompts from prompts.json');
    return cachedPrompts!;
  } catch (error: any) {
    logger.error(`Failed to load prompts from ${promptsPath}: ${error.message}`);
    throw new Error(`Prompts configuration not found: ${error.message}`);
  }
};

// Get system prompt
export const getSystemPrompt = (): string => {
  const prompts = loadPrompts();
  return prompts.system.default;
};

// Get user prompt for full rebuild with variable substitution
export const getFullRebuildPrompt = (careerData: string): string => {
  const prompts = loadPrompts();
  return prompts.user.fullRebuild.replace('{{CAREER_DATA}}', careerData);
};

// Get user prompt for incremental update with variable substitution
export const getIncrementalPrompt = (currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  return prompts.user.incremental
  .replace('{{CURRENT_CV}}', currentCv)
  .replace('{{DIFF_DATA}}', diffData);
};
