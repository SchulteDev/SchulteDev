// claude-api.ts - Shared helper for Claude API calls

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

  // Check if we should skip the API call
  if (process.env.SKIP_API === 'true' || !process.env.ANTHROPIC_API_KEY) {
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.info(`ANTHROPIC_API_KEY not set, using mock response for ${cvType} CV`);
    } else {
      logger.info(`SKIP_API is set to true, skipping API call for ${cvType} CV`);
    }

    // Create a mock response file if it doesn't exist
    if (!fs.existsSync(responseFile)) {
      logger.info(`Creating mock response file for ${cvType} CV`);

      // Use actual CV content if available, otherwise use generic mock
      const cvFile = getCvFile(cvType);
      let mockContent: string;

      if (fs.existsSync(cvFile)) {
        // Use existing CV content
        mockContent = fs.readFileSync(cvFile, 'utf8');
        logger.info(`Using existing ${cvType} CV content for mock response`);
      } else {
        // Fallback to generic mock
        mockContent = "\\documentclass{article}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{lastpage}\n\\begin{document}\n\\title{Mock CV for Testing}\n\\author{Test User}\n\\date{\\today}\n\\maketitle\n\\section{Education}\n\\begin{itemize}\n\\item PhD in Computer Science, Test University, 2020\n\\item MS in Computer Science, Test University, 2018\n\\item BS in Computer Science, Test University, 2016\n\\end{itemize}\n\\section{Experience}\n\\begin{itemize}\n\\item Senior Developer, Test Company, 2020-Present\n\\item Developer, Another Company, 2018-2020\n\\item Intern, Yet Another Company, 2016-2018\n\\end{itemize}\n\\end{document}";
        logger.info(`Using generic mock content for ${cvType} CV`);
      }

      const mockResponse = {
        content: [
          {
            type: "text",
            text: mockContent
          }
        ]
      };
      fs.writeFileSync(responseFile, JSON.stringify(mockResponse, null, 2));
    } else {
      logger.info(`Using existing response file for ${cvType} CV`);
    }

    return true;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

  logger.info(`Calling Claude API for ${cvType} CV...`);
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
    fs.writeFileSync(responseFile, JSON.stringify(response, null, 2));

    // Check if response is valid
    if (!response.content?.[0] || (response.content[0].type === 'text' && !(response.content[0]).text)) {
      logger.error(`Invalid API response for ${cvType} CV:`);
      console.log(JSON.stringify(response).slice(0, 500));
      return false;
    }

    logger.success(`API response received for ${cvType} CV`);
    if (response.content[0].type === 'text') {
      logger.debug(`Response length: ${(response.content[0]).text.length} characters`);
    }
    return true;
  } catch (error: any) {
    logger.error(`API call failed for ${cvType} CV: ${error.message}`);
    if (error.response) {
      logger.error('Response data:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

// Function to extract LaTeX from response
export const extractLatex = (outputFile: string, cvType: CvType): boolean => {
  const responseFile = getResponseFile(cvType);

  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  try {
    // Read the response file
    logger.debug(`Reading response from ${responseFile} for ${cvType} CV`);
    const responseData = JSON.parse(fs.readFileSync(responseFile, 'utf8'));

    // Extract text
    if (!responseData.content?.[0] || responseData.content[0].type !== 'text') {
      logger.error(`Invalid response content for ${cvType} CV: not a text block`);
      return false;
    }

    let text = (responseData.content[0] as TextBlock).text;
    logger.debug(`Raw response length for ${cvType} CV: ${text.length} characters`);

    // Clean up the response
    const originalLength = text.length;

    // Remove AI thinking blocks and code markers
    text = text.replace(/<(extended_)?thinking>[\s\S]*?<\/(extended_)?thinking>/gi, '');
    text = text.replace(/```(latex)?\n?/gi, '');

    // Normalize whitespace
    text = text.trim().replace(/\n{3,}/g, '\n\n');

    logger.debug(`Cleaned ${originalLength - text.length} characters from ${cvType} CV response`);

    // Validate content length
    if (text.length < MIN_CONTENT_LENGTH) {
      logger.error(`Extracted content for ${cvType} CV is too short (${text.length} < ${MIN_CONTENT_LENGTH} chars)`);
      return false;
    }

    // Write to output file
    fs.writeFileSync(outputFile, text);
    logger.debug(`Wrote ${text.length} characters to ${outputFile} for ${cvType} CV`);

    logger.success(`Extracted and cleaned LaTeX content for ${cvType} CV`);
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


