/**
 * Sequelize CLI Configuration Wrapper
 * 
 * This file loads the TypeScript config file using ts-node.
 * The actual source of truth is database.ts in the same directory.
 * 
 * This wrapper is necessary because Sequelize CLI requires a CommonJS file,
 * but we want to maintain a single TypeScript source of truth.
 */

// Register ts-node to handle TypeScript imports
require('ts-node/register');

// Register module aliases for path resolution
require('module-alias/register');

// Load the TypeScript config
// TypeScript compiles to CommonJS, so we need to handle both default export and module.exports
const config = require('./database.ts');

module.exports = config.sequelizeConfig || config.default || config;

