// prompts.ts - Prompt management utilities

import fs from 'fs';
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
  commonRules: string[];
  commonFormat: string[];
  fullRebuildBase: string[];
  incrementalBase: string[];
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
const FORMAT = '{{SHARED_FORMAT}}';
const PAGE_BREAK = '{{SHARED_PAGE_BREAK}}';
const CONTENT_DIST = '{{SHARED_CONTENT_DISTRIBUTION}}';
const OUTPUT = '{{SHARED_OUTPUT}}';
const PAGE_REQS = '{{SHARED_PAGE_REQUIREMENTS}}';
const INCR_GUIDE = '{{SHARED_INCREMENTAL_GUIDELINES}}';
const COMMON_RULES = '{{SHARED_COMMON_RULES}}';
const COMMON_FORMAT = '{{SHARED_COMMON_FORMAT}}';
const FULL_REBUILD_BASE = '{{SHARED_FULL_REBUILD_BASE}}';
const INCREMENTAL_BASE = '{{SHARED_INCREMENTAL_BASE}}';
const CV_TYPE = '{{CV_TYPE}}';
const CV_SPECIFIC_RULES = '{{CV_SPECIFIC_RULES}}';

const normalize = (prompt: string | string[]): string =>
  Array.isArray(prompt) ? prompt.join('\n') : prompt;

const substitute = (text: string, shared: SharedConfig, cvType: CvType): string => {
  const reqs = shared.pageRequirements.map(r => `- ${r}`).join('\n');
  const guide = shared.incrementalGuidelines.join('\n- ');
  const commonRules = shared.commonRules.join('\n');
  const commonFormat = shared.commonFormat.join('\n');
  const fullRebuildBase = shared.fullRebuildBase.join('\n');
  const incrementalBase = shared.incrementalBase.join('\n');
  const cvTypeName = cvType === 'anti' ? 'Anti-CV' : 'professional CV';

  return text
    .replace(new RegExp(PAGES, 'g'), shared.structure.pages.toString())
    .replace(new RegExp(FORMAT, 'g'), shared.structure.format)
    .replace(new RegExp(PAGE_BREAK, 'g'), shared.structure.pageBreak)
    .replace(new RegExp(CONTENT_DIST, 'g'), shared.structure.contentDistribution)
    .replace(new RegExp(OUTPUT, 'g'), shared.structure.output)
    .replace(new RegExp(PAGE_REQS, 'g'), reqs)
    .replace(new RegExp(INCR_GUIDE, 'g'), guide)
    .replace(new RegExp(COMMON_RULES, 'g'), commonRules)
    .replace(new RegExp(COMMON_FORMAT, 'g'), commonFormat)
    .replace(new RegExp(FULL_REBUILD_BASE, 'g'), fullRebuildBase)
    .replace(new RegExp(INCREMENTAL_BASE, 'g'), incrementalBase)
    .replace(new RegExp(CV_TYPE, 'g'), cvTypeName)
    .replace(new RegExp(CV_SPECIFIC_RULES, 'g'), getCvSpecificRules(cvType));
};

const getCvSpecificRules = (cvType: CvType): string => {
  if (cvType === 'anti') {
    return 'Protect reputations. Self-deprecating but professional.';
  } else {
    return 'Achievement language. Quantify results. Professional tone. Emphasize value.';
  }
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
  return substitute(normalize(system), prompts.shared, type);
};

export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  const prompt = type === 'anti' ? prompts.antiCv.fullRebuild : prompts.professionalCv.fullRebuild;
  return substitute(normalize(prompt), prompts.shared, type).replace(CAREER_DATA, careerData);
};

export const getIncrementalPrompt = (type: CvType, currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  const prompt = type === 'anti' ? prompts.antiCv.incremental : prompts.professionalCv.incremental;
  return substitute(normalize(prompt), prompts.shared, type)
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
