// run-cv-update.js - Main entry point for CV update workflow

import fs from 'fs';
import {
  CREATE_BACKUP,
  CV_FILE,
  isGithubActions,
  RESPONSE_FILE,
  setOutput,
  TEMP_FILE
} from './config.js';
import logger from './logger.js';
import {extractLatex} from './claude-api.js';
import {main as transformFullRebuild} from './transform-full-rebuild.js';
import {main as transformIncremental} from './transform-incremental.js';

// Cleanup function
const cleanup = (tempFile) => {
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
};

// Function to validate LaTeX
const validateLatex = (filePath) => {
  // Check if file exists and is not empty
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    logger.error('Extracted file is empty');
    return false;
  }

  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for required LaTeX elements
  if (!content.includes('\\documentclass')) {
    logger.error('Not a valid LaTeX document (missing \\documentclass)');
    return false;
  }

  if (!content.includes('\\begin{document}')) {
    logger.error('Invalid LaTeX document (missing \\begin{document})');
    return false;
  }

  if (!content.includes('\\end{document}')) {
    logger.error('Invalid LaTeX document (missing \\end{document})');
    return false;
  }

  return true;
};

// Main function
const main = async () => {
  try {
    // Set up cleanup on exit
    process.on('exit', () => cleanup(TEMP_FILE));
    process.on('SIGINT', () => {
      cleanup(TEMP_FILE);
      process.exit(1);
    });
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught exception: ${err.message}`);
      cleanup(TEMP_FILE);
      process.exit(1);
    });

    // Determine mode from GitHub inputs or default
    let mode = 'incremental';
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      mode = process.env.REBUILD_MODE || 'incremental';
    }

    logger.info(`Starting CV update workflow in ${mode} mode...`);

    // Validate mode
    if (mode !== 'incremental' && mode !== 'full_rebuild') {
      logger.error(`Invalid mode: ${mode}. Must be 'incremental' or 'full_rebuild'`);
      process.exit(1);
    }

    // Run the appropriate transformation
    if (mode === 'full_rebuild') {
      // Run full rebuild transformation
      try {
        await transformFullRebuild();
        mode = 'full_rebuild';
        // The full rebuild is complete, continue with processing
      } catch (error) {
        logger.error('Full rebuild transformation failed');
        process.exit(1);
      }
    } else {
      // Clean up any existing response file first
      if (fs.existsSync(RESPONSE_FILE)) {
        fs.unlinkSync(RESPONSE_FILE);
      }

      // Run incremental transformation
      try {
        await transformIncremental();
      } catch (error) {
        logger.error('Incremental transformation failed');
        process.exit(1);
      }

      // Check if response file was created (indicating changes were processed)
      if (fs.existsSync(RESPONSE_FILE) && fs.statSync(RESPONSE_FILE).size > 0) {
        mode = 'incremental';
        logger.info('Response file found, proceeding with processing');
      } else {
        // No response file means no changes to process
        logger.info('No changes to process, skipping validation and compilation');
        if (isGithubActions()) {
          setOutput('mode', 'skip');
        }
        process.exit(0);
      }
    }

    // At this point we only have full_rebuild or incremental with actual changes
    logger.info('Processing response...');

    // Extract and validate LaTeX response
    if (!extractLatex(TEMP_FILE)) {
      logger.error('Failed to extract LaTeX from response');
      process.exit(1);
    }

    // Enhanced validation
    if (!validateLatex(TEMP_FILE)) {
      process.exit(1);
    }

    // Optional backup with error handling
    if (CREATE_BACKUP && fs.existsSync(CV_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `${CV_FILE}.backup.${timestamp}`;
      try {
        fs.copyFileSync(CV_FILE, backupFile);
        logger.info(`Backup created: ${backupFile}`);
      } catch (error) {
        logger.warn('Failed to create backup, continuing without backup');
      }
    }

    // Move to final location with validation
    try {
      fs.renameSync(TEMP_FILE, CV_FILE);
    } catch (error) {
      logger.error(`Failed to move temporary file to final location: ${error.message}`);
      process.exit(1);
    }

    // Cleanup
    if (fs.existsSync(RESPONSE_FILE)) {
      fs.unlinkSync(RESPONSE_FILE);
    }

    logger.success('CV update completed successfully!');
    logger.info(`Mode: ${mode}`);

    // Set outputs for GitHub Actions
    if (isGithubActions()) {
      setOutput('mode', mode);
    }
  } catch (error) {
    logger.error(`Error in CV update: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main().then(() => {
  logger.debug('CV update completed successfully');
}).catch(error => {
  logger.error(`Unhandled error in CV update: ${error.message}`);
  process.exit(1);
});
