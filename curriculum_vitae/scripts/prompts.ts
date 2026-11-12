// prompts.ts - Prompt management utilities with Zod validation

import fs from 'fs-extra';
import {z} from 'zod';
import logger from './logger.js';
import {CvType} from './config.js';

// Zod schemas for prompts.json structure
const SharedConfigSchema = z.object({
  structure: z.object({
    pages: z.number().positive(),
    output: z.string(),
  }),
  pageLayout: z.array(z.string()),
  constraints: z.array(z.string()),
  templates: z.object({
    fullRebuild: z.union([z.string(), z.array(z.string())]),
    incremental: z.union([z.string(), z.array(z.string())]),
  }),
});

const CvConfigSchema = z.object({
  cvType: z.string(),
  fullRebuildInstructions: z.string(),
  incrementalInstructions: z.string(),
});

const PromptsConfigSchema = z.object({
  shared: SharedConfigSchema,
  antiCv: CvConfigSchema,
  professionalCv: CvConfigSchema,
});

// Type inference from Zod schemas
type SharedConfig = z.infer<typeof SharedConfigSchema>;
type CvConfig = z.infer<typeof CvConfigSchema>;
type PromptsConfig = z.infer<typeof PromptsConfigSchema>;

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

const createSharedSubstitutions = (shared: SharedConfig): Record<string, string> => {
  // The shared texts contain {{PAGES}} themselves, so fill it in before they are inserted
  const pages = {[PLACEHOLDERS.PAGES]: shared.structure.pages.toString()};
  return {
    ...pages,
    [PLACEHOLDERS.SHARED_PAGE_LAYOUT]: substitute(shared.pageLayout.join('\n'), pages),
    [PLACEHOLDERS.SHARED_CONSTRAINTS]: substitute(shared.constraints.join('\n'), pages),
    [PLACEHOLDERS.SHARED_OUTPUT]: substitute(shared.structure.output, pages)
  };
};

// Single pass: inserted values (career data, current CV, diff) are never scanned for placeholders
// again, and the function replacer keeps `$` in LaTeX from being read as a replacement pattern
const substitute = (text: string, substitutions: Record<string, string>): string =>
  text.replaceAll(/\{\{[A-Z_]+}}/g, placeholder => substitutions[placeholder] ?? placeholder);

const loadPrompts = (): PromptsConfig => {
  if (cachedPrompts) return cachedPrompts;

  try {
    const rawData = JSON.parse(fs.readFileSync(`${process.cwd()}/prompts.json`, 'utf8'));

    // Validate JSON structure with Zod
    cachedPrompts = PromptsConfigSchema.parse(rawData);

    logger.debug('Loaded and validated prompts from prompts.json');
    return cachedPrompts!;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      logger.error(`Prompts validation failed: ${errorMessage}`);
      throw new Error(`Invalid prompts.json structure: ${error.issues[0]?.message}`);
    }
    logger.error(`Failed to load prompts: ${error.message}`);
    throw new Error(`Prompts not found: ${error.message}`);
  }
};

const getPromptConfig = (type: CvType, prompts: PromptsConfig): CvConfig =>
  type === 'anti' ? prompts.antiCv : prompts.professionalCv;

export const getFullRebuildPrompt = (type: CvType, careerData: string): string => {
  const prompts = loadPrompts();
  const config = getPromptConfig(type, prompts);
  const sharedSubs = createSharedSubstitutions(prompts.shared);
  const substitutions = {
    ...sharedSubs,
    [PLACEHOLDERS.CAREER_DATA]: careerData,
    [PLACEHOLDERS.CV_TYPE]: config.cvType,
    [PLACEHOLDERS.TYPE_SPECIFIC_INSTRUCTIONS]: substitute(config.fullRebuildInstructions, sharedSubs)
  };
  return substitute(normalize(prompts.shared.templates.fullRebuild), substitutions);
};

export const getIncrementalPrompt = (type: CvType, currentCv: string, diffData: string): string => {
  const prompts = loadPrompts();
  const config = getPromptConfig(type, prompts);
  const sharedSubs = createSharedSubstitutions(prompts.shared);
  const substitutions = {
    ...sharedSubs,
    [PLACEHOLDERS.CURRENT_CV]: currentCv,
    [PLACEHOLDERS.DIFF_DATA]: diffData,
    [PLACEHOLDERS.CV_TYPE]: config.cvType,
    [PLACEHOLDERS.TYPE_SPECIFIC_INSTRUCTIONS]: substitute(config.incrementalInstructions, sharedSubs)
  };
  return substitute(normalize(prompts.shared.templates.incremental), substitutions);
};
