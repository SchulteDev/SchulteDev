// claude-api.js - Shared helper for Claude API calls

import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {
  API_MODEL,
  MAX_TOKENS,
  RESPONSE_FILE,
  CV_FILE,
  DIFF_FILE,
  CAREER_FILE
} from './config.js';
import {
  logInfo,
  logSuccess,
  logError,
  logDebug
} from './logger.js';

// Function to make Claude API call
export const callClaudeApi = async (prompt) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    logError('ANTHROPIC_API_KEY not set');
    return false;
  }

  if (!prompt) {
    logError('No prompt provided');
    return false;
  }

  logInfo('Calling Claude API...');
  logDebug(`Using model: ${API_MODEL}`);

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
      logError('Invalid API response:');
      console.log(JSON.stringify(response).slice(0, 500));
      return false;
    }

    logSuccess('API response received');
    logDebug(`Response length: ${response.content[0].text.length} characters`);
    return true;
  } catch (error) {
    logError(`API call failed: ${error.message}`);
    if (error.response) {
      logError('Response data:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

// Function to extract LaTeX from response
export const extractLatex = (outputFile) => {
  if (!outputFile) {
    logError('No output file specified');
    return false;
  }

  try {
    // Read the response file
    logDebug(`Reading response from ${RESPONSE_FILE}`);
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE, 'utf8'));

    // Extract text
    let text = responseData.content[0].text;
    logDebug(`Raw response length: ${text.length} characters`);

    // Remove extended_thinking tags and content
    const originalLength = text.length;
    text = text.replace(/<extended_thinking>[\s\S]*?<\/extended_thinking>/g, '');
    logDebug(`Removed ${originalLength - text.length} characters of extended thinking`);

    // Remove code block markers
    text = text.replace(/```latex\n/g, '').replace(/```\n/g, '').replace(/```/g, '');

    // Remove empty lines
    text = text.split('\n').filter(line => line.trim() !== '').join('\n');

    // Write to output file
    fs.writeFileSync(outputFile, text);
    logDebug(`Wrote ${text.length} characters to ${outputFile}`);

    logSuccess('Extracted LaTeX and removed any code block markers');
    return true;
  } catch (error) {
    logError(`Failed to extract LaTeX: ${error.message}`);
    if (error.code === 'ENOENT') {
      logError(`Response file not found: ${RESPONSE_FILE}`);
    } else if (error instanceof SyntaxError) {
      logError('Invalid JSON in response file');
    }
    return false;
  }
};

// Function to build CV prompt
export const buildCvPrompt = (mode) => {
  let prompt = '';

  const baseInstructions = 'You are an expert LaTeX document designer and professional CV writer.';

  const latexCompatibilityRules = `
**GitHub Actions LaTeX Requirements:**
- This document will be compiled automatically in GitHub Actions using xu-cheng/latex-action
- Use modern, widely-supported packages available in standard TeXLive distributions
- Ensure compatibility with automated compilation environments (no interactive prompts)
- Use robust package combinations that work reliably in Docker containers
- Follow proper package loading order for consistent compilation
- Avoid experimental or cutting-edge packages that might not be available
- Generate LaTeX that compiles successfully with: pdflatex -pdf -file-line-error -halt-on-error -interaction=nonstopmode
- Ensure all fonts and dependencies are commonly available in CI environments
- Use packages that handle encoding and internationalization properly`;

  const commonInstructions = `
**Instructions:**
1. Use extended thinking to analyze and plan the optimal document
2. Maintain the humorous anti-CV tone with heart-stab (♡) and squiggly arrow (↝) symbols
3. Ensure professional information is accurately incorporated
4. Apply modern LaTeX best practices for typography and design
5. Ensure excellent visual hierarchy and readability
6. Optimize LaTeX formatting for visual appeal
7. Generate LaTeX optimized for automated GitHub Actions compilation
${latexCompatibilityRules}

**Requirements:**
- Return ONLY the complete LaTeX document code
- No explanations or markdown formatting
- Ensure robust compilation in GitHub Actions CI/CD environment
- Use battle-tested package combinations suitable for automated processing
- Optimize for xu-cheng/latex-action compilation pipeline
- Make it the best possible anti-CV design
- Do NOT include any thinking process or explanations in your response`;

  switch (mode) {
    case 'incremental': {
      if (!fs.existsSync(CV_FILE)) {
        logError(`CV file not found: ${CV_FILE}`);
        return null;
      }
      if (!fs.existsSync(DIFF_FILE)) {
        logError(`Diff file not found: ${DIFF_FILE}`);
        return null;
      }

      prompt = `${baseInstructions} I need you to transform career updates into a high-quality anti-CV format.

**Current LaTeX document:**
\`\`\`latex
${fs.readFileSync(CV_FILE, 'utf8')}
\`\`\`

**Career changes detected:**
\`\`\`diff
${fs.readFileSync(DIFF_FILE, 'utf8')}
\`\`\`

${commonInstructions}
- Maintain consistency with existing styling

Please think through this carefully and produce the highest quality CV possible.`;
      break;
    }

    case 'full_rebuild': {
      if (!fs.existsSync(CAREER_FILE)) {
        logError(`Career file not found: ${CAREER_FILE}`);
        return null;
      }

      prompt = `${baseInstructions} I need you to create a complete anti-CV from scratch using the provided career information.

**Complete career information:**
\`\`\`markdown
${fs.readFileSync(CAREER_FILE, 'utf8')}
\`\`\`

**Instructions:**
1. Create a COMPLETE anti-CV LaTeX document from scratch
${commonInstructions}
- Include \\documentclass and all necessary setup

Please create the highest quality complete anti-CV possible.`;
      break;
    }

    default:
      logError(`Invalid mode: ${mode}`);
      return null;
  }

  return prompt;
};
