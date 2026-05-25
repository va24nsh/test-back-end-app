import 'module-alias/register';
import express from 'express';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
  responseMiddleware,
  errorHandler,
  notFoundHandler,
  corsMiddleware,
  helmetMiddleware,
  csrfProtection,
  rateLimitMiddleware,
} from '@middlewares';
import { routes } from '@routes';
import { emailVerifyPublicRoutes } from '@routes/email-verify-public.routes';
import { LoggerFactory } from '@adapters';
import { testConnection } from '@config/database';
import { config, validateConfig } from '@config/environment';
import { CronJobScheduler } from '@jobs/CronJobScheduler';
import { HelloWorldJob } from '@jobs/HelloWorldJob';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('Server');

const app = express();

// Validate critical environment configuration at startup and fail fast if misconfigured
validateConfig();

const PORT = config.PORT;

// Response middleware must be mounted early so all downstream middlewares
// (security, rate limit, and error handling) can safely use res.sendError.
app.use(responseMiddleware);

// Test database connection on startup
testConnection().catch((error) => {
  logger.error('Failed to connect to database on startup', { 
    errorMessage: error instanceof Error ? error.message : String(error),
    errorName: error instanceof Error ? error.name : 'Unknown'
  });
});

// Initialize and start cron jobs
const helloWorldJob = new HelloWorldJob({ logger });
const cronScheduler = new CronJobScheduler({ logger, helloWorldJob });
cronScheduler.startAll();

// Security middlewares (order matters!)
app.use(helmetMiddleware); // Security headers
app.use(corsMiddleware); // CORS configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimitMiddleware); // Rate limiting
app.use(csrfProtection); // CSRF protection

// Request ID and logging (must be early in the middleware chain)
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.sendResponse({ status: 'ok' }, 'Server is healthy');
});

// Routes
app.use('/api', routes);

// Public email verification (no /api prefix — accessed directly from email links)
app.use(emailVerifyPublicRoutes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, "0.0.0.0");
}

export default app;

