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

export const callClaudeApi = async (systemPrompt: string, userPrompt: string, cvType: CvType): Promise<boolean> => {
  const responseFile = getResponseFile(cvType);

  if (process.env.SKIP_API === 'true' || !process.env.ANTHROPIC_API_KEY) {
    const reason = !process.env.ANTHROPIC_API_KEY ? 'No API key' : 'SKIP_API=true';
    logger.info(`${reason}, using mock for ${cvType} CV`);

    if (!fs.existsSync(responseFile)) {
      logger.info(`Creating mock response for ${cvType} CV`);
      const cvFile = getCvFile(cvType);
      let content: string;

      if (fs.existsSync(cvFile)) {
        content = fs.readFileSync(cvFile, 'utf8');
        logger.info(`Using existing ${cvType} CV content`);
      } else {
        content = "\\documentclass{article}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{lastpage}\n\\begin{document}\n\\title{Mock CV}\n\\author{Test User}\n\\date{\\today}\n\\maketitle\n\\section{Education}\n\\begin{itemize}\n\\item PhD Computer Science, Test University, 2020\n\\item MS Computer Science, Test University, 2018\n\\item BS Computer Science, Test University, 2016\n\\end{itemize}\n\\section{Experience}\n\\begin{itemize}\n\\item Senior Developer, Test Company, 2020-Present\n\\item Developer, Another Company, 2018-2020\n\\item Intern, Yet Another Company, 2016-2018\n\\end{itemize}\n\\end{document}";
        logger.info(`Using generic mock for ${cvType} CV`);
      }

      fs.writeFileSync(responseFile, JSON.stringify({
        content: [{type: "text", text: content}]
      }, null, 2));
    } else {
      logger.info(`Using existing response for ${cvType} CV`);
    }
    return true;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

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

export const extractLatex = (outputFile: string, cvType: CvType): boolean => {
  const responseFile = getResponseFile(cvType);

  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  try {
    logger.debug(`Reading response from ${responseFile} for ${cvType} CV`);
    const data = JSON.parse(fs.readFileSync(responseFile, 'utf8'));

    if (!data.content?.[0] || data.content[0].type !== 'text') {
      logger.error(`Invalid response content for ${cvType} CV`);
      return false;
    }

    let text = (data.content[0] as TextBlock).text;
    logger.debug(`Raw response length for ${cvType} CV: ${text.length} chars`);

    const originalLength = text.length;

    // Clean response
    text = text.replace(/<(extended_)?thinking>[\s\S]*?<\/(extended_)?thinking>/gi, '');
    text = text.replace(/```(latex)?\n?/gi, '');
    text = text.trim().replace(/\n{3,}/g, '\n\n');

    logger.debug(`Cleaned ${originalLength - text.length} chars from ${cvType} CV`);

    if (text.length < MIN_CONTENT_LENGTH) {
      logger.error(`Content too short for ${cvType} CV (${text.length} < ${MIN_CONTENT_LENGTH})`);
      return false;
    }

    fs.writeFileSync(outputFile, text);
    logger.debug(`Wrote ${text.length} chars to ${outputFile} for ${cvType} CV`);
    logger.success(`Extracted LaTeX for ${cvType} CV`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to extract LaTeX for ${cvType} CV: ${error.message}`);
    if (error.code === 'ENOENT') {
      logger.error(`Response file not found: ${responseFile}`);
    } else if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in response file');
    }
    return false;
  }
};
