/**
 * Sequelize Configuration
 * 
 * This module provides configuration for Sequelize database connection.
 * This is the single source of truth for database configuration.
 */

import { Sequelize } from 'sequelize';
import { config } from '@config/environment';
import { LoggerFactory } from '@adapters';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('Database');

// Helper function to get database name for different environments
const getDbName = (environment: string): string => {
  const baseName = config.POSTGRES_DB || 'mutanex';
  
  switch (environment) {
    case 'test':
    case 'testing':
      return `${baseName}_test`;
    case 'local':
      return `${baseName}_local`;
    case 'qa':
      return `${baseName}_qa`;
    case 'production':
      return baseName;
    default:
      return `${baseName}`;
  }
};

// Sequelize configuration object for CLI (migrations/seeders)
export const sequelizeConfig = {
  development: {
    username: config.POSTGRES_USER || 'postgres',
    password: config.POSTGRES_PASSWORD || 'password',
    database: getDbName('development'),
    host: config.POSTGRES_HOST || 'localhost',
    port: config.POSTGRES_PORT || 5440,
    dialect: 'postgres' as const,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
  },
  local: {
    username: config.POSTGRES_USER || 'postgres',
    password: config.POSTGRES_PASSWORD || 'postgres',
    database: getDbName('local'),
    host: config.POSTGRES_HOST || 'localhost',
    port: config.POSTGRES_PORT || 5432,
    dialect: 'postgres' as const,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
  },
  qa: {
    username: config.POSTGRES_USER || 'postgres',
    password: config.POSTGRES_PASSWORD || 'postgres',
    database: getDbName('qa'),
    host: config.POSTGRES_HOST || 'localhost',
    port: config.POSTGRES_PORT || 5432,
    dialect: 'postgres' as const,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
  },
  test: {
    username: config.POSTGRES_USER || 'postgres',
    password: config.POSTGRES_PASSWORD || 'postgres',
    database: getDbName('test'),
    host: config.POSTGRES_HOST || 'localhost',
    port: config.POSTGRES_PORT || 5432,
    dialect: 'postgres' as const,
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
  },
  production: {
    username: config.POSTGRES_USER || '',
    password: config.POSTGRES_PASSWORD || '',
    database: getDbName('production'),
    host: config.POSTGRES_HOST || '',
    port: config.POSTGRES_PORT || 5432,
    dialect: 'postgres' as const,
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  },
};

// Get current environment config
const currentEnv = config.NODE_ENV || 'development';
const envConfig = sequelizeConfig[currentEnv as keyof typeof sequelizeConfig] || sequelizeConfig.development;

// Create Sequelize instance for application code
const sequelizeInstance = new Sequelize(
  envConfig.database,
  envConfig.username,
  envConfig.password,
  {
    host: envConfig.host,
    port: envConfig.port,
    dialect: envConfig.dialect,
    logging: process.env.DB_LOGGING === 'true' ? (msg: string) => logger.debug(msg) : false,
    pool: envConfig.pool,
    dialectOptions: 'dialectOptions' in envConfig ? envConfig.dialectOptions : {},
    define: envConfig.define,
  }
);

// Export as default for models (backward compatibility)
export default sequelizeInstance;
export const sequelize = sequelizeInstance;

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', { 
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};

