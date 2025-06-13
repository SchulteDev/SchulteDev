// logger.js - Enhanced logging with Winston

import winston from 'winston';

// Get DEBUG setting directly from environment to avoid circular dependency
const DEBUG = process.env.DEBUG === 'true';

// Define custom log format with emojis
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  let emoji = '';

  // Add emoji based on log level
  switch (level) {
    case 'info':
      emoji = 'ℹ️';
      break;
    case 'warn':
      emoji = '⚠️';
      break;
    case 'error':
      emoji = '❌';
      break;
    case 'debug':
      emoji = '🐛';
      break;
    case 'success':
      emoji = '✅';
      break;
    default:
      emoji = '';
  }

  return `${emoji} ${message}`;
});

// Add custom success level
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'blue',
    debug: 'gray'
  }
};

// Create logger
winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: DEBUG ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Export logger functions
export const logInfo = (message) => logger.info(message);
export const logWarning = (message) => logger.warn(message);
export const logError = (message) => logger.error(message);
export const logSuccess = (message) => logger.success(message);
export const logDebug = (message) => DEBUG ? logger.debug(message) : null;

export default logger;
