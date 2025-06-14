// claude-api.js - Shared helper for Claude API calls

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {API_MODEL, CAREER_FILE, CV_FILE, DIFF_FILE, MAX_TOKENS, RESPONSE_FILE} from './config.js';
import logger from './logger.js';

export const callClaudeApi = async (systemPrompt, userPrompt) => {
  // Check if we should skip the API call
  if (process.env.SKIP_API === 'true') {
    logger.info('SKIP_API is set to true, skipping API call');

    // Create a mock response file if it doesn't exist
    if (!fs.existsSync(RESPONSE_FILE)) {
      logger.info('Creating mock response file');
      const mockResponse = {
        content: [
          {
            text: "\\documentclass{article}\n\\begin{document}\nMock response for testing\n\\end{document}"
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
    const requestOptions = {
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
    if (!response.content?.[0]?.text) {
      logger.error('Invalid API response:');
      console.log(JSON.stringify(response).slice(0, 500));
      return false;
    }

    logger.success('API response received');
    logger.debug(`Response length: ${response.content[0].text.length} characters`);
    return true;
  } catch (error) {
    logger.error(`API call failed: ${error.message}`);
    if (error.response) {
      logger.error('Response data:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

// Function to extract LaTeX from response
export const extractLatex = (outputFile) => {
  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  try {
    // Read the response file
    logger.debug(`Reading response from ${RESPONSE_FILE}`);
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE, 'utf8'));

    // Extract text
    let text = responseData.content[0].text;
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
  } catch (error) {
    logger.error(`Failed to extract LaTeX: ${error.message}`);
    if (error.code === 'ENOENT') {
      logger.error(`Response file not found: ${RESPONSE_FILE}`);
    } else if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in response file');
    }
    return false;
  }
};

// Function to build system prompt (separate from user content)
const buildSystemPrompt = () => {
  return `You are an expert LaTeX developer specializing in bulletproof document compilation and creative CV design.

## COMPILATION CONSTRAINTS
- Target: GitHub Actions with xu-cheng/latex-action
- Command: pdflatex -pdf -file-line-error -halt-on-error -interaction=nonstopmode
- Zero tolerance for compilation errors or warnings

### Package Safety Rules:
1. Use standard TeXLive packages only
2. Load order: encoding → fonts → layout → content
3. Page numbering: \\usepackage{lastpage} + \\pageref{LastPage}
4. Font safety: \\usepackage[T1]{fontenc} + \\usepackage{lmodern}
5. Symbols: Use proper LaTeX commands (\\heartsuit, \\textbullet)

### Error Prevention:
- No undefined font shapes (avoid T1/cmss/b/n combinations)
- No undefined control sequences
- All symbols in correct mode (math vs text)
- Conservative package selection over fancy features

## DOCUMENT STRUCTURE
Required first page layout:
1. **Prominent Header**: Name, title, contact (visually dominant)
2. **Comprehensive Summary**: Complete document overview
3. Visual hierarchy: Header > Summary > Content
4. Self-contained first page with full context

## OUTPUT REQUIREMENTS
- Return ONLY complete LaTeX code
- No markdown formatting or explanations
- Guaranteed first-attempt compilation success
- Maintain anti-CV humorous tone with professional accuracy
- Do NOT include any thinking tags or explanations in your response`;
};

// Function to build user prompt (content-specific)
export const buildCvPrompt = (mode) => {
  const systemPrompt = buildSystemPrompt();
  let userPrompt = '';

  switch (mode) {
    case 'incremental': {
      if (!fs.existsSync(CV_FILE)) {
        logger.error(`CV file not found: ${CV_FILE}`);
        return {systemPrompt: null, userPrompt: null};
      }
      if (!fs.existsSync(DIFF_FILE)) {
        logger.error(`Diff file not found: ${DIFF_FILE}`);
        return {systemPrompt: null, userPrompt: null};
      }

      userPrompt = `## TASK: Fix LaTeX Errors & Apply Updates

### Current Document (with compilation errors):
\`\`\`latex
${fs.readFileSync(CV_FILE, 'utf8')}
\`\`\`

### Career Updates to Integrate:
\`\`\`diff
${fs.readFileSync(DIFF_FILE, 'utf8')}
\`\`\`

## SPECIFIC FIXES NEEDED:
- Font shape 'T1/cmss/b/n' undefined → Use safe font combinations
- \\lastpage undefined → Use \\pageref{LastPage} with lastpage package
- Any other compilation blockers

Fix all errors while preserving style consistency and integrating the career updates seamlessly.`;
      break;
    }

    case 'full_rebuild': {
      if (!fs.existsSync(CAREER_FILE)) {
        logger.error(`Career file not found: ${CAREER_FILE}`);
        return {systemPrompt: null, userPrompt: null};
      }

      userPrompt = `## TASK: Create Complete Anti-CV from Scratch

### Career Data:
\`\`\`markdown
${fs.readFileSync(CAREER_FILE, 'utf8')}
\`\`\`

Create a complete, bulletproof anti-CV that compiles perfectly and follows the required document structure.`;
      break;
    }

    default:
      logger.error(`Invalid mode: ${mode}`);
      return {systemPrompt: null, userPrompt: null};
  }

  return {systemPrompt, userPrompt};
};
