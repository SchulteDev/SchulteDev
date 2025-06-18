// prompts.ts - Prompt management utilities

import fs from 'fs';
import logger from './logger.js';
import {CvType} from './config.js';

interface SharedConfig {
  structure: {
    pages: number;
    pageBreak: string;
    output: string;
  };
  pageLayout: string[];
  constraints: string[];
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

// Placeholders
const CAREER_DATA = '{{CAREER_DATA}}';
const CURRENT_CV = '{{CURRENT_CV}}';
const DIFF_DATA = '{{DIFF_DATA}}';
const PAGES = '{{PAGES}}';
const PAGE_LAYOUT = '{{SHARED_PAGE_LAYOUT}}';
const CONSTRAINTS = '{{SHARED_CONSTRAINTS}}';
const OUTPUT = '{{SHARED_OUTPUT}}';

const normalize = (prompt: string | string[]): string =>
  Array.isArray(prompt) ? prompt.join('\n') : prompt;

const substitute = (text: string, shared: SharedConfig): string => {
  const pageLayout = shared.pageLayout.join('\n');
  const constraints = shared.constraints.join('\n');

  return text
    .replace(new RegExp(PAGES, 'g'), shared.structure.pages.toString())
    .replace(new RegExp(PAGE_LAYOUT, 'g'), pageLayout)
    .replace(new RegExp(CONSTRAINTS, 'g'), constraints)
    .replace(new RegExp(OUTPUT, 'g'), shared.structure.output);
};

const loadPrompts = (): PromptsConfig => {
  if (cachedPrompts) return cachedPrompts;

  const path = `${process.cwd()}/prompts.json`;
  try {
    cachedPrompts = JSON.parse(fs.readFileSync(path, 'utf8'));
    logger.debug('Loaded prompts from prompts.json');
    return cachedPrompts!;
  } catch (error: any) {
    logger.error(`Failed to load prompts: ${error.message}`);
    throw new Error(`Prompts not found: ${error.message}`);
  }
};

export const getSystemPrompt = (type: CvType): string => {
  const prompts = loadPrompts();
  const system = type === 'anti' ? prompts.antiCv.system : prompts.professionalCv.system;
  return substitute(normalize(system), prompts.shared);
};

export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  const prompt = type === 'anti' ? prompts.antiCv.fullRebuild : prompts.professionalCv.fullRebuild;
  return substitute(normalize(prompt), prompts.shared).replace(CAREER_DATA, careerData);
};

export const getIncrementalPrompt = (type: CvType, currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  const prompt = type === 'anti' ? prompts.antiCv.incremental : prompts.professionalCv.incremental;
  return substitute(normalize(prompt), prompts.shared)
    .replace(CURRENT_CV, currentCv)
    .replace(DIFF_DATA, diffData);
};

// Legacy compatibility (anti-CV defaults)
export const getAntiCvSystemPrompt = () => getSystemPrompt('anti');
export const getAntiCvFullRebuildPrompt = (data: string) => getFullRebuildPrompt('anti', data);
export const getAntiCvIncrementalPrompt = (cv: string, diff: string) => getIncrementalPrompt('anti', cv, diff);

// Professional CV functions
export const getProfessionalCvSystemPrompt = () => getSystemPrompt('professional');
export const getProfessionalCvFullRebuildPrompt = (data: string) => getFullRebuildPrompt('professional', data);
export const getProfessionalCvIncrementalPrompt = (cv: string, diff: string) => getIncrementalPrompt('professional', cv, diff);
