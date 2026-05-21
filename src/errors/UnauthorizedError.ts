/**
 * Unauthorized Error
 * 
 * Error thrown when authentication is required or has failed.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class UnauthorizedError extends GenericError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, ErrorCodes.UNAUTHORIZED, 401, true, details);
  }
}

