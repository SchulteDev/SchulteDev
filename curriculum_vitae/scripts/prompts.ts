// prompts.ts - Prompt management utilities

import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import {CvType} from './config.js';

interface PromptsConfig {
  antiCv: {
    system: string | string[];
    fullRebuild: string | string[];
    incremental: string | string[];
  };
  professionalCv: {
    system: string | string[];
    fullRebuild: string | string[];
    incremental: string | string[];
  };
}

let cachedPrompts: PromptsConfig | null = null;

const careerDataPlaceholder = '{{CAREER_DATA}}';
const currentCvPlaceholder = '{{CURRENT_CV}}';
const diffDataPlaceholder = '{{DIFF_DATA}}';

// Helper function to normalize prompts (handles both string and array)
const normalizePrompt = (prompt: string | string[]): string => {
  return Array.isArray(prompt) ? prompt.join('\n') : prompt;
};

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

// Get system prompt for specific CV type
export const getSystemPrompt = (type: CvType): string => {
  const prompts = loadPrompts();
  switch (type) {
    case 'anti':
      return normalizePrompt(prompts.antiCv.system);
    case 'professional':
      return normalizePrompt(prompts.professionalCv.system);
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }
};

// Get user prompt for full rebuild with variable substitution
export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  switch (type) {
    case 'anti':
      return normalizePrompt(prompts.antiCv.fullRebuild).replace(careerDataPlaceholder, careerData);
    case 'professional':
      return normalizePrompt(prompts.professionalCv.fullRebuild).replace(careerDataPlaceholder, careerData);
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }
};

// Get user prompt for incremental update with variable substitution
export const getIncrementalPrompt = (type: CvType, currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  let prompt: string;

  switch (type) {
    case 'anti':
      prompt = normalizePrompt(prompts.antiCv.incremental);
      break;
    case 'professional':
      prompt = normalizePrompt(prompts.professionalCv.incremental);
      break;
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }

  return prompt
  .replace(currentCvPlaceholder, currentCv)
  .replace(diffDataPlaceholder, diffData);
};

// Legacy functions for backward compatibility (defaults to anti-CV)
export const getAntiCvSystemPrompt = (): string => getSystemPrompt('anti');
export const getAntiCvFullRebuildPrompt = (careerData: string): string => getFullRebuildPrompt('anti', careerData);
export const getAntiCvIncrementalPrompt = (currentCv: string, diffData: string): string => getIncrementalPrompt('anti', currentCv, diffData);

// Professional CV specific functions
export const getProfessionalCvSystemPrompt = (): string => getSystemPrompt('professional');
export const getProfessionalCvFullRebuildPrompt = (careerData: string): string => getFullRebuildPrompt('professional', careerData);
export const getProfessionalCvIncrementalPrompt = (currentCv: string, diffData: string): string => getIncrementalPrompt('professional', currentCv, diffData);
