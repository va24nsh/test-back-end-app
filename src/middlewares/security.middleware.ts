import { NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@config';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { UnauthorizedError, TooManyRequestsError } from '@errors';

const safeSendError = (
  req: ExtendedRequest,
  res: ExtendedResponse,
  error: Error | string,
  statusCode?: number,
  errorCode?: string,
  details?: unknown
) => {
  if (typeof res.sendError === 'function') {
    return res.sendError(error, statusCode, errorCode, details);
  }

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorName = typeof error === 'string' ? 'Error' : error.name;

  const resolvedStatus =
    statusCode ||
    (typeof error === 'object' && error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500);

  const resolvedCode =
    errorCode ||
    (typeof error === 'object' && error && 'code' in error
      ? (error as { code: string }).code
      : 'INTERNAL_SERVER_ERROR');

  const resolvedDetails =
    details ||
    (typeof error === 'object' && error && 'details' in error
      ? (error as { details?: unknown }).details
      : undefined);

  return res.status(resolvedStatus).json({
    isSuccess: false,
    message: errorMessage,
    error: {
      name: errorName,
      code: resolvedCode,
      details: resolvedDetails,
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId || '',
    elapsedTime: `${Date.now() - (req.startTime || Date.now())}ms`,
  });
};

/**
 * CORS Configuration
 * Configure allowed origins, methods, and headers
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = config.ALLOWED_ORIGINS 
      ? config.ALLOWED_ORIGINS.split(',')
      : [config.CORS_ORIGIN];

    if (allowedOrigins.includes(origin) || config.NODE_ENV === 'development' || config.NODE_ENV === 'local') {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
});

/**
 * Helmet Configuration
 * Security headers middleware
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // May need to be false for some APIs
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CSRF Protection Middleware
 * Note: For REST APIs, CSRF is typically handled via tokens (JWT)
 * This middleware provides additional protection for state-changing operations
 */
export const csrfProtection = (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
) => {
  // Skip CSRF if disabled in config
  if (config.SKIP_CSRF) {
    return next();
  }

  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints (auth routes, health check)
  const publicRoutes = ['/api/auth', '/health'];
  if (publicRoutes.some(route => req.path?.startsWith(route) || req.url?.startsWith(route))) {
    return next();
  }

  // For REST APIs, CSRF protection is typically handled via:
  // 1. JWT tokens in Authorization header (primary method)
  // 2. SameSite cookies
  // 3. Custom CSRF tokens for web forms

  // Verify JWT token is present for protected routes
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return safeSendError(
      req,
      res,
      new UnauthorizedError('Unauthorized - Authentication required')
    );
  }

  // If you need explicit CSRF token validation for web forms, implement:
  /*
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || token !== sessionToken) {
    return res.sendError(
      new ForbiddenError('Invalid CSRF token')
    );
  }
  */

  next();
};

/**
 * Rate Limiting Middleware
 * Protects against brute force and DDoS attacks
 */
const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: ExtendedRequest, res: ExtendedResponse) => {
      safeSendError(
        req,
        res,
        new TooManyRequestsError(message || 'Too many requests from this IP, please try again later.')
      );
    },
  });
};

// General API rate limiter
export const rateLimitMiddleware = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  config.NODE_ENV === 'production' ? 100 : 1000, // 100 requests per 15min in prod, 1000 in dev
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints
export const authRateLimitMiddleware = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  500, // 5 requests per 15 minutes for auth endpoints
  'Too many authentication attempts, please try again later.'
);

