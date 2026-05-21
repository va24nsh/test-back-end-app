/**
 * Internal Server Error
 * 
 * Error thrown when an unexpected server error occurs.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class InternalServerError extends GenericError {
  constructor(message: string = 'Internal Server Error', details?: unknown) {
    super(message, ErrorCodes.INTERNAL_SERVER_ERROR, 500, false, details);
  }
}

