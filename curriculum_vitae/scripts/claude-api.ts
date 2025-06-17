// claude-api.ts - Shared helper for Claude API calls

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {MessageCreateParams, TextBlock} from '@anthropic-ai/sdk/resources';
import {API_MODEL, MAX_TOKENS, RESPONSE_FILE} from './config.js';
import logger from './logger.js';

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export const callClaudeApi = async (systemPrompt: string, userPrompt: string): Promise<boolean> => {
  // Check if we should skip the API call
  if (process.env.SKIP_API === 'true') {
    logger.info('SKIP_API is set to true, skipping API call');

    // Create a mock response file if it doesn't exist
    if (!fs.existsSync(RESPONSE_FILE)) {
      logger.info('Creating mock response file');
      const mockResponse = {
        content: [
          {
            type: "text",
            text: "\\documentclass{article}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{lastpage}\n\\begin{document}\n\\title{Mock CV for Testing}\n\\author{Test User}\n\\date{\\today}\n\\maketitle\n\\section{Education}\n\\begin{itemize}\n\\item PhD in Computer Science, Test University, 2020\n\\item MS in Computer Science, Test University, 2018\n\\item BS in Computer Science, Test University, 2016\n\\end{itemize}\n\\section{Experience}\n\\begin{itemize}\n\\item Senior Developer, Test Company, 2020-Present\n\\item Developer, Another Company, 2018-2020\n\\item Intern, Yet Another Company, 2016-2018\n\\end{itemize}\n\\end{document}"
          }
        ]
      };
      fs.writeFileSync(RESPONSE_FILE, JSON.stringify(mockResponse, null, 2));
    } else {
      logger.info('Using existing response file');
    }

    return true;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error('ANTHROPIC_API_KEY not set');
    return false;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

  logger.info('Calling Claude API...');
  logger.debug(`Using model: ${API_MODEL}`);

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Prepare the API request with proper structure
    const requestOptions: MessageCreateParams = {
      model: API_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestOptions.system = systemPrompt;
    }

    // Make API call
    const response = await anthropic.messages.create(requestOptions);

    // Save response to file
    fs.writeFileSync(RESPONSE_FILE, JSON.stringify(response, null, 2));

    // Check if response is valid
    if (!response.content?.[0] || (response.content[0].type === 'text' && !(response.content[0]).text)) {
      logger.error('Invalid API response:');
      console.log(JSON.stringify(response).slice(0, 500));
      return false;
    }

    logger.success('API response received');
    if (response.content[0].type === 'text') {
      logger.debug(`Response length: ${(response.content[0]).text.length} characters`);
    }
    return true;
  } catch (error: any) {
    logger.error(`API call failed: ${error.message}`);
    if (error.response) {
      logger.error('Response data:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

// Function to extract LaTeX from response
export const extractLatex = (outputFile: string): boolean => {
  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  try {
    // Read the response file
    logger.debug(`Reading response from ${RESPONSE_FILE}`);
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE, 'utf8'));

    // Extract text
    if (!responseData.content?.[0] || responseData.content[0].type !== 'text') {
      logger.error('Invalid response content: not a text block');
      return false;
    }

    let text = (responseData.content[0] as TextBlock).text;
    logger.debug(`Raw response length: ${text.length} characters`);

    // Clean up the response more thoroughly
    const originalLength = text.length;

    // Remove thinking tags and content (multiple variations)
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    text = text.replace(/<extended_thinking>[\s\S]*?<\/extended_thinking>/gi, '');

    // Remove code block markers
    text = text.replace(/```latex\n?/gi, '');
    text = text.replace(/```\n?/g, '');

    // Remove any leading/trailing whitespace and normalize line endings
    text = text.trim();

    // Remove excessive empty lines (more than 2 consecutive)
    text = text.replace(/\n{3,}/g, '\n\n');

    logger.debug(`Cleaned ${originalLength - text.length} characters from response`);

    // Validate that we still have content
    if (text.length < 100) {
      logger.error('Extracted content is too short, possible over-cleaning');
      return false;
    }

    // Write to output file
    fs.writeFileSync(outputFile, text);
    logger.debug(`Wrote ${text.length} characters to ${outputFile}`);

    logger.success('Extracted and cleaned LaTeX content');
    return true;
  } catch (error: any) {
    logger.error(`Failed to extract LaTeX: ${error.message}`);
    if (error.code === 'ENOENT') {
      logger.error(`Response file not found: ${RESPONSE_FILE}`);
    } else if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in response file');
    }
    return false;
  }
};


