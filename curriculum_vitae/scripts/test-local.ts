// test-local.ts - Test CV generation locally

import fs from 'fs-extra';
import {exec} from 'child_process';
import util from 'util';
import dotenv from 'dotenv';
import {CAREER_FILE, getCvFile, getCvTypesToProcess} from './config.js';
import logger from './logger.js';
import { ensureDir } from './file-utils.js';

// Load environment variables from .env file
dotenv.config();
logger.debug('Environment variables loaded from .env file');
logger.debug(`ANTHROPIC_API_KEY loaded: ${!!process.env.ANTHROPIC_API_KEY} (${process.env.ANTHROPIC_API_KEY ? 'length: ' + process.env.ANTHROPIC_API_KEY.length : 'not set'})}`);

// Promisify exec
const execAsync = util.promisify(exec);

// Parse arguments
const args = process.argv.slice(2);
const MODE: 'incremental' | 'full_rebuild' = (args[0] as 'incremental' | 'full_rebuild') || 'incremental';
const SKIP_API: boolean = process.env.SKIP_API === 'true';
const DRY_RUN: boolean = process.env.DRY_RUN === 'true';

// Usage information
const showUsage = (): void => {
  console.log(`
Usage: tsx test-local.ts [mode] [options]

Modes:
  incremental  - Update CV based on changes (default)
  full_rebuild - Rebuild CV from scratch

Environment variables:
  ANTHROPIC_API_KEY - Required for API calls
  CV_TYPES         - Comma-separated CV types to process (default: anti,professional)
                     Examples: "anti" or "professional" or "anti,professional"
  GIT_DIFF_RANGE   - Number of commits to look back for changes (default: 1)
                     Examples: "1", "20", "30" for testing with more history
  SKIP_API=true    - Skip API call, use existing response
  DRY_RUN=true     - Show what would be done without executing
  CREATE_BACKUP=true - Create backup before updating

Examples:
  tsx test-local.ts incremental
  tsx test-local.ts full_rebuild
  CV_TYPES=anti tsx test-local.ts incremental
  CV_TYPES=professional tsx test-local.ts full_rebuild
  GIT_DIFF_RANGE=20 tsx test-local.ts incremental
  SKIP_API=true tsx test-local.ts incremental
  DRY_RUN=true tsx test-local.ts full_rebuild
`);
};

// Check for help
if (args.includes('-h') || args.includes('--help')) {
  showUsage();
  process.exit(0);
}

// Validate mode
if (MODE !== 'incremental' && MODE !== 'full_rebuild') {
  logger.error(`Invalid mode: ${MODE}`);
  showUsage();
  process.exit(1);
}

logger.info(`Running in ${MODE} mode for CV types: ${getCvTypesToProcess().join(', ')}`);

const validateTestPrerequisites = (mode: string): void => {
  if (!fs.existsSync(CAREER_FILE)) {
    logger.error(`Missing prerequisite: ${CAREER_FILE} file`);
    process.exit(1);
  }

  if (mode === 'incremental') {
    const cvTypesToProcess = getCvTypesToProcess();
    for (const cvType of cvTypesToProcess) {
      const cvFile = getCvFile(cvType);
      if (!fs.existsSync(cvFile)) {
        logger.error(`Missing prerequisite: ${cvFile} file for ${cvType} CV`);
        process.exit(1);
      }
    }
  }

  if (!SKIP_API && !process.env.ANTHROPIC_API_KEY) {
    logger.error('Missing prerequisite: ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }
};

const setupTestEnvironment = (): void => {
  process.env.GITHUB_EVENT_NAME ??= 'workflow_dispatch';
  process.env.REBUILD_MODE = MODE;

  // Handle API key logic
  if (!process.env.ANTHROPIC_API_KEY && !process.env.SKIP_API) {
    process.env.SKIP_API = 'true';
    logger.info('No ANTHROPIC_API_KEY found, setting SKIP_API=true for testing');
  } else if (process.env.ANTHROPIC_API_KEY && !process.env.SKIP_API) {
    logger.info(`ANTHROPIC_API_KEY found, will use real API calls`);
  }

  if (!fs.existsSync('tmp')) {
    ensureDir('tmp');
  }

  process.env.GITHUB_OUTPUT = 'tmp/github_output.txt';
  fs.writeFileSync(process.env.GITHUB_OUTPUT, '');
};

const createSubprocessEnvironment = (): Record<string, string | undefined> => ({
  ...process.env,
  GITHUB_EVENT_NAME: 'workflow_dispatch',
  REBUILD_MODE: MODE,
  CV_TYPES: process.env.CV_TYPES ?? getCvTypesToProcess().join(',')
});

const executeCvUpdateWorkflow = async (): Promise<void> => {
  const envVars = createSubprocessEnvironment();

  logger.debug(`Environment: CV_TYPES=${envVars.CV_TYPES}, SKIP_API=${envVars.SKIP_API ?? 'undefined'}, REBUILD_MODE=${envVars.REBUILD_MODE}, HAS_API_KEY=${!!envVars.ANTHROPIC_API_KEY}`);

  try {
    const { stdout, stderr } = await execAsync('tsx run-cv-update.ts', {
      env: envVars,
      cwd: process.cwd()
    });

    logger.debug('CV update workflow completed');
    if (stdout) {
      logger.debug(`stdout: ${stdout.slice(0, 200)}${stdout.length > 200 ? '...' : ''}`);
    }
    if (stderr) {
      logger.debug(`stderr: ${stderr}`);
    }
  } catch (error: any) {
    logger.error(`CV update workflow failed: ${error.message}`);
    if (error.stdout) {
      logger.debug(`stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      logger.debug(`stderr: ${error.stderr}`);
    }
    throw error;
  }
};

const showTestResults = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  for (const cvType of cvTypesToProcess) {
    const cvFile = getCvFile(cvType);
    if (fs.existsSync(cvFile)) {
      const stats = fs.statSync(cvFile);
      logger.info(`${cvType} CV file updated. Size: ${stats.size} bytes`);
      logger.debug(`${cvType} CV last modified: ${stats.mtime}`);
    } else {
      logger.warn(`${cvType} CV file not found: ${cvFile}`);
    }
  }
};

const performDryRun = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  logger.info('DRY RUN - Would execute:');
  console.log(`  1. Run ${MODE} transformation for CV types: ${cvTypesToProcess.join(', ')}`);
  console.log('  2. Validate and apply changes');
  for (const cvType of cvTypesToProcess) {
    const cvFile = getCvFile(cvType);
    console.log(`  3. Update ${cvFile} (${cvType} CV)`);
  }
  process.exit(0);
};

const main = async (): Promise<void> => {
  try {
    logger.debug('Starting test-local.ts');
    logger.debug(`Mode: ${MODE}, Skip API: ${SKIP_API}, Dry Run: ${DRY_RUN}`);

    validateTestPrerequisites(MODE);
    logger.debug('Prerequisites checked');

    setupTestEnvironment();
    logger.debug('Local environment set up');

    if (DRY_RUN) {
      performDryRun();
      return;
    }

    logger.info(`Running CV update workflow in ${MODE} mode for CV types: ${getCvTypesToProcess().join(', ')}...`);

    await executeCvUpdateWorkflow();

    logger.success('Local test completed successfully!');
    showTestResults();

    // Cleanup
    logger.debug('Cleaning up temporary files');
    fs.removeSync('tmp');
    logger.debug('Cleanup completed');
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
};

// Run main
main().then(() => {
  logger.debug('Test local completed successfully');
}).catch(error => {
  logger.error(`Unhandled error in test local: ${error.message}`);
  process.exit(1);
});
