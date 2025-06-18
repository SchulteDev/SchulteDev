// run-cv-update.ts - Main entry point for CV update workflow

import fs from 'fs';
import {
  CREATE_BACKUP,
  CvType,
  getCvFile,
  getCvTypesToProcess,
  getResponseFile,
  getTempFile,
  isGithubActions,
  setOutput
} from './config.js';
import logger from './logger.js';
import {extractLatex} from './claude-api.js';
import {main as transformFullRebuild} from './transform-full-rebuild.js';
import {main as transformIncremental} from './transform-incremental.js';

// Cleanup function
const cleanup = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  for (const cvType of cvTypesToProcess) {
    const tempFile = getTempFile(cvType);
    const responseFile = getResponseFile(cvType);

    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    if (fs.existsSync(responseFile)) {
      fs.unlinkSync(responseFile);
    }
  }
};

// Function to validate LaTeX
const validateLatex = (filePath: string, cvType: CvType): boolean => {
  // Check if file exists and is not empty
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    logger.error(`Extracted ${cvType} CV file is empty`);
    return false;
  }

  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for required LaTeX elements
  if (!content.includes('\\documentclass')) {
    logger.error(`Not a valid LaTeX document for ${cvType} CV (missing \\documentclass)`);
    return false;
  }

  if (!content.includes('\\begin{document}')) {
    logger.error(`Invalid LaTeX document for ${cvType} CV (missing \\begin{document})`);
    return false;
  }

  if (!content.includes('\\end{document}')) {
    logger.error(`Invalid LaTeX document for ${cvType} CV (missing \\end{document})`);
    return false;
  }

  return true;
};

// Process a single CV type
const processCvType = (cvType: CvType, mode: string): boolean => {
  const tempFile = getTempFile(cvType);
  const cvFile = getCvFile(cvType);
  const responseFile = getResponseFile(cvType);

  logger.info(`Processing ${cvType} CV...`);

  // Check if response file was created (indicating changes were processed)
  if (!fs.existsSync(responseFile) || fs.statSync(responseFile).size === 0) {
    logger.warn(`No response file found for ${cvType} CV, skipping`);
    return false;
  }

  // Extract and validate LaTeX response
  if (!extractLatex(tempFile, cvType)) {
    logger.error(`Failed to extract LaTeX from response for ${cvType} CV`);
    return false;
  }

  // Enhanced validation
  if (!validateLatex(tempFile, cvType)) {
    return false;
  }

  // Optional backup with error handling
  if (CREATE_BACKUP && fs.existsSync(cvFile)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${cvFile}.backup.${timestamp}`;
    try {
      fs.copyFileSync(cvFile, backupFile);
      logger.info(`Backup created for ${cvType} CV: ${backupFile}`);
    } catch (error: unknown) {
      logger.warn(`Failed to create backup for ${cvType} CV, continuing without backup`);
    }
  }

  // Move to final location with validation
  try {
    fs.renameSync(tempFile, cvFile);
    logger.success(`${cvType} CV updated successfully!`);
  } catch (error: any) {
    logger.error(`Failed to move temporary file to final location for ${cvType} CV: ${error.message}`);
    return false;
  }

  // Cleanup response file
  if (fs.existsSync(responseFile)) {
    fs.unlinkSync(responseFile);
  }

  return true;
};

// Main function
const main = async (): Promise<void> => {
  try {
    // Validate CV types selection early
    const cvTypesToProcess = getCvTypesToProcess();
    logger.info(`Selected CV types: ${cvTypesToProcess.join(', ')}`);

    // Ensure tmp directory exists
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('tmp', {recursive: true});
    }

    // Set up cleanup on exit
    process.on('exit', () => cleanup());
    process.on('SIGINT', () => {
      cleanup();
      process.exit(1);
    });
    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught exception: ${err.message}`);
      cleanup();
      process.exit(1);
    });

    // Determine mode from GitHub inputs or default
    let mode: 'incremental' | 'full_rebuild' | 'skip' = 'incremental';
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      mode = (process.env.REBUILD_MODE as 'incremental' | 'full_rebuild') || 'incremental';
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
      } catch (error: unknown) {
        logger.error('Full rebuild transformation failed');
        process.exit(1);
      }
    } else {
      // Clean up any existing response files first
      for (const cvType of cvTypesToProcess) {
        const responseFile = getResponseFile(cvType);
        if (fs.existsSync(responseFile)) {
          fs.unlinkSync(responseFile);
        }
      }

      // Run incremental transformation
      try {
        await transformIncremental();
      } catch (error: unknown) {
        logger.error('Incremental transformation failed');
        process.exit(1);
      }

      // Check if any response files were created (indicating changes were processed)
      let hasAnyResponse = false;
      for (const cvType of cvTypesToProcess) {
        const responseFile = getResponseFile(cvType);
        if (fs.existsSync(responseFile) && fs.statSync(responseFile).size > 0) {
          hasAnyResponse = true;
          break;
        }
      }

      if (hasAnyResponse) {
        mode = 'incremental';
        logger.info('Response files found, proceeding with processing');
      } else {
        // No response files means no changes to process
        logger.info('No changes to process, skipping validation and compilation');
        if (isGithubActions()) {
          setOutput('mode', 'skip');
        }
        process.exit(0);
      }
    }

    // At this point we only have full_rebuild or incremental with actual changes
    logger.info('Processing responses for all CV types...');

    // Process each CV type
    let successCount = 0;
    for (const cvType of cvTypesToProcess) {
      if (processCvType(cvType, mode)) {
        successCount++;
      }
    }

    if (successCount === 0) {
      logger.error('No CV files were successfully processed');
      process.exit(1);
    } else if (successCount < cvTypesToProcess.length) {
      logger.warn(`Only ${successCount}/${cvTypesToProcess.length} CV files were successfully processed`);
    }

    logger.success(`CV update completed successfully! Processed ${successCount}/${cvTypesToProcess.length} CV types`);
    logger.info(`Mode: ${mode}`);

    // Set outputs for GitHub Actions
    if (isGithubActions()) {
      setOutput('mode', mode);
      setOutput('processed_count', successCount.toString());
      setOutput('cv_types', cvTypesToProcess.join(','));
    }
  } catch (error: any) {
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
