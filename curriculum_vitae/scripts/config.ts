// config.ts - Settings from the environment (and a local .env file)

import 'dotenv/config';
import {z} from 'zod';
import type {OutputConfig} from '@anthropic-ai/sdk/resources';

export const ALL_CV_TYPES = ['professional', 'anti'] as const;
export type CvType = typeof ALL_CV_TYPES[number];

export const API_EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const satisfies
  readonly NonNullable<OutputConfig['effort']>[];

const EnvSchema = z.object({
  CAREER_FILE: z.string().default('../../_data/career.md'),
  API_MODEL: z.string().default('claude-sonnet-5-5'),
  API_EFFORT: z.enum(API_EFFORT_LEVELS).default('xhigh'),
  // Shared by thinking and the LaTeX output
  MAX_TOKENS: z.coerce.number().positive().default(64000),
  CV_TYPES: z.string().default(ALL_CV_TYPES.join(','))
    .transform(value => value.split(',').map(type => type.trim()))
    .pipe(z.array(z.enum(ALL_CV_TYPES)).min(1)),
  // Re-use the committed CVs instead of calling Claude: a free end-to-end run of the pipeline
  SKIP_API: z.stringbool().default(false),
});

// GitHub Actions passes unset workflow_dispatch inputs (e.g. on push) as empty strings: treat them as unset
const definedEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''));
const env = EnvSchema.parse(definedEnv);

export const CAREER_FILE = env.CAREER_FILE;
export const API_MODEL = env.API_MODEL;
export const API_EFFORT = env.API_EFFORT;
export const MAX_TOKENS = env.MAX_TOKENS;
export const CV_TYPES_TO_PROCESS = env.CV_TYPES;
export const SKIP_API = env.SKIP_API;

export const getCvFile = (cvType: CvType): string => `../markus-schulte-dev-${cvType}-cv.tex`;
