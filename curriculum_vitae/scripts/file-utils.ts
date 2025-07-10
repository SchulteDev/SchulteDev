// file-utils.ts - Common file operations utilities

import fs from 'fs-extra';
import logger from './logger.js';
import { CvType, getResponseFile } from './config.js';

export const hasValidFile = (filePath: string): boolean => {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
};

export const hasResponseFiles = (cvTypes: CvType[]): boolean => {
  return cvTypes.some(cvType => {
    const responseFile = getResponseFile(cvType);
    return hasValidFile(responseFile);
  });
};

export const cleanupResponseFiles = (cvTypes: CvType[]): void => {
  cvTypes.forEach(cvType => {
    const responseFile = getResponseFile(cvType);
    if (fs.existsSync(responseFile)) {
      fs.unlinkSync(responseFile);
    }
  });
};

export const safeFileCopy = (source: string, destination: string, description: string): boolean => {
  try {
    fs.copySync(source, destination);
    logger.info(`${description}: ${destination}`);
    return true;
  } catch (error: any) {
    logger.warn(`Failed to create ${description.toLowerCase()}, continuing without it`);
    return false;
  }
};

export const safeFileMove = (source: string, destination: string): boolean => {
  try {
    fs.renameSync(source, destination);
    return true;
  } catch (error: any) {
    logger.error(`Failed to move file from ${source} to ${destination}: ${error.message}`);
    return false;
  }
};

export const ensureDir = (dirPath: string): void => {
  fs.ensureDirSync(dirPath);
};

export const safeDelete = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error: any) {
      logger.error(`Failed to delete ${filePath}: ${error.message}`);
    }
  }
};
