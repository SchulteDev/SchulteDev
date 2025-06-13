// claude-api.js - Shared helper for Claude API calls

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {API_MODEL, CAREER_FILE, CV_FILE, DIFF_FILE, MAX_TOKENS, RESPONSE_FILE} from './config.js';
import logger from './logger.js';

// Function to make Claude API call
export const callClaudeApi = async (prompt) => {
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

  if (!prompt) {
    logger.error('No prompt provided');
    return false;
  }

  logger.info('Calling Claude API...');
  logger.debug(`Using model: ${API_MODEL}`);

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Make API call
    const response = await anthropic.messages.create({
      model: API_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

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

    // Remove extended_thinking tags and content
    const originalLength = text.length;
    text = text.replace(/<extended_thinking>[\s\S]*?<\/extended_thinking>/g, '');
    logger.debug(`Removed ${originalLength - text.length} characters of extended thinking`);

    // Remove code block markers
    text = text.replace(/```latex\n/g, '').replace(/```\n/g, '').replace(/```/g, '');

    // Remove empty lines
    text = text.split('\n').filter(line => line.trim() !== '').join('\n');

    // Write to output file
    fs.writeFileSync(outputFile, text);
    logger.debug(`Wrote ${text.length} characters to ${outputFile}`);

    logger.success('Extracted LaTeX and removed any code block markers');
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

// Function to build CV prompt
export const buildCvPrompt = (mode) => {
  let prompt = '';

  const baseInstructions = 'You are an expert LaTeX document designer and professional CV writer.';

  const latexCompatibilityRules = `
**Critical LaTeX Compilation Requirements:**
- This document MUST compile successfully in GitHub Actions using xu-cheng/latex-action
- Use ONLY packages available in standard TeXLive distributions
- Ensure ZERO compilation errors or warnings that could halt the build
- Generate LaTeX that compiles with: pdflatex -pdf -file-line-error -halt-on-error -interaction=nonstopmode

**Package Usage Rules:**
- Load packages in correct order to avoid conflicts
- Use \\usepackage{lastpage} for page numbering and reference with \\pageref{LastPage} (not \\lastpage)
- For fonts: stick to standard font families (avoid custom font shapes that may be undefined)
- Use \\usepackage[T1]{fontenc} for proper font encoding
- Include \\usepackage{lmodern} for better font rendering if using sans-serif fonts
- Test all symbol usage (heart, arrows) with proper math mode or symbol packages

**Robust Footer Implementation:**
- For page numbering use: \\rfoot{Page \\thepage\\ of \\pageref{LastPage}}
- Ensure proper spacing with \\ instead of direct spaces
- Load fancyhdr package BEFORE setting page styles

**Font and Style Safety:**
- Use standard font combinations that exist in all TeXLive installations
- Avoid bold sans-serif combinations that may not exist (like T1/cmss/b/n)
- Use \\textbf{} for bold text instead of relying on font shape definitions
- Include font packages like lmodern or latin1 for better compatibility

**Symbol and Special Character Handling:**
- Use proper LaTeX commands for symbols (\\heartsuit, \\rightsquigarrow)
- Ensure all symbols are in appropriate modes (math mode for mathematical symbols)
- Test unicode compatibility with inputenc package

**Error Prevention:**
- Avoid undefined control sequences by using standard LaTeX commands
- Include proper package dependencies for all features used
- Use defensive programming - check that all referenced labels exist
- Generate LaTeX that has been tested for common compilation pitfalls`;

  const commonInstructions = `
**Instructions:**
1. Use extended thinking to analyze and plan the optimal document structure
2. Maintain the humorous anti-CV tone with proper symbol usage
3. Ensure professional information is accurately incorporated
4. Apply modern LaTeX best practices with bulletproof compilation
5. Prioritize ZERO compilation errors over fancy features
6. Generate LaTeX that will compile successfully in automated environments
7. Use conservative, well-tested package combinations

**Critical Success Criteria:**
- Document MUST compile without errors in GitHub Actions CI/CD
- Use only standard, widely-available LaTeX packages
- Implement robust error-free page numbering with lastpage package
- Ensure all fonts and symbols render correctly across different systems
- Generate clean, maintainable LaTeX code
- Test all package interactions for compatibility

**Response Format:**
- Return ONLY the complete LaTeX document code
- No explanations, markdown formatting, or commentary
- Ensure the LaTeX will compile successfully on first attempt
- Focus on reliability and compatibility over advanced features
- Make it the best possible anti-CV that actually compiles`;

  switch (mode) {
    case 'incremental': {
      if (!fs.existsSync(CV_FILE)) {
        logger.error(`CV file not found: ${CV_FILE}`);
        return null;
      }
      if (!fs.existsSync(DIFF_FILE)) {
        logger.error(`Diff file not found: ${DIFF_FILE}`);
        return null;
      }

      prompt = `${baseInstructions} I need you to fix LaTeX compilation issues and transform career updates into a high-quality anti-CV format.

**Current LaTeX document (has compilation errors):**
\`\`\`latex
${fs.readFileSync(CV_FILE, 'utf8')}
\`\`\`

**Career changes detected:**
\`\`\`diff
${fs.readFileSync(DIFF_FILE, 'utf8')}
\`\`\`

**CRITICAL: Fix these specific issues:**
- Font shape 'T1/cmss/b/n' undefined error
- Undefined control sequence \\lastpage error
- Any other compilation issues that would prevent successful PDF generation

${latexCompatibilityRules}

${commonInstructions}
- Maintain consistency with existing styling while fixing all compilation errors
- Prioritize successful compilation over preserving exact formatting

Please fix all LaTeX errors and produce a compilation-ready CV.`;
      break;
    }

    case 'full_rebuild': {
      if (!fs.existsSync(CAREER_FILE)) {
        logger.error(`Career file not found: ${CAREER_FILE}`);
        return null;
      }

      prompt = `${baseInstructions} I need you to create a complete, compilation-safe anti-CV from scratch.

**Complete career information:**
\`\`\`markdown
${fs.readFileSync(CAREER_FILE, 'utf8')}
\`\`\`

${latexCompatibilityRules}

${commonInstructions}
- Include \\documentclass and all necessary setup
- Build from scratch with compilation safety as top priority
- Use only proven, standard LaTeX patterns

Please create a complete anti-CV that compiles perfectly on first attempt.`;
      break;
    }

    default:
      logger.error(`Invalid mode: ${mode}`);
      return null;
  }

  return prompt;
};
