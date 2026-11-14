// cv-update.ts - Entry point: regenerate the CVs from the career data

import fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import {consola as logger} from 'consola';
import {
  API_EFFORT,
  API_MODEL,
  CAREER_FILE,
  CV_TYPES_TO_PROCESS,
  type CvType,
  getCvFile,
  SKIP_API
} from './config.ts';
import {getCompleteText, sendPrompt} from './claude.ts';
import {extractBody, toDocument} from './latex.ts';
import {buildPrompt} from './prompts.ts';

/** Turns a prompt into the model's answer, which contains the LaTeX document body */
export type Generator = (prompt: string, cvType: CvType) => Promise<string>;

export const LOG_DIR = 'tmp';

export const claudeGenerator = (client: Pick<Anthropic, 'messages'> = new Anthropic()): Generator =>
  async (prompt, cvType) => {
    logger.info(`Calling Claude ${API_MODEL} (effort: ${API_EFFORT}) for the ${cvType} CV...`);
    const message = await sendPrompt(prompt, client);
    fs.mkdirSync(LOG_DIR, {recursive: true});
    fs.writeFileSync(`${LOG_DIR}/claude-response-${cvType}.json`, JSON.stringify(
      {model: API_MODEL, effort: API_EFFORT, prompt: prompt.length > 200 ? `${prompt.slice(0, 200)}...` : prompt, message}, null, 2));
    return getCompleteText(message);
  };

export const reuseCommittedCv: Generator = async (_prompt, cvType) => fs.readFileSync(getCvFile(cvType), 'utf8');

export const updateCv = async (cvType: CvType, careerData: string, generate: Generator,
                               cvFile = getCvFile(cvType)): Promise<void> => {
  const latex = toDocument(extractBody(await generate(buildPrompt(cvType, careerData), cvType)));
  fs.writeFileSync(cvFile, latex);
  logger.success(`Updated the ${cvType} CV: ${cvFile} (${latex.length} chars)`);
};

const main = async (): Promise<void> => {
  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  if (SKIP_API) logger.info('SKIP_API=true: re-using the committed CVs instead of calling Claude');
  const generate = SKIP_API ? reuseCommittedCv : claudeGenerator();

  for (const cvType of CV_TYPES_TO_PROCESS) {
    await updateCv(cvType, careerData, generate);
  }
};

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
