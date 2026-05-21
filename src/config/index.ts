// Re-export from environment.ts for backward compatibility
export { config, validateConfig, getDatabaseName } from '@config/environment';
export type { EnvironmentConfig } from '@config/environment';
import { config } from '@config/environment';

// Legacy exports for backward compatibility
export const legacyConfig = {
  env: config.NODE_ENV,
  port: config.PORT,
  database: {
    url: process.env.DATABASE_URL,
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    name: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRY,
  },
  cors: {
    allowedOrigins: config.ALLOWED_ORIGINS
      ? config.ALLOWED_ORIGINS.split(',')
      : [config.CORS_ORIGIN],
  },
  security: {
    csrfEnabled: !config.SKIP_CSRF,
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  },
};

