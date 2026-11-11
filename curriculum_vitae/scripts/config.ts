// config.ts - Central configuration for CV generation scripts

import fs from 'fs-extra';
import {z} from 'zod';
import * as core from '@actions/core';
import 'dotenv/config'; // Automatically load .env file

// Zod schema for environment variables
// GitHub Actions passes unset workflow_dispatch inputs (e.g. on push) as empty strings
const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);

export const API_EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
export type ApiEffort = typeof API_EFFORT_LEVELS[number];

const EnvSchema = z.object({
  CAREER_FILE: z.string().default('../../_data/career.md'),
  API_MODEL: z.preprocess(emptyToUndefined, z.string().default('claude-sonnet-5-5')),
  // Thinking depth for adaptive thinking (Claude 5.5 models no longer accept budget_tokens)
  API_EFFORT: z.preprocess(emptyToUndefined, z.enum(API_EFFORT_LEVELS).default('xhigh')),
  // Upper bound for thinking + LaTeX output; requests are streamed, so a high ceiling is safe
  MAX_TOKENS: z.coerce.number().positive().default(64000),
  MIN_CONTENT_LENGTH: z.coerce.number().positive().default(500),
  GIT_DIFF_RANGE: z.coerce.number().positive().default(1),
  CREATE_BACKUP: z.coerce.boolean().default(false),
  CV_TYPES: z.string().default('professional,anti'),
  CI: z.coerce.boolean().default(false),
});

const env = EnvSchema.parse(process.env);

// File paths
export const CAREER_FILE: string = env.CAREER_FILE;
export const PROFESSIONAL_CV_FILE: string = '../markus-schulte-dev-professional-cv.tex';
export const ANTI_CV_FILE: string = '../markus-schulte-dev-anti-cv.tex';
export const DIFF_FILE: string = 'tmp/career_changes.diff';

// API Configuration
export const API_MODEL: string = env.API_MODEL;
export const API_EFFORT: ApiEffort = env.API_EFFORT;
export const MAX_TOKENS: number = env.MAX_TOKENS;
export const MIN_CONTENT_LENGTH: number = env.MIN_CONTENT_LENGTH;

// Git diff range for incremental updates
export const GIT_DIFF_RANGE: number = env.GIT_DIFF_RANGE;

export type CvType = 'professional' | 'anti';

export const CREATE_BACKUP: boolean = env.CREATE_BACKUP;

export const getCvFile = (cvType: CvType): string =>
  cvType === 'professional' ? PROFESSIONAL_CV_FILE : ANTI_CV_FILE;

export const getResponseFile = (cvType: CvType): string =>
  `tmp/response_${cvType}.json`;

export const getTempFile = (cvType: CvType): string =>
  `tmp/temp_${cvType}.tex`;

export const getCvTypesToProcess = (): CvType[] => {
  return env.CV_TYPES.split(',').map(type => type.trim()) as CvType[];
};

export const isGithubActions = (): boolean => env.CI;

export const setOutput = (name: string, value: string): void => {
  if (isGithubActions()) {
    core.setOutput(name, value);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};

export const ensureDirectories = (): void => {
  fs.ensureDirSync('tmp');
};
