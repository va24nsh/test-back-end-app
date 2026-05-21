/**
 * Error Handler Utility
 * 
 * This utility provides proper error handling for controllers.
 * It distinguishes between operational errors (safe to expose) and unexpected errors (generic response).
 * Uses the isOperational property from GenericError base class for scalability.
 */

import { InternalServerError } from '@errors';
import { ExtendedResponse } from '@types';
import { ILogger } from '@adapters';

/**
 * Handles errors properly by distinguishing between operational errors and unexpected errors
 * @param error - The error to handle
 * @param res - Express response object
 * @param logger - Logger instance
 * @param context - Context information for logging
 */
export function handleControllerError(
  error: Error | unknown,
  res: ExtendedResponse,
  logger: ILogger,
  context: { method: string; [key: string]: unknown }
): void {
  // Check if it's an operational error (safe to expose to clients)
  // All domain errors extend GenericError and have isOperational: true
  const isOperationalError = error && 
    typeof error === 'object' && 
    'isOperational' in error && 
    (error as { isOperational?: boolean }).isOperational === true;
  
  if (isOperationalError && error instanceof Error) {
    // Operational errors (domain errors) are safe to expose to clients
    res.sendError(error);
  } else {
    // Unexpected errors should be logged and return generic message
    logger.error(`❌ Unexpected error in ${context.method}`, { 
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      ...context 
    });
    res.sendError(new InternalServerError('Something went wrong'));
  }
}

