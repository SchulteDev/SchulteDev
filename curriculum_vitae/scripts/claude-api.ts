// claude-api.ts - Claude API integration

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {MessageCreateParams, TextBlock} from '@anthropic-ai/sdk/resources';
import {
  API_MODEL,
  CvType,
  getCvFile,
  getResponseFile,
  MAX_TOKENS,
  MIN_CONTENT_LENGTH
} from './config.js';
import logger from './logger.js';

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

// Mock response generation
const createMockResponse = (cvType: CvType): void => {
  const responseFile = getResponseFile(cvType);
  if (fs.existsSync(responseFile)) return;

  logger.info(`Creating mock response for ${cvType} CV`);

  const cvFile = getCvFile(cvType);
  let content: string;

  if (fs.existsSync(cvFile)) {
    content = fs.readFileSync(cvFile, 'utf8');
    logger.info(`Using existing ${cvType} CV content`);
  } else {
    content = generateDefaultMockContent();
    logger.info(`Using generic mock for ${cvType} CV`);
  }

  fs.writeFileSync(responseFile, JSON.stringify({
    content: [{type: "text", text: content}]
  }, null, 2));
};

const generateDefaultMockContent = (): string => `
\\documentclass{article}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{lastpage}
\\begin{document}
\\title{Mock CV}
\\author{Test User}
\\date{\\today}
\\maketitle
\\section{Education}
\\begin{itemize}
\\item PhD Computer Science, Test University, 2020
\\item MS Computer Science, Test University, 2018
\\item BS Computer Science, Test University, 2016
\\end{itemize}
\\section{Experience}
\\begin{itemize}
\\item Senior Developer, Test Company, 2020-Present
\\item Developer, Another Company, 2018-2020
\\item Intern, Yet Another Company, 2016-2018
\\end{itemize}
\\end{document}`.trim();

// API call logic
const shouldUseMock = (): { useMock: boolean; reason: string } => {
  if (process.env.SKIP_API === 'true') {
    return { useMock: true, reason: 'SKIP_API=true' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { useMock: true, reason: 'No API key' };
  }
  return { useMock: false, reason: '' };
};

const callApi = async (systemPrompt: string, userPrompt: string, cvType: CvType): Promise<boolean> => {
  logger.info(`Calling Claude API for ${cvType} CV...`);
  logger.debug(`Model: ${API_MODEL}`);

  try {
    const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});

    const request: MessageCreateParams = {
      model: API_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{role: 'user', content: userPrompt}]
    };

    if (systemPrompt) request.system = systemPrompt;

    const response = await anthropic.messages.create(request);
    const responseFile = getResponseFile(cvType);
    fs.writeFileSync(responseFile, JSON.stringify(response, null, 2));

    if (!response.content?.[0] || (response.content[0].type === 'text' && !response.content[0].text)) {
      logger.error(`Invalid API response for ${cvType} CV:`);
      console.log(JSON.stringify(response).slice(0, 500));
      return false;
    }

    logger.success(`API response received for ${cvType} CV`);
    if (response.content[0].type === 'text') {
      logger.debug(`Response length: ${response.content[0].text.length} chars`);
    }
    return true;
  } catch (error: any) {
    logger.error(`API call failed for ${cvType} CV: ${error.message}`);
    if (error.response) {
      logger.error('Response:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

export const callClaudeApi = async (systemPrompt: string, userPrompt: string, cvType: CvType): Promise<boolean> => {
  const { useMock, reason } = shouldUseMock();

  if (useMock) {
    logger.info(`${reason}, using mock for ${cvType} CV`);
    createMockResponse(cvType);
    return true;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

  return callApi(systemPrompt, userPrompt, cvType);
};

// Content processing
const readResponseContent = (responseFile: string, cvType: CvType): string | null => {
  try {
    logger.debug(`Reading response from ${responseFile} for ${cvType} CV`);
    const data = JSON.parse(fs.readFileSync(responseFile, 'utf8'));

    if (!data.content?.[0] || data.content[0].type !== 'text') {
      logger.error(`Invalid response content for ${cvType} CV`);
      return null;
    }

    return (data.content[0] as TextBlock).text;
  } catch (error: any) {
    logger.error(`Failed to read response for ${cvType} CV: ${error.message}`);
    if (error.code === 'ENOENT') {
      logger.error(`Response file not found: ${responseFile}`);
    } else if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in response file');
    }
    return null;
  }
};

const cleanLatexContent = (text: string, cvType: CvType): string => {
  const originalLength = text.length;

  // Remove thinking blocks and code fences
  text = text.replace(/<(extended_)?thinking>[\s\S]*?<\/(extended_)?thinking>/gi, '');
  text = text.replace(/```(latex)?\n?/gi, '');
  text = text.trim().replace(/\n{3,}/g, '\n\n');

  const cleanedChars = originalLength - text.length;
  if (cleanedChars > 0) {
    logger.debug(`Cleaned ${cleanedChars} chars from ${cvType} CV`);
  }

  return text;
};

const validateContent = (text: string, cvType: CvType): boolean => {
  if (text.length < MIN_CONTENT_LENGTH) {
    logger.error(`Content too short for ${cvType} CV (${text.length} < ${MIN_CONTENT_LENGTH})`);
    return false;
  }
  return true;
};

export const extractLatex = (outputFile: string, cvType: CvType): boolean => {
  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  const responseFile = getResponseFile(cvType);
  const rawText = readResponseContent(responseFile, cvType);
  if (!rawText) return false;

  logger.debug(`Raw response length for ${cvType} CV: ${rawText.length} chars`);

  const cleanedText = cleanLatexContent(rawText, cvType);
  if (!validateContent(cleanedText, cvType)) return false;

  try {
    fs.writeFileSync(outputFile, cleanedText);
    logger.debug(`Wrote ${cleanedText.length} chars to ${outputFile} for ${cvType} CV`);
    logger.success(`Extracted LaTeX for ${cvType} CV`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to write output file for ${cvType} CV: ${error.message}`);
    return false;
  }
};
