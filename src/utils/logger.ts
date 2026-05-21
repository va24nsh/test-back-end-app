/**
 * Legacy logger - use LoggerFactory instead
 * This is kept for backward compatibility
 */
import { LoggerFactory } from '@adapters';

const loggerFactory = new LoggerFactory();
export const logger = loggerFactory.createLogger('LegacyLogger');
