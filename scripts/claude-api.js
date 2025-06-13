// claude-api.js - Shared helper for Claude API calls

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {
  API_MODEL,
  CAREER_FILE,
  CV_FILE,
  DIFF_FILE,
  MAX_TOKENS,
  RESPONSE_FILE
} from './config.js';
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
    logger.debug(
        `Response length: ${response.content[0].text.length} characters`);
    return true;
  } catch (error) {
    logger.error(`API call failed: ${error.message}`);
    if (error.response) {
      logger.error('Response data:',
          JSON.stringify(error.response).slice(0, 500));
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
    text = text.replace(/<extended_thinking>[\s\S]*?<\/extended_thinking>/g,
        '');
    logger.debug(`Removed ${originalLength
    - text.length} characters of extended thinking`);

    // Remove code block markers
    text = text.replace(/```latex\n/g, '').replace(/```\n/g, '').replace(/```/g,
        '');

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

  const systemContext = `You are an expert LaTeX developer specializing in bulletproof document compilation and creative CV design.

<thinking>
Claude 4 Opus has excellent reasoning about LaTeX compilation issues and can better understand structured requirements. Focus on clear constraints and desired outcomes rather than verbose explanations.
</thinking>`;

  const compilationRequirements = `## COMPILATION CONSTRAINTS
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
- Conservative package selection over fancy features`;

  const documentStructure = `## DOCUMENT STRUCTURE
Required first page layout:
1. **Prominent Header**: Name, title, contact (visually dominant)
2. **Comprehensive Summary**: Complete document overview
3. Visual hierarchy: Header > Summary > Content
4. Self-contained first page with full context`;

  const taskInstructions = `## OUTPUT REQUIREMENTS
- Return ONLY complete LaTeX code
- No markdown formatting or explanations
- Guaranteed first-attempt compilation success
- Maintain anti-CV humorous tone with professional accuracy
- Use <thinking> tags for your reasoning process`;

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

      prompt = `${systemContext}

## TASK: Fix LaTeX Errors & Apply Updates

### Current Document (with compilation errors):
\`\`\`latex
${fs.readFileSync(CV_FILE, 'utf8')}
\`\`\`

### Career Updates to Integrate:
\`\`\`diff
${fs.readFileSync(DIFF_FILE, 'utf8')}
\`\`\`

${compilationRequirements}

${documentStructure}

## SPECIFIC FIXES NEEDED:
- Font shape 'T1/cmss/b/n' undefined → Use safe font combinations
- \\lastpage undefined → Use \\pageref{LastPage} with lastpage package
- Any other compilation blockers

${taskInstructions}

Fix all errors while preserving style consistency and integrating the career updates seamlessly.`;
      break;
    }

    case 'full_rebuild': {
      if (!fs.existsSync(CAREER_FILE)) {
        logger.error(`Career file not found: ${CAREER_FILE}`);
        return null;
      }

      prompt = `${systemContext}

## TASK: Create Complete Anti-CV from Scratch

### Career Data:
\`\`\`markdown
${fs.readFileSync(CAREER_FILE, 'utf8')}
\`\`\`

${compilationRequirements}

${documentStructure}

${taskInstructions}

Create a complete, bulletproof anti-CV that compiles perfectly and follows the required document structure.`;
      break;
    }

    default:
      logger.error(`Invalid mode: ${mode}`);
      return null;
  }

  return prompt;
};
