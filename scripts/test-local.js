// test-local.js - Test CV generation locally

import fs from 'fs';
import {exec} from 'child_process';
import util from 'util';
import dotenv from 'dotenv';
import {CAREER_FILE, CV_FILE} from './config.js';
import logger from './logger.js';

// Load environment variables from .env file
dotenv.config();
logger.debug('Environment variables loaded from .env file');

// Promisify exec
const execAsync = util.promisify(exec);

// Parse arguments
const args = process.argv.slice(2);
const MODE = args[0] || 'incremental';
const SKIP_API = process.env.SKIP_API === 'true';
const DRY_RUN = process.env.DRY_RUN === 'true';

// Usage information
const showUsage = () => {
  console.log(`
Usage: node scripts/test-local.js [mode] [options]

Modes:
  incremental  - Update CV based on changes (default)
  full_rebuild - Rebuild CV from scratch

Environment variables:
  ANTHROPIC_API_KEY - Required for API calls
  SKIP_API=true    - Skip API call, use existing response
  DRY_RUN=true     - Show what would be done without executing
  CREATE_BACKUP=true - Create backup before updating

Examples:
  node scripts/test-local.js incremental
  node scripts/test-local.js full_rebuild
  SKIP_API=true node scripts/test-local.js incremental
  DRY_RUN=true node scripts/test-local.js full_rebuild
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

logger.info(`Running in ${MODE} mode`);

// Check prerequisites
const checkPrerequisites = async () => {
  if (!fs.existsSync(CAREER_FILE)) {
    logger.error(`Missing prerequisite: ${CAREER_FILE} file`);
    process.exit(1);
  }

  if (MODE === 'incremental' && !fs.existsSync(CV_FILE)) {
    logger.error(`Missing prerequisite: ${CV_FILE} file`);
    process.exit(1);
  }

  if (SKIP_API !== true && !process.env.ANTHROPIC_API_KEY) {
    logger.error('Missing prerequisite: ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }
};

// Simulate GitHub environment
const setupLocalEnv = () => {
  process.env.GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME || 'workflow_dispatch';
  process.env.REBUILD_MODE = MODE;

  // Create temp directory for outputs
  if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp', {recursive: true});
  }
  process.env.GITHUB_OUTPUT = 'tmp/github_output.txt';
  fs.writeFileSync(process.env.GITHUB_OUTPUT, '');
};

// Main execution
const main = async () => {
  try {
    logger.debug('Starting test-local.js');
    logger.debug(`Mode: ${MODE}, Skip API: ${SKIP_API}, Dry Run: ${DRY_RUN}`);

    await checkPrerequisites();
    logger.debug('Prerequisites checked');

    setupLocalEnv();
    logger.debug('Local environment set up');

    if (DRY_RUN) {
      logger.info('DRY RUN - Would execute:');
      console.log(`  1. Run ${MODE} transformation`);
      console.log('  2. Validate and apply changes');
      console.log(`  3. Update ${CV_FILE}`);
      process.exit(0);
    }

    // Run the CV update workflow
    logger.info(`Running CV update workflow in ${MODE} mode...`);
    const {stdout, stderr} = await execAsync('node scripts/run-cv-update.js');
    logger.debug('CV update workflow completed');
    logger.debug(`stdout: ${stdout.slice(0, 200)}${stdout.length > 200 ? '...' : ''}`);

    if (stderr) {
      logger.debug(`stderr: ${stderr}`);
    }

    logger.success('Local test completed successfully!');

    // Show what changed
    if (fs.existsSync(CV_FILE)) {
      const stats = fs.statSync(CV_FILE);
      logger.info(`CV file updated. Size: ${stats.size} bytes`);
      logger.debug(`Last modified: ${stats.mtime}`);
    }

    // Cleanup
    logger.debug('Cleaning up temporary files');
    fs.rmSync('tmp', {recursive: true, force: true});
    logger.debug('Cleanup completed');
  } catch (error) {
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
