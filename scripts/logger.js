// logger.js - Simple logging with Consola

import consola from 'consola';

// Get DEBUG setting directly from environment to avoid circular dependency
const DEBUG = process.env.DEBUG === 'true';

// Configure consola
const logger = consola.create({
  level: DEBUG ? 5 : 3, // 5 = debug, 3 = info
});

// Export logger functions
export const logInfo = (message) => logger.info(message);
export const logWarning = (message) => logger.warn(message);
export const logError = (message) => logger.error(message);
export const logSuccess = (message) => logger.success(message);
export const logDebug = (message) => DEBUG ? logger.debug(message) : null;

export default logger;
