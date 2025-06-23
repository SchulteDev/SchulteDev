// prompts.ts - Prompt management utilities

import fs from 'fs-extra';
import logger from './logger.js';
import {CvType} from './config.js';

interface SharedConfig {
  structure: { pages: number; pageBreak: string; output: string; };
  pageLayout: string[];
  constraints: string[];
  templates: { fullRebuild: string | string[]; incremental: string | string[]; };
}

interface CvConfig {
  cvType: string;
  system: string | string[];
  fullRebuildInstructions: string;
  incrementalInstructions: string;
}

interface PromptsConfig {
  shared: SharedConfig;
  antiCv: CvConfig;
  professionalCv: CvConfig;
}

let cachedPrompts: PromptsConfig | null = null;

const PLACEHOLDERS = {
  CAREER_DATA: '{{CAREER_DATA}}',
  CURRENT_CV: '{{CURRENT_CV}}',
  DIFF_DATA: '{{DIFF_DATA}}',
  PAGES: '{{PAGES}}',
  CV_TYPE: '{{CV_TYPE}}',
  SHARED_PAGE_LAYOUT: '{{SHARED_PAGE_LAYOUT}}',
  SHARED_CONSTRAINTS: '{{SHARED_CONSTRAINTS}}',
  SHARED_OUTPUT: '{{SHARED_OUTPUT}}',
  TYPE_SPECIFIC_INSTRUCTIONS: '{{TYPE_SPECIFIC_INSTRUCTIONS}}'
} as const;

const normalize = (prompt: string | string[]): string =>
  Array.isArray(prompt) ? prompt.join('\n') : prompt;

const createSharedSubstitutions = (shared: SharedConfig): Record<string, string> => ({
  [PLACEHOLDERS.PAGES]: shared.structure.pages.toString(),
  [PLACEHOLDERS.SHARED_PAGE_LAYOUT]: shared.pageLayout.join('\n'),
  [PLACEHOLDERS.SHARED_CONSTRAINTS]: shared.constraints.join('\n'),
  [PLACEHOLDERS.SHARED_OUTPUT]: shared.structure.output
});

const substitute = (text: string, substitutions: Record<string, string>): string => {
  return Object.entries(substitutions).reduce((result, [placeholder, value]) =>
    result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value), text);
};

const loadPrompts = (): PromptsConfig => {
  if (cachedPrompts) return cachedPrompts;

  try {
    cachedPrompts = JSON.parse(fs.readFileSync(`${process.cwd()}/prompts.json`, 'utf8'));
    logger.debug('Loaded prompts from prompts.json');
    return cachedPrompts!;
  } catch (error: any) {
    logger.error(`Failed to load prompts: ${error.message}`);
    throw new Error(`Prompts not found: ${error.message}`);
  }
};

const getPromptConfig = (type: CvType, prompts: PromptsConfig): CvConfig =>
  type === 'anti' ? prompts.antiCv : prompts.professionalCv;

export const getSystemPrompt = (type: CvType): string => {
  const prompts = loadPrompts();
  const config = getPromptConfig(type, prompts);
  return substitute(normalize(config.system), createSharedSubstitutions(prompts.shared));
};

export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  const config = getPromptConfig(type, prompts);
  const substitutions = {
    ...createSharedSubstitutions(prompts.shared),
    [PLACEHOLDERS.CAREER_DATA]: careerData,
    [PLACEHOLDERS.CV_TYPE]: config.cvType,
    [PLACEHOLDERS.TYPE_SPECIFIC_INSTRUCTIONS]: config.fullRebuildInstructions
  };
  return substitute(normalize(prompts.shared.templates.fullRebuild), substitutions);
};

export const getIncrementalPrompt = (type: CvType, currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  const config = getPromptConfig(type, prompts);
  const substitutions = {
    ...createSharedSubstitutions(prompts.shared),
    [PLACEHOLDERS.CURRENT_CV]: currentCv,
    [PLACEHOLDERS.DIFF_DATA]: diffData,
    [PLACEHOLDERS.CV_TYPE]: config.cvType,
    [PLACEHOLDERS.TYPE_SPECIFIC_INSTRUCTIONS]: config.incrementalInstructions
  };
  return substitute(normalize(prompts.shared.templates.incremental), substitutions);
};

// Legacy compatibility
export const getAntiCvSystemPrompt = () => getSystemPrompt('anti');
export const getAntiCvFullRebuildPrompt = (data: string) => getFullRebuildPrompt('anti', data);
export const getAntiCvIncrementalPrompt = (cv: string, diff: string) => getIncrementalPrompt('anti', cv, diff);

export const getProfessionalCvSystemPrompt = () => getSystemPrompt('professional');
export const getProfessionalCvFullRebuildPrompt = (data: string) => getFullRebuildPrompt('professional', data);
export const getProfessionalCvIncrementalPrompt = (cv: string, diff: string) => getIncrementalPrompt('professional', cv, diff);
