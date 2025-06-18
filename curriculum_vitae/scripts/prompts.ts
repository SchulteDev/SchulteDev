// prompts.ts - Prompt management utilities

import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import {CvType} from './config.js';

interface SharedConfig {
  structure: {
    pages: number;
    pageBreak: string;
    contentDistribution: string;
    format: string;
    output: string;
  };
  pageRequirements: string[];
  incrementalGuidelines: string[];
}

interface PromptsConfig {
  shared: SharedConfig;
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

// Shared placeholder patterns
const pagesPlaceholder = '{{PAGES}}';
const sharedFormatPlaceholder = '{{SHARED_FORMAT}}';
const sharedPageBreakPlaceholder = '{{SHARED_PAGE_BREAK}}';
const sharedContentDistributionPlaceholder = '{{SHARED_CONTENT_DISTRIBUTION}}';
const sharedOutputPlaceholder = '{{SHARED_OUTPUT}}';
const sharedPageRequirementsPlaceholder = '{{SHARED_PAGE_REQUIREMENTS}}';
const sharedIncrementalGuidelinesPlaceholder = '{{SHARED_INCREMENTAL_GUIDELINES}}';

// Helper function to normalize prompts (handles both string and array)
const normalizePrompt = (prompt: string | string[]): string => {
  return Array.isArray(prompt) ? prompt.join('\n') : prompt;
};

// Helper function to substitute shared placeholders
const substituteSharedPlaceholders = (text: string, shared: SharedConfig): string => {
  const pageRequirementsText = shared.pageRequirements.map(req => `- ${req}`).join('\n');
  const incrementalGuidelinesText = shared.incrementalGuidelines.join('\n- ');

  return text
  .replace(new RegExp(pagesPlaceholder, 'g'), shared.structure.pages.toString())
  .replace(new RegExp(sharedFormatPlaceholder, 'g'), shared.structure.format)
  .replace(new RegExp(sharedPageBreakPlaceholder, 'g'), shared.structure.pageBreak)
  .replace(new RegExp(sharedContentDistributionPlaceholder, 'g'), shared.structure.contentDistribution)
  .replace(new RegExp(sharedOutputPlaceholder, 'g'), shared.structure.output)
  .replace(new RegExp(sharedPageRequirementsPlaceholder, 'g'), pageRequirementsText)
  .replace(new RegExp(sharedIncrementalGuidelinesPlaceholder, 'g'), incrementalGuidelinesText);
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
  let systemPrompt: string;

  switch (type) {
    case 'anti':
      systemPrompt = normalizePrompt(prompts.antiCv.system);
      break;
    case 'professional':
      systemPrompt = normalizePrompt(prompts.professionalCv.system);
      break;
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }

  return substituteSharedPlaceholders(systemPrompt, prompts.shared);
};

// Get user prompt for full rebuild with variable substitution
export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  let prompt: string;

  switch (type) {
    case 'anti':
      prompt = normalizePrompt(prompts.antiCv.fullRebuild);
      break;
    case 'professional':
      prompt = normalizePrompt(prompts.professionalCv.fullRebuild);
      break;
    default:
      throw new Error(`Unknown CV type: ${type}`);
  }

  prompt = substituteSharedPlaceholders(prompt, prompts.shared);
  return prompt.replace(careerDataPlaceholder, careerData);
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

  prompt = substituteSharedPlaceholders(prompt, prompts.shared);
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
