/**
 * Logger Factory
 * 
 * This factory creates context-aware logger instances.
 */

import { ILogger, ContextAwareLogger } from '@adapters/ContextAwareLogger';

export interface ILoggerFactory {
  createLogger(context?: string): ILogger;
}

export class LoggerFactory implements ILoggerFactory {
  /**
   * Create a context-aware logger instance
   */
  createLogger(context?: string): ILogger {
    return new ContextAwareLogger(context);
  }
}

