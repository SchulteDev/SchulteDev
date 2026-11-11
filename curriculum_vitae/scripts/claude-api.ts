// claude-api.ts - Claude API integration

import fs from 'fs-extra';
import Anthropic from '@anthropic-ai/sdk';
import {TextBlock} from '@anthropic-ai/sdk/resources';
import type {MessageCreateParamsStreaming} from '@anthropic-ai/sdk/resources/beta/messages';
import {
  API_EFFORT,
  API_MODEL,
  CvType,
  getCvFile,
  getResponseFile,
  MAX_TOKENS,
  MIN_CONTENT_LENGTH
} from './config.js';
import logger from './logger.js';

// Mock response generation
const createMockResponse = (cvType: CvType): void => {
  const responseFile = getResponseFile(cvType);
  if (fs.existsSync(responseFile)) return;

  logger.info(`Creating mock response for ${cvType} CV`);

  const cvFile = getCvFile(cvType);
  let content: string;

  if (fs.pathExistsSync(cvFile)) {
    content = fs.readFileSync(cvFile, 'utf8');
    logger.info(`Using existing ${cvType} CV content`);
  } else {
    content = generateDefaultMockContent();
    logger.info(`Using generic mock for ${cvType} CV`);
  }

  fs.writeJsonSync(responseFile, {
    content: [{type: "text", text: content}]
  }, {spaces: 2});
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

const logClaudeResponse = (response: any, cvType: CvType, userPrompt: string): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = `tmp/claude-response-${cvType}-${timestamp}.json`;
  fs.writeJsonSync(logFile, {
    timestamp: new Date().toISOString(),
    cvType,
    model: API_MODEL,
    request: {
      userPrompt: userPrompt.slice(0, 200) + (userPrompt.length > 200 ? '...' : ''),
      maxTokens: MAX_TOKENS,
      effort: API_EFFORT
    },
    response
  }, {spaces: 2});
  logger.debug(`Claude response logged to ${logFile}`);
};

const shouldUseMock = (): { useMock: boolean; reason: string } => {
  if (process.env.SKIP_API === 'true') {
    return {useMock: true, reason: 'SKIP_API=true'};
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return {useMock: true, reason: 'No API key'};
  }
  return {useMock: false, reason: ''};
};

interface StreamResult {
  content: string;
  usage: any;
  stopReason: string | null;
  servedBy: string | null;
}

export const processApiStream = async (stream: AsyncIterable<any>): Promise<StreamResult> => {
  let completeResponse = '';
  let usage = null;
  let stopReason: string | null = null;
  let servedBy: string | null = null;

  for await (const chunk of stream) {
    if (chunk.type === 'message_start') {
      servedBy = chunk.message?.model ?? null;
    } else if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'fallback') {
      // Server-side fallback: the declined model's partial text is kept and the fallback model continues it
      servedBy = chunk.content_block.to?.model ?? servedBy;
      logger.warn(`${chunk.content_block.from?.model} declined, continuing with ${servedBy}`);
    } else if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      completeResponse += chunk.delta.text;
    } else if (chunk.type === 'message_delta') {
      if (chunk.usage) usage = chunk.usage;
      if (chunk.delta?.stop_reason) stopReason = chunk.delta.stop_reason;
    }
  }

  return { content: completeResponse, usage, stopReason, servedBy };
};

export const createApiRequest = (userPrompt: string): MessageCreateParamsStreaming => ({
  model: API_MODEL,
  max_tokens: MAX_TOKENS,
  messages: [{ role: 'user', content: userPrompt }],
  stream: true,
  // Claude 5.5 models reject budget_tokens; adaptive thinking depth is controlled via effort
  thinking: { type: 'adaptive' },
  output_config: { effort: API_EFFORT },
  // On a safety-classifier refusal, let the API continue on its default fallback model
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default'
});

const saveApiResponse = (response: any, cvType: CvType, userPrompt: string): void => {
  const responseFile = getResponseFile(cvType);
  fs.writeJsonSync(responseFile, response, { spaces: 2 });
  logClaudeResponse(response, cvType, userPrompt);
};

const validateApiResponse = (content: string, stopReason: string | null, cvType: CvType): boolean => {
  if (stopReason === 'refusal') {
    logger.error(`Claude declined the request for ${cvType} CV (stop_reason: refusal)`);
    return false;
  }
  if (stopReason === 'max_tokens') {
    logger.error(`Response for ${cvType} CV was truncated at MAX_TOKENS=${MAX_TOKENS}`);
    return false;
  }
  if (!content?.trim()) {
    logger.error(`Invalid API response for ${cvType} CV: empty response`);
    return false;
  }
  return true;
};

const callApi = async (userPrompt: string, cvType: CvType): Promise<boolean> => {
  logger.info(`Calling Claude ${API_MODEL} API (effort: ${API_EFFORT}) for ${cvType} CV...`);

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const request = createApiRequest(userPrompt);

    logger.debug('Starting streaming response...');
    const stream = await anthropic.beta.messages.create(request);
    const { content: completeResponse, usage, stopReason, servedBy } = await processApiStream(stream);

    if (!validateApiResponse(completeResponse, stopReason, cvType)) {
      return false;
    }
    if (servedBy && servedBy !== API_MODEL) {
      logger.info(`Response for ${cvType} CV was served by ${servedBy}`);
    }

    const response = {
      content: [{ type: 'text', text: completeResponse }],
      usage: usage
    };

    saveApiResponse(response, cvType, userPrompt);

    logger.success(`API response received for ${cvType} CV`);
    logger.debug(`Response length: ${completeResponse.length} chars`);
    return true;
  } catch (error: any) {
    logger.error(`API call failed for ${cvType} CV: ${error.message}`);
    if (error.response) {
      logger.error('Response:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

export const callClaudeApi = async (userPrompt: string, cvType: CvType): Promise<boolean> => {
  const {useMock, reason} = shouldUseMock();

  if (useMock) {
    logger.info(`${reason}, using mock for ${cvType} CV`);
    createMockResponse(cvType);
    return true;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

  return callApi(userPrompt, cvType);
};

const readResponseContent = (responseFile: string, cvType: CvType): string | null => {
  try {
    logger.debug(`Reading response from ${responseFile} for ${cvType} CV`);

    if (!fs.existsSync(responseFile)) {
      logger.error(`Response file not found: ${responseFile}`);
      return null;
    }

    const data = fs.readJsonSync(responseFile);

    if (!data.content?.[0] || data.content[0].type !== 'text') {
      logger.error(`Invalid response content for ${cvType} CV`);
      return null;
    }

    return (data.content[0] as TextBlock).text;
  } catch (error: any) {
    logger.error(`Failed to read response for ${cvType} CV: ${error.message}`);
    if (error instanceof SyntaxError) {
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
    logger.success(`Extracted LuaLaTeX for ${cvType} CV`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to write output file for ${cvType} CV: ${error.message}`);
    return false;
  }
};
