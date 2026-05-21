import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getEnv = (name: string): string => process.env[name] ?? '';

export interface EnvironmentConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  APP_PUBLIC_URL: string;

  // Storage
  CLOUD_PROVIDER: string;
  STORAGE_BUCKET_NAME: string;
  STORAGE_SIGNING_SECRET: string;
  STORAGE_WORKSPACE_ID: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SESSION_TOKEN?: string;
  GCP_PROJECT_ID: string;
  GCP_CLIENT_EMAIL: string;
  GCP_PRIVATE_KEY: string;
  
  // PostgreSQL
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  
  // Firebase
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  
  // Logging
  LOG_LEVEL: string;
  
  // CORS
  CORS_ORIGIN: string;
  ALLOWED_ORIGINS?: string;
  
  // CSRF
  SKIP_CSRF: boolean;
  
  // Encryption
  ENCRYPTION_KEY: string;

  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: string;
  RECAPTCHA_SCORE_THRESHOLD: number;

  // Email Provider (Brevo)
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  BREVO_SENDER_NAME: string;

  // Firebase email link allowlist
  EMAIL_LOGIN_LINK_URL: string;
  EMAIL_MAGIC_LINK_URL: string;

  // OTP Provider
  OTP_PROVIDER: string;
  MSG91_AUTH_KEY: string;
  MSG91_WIDGET_ID: string;
  MSG91_WIDGET_SEND_URL: string;
  MSG91_WIDGET_VERIFY_URL: string;
  MSG91_WIDGET_RETRY_URL?: string;
}

export const config: EnvironmentConfig = {
  // Server
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: Number.parseInt(getEnv('PORT'), 10),
  APP_PUBLIC_URL: getEnv('APP_PUBLIC_URL'),

  // Storage
  CLOUD_PROVIDER: getEnv('CLOUD_PROVIDER'),
  STORAGE_BUCKET_NAME: getEnv('STORAGE_BUCKET_NAME'),
  STORAGE_SIGNING_SECRET: getEnv('STORAGE_SIGNING_SECRET'),
  STORAGE_WORKSPACE_ID: getEnv('STORAGE_WORKSPACE_ID'),
  AWS_REGION: getEnv('AWS_REGION'),
  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  GCP_PROJECT_ID: getEnv('GCP_PROJECT_ID'),
  GCP_CLIENT_EMAIL: getEnv('GCP_CLIENT_EMAIL'),
  GCP_PRIVATE_KEY: getEnv('GCP_PRIVATE_KEY'),
  
  // PostgreSQL
  POSTGRES_HOST: getEnv('POSTGRES_HOST'),
  POSTGRES_PORT: Number.parseInt(getEnv('POSTGRES_PORT'), 10),
  POSTGRES_DB: getEnv('POSTGRES_DB'),
  POSTGRES_USER: getEnv('POSTGRES_USER'),
  POSTGRES_PASSWORD: getEnv('POSTGRES_PASSWORD'),
  
  // Firebase
  FIREBASE_PROJECT_ID: getEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_PRIVATE_KEY: getEnv('FIREBASE_PRIVATE_KEY'),
  FIREBASE_CLIENT_EMAIL: getEnv('FIREBASE_CLIENT_EMAIL'),
  
  // JWT
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRY: getEnv('JWT_EXPIRY'),
  JWT_REFRESH_EXPIRY: getEnv('JWT_REFRESH_EXPIRY'),
  
  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL'),
  
  // CORS
  CORS_ORIGIN: getEnv('CORS_ORIGIN'),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  
  // CSRF
  SKIP_CSRF: getEnv('SKIP_CSRF') === 'true',
  
  // Encryption
  ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY'),

  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: getEnv('RECAPTCHA_SECRET_KEY'),
  RECAPTCHA_SCORE_THRESHOLD: Number.parseFloat(getEnv('RECAPTCHA_SCORE_THRESHOLD')),

  // Email Provider (Brevo)
  BREVO_API_KEY: getEnv('BREVO_API_KEY'),
  BREVO_SENDER_EMAIL: getEnv('BREVO_SENDER_EMAIL'),
  BREVO_SENDER_NAME: getEnv('BREVO_SENDER_NAME'),

  // Firebase email link allowlist
  EMAIL_LOGIN_LINK_URL: getEnv('EMAIL_LOGIN_LINK_URL'),
  EMAIL_MAGIC_LINK_URL: getEnv('EMAIL_MAGIC_LINK_URL'),

  // OTP Provider
  OTP_PROVIDER: getEnv('OTP_PROVIDER'),
  MSG91_AUTH_KEY: getEnv('MSG91_AUTH_KEY'),
  MSG91_WIDGET_ID: getEnv('MSG91_WIDGET_ID'),
  MSG91_WIDGET_SEND_URL: getEnv('MSG91_WIDGET_SEND_URL'),
  MSG91_WIDGET_VERIFY_URL: getEnv('MSG91_WIDGET_VERIFY_URL'),
  MSG91_WIDGET_RETRY_URL: process.env.MSG91_WIDGET_RETRY_URL,
};

// Validation function
export function validateConfig(): void {
  const requiredFields: (keyof EnvironmentConfig)[] = [
    // Server
    'NODE_ENV',
    'LOG_LEVEL',
    'APP_PUBLIC_URL',

    // Database (required for all environments)
    'POSTGRES_HOST',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    
    // JWT & Encryption (required for all environments)
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    
    // Firebase (required for auth)
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    
    // reCAPTCHA (required for public APIs)
    'RECAPTCHA_SECRET_KEY',

    // Public API controls
    'OTP_PROVIDER',
    'MSG91_AUTH_KEY',
    
    // Email Provider (required for sending verification emails)
    'BREVO_API_KEY',
    'BREVO_SENDER_EMAIL',
    'BREVO_SENDER_NAME',

    // Firebase email links
    'EMAIL_LOGIN_LINK_URL',
    'EMAIL_MAGIC_LINK_URL',

    // Storage baseline
    'CLOUD_PROVIDER',
    'STORAGE_BUCKET_NAME',
    'STORAGE_SIGNING_SECRET',
    'STORAGE_WORKSPACE_ID',

    // CORS baseline
    'CORS_ORIGIN',
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = config[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  }

  if (Number.isNaN(config.PORT)) {
    missingFields.push('PORT');
  }

  if (Number.isNaN(config.POSTGRES_PORT)) {
    missingFields.push('POSTGRES_PORT');
  }

  if (
    Number.isNaN(config.RECAPTCHA_SCORE_THRESHOLD) ||
    config.RECAPTCHA_SCORE_THRESHOLD < 0 ||
    config.RECAPTCHA_SCORE_THRESHOLD > 1
  ) {
    missingFields.push('RECAPTCHA_SCORE_THRESHOLD');
  }

  if (config.CLOUD_PROVIDER === 'aws') {
    if (!config.AWS_REGION.trim()) missingFields.push('AWS_REGION');
    if (!config.AWS_ACCESS_KEY_ID.trim()) missingFields.push('AWS_ACCESS_KEY_ID');
    if (!config.AWS_SECRET_ACCESS_KEY.trim()) missingFields.push('AWS_SECRET_ACCESS_KEY');
  }

  if (config.CLOUD_PROVIDER === 'gcp') {
    if (!config.GCP_PROJECT_ID.trim()) missingFields.push('GCP_PROJECT_ID');
    if (!config.GCP_CLIENT_EMAIL.trim()) missingFields.push('GCP_CLIENT_EMAIL');
    if (!config.GCP_PRIVATE_KEY.trim()) missingFields.push('GCP_PRIVATE_KEY');
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing or empty required environment variables: ${missingFields.join(', ')}. ` +
      `Please see .env.example for configuration guide.`
    );
  }
}

// Helper function to get database name for different environments
export function getDatabaseName(environment?: string): string {
  const env = environment || config.NODE_ENV;
  const baseName = config.POSTGRES_DB;
  
  switch (env) {
    case 'test':
      return `${baseName}_test`;
    case 'production':
      return baseName;
    default:
      return baseName;
  }
}

export default config;

