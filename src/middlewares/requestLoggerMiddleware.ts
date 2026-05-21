import { Request, Response, NextFunction } from 'express';
import { LoggerFactory } from '@adapters';
import { dateUtils } from '@utils/dateUtils';
import { ExtendedRequest } from '@types';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Create context-aware logger
  const loggerFactory = new LoggerFactory();
  const logger = loggerFactory.createLogger('RequestLogger');
  
  // Use the request ID from the request object (set by requestIdMiddleware)
  const requestId = (req as ExtendedRequest).requestId || Math.random().toString(36).substring(7);
  const timestamp = dateUtils.toISOString(new Date());
  
  // Log basic request info
  logger.info(`\n🔍 ===== REQUEST LOG START =====`);
  logger.info(`📅 Timestamp: ${timestamp}`);
  logger.info(`🌐 Method: ${req.method}`);
  logger.info(`🔗 URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  logger.info(`📍 Path: ${req.path}`);
  logger.info(`🌍 IP: ${req.ip || req.socket.remoteAddress}`);
  
  // Log all headers
  logger.info(`📋 HEADERS:`);
  Object.keys(req.headers).forEach(header => {
    const value = req.headers[header];
    // Mask sensitive headers
    if (header.toLowerCase().includes('authorization') || 
        header.toLowerCase().includes('token') || 
        header.toLowerCase().includes('password') ||
        header.toLowerCase().includes('secret') ||
        header.toLowerCase().includes('key')) {
      logger.info(`  ${header}: ***MASKED***`);
    } else {
      logger.info(`  ${header}: ${value}`);
    }
  });
  
  // Log query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    logger.info(`🔍 QUERY PARAMETERS:`);
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      // Mask sensitive query params
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('key')) {
        logger.info(`  ${key}: ***MASKED***`);
      } else {
        logger.info(`  ${key}: ${value}`);
      }
    });
  } else {
    logger.info(`🔍 QUERY PARAMETERS: None`);
  }
  
  // Log request body
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`📦 REQUEST BODY:`);
    const sanitizedBody = sanitizeObject(req.body);
    logger.info(`  ${JSON.stringify(sanitizedBody, null, 2)}`);
  } else {
    logger.info(`📦 REQUEST BODY: Empty`);
  }
  
  // Log URL parameters
  if (req.params && Object.keys(req.params).length > 0) {
    logger.info(`🏷️  URL PARAMETERS:`);
    Object.keys(req.params).forEach(key => {
      logger.info(`  ${key}: ${req.params[key]}`);
    });
  } else {
    logger.info(`🏷️  URL PARAMETERS: None`);
  }
  
  logger.info(`===== REQUEST LOG END =====\n`);
  
  // Track response time
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`✅ Response: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// Helper function to sanitize sensitive data in objects and handle circular references
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: Record<string, unknown> = {};
  const seen = new WeakSet();
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip Express objects and functions
    if (key === 'req' || key === 'res' || key === 'socket' || key === 'parser') continue;
    if (typeof value === 'function') continue;
    
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || 
        lowerKey.includes('token') || 
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('credential')) {
      sanitized[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      // Check for circular references
      if (seen.has(value)) {
        sanitized[key] = '[Circular]';
        continue;
      }
      seen.add(value);
      
      // Try to stringify to check if it's safe
      try {
        JSON.stringify(value);
        sanitized[key] = sanitizeObject(value);
      } catch {
        // Skip non-serializable values
        sanitized[key] = '[Non-serializable]';
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

