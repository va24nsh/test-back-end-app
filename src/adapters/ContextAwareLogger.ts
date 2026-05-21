/**
 * Context-Aware Logger
 * 
 * This logger automatically includes request ID and context information
 * in all log messages using AsyncLocalStorage.
 */

import { requestContext, RequestContext } from '@context';
import winston from 'winston';

export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  verbose(message: string, meta?: any): void;
}

export class ContextAwareLogger implements ILogger {
  private logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const requestId = requestContext.getRequestId();
          const requestIdStr = requestId ? `[${requestId}] ` : '';
          const contextInfo = this.getContextInfo();
          
          // Include context info in meta object instead of appending to message
          const enrichedMeta = {
            ...meta,
            ...(contextInfo && { context: contextInfo })
          };
          
          const contextStr = this.context ? `[${this.context}]` : '';
          
          return `[${timestamp}] ${level.toUpperCase()}: ${requestIdStr}${contextStr} ${message} ${JSON.stringify(enrichedMeta)}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  private getContextInfo(): string {
    const context = requestContext.getContext();
    if (!context) return '';

    const parts: string[] = [];
    if (context.userId) parts.push(`user:${context.userId}`);
    if (context.firebaseUserId) parts.push(`firebase:${context.firebaseUserId}`);

    return parts.length > 0 ? `{${parts.join(', ')}}` : '';
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }
}
