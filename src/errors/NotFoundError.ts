/**
 * Not Found Error
 * 
 * Error thrown when a requested resource is not found.
 */
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';

export class NotFoundError extends GenericError {
  constructor(message: string = 'Not Found', details?: unknown) {
    super(message, ErrorCodes.NOT_FOUND, 404, true, details);
  }
}

