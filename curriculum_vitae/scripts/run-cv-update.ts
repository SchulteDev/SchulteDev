// run-cv-update.ts - Main entry point for CV update workflow

import fs from 'fs-extra';
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
import { hasValidFile, hasResponseFiles as checkResponseFiles, cleanupResponseFiles, safeFileCopy, safeFileMove, safeDelete, ensureDir } from './file-utils.js';

// Cleanup function
const cleanup = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  for (const cvType of cvTypesToProcess) {
    const tempFile = getTempFile(cvType);
    const responseFile = getResponseFile(cvType);

    safeDelete(tempFile);
    safeDelete(responseFile);
  }
};

// Validate LaTeX content
const validateLatex = (filePath: string, cvType: CvType): boolean => {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    logger.error(`${cvType} CV file is empty`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const required = ['\\documentclass', '\\begin{document}', '\\end{document}'];

  for (const element of required) {
    if (!content.includes(element)) {
      logger.error(`${cvType} CV missing ${element}`);
      return false;
    }
  }

  return true;
};

const createBackup = (cvFile: string, cvType: CvType): void => {
  if (!CREATE_BACKUP || !fs.pathExistsSync(cvFile)) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${cvFile}.backup.${timestamp}`;

  safeFileCopy(cvFile, backupFile, `Backup created for ${cvType} CV`);
};

const processCvType = (cvType: CvType): boolean => {
  const tempFile = getTempFile(cvType);
  const cvFile = getCvFile(cvType);
  const responseFile = getResponseFile(cvType);

  logger.info(`Processing ${cvType} CV...`);

  // Check if response file exists
  if (!hasValidFile(responseFile)) {
    logger.warn(`No response file found for ${cvType} CV, skipping`);
    return false;
  }

  // Extract and validate LaTeX
  if (!extractLatex(tempFile, cvType) || !validateLatex(tempFile, cvType)) {
    return false;
  }

  // Create backup and move to final location
  createBackup(cvFile, cvType);

  if (safeFileMove(tempFile, cvFile)) {
    safeDelete(responseFile); // Cleanup
    logger.success(`${cvType} CV updated successfully!`);
    return true;
  } else {
    logger.error(`Failed to finalize ${cvType} CV`);
    return false;
  }
};

const setupCleanupHandlers = (): void => {
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
};

const determineMode = (): 'incremental' | 'full_rebuild' => {
  let mode: 'incremental' | 'full_rebuild' = 'incremental';

  if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
    mode = (process.env.REBUILD_MODE as 'incremental' | 'full_rebuild') || 'incremental';
  }

  if (mode !== 'incremental' && mode !== 'full_rebuild') {
    logger.error(`Invalid mode: ${mode}. Must be 'incremental' or 'full_rebuild'`);
    process.exit(1);
  }

  return mode;
};

const cleanupExistingResponses = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  cleanupResponseFiles(cvTypesToProcess);
};

const hasResponseFiles = (): boolean => {
  const cvTypesToProcess = getCvTypesToProcess();
  return checkResponseFiles(cvTypesToProcess);
};

const executeTransformation = async (mode: 'incremental' | 'full_rebuild'): Promise<'incremental' | 'full_rebuild' | 'skip'> => {
  if (mode === 'full_rebuild') {
    try {
      await transformFullRebuild();
      return 'full_rebuild';
    } catch (error: any) {
      logger.error('Full rebuild transformation failed');
      process.exit(1);
    }
  }

  // Incremental mode
  cleanupExistingResponses();

  try {
    await transformIncremental();
  } catch (error: any) {
    logger.error('Incremental transformation failed');
    process.exit(1);
  }

  if (hasResponseFiles()) {
    logger.info('Response files found, proceeding with processing');
    return 'incremental';
  } else {
    logger.info('No changes to process, skipping validation and compilation');
    return 'skip';
  }
};

const processAllCvTypes = (): number => {
  const cvTypesToProcess = getCvTypesToProcess();
  logger.info(`Processing responses for CV types: ${cvTypesToProcess.join(', ')}...`);

  let successCount = 0;
  for (const cvType of cvTypesToProcess) {
    if (processCvType(cvType)) {
      successCount++;
    }
  }

  if (successCount === 0) {
    logger.error('No CV files were successfully processed');
    process.exit(1);
  } else if (successCount < cvTypesToProcess.length) {
    logger.warn(`Only ${successCount}/${cvTypesToProcess.length} CV files were successfully processed`);
  }

  return successCount;
};

const setGitHubOutputs = (mode: string, successCount?: number): void => {
  if (isGithubActions()) {
    setOutput('mode', mode);
    setOutput('cv_types', getCvTypesToProcess().join(','));
    if (successCount !== undefined) {
      setOutput('processed_count', successCount.toString());
    }
  }
};

const main = async (): Promise<void> => {
  try {
    const cvTypesToProcess = getCvTypesToProcess();
    logger.info(`Selected CV types: ${cvTypesToProcess.join(', ')}`);

    ensureDir('tmp');
    setupCleanupHandlers();

    const requestedMode = determineMode();
    logger.info(`Starting CV update workflow in ${requestedMode} mode for CV types: ${cvTypesToProcess.join(', ')}...`);

    const actualMode = await executeTransformation(requestedMode);
    logger.info(`Mode: ${actualMode}`);

    if (actualMode !== 'skip') {
      const successCount = processAllCvTypes();
      logger.success(`CV update completed successfully! Processed ${successCount}/${cvTypesToProcess.length} CV types`);
      setGitHubOutputs(actualMode, successCount);
    } else {
      setGitHubOutputs(actualMode);
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
