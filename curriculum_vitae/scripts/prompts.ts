// prompts.ts - Prompt management utilities

import fs from 'fs';
import path from 'path';
import logger from './logger.js';

interface PromptsConfig {
  antiCv: {
    system: string;
    fullRebuild: string;
    incremental: string;
  };
  // Future CV types can be added here:
  // professionalCv: { ... }
  // academicCv: { ... }
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

// Get system prompt for anti-CV
export const getAntiCvSystemPrompt = (): string => {
  const prompts = loadPrompts();
  return prompts.antiCv.system;
};

// Get user prompt for anti-CV full rebuild with variable substitution
export const getAntiCvFullRebuildPrompt = (careerData: string): string => {
  const prompts = loadPrompts();
  return prompts.antiCv.fullRebuild.replace('{{CAREER_DATA}}', careerData);
};

// Get user prompt for anti-CV incremental update with variable substitution
export const getAntiCvIncrementalPrompt = (currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  return prompts.antiCv.incremental
  .replace('{{CURRENT_CV}}', currentCv)
  .replace('{{DIFF_DATA}}', diffData);
};

// Legacy functions for backward compatibility (currently defaults to anti-CV)
export const getSystemPrompt = (): string => getAntiCvSystemPrompt();
export const getFullRebuildPrompt = (careerData: string): string => getAntiCvFullRebuildPrompt(careerData);
export const getIncrementalPrompt = (currentCv: string, diffData: string): string => getAntiCvIncrementalPrompt(currentCv, diffData);
